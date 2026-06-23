import { generateShaderCode } from "@/app/components/renderer/implementation/shader-codegen";
import { RenderPass } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";

describe("Erosion", () => {
  const type = NODE_TYPES.erosion;

  it("is a one-pass filter with an adjustable radius", () => {
    expect(type.name).toBe("Erosion");
    expect(type.category).toBe("Filter");
    expect(Object.keys(type.inputs)).toEqual(["input", "radius"]);
    expect(type.inputs.radius).toMatchObject({
      min: 1,
      max: 20,
      step: 1,
      default: 1,
    });
    expect(type).not.toHaveProperty("additionalPasses");
  });

  it("generates one pass using a channel-wise neighborhood minimum", () => {
    const pass: RenderPass = {
      nodeId: "erosion",
      nodeType: "erosion",
      shader: "main",
      inputBindings: { input: 0, radius: null },
      outputBindings: { output: 1 },
      parameters: {},
    };

    const code = generateShaderCode(pass, NODE_TYPES, ["color", "color"]);

    expect(code).toContain("raw_input[sample_index]");
    expect(code).toContain("result = min(result, raw_input[sample_index])");
    expect(code).toContain("clamp(i32(round(radius)), 1, 20)");
    expect(code.match(/@compute/g)).toHaveLength(1);
  });
});
