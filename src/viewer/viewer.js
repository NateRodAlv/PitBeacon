import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { sdk } from "./sdkShim.js";
import { setRobotParts } from "../data/robotParts.js";
import { DETAIL_CONNECTOR_CAP, PART_ROW_LIMIT, connectorsForPart, countConnectorsByPart, filterAndSortParts, filterConnectors } from "./partBrowser.js";
import { NOTES_EVENT, NOTES_KEY, TASK_STATUSES, addItem, loadNotes, saveNotes, summarizeParts, updateItem } from "../data/pitNotes.js";
import { parseURDF } from "./urdf.js";
import { icon } from "../lib/icons.js";
import "./viewer.css";

// Since r155 lights are physically based; legacy intensities need x PI to look the same.
const LIGHT_SCALE = Math.PI;


  // ───────── Helpers ─────────
  const $ = (id) =>
    document.getElementById(id) || window.parent.document.getElementById(id);
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
      displayStyle: ["solid", "edges", "wireframe", "xray", "blueprint"].includes(settings.displayStyle) ? settings.displayStyle : DEFAULT_VIEWER_SETTINGS.displayStyle,
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
    const side = robotRoot.userData.rbvURDF
      ? {
          bottom: new THREE.Vector3(0, 0, -1),
          top: new THREE.Vector3(0, 0, 1),
          front: new THREE.Vector3(1, 0, 0),
          back: new THREE.Vector3(-1, 0, 0),
          left: new THREE.Vector3(0, 1, 0),
          right: new THREE.Vector3(0, -1, 0),
        }[modelBottom]
      : {
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
  const drawer = $("rbvSetup"), infoEl = $("rbvModelInfo");
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
    if (renderer) requestRender();
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
      req.onsuccess = () => {
        const db = req.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };
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
  let gridOn = !!viewerSettings.showGrid, gridFor = null, lastAutoRotateFrame = 0;

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

  function renderNow() {
    if (!renderer) return;
    if (viewerSettings.autoRotate && robotRoot) {
      const now = performance.now();
      if (lastAutoRotateFrame) {
        yaw += Math.min(Math.max((now - lastAutoRotateFrame) / 1000, 0), 0.05) * 0.35;
      }
      lastAutoRotateFrame = now;
    } else {
      lastAutoRotateFrame = 0;
    }
    updateCamera();
    if (markersDirty) refreshMarkerBoxes();
    renderer.render(scene, camera);
    if (viewerSettings.autoRotate && robotRoot) requestRender();
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
    let tap = null;
    const panBy = (dx, dy) => {
      const b = viewBasis();
      const s = (dist * 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(1, stage.clientHeight);
      target.addScaledVector(b.right, -dx * s).addScaledVector(b.up, dy * s);
    };
    const zoomBy = (f) => { dist = clamp(dist * f, minDist, maxDist); };
    canvas.addEventListener("pointerdown", (e) => {
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      if (pts.size === 0) tap = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), ok: e.button === 0 };
      else if (tap) tap.ok = false;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    canvas.addEventListener("pointermove", (e) => {
      const p = pts.get(e.pointerId); if (!p) return;
      const nx = e.clientX, ny = e.clientY;
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
  let mechanisms = [], presets = [], editingMechanismId = null;
  const bases = new Map();      // mech.id → rest transform of its node (kept out of saved JSON)
  const mechUI = new Map();     // mech.id → { slider, out }
  let modelName = "", modelSize = 1, usingBundledExample = false;

  function collectNodes(rootObj) {
    nodeMap = new Map(); nodeList = [];
    const used = new Map(), named = [];
    (function walk(o, depth) {
      const name = o.userData.rbvInternal ? "" : (o.name || "").trim();
      if (name) {
        const n = (used.get(name) || 0) + 1; used.set(name, n);
        const label = n === 1 ? name : name + " (" + n + ")";
        nodeMap.set(label, o); o.userData.rbvLabel = label;
        if (o !== rootObj) named.push({ label, depth, object: o });
      }
      for (let i = 0; i < o.children.length; i++) walk(o.children[i], depth + (name ? 1 : 0));
    })(rootObj, 0);
    const hasUrdfParts = named.some(({ object }) => object.userData.rbvPart);
    const hasMesh = (object) => {
      let found = false;
      object.traverse((child) => { if (child.isMesh && child.geometry && !child.userData.rbvInternal) found = true; });
      return found;
    };
    const hasNamedDescendant = (object) => named.some(({ object: child }) => child !== object && isAncestorOf(object, child));
    nodeList = named.filter(({ object }) => hasUrdfParts
      ? object.userData.rbvPart
      : hasMesh(object) && !hasNamedDescendant(object))
      .map(({ label, depth, object }) => {
        object.userData.rbvPart = true;
        return { label, depth, group: false };
      });
    if (!hasUrdfParts) {
      let generated = 0;
      rootObj.traverse((object) => {
        if (!object.isMesh || !object.geometry || object.userData.rbvInternal) return;
        for (let parent = object; parent && parent !== rootObj; parent = parent.parent) {
          if (parent.userData.rbvPart) return;
        }
        let label = object.userData.rbvLabel;
        if (!label) {
          do { label = "Part " + (++generated); } while (nodeMap.has(label));
          object.name = label;
          object.userData.rbvLabel = label;
          nodeMap.set(label, object);
        }
        object.userData.rbvPart = true;
        nodeList.push({ label, depth: 0, group: false });
      });
    }
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
    const visibleMeshes = new Set(kept.map((entry) => entry.mesh));
    nodeList = nodeList.filter(({ label }) => {
      const part = nodeMap.get(label);
      const geometryRoot = part?.userData.rbvVisuals || part;
      let visible = false;
      geometryRoot?.traverse((object) => { if (visibleMeshes.has(object)) visible = true; });
      return visible;
    });

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
      material = new THREE.MeshBasicMaterial({ side: base.side, color: 0x09243b });
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
        if (style === "blueprint") return styleMaterial(mat, style);
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
    if (files.some((file) => /\.urdf$/i.test(file.name))) {
      return { ...(await parseURDF(files)), format: "urdf" };
    }
    const main = files.find((f) => /\.glb$/i.test(f.name)) || files.find((f) => /\.gltf$/i.test(f.name));
    if (!main) throw new Error("Choose a .urdf, .glb, or .gltf file.");
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
        files.forEach((f) => {
          if (f === main) return;
          const url = URL.createObjectURL(new Blob([f.buffer]));
          urls.set(f.name.toLowerCase(), url);
          urls.set(f.name.split(/[\\/]/).pop().toLowerCase(), url);
        });
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
      if (persist && usingBundledExample) {
        mechanisms = [];
        presets = [];
        usingBundledExample = false;
      }
      const legacyPartIds = new Map(mechanisms
        .filter((connector) => connector.source === "legacy" && connector.nodes.length === 1)
        .map((connector) => [connector.id, connector.nodes[0]]));

      disposeRobot();
      mechanisms.forEach((connector) => {
        connector.motion = null;
        connector._motion = null;
        connector._frame = null;
        connector._part = null;
      });
      if (gltf.format === "urdf") {
        const manual = mechanisms.filter((connector) => connector.source === "manual");
        const saved = new Map(mechanisms.filter((connector) => connector.source === "urdf").map((connector) => [connector.id, connector]));
        mechanisms = gltf.connectors.map((connector) => {
          const previous = saved.get(connector.id);
          return {
            ...connector,
            name: previous?.name || connector.name,
            value: Number(previous?.value) || connector.value,
            motion: connector.motion,
            _motion: connector.motion,
          };
        }).concat(manual);
      }
      bases.clear();
      robotRoot = sceneRoot;
      scene.add(robotRoot);
      (gltf.connectors || []).forEach((connector) => nodeMap.set(connector.id, connector.motion));
      modelSize = Math.max(info.box.getSize(new THREE.Vector3()).length() / 1.7, 1e-3);
      (gltf.connectorFrames || []).forEach((frame) => {
        const axes = new THREE.AxesHelper(modelSize * 0.045);
        axes.userData.rbvInternal = true;
        frame.add(axes);
      });
      mechanisms.filter((connector) => connector.source === "manual").forEach(attachManualConnector);
      modelBox = info.box;
      applyModelBottom(modelBottom);
      modelName = (files.find((f) => /\.(urdf|glb|gltf)$/i.test(f.name)) || files[0]).name.split(/[\\/]/).pop();
      applyStyle(info.meshes);
      emptyEl.style.display = "none";
      infoEl.textContent = modelName + " · " + info.parts + " parts · " + (info.tris / 1000).toFixed(info.tris > 99999 ? 0 : 1) + "k triangles" + (info.hidden ? " · " + info.hidden + " tiny parts hidden" : "");
      resetMechRange();
      renderSelection();
      renderMechanisms();
      migrateLegacyNotes(legacyPartIds);
      mechanisms.forEach((m) => {
        if (m.motion) m._motion = m.motion;
      });
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
    if (!arr.some((f) => /\.(urdf|glb|gltf)$/i.test(f.name))) { fail("Choose a .urdf, .glb, or .gltf file."); return; }
    const files = await Promise.all(arr.map(async (f) => ({ name: f.webkitRelativePath || f.name, buffer: await f.arrayBuffer() })));
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

  function setMechanismValue(mech, value, silent) {
    markersDirty = true;
    mech.value = clamp(Number(value) || 0, Number.isFinite(mech.min) ? mech.min : -Infinity, Number.isFinite(mech.max) ? mech.max : Infinity);
    const ui = mechUI.get(mech.id);
    if (ui) { ui.slider.value = mech.value; ui.out.textContent = formatValue(mech); }
    if (mech.jointType === "fixed") return;
    const objs = mech._motion ? [mech._motion] : (mech.nodes || []).map((l) => nodeMap.get(l)).filter(Boolean);
    if (!objs.length) return;
    let st = bases.get(mech.id);
    if (!st) {
      st = { items: [], pivot: null };
      objs.forEach((o) => { o.updateMatrix(); st.items.push({ obj: o, local: o.matrix.clone(), p: o.position.toArray(), q: o.quaternion.clone(), r: [o.rotation.x, o.rotation.y, o.rotation.z] }); });
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
      if (mech.space === "mate") {
        const axis = new THREE.Vector3(...(mech.axisVector || [1, 0, 0])).normalize();
        if (mech.type === "rotate") {
          o.position.fromArray(it.p);
          o.quaternion.copy(it.q).multiply(new THREE.Quaternion().setFromAxisAngle(axis, rad));
        } else {
          o.position.fromArray(it.p).addScaledVector(axis.clone().applyQuaternion(it.q), mech.value);
          o.quaternion.copy(it.q);
        }
        return;
      }
      if (mech.space === "local") {
        if (mech.type === "rotate") { const r = it.r.slice(); r[idx] += rad; o.rotation.set(r[0], r[1], r[2]); }
        else { const p = it.p.slice(); p[idx] += mech.value; o.position.set(p[0], p[1], p[2]); }
        return;
      }
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

  function attachManualConnector(connector) {
    const partId = connector.partId || connector.nodes?.[0];
    const part = nodeMap.get(partId);
    if (!part || !part.parent) return false;
    const parent = part.parent;
    const frame = new THREE.Object3D();
    frame.name = "__manual_mate_frame__" + connector.id;
    frame.userData.rbvInternal = true;
    frame.position.copy(part.position);
    frame.quaternion.copy(part.quaternion);
    frame.scale.copy(part.scale);
    const motion = new THREE.Object3D();
    motion.name = "__manual_mate_motion__" + connector.id;
    motion.userData.rbvInternal = true;
    const axes = new THREE.AxesHelper(modelSize * 0.045);
    axes.userData.rbvInternal = true;
    frame.add(axes, motion);
    parent.remove(part);
    parent.add(frame);
    motion.add(part);
    part.position.set(0, 0, 0);
    part.quaternion.identity();
    part.scale.set(1, 1, 1);
    connector.partId = partId;
    connector.nodes = [partId];
    connector.space = "mate";
    connector._frame = frame;
    connector._part = part;
    connector._motion = motion;
    bases.delete(connector.id);
    robotRoot.updateMatrixWorld(true);
    return true;
  }

  function detachManualConnector(connector) {
    const frame = connector._frame;
    const part = connector._part;
    if (!frame?.parent || !part) return;
    const parent = frame.parent;
    parent.remove(frame);
    parent.add(part);
    part.position.copy(frame.position);
    part.quaternion.copy(frame.quaternion);
    part.scale.copy(frame.scale);
    connector._frame = null;
    connector._part = null;
    connector._motion = null;
  }

  function makeMechanismEditor(mech) {
    const type = el("select", null, el("option", { value: "translate", text: "Linear travel" }), el("option", { value: "rotate", text: "Rotation" }));
    const axis = el("select", null, ...["x", "y", "z"].map((v) => el("option", { value: v, text: v.toUpperCase() })));
    type.value = mech.type; axis.value = mech.axis;
    const range = el("input", { type: "number", min: "0.000001", step: "any", value: String(Math.abs(Number(mech.range)) || 1) });
    return el("div", { class: "rbv-mech-editor rbv-edit-only" },
      el("label", { text: "Connector motion" }, type),
      el("label", { text: "Local axis" }, axis),
      el("label", { text: "Travel (units / degrees)" }, range),
      el("div", { class: "rbv-actions" },
        el("button", { type: "button", class: "rbv-btn", text: "Save", onclick: () => {
          const nextRange = Number(range.value);
          if (!Number.isFinite(nextRange) || nextRange <= 0) { fail("Enter a range greater than zero."); return; }
          setMechanismValue(mech, 0, true);
          mech.type = type.value;
          mech.axis = axis.value;
          mech.axisVector = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[axis.value];
          mech.range = nextRange;
          mech.min = -nextRange;
          mech.max = nextRange;
          mech.value = 0;
          bases.delete(mech.id); editingMechanismId = null; renderMechanisms(); saveSetup();
          setStatus("Connector updated; its slider was reset to zero.");
        } }),
        el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "Cancel", onclick: () => { editingMechanismId = null; renderMechanisms(); } })));
  }

  function renderMechanisms() {
    onMechanismsRendered();
  }
  function connectorRow(mech) {
    const motionNode = mech._motion || mech.motion || mech.partId && nodeMap.get(mech.partId);
    const present = !robotRoot || Boolean(motionNode) || mech.nodes.some((l) => nodeMap.has(l));
    const what = mech.partId || (mech.nodes.length === 1 ? mech.nodes[0] : mech.nodes.length + " parts (" + mech.nodes.slice(0, 2).join(", ") + (mech.nodes.length > 2 ? ", …" : "") + ")");
    const range = Math.abs(mech.range) || 1;
    const axisLabel = mech.axisVector
      ? mech.axisVector.map((value) => Number(value).toFixed(2)).join(", ")
      : String(mech.axis || "x").toUpperCase();
    const connectorDetails = [what, mech.jointType || (mech.type === "rotate" ? "rotation" : "travel"), mech.jointType === "fixed" ? "" : "axis " + axisLabel, present ? "" : "not in this model"].filter(Boolean).join(" · ");
    const slider = el("input", { type: "range", min: String(Number.isFinite(mech.min) ? mech.min : -range), max: String(Number.isFinite(mech.max) ? mech.max : range), step: range / 200, value: mech.value || 0, "aria-label": mech.name });
    if (mech.jointType === "fixed") slider.disabled = true;
    if (!present) slider.disabled = true;
    const out = el("output", { text: formatValue(mech) });
    slider.addEventListener("input", () => { setMechanismValue(mech, slider.value); saveSetup(); });
    const row = el("div", { class: "rbv-mech-row" + (present ? "" : " missing") },
      el("div", { class: "rbv-mech-head" },
        el("div", null,
          el("div", { class: "rbv-mech-name", text: mech.name }),
          el("div", { class: "rbv-mech-node", text: connectorDetails })),
        el("div", { class: "rbv-mech-actions" },
          el("button", { type: "button", class: "rbv-btn", text: "Zero", onclick: () => { setMechanismValue(mech, 0); saveSetup(); } }),
          mech.source !== "urdf" && mech.jointType !== "fixed" ? el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "Edit", onclick: () => { editingMechanismId = editingMechanismId === mech.id ? null : mech.id; renderMechanisms(); } }) : null,
          el("button", { type: "button", class: "rbv-btn rbv-edit-only", text: "×", "aria-label": "Remove", onclick: () => {
            if (bases.has(mech.id)) setMechanismValue(mech, 0);
            if (mech.source === "manual") detachManualConnector(mech);
            mechanisms = mechanisms.filter((m) => m.id !== mech.id); bases.delete(mech.id); editingMechanismId = null; renderMechanisms(); saveSetup();
          } }))),
      el("div", { class: "rbv-range-line" }, slider, out));
    if (editingMechanismId === mech.id) row.append(makeMechanismEditor(mech));
    mechUI.set(mech.id, { slider, out });
    return row;
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

  // ───────── Saving the setup (viewer settings live separately) ─────────
  let saveTimer = 0;
  const saveSetup = () => { clearTimeout(saveTimer); saveTimer = setTimeout(saveSetupNow, 400); };
  const setupSnapshot = () => ({
    version: 2,
    modelName,
    modelBottom,
    connectors: mechanisms.map((connector) => ({
      id: connector.id,
      name: connector.name,
      nodes: connector.nodes,
      partId: connector.partId,
      source: connector.source,
      jointType: connector.jointType,
      space: connector.space,
      pivotMode: connector.pivotMode,
      pivot: connector.pivot,
      type: connector.type,
      axis: connector.axis,
      axisVector: connector.axisVector,
      range: connector.range,
      min: connector.min,
      max: connector.max,
      value: connector.value,
    })),
    presets,
  });
  function normMech(m) {
    m = Object.assign({}, m);
    if (!Array.isArray(m.nodes)) { m.nodes = m.node ? [m.node] : []; m.space = "local"; } // first-version controls keep their original behaviour
    delete m.node;
    m.source = ["urdf", "manual"].includes(m.source) ? m.source : "legacy";
    if (m.source === "manual") m.partId = String(m.partId || m.nodes[0] || "");
    m.space = m.space || "world"; m.pivotMode = ["center", "origin", "cursor"].includes(m.pivotMode) ? m.pivotMode : "center";
    m.pivot = Array.isArray(m.pivot) && m.pivot.length >= 3 ? m.pivot.slice(0, 3).map((v) => Number.isFinite(Number(v)) ? Number(v) : 0) : [0, 0, 0];
    m.type = m.type === "rotate" ? "rotate" : "translate"; m.axis = AXIS[m.axis] === undefined ? "x" : m.axis;
    m.range = Math.abs(Number(m.range)) || 1;
    if (Array.isArray(m.axisVector) && m.axisVector.length === 3 && m.axisVector.every((value) => Number.isFinite(Number(value)))) {
      const axis = m.axisVector.map(Number);
      const length = Math.hypot(...axis);
      m.axisVector = length ? axis.map((value) => value / length) : [1, 0, 0];
    }
    if (Number.isFinite(Number(m.min))) m.min = Number(m.min);
    if (Number.isFinite(Number(m.max))) m.max = Number(m.max);
    if (m.source === "manual") m.space = "mate";
    return m;
  }
  async function saveSetupNow() {
    const setup = setupSnapshot();
    try { if (sdk.storage && sdk.storage.set) await sdk.storage.set("robotViewerSetup", setup); } catch (_) {}
    try { localStorage.setItem("pitbeaconRobotViewerSetup", JSON.stringify(setup)); } catch (_) {}
  }
  async function loadSetup(useExample = false) {
    let setup = null;
    try { if (sdk.storage && sdk.storage.get) setup = await sdk.storage.get("robotViewerSetup"); } catch (_) {}
    if (!setup) { try { setup = JSON.parse(localStorage.getItem("pitbeaconRobotViewerSetup") || "null"); } catch (_) {} }
    if (!setup && useExample) {
      const response = await fetch(new URL("examples/robot-viewer-demo.json", document.baseURI));
      if (!response.ok) throw new Error("Could not load the example robot viewer setup.");
      setup = await response.json();
    }
    if (setup && [1, 2].includes(setup.version)) {
      const savedConnectors = setup.version === 2 ? setup.connectors : setup.mechanisms;
      mechanisms = Array.isArray(savedConnectors) ? savedConnectors.map(normMech) : [];
      presets = Array.isArray(setup.presets) ? setup.presets : [];
    }
    modelBottom = normalizeModelBottom(setup && setup.modelBottom ? setup.modelBottom : modelBottom);
    const bottomSelect = $("rbvModelBottom");
    if (bottomSelect) bottomSelect.value = modelBottom;
    if (robotRoot) applyModelBottom(modelBottom, true);
    renderMechanisms(); renderPresets();
  }

  // ───────── Part selection: click in the view, pick from the list, or filter → add all matches ─────────
  let selection = [], hlObjects = [], hlMat = null, nameTouched = false;
  const isAncestorOf = (a, b) => { for (let p = b.parent; p; p = p.parent) if (p === a) return true; return false; };

  function addToSelection(label) {
    const o = nodeMap.get(label);
    if (!o || !nodeList.some((part) => part.label === label) || selection.includes(label)) return false;
    selection = [label];
    return true;
  }

  function renderSelection() {
    hlObjects.forEach((o) => { if (o.parent) o.parent.remove(o); });
    hlObjects = [];
    if (robotRoot && selection.length) {
      hlMat = hlMat || new THREE.MeshBasicMaterial({ color: 0x4da3ff, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      outer: for (const l of selection) {
        const o = nodeMap.get(l); if (!o) continue;
        const stack = [o.userData.rbvVisuals || o];
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
    if (!nameTouched) $("rbvMechanismName").value = selection.length ? selection[0] : "New connector";
    requestRender();
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
    for (let n = hit.object; n && n !== robotRoot.parent; n = n.parent) {
      const label = n.userData.rbvLabel;
      if (!label || !nodeList.some((part) => part.label === label)) continue;
      if (selection.includes(label)) selection = [];
      else addToSelection(label);
      renderSelection();
      return;
    }
    setStatus("That part has no name in the model, so it can't be selected.");
  }

  function addHighlighted() {
    const v = selectedPartId;
    if (!v || !nodeMap.has(v)) { setStatus("Pick a part from the list first."); return; }
    addToSelection(v); renderSelection();
  }
  function openAddForm() {
    if (!robotRoot) { setStatus("Load a model first"); return; }
    $("rbvCreateMechanism").textContent = "Create connector";
    nameTouched = false; selection = [];
    $("rbvMechAdd").hidden = false;
    renderSelection(); resetMechRange();
  }
  function closeAddForm() {
    $("rbvCreateMechanism").textContent = "Create connector";
    $("rbvMechAdd").hidden = true;
    selection = []; renderSelection();
  }

  // ───────── Wiring ─────────
  ["rbvFile", "rbvFolder"].forEach((id) => $(id).addEventListener("change", async (e) => {
    const files = e.target.files; if (!files || !files.length) return;
    $("rbvLoadMenu").open = false;
    try { await readFiles(files); } finally { e.target.value = ""; }
  }));
  ["dragover", "drop"].forEach((t) => stage.addEventListener(t, (e) => {
    e.preventDefault();
    if (t === "drop" && e.dataTransfer && e.dataTransfer.files.length) readFiles(e.dataTransfer.files);
  }));
  $("rbvHome").addEventListener("click", () => { yaw = 0.7; pitch = 0.45; autoFit = true; fitModel(); });
  function setDrawer(open, notifyParent = true) {
    if (open === drawerOpen) return;
    drawerOpen = open;
    drawer.hidden = !open;
    $("rbvSetupToggle").setAttribute("aria-expanded", String(open));
    if (!open) {
      drawer.classList.remove("rbv-editing");
      $("rbvEditToggle").setAttribute("aria-pressed", "false");
      closeAddForm();
    }
    if (notifyParent) {
      window.parent.postMessage(
        {
          source: "pitbeacon-viewer",
          type: open ? "floating-window-open" : "floating-window-close",
          panelId: "rbvSetup",
        },
        location.origin,
      );
    }
    revealed = true; applyUiState();
    requestRender();
  }
  function setSettingsMenu(open, notifyParent = true) {
    if (open === settingsOpen) return;
    settingsOpen = open;
    settingsPanel.hidden = !open;
    $("rbvSettingsToggle").setAttribute("aria-expanded", String(open));
    if (notifyParent) {
      window.parent.postMessage(
        {
          source: "pitbeacon-viewer",
          type: open ? "floating-window-open" : "floating-window-close",
          panelId: "rbvSettingsPanel",
        },
        location.origin,
      );
    }
    revealed = true; applyUiState();
  }
  $("rbvSetupToggle").addEventListener("click", () => setDrawer(!drawerOpen));
  $("rbvSettingsToggle").addEventListener("click", () => setSettingsMenu(!settingsOpen));
  window.addEventListener("message", (event) => {
    if (
      event.origin !== location.origin ||
      event.source !== window.parent ||
      event.data?.source !== "pitbeacon" ||
      event.data?.type !== "viewer-floating-window-closed"
    ) {
      return;
    }
    if (event.data.panelId === "rbvSetup") setDrawer(false, false);
    if (event.data.panelId === "rbvSettingsPanel") setSettingsMenu(false, false);
  });
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
    const on = !drawer.classList.contains("rbv-editing");
    drawer.classList.toggle("rbv-editing", on);
    $("rbvEditToggle").setAttribute("aria-pressed", String(on));
    if (!on) closeAddForm();
  });
  $("rbvAddMechanism").addEventListener("click", () => { if ($("rbvMechAdd").hidden) openAddForm(); else closeAddForm(); });
  $("rbvCancelMechanism").addEventListener("click", closeAddForm);
  $("rbvMotionType").addEventListener("change", resetMechRange);
  $("rbvMechanismName").addEventListener("input", () => { nameTouched = true; });
  $("rbvSelAdd").addEventListener("click", addHighlighted);
  $("rbvSelClear").addEventListener("click", () => { selection = []; renderSelection(); });
  $("rbvCreateMechanism").addEventListener("click", () => {
    if (selection.length !== 1) { setStatus("Select one individual part from the model.", { error: true }); return; }
    const partId = selection[0];
    const type = $("rbvMotionType").value, axis = $("rbvAxis").value;
    if (mechanisms.some((connector) => connector.source === "manual" && connector.partId === partId)) {
      fail("That part already has a manual connector.");
      return;
    }
    const range = Math.abs(Number($("rbvRange").value)) || (type === "rotate" ? 90 : nice(modelSize * 0.3));
    const name = $("rbvMechanismName").value.trim() || partId;
    const connector = {
      id: "mate-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      name,
      nodes: [partId],
      partId,
      type,
      axis,
      axisVector: { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[axis],
      range,
      min: -range,
      max: range,
      value: 0,
      space: "mate",
      source: "manual",
    };
    if (!attachManualConnector(connector)) {
      fail(`Could not attach a connector to "${partId}".`);
      return;
    }
    mechanisms.push(connector);
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
      if (![1, 2].includes(data.version)) throw new Error("Unsupported setup version.");
      mechanisms.forEach((connector) => {
        if (bases.has(connector.id)) setMechanismValue(connector, 0, true);
      });
      mechanisms.filter((connector) => connector.source === "manual").forEach(detachManualConnector);
      const savedConnectors = data.version === 2 ? data.connectors : data.mechanisms;
      mechanisms = Array.isArray(savedConnectors) ? savedConnectors.map(normMech) : [];
      bases.clear();
      mechanisms.forEach((connector) => {
        if (connector.source === "urdf") {
          connector.motion = nodeMap.get(connector.id);
          connector._motion = connector.motion;
        } else if (connector.source === "manual" && robotRoot) {
          attachManualConnector(connector);
        }
      });
      presets = Array.isArray(data.presets) ? data.presets : [];
      mechanisms.forEach((connector) => {
        if (connector.value) setMechanismValue(connector, connector.value, true);
      });
      renderMechanisms(); renderPresets();
      await saveSetupNow(); setStatus("Setup imported");
    } catch (err) { fail("Could not import setup: " + err.message); }
    e.target.value = "";
  });


  // ───────── Pit Notes link: flag robot parts and jump to them from other cards ─────────
  const PART_COLORS = { flagged: 0xff4d4d, "in-progress": 0xffc933, pending: 0x6fa8ff, focus: 0x35e0c0 };
  const partMarkers = new Map(); // part id → { helper, box, objs }
  let markersDirty = false, focusedPartId = null, focusTimer = 0, partSummary = {};

  const partObjects = (partId) => {
    const part = nodeMap.get(partId);
    return part ? [part.userData.rbvVisuals || part] : [];
  };

  function clearMarkers() {
    partMarkers.forEach((m) => { if (m.helper.parent) m.helper.parent.remove(m.helper); m.helper.geometry.dispose(); m.helper.material.dispose(); });
    partMarkers.clear();
  }
  function rebuildMarkers() {
    clearMarkers();
    if (!scene || !robotRoot) return;
    partSummary = summarizeParts(loadNotes());
    for (const part of nodeList) {
      const state = part.label === focusedPartId ? "focus" : partSummary[part.label]?.state;
      if (!state || state === "ok") continue;
      const objs = partObjects(part.label);
      if (!objs.length) continue;
      const box = new THREE.Box3();
      const helper = new THREE.Box3Helper(box, PART_COLORS[state]);
      helper.material.depthTest = false;
      helper.material.transparent = true;
      helper.renderOrder = 999;
      helper.userData.rbvOverlay = true;
      scene.add(helper);
      partMarkers.set(part.label, { helper, box, objs });
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
    setRobotParts(nodeList.map((part) => ({ id: part.label, name: part.label })));
  }

  function migrateLegacyNotes(legacyPartIds) {
    if (!legacyPartIds.size) return;
    const availableParts = new Set(nodeList.map((part) => part.label));
    const notes = loadNotes();
    let changed = false;
    for (const section of ["tasks", "parts"]) {
      for (const note of notes[section]) {
        const partId = legacyPartIds.get(note.partId);
        if (!partId || !availableParts.has(partId)) continue;
        note.partId = partId;
        if (section === "tasks") note.component = partId;
        changed = true;
      }
    }
    if (changed) saveNotes(notes);
  }

  const STATUS_LABEL = { pending: "To do", "in-progress": "In progress", completed: "Done" };

  // ───────── Parts / Connectors browser (master list + detail for the selected item) ─────────
  let browserTab = "parts", browserQuery = "", selectedPartId = null, selectedConnectorId = null;
  let detailKey = "", taskChipsBox = null;

  const partLabels = () => nodeList.map((part) => part.label);
  const rowSelector = (attr, id) => "[" + attr + '="' + CSS.escape(id) + '"]';

  function partRowEl(row) {
    const sel = row.label === selectedPartId;
    const meta = el("span", { class: "rbv-row-meta" });
    if (row.connectors) {
      const mark = el("span", { class: "rbv-conn-mark", title: row.connectors + (row.connectors === 1 ? " connector affects" : " connectors affect") + " this part" });
      mark.innerHTML = icon("settings", 12);
      mark.append(document.createTextNode(String(row.connectors)));
      meta.append(mark);
    }
    if (row.open) meta.append(el("span", { class: "rbv-badge rbv-badge-" + row.state, title: row.open + " open · " + row.state, text: String(row.open) }));
    return el("button", { type: "button", role: "option", class: "rbv-row" + (sel ? " selected" : ""), "aria-selected": String(sel), "data-part-id": row.label },
      el("span", { class: "rbv-row-name", text: row.label }), meta);
  }
  function connectorRowEl(mech) {
    const sel = mech.id === selectedConnectorId;
    return el("button", { type: "button", role: "option", class: "rbv-row" + (sel ? " selected" : ""), "aria-selected": String(sel), "data-mech-id": mech.id },
      el("span", { class: "rbv-row-name", text: mech.name }),
      el("span", { class: "rbv-row-meta" }, el("span", { class: "rbv-conn-mark", text: (mech.jointType || (mech.type === "rotate" ? "rotation" : "travel")) + " " + formatValue(mech) })));
  }

  function renderBrowserList() {
    const list = $("rbvBrowserList");
    if (!list) return;
    const activeId = document.activeElement && list.contains(document.activeElement) ? document.activeElement.getAttribute("data-part-id") || document.activeElement.getAttribute("data-mech-id") : null;
    list.replaceChildren();
    list.setAttribute("aria-label", browserTab === "parts" ? "Parts" : "Connectors");
    let hidden = 0, empty = "";
    if (browserTab === "parts") {
      if (!nodeList.length) empty = "Load a model to see its individual parts.";
      else {
        const counts = countConnectorsByPart(mechanisms, partLabels());
        const args = { parts: nodeList, query: browserQuery, summary: partSummary, connectorCounts: counts, limit: PART_ROW_LIMIT };
        const res = filterAndSortParts(args);
        const rows = res.rows.slice();
        hidden = res.hiddenCount;
        if (selectedPartId && hidden && !rows.some((r) => r.label === selectedPartId)) {
          const extra = filterAndSortParts({ ...args, parts: nodeList.filter((p) => p.label === selectedPartId), limit: 1 }).rows[0];
          if (extra) { rows.push(extra); hidden -= 1; }
        }
        rows.forEach((row) => list.append(partRowEl(row)));
        if (!rows.length) empty = "No parts match.";
      }
    } else {
      const res = filterConnectors(mechanisms, browserQuery, PART_ROW_LIMIT);
      hidden = res.hiddenCount;
      res.rows.forEach((mech) => list.append(connectorRowEl(mech)));
      if (!res.rows.length) empty = mechanisms.length ? "No connectors match." : "No connectors yet. Import a URDF or add a connector to one part.";
    }
    if (empty) list.append(el("div", { class: "rbv-hint", text: empty }));
    if (hidden > 0) list.append(el("div", { class: "rbv-hint rbv-more", text: hidden + " more — keep typing to narrow" }));
    if (activeId) {
      const again = list.querySelector(rowSelector(browserTab === "parts" ? "data-part-id" : "data-mech-id", activeId));
      if (again) again.focus({ preventScroll: true });
    }
  }
  function markBrowserSelection() {
    const attr = browserTab === "parts" ? "data-part-id" : "data-mech-id";
    const id = browserTab === "parts" ? selectedPartId : selectedConnectorId;
    $("rbvBrowserList").querySelectorAll("[" + attr + "]").forEach((btn) => {
      const on = btn.getAttribute(attr) === id;
      btn.classList.toggle("selected", on);
      btn.setAttribute("aria-selected", String(on));
    });
  }

  function renderDetailTasks() {
    if (!taskChipsBox || !selectedPartId) return;
    const open = loadNotes().tasks.filter((t) => t.partId === selectedPartId && t.status !== "completed");
    taskChipsBox.replaceChildren();
    if (!open.length) { taskChipsBox.append(el("div", { class: "rbv-hint", text: "No open tasks." })); return; }
    open.forEach((task) => {
      const chip = el("button", {
        type: "button",
        class: "rbv-task-chip rbv-task-" + (task.flagged ? "flagged" : task.status),
        title: "Tap to change status",
      });
      if (task.flagged) chip.innerHTML = icon("flag", 12);
      chip.append(document.createTextNode((task.task || "Untitled task") + " · " + (STATUS_LABEL[task.status] || task.status)));
      chip.addEventListener("click", () => {
        const next = TASK_STATUSES[(TASK_STATUSES.indexOf(task.status) + 1) % TASK_STATUSES.length];
        updateItem("tasks", task.id, { status: next });
      });
      taskChipsBox.append(chip);
    });
  }

  function renderBrowserDetail() {
    const box = $("rbvBrowserDetail");
    if (!box) return;
    const prevInput = box.querySelector(".rbv-part-input");
    const keep = prevInput && prevInput.value && detailKey ? { key: detailKey, value: prevInput.value, focus: document.activeElement === prevInput } : null;
    box.replaceChildren();
    mechUI.clear(); taskChipsBox = null;
    const hint = (text) => box.append(el("div", { class: "rbv-hint", text }));
    if (browserTab === "connectors") {
      const mech = mechanisms.find((m) => m.id === selectedConnectorId);
      detailKey = mech ? "c:" + mech.id : "";
      if (!mech) { hint(mechanisms.length ? "Pick a connector from the list." : ""); return; }
      box.append(connectorRow(mech));
      if (mech.partId) box.append(el("div", { class: "rbv-actions" }, el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "Go to part", onclick: () => { if (!focusPart(mech.partId, { openPanel: false })) setStatus(mech.partId + " is not in this model."); } })));
      return;
    }
    const id = selectedPartId;
    detailKey = id ? "p:" + id : "";
    if (!id) { hint(nodeList.length ? "Pick a part from the list or tap it in the model." : ""); return; }
    box.append(el("div", { class: "rbv-detail-head" },
      el("div", { class: "rbv-mech-name", text: id }),
      el("button", { type: "button", class: "rbv-btn rbv-btn-ghost", text: "Show", onclick: () => focusPart(id, { openPanel: false }) })));
    const conns = connectorsForPart(mechanisms, id, DETAIL_CONNECTOR_CAP);
    if (conns.total) {
      const wrap = el("div", { class: "rbv-detail-section" }, el("div", { class: "rbv-detail-label", text: "Connectors" }));
      conns.items.forEach((mech) => wrap.append(connectorRow(mech)));
      if (conns.hiddenCount) wrap.append(el("div", { class: "rbv-hint", text: "+" + conns.hiddenCount + " more — see Connectors tab" }));
      box.append(wrap);
    }
    taskChipsBox = el("div", { class: "rbv-part-notes" });
    const input = el("input", { type: "text", class: "rbv-part-input", placeholder: "Note an issue on " + id + "…", "aria-label": "New task for " + id, maxlength: "120" });
    const add = () => {
      const text = input.value.trim();
      if (!text) return;
      addItem("tasks", { task: text, component: id, partId: id, status: "pending", flagged: false });
      input.value = "";
    };
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
    box.append(el("div", { class: "rbv-detail-section" },
      el("div", { class: "rbv-detail-label", text: "Tasks" }),
      taskChipsBox,
      el("div", { class: "rbv-part-add" }, input, el("button", { type: "button", class: "rbv-btn", text: "Add task", onclick: add }))));
    renderDetailTasks();
    if (keep && keep.key === detailKey) { input.value = keep.value; if (keep.focus) input.focus({ preventScroll: true }); }
  }

  function renderPartNotes() {
    if (!$("rbvBrowserList")) return;
    partSummary = summarizeParts(loadNotes());
    if (selectedPartId && !nodeList.some((p) => p.label === selectedPartId)) selectedPartId = null;
    if (selectedConnectorId && !mechanisms.some((m) => m.id === selectedConnectorId)) selectedConnectorId = null;
    renderBrowserList();
    renderBrowserDetail();
  }

  function setBrowserTab(tab) {
    if (tab === browserTab) return;
    browserTab = tab;
    browserQuery = "";
    const search = $("rbvBrowserSearch");
    search.value = "";
    search.placeholder = tab === "parts" ? "Search parts…" : "Search connectors…";
    $("rbvTabParts").classList.toggle("active", tab === "parts");
    $("rbvTabConnectors").classList.toggle("active", tab === "connectors");
    $("rbvTabParts").setAttribute("aria-selected", String(tab === "parts"));
    $("rbvTabConnectors").setAttribute("aria-selected", String(tab === "connectors"));
    renderBrowserList();
    renderBrowserDetail();
  }

  /** Select a part in the list (from a tap in the view, the host, or a row click). */
  function revealPart(partId) {
    const wasParts = browserTab === "parts";
    if (!wasParts) setBrowserTab("parts");
    const changed = selectedPartId !== partId;
    selectedPartId = partId;
    if (browserQuery && !partId.toLowerCase().includes(browserQuery.trim().toLowerCase())) {
      browserQuery = ""; $("rbvBrowserSearch").value = "";
      renderBrowserList();
    } else if (!wasParts || !$("rbvBrowserList").querySelector(rowSelector("data-part-id", partId))) renderBrowserList();
    else markBrowserSelection();
    if (changed || !detailKey) renderBrowserDetail();
    const row = $("rbvBrowserList").querySelector(rowSelector("data-part-id", partId));
    if (row) row.scrollIntoView({ block: "nearest" });
  }

  $("rbvBrowserSearch").addEventListener("input", (e) => { browserQuery = e.target.value; renderBrowserList(); });
  $("rbvTabParts").addEventListener("click", () => setBrowserTab("parts"));
  $("rbvTabConnectors").addEventListener("click", () => setBrowserTab("connectors"));
  $("rbvBrowserList").addEventListener("click", (e) => {
    const btn = e.target.closest("button.rbv-row");
    if (!btn) return;
    const partId = btn.getAttribute("data-part-id");
    if (partId != null) {
      if (!focusPart(partId, { openPanel: false })) { revealPart(partId); }
      return;
    }
    selectedConnectorId = btn.getAttribute("data-mech-id");
    markBrowserSelection();
    renderBrowserDetail();
  });
  $("rbvBrowserList").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const btn = e.target.closest("button.rbv-row");
    const next = btn && (e.key === "ArrowDown" ? btn.nextElementSibling : btn.previousElementSibling);
    if (next && next.matches("button.rbv-row")) { e.preventDefault(); next.focus(); }
  });

  function onMechanismsRendered() {
    publishParts();
    renderPartNotes();
    rebuildMarkers();
  }
  function onNotesChanged() {
    if (!nodeList.length) return;
    // Refresh badges and task chips only, so a half-typed quick-add and the search box keep their state.
    partSummary = summarizeParts(loadNotes());
    renderBrowserList();
    renderDetailTasks();
    rebuildMarkers();
  }
  window.addEventListener(NOTES_EVENT, onNotesChanged);
  window.addEventListener("storage", (e) => { if (e.key === NOTES_KEY || e.key === null) onNotesChanged(); });

  function focusPart(partId, opts = {}) {
    const part = nodeMap.get(partId);
    if (!part || !robotRoot || !nodeList.some((item) => item.label === partId)) return false;
    const objs = partObjects(partId);
    focusedPartId = partId;
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => { focusedPartId = null; rebuildMarkers(); }, 6000);
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
    if (opts.openPanel !== false) setDrawer(true);
    revealPart(partId);
    rebuildMarkers();
    setStatus(partId + (partSummary[partId] ? " · " + partSummary[partId].open + " open" : ""));
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
      if (n.userData?.rbvPart && n.userData.rbvLabel) {
        focusPart(n.userData.rbvLabel);
        return;
      }
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

  // ───────── Start: load the saved model or the bundled example ─────────
  (async function init() {
    await loadViewerSettings();
    applyUiState();
    const libs = ensureThree().catch((e) => e);
    const saved = await dbGet("models", "last").catch(() => null);
    let setupError = null;
    try {
      await loadSetup(!saved);
    } catch (err) {
      setupError = err;
    }
    if (saved && saved.files && saved.files.length) {
      await loadModel(saved.files, false);
      applyPendingFocus();
    } else {
      try {
        const response = await fetch(new URL("examples/robot-viewer-demo.urdf", document.baseURI));
        if (!response.ok) throw new Error("Could not load the example robot model.");
        await loadModel([{ name: "robot-viewer-demo.urdf", buffer: await response.arrayBuffer() }], false);
        usingBundledExample = !!robotRoot;
      } catch (err) {
        fail(err && err.message ? err.message : "Could not load the example robot model.");
      }
      const r = await libs;
      if (r instanceof Error) fail(r.message);
    }
    if (setupError && robotRoot) {
      fail("Could not load the example robot viewer setup: " + (setupError.message || "unknown error"));
    }
  })();
