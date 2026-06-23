import { generateShaderCode } from "@/app/components/renderer/implementation/shader-codegen";
import { RenderPass } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";

describe("Material Posterizer Mk2", () => {
  const type = NODE_TYPES.material_poster_mk2;

  it("is a single-pass hardcoded material node", () => {
    expect(type.name).toBe("Material Posterizer Mk2");
    expect(type.category).toBe("material");
    expect(type).not.toHaveProperty("additionalPasses");
    expect(type.outputs.output.type).toBe("color");
  });

  it("exposes the local-statistics controls", () => {
    expect(Object.keys(type.inputs)).toEqual([
      "input",
      "radius",
      "pore_darkness",
      "fiber_brightness",
      "minimum_contrast",
      "confidence",
    ]);
  });

  it("generates one shader that samples the input and emits exact mask colors", () => {
    const pass: RenderPass = {
      nodeId: "mk2",
      nodeType: "material_poster_mk2",
      shader: "main",
      inputBindings: {
        input: 0,
        radius: null,
        pore_darkness: null,
        fiber_brightness: null,
        minimum_contrast: null,
        confidence: null,
      },
      outputBindings: { output: 1 },
      parameters: {},
    };

    const code = generateShaderCode(pass, NODE_TYPES, ["color", "color"]);

    expect(code).toContain("raw_input[sample_index]");
    expect(code).toContain("local_variance");
    expect(code).toContain("vec3f(1.0, 0.0, 0.0)");
    expect(code).toContain("vec3f(0.0, 1.0, 0.0)");
    expect(code).toContain("vec3f(0.0, 0.0, 1.0)");
    expect(code).toContain("var result = vec3f(0.0)");
    expect(code.match(/@compute/g)).toHaveLength(1);
  });
});
