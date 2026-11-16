import * as THREE from "three";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const child = (element, name) => Array.from(element.children).find((item) => item.tagName === name) || null;

function vector(text, fallback) {
  if (!text) return fallback.slice();
  const values = text.trim().split(/\s+/).map(Number);
  if (values.length !== 3 || !values.every(Number.isFinite)) throw new Error(`Invalid URDF vector: ${text}`);
  return values;
}

function positiveNumber(text, description) {
  const value = text === null ? NaN : Number(text);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`URDF ${description} must be greater than zero.`);
  return value;
}

function origin(element) {
  const xyz = vector(element?.getAttribute("xyz"), [0, 0, 0]);
  const rpy = vector(element?.getAttribute("rpy"), [0, 0, 0]);
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(...rpy, "ZYX"));
  return { xyz, quaternion };
}

function resolveFile(uri, files) {
  const clean = decodeURIComponent(uri).replace(/^package:\/\//i, "").replace(/^file:\/\//i, "").split(/[?#]/)[0];
  const target = clean.replace(/\\/g, "/").replace(/^\/+/, "").toLowerCase();
  const exact = files.find((file) => file.name.replace(/\\/g, "/").toLowerCase() === target);
  if (exact) return exact;
  const matches = files.filter((file) => {
    const name = file.name.replace(/\\/g, "/").toLowerCase();
    return name === target || name.endsWith("/" + target) || name.endsWith("/" + target.split("/").pop());
  });
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) throw new Error(`More than one selected file matches URDF mesh "${uri}".`);
  throw new Error(`URDF mesh "${uri}" is missing. Select the URDF with all referenced mesh files.`);
}

function materialFor(visual, materials) {
  const material = child(visual, "material");
  const colorElement = child(material || visual, "color");
  const named = material?.getAttribute("name") ? materials.get(material.getAttribute("name")) : null;
  const rgba = vectorColor(colorElement?.getAttribute("rgba")) || named;
  return new THREE.MeshStandardMaterial({
    color: rgba ? new THREE.Color(rgba[0], rgba[1], rgba[2]) : 0xb7c3d0,
    transparent: rgba ? rgba[3] < 1 : false,
    opacity: rgba ? rgba[3] : 1,
    roughness: 0.78,
    metalness: 0.08,
  });
}

function vectorColor(text) {
  if (!text) return null;
  const values = text.trim().split(/\s+/).map(Number);
  if (values.length !== 4 || !values.every(Number.isFinite)) throw new Error(`Invalid URDF color: ${text}`);
  return values;
}

async function loadVisualGeometry(geometryElement, files, material) {
  const geometry = child(geometryElement, "box");
  if (geometry) {
    const size = vector(geometry.getAttribute("size"), [1, 1, 1]);
    if (size.some((value) => value <= 0)) throw new Error("URDF box dimensions must be greater than zero.");
    return new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  }
  const cylinder = child(geometryElement, "cylinder");
  if (cylinder) {
    const radius = positiveNumber(cylinder.getAttribute("radius"), "cylinder radius");
    const length = positiveNumber(cylinder.getAttribute("length"), "cylinder length");
    const object = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 24), material);
    object.rotation.x = Math.PI / 2;
    return object;
  }
  const sphere = child(geometryElement, "sphere");
  if (sphere) {
    const radius = positiveNumber(sphere.getAttribute("radius"), "sphere radius");
    return new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), material);
  }
  const mesh = child(geometryElement, "mesh");
  if (!mesh) throw new Error("URDF visual has an unsupported geometry type.");
  const uri = mesh.getAttribute("filename");
  if (!uri) throw new Error("URDF mesh geometry is missing its filename.");
  const file = resolveFile(uri, files);
  const extension = file.name.split(".").pop().toLowerCase();
  let object;
  if (extension === "stl") {
    const geometry = new STLLoader().parse(file.buffer);
    geometry.computeVertexNormals();
    object = new THREE.Mesh(geometry, material);
  } else if (extension === "obj") {
    object = new OBJLoader().parse(new TextDecoder().decode(file.buffer));
    object.traverse((node) => {
      if (node.isMesh) node.material = material;
    });
  } else if (extension === "dae") {
    object = new ColladaLoader().parse(new TextDecoder().decode(file.buffer), "").scene;
    object.traverse((node) => {
      if (node.isMesh) node.material = material;
    });
  } else {
    throw new Error(`URDF mesh format ".${extension}" is not supported. Use STL, OBJ, or DAE.`);
  }
  const scale = vector(mesh.getAttribute("scale"), [1, 1, 1]);
  if (scale.some((value) => value === 0)) throw new Error("URDF mesh scale values cannot be zero.");
  object.scale.set(...scale);
  return object;
}

function jointControl(joint, motion, childLink) {
  const name = joint.getAttribute("name")?.trim();
  const jointType = joint.getAttribute("type")?.trim();
  const id = "urdf:" + name;
  const movable = jointType === "revolute" || jointType === "continuous" || jointType === "prismatic";
  if (!["fixed", "revolute", "continuous", "prismatic"].includes(jointType)) {
    throw new Error(`URDF joint "${name}" has unsupported type "${jointType}".`);
  }
  const axis = vector(child(joint, "axis")?.getAttribute("xyz"), [1, 0, 0]);
  const length = Math.hypot(...axis);
  if (movable && !(length > 0)) throw new Error(`URDF joint "${name}" has a zero-length axis.`);
  if (length > 0) axis.forEach((value, index) => { axis[index] = value / length; });
  const limit = child(joint, "limit");
  const rotary = jointType === "revolute" || jointType === "continuous";
  let min = rotary ? -180 : -0.1;
  let max = rotary ? 180 : 0.1;
  if (jointType !== "continuous" && limit) {
    const lowerText = limit.getAttribute("lower");
    const upperText = limit.getAttribute("upper");
    const lower = lowerText === null ? NaN : Number(lowerText);
    const upper = upperText === null ? NaN : Number(upperText);
    if (Number.isFinite(lower)) min = rotary ? THREE.MathUtils.radToDeg(lower) : lower;
    if (Number.isFinite(upper)) max = rotary ? THREE.MathUtils.radToDeg(upper) : upper;
  }
  if (min > max) throw new Error(`URDF joint "${name}" has a lower limit greater than its upper limit.`);
  return {
    id,
    name,
    nodes: [id],
    type: rotary ? "rotate" : "translate",
    jointType,
    axis: "x",
    axisVector: axis,
    min,
    max,
    range: Math.max(Math.abs(min), Math.abs(max), 0.000001),
    value: 0,
    space: "mate",
    source: "urdf",
    partId: childLink.name,
    motion,
  };
}

export async function parseURDF(files) {
  const main = files.find((file) => /\.urdf$/i.test(file.name));
  if (!main) throw new Error("Choose a .urdf file.");
  const xml = new DOMParser().parseFromString(new TextDecoder().decode(main.buffer), "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("The URDF file contains invalid XML.");
  const robot = xml.querySelector("robot");
  if (!robot) throw new Error("The URDF file has no <robot> element.");

  const materials = new Map();
  Array.from(robot.children).filter((element) => element.tagName === "material").forEach((material) => {
    const color = child(material, "color");
    const rgba = vectorColor(color?.getAttribute("rgba"));
    if (material.getAttribute("name") && rgba) materials.set(material.getAttribute("name"), rgba);
  });

  const links = new Map();
  for (const element of Array.from(robot.children).filter((item) => item.tagName === "link")) {
    const name = element.getAttribute("name")?.trim();
    if (!name || links.has(name)) throw new Error("Every URDF link must have a unique name.");
    const link = new THREE.Object3D();
    link.name = name;
    link.userData.rbvPart = true;
    links.set(name, link);
    const visuals = new THREE.Group();
    link.userData.rbvVisuals = visuals;
    link.add(visuals);
    for (const visual of Array.from(element.children).filter((item) => item.tagName === "visual")) {
      const geometryElement = child(visual, "geometry");
      if (!geometryElement) continue;
      const mesh = await loadVisualGeometry(geometryElement, files, materialFor(visual, materials));
      const pose = origin(child(visual, "origin"));
      mesh.position.set(...pose.xyz);
      mesh.quaternion.copy(pose.quaternion);
      mesh.name = child(visual, "geometry")?.firstElementChild?.getAttribute("name") || name + " visual";
      visuals.add(mesh);
    }
  }
  if (!links.size) throw new Error("The URDF contains no links.");

  const joints = Array.from(robot.children).filter((item) => item.tagName === "joint");
  const parentOf = new Map();
  const jointNames = new Set();
  const connections = joints.map((joint) => {
    const name = joint.getAttribute("name")?.trim();
    const type = joint.getAttribute("type")?.trim();
    const parentName = child(joint, "parent")?.getAttribute("link");
    const childName = child(joint, "child")?.getAttribute("link");
    const parent = links.get(parentName);
    const childLink = links.get(childName);
    if (!name || jointNames.has(name) || !parent || !childLink) throw new Error("Every URDF joint must have a unique name and reference existing parent and child links.");
    jointNames.add(name);
    if (parentOf.has(childName)) throw new Error(`URDF link "${childName}" has more than one parent joint.`);
    parentOf.set(childName, name);
    return { joint, name, parent, childLink, pose: origin(child(joint, "origin")), type };
  });

  const roots = Array.from(links.entries()).filter(([name]) => !parentOf.has(name));
  if (roots.length !== 1) throw new Error("The URDF must describe one connected robot with exactly one root link.");
  const rootLink = roots[0][1];
  const childrenByParent = new Map();
  connections.forEach((connection) => {
    const list = childrenByParent.get(connection.parent) || [];
    list.push(connection);
    childrenByParent.set(connection.parent, list);
  });
  const connectors = [];
  const connectorFrames = [];
  const visited = new Set();
  const visit = (link, seen) => {
    if (seen.has(link)) throw new Error("The URDF joint graph contains a cycle.");
    seen.add(link);
    visited.add(link);
    for (const connection of childrenByParent.get(link) || []) {
      const frame = new THREE.Object3D();
      frame.name = "__mate_frame__" + connection.name;
      frame.userData.rbvInternal = true;
      frame.position.set(...connection.pose.xyz);
      frame.quaternion.copy(connection.pose.quaternion);
      const motion = new THREE.Object3D();
      motion.name = "__mate_motion__" + connection.name;
      motion.userData.rbvInternal = true;
      frame.add(motion);
      motion.add(connection.childLink);
      link.add(frame);
      connectors.push(jointControl(connection.joint, motion, connection.childLink));
      connectorFrames.push(frame);
      visit(connection.childLink, seen);
    }
    seen.delete(link);
  };
  visit(rootLink, new Set());
  if (visited.size !== links.size) throw new Error("The URDF contains links that aren't connected to its root link.");

  const scene = new THREE.Group();
  scene.name = robot.getAttribute("name") || "URDF robot";
  scene.userData.rbvURDF = true;
  scene.add(rootLink);
  return { scene, connectors, connectorFrames, rootLink };
}
