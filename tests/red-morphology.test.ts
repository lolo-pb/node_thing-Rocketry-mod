import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

describe("red-only morphology", () => {
  it("registers red erosion and dilation as one-pass filters", () => {
    expect(NODE_TYPES.red_erosion.name).toBe("Red Erosion");
    expect(NODE_TYPES.red_dilation.name).toBe("Red Dilation");
    expect(NODE_TYPES.red_erosion.category).toBe("material");
    expect(NODE_TYPES.red_dilation.category).toBe("material");
    expect(NODE_TYPES.red_opening.category).toBe("material");
    expect(NODE_TYPES.red_erosion).not.toHaveProperty("additionalPasses");
    expect(NODE_TYPES.red_dilation).not.toHaveProperty("additionalPasses");
    expect(NODE_TYPES.red_erosion.shader).toContain("if (!is_red(input))");
    expect(NODE_TYPES.red_dilation.shader).toContain("if (!is_black(input))");
  });

  it("builds red opening as erosion followed by dilation", () => {
    const opening = createNode("red_opening", { x: 0, y: 0 }, NODE_TYPES, {});
    const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
    const pipeline = RenderPipeline.create(
      {
        nodes: [opening, output],
        edges: [
          {
            id: "red-opening-output",
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
    });
    expect(pipeline.passes[1].inputBindings).toEqual(
      pipeline.passes[0].outputBindings,
    );
    expect(NODE_TYPES.red_opening.shader).toContain(
      "keep_red = keep_red && is_red(raw_input[sample_index])",
    );
    expect(NODE_TYPES.red_opening.additionalPasses[0].shader).toContain(
      "touches_red = touches_red || is_red(raw_eroded[sample_index])",
    );
  });
});
