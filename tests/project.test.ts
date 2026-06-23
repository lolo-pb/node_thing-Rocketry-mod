import { ShaderNode } from "@/schemas/node.schema";
import {
  createInitialState,
  createLayer,
  mergeProject,
  prepareProjectForExport,
} from "@/store/project.actions";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";
import { getUnsupportedNodeTypes } from "@/utils/project";

describe("createLayer", () => {
  it("includes an output node", () => {
    const layer = createLayer("New layer");

    expect(layer.nodes.length).toBeGreaterThan(0);
    expect((layer.nodes[0] as ShaderNode).data.type).toBe("__output");
    expect(layer.nodes[0].id).toBe("__output");
  });
});

describe("createInitialState", () => {
  it("contains one local layer and no dynamic node registry", () => {
    const project = createInitialState();

    expect(project.layers).toHaveLength(1);
    expect(project).not.toHaveProperty("nodeTypes");
  });
});

describe("prepareProjectForExport", () => {
  it("exports only project data", () => {
    const project = createInitialState();
    const exported = prepareProjectForExport(project);

    expect(exported).toEqual(project);
    expect(exported).not.toHaveProperty("nodeTypes");
  });
});

describe("mergeProject", () => {
  it("uses imported layers while preserving current defaults", () => {
    const current = createInitialState();
    const imported = createInitialState();
    imported.layers[0].size = { width: 100, height: 100 };
    imported.layers[0].nodes.push(
      createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {}),
    );

    const merged = mergeProject(imported, current);

    expect(merged.layers).toEqual(imported.layers);
    expect(merged.properties).toEqual(imported.properties);
  });
});

describe("getUnsupportedNodeTypes", () => {
  it("accepts projects containing only hardcoded nodes", () => {
    const project = createInitialState();
    project.layers[0].nodes.push(
      createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {}),
    );

    expect(getUnsupportedNodeTypes(project)).toEqual([]);
  });

  it("reports unknown nodes without changing the project", () => {
    const project = createInitialState();
    const unknown: ShaderNode = createNode(
      "mix",
      { x: 0, y: 0 },
      NODE_TYPES,
      {},
    );
    unknown.data.type = "custom_old_shader";
    project.layers[0].nodes.push(unknown);

    expect(getUnsupportedNodeTypes(project)).toEqual(["custom_old_shader"]);
    expect(project.layers[0].nodes).toContain(unknown);
  });
});
