import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

describe("green-only morphology", () => {
  it("registers exact-color material nodes", () => {
    expect(NODE_TYPES.green_erosion.name).toBe("Green Erosion");
    expect(NODE_TYPES.green_dilation.name).toBe("Green Dilation");
    expect(NODE_TYPES.green_opening.name).toBe("Green Opening");
    expect(NODE_TYPES.green_erosion.category).toBe("material");
    expect(NODE_TYPES.green_dilation.category).toBe("material");
    expect(NODE_TYPES.green_opening.category).toBe("material");
    expect(NODE_TYPES.green_erosion.shader).toContain("fn class_color");
    expect(NODE_TYPES.green_dilation.shader).toContain("fn class_color");
  });

  it("erodes green to blue and dilates green into blue", () => {
    expect(NODE_TYPES.green_erosion.shader).toContain("vec3f(0.0, 0.0, 1.0)");
    expect(NODE_TYPES.green_erosion.shader).toContain(
      "keep_green = keep_green && is_green(raw_input[sample_index])",
    );
    expect(NODE_TYPES.green_dilation.shader).toContain("if (!is_blue(input))");
    expect(NODE_TYPES.green_dilation.shader).toContain(
      "touches_green = touches_green || is_green(raw_input[sample_index])",
    );
  });

  it("builds green opening as two passes with generated-blue tracking", () => {
    const opening = createNode("green_opening", { x: 0, y: 0 }, NODE_TYPES, {});
    const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
    const pipeline = RenderPipeline.create(
      {
        nodes: [opening, output],
        edges: [
          {
            id: "green-opening-output",
            source: opening.id,
            sourceHandle: "output",
            target: output.id,
            targetHandle: "color",
          },
        ],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes).toHaveLength(2);
    expect(pipeline.passes[0].outputBindings).toEqual({
      eroded: expect.any(Number),
      opening_radius: expect.any(Number),
      removed_green: expect.any(Number),
    });
    expect(pipeline.passes[1].inputBindings).toEqual(
      pipeline.passes[0].outputBindings,
    );
  });
});
