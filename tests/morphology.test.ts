import { generateShaderCode } from "@/app/components/renderer/implementation/shader-codegen";
import { RenderPass, RenderPipeline } from "@/app/components/renderer/pipeline";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

describe("Dilation", () => {
  it("is a one-pass channel-wise neighborhood maximum", () => {
    const type = NODE_TYPES.dilation;
    expect(type.name).toBe("Dilation");
    expect(type).not.toHaveProperty("additionalPasses");

    const pass: RenderPass = {
      nodeId: "dilation",
      nodeType: "dilation",
      shader: "main",
      inputBindings: { input: 0, radius: null },
      outputBindings: { output: 1 },
      parameters: {},
    };
    const code = generateShaderCode(pass, NODE_TYPES, ["color", "color"]);

    expect(code).toContain("result = max(result, raw_input[sample_index])");
    expect(code.match(/@compute/g)).toHaveLength(1);
  });
});

describe("Opening", () => {
  it("creates an erosion pass followed by a dilation pass", () => {
    const opening = createNode("opening", { x: 0, y: 0 }, NODE_TYPES, {});
    const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
    const pipeline = RenderPipeline.create(
      {
        nodes: [opening, output],
        edges: [
          {
            id: "opening-output",
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
    expect(pipeline.passes[0].shader).toBe("main");
    expect(pipeline.passes[0].outputBindings).toEqual({
      eroded: expect.any(Number),
      opening_radius: expect.any(Number),
    });
    expect(pipeline.passes[1].shader).toBe("pass_0");
    expect(pipeline.passes[1].inputBindings).toEqual(
      pipeline.passes[0].outputBindings,
    );
    expect(pipeline.passes[1].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("uses minimum in pass one and maximum in pass two", () => {
    const firstPass: RenderPass = {
      nodeId: "opening",
      nodeType: "opening",
      shader: "main",
      inputBindings: { input: 0, radius: null },
      outputBindings: { eroded: 1, opening_radius: 2 },
      parameters: {},
    };
    const secondPass: RenderPass = {
      nodeId: "opening",
      nodeType: "opening",
      shader: "pass_0",
      inputBindings: { eroded: 1, opening_radius: 2 },
      outputBindings: { output: 3 },
      parameters: {},
    };

    const erosionCode = generateShaderCode(firstPass, NODE_TYPES, [
      "color",
      "color",
      "number",
      "color",
    ]);
    const dilationCode = generateShaderCode(secondPass, NODE_TYPES, [
      "color",
      "color",
      "number",
      "color",
    ]);

    expect(erosionCode).toContain(
      "result = min(result, raw_input[sample_index])",
    );
    expect(erosionCode).toContain("opening_radius[index] = f32(R)");
    expect(dilationCode).toContain(
      "result = max(result, raw_eroded[sample_index])",
    );
  });
});
