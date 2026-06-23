import { generateShaderCode } from "@/app/components/renderer/implementation/shader-codegen";
import { RenderPass } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";

describe("Material Posterizer Mk3", () => {
  const type = NODE_TYPES.material_poster_mk3;

  it("has exactly two adjustable thresholds", () => {
    expect(type.name).toBe("Material Posterizer Mk3");
    expect(Object.keys(type.inputs)).toEqual([
      "input",
      "pore_threshold",
      "fiber_threshold",
    ]);
    expect(type).not.toHaveProperty("additionalPasses");
  });

  it("generates one pass with exact pore, resin, and fiber colors", () => {
    const pass: RenderPass = {
      nodeId: "mk3",
      nodeType: "material_poster_mk3",
      shader: "main",
      inputBindings: {
        input: 0,
        pore_threshold: null,
        fiber_threshold: null,
      },
      outputBindings: { output: 1 },
      parameters: {},
    };

    const code = generateShaderCode(pass, NODE_TYPES, ["color", "color"]);

    expect(code).toContain("min(pore_threshold, fiber_threshold)");
    expect(code).toContain("max(pore_threshold, fiber_threshold)");
    expect(code).toContain("vec3f(0.0, 0.0, 1.0)");
    expect(code).toContain("vec3f(0.0, 1.0, 0.0)");
    expect(code).toContain("vec3f(1.0, 0.0, 0.0)");
    expect(code.match(/@compute/g)).toHaveLength(1);
  });
});
