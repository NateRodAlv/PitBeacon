import { describe, expect, it } from "vitest";
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
  it("builds link visuals and imports typed joint connectors", async () => {
    const model = await parseURDF([urdfFile(`
      <robot name="test">
        <link name="base"><visual><geometry><box size="1 2 3"/></geometry></visual></link>
        <link name="arm"><visual><geometry><cylinder radius="0.2" length="1"/></geometry></visual></link>
        <joint name="shoulder" type="revolute">
          <parent link="base"/><child link="arm"/>
          <origin xyz="0 0 1" rpy="0 0 0"/><axis xyz="0 1 0"/>
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
    expect(model.connectors[0].motion.parent).toBe(model.connectorFrames[0]);
    expect(model.rootLink.userData.rbvVisuals.children[0].geometry).toBeTruthy();
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

    const position = model.rootLink.userData.rbvVisuals.children[0].geometry.attributes.position;
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
