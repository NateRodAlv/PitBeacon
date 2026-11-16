import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { sdk } from "./sdkShim.js";
import { setRobotParts } from "../data/robotParts.js";
import { NOTES_EVENT, NOTES_KEY, TASK_STATUSES, addItem, loadNotes, summarizeParts, updateItem } from "../data/pitNotes.js";
import "./viewer.css";

// Since r155 lights are physically based; legacy intensities need x PI to look the same.
const LIGHT_SCALE = Math.PI;


  // ───────── Helpers ─────────
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const DEFAULT_VIEWER_SETTINGS = {
    displayStyle: "solid",
    lightingPreset: "studio",
    lightSky: "#dceaff",
    lightGround: "#3a4658",
    lightKey: "#ffffff",
    lightFill: "#9fc0ff",
    modelDetail: "balanced",
    renderScale: 0.75,
    antialias: false,
    showGrid: true,
    autoRotate: false,
    showAxes: false,
    background: "#101722",
    controlsMode: "auto-hide",
    autoHideSeconds: 4,
  };
  const LIGHTING_PRESETS = {
    studio: { sky: "#dceaff", ground: "#3a4658", key: "#ffffff", fill: "#9fc0ff", hemi: 1, keyPower: 1.15, fillPower: 0.45 },
    warm: { sky: "#ffe2bd", ground: "#62402d", key: "#ffd09a", fill: "#ff8b61", hemi: 1, keyPower: 1.15, fillPower: 0.45 },
    cool: { sky: "#c9e8ff", ground: "#263c69", key: "#d4edff", fill: "#628dff", hemi: 1, keyPower: 1.1, fillPower: 0.6 },
    dramatic: { sky: "#a8b8df", ground: "#171d38", key: "#ffffff", fill: "#6851c8", hemi: 0.65, keyPower: 1.5, fillPower: 0.35 },
    sunset: { sky: "#ffc0a5", ground: "#402538", key: "#ffae78", fill: "#ec5d8f", hemi: 0.9, keyPower: 1.2, fillPower: 0.5 },
    custom: { sky: "#dceaff", ground: "#3a4658", key: "#ffffff", fill: "#9fc0ff", hemi: 1, keyPower: 1.15, fillPower: 0.45 },
  };
  let modelBottom = "bottom";
  function normalizeModelBottom(value) {
    return ["bottom", "top", "front", "back", "left", "right"].includes(String(value).toLowerCase())
      ? String(value).toLowerCase()
      : "bottom";
  }
  function normalizeViewerSettings(value) {
    const settings = value && typeof value === "object" ? value : {};
    return {
      displayStyle: ["solid", "edges", "wireframe", "xray", "toon", "blueprint", "clay"].includes(settings.displayStyle) ? settings.displayStyle : DEFAULT_VIEWER_SETTINGS.displayStyle,
      lightingPreset: Object.prototype.hasOwnProperty.call(LIGHTING_PRESETS, settings.lightingPreset) ? settings.lightingPreset : DEFAULT_VIEWER_SETTINGS.lightingPreset,
      lightSky: /^#[0-9a-f]{6}$/i.test(settings.lightSky || "") ? settings.lightSky : DEFAULT_VIEWER_SETTINGS.lightSky,
      lightGround: /^#[0-9a-f]{6}$/i.test(settings.lightGround || "") ? settings.lightGround : DEFAULT_VIEWER_SETTINGS.lightGround,
      lightKey: /^#[0-9a-f]{6}$/i.test(settings.lightKey || "") ? settings.lightKey : DEFAULT_VIEWER_SETTINGS.lightKey,
      lightFill: /^#[0-9a-f]{6}$/i.test(settings.lightFill || "") ? settings.lightFill : DEFAULT_VIEWER_SETTINGS.lightFill,
      modelDetail: ["full", "balanced", "light"].includes(settings.modelDetail) ? settings.modelDetail : DEFAULT_VIEWER_SETTINGS.modelDetail,
      renderScale: clamp(Number(settings.renderScale) || DEFAULT_VIEWER_SETTINGS.renderScale, 0.5, 1.5),
      antialias: typeof settings.antialias === "boolean" ? settings.antialias : DEFAULT_VIEWER_SETTINGS.antialias,
      showGrid: typeof settings.showGrid === "boolean" ? settings.showGrid : DEFAULT_VIEWER_SETTINGS.showGrid,
      autoRotate: typeof settings.autoRotate === "boolean" ? settings.autoRotate : DEFAULT_VIEWER_SETTINGS.autoRotate,
      showAxes: typeof settings.showAxes === "boolean" ? settings.showAxes : DEFAULT_VIEWER_SETTINGS.showAxes,
      background: /^#[0-9a-f]{6}$/i.test(settings.background || "") ? settings.background : DEFAULT_VIEWER_SETTINGS.background,
      controlsMode: ["auto-hide", "always show", "hidden"].includes(settings.controlsMode) ? settings.controlsMode : DEFAULT_VIEWER_SETTINGS.controlsMode,
      autoHideSeconds: clamp(Number(settings.autoHideSeconds) || DEFAULT_VIEWER_SETTINGS.autoHideSeconds, 1, 30),
    };
  }
  function applyModelBottom(value) {
    modelBottom = normalizeModelBottom(value);
    if (!robotRoot || !THREE) return;
    const down = new THREE.Vector3(0, -1, 0);
    const side = {
      bottom: new THREE.Vector3(0, -1, 0),
      top: new THREE.Vector3(0, 1, 0),
      front: new THREE.Vector3(0, 0, 1),
      back: new THREE.Vector3(0, 0, -1),
      left: new THREE.Vector3(-1, 0, 0),
      right: new THREE.Vector3(1, 0, 0),
    }[modelBottom];
    robotRoot.quaternion.setFromUnitVectors(side, down);
    robotRoot.position.set(0, 0, 0);
    robotRoot.updateMatrixWorld(true);
    modelBox.setFromObject(robotRoot);
    if (autoFit) fitModel();
    else {
      ensureGrid();
      updateAxesHelper();
      requestRender();
    }
  }
  function readLegacySetting(name, fallback) {
    return typeof sdk.getSetting === "function" ? sdk.getSetting(name, fallback) : fallback;
  }
  let viewerSettings = normalizeViewerSettings({
    displayStyle: readLegacySetting("viewerDisplayStyle", DEFAULT_VIEWER_SETTINGS.displayStyle),
    modelDetail: readLegacySetting("viewerModelDetail", DEFAULT_VIEWER_SETTINGS.modelDetail),
    renderScale: readLegacySetting("viewerRenderScale", DEFAULT_VIEWER_SETTINGS.renderScale),
    antialias: readLegacySetting("viewerAntialias", DEFAULT_VIEWER_SETTINGS.antialias),
    showGrid: readLegacySetting("viewerShowGrid", DEFAULT_VIEWER_SETTINGS.showGrid),
    autoRotate: readLegacySetting("viewerAutoRotate", DEFAULT_VIEWER_SETTINGS.autoRotate),
    showAxes: readLegacySetting("viewerShowAxes", DEFAULT_VIEWER_SETTINGS.showAxes),
    background: readLegacySetting("viewerBackground", DEFAULT_VIEWER_SETTINGS.background),
    controlsMode: readLegacySetting("viewerControlsMode", DEFAULT_VIEWER_SETTINGS.controlsMode),
    autoHideSeconds: readLegacySetting("viewerAutoHideSeconds", DEFAULT_VIEWER_SETTINGS.autoHideSeconds),
  });
  const root = $("rbvRoot"), stage = $("rbvStage"), emptyEl = $("rbvEmpty"), statusEl = $("rbvStatus");
  const drawer = $("rbvSetup"), infoEl = $("rbvModelInfo"), marqueeEl = $("rbvMarquee");
  const settingsPanel = $("rbvSettingsPanel");
  root.style.background = viewerSettings.background;
  const SETTINGS_STORAGE_KEY = "robot-viewer-settings-v1";

  function syncSettingsForm() {
    $("rbvSettingDisplayStyle").value = viewerSettings.displayStyle;
    $("rbvSettingLightingPreset").value = viewerSettings.lightingPreset;
    $("rbvSettingLightSky").value = viewerSettings.lightSky;
    $("rbvSettingLightGround").value = viewerSettings.lightGround;
    $("rbvSettingLightKey").value = viewerSettings.lightKey;
    $("rbvSettingLightFill").value = viewerSettings.lightFill;
    $("rbvSettingModelDetail").value = viewerSettings.modelDetail;
    $("rbvSettingRenderScale").value = String(viewerSettings.renderScale);
    $("rbvSettingAntialias").checked = viewerSettings.antialias;
    $("rbvSettingShowGrid").checked = viewerSettings.showGrid;
    $("rbvSettingAutoRotate").checked = viewerSettings.autoRotate;
    $("rbvSettingShowAxes").checked = viewerSettings.showAxes;
    $("rbvSettingBackground").value = viewerSettings.background;
    $("rbvSettingControlsMode").value = viewerSettings.controlsMode;
    $("rbvSettingAutoHideSeconds").value = String(viewerSettings.autoHideSeconds);
    const modelBottomSelect = $("rbvModelBottom");
    if (modelBottomSelect) modelBottomSelect.value = normalizeModelBottom(modelBottom);
  }
  async function loadViewerSettings() {
    try {
      if (sdk.storage && typeof sdk.storage.get === "function") {
        const saved = await sdk.storage.get(SETTINGS_STORAGE_KEY);
        if (saved) viewerSettings = normalizeViewerSettings({ ...viewerSettings, ...saved });
      }
    } catch (err) {
      fail("Could not load saved viewer settings: " + (err && err.message ? err.message : "storage is unavailable"));
    }
    syncSettingsForm();
  }
  let settingsSaveTimer = 0;
  function saveViewerSettings() {
    clearTimeout(settingsSaveTimer);
    settingsSaveTimer = setTimeout(async () => {
      if (!sdk.storage || typeof sdk.storage.set !== "function") {
        fail("Viewer settings changed, but persistent storage is unavailable.");
        return;
      }
      try {
        await sdk.storage.set(SETTINGS_STORAGE_KEY, viewerSettings);
      } catch (err) {
        fail("Could not save viewer settings: " + (err && err.message ? err.message : "storage is unavailable"));
      }
    }, 200);
  }
  function applyViewerSettings(previous) {
    root.style.background = viewerSettings.background;
    if (scene) scene.background = new THREE.Color(viewerSettings.background);
    applyLightingSettings();
    gridOn = viewerSettings.showGrid;
    if (scene && modelBox) ensureGrid();
    if (scene && modelBox) updateAxesHelper();
    if (viewerSettings.displayStyle !== previous.displayStyle && currentMeshes.length) applyStyle(currentMeshes);
    if (renderer && viewerSettings.renderScale !== previous.renderScale) resize();
    if (viewerSettings.controlsMode !== previous.controlsMode || viewerSettings.autoHideSeconds !== previous.autoHideSeconds) {
      revealed = viewerSettings.controlsMode !== "hidden";
      applyUiState();
    }
    if (viewerSettings.modelDetail !== previous.modelDetail && robotRoot) {
      setStatus("Model detail applies the next time you load the model.");
    }
    if (viewerSettings.antialias !== previous.antialias && renderer) {
      setStatus("Antialiasing changes after you reload the card.");
    }
    lastAutoRotateFrame = 0;
    if (viewerSettings.autoRotate) requestRender();
    else if (renderer) requestRender();
  }
  function bindViewerSetting(id, key, type) {
    $(id).addEventListener("change", (event) => {
      const previous = viewerSettings;
      const input = event.currentTarget;
      const value = type === "checkbox" ? input.checked : type === "number" ? Number(input.value) : input.value;
      const changes = { [key]: value };
      if (["lightSky", "lightGround", "lightKey", "lightFill"].includes(key)) changes.lightingPreset = "custom";
      viewerSettings = normalizeViewerSettings({ ...viewerSettings, ...changes });
      syncSettingsForm();
      applyViewerSettings(previous);
      saveViewerSettings();
    });
  }
  function applyLightingPreset(name) {
    if (name === "custom") {
      const previous = viewerSettings;
      viewerSettings = normalizeViewerSettings({ ...viewerSettings, lightingPreset: "custom" });
      syncSettingsForm();
      applyViewerSettings(previous);
      saveViewerSettings();
      return;
    }
    const preset = LIGHTING_PRESETS[name] || LIGHTING_PRESETS.studio;
    const previous = viewerSettings;
    viewerSettings = normalizeViewerSettings({
      ...viewerSettings,
      lightingPreset: name,
      lightSky: preset.sky,
      lightGround: preset.ground,
      lightKey: preset.key,
      lightFill: preset.fill,
    });
    syncSettingsForm();
    applyViewerSettings(previous);
    saveViewerSettings();
  }

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    if (props) for (const k in props) {
      if (k === "class") n.className = props[k];
      else if (k === "text") n.textContent = props[k];
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), props[k]);
      else n.setAttribute(k, props[k]);
    }
    kids.forEach((c) => c != null && n.append(c));
    return n;
  }

  let statusTimer = 0;
  function setStatus(text, opts) {
    opts = opts || {};
    clearTimeout(statusTimer);
    statusEl.textContent = text || "";
    statusEl.classList.toggle("on", !!text);
    statusEl.classList.toggle("err", !!opts.error);
    if (text && !opts.sticky) statusTimer = setTimeout(() => statusEl.classList.remove("on"), opts.error ? 6000 : 2500);
  }
  function fail(msg) {
    setStatus(msg, { error: true });
    try { sdk.notify && sdk.notify("Robot Viewer: " + msg, "error"); } catch (_) {}
  }

  // ───────── Controls visibility (auto-hide / always show / hidden) ─────────
  let revealed = true, uiTimer = 0, drawerOpen = false, settingsOpen = false, lastReveal = 0;
  function applyUiState() {
    clearTimeout(uiTimer);
    const mode = String(viewerSettings.controlsMode);
    const mustShow = !robotRoot || drawerOpen || settingsOpen || mode === "always show";
    if (mustShow) { root.classList.remove("rbv-ui-hidden"); return; }
    if (revealed) {
      root.classList.remove("rbv-ui-hidden");
      uiTimer = setTimeout(() => { revealed = false; applyUiState(); }, clamp(Number(viewerSettings.autoHideSeconds) || 4, 1, 30) * 1000);
    } else root.classList.add("rbv-ui-hidden");
  }
  function reveal() { revealed = true; lastReveal = Date.now(); applyUiState(); }
  if (String(viewerSettings.controlsMode) === "hidden") revealed = false;
  // auto-hide mode: any touch/mouse activity brings the controls back. hidden mode: double-click/double-tap only.
  ["pointerdown", "pointermove"].forEach((t) => root.addEventListener(t, () => {
    if (String(viewerSettings.controlsMode) === "auto-hide" && Date.now() - lastReveal > 300) reveal();
  }, { passive: true }));
  root.addEventListener("dblclick", () => { if (String(viewerSettings.controlsMode) === "hidden") reveal(); });

  // ───────── Local model storage (IndexedDB) ─────────
  const DB_NAME = "pitbeacon-robot-viewer-v2";
  let dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore("models"); req.result.createObjectStore("libs"); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    dbPromise.catch(() => { dbPromise = null; });
    return dbPromise;
  }
  async function idb(store, mode, fn) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const r = fn(tx.objectStore(store));
      tx.oncomplete = () => resolve(r && r.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
  const dbGet = (store, key) => idb(store, "readonly", (s) => s.get(key));
  const dbPut = (store, key, val) => idb(store, "readwrite", (s) => s.put(val, key));

  // Three.js is bundled, so the viewer needs no network after the first load.
  const ensureThree = async () => {};

  // ───────── Scene ─────────
  let renderer = null, scene = null, camera = null, robotRoot = null, gridHelper = null, axesHelper = null;
  let hemisphereLight = null, keyLight = null, fillLight = null;
  let modelBox = null, target = null, raf = 0, autoFit = true;
  let yaw = 0.7, pitch = 0.45, dist = 5, minDist = 0.05, maxDist = 100;
  let edgeObjects = [], edgeToken = 0, edgeMat = null;
  let currentMeshes = [];
  const styledMaterialCache = new Map();
  let modelAnimations = [], animationMixer = null, animationAction = null;
  let activeAnimationIndex = 0, modelAnimationPlaying = false, modelAnimationLoop = false, lastAnimationFrame = 0;
  let gridOn = !!viewerSettings.showGrid, gridFor = null, marqueeEnabled = false, lastAutoRotateFrame = 0;

  function applyLightingSettings() {
    const preset = LIGHTING_PRESETS[viewerSettings.lightingPreset] || LIGHTING_PRESETS.studio;
    if (hemisphereLight) {
      hemisphereLight.color.set(viewerSettings.lightSky);
      hemisphereLight.groundColor.set(viewerSettings.lightGround);
      hemisphereLight.intensity = preset.hemi * LIGHT_SCALE;
    }
    if (keyLight) {
      keyLight.color.set(viewerSettings.lightKey);
      keyLight.intensity = preset.keyPower * LIGHT_SCALE;
    }
    if (fillLight) {
      fillLight.color.set(viewerSettings.lightFill);
      fillLight.intensity = preset.fillPower * LIGHT_SCALE;
    }
    requestRender();
  }

  function setupScene() {
    if (renderer) return;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(viewerSettings.background);
    camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000);
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !!viewerSettings.antialias, alpha: false, powerPreference: "high-performance" });
    } catch (e) { throw new Error("WebGL is not available on this device.", { cause: e }); }
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    stage.insertBefore(canvas, stage.firstChild);
    cursorRaycaster = new THREE.Raycaster();
    cursorPlane = new THREE.Plane();
    cursorIntersection = new THREE.Vector3();

    // Lights ride with the camera so shading stays consistent while orbiting. No shadows (cheap).
    hemisphereLight = new THREE.HemisphereLight(0xdceaff, 0x3a4658, LIGHT_SCALE);
    keyLight = new THREE.DirectionalLight(0xffffff, 1.15 * LIGHT_SCALE); keyLight.position.set(3, 4, 5);
    fillLight = new THREE.DirectionalLight(0x9fc0ff, 0.45 * LIGHT_SCALE); fillLight.position.set(-4, 1, 2);
    scene.add(hemisphereLight);
    camera.add(keyLight); camera.add(fillLight); scene.add(camera);
    applyLightingSettings();

    target = new THREE.Vector3();
    attachControls(canvas);
    canvas.addEventListener("webglcontextlost", (e) => e.preventDefault());
    canvas.addEventListener("webglcontextrestored", requestRender);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener("resize", resize);
    resize();
  }

  function resize() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    if (w < 2 || h < 2) return;
    const pr = clamp(window.devicePixelRatio || 1, 1, 1.5) * clamp(Number(viewerSettings.renderScale) || 0.75, 0.5, 1.5);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false); // CSS keeps the canvas at 100% of the card; aspect below keeps it undistorted
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (autoFit && robotRoot) fitModel(); else renderNow();
  }

  const EASING_TYPES = ["linear", "ease-in", "ease-out", "ease-in-out"];
  const easeProgress = (value, easing) => {
    if (easing === "ease-in") return value * value;
    if (easing === "ease-out") return 1 - (1 - value) * (1 - value);
    if (easing === "ease-in-out") return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
    return value;
  };
  function cameraPose() {
    updateCamera();
    return { position: camera.position.toArray(), target: target.toArray() };
  }
  function applyCameraPose(pose) {
    if (!camera || !target || !pose || !Array.isArray(pose.position) || !Array.isArray(pose.target)) return;
    target.fromArray(pose.target);
    const offset = new THREE.Vector3().fromArray(pose.position).sub(target);
    const length = Math.max(offset.length(), 0.001);
    dist = clamp(length, minDist, maxDist);
    yaw = Math.atan2(offset.x, offset.z);
    pitch = Math.asin(clamp(offset.y / length, -1, 1));
    autoFit = false;
  }
  function orbitFromCameraPose(pose) {
    if (!pose) return null;
    const offset = new THREE.Vector3().fromArray(pose.position).sub(new THREE.Vector3().fromArray(pose.target));
    const length = Math.max(offset.length(), 0.001);
    return {
      target: pose.target.slice(0, 3),
      zoom: length,
      yaw: Math.atan2(offset.x, offset.z),
      pitch: Math.asin(clamp(offset.y / length, -1, 1)),
    };
  }
  function cameraPoseFromOrbit(orbit) {
    const pitch = clamp(orbit.pitch, -1.5, 1.5), cp = Math.cos(pitch);
    const dir = [cp * Math.sin(orbit.yaw), Math.sin(pitch), cp * Math.cos(orbit.yaw)];
    return {
      target: orbit.target.slice(0, 3),
      position: orbit.target.map((value, i) => value + dir[i] * clamp(orbit.zoom, minDist, maxDist)),
    };
  }
  function timelineCameraPoseAt(time) {
    const frames = timeline.keyframes;
    if (!frames.length) return cameraPose();
    let before = frames[0], after = frames[0];
    if (time >= frames[frames.length - 1].time) before = after = frames[frames.length - 1];
    else if (time > frames[0].time) {
      for (let i = 0; i < frames.length - 1; i++) {
        if (time <= frames[i + 1].time) { before = frames[i]; after = frames[i + 1]; break; }
      }
    }
    const span = after.time - before.time;
    const amount = before === after || span <= 0 ? 0 : easeProgress(clamp((time - before.time) / span, 0, 1), before.easing);
    const a = before.camera || after.camera, b = after.camera || before.camera;
    if (!a || !b) return cameraPose();
    return {
      position: a.position.map((value, i) => value + (b.position[i] - value) * amount),
      target: a.target.map((value, i) => value + (b.target[i] - value) * amount),
    };
  }
  function setTimelineCameraPoseAt(time, pose) {
    const frame = ensureKeyframe(time, false);
    frame.camera = pose;
    if (timelineCameraEnabled) applyCameraPose(pose);
    return frame;
  }
  function syncCameraEditor() {
    const editor = $("rbvCameraEditor");
    if (!editor || !camera || !target) return;
    const orbit = orbitFromCameraPose(timelineCameraPoseAt(timelineTime));
    if (!orbit) return;
    const values = {
      rbvCameraX: orbit.target[0],
      rbvCameraY: orbit.target[1],
      rbvCameraZ: orbit.target[2],
      rbvCameraZoom: orbit.zoom,
      rbvCameraYaw: THREE.MathUtils.radToDeg(orbit.yaw),
      rbvCameraPitch: THREE.MathUtils.radToDeg(orbit.pitch),
    };
    Object.entries(values).forEach(([id, value]) => {
      const input = $(id);
      if (document.activeElement !== input) input.value = String(Number(value));
    });
    editor.disabled = !robotRoot || !drawerOpen || !timeline.keyframes.length || timelinePlaying;
  }
  function frameAt(time) {
    return timeline.keyframes.find((frame) => Math.abs(frame.time - time) < 0.025);
  }
  function ensureKeyframe(time, captureCamera) {
    time = clamp(Number(time) || 0, 0, timeline.duration);
    let frame = frameAt(time);
    if (!frame) {
      frame = {
        id: "key-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
        time,
        easing: "linear",
        values: Object.fromEntries(mechanisms.map((mech) => [mech.id, Number(mech.value) || 0])),
        camera: cameraPose(),
      };
      timeline.keyframes.push(frame);
      timeline.keyframes.sort((a, b) => a.time - b.time);
    } else {
      mechanisms.forEach((mech) => {
        if (frame.values[mech.id] === undefined) frame.values[mech.id] = Number(mech.value) || 0;
      });
      if (captureCamera) frame.camera = cameraPose();
    }
    return frame;
  }
  function renderTimelineTracks() {
    const tracks = $("rbvTimelineTracks");
    if (!tracks) return;
    tracks.replaceChildren();
    const ruler = el("div", { class: "rbv-track-ruler" });
    ruler.append(el("div", { class: "rbv-track-label", text: "Time" }));
    const rulerLane = el("div", { class: "rbv-track-lane", "data-track-lane": "ruler" });
    for (let tick = 0; tick <= 4; tick++) {
      const time = timeline.duration * tick / 4;
      rulerLane.append(el("span", { class: "rbv-track-tick", text: time.toFixed(time < 10 ? 1 : 0), style: "left:" + (tick * 25) + "%" }));
    }
    rulerLane.append(el("div", { class: "rbv-track-playhead", style: "left:" + (timelineTime / timeline.duration * 100) + "%" }));
    ruler.append(rulerLane);
    tracks.append(ruler);
    const lanes = [{ id: "camera", label: "Camera", camera: true }]
      .concat(mechanisms.map((mech) => ({ id: mech.id, label: mech.name, camera: false })));
    if (!timeline.keyframes.length) {
      tracks.append(el("div", { class: "rbv-track-empty", text: "Add a keyframe to start building tracks." }));
      return;
    }
    lanes.forEach((lane) => {
      const row = el("div", { class: "rbv-track-row" });
      row.append(el("div", { class: "rbv-track-label", text: lane.label, title: lane.label }));
      const track = el("div", { class: "rbv-track-lane", "data-track-lane": lane.id });
      timeline.keyframes.forEach((frame) => {
        if (lane.camera ? !frame.camera : !Object.prototype.hasOwnProperty.call(frame.values || {}, lane.id)) return;
        const marker = el("button", {
          type: "button",
          class: "rbv-track-marker" + (lane.camera ? " camera" : "") + (Math.abs(frame.time - timelineTime) < 0.05 ? " active" : ""),
          "data-frame-id": frame.id,
          "aria-label": (lane.camera ? "Camera" : lane.label) + " keyframe at " + frame.time.toFixed(2) + " seconds",
          title: frame.time.toFixed(2) + " s · " + (lane.camera ? "Camera" : lane.label),
          style: "left:" + (frame.time / timeline.duration * 100) + "%",
          onclick: (event) => { event.stopPropagation(); timelineTime = frame.time; applyTimelineAt(timelineTime); },
          onpointerdown: (event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            timelineDrag = { pointerId: event.pointerId, frameId: frame.id, lane: track, bounds: track.getBoundingClientRect(), startX: event.clientX, moved: false };
            marker.setPointerCapture(event.pointerId);
          },
        });
        track.append(marker);
      });
      track.append(el("div", { class: "rbv-track-playhead", style: "left:" + (timelineTime / timeline.duration * 100) + "%" }));
      row.append(track);
      tracks.append(row);
    });
  }
  function syncTimelineTrackPositions() {
    $("rbvTimelineTracks").querySelectorAll(".rbv-track-marker").forEach((marker) => {
      const frame = timeline.keyframes.find((item) => item.id === marker.dataset.frameId);
      if (!frame) return;
      marker.style.left = (frame.time / timeline.duration * 100) + "%";
      marker.classList.toggle("active", Math.abs(frame.time - timelineTime) < 0.05);
      marker.title = frame.time.toFixed(2) + " s";
    });
    $("rbvTimelineTracks").querySelectorAll(".rbv-track-playhead").forEach((playhead) => {
      playhead.style.left = (timelineTime / timeline.duration * 100) + "%";
    });
  }
  function seekTimelineFromTrack(event) {
    const lane = event.target.closest("[data-track-lane]");
    if (!lane || timelineDrag) return;
    const bounds = lane.getBoundingClientRect();
    if (!bounds.width) return;
    timelinePlaying = false; timelineLastFrame = 0;
    applyTimelineAt(clamp((event.clientX - bounds.left) / bounds.width, 0, 1) * timeline.duration);
  }
  function finishTimelineDrag() {
    if (!timelineDrag) return;
    const moved = timelineDrag.moved;
    timelineDrag = null;
    if (!moved) return;
    timeline.keyframes.sort((a, b) => a.time - b.time);
    renderTimelineTracks();
    renderTimelineKeyframes();
    updateTimelineControls();
    saveSetup();
  }
  function updateTimelineControls() {
    const slider = $("rbvTimelineTime");
    if (!slider) return;
    slider.max = String(timeline.duration);
    slider.value = String(timelineTime);
    $("rbvTimelineTimeLabel").textContent = timelineTime.toFixed(1) + " s";
    $("rbvTimelineDuration").value = String(timeline.duration);
    $("rbvTimelinePlay").textContent = timelinePlaying ? "Pause" : "Play";
    $("rbvToolbarPlay").textContent = timelinePlaying ? "Pause" : "Play";
    $("rbvToolbarPlay").title = timelinePlaying ? "Pause timeline animation" : "Play timeline animation";
    $("rbvToolbarPlay").setAttribute("aria-label", timelinePlaying ? "Pause timeline animation" : "Play timeline animation");
    $("rbvToolbarPlay").setAttribute("aria-pressed", String(timelinePlaying));
    $("rbvToolbarPlay").disabled = !robotRoot || !timeline.keyframes.length;
    $("rbvTimelinePlay").disabled = !robotRoot || !timeline.keyframes.length;
    $("rbvTimelineLoop").checked = timeline.loop;
    $("rbvCameraFree").setAttribute("aria-pressed", String(!timelineCameraEnabled));
    $("rbvCameraTimeline").setAttribute("aria-pressed", String(timelineCameraEnabled));
    $("rbvCameraFree").disabled = !robotRoot || !timeline.keyframes.length;
    $("rbvCameraTimeline").disabled = !robotRoot || !timeline.keyframes.length;
    $("rbvTimelineEasing").disabled = !timeline.keyframes.length;
    const frame = timeline.keyframes.slice().reverse().find((item) => item.time <= timelineTime + 0.001);
    $("rbvTimelineEasing").value = frame && EASING_TYPES.includes(frame.easing) ? frame.easing : "linear";
    $("rbvTimelineSelect").value = activeTimelineId;
    $("rbvTimelineDelete").disabled = savedTimelines.length < 2;
    $("rbvTimelineKeyframes").querySelectorAll("[data-keyframe-id]").forEach((row) => {
      row.classList.toggle("active", Math.abs(Number(row.dataset.keyframeTime) - timelineTime) < 0.05);
    });
    syncTimelineTrackPositions();
    syncCameraEditor();
  }
  function renderTimelineKeyframes() {
    renderTimelineTracks();
    const list = $("rbvTimelineKeyframes");
    if (!list) return;
    list.replaceChildren();
    if (!timeline.keyframes.length) {
      list.append(el("div", { class: "rbv-hint", text: "Move mechanisms and camera, then add a keyframe." }));
      return;
    }
    timeline.keyframes.forEach((frame) => {
      const row = el("div", { class: "rbv-keyframe" + (Math.abs(frame.time - timelineTime) < 0.05 ? " active" : ""), "data-keyframe-id": frame.id, "data-keyframe-time": frame.time });
      row.append(
        el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: frame.time.toFixed(1) + " s", onclick: () => { timelineTime = frame.time; applyTimelineAt(timelineTime); updateTimelineControls(); } }),
        el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "×", "aria-label": "Delete keyframe at " + frame.time.toFixed(1) + " seconds", onclick: () => {
          timeline.keyframes = timeline.keyframes.filter((item) => item.id !== frame.id);
          timelinePlaying = false;
          applyTimelineAt(timelineTime);
          renderTimelineKeyframes();
          updateTimelineControls();
          saveSetup();
        } })
      );
      list.append(row);
    });
  }
  function applyTimelineAt(time) {
    if (!timeline.keyframes.length) {
      timelineTime = clamp(time, 0, timeline.duration);
      updateTimelineControls();
      return;
    }
    timelineTime = clamp(time, 0, timeline.duration);
    const frames = timeline.keyframes;
    let before = frames[0], after = frames[0];
    if (timelineTime >= frames[frames.length - 1].time) {
      before = frames[frames.length - 1]; after = before;
    } else if (timelineTime > frames[0].time) {
      for (let i = 0; i < frames.length - 1; i++) {
        if (timelineTime <= frames[i + 1].time) {
          before = frames[i]; after = frames[i + 1]; break;
        }
      }
    }
    const span = after.time - before.time;
    const amount = before === after || span <= 0 ? 0 : easeProgress(clamp((timelineTime - before.time) / span, 0, 1), before.easing);
    mechanisms.forEach((mech) => {
      const start = Number(before.values[mech.id] ?? mech.value) || 0;
      const end = Number(after.values[mech.id] ?? start) || 0;
      setMechanismValue(mech, start + (end - start) * amount, true);
    });
    if (timelineCameraEnabled && before.camera && after.camera) {
      const position = before.camera.position.map((value, i) => value + (after.camera.position[i] - value) * amount);
      const lookAt = before.camera.target.map((value, i) => value + (after.camera.target[i] - value) * amount);
      applyCameraPose({ position, target: lookAt });
    } else if (timelineCameraEnabled && (before.camera || after.camera)) applyCameraPose(before.camera || after.camera);
    requestRender();
    updateTimelineControls();
  }
  function upsertTimelineKeyframe(time) {
    const frameCamera = timelineCameraEnabled ? cameraPose() : timelineCameraPoseAt(time);
    const frame = ensureKeyframe(time, true);
    frame.values = Object.fromEntries(mechanisms.map((mech) => [mech.id, Number(mech.value) || 0]));
    frame.camera = frameCamera;
    return frame;
  }
  function stepTimeline(now) {
    if (!timelinePlaying) return;
    if (timelineLastFrame) timelineTime += Math.min((now - timelineLastFrame) / 1000, 0.05);
    timelineLastFrame = now;
    if (timelineTime >= timeline.duration) {
      if (timeline.loop) timelineTime %= timeline.duration;
      else {
        timelineTime = timeline.duration;
        timelinePlaying = false;
        timelineLastFrame = 0;
      }
    }
    applyTimelineAt(timelineTime);
  }
  function normalizeTimeline(value) {
    const duration = clamp(Number(value && value.duration) || 10, 1, 300);
    const keyframes = Array.isArray(value && value.keyframes) ? value.keyframes.map((frame, index) => ({
      id: String(frame.id || "key-loaded-" + index),
      time: clamp(Number(frame.time) || 0, 0, duration),
      easing: EASING_TYPES.includes(frame.easing) ? frame.easing : "linear",
      values: frame.values && typeof frame.values === "object" ? frame.values : {},
      camera: frame.camera && Array.isArray(frame.camera.position) && Array.isArray(frame.camera.target)
        ? { position: frame.camera.position.slice(0, 3).map((n) => Number.isFinite(Number(n)) ? Number(n) : 0), target: frame.camera.target.slice(0, 3).map((n) => Number.isFinite(Number(n)) ? Number(n) : 0) }
        : null,
    })).sort((a, b) => a.time - b.time) : [];
    return {
      id: String(value && value.id || "timeline-" + Math.random().toString(36).slice(2, 9)),
      name: String(value && value.name || "Timeline"),
      duration, loop: !!(value && value.loop), keyframes,
    };
  }
  function backfillTimelineValues() {
    timeline.keyframes.forEach((frame) => {
      if (!frame.values || typeof frame.values !== "object") frame.values = {};
      mechanisms.forEach((mech) => {
        if (!Number.isFinite(Number(frame.values[mech.id]))) frame.values[mech.id] = Number(mech.value) || 0;
      });
    });
  }
  function addTimelineKeyframe() {
    if (!robotRoot) { setStatus("Load a model before adding animation keyframes.", { error: true }); return; }
    const frame = upsertTimelineKeyframe(timelineTime);
    renderTimelineKeyframes();
    updateTimelineControls();
    saveSetup();
    requestRender();
    setStatus("Keyframe added at " + frame.time.toFixed(1) + " seconds.");
  }

  function createCursorHelper(id, color) {
    const group = new THREE.Group();
    const scale = modelBox ? Math.max(...modelBox.getSize(new THREE.Vector3()).toArray(), 1e-3) * 0.018 : 0.04;
    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.8, 12, 8),
      new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.9 })
    );
    handle.userData.rbvCursorId = id;
    handle.renderOrder = 1000;
    group.add(handle);
    const points = [
      [[-2, 0, 0], [2, 0, 0]],
      [[0, -2, 0], [0, 2, 0]],
      [[0, 0, -2], [0, 0, 2]],
    ];
    const lineMaterial = new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.9 });
    points.forEach((pair) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(pair.map((point) => new THREE.Vector3(...point).multiplyScalar(scale)));
      const line = new THREE.Line(geometry, lineMaterial);
      line.renderOrder = 999;
      group.add(line);
    });
    group.userData.rbvCursorHandle = handle;
    group.userData.rbvCursorMaterial = handle.material;
    group.userData.rbvCursorLineMaterial = lineMaterial;
    group.userData.rbvCursorScale = scale;
    scene.add(group);
    return group;
  }
  function disposeCursorHelper(group) {
    scene.remove(group);
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
    });
    group.userData.rbvCursorMaterial.dispose();
    group.userData.rbvCursorLineMaterial.dispose();
  }
  function syncWorldCursors() {
    if (!scene) return;
    const providers = new Map();
    mechanisms.forEach((mech) => {
      const editor = pivotEditors.get(mech.id);
      if ((editor ? editor.mode.value : mech.pivotMode) !== "cursor") return;
      providers.set("mechanism:" + mech.id, {
        color: 0xffbd4a,
        point: () => editor ? editor.read() : mech.pivot || [0, 0, 0],
        move: (point) => {
          mech.pivot = point;
          if (editor) { mech.pivotMode = "cursor"; editor.set("cursor", point); }
          setMechanismValue(mech, mech.value, true);
        },
        finish: saveSetup,
      });
    });
    if (typeof addPivotEditor !== "undefined" && !addPivotEditor.mode.closest(".rbv-mech-add")?.hidden && addPivotEditor.mode.value === "cursor") {
      providers.set("new-mechanism", {
        color: 0x62e6a7,
        point: () => addPivotEditor.read(),
        move: (point) => addPivotEditor.set("cursor", point),
        finish: () => {},
      });
    }
    cursorProviders = providers;
    providers.forEach((provider, id) => {
      let helper = cursorHelpers.get(id);
      if (!helper) {
        helper = createCursorHelper(id, provider.color);
        cursorHelpers.set(id, helper);
      }
      helper.visible = drawerOpen;
      helper.position.fromArray(provider.point());
    });
    cursorHelpers.forEach((helper, id) => {
      if (providers.has(id)) return;
      disposeCursorHelper(helper);
      cursorHelpers.delete(id);
    });
  }
  function startCursorDrag(event, canvas) {
    if (!drawerOpen || !cursorRaycaster || !cursorHelpers.size) return false;
    const rect = canvas.getBoundingClientRect();
    cursorRaycaster.setFromCamera(new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    ), camera);
    const handles = Array.from(cursorHelpers.values(), (helper) => helper.userData.rbvCursorHandle);
    const hits = cursorRaycaster.intersectObjects(handles, false);
    const hit = event.shiftKey ? hits.find((item) => item.object.userData.rbvCursorId === "camera") || hits[0] : hits[0];
    if (!hit) return false;
    const id = hit.object.userData.rbvCursorId;
    const provider = cursorProviders.get(id);
    if (!provider) return false;
    timelinePlaying = false; timelineLastFrame = 0;
    updateTimelineControls();
    cursorPlane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()), hit.point);
    cursorDrag = { pointerId: event.pointerId, provider, plane: cursorPlane.clone() };
    if (canvas.setPointerCapture) canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
    return true;
  }
  function moveCursorDrag(event, canvas) {
    if (!cursorDrag || cursorDrag.pointerId !== event.pointerId) return false;
    const rect = canvas.getBoundingClientRect();
    cursorRaycaster.setFromCamera(new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    ), camera);
    const point = cursorRaycaster.ray.intersectPlane(cursorDrag.plane, cursorIntersection);
    if (point) {
      cursorDrag.provider.move(point.toArray());
      requestRender();
    }
    event.preventDefault();
    return true;
  }

  function renderNow() {
    if (!renderer) return;
    if (viewerSettings.autoRotate && robotRoot) {
      const now = performance.now();
      if (lastAutoRotateFrame) yaw += Math.min(Math.max((now - lastAutoRotateFrame) / 1000, 0), 0.05) * 0.35;
      lastAutoRotateFrame = now;
    } else lastAutoRotateFrame = 0;
    if (modelAnimationPlaying && animationMixer) {
      const now = performance.now();
      const delta = lastAnimationFrame ? Math.min((now - lastAnimationFrame) / 1000, 0.05) : 0;
      lastAnimationFrame = now;
      animationMixer.update(delta);
    } else lastAnimationFrame = 0;
    if (timelinePlaying) {
      stepTimeline(performance.now());
      if (!timelinePlaying) updateTimelineControls(); // reached the end
    }
    updateCamera();
    syncWorldCursors();
    if (markersDirty) refreshMarkerBoxes();
    renderer.render(scene, camera);
    if ((viewerSettings.autoRotate && robotRoot) || modelAnimationPlaying || timelinePlaying) requestRender();
  }
  function requestRender() {
    if (!renderer || raf) return;
    raf = requestAnimationFrame(() => { raf = 0; renderNow(); });
  }

  function viewBasis() {
    const cp = Math.cos(pitch);
    const dir = new THREE.Vector3(cp * Math.sin(yaw), Math.sin(pitch), cp * Math.cos(yaw)); // target → camera
    const fwd = dir.clone().negate();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().crossVectors(right, fwd).normalize();
    return { dir, fwd, right, up };
  }
  function updateCamera() {
    pitch = clamp(pitch, -1.5, 1.5);
    const b = viewBasis();
    camera.position.copy(target).addScaledVector(b.dir, dist);
    camera.lookAt(target);
  }

  // Frames the whole model so it fills as much of the card as the card's aspect ratio allows.
  function fitModel() {
    if (!robotRoot || !modelBox || !renderer) return;
    pitch = clamp(pitch, -1.5, 1.5);
    const size = modelBox.getSize(new THREE.Vector3());
    const center = modelBox.getCenter(new THREE.Vector3());
    target.copy(center);
    const maxDim = Math.max(size.x, size.y, size.z, 1e-3);
    const b = viewBasis();
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanH = tanV * camera.aspect;
    let d = 0;
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(i & 1 ? size.x : -size.x, i & 2 ? size.y : -size.y, i & 4 ? size.z : -size.z).multiplyScalar(0.5);
      const a = p.dot(b.fwd);
      d = Math.max(d, Math.abs(p.dot(b.right)) / tanH - a, Math.abs(p.dot(b.up)) / tanV - a);
    }
    dist = Math.max(d * 1.05, maxDim * 0.2);
    minDist = maxDim * 0.03; maxDist = maxDim * 30;
    camera.near = Math.max(maxDim * 0.001, 1e-4);
    camera.far = maxDim * 60;
    camera.updateProjectionMatrix();
    if (!!gridHelper !== gridOn || gridFor !== modelBox) ensureGrid();
    updateAxesHelper();
    renderNow();
  }

  function updateAxesHelper() {
    if (axesHelper) { scene.remove(axesHelper); axesHelper.geometry.dispose(); axesHelper.material.dispose(); axesHelper = null; }
    if (!viewerSettings.showAxes || !modelBox) return;
    const maxDim = Math.max(...modelBox.getSize(new THREE.Vector3()).toArray(), 1e-3);
    axesHelper = new THREE.AxesHelper(maxDim * 0.35);
    axesHelper.position.copy(modelBox.min);
    scene.add(axesHelper);
  }

  function ensureGrid() {
    if (gridHelper) { scene.remove(gridHelper); gridHelper.geometry.dispose(); gridHelper.material.dispose(); gridHelper = null; }
    gridFor = modelBox;
    if (!gridOn || !modelBox) return;
    const size = modelBox.getSize(new THREE.Vector3()), c = modelBox.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-3);
    gridHelper = new THREE.GridHelper(maxDim * 3, 24, 0x34445a, 0x243246);
    gridHelper.position.set(c.x, modelBox.min.y - maxDim * 0.002, c.z);
    scene.add(gridHelper);
  }

  // ───────── Orbit / pan / zoom (mouse, touch, pen) ─────────
  function attachControls(canvas) {
    const pts = new Map();
    let tap = null, marquee = null; // a short press-and-release without dragging = click-to-select
    const panBy = (dx, dy) => {
      const b = viewBasis();
      const s = (dist * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(1, stage.clientHeight);
      target.addScaledVector(b.right, -dx * s).addScaledVector(b.up, dy * s);
    };
    const zoomBy = (f) => { dist = clamp(dist * f, minDist, maxDist); };
    canvas.addEventListener("dblclick", (e) => {
      if ($("rbvMechAdd").hidden) return;
      e.preventDefault();
      marqueeEnabled = !marqueeEnabled;
      root.classList.toggle("rbv-marquee-enabled", marqueeEnabled);
      setStatus(marqueeEnabled ? "Marquee enabled: drag to select; double-click again to orbit." : "Marquee disabled: drag to orbit.", { sticky: marqueeEnabled });
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (startCursorDrag(e, canvas)) return;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      if (pts.size === 0) tap = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), ok: e.button === 0, select: e.button === 0 && marqueeEnabled && !$("rbvMechAdd").hidden, additive: e.shiftKey };
      else if (tap) tap.ok = false;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("pointermove", (e) => {
      if (moveCursorDrag(e, canvas)) return;
      const p = pts.get(e.pointerId); if (!p) return;
      const nx = e.clientX, ny = e.clientY;
      if (pts.size === 1 && tap && tap.id === e.pointerId && tap.select) {
        if (!marquee && Math.hypot(nx - tap.x, ny - tap.y) > 6) { tap.ok = false; marquee = { x: tap.x, y: tap.y, additive: tap.additive }; }
        if (marquee) { marquee.x2 = nx; marquee.y2 = ny; showMarquee(tap.x, tap.y, nx, ny); p.x = nx; p.y = ny; return; }
      }
      if (pts.size === 1 && tap && tap.ok) { if (Math.hypot(nx - tap.x, ny - tap.y) <= 6) return; tap.ok = false; }
      autoFit = false;
      if (pts.size === 1) {
        const dx = nx - p.x, dy = ny - p.y;
        if ((e.buttons & 6) || e.shiftKey) panBy(dx, dy); else { yaw -= dx * 0.007; pitch += dy * 0.007; }
      } else if (pts.size === 2) {
        let other = null; pts.forEach((v, id) => { if (id !== e.pointerId) other = v; });
        const before = Math.hypot(p.x - other.x, p.y - other.y), after = Math.hypot(nx - other.x, ny - other.y);
        if (before > 0 && after > 0) zoomBy(before / after);
        panBy((nx - p.x) / 2, (ny - p.y) / 2);
      }
      p.x = nx; p.y = ny;
      requestRender();
    });
    const end = (e) => {
      if (cursorDrag && cursorDrag.pointerId === e.pointerId) {
        const drag = cursorDrag;
        cursorDrag = null;
        drag.provider.finish();
        requestRender();
        return;
      }
      if (marquee && tap && tap.id === e.pointerId) {
        const active = marquee; marquee = null; marqueeEl.hidden = true;
        if (e.type === "pointerup") selectMarquee(active, e.clientX, e.clientY);
      }
      if (e.type === "pointerup" && tap && tap.ok && tap.id === e.pointerId && pts.size === 1 && Date.now() - tap.t < 600) onTap(e.clientX, e.clientY);
      if (tap && tap.id === e.pointerId) tap = null;
      pts.delete(e.pointerId);
    };
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);
    canvas.addEventListener("lostpointercapture", end);
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      autoFit = false;
      const unit = e.deltaMode === 1 ? 16 : 1;
      zoomBy(Math.exp(clamp(e.deltaY * unit, -200, 200) * 0.0015));
      requestRender();
    }, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // ───────── Model state ─────────
  let nodeMap = new Map(), nodeList = [];
  let mechanisms = [], presets = [], editingMechanismId = null, editingPartsMechanismId = null;
  const pivotEditors = new Map();
  let timeline = { id: "timeline-default", name: "Timeline 1", duration: 10, loop: false, keyframes: [] }, savedTimelines = [], activeTimelineId = timeline.id, timelineTime = 0, timelinePlaying = false, timelineLastFrame = 0;
  let timelineCameraEnabled = true;
  let timelineDrag = null;
  const cursorHelpers = new Map();
  let cursorProviders = new Map(), cursorRaycaster = null, cursorPlane = null, cursorIntersection = null, cursorDrag = null;
  const bases = new Map();      // mech.id → rest transform of its node (kept out of saved JSON)
  const mechUI = new Map();     // mech.id → { slider, out }
  let modelName = "", modelSize = 1;

  function collectNodes(rootObj) {
    nodeMap = new Map(); nodeList = [];
    const used = new Map();
    (function walk(o, depth) {
      const name = (o.name || "").trim();
      if (name) {
        const n = (used.get(name) || 0) + 1; used.set(name, n);
        const label = n === 1 ? name : name + " (" + n + ")";
        nodeMap.set(label, o); o.userData.rbvLabel = label;
        if (o !== rootObj) nodeList.push({ label, depth, group: o.children.length > 0 });
      }
      for (let i = 0; i < o.children.length; i++) walk(o.children[i], depth + (name ? 1 : 0));
    })(rootObj, 0);
  }

  function refreshNodeSelect() {
    const sel = $("rbvNodeSelect");
    const q = $("rbvNodeFilter").value.trim().toLowerCase();
    sel.innerHTML = "";
    if (!nodeList.length) { sel.append(el("option", { value: "", text: robotRoot ? "No named components found" : "Load a model first" })); return; }
    const hits = q ? nodeList.filter((n) => n.label.toLowerCase().includes(q)) : nodeList;
    lastHits = hits;
    hits.slice(0, 400).forEach((n) => {
      const pad = q ? "" : "  ".repeat(Math.min(n.depth, 6));
      sel.append(el("option", { value: n.label, text: pad + (n.group ? "▸ " : "") + n.label }));
    });
    if (hits.length > 400) sel.append(el("option", { value: "", disabled: "", text: "… " + (hits.length - 400) + " more — keep typing to narrow" }));
    if (!hits.length) sel.append(el("option", { value: "", text: "No matches" }));
  }

  function disposeRobot() {
    selection = []; hlObjects = [];
    edgeToken++;
    edgeObjects.forEach((o) => { if (o.parent) o.parent.remove(o); o.geometry.dispose(); });
    edgeObjects = [];
    currentMeshes = [];
    if (!robotRoot) return;
    scene.remove(robotRoot);
    const seenMaterials = new Set(), seenTextures = new Set();
    const disposeMaterial = (material) => {
      if (!material || seenMaterials.has(material)) return;
      seenMaterials.add(material);
      for (const k in material) {
        const texture = material[k];
        if (texture && texture.isTexture && !seenTextures.has(texture)) {
          seenTextures.add(texture);
          texture.dispose();
        }
      }
      material.dispose();
    };
    robotRoot.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      (o.userData.rbvBaseMaterials || []).forEach(disposeMaterial);
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(disposeMaterial);
    });
    styledMaterialCache.forEach((styles) => styles.forEach(disposeMaterial));
    styledMaterialCache.clear();
    robotRoot = null;
  }

  // ───────── Making the model light ─────────
  const DETAIL = {
    full:     { hideBelow: 0,     tex: 2048, lambert: false, dropMaps: false },
    balanced: { hideBelow: 0.004, tex: 1024, lambert: false, dropMaps: false },
    light:    { hideBelow: 0.012, tex: 512,  lambert: true,  dropMaps: true }
  };
  const TEX_KEYS = ["map", "emissiveMap", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "alphaMap"];
  const DROP_KEYS = ["normalMap", "roughnessMap", "metalnessMap", "aoMap"];

  function shrinkTexture(tex, cap) {
    const img = tex && tex.image;
    if (!img) return;
    const w = img.width || img.videoWidth, h = img.height || img.videoHeight;
    if (!w || !h || Math.max(w, h) <= cap) return;
    const s = cap / Math.max(w, h);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    if (img.close) img.close();
    tex.image = c; tex.needsUpdate = true;
  }

  function optimizeModel(rootObj) {
    const cfg = DETAIL[String(viewerSettings.modelDetail)] || DETAIL.balanced;
    rootObj.updateMatrixWorld(true);
    collectNodes(rootObj); // label everything first so saved mechanisms stay stable whatever the detail level

    const entries = [];
    const box = new THREE.Box3(), tmp = new THREE.Box3();
    rootObj.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      const g = o.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      tmp.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
      entries.push({ mesh: o, box: tmp.clone(), diag: tmp.getSize(new THREE.Vector3()).length() });
      box.union(tmp);
    });
    if (!entries.length || box.isEmpty()) throw new Error("The model contains no visible geometry.");
    const totalDiag = box.getSize(new THREE.Vector3()).length();

    // Hide tiny parts (bolts, nuts, washers) — they dominate triangle counts in FRC CAD but are invisible at pit-display size.
    let hidden = 0, kept = entries;
    if (cfg.hideBelow > 0 && entries.length > 60) {
      const pinned = new Set(mechanisms.reduce((a, m) => a.concat(m.nodes || []), []));
      kept = [];
      entries.forEach((en) => {
        if (en.diag < totalDiag * cfg.hideBelow && !pinned.has(en.mesh.userData.rbvLabel)) {
          if (en.mesh.parent) en.mesh.parent.remove(en.mesh);
          en.mesh.geometry.dispose();
          if (en.mesh.userData.rbvLabel) {
            nodeMap.delete(en.mesh.userData.rbvLabel);
            const i = nodeList.findIndex((n) => n.label === en.mesh.userData.rbvLabel);
            if (i >= 0) nodeList.splice(i, 1);
          }
          hidden++;
        } else kept.push(en);
      });
    }
    const keptBox = new THREE.Box3();
    kept.forEach((en) => keptBox.union(en.box));

    // Materials: no environment map means full metals render near-black, so tame them; shrink/drop textures; optional Lambert.
    const swap = new Map(), doneTex = new Set();
    let tris = 0;
    kept.forEach(({ mesh }) => {
      const g = mesh.geometry;
      tris += g.index ? g.index.count / 3 : (g.attributes.position ? g.attributes.position.count / 3 : 0);
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const out = list.map((m) => {
        if (!m) return m;
        if (swap.has(m)) return swap.get(m);
        let mat = m;
        if (m.isMeshStandardMaterial) {
          m.metalness = Math.min(m.metalness, 0.35); m.roughness = Math.max(m.roughness, 0.45);
          if (cfg.dropMaps) DROP_KEYS.forEach((k) => { if (m[k]) { m[k].dispose(); m[k] = null; } });
        }
        TEX_KEYS.forEach((k) => { const t = m[k]; if (t && !doneTex.has(t)) { doneTex.add(t); shrinkTexture(t, cfg.tex); } });
        if (cfg.lambert && m.isMeshStandardMaterial) {
          mat = new THREE.MeshLambertMaterial({
            color: m.color, map: m.map, vertexColors: m.vertexColors, transparent: m.transparent, opacity: m.opacity,
            side: m.side, alphaTest: m.alphaTest, emissive: m.emissive, emissiveMap: m.emissiveMap
          });
          m.dispose();
        }
        swap.set(m, mat);
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? out : out[0];
    });
    return { box: keptBox, tris: Math.round(tris), hidden, parts: kept.length, meshes: kept.map((k) => k.mesh), cfg };
  }

  function applyStyle(meshes) {
    const style = String(viewerSettings.displayStyle);
    currentMeshes = meshes;
    edgeToken++;
    edgeObjects.forEach((o) => { if (o.parent) o.parent.remove(o); o.geometry.dispose(); });
    edgeObjects = [];
    const seen = new Set();
    const styleMaterial = (base, mode) => {
      let byMode = styledMaterialCache.get(base);
      if (!byMode) { byMode = new Map(); styledMaterialCache.set(base, byMode); }
      if (byMode.has(mode)) return byMode.get(mode);
      const common = {
        side: base.side,
        transparent: base.transparent,
        opacity: base.opacity,
        alphaTest: base.alphaTest,
      };
      let material;
      if (mode === "toon") {
        material = new THREE.MeshToonMaterial({
          ...common,
          color: base.color ? base.color.clone() : 0xffffff,
          map: base.map || null,
          vertexColors: !!base.vertexColors,
          emissive: base.color ? base.color.clone().multiplyScalar(0.22) : 0x333333,
          emissiveMap: base.emissiveMap || null,
        });
      } else if (mode === "clay") {
        material = new THREE.MeshLambertMaterial({ ...common, color: 0xf0b991, emissive: 0x654b3b });
      } else {
        material = new THREE.MeshBasicMaterial({ side: base.side, color: 0x09243b });
      }
      byMode.set(mode, material);
      return material;
    };
    meshes.forEach((mesh) => {
      if (!mesh.userData.rbvBaseMaterials) {
        mesh.userData.rbvBaseMaterials = Array.isArray(mesh.material) ? mesh.material.slice() : [mesh.material];
      }
      const originals = mesh.userData.rbvBaseMaterials;
      const nextMaterials = originals.map((mat) => {
        if (!mat) return mat;
        if (style === "toon" || style === "clay" || style === "blueprint") return styleMaterial(mat, style);
        if (seen.has(mat)) return mat;
        seen.add(mat);
        if (!mat.userData.rbvOriginalStyle) {
          mat.userData.rbvOriginalStyle = {
            wireframe: mat.wireframe,
            transparent: mat.transparent,
            opacity: mat.opacity,
            depthWrite: mat.depthWrite,
            polygonOffset: mat.polygonOffset,
            polygonOffsetFactor: mat.polygonOffsetFactor,
            polygonOffsetUnits: mat.polygonOffsetUnits,
          };
        }
        const original = mat.userData.rbvOriginalStyle;
        mat.wireframe = style === "wireframe" ? true : original.wireframe;
        mat.transparent = style === "xray" ? true : original.transparent;
        mat.opacity = style === "xray" ? 0.23 : original.opacity;
        mat.depthWrite = style === "xray" ? false : original.depthWrite;
        mat.polygonOffset = style === "edges" || original.polygonOffset;
        mat.polygonOffsetFactor = style === "edges" ? 1 : original.polygonOffsetFactor;
        mat.polygonOffsetUnits = style === "edges" ? 1 : original.polygonOffsetUnits;
        mat.needsUpdate = true;
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? nextMaterials : nextMaterials[0];
    });
    if (style !== "edges" && style !== "blueprint") return;
    const blueprint = style === "blueprint";
    edgeMat = edgeMat || new THREE.LineBasicMaterial({ color: 0x0a111b, transparent: true, opacity: 0.85 });
    edgeMat.color.set(blueprint ? 0x64dcff : 0x0a111b);
    edgeMat.opacity = blueprint ? 0.95 : 0.85;
    const token = ++edgeToken; let i = 0;
    (function step() {
      if (token !== edgeToken || !robotRoot) return;
      const end = Math.min(i + 25, meshes.length);
      for (; i < end; i++) {
        const m = meshes[i];
        const line = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), edgeMat);
        m.add(line); edgeObjects.push(line);
      }
      requestRender();
      if (i < meshes.length) setTimeout(step, 0);
    })();
  }

  // ───────── Reading files ─────────
  function modelExtensions(json) {
    return Array.from(new Set([].concat(json.extensionsUsed || [], json.extensionsRequired || [])));
  }

  function glbExtensions(buf) {
    try {
      const dv = new DataView(buf);
      if (dv.getUint32(0, true) !== 0x46546c67) return [];
      const len = dv.getUint32(12, true);
      const json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, len)));
      return modelExtensions(json);
    } catch (_) { return []; }
  }

  async function parseModel(files) {
    const main = files.find((f) => /\.glb$/i.test(f.name)) || files.find((f) => /\.gltf$/i.test(f.name));
    if (!main) throw new Error("Choose a .glb or .gltf file.");
    const isGLB = /\.glb$/i.test(main.name);
    const loader = new GLTFLoader();
    let ext, text = null;
    if (isGLB) ext = glbExtensions(main.buffer);
    else { text = new TextDecoder().decode(main.buffer); ext = modelExtensions(JSON.parse(text)); }

    let draco = null;
    if (ext.includes("KHR_draco_mesh_compression")) {
      draco = new DRACOLoader();
      loader.setDRACOLoader(draco);
    }
    if (ext.includes("EXT_meshopt_compression")) {
      await MeshoptDecoder.ready;
      loader.setMeshoptDecoder(MeshoptDecoder);
    }
    if (ext.includes("KHR_texture_basisu")) throw new Error("KTX2/Basis textures aren't supported. Re-export the model with PNG/JPEG textures.");

    const urls = new Map();
    try {
      if (!isGLB) {
        files.forEach((f) => { if (f !== main) urls.set(f.name.toLowerCase(), URL.createObjectURL(new Blob([f.buffer]))); });
        const j = JSON.parse(text), missing = [];
        (j.buffers || []).concat(j.images || []).forEach((r) => {
          if (r.uri && !/^data:/i.test(r.uri) && !urls.has(decodeURIComponent(r.uri).split(/[\\/]/).pop().toLowerCase())) missing.push(r.uri);
        });
        if (missing.length) throw new Error("This .gltf also needs: " + missing.slice(0, 4).join(", ") + ". Select them together with the .gltf, or export a single .glb.");
        loader.manager.setURLModifier((u) => urls.get(decodeURIComponent(u.split(/[\\/]/).pop().split("?")[0]).toLowerCase()) || u);
      }
      return await new Promise((resolve, reject) => loader.parse(isGLB ? main.buffer : text, "", resolve, reject));
    } finally {
      urls.forEach((u) => URL.revokeObjectURL(u));
      if (draco) draco.dispose();
    }
  }

  function updateAnimationControls() {
    const select = $("rbvAnimationSelect");
    const play = $("rbvAnimationPlay");
    const toolbar = $("rbvToolbarPlay");
    if (select) {
      select.replaceChildren();
      if (!modelAnimations.length) {
        select.append(el("option", { value: "", text: "No animation found" }));
        select.disabled = true;
      } else {
        modelAnimations.forEach((clip, index) => {
          const name = String(clip.name || "").trim() || "Animation " + (index + 1);
          select.append(el("option", { value: String(index), text: name }));
        });
        select.disabled = false;
        select.value = String(activeAnimationIndex);
      }
    }
    const disabled = !robotRoot || !modelAnimations.length;
    if (play) {
      play.textContent = modelAnimationPlaying ? "Pause" : "Play";
      play.disabled = disabled;
      play.setAttribute("aria-pressed", String(modelAnimationPlaying));
    }
    if (toolbar) {
      toolbar.textContent = modelAnimationPlaying ? "Pause" : "Play";
      toolbar.title = modelAnimationPlaying ? "Pause model animation" : "Play model animation";
      toolbar.setAttribute("aria-label", modelAnimationPlaying ? "Pause model animation" : "Play model animation");
      toolbar.setAttribute("aria-pressed", String(modelAnimationPlaying));
      toolbar.disabled = disabled;
    }
    const loop = $("rbvAnimationLoop");
    if (loop) loop.checked = modelAnimationLoop;
  }

  function stopModelAnimation() {
    modelAnimationPlaying = false;
    lastAnimationFrame = 0;
    if (animationMixer) {
      animationMixer.stopAllAction();
      if (robotRoot) animationMixer.uncacheRoot(robotRoot);
    }
    animationMixer = null;
    animationAction = null;
  }

  function selectModelAnimation(index, playNow) {
    if (!robotRoot || !modelAnimations.length) return;
    const nextIndex = clamp(Math.floor(Number(index) || 0), 0, modelAnimations.length - 1);
    if (!animationMixer) {
      animationMixer = new THREE.AnimationMixer(robotRoot);
      animationMixer.addEventListener("finished", (event) => {
        if (event.action !== animationAction || modelAnimationLoop) return;
        modelAnimationPlaying = false;
        lastAnimationFrame = 0;
        updateAnimationControls();
      });
    }
    if (animationAction) {
      animationAction.stop();
      animationMixer.uncacheAction(animationAction.getClip(), robotRoot);
    }
    activeAnimationIndex = nextIndex;
    animationAction = animationMixer.clipAction(modelAnimations[activeAnimationIndex]);
    animationAction.setLoop(modelAnimationLoop ? THREE.LoopRepeat : THREE.LoopOnce, modelAnimationLoop ? Infinity : 1);
    animationAction.clampWhenFinished = !modelAnimationLoop;
    animationAction.reset();
    modelAnimationPlaying = !!playNow;
    if (modelAnimationPlaying) animationAction.play();
    updateAnimationControls();
    requestRender();
  }

  function setupModelAnimations(clips) {
    stopModelAnimation();
    modelAnimations = Array.isArray(clips) ? clips : [];
    activeAnimationIndex = 0;
    modelAnimationLoop = !!$("rbvAnimationLoop").checked;
    updateAnimationControls();
  }

  function toggleModelAnimation() {
    if (!animationAction || !modelAnimations.length) {
      if (modelAnimations.length) selectModelAnimation(activeAnimationIndex, true);
      return;
    }
    modelAnimationPlaying = !modelAnimationPlaying;
    if (modelAnimationPlaying) {
      animationAction.paused = false;
      animationAction.play();
      lastAnimationFrame = 0;
    } else {
      animationAction.paused = true;
      lastAnimationFrame = 0;
    }
    updateAnimationControls();
    requestRender();
  }

  async function loadModel(files, persist) {
    setStatus("Loading model…", { sticky: true });
    try {
      await ensureThree();
      initScratch();
      setupScene();
      const gltf = await parseModel(files);
      const sceneRoot = gltf.scene || (gltf.scenes && gltf.scenes[0]);
      if (!sceneRoot) throw new Error("No scene was found in this model.");
      const info = optimizeModel(sceneRoot);

      stopModelAnimation();
      disposeRobot();
      modelAnimations = Array.isArray(gltf.animations) ? gltf.animations : [];
      bases.clear();
      robotRoot = sceneRoot;
      scene.add(robotRoot);
      modelBox = info.box;
      applyModelBottom(modelBottom);
      modelSize = Math.max(info.box.getSize(new THREE.Vector3()).length() / 1.7, 1e-3);
      modelName = (files.find((f) => /\.(glb|gltf)$/i.test(f.name)) || files[0]).name;
      applyStyle(info.meshes);
      setupModelAnimations(modelAnimations);
      emptyEl.style.display = "none";
      infoEl.textContent = modelName + " · " + info.parts + " parts · " + (info.tris / 1000).toFixed(info.tris > 99999 ? 0 : 1) + "k triangles" + (info.hidden ? " · " + info.hidden + " tiny parts hidden" : "");
      refreshNodeSelect();
      resetMechRange();
      renderSelection();
      renderMechanisms();
      mechanisms.forEach((m) => { if (m.value) setMechanismValue(m, m.value, true); });
      autoFit = true;
      fitModel();
      revealed = String(viewerSettings.controlsMode) !== "hidden"; applyUiState();
      setStatus("");
      if (persist) {
        dbPut("models", "last", { files: files.map((f) => ({ name: f.name, buffer: f.buffer })), savedAt: Date.now() })
          .catch(() => setStatus("Model loaded, but this browser wouldn't store it — it will need loading again after a reload.", { error: true }));
        saveSetupNow();
      }
    } catch (err) {
      fail(err && err.message ? err.message : "Could not load model");
    }
  }

  async function readFiles(fileList) {
    const arr = Array.from(fileList || []);
    if (!arr.some((f) => /\.(glb|gltf)$/i.test(f.name))) { fail("Choose a .glb or .gltf file."); return; }
    const files = await Promise.all(arr.map(async (f) => ({ name: f.name, buffer: await f.arrayBuffer() })));
    await loadModel(files, true);
  }

  // ───────── Mechanisms ─────────
  const AXIS = { x: 0, y: 1, z: 2 };
  let MI, M1, M2, M3, M4, V1, V2; // scratch math objects, created once three.js is available
  function initScratch() { if (!MI) { MI = new THREE.Matrix4(); M1 = new THREE.Matrix4(); M2 = new THREE.Matrix4(); M3 = new THREE.Matrix4(); M4 = new THREE.Matrix4(); V1 = new THREE.Vector3(); V2 = new THREE.Vector3(); } }
  function nice(x) {
    if (!(x > 0)) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function resetMechRange() {
    $("rbvRange").value = $("rbvMotionType").value === "rotate" ? 90 : nice(modelSize * 0.3);
  }
  const decimals = (mech) => (mech.type === "rotate" ? 0 : mech.range < 1 ? 3 : mech.range < 10 ? 2 : 1);
  const formatValue = (mech) => (Number(mech.value) || 0).toFixed(decimals(mech)) + (mech.type === "rotate" ? "°" : "");

  function makePivotEditor(initialMode, initialPoint) {
    const mode = el("select", null,
      el("option", { value: "center", text: "Selection center" }),
      el("option", { value: "origin", text: "Each part's origin" }),
      el("option", { value: "cursor", text: "3D cursor" }));
    mode.value = ["center", "origin", "cursor"].includes(initialMode) ? initialMode : "center";
    const source = Array.isArray(initialPoint) ? initialPoint : [0, 0, 0];
    const inputs = ["X", "Y", "Z"].map((axis, i) => {
      const n = Number(source[i]);
      const input = el("input", { type: "number", step: "any", value: String(Number.isFinite(n) ? n : 0), "aria-label": "3D cursor " + axis + " coordinate" });
      input.addEventListener("input", requestRender);
      return el("label", { text: axis }, input);
    });
    const fields = el("fieldset", { class: "rbv-cursor-fields" }, el("legend", { text: "3D cursor position (world units)" }), ...inputs);
    const sync = () => { fields.hidden = mode.value !== "cursor"; };
    mode.addEventListener("change", () => { sync(); requestRender(); }); sync();
    return {
      element: el("div", { class: "rbv-pivot-editor" }, el("label", { text: "Rotate about" }, mode), fields, el("div", { class: "rbv-cursor-hint", text: "When 3D cursor is selected, drag its colored marker in the model view." })),
      mode, inputs: inputs.map((label) => label.querySelector("input")),
      read: () => inputs.map((label) => Number(label.querySelector("input").value)),
      valid: () => mode.value !== "cursor" || inputs.every((label) => { const input = label.querySelector("input"); return input.value.trim() !== "" && Number.isFinite(Number(input.value)); }),
      set: (nextMode, nextPoint) => {
        mode.value = ["center", "origin", "cursor"].includes(nextMode) ? nextMode : "center";
        const point = Array.isArray(nextPoint) ? nextPoint : [0, 0, 0];
        inputs.forEach((label, i) => { const n = Number(point[i]); label.querySelector("input").value = String(Number.isFinite(n) ? n : 0); });
        sync();
        requestRender();
      }
    };
  }

  function setMechanismValue(mech, value, silent) {
    markersDirty = true;
    mech.value = Number(value) || 0;
    const ui = mechUI.get(mech.id);
    if (ui) { ui.slider.value = mech.value; ui.out.textContent = formatValue(mech); }
    const objs = (mech.nodes || []).map((l) => nodeMap.get(l)).filter(Boolean);
    if (!objs.length) return;
    let st = bases.get(mech.id);
    if (!st) {
      // Rest pose is captured the first time a control moves, before anything has displaced these parts.
      st = { items: [], pivot: null };
      objs.forEach((o) => { o.updateMatrix(); st.items.push({ obj: o, local: o.matrix.clone(), p: o.position.toArray(), r: [o.rotation.x, o.rotation.y, o.rotation.z] }); });
      if (mech.type === "rotate" && mech.space !== "local" && mech.pivotMode === "center") {
        const b = new THREE.Box3(); objs.forEach((o) => b.expandByObject(o));
        if (!b.isEmpty()) st.pivot = b.getCenter(new THREE.Vector3());
      }
      bases.set(mech.id, st);
    }
    const idx = AXIS[mech.axis] || 0;
    const rad = THREE.MathUtils.degToRad(mech.value);
    st.items.forEach((it) => {
      const o = it.obj;
      if (mech.space === "local") { // controls made by the first version of this card: move in the part's own parent space
        if (mech.type === "rotate") { const r = it.r.slice(); r[idx] += rad; o.rotation.set(r[0], r[1], r[2]); }
        else { const p = it.p.slice(); p[idx] += mech.value; o.position.set(p[0], p[1], p[2]); }
        return;
      }
      // World-axis motion applied on top of each part's rest pose, so a group of parts moves as one rigid piece.
      const pw = o.parent ? o.parent.matrixWorld : MI;
      M1.multiplyMatrices(pw, it.local);
      V1.set(0, 0, 0); V1.setComponent(idx, 1);
      if (mech.type === "rotate") {
        if (mech.pivotMode === "cursor") V2.fromArray(mech.pivot || [0, 0, 0]);
        else if (st.pivot) V2.copy(st.pivot); else V2.setFromMatrixPosition(M1);
        M2.makeRotationAxis(V1, rad);
        M3.makeTranslation(V2.x, V2.y, V2.z).multiply(M2).multiply(M4.makeTranslation(-V2.x, -V2.y, -V2.z));
      } else {
        M3.makeTranslation(V1.x * mech.value, V1.y * mech.value, V1.z * mech.value);
      }
      M1.premultiply(M3);
      M2.copy(pw).invert().multiply(M1);
      M2.decompose(o.position, o.quaternion, o.scale);
    });
    objs.forEach((o) => o.updateMatrixWorld(true));
    if (!silent) requestRender();
  }

  function setMechanismParts(mech, nodes) {
    const value = Number(mech.value) || 0;
    setMechanismValue(mech, 0, true);
    mech.nodes = nodes.slice();
    bases.delete(mech.id);
    if (robotRoot) robotRoot.updateMatrixWorld(true);
    setMechanismValue(mech, value, true);
    requestRender();
  }

  function makeMechanismEditor(mech) {
    const type = el("select", null, el("option", { value: "translate", text: "Linear travel" }), el("option", { value: "rotate", text: "Rotation" }));
    const axis = el("select", null, ...["x", "y", "z"].map((v) => el("option", { value: v, text: v.toUpperCase() })));
    type.value = mech.type; axis.value = mech.axis;
    const range = el("input", { type: "number", min: "0.000001", step: "any", value: String(Math.abs(Number(mech.range)) || 1) });
    const pivot = makePivotEditor(mech.pivotMode, mech.pivot);
    pivotEditors.set(mech.id, pivot);
    return el("div", { class: "rbv-mech-editor rbv-edit-only" },
      el("label", { text: "Control type" }, type),
      el("label", { text: "World axis" }, axis),
      el("label", { text: "Range (units / degrees)" }, range), pivot.element,
      el("div", { class: "rbv-actions" },
        el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "Edit parts", onclick: () => openMechanismPartsEditor(mech) }),
        el("button", { type: "button", class: "rbv-btn", text: "Save", onclick: () => {
          const nextRange = Number(range.value);
          if (!Number.isFinite(nextRange) || nextRange <= 0) { fail("Enter a range greater than zero."); return; }
          if (!pivot.valid()) { fail("Enter valid X, Y, and Z cursor coordinates."); return; }
          setMechanismValue(mech, 0, true);
          mech.type = type.value; mech.axis = axis.value; mech.range = nextRange;
          mech.pivotMode = pivot.mode.value; mech.pivot = pivot.read(); mech.value = 0;
          bases.delete(mech.id); editingMechanismId = null; renderMechanisms(); saveSetup();
          setStatus("Control updated; its slider was reset to zero.");
        } }),
        el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "Cancel", onclick: () => { editingMechanismId = null; renderMechanisms(); } })));
  }

  function renderMechanisms() {
    renderMechanismsBase();
    onMechanismsRendered();
  }
  function renderMechanismsBase() {
    const list = $("rbvMechanismList");
    list.innerHTML = ""; mechUI.clear(); pivotEditors.clear();
    if (!mechanisms.length) { list.append(el("div", { class: "rbv-hint", text: "No controls yet. Tap Edit, then Add to bind one or more parts to a slider." })); return; }
    mechanisms.forEach((mech) => {
      const present = !robotRoot || mech.nodes.some((l) => nodeMap.has(l));
      const what = mech.nodes.length === 1 ? mech.nodes[0] : mech.nodes.length + " parts (" + mech.nodes.slice(0, 2).join(", ") + (mech.nodes.length > 2 ? ", …" : "") + ")";
      const range = Math.abs(mech.range) || 1;
      const slider = el("input", { type: "range", min: -range, max: range, step: range / 200, value: mech.value || 0, "aria-label": mech.name });
      if (!present) slider.disabled = true;
      const out = el("output", { text: formatValue(mech) });
      slider.addEventListener("input", () => { setMechanismValue(mech, slider.value); saveSetup(); });
      const row = el("div", { class: "rbv-mech-row" + (present ? "" : " missing") },
        el("div", { class: "rbv-mech-head" },
          el("div", null,
            el("div", { class: "rbv-mech-name", text: mech.name }),
            el("div", { class: "rbv-mech-node", text: what + " · " + (mech.type === "rotate" ? "rotation " : "travel ") + mech.axis.toUpperCase() + (present ? "" : " · not in this model") })),
          el("div", { class: "rbv-mech-actions" },
            el("button", { type: "button", class: "rbv-btn", text: "Zero", onclick: () => { setMechanismValue(mech, 0); saveSetup(); } }),
            el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "Edit", onclick: () => { editingMechanismId = editingMechanismId === mech.id ? null : mech.id; renderMechanisms(); } }),
            el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "×", "aria-label": "Remove", onclick: () => {
              if (bases.has(mech.id)) setMechanismValue(mech, 0);
              mechanisms = mechanisms.filter((m) => m.id !== mech.id); bases.delete(mech.id); editingMechanismId = null; renderMechanisms(); saveSetup();
            } }))),
        el("div", { class: "rbv-range-line" }, slider, out));
      if (editingMechanismId === mech.id) row.append(makeMechanismEditor(mech));
      mechUI.set(mech.id, { slider, out });
      list.append(row);
    });
  }

  function renderPresets() {
    const list = $("rbvPresetList");
    list.innerHTML = "";
    if (!presets.length) { list.append(el("div", { class: "rbv-hint", text: "No saved poses yet. In Edit mode, set the sliders, name the pose, then Save pose." })); return; }
    presets.forEach((preset, index) => {
      const nameBox = el("strong", { text: preset.name });
      const row = el("div", { class: "rbv-preset-row" }, nameBox,
        el("div", null,
          el("button", { type: "button", class: "rbv-btn", text: "Apply", onclick: () => {
            mechanisms.forEach((m) => { const v = preset.values && preset.values[m.id]; if (v !== undefined) setMechanismValue(m, v, true); });
            requestRender(); saveSetup(); setStatus("Pose: " + preset.name);
          } }),
          el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "Rename", onclick: () => {
            const input = el("input", { type: "text", maxlength: 32, value: preset.name });
            nameBox.replaceWith(input); input.focus(); input.select();
            let done = false;
            const finish = (save) => { if (done) return; done = true; const v = input.value.trim(); if (save && v) { preset.name = v.slice(0, 32); saveSetup(); } renderPresets(); };
            input.addEventListener("keydown", (e) => { if (e.key === "Enter") finish(true); if (e.key === "Escape") finish(false); });
            input.addEventListener("blur", () => finish(true));
          } }),
          el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "×", "aria-label": "Delete pose", onclick: () => { presets.splice(index, 1); renderPresets(); saveSetup(); } })));
      list.append(row);
    });
  }

  function renderTimelineLibrary() {
    const select = $("rbvTimelineSelect");
    select.replaceChildren();
    if (!savedTimelines.length) savedTimelines = [timeline];
    savedTimelines.forEach((item) => select.append(el("option", { value: item.id, text: item.name })));
    select.value = activeTimelineId;
  }
  function syncActiveTimeline() {
    const index = savedTimelines.findIndex((item) => item.id === activeTimelineId);
    if (index < 0) savedTimelines.push(timeline);
    else savedTimelines[index] = timeline;
  }

  // ───────── Saving the setup (settings are in PitBeacon; this is just mechanisms + poses) ─────────
  let saveTimer = 0;
  const saveSetup = () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveSetupNow, 400); };
  const setupSnapshot = () => {
    syncActiveTimeline();
    return { version: 1, modelName, modelBottom, mechanisms: mechanisms.map((m) => ({ id: m.id, name: m.name, nodes: m.nodes, space: m.space, pivotMode: m.pivotMode, pivot: m.pivot, type: m.type, axis: m.axis, range: m.range, value: m.value })), presets, timeline, timelines: savedTimelines, activeTimelineId };
  };
  function normMech(m) {
    m = Object.assign({}, m);
    if (!Array.isArray(m.nodes)) { m.nodes = m.node ? [m.node] : []; m.space = "local"; } // first-version controls keep their original behaviour
    delete m.node;
    m.space = m.space || "world"; m.pivotMode = ["center", "origin", "cursor"].includes(m.pivotMode) ? m.pivotMode : "center";
    m.pivot = Array.isArray(m.pivot) && m.pivot.length >= 3 ? m.pivot.slice(0, 3).map((v) => Number.isFinite(Number(v)) ? Number(v) : 0) : [0, 0, 0];
    m.type = m.type === "rotate" ? "rotate" : "translate"; m.axis = AXIS[m.axis] === undefined ? "x" : m.axis;
    m.range = Math.abs(Number(m.range)) || 1;
    return m;
  }
  async function saveSetupNow() {
    const setup = setupSnapshot();
    try { if (sdk.storage && sdk.storage.set) await sdk.storage.set("robotViewerSetup", setup); } catch (_) {}
    try { localStorage.setItem("pitbeaconRobotViewerSetup", JSON.stringify(setup)); } catch (_) {}
  }
  async function loadSetup() {
    let setup = null;
    try { if (sdk.storage && sdk.storage.get) setup = await sdk.storage.get("robotViewerSetup"); } catch (_) {}
    if (!setup) { try { setup = JSON.parse(localStorage.getItem("pitbeaconRobotViewerSetup") || "null"); } catch (_) {} }
    if (setup && setup.version === 1) {
      mechanisms = Array.isArray(setup.mechanisms) ? setup.mechanisms.map(normMech) : [];
      presets = Array.isArray(setup.presets) ? setup.presets : [];
      savedTimelines = Array.isArray(setup.timelines) && setup.timelines.length
        ? setup.timelines.map(normalizeTimeline)
        : [normalizeTimeline(setup.timeline)];
      activeTimelineId = savedTimelines.some((item) => item.id === setup.activeTimelineId) ? setup.activeTimelineId : savedTimelines[0].id;
      timeline = savedTimelines.find((item) => item.id === activeTimelineId);
      backfillTimelineValues();
      timelineTime = 0;
    }
    if (!savedTimelines.length) savedTimelines = [timeline];
    modelBottom = normalizeModelBottom(setup && setup.modelBottom ? setup.modelBottom : modelBottom);
    const bottomSelect = $("rbvModelBottom");
    if (bottomSelect) bottomSelect.value = modelBottom;
    if (robotRoot) applyModelBottom(modelBottom, true);
    renderMechanisms(); renderPresets();
  }

  // ───────── Part selection: click in the view, pick from the list, or filter → add all matches ─────────
  let selection = [], hlObjects = [], hlMat = null, nameTouched = false, lastHits = [];
  const isAncestorOf = (a, b) => { for (let p = b.parent; p; p = p.parent) if (p === a) return true; return false; };

  function addToSelection(label, quiet) {
    const o = nodeMap.get(label);
    if (!o || selection.includes(label)) return false;
    for (const l of selection) {
      const s2 = nodeMap.get(l);
      if (s2 && isAncestorOf(s2, o)) { if (!quiet) setStatus(label + " is already part of " + l); return false; }
    }
    selection = selection.filter((l) => { const s2 = nodeMap.get(l); return !(s2 && isAncestorOf(o, s2)); }); // a parent replaces its children
    selection.push(label);
    return true;
  }

  function renderSelection() {
    hlObjects.forEach((o) => { if (o.parent) o.parent.remove(o); });
    hlObjects = [];
    if (robotRoot && selection.length) {
      hlMat = hlMat || new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      outer: for (const l of selection) {
        const o = nodeMap.get(l); if (!o) continue;
        const stack = [o];
        while (stack.length) {
          const n = stack.pop();
          if (n.isMesh && !n.userData.rbvOverlay) {
            if (hlObjects.length >= 1500) break outer;
            const ov = new THREE.Mesh(n.geometry, hlMat);
            ov.userData.rbvOverlay = true; ov.raycast = () => {};
            n.add(ov); hlObjects.push(ov);
          }
          for (let i = 0; i < n.children.length; i++) stack.push(n.children[i]);
        }
      }
    }
    $("rbvSelCount").textContent = selection.length ? selection.length + " selected" : "Nothing selected";
    const chips = $("rbvSelChips"); chips.innerHTML = "";
    selection.slice(0, 8).forEach((l) => chips.append(el("span", { class: "rbv-chip" }, el("span", { text: l }),
      el("button", { type: "button", "aria-label": "Remove " + l, text: "×", onclick: () => { selection = selection.filter((x) => x !== l); renderSelection(); } }))));
    if (selection.length > 8) chips.append(el("span", { class: "rbv-chip more", text: "+" + (selection.length - 8) + " more" }));
    if (!nameTouched) $("rbvMechanismName").value = selection.length ? selection[0] + (selection.length > 1 ? " group" : "") : "New control";
    requestRender();
  }

  // Called for a short click/tap on the 3D view (only does anything while the Add-control form is open).
  function showMarquee(x1, y1, x2, y2) {
    const bounds = stage.getBoundingClientRect();
    marqueeEl.style.left = Math.min(x1, x2) - bounds.left + "px";
    marqueeEl.style.top = Math.min(y1, y2) - bounds.top + "px";
    marqueeEl.style.width = Math.abs(x2 - x1) + "px";
    marqueeEl.style.height = Math.abs(y2 - y1) + "px";
    marqueeEl.hidden = false;
  }

  function selectMarquee(marquee, endX, endY) {
    if (!robotRoot || $("rbvMechAdd").hidden) return;
    const left = Math.min(marquee.x, endX), right = Math.max(marquee.x, endX);
    const top = Math.min(marquee.y, endY), bottom = Math.max(marquee.y, endY);
    const canvasRect = renderer.domElement.getBoundingClientRect();
    updateCamera(); camera.updateMatrixWorld(true); robotRoot.updateMatrixWorld(true);
    const box = new THREE.Box3(), point = new THREE.Vector3();
    const screenBounds = (object) => {
      box.setFromObject(object); if (box.isEmpty()) return null;
      const bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, visible: false };
      for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
        point.set(x ? box.max.x : box.min.x, y ? box.max.y : box.min.y, z ? box.max.z : box.min.z).project(camera);
        if (point.z < -1 || point.z > 1) continue;
        bounds.visible = true;
        const px = canvasRect.left + (point.x + 1) * canvasRect.width / 2;
        const py = canvasRect.top + (1 - point.y) * canvasRect.height / 2;
        bounds.minX = Math.min(bounds.minX, px); bounds.maxX = Math.max(bounds.maxX, px);
        bounds.minY = Math.min(bounds.minY, py); bounds.maxY = Math.max(bounds.maxY, py);
      }
      return bounds.visible ? bounds : null;
    };
    const isInside = (bounds) => bounds && bounds.minX >= left && bounds.maxX <= right && bounds.minY >= top && bounds.maxY <= bottom;
    const matches = [];
    const orderedNodes = nodeList.slice().sort((a, b) => a.depth - b.depth);
    const namedAncestors = new Set();
    orderedNodes.forEach((node) => {
      for (let parent = nodeMap.get(node.label).parent; parent; parent = parent.parent) {
        if (parent.userData.rbvLabel) namedAncestors.add(parent.userData.rbvLabel);
      }
    });
    const leafNodes = orderedNodes.filter((node) => !namedAncestors.has(node.label));
    const projected = new Map(orderedNodes.map((node) => [node.label, screenBounds(nodeMap.get(node.label))]));
    for (const node of orderedNodes) {
      const object = nodeMap.get(node.label), bounds = projected.get(node.label);
      if (!object || !bounds || bounds.maxX < left || bounds.minX > right || bounds.maxY < top || bounds.minY > bottom) continue;
      if (node.group) {
        const leaves = leafNodes.filter((part) => {
          const child = nodeMap.get(part.label); return child && child !== object && isAncestorOf(object, child);
        });
        if (leaves.length) {
          const contained = leaves.reduce((count, part) => count + (isInside(projected.get(part.label)) ? 1 : 0), 0);
          if (contained / leaves.length < 0.8) continue;
        }
      }
      matches.push(node.label);
    }
    if (!marquee.additive) selection = [];
    matches.forEach((label) => addToSelection(label, true));
    renderSelection();
    setStatus(matches.length ? "Selected " + matches.length + " part" + (matches.length === 1 ? "" : "s") : "No parts in that area");
  }

  function onTap(cx, cy) {
    if (!robotRoot) return;
    if ($("rbvMechAdd").hidden) { tapForPart(cx, cy); return; }
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    camera.updateMatrixWorld();
    const rc = new THREE.Raycaster(); rc.setFromCamera(ndc, camera);
    const hit = rc.intersectObject(robotRoot, true).find((h) => h.object.isMesh && !h.object.userData.rbvOverlay);
    if (!hit) return;
    let n = hit.object;
    while (n && n !== robotRoot && !n.userData.rbvLabel) n = n.parent;
    if (!n || n === robotRoot) { setStatus("That part has no name in the model, so it can't be selected."); return; }
    const label = n.userData.rbvLabel;
    if (selection.includes(label)) selection = selection.filter((l) => l !== label); else addToSelection(label);
    renderSelection();
  }

  function growSelection() {
    if (!selection.length) return;
    const next = selection.map((l) => {
      const o = nodeMap.get(l); let p = o && o.parent;
      while (p && p !== robotRoot && !p.userData.rbvLabel) p = p.parent;
      return p && p !== robotRoot ? p.userData.rbvLabel : l;
    });
    selection = []; next.forEach((l) => addToSelection(l, true));
    renderSelection();
  }
  function addHighlighted() {
    const v = $("rbvNodeSelect").value;
    if (!v || !nodeMap.has(v)) { setStatus("Pick a part from the list first."); return; }
    addToSelection(v); renderSelection();
  }
  function addAllMatches() {
    if (!$("rbvNodeFilter").value.trim()) { setStatus("Type in the filter first, then add all matches."); return; }
    let n = 0;
    lastHits.slice().sort((a, b) => a.depth - b.depth).slice(0, 2000).forEach((h) => { if (addToSelection(h.label, true)) n++; });
    renderSelection();
    setStatus(n ? "Added " + n + " part" + (n === 1 ? "" : "s") : "No new parts to add");
  }
  function setPartsEditorMode(editing) {
    ["rbvMotionType", "rbvAxis", "rbvRange", "rbvMechanismName"].forEach((id) => { $(id).parentElement.hidden = editing; });
    $("rbvPivotEditor").hidden = editing;
  }
  function openAddForm() {
    if (!robotRoot) { setStatus("Load a model first"); return; }
    setPartsEditorMode(false);
    editingPartsMechanismId = null;
    $("rbvCreateMechanism").textContent = "Create control";
    nameTouched = false; selection = []; marqueeEnabled = false; root.classList.remove("rbv-marquee-enabled"); addPivotEditor.set("center", [0, 0, 0]);
    $("rbvMechAdd").hidden = false;
    renderSelection(); refreshNodeSelect(); resetMechRange();
  }
  function openMechanismPartsEditor(mech) {
    if (!robotRoot) { setStatus("Load a model first"); return; }
    setPartsEditorMode(true);
    editingPartsMechanismId = mech.id;
    selection = mech.nodes.filter((label) => nodeMap.has(label));
    nameTouched = true;
    $("rbvMechAdd").hidden = false;
    $("rbvCreateMechanism").textContent = "Save parts";
    $("rbvMechanismName").value = mech.name;
    $("rbvMotionType").value = mech.type;
    $("rbvAxis").value = mech.axis;
    $("rbvRange").value = String(Math.abs(Number(mech.range)) || 1);
    addPivotEditor.set(mech.pivotMode, mech.pivot);
    marqueeEnabled = false; root.classList.remove("rbv-marquee-enabled"); marqueeEl.hidden = true;
    renderSelection(); refreshNodeSelect();
  }
  function closeAddForm() {
    setPartsEditorMode(false);
    editingPartsMechanismId = null;
    $("rbvCreateMechanism").textContent = "Create control";
    marqueeEnabled = false; root.classList.remove("rbv-marquee-enabled"); marqueeEl.hidden = true;
    $("rbvMechAdd").hidden = true;
    selection = []; renderSelection();
  }

  // ───────── Wiring ─────────
  const addPivotEditor = makePivotEditor("center", [0, 0, 0]);
  $("rbvPivotEditor").append(addPivotEditor.element);
  $("rbvFile").addEventListener("change", async (e) => {
    const files = e.target.files; if (!files || !files.length) return;
    try { await readFiles(files); } finally { e.target.value = ""; }
  });
  ["dragover", "drop"].forEach((t) => stage.addEventListener(t, (e) => {
    e.preventDefault();
    if (t === "drop" && e.dataTransfer && e.dataTransfer.files.length) readFiles(e.dataTransfer.files);
  }));
  $("rbvHome").addEventListener("click", () => { yaw = 0.7; pitch = 0.45; autoFit = true; fitModel(); });
  function setDrawer(open) {
    if (open && settingsOpen) {
      settingsOpen = false; settingsPanel.hidden = true;
      $("rbvSettingsToggle").setAttribute("aria-expanded", "false");
    }
    drawerOpen = open; drawer.hidden = !open;
    cursorHelpers.forEach((helper) => { helper.visible = open; });
    $("rbvSetupToggle").setAttribute("aria-expanded", String(open));
    if (!open) { root.classList.remove("rbv-editing"); $("rbvEditToggle").setAttribute("aria-pressed", "false"); closeAddForm(); }
    revealed = true; applyUiState();
    requestRender();
  }
  function setSettingsMenu(open) {
    if (open && drawerOpen) setDrawer(false);
    settingsOpen = open; settingsPanel.hidden = !open;
    $("rbvSettingsToggle").setAttribute("aria-expanded", String(open));
    revealed = true; applyUiState();
  }
  $("rbvSetupToggle").addEventListener("click", () => setDrawer(drawer.hidden));
  $("rbvCloseDrawer").addEventListener("click", () => setDrawer(false));
  $("rbvSettingsToggle").addEventListener("click", () => setSettingsMenu(settingsPanel.hidden));
  $("rbvSettingsClose").addEventListener("click", () => setSettingsMenu(false));
  if ($("rbvTimelineAddKeyframe")) {
  $("rbvTimelineAddKeyframe").addEventListener("click", addTimelineKeyframe);
  $("rbvTimelineSelect").addEventListener("change", (event) => {
    syncActiveTimeline();
    const selected = savedTimelines.find((item) => item.id === event.currentTarget.value);
    if (!selected) return;
    timelinePlaying = false; timelineLastFrame = 0;
    activeTimelineId = selected.id;
    timeline = selected;
    timelineTime = 0;
    renderTimelineKeyframes();
    applyTimelineAt(timelineTime);
    updateTimelineControls();
    saveSetup();
  });
  $("rbvTimelineSave").addEventListener("click", () => {
    const name = $("rbvTimelineName").value.trim();
    if (!name) { fail("Enter a name for the saved timeline."); return; }
    syncActiveTimeline();
    const copy = JSON.parse(JSON.stringify(timeline));
    copy.id = "timeline-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    copy.name = name.slice(0, 32);
    savedTimelines.push(copy);
    activeTimelineId = copy.id;
    timeline = copy;
    timelineTime = 0;
    timelinePlaying = false; timelineLastFrame = 0;
    $("rbvTimelineName").value = "";
    renderTimelineLibrary();
    renderTimelineKeyframes();
    applyTimelineAt(timelineTime);
    updateTimelineControls();
    saveSetup();
  });
  $("rbvTimelineDelete").addEventListener("click", () => {
    if (savedTimelines.length < 2) return;
    savedTimelines = savedTimelines.filter((item) => item.id !== activeTimelineId);
    timeline = savedTimelines[0];
    activeTimelineId = timeline.id;
    timelineTime = 0;
    timelinePlaying = false; timelineLastFrame = 0;
    renderTimelineLibrary();
    renderTimelineKeyframes();
    applyTimelineAt(timelineTime);
    updateTimelineControls();
    saveSetup();
  });
  $("rbvTimelineTracks").addEventListener("click", seekTimelineFromTrack);
  $("rbvTimelineTracks").addEventListener("pointermove", (event) => {
    if (!timelineDrag || timelineDrag.pointerId !== event.pointerId) return;
    if (!timelineDrag.moved && Math.abs(event.clientX - timelineDrag.startX) < 3) return;
    timelineDrag.moved = true;
    timelinePlaying = false; timelineLastFrame = 0;
    const frame = timeline.keyframes.find((item) => item.id === timelineDrag.frameId);
    const bounds = timelineDrag.bounds;
    if (!frame || !bounds.width) return;
    frame.time = clamp(Math.round((event.clientX - bounds.left) / bounds.width * timeline.duration * 100) / 100, 0, timeline.duration);
    timelineTime = frame.time;
    applyTimelineAt(timelineTime);
    syncTimelineTrackPositions();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((type) => $("rbvTimelineTracks").addEventListener(type, finishTimelineDrag));
  function toggleTimelinePlayback() {
    if (!robotRoot || !timeline.keyframes.length) { setStatus("Load a model and add at least one keyframe before playback.", { error: true }); return; }
    if (timelinePlaying) {
      timelinePlaying = false; timelineLastFrame = 0;
    } else {
      if (timelineTime >= timeline.duration) timelineTime = 0;
      timelinePlaying = true; timelineLastFrame = 0;
      applyTimelineAt(timelineTime);
    }
    updateTimelineControls();
    requestRender();
  }
  $("rbvTimelinePlay").addEventListener("click", toggleTimelinePlayback);
  $("rbvToolbarPlay").addEventListener("click", toggleTimelinePlayback);
  $("rbvTimelineLoop").addEventListener("change", (event) => {
    timeline.loop = event.currentTarget.checked;
    updateTimelineControls();
    saveSetup();
  });
  $("rbvCameraFree").addEventListener("click", () => {
    if (!timeline.keyframes.length) return;
    timelineCameraEnabled = false;
    updateTimelineControls();
    requestRender();
  });
  $("rbvCameraTimeline").addEventListener("click", () => {
    if (!timeline.keyframes.length) return;
    timelineCameraEnabled = true;
    applyTimelineAt(timelineTime);
    requestRender();
  });
  function applyCameraEditor() {
    if (!timeline.keyframes.length) return;
    const values = ["rbvCameraX", "rbvCameraY", "rbvCameraZ", "rbvCameraZoom", "rbvCameraYaw", "rbvCameraPitch"].map((id) => Number($(id).value));
    if (!values.every(Number.isFinite)) { fail("Enter valid camera coordinates, zoom, and rotation."); syncCameraEditor(); return; }
    const pose = cameraPoseFromOrbit({
      target: values.slice(0, 3),
      zoom: values[3],
      yaw: THREE.MathUtils.degToRad(values[4]),
      pitch: THREE.MathUtils.degToRad(values[5]),
    });
    setTimelineCameraPoseAt(timelineTime, pose);
    renderTimelineKeyframes();
    updateTimelineControls();
    saveSetup();
    requestRender();
  }
  ["rbvCameraX", "rbvCameraY", "rbvCameraZ", "rbvCameraZoom", "rbvCameraYaw", "rbvCameraPitch"].forEach((id) => {
    $(id).addEventListener("change", applyCameraEditor);
  });
  $("rbvTimelineTime").addEventListener("input", (event) => {
    timelinePlaying = false; timelineLastFrame = 0;
    applyTimelineAt(Number(event.currentTarget.value));
  });
  $("rbvTimelineDuration").addEventListener("change", (event) => {
    const lastKeyframe = timeline.keyframes.length ? timeline.keyframes[timeline.keyframes.length - 1].time : 0;
    timeline.duration = clamp(Number(event.currentTarget.value) || 10, Math.max(1, lastKeyframe), 300);
    timelineTime = clamp(timelineTime, 0, timeline.duration);
    renderTimelineTracks();
    updateTimelineControls();
    saveSetup();
  });
  $("rbvTimelineEasing").addEventListener("change", (event) => {
    const frame = timeline.keyframes.slice().reverse().find((item) => item.time <= timelineTime + 0.001);
    if (!frame) return;
    frame.easing = EASING_TYPES.includes(event.currentTarget.value) ? event.currentTarget.value : "linear";
    renderTimelineKeyframes();
    saveSetup();
  });
  }
  $("rbvAnimationSelect").addEventListener("change", (event) => {
    selectModelAnimation(event.currentTarget.value, false);
  });
  $("rbvAnimationLoop").addEventListener("change", (event) => {
    modelAnimationLoop = event.currentTarget.checked;
    if (animationAction) {
      animationAction.setLoop(modelAnimationLoop ? THREE.LoopRepeat : THREE.LoopOnce, modelAnimationLoop ? Infinity : 1);
      animationAction.clampWhenFinished = !modelAnimationLoop;
    }
    updateAnimationControls();
  });
  $("rbvAnimationPlay").addEventListener("click", toggleModelAnimation);
  $("rbvToolbarPlay").addEventListener("click", toggleModelAnimation);
  bindViewerSetting("rbvSettingDisplayStyle", "displayStyle", "select");
  $("rbvSettingLightingPreset").addEventListener("change", (event) => applyLightingPreset(event.currentTarget.value));
  bindViewerSetting("rbvSettingLightSky", "lightSky", "color");
  bindViewerSetting("rbvSettingLightGround", "lightGround", "color");
  bindViewerSetting("rbvSettingLightKey", "lightKey", "color");
  bindViewerSetting("rbvSettingLightFill", "lightFill", "color");
  bindViewerSetting("rbvSettingModelDetail", "modelDetail", "select");
  bindViewerSetting("rbvSettingRenderScale", "renderScale", "number");
  bindViewerSetting("rbvSettingAntialias", "antialias", "checkbox");
  bindViewerSetting("rbvSettingShowGrid", "showGrid", "checkbox");
  bindViewerSetting("rbvSettingAutoRotate", "autoRotate", "checkbox");
  bindViewerSetting("rbvSettingShowAxes", "showAxes", "checkbox");
  bindViewerSetting("rbvSettingBackground", "background", "color");
  bindViewerSetting("rbvSettingControlsMode", "controlsMode", "select");
  bindViewerSetting("rbvSettingAutoHideSeconds", "autoHideSeconds", "number");
  $("rbvModelBottom").addEventListener("change", (event) => {
    applyModelBottom(event.currentTarget.value);
    saveSetup();
  });
  $("rbvSettingsReset").addEventListener("click", () => {
    const previous = viewerSettings;
    viewerSettings = normalizeViewerSettings(DEFAULT_VIEWER_SETTINGS);
    syncSettingsForm();
    applyViewerSettings(previous);
    saveViewerSettings();
  });
  $("rbvEditToggle").addEventListener("click", () => {
    const on = !root.classList.contains("rbv-editing");
    root.classList.toggle("rbv-editing", on);
    $("rbvEditToggle").setAttribute("aria-pressed", String(on));
    if (!on) closeAddForm();
  });
  $("rbvAddMechanism").addEventListener("click", () => { if ($("rbvMechAdd").hidden) openAddForm(); else closeAddForm(); });
  $("rbvCancelMechanism").addEventListener("click", closeAddForm);
  $("rbvNodeFilter").addEventListener("input", refreshNodeSelect);
  $("rbvMotionType").addEventListener("change", resetMechRange);
  $("rbvMechanismName").addEventListener("input", () => { nameTouched = true; });
  $("rbvNodeSelect").addEventListener("dblclick", addHighlighted);
  $("rbvSelAdd").addEventListener("click", addHighlighted);
  $("rbvSelAddAll").addEventListener("click", addAllMatches);
  $("rbvSelGrow").addEventListener("click", growSelection);
  $("rbvSelClear").addEventListener("click", () => { selection = []; renderSelection(); });
  $("rbvCreateMechanism").addEventListener("click", () => {
    if (!selection.length) { setStatus("Select at least one part ? click it in the view, or add it from the list.", { error: true }); return; }
    const nodes = selection.slice();
    if (editingPartsMechanismId) {
      const mech = mechanisms.find((item) => item.id === editingPartsMechanismId);
      if (!mech) { fail("That control no longer exists. Reopen its editor and try again."); closeAddForm(); return; }
      setMechanismParts(mech, nodes);
      closeAddForm(); renderMechanisms(); saveSetup();
      setStatus("Parts updated for " + mech.name);
      return;
    }
    const type = $("rbvMotionType").value, axis = $("rbvAxis").value;
    if (!addPivotEditor.valid()) { fail("Enter valid X, Y, and Z cursor coordinates."); return; }
    const range = Math.abs(Number($("rbvRange").value)) || (type === "rotate" ? 90 : nice(modelSize * 0.3));
    const name = $("rbvMechanismName").value.trim() || nodes[0];
    mechanisms.push({ id: "mech-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6), name, nodes, type, axis, range, value: 0, space: "world", pivotMode: addPivotEditor.mode.value, pivot: addPivotEditor.read() });
    backfillTimelineValues();
    closeAddForm(); renderMechanisms(); saveSetup();
  });
  $("rbvSavePreset").addEventListener("click", () => {
    const name = $("rbvPresetName").value.trim();
    if (!name) { setStatus("Enter a name for this pose.", { error: true }); return; }
    presets.push({ id: "pose-" + Date.now().toString(36), name: name.slice(0, 32), values: Object.fromEntries(mechanisms.map((m) => [m.id, Number(m.value) || 0])) });
    $("rbvPresetName").value = ""; renderPresets(); saveSetup();
  });
  $("rbvExportConfig").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(setupSnapshot(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = "pitbeacon-robot-viewer-setup.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("rbvImportConfig").addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.version !== 1) throw new Error("Unsupported setup version.");
      mechanisms = Array.isArray(data.mechanisms) ? data.mechanisms.map(normMech) : [];
      presets = Array.isArray(data.presets) ? data.presets : [];
      timeline = normalizeTimeline(data.timeline);
      savedTimelines = Array.isArray(data.timelines) && data.timelines.length ? data.timelines.map(normalizeTimeline) : [timeline];
      if (!savedTimelines.some((item) => item.id === timeline.id)) savedTimelines.unshift(timeline);
      activeTimelineId = savedTimelines.some((item) => item.id === data.activeTimelineId) ? data.activeTimelineId : timeline.id;
      timeline = savedTimelines.find((item) => item.id === activeTimelineId);
      backfillTimelineValues();
      timelineTime = 0;
      bases.clear(); renderMechanisms(); renderPresets();
      mechanisms.forEach((m) => { if (m.value) setMechanismValue(m, m.value); });
      await saveSetupNow(); setStatus("Setup imported");
    } catch (err) { fail("Could not import setup: " + err.message); }
    e.target.value = "";
  });


  // ───────── Pit Notes link: flag robot parts and jump to them from other cards ─────────
  const PART_COLORS = { flagged: 0xff4d4d, "in-progress": 0xffc933, pending: 0x6fa8ff, focus: 0x35e0c0 };
  const partMarkers = new Map(); // mech.id → { helper, box, objs }
  let markersDirty = false, focusedPartId = null, focusTimer = 0, partSummary = {};

  const partObjects = (mech) => (mech.nodes || []).map((label) => nodeMap.get(label)).filter(Boolean);

  function clearMarkers() {
    partMarkers.forEach((m) => { if (m.helper.parent) m.helper.parent.remove(m.helper); m.helper.geometry.dispose(); m.helper.material.dispose(); });
    partMarkers.clear();
  }
  function rebuildMarkers() {
    clearMarkers();
    if (!scene || !robotRoot) return;
    partSummary = summarizeParts(loadNotes());
    for (const mech of mechanisms) {
      const state = mech.id === focusedPartId ? "focus" : partSummary[mech.id]?.state;
      if (!state || state === "ok") continue;
      const objs = partObjects(mech);
      if (!objs.length) continue;
      const box = new THREE.Box3();
      const helper = new THREE.Box3Helper(box, PART_COLORS[state]);
      helper.material.depthTest = false;
      helper.material.transparent = true;
      helper.renderOrder = 999;
      helper.userData.rbvOverlay = true;
      scene.add(helper);
      partMarkers.set(mech.id, { helper, box, objs });
    }
    markersDirty = true;
    requestRender();
  }
  function refreshMarkerBoxes() {
    markersDirty = false;
    partMarkers.forEach((m) => {
      m.box.makeEmpty();
      m.objs.forEach((o) => m.box.expandByObject(o));
      m.helper.visible = !m.box.isEmpty();
    });
  }

  function publishParts() {
    setRobotParts(mechanisms.map((m) => ({ id: m.id, name: m.name })));
  }

  const STATUS_LABEL = { pending: "To do", "in-progress": "In progress", completed: "Done" };
  function renderPartNotes() {
    const rows = $("rbvMechanismList").querySelectorAll(".rbv-mech-row");
    const tasksByPart = {};
    loadNotes().tasks.forEach((t) => { if (t.partId) (tasksByPart[t.partId] ||= []).push(t); });
    mechanisms.forEach((mech, i) => {
      const row = rows[i];
      if (!row) return;
      row.dataset.partId = mech.id;
      row.querySelectorAll(".rbv-part-notes").forEach((old) => old.remove());
      row.classList.toggle("rbv-part-active", mech.id === focusedPartId);
      const open = (tasksByPart[mech.id] || []).filter((t) => t.status !== "completed");
      const box = el("div", { class: "rbv-part-notes" });
      open.forEach((task) => {
        const chip = el("button", {
          type: "button",
          class: "rbv-task-chip rbv-task-" + (task.flagged ? "flagged" : task.status),
          title: "Tap to change status",
          text: (task.flagged ? "⚑ " : "") + (task.task || "Untitled task") + " · " + STATUS_LABEL[task.status],
        });
        chip.addEventListener("click", () => {
          const next = TASK_STATUSES[(TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length];
          updateItem("tasks", task.id, { status: next });
        });
        box.append(chip);
      });
      const input = el("input", { type: "text", class: "rbv-part-input", placeholder: "Note an issue on " + mech.name + "…", "aria-label": "New task for " + mech.name, maxlength: "120" });
      const add = () => {
        const text = input.value.trim();
        if (!text) return;
        addItem("tasks", { task: text, component: mech.name, partId: mech.id, status: "pending", flagged: false });
        input.value = "";
      };
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
      box.append(el("div", { class: "rbv-part-add" }, input, el("button", { type: "button", class: "rbv-btn", text: "Add task", onclick: add })));
      row.append(box);
    });
  }

  function onMechanismsRendered() {
    publishParts();
    renderPartNotes();
    rebuildMarkers();
  }
  function onNotesChanged() {
    if (!mechanisms.length) return;
    // Rebuild rows without clobbering a half-typed task.
    const typing = document.activeElement && document.activeElement.classList.contains("rbv-part-input") ? document.activeElement : null;
    if (typing && typing.value) { rebuildMarkers(); return; }
    renderPartNotes();
    rebuildMarkers();
  }
  window.addEventListener(NOTES_EVENT, onNotesChanged);
  window.addEventListener("storage", (e) => { if (e.key === NOTES_KEY || e.key === null) onNotesChanged(); });

  function focusPart(partId, opts = {}) {
    const mech = mechanisms.find((m) => m.id === partId);
    if (!mech || !robotRoot) return false;
    const objs = partObjects(mech);
    focusedPartId = mech.id;
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => { focusedPartId = null; renderPartNotes(); rebuildMarkers(); }, 6000);
    if (objs.length) {
      const box = new THREE.Box3();
      objs.forEach((o) => box.expandByObject(o));
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z, 1e-3);
        target.copy(box.getCenter(new THREE.Vector3()));
        dist = clamp((maxDim * 1.6) / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), minDist, maxDist);
        autoFit = false;
        updateCamera();
      }
    }
    if (opts.openPanel !== false) {
      setDrawer(true);
      renderPartNotes();
      const row = $("rbvMechanismList").querySelector('[data-part-id="' + CSS.escape(mech.id) + '"]');
      if (row) row.scrollIntoView({ block: "nearest" });
    }
    rebuildMarkers();
    setStatus(mech.name + (partSummary[mech.id] ? " · " + partSummary[mech.id].open + " open" : ""));
    return true;
  }

  function tapForPart(cx, cy) {
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    camera.updateMatrixWorld();
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, camera);
    const hit = rc.intersectObject(robotRoot, true).find((h) => h.object.isMesh && !h.object.userData.rbvOverlay);
    if (!hit) return;
    for (let n = hit.object; n && n !== robotRoot.parent; n = n.parent) {
      const label = n.userData && n.userData.rbvLabel;
      if (!label) continue;
      const mech = mechanisms.find((m) => m.nodes.includes(label));
      if (mech) { focusPart(mech.id); return; }
    }
  }

  const THEME_VARS = ["--text-primary", "--text-muted", "--border", "--accent", "--bg-input"];
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== window.parent) return;
    const data = event.data;
    if (!data || data.source !== "pitbeacon") return;
    if (data.type === "focus-part") focusPart(String(data.partId || ""));
    else if (data.type === "theme" && data.vars) {
      THEME_VARS.forEach((name) => { if (typeof data.vars[name] === "string") document.documentElement.style.setProperty(name, data.vars[name]); });
    }
  });
  window.parent?.postMessage({ source: "pitbeacon-viewer", type: "ready" }, location.origin);

  // Another card asked to jump to a part before the model finished loading.
  let pendingFocus = null;
  window.addEventListener("message", (event) => {
    if (event.origin === location.origin && event.data?.source === "pitbeacon" && event.data.type === "focus-part" && !robotRoot) pendingFocus = String(event.data.partId || "");
  });
  const applyPendingFocus = () => { if (pendingFocus && focusPart(pendingFocus)) pendingFocus = null; };

  // ───────── Start: fetch 3D libs and the saved model in parallel ─────────
  (async function init() {
    await loadViewerSettings();
    applyUiState();
    const libs = ensureThree().catch((e) => e);
    const [, saved] = await Promise.all([loadSetup(), dbGet("models", "last").catch(() => null)]);
    if (saved && saved.files && saved.files.length) {
      await loadModel(saved.files, false);
      applyPendingFocus();
    } else {
      const r = await libs;
      if (r instanceof Error) fail(r.message);
    }
  })();
