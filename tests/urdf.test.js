import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { readFile } from "node:fs/promises";
import { parseURDF } from "../src/viewer/urdf.js";

function urdfFile(xml) {
  return { name: "robot.urdf", buffer: new TextEncoder().encode(xml).buffer };
}

function stlFile(name, size = 1) {
  const stl = `solid triangle
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex ${size} 0 0
      vertex 0 ${size} 0
    endloop
  endfacet
endsolid triangle`;
  return { name, buffer: new TextEncoder().encode(stl).buffer };
}

describe("URDF parsing", () => {
  it("loads the bundled example robot with its lift, pivot, and roller connectors", async () => {
    const buffer = await readFile(new URL("../public/examples/robot-viewer-demo.urdf", import.meta.url));
    const model = await parseURDF([{ name: "robot-viewer-demo.urdf", buffer }]);
    model.scene.updateMatrixWorld(true);

    expect(model.connectors.map(({ id, type, jointType }) => ({ id, type, jointType }))).toEqual([
      { id: "urdf:lift_slide", type: "translate", jointType: "prismatic" },
      { id: "urdf:shoulder_pivot", type: "rotate", jointType: "revolute" },
      { id: "urdf:intake_roller_spin", type: "rotate", jointType: "continuous" },
    ]);
    let rollerLink;
    model.scene.traverse((object) => {
      if (object.name === "intake_roller") rollerLink = object;
    });
    const rollerVisuals = rollerLink.userData.rbvVisuals;
    expect(rollerVisuals.children).toHaveLength(3);
    rollerVisuals.children.forEach((frame) => {
      const cylinder = frame.children[0];
      const axis = new THREE.Vector3(0, 1, 0).applyQuaternion(cylinder.getWorldQuaternion(new THREE.Quaternion()));
      expect(axis.x).toBeCloseTo(1);
      expect(axis.y).toBeCloseTo(0);
      expect(axis.z).toBeCloseTo(0);
    });
  });

  it("builds link visuals and imports typed joint connectors", async () => {
    const model = await parseURDF([urdfFile(`
      <robot name="test">
        <link name="base"><visual><geometry><box size="1 2 3"/></geometry></visual></link>
        <link name="arm"><visual><geometry><cylinder radius="0.2" length="1"/></geometry></visual></link>
        <joint name="shoulder" type="revolute">
          <parent link="base"/><child link="arm"/>
          <origin xyz="0 0 1" rpy="0.3 -0.4 0.7"/><axis xyz="0 1 0"/>
          <limit lower="-1" upper="0.5"/>
        </joint>
      </robot>
    `)]);

    expect(model.scene.userData.rbvURDF).toBe(true);
    expect(model.rootLink.name).toBe("base");
    expect(model.connectors).toHaveLength(1);
    expect(model.connectors[0]).toMatchObject({
      id: "urdf:shoulder",
      type: "rotate",
      jointType: "revolute",
      partId: "arm",
      axisVector: [0, 1, 0],
    });
    expect(model.connectors[0].min).toBeCloseTo(-57.2958, 3);
    expect(model.connectors[0].max).toBeCloseTo(28.6479, 3);
    const jointFrame = model.connectors[0].motion;
    const expectedOriginRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, -0.4, 0.7, "ZYX"));
    expect(jointFrame).toBe(model.connectorFrames[0]);
    expect(jointFrame.parent).toBe(model.rootLink);
    expect(jointFrame.children[0].name).toBe("arm");
    expect(jointFrame.position.toArray()).toEqual([0, 0, 1]);
    expect(jointFrame.quaternion.x).toBeCloseTo(expectedOriginRotation.x);
    expect(jointFrame.quaternion.y).toBeCloseTo(expectedOriginRotation.y);
    expect(jointFrame.quaternion.z).toBeCloseTo(expectedOriginRotation.z);
    expect(jointFrame.quaternion.w).toBeCloseTo(expectedOriginRotation.w);
    expect(model.rootLink.userData.rbvVisuals.children[0].children[0].geometry).toBeTruthy();
  });

  it("rejects missing URDF mesh files instead of silently omitting geometry", async () => {
    await expect(parseURDF([urdfFile(`
      <robot name="test">
        <link name="base"><visual><geometry><mesh filename="package://robot/meshes/base.stl"/></geometry></visual></link>
      </robot>
    `)])).rejects.toThrow("is missing");
  });

  it("resolves package mesh paths against relative paths from a selected export folder", async () => {
    const model = await parseURDF([
      urdfFile(`
        <robot name="test">
          <link name="base">
            <visual><geometry><mesh filename="package://robot/meshes/base.stl"/></geometry></visual>
          </link>
        </robot>
      `),
      stlFile("export/meshes/base.stl", 1),
      stlFile("export/other/base.stl", 2),
    ]);

    const position = model.rootLink.userData.rbvVisuals.children[0].children[0].geometry.attributes.position;
    expect(Math.max(...position.array)).toBe(1);
  });

  it("rejects disconnected link graphs", async () => {
    await expect(parseURDF([urdfFile(`
      <robot name="test">
        <link name="base"/><link name="island"/>
      </robot>
    `)])).rejects.toThrow("exactly one root link");
  });
});
