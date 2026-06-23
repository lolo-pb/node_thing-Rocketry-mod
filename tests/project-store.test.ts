import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { useProjectStore } from "@/store/project.store";
import { isShader } from "@/store/project.types";
import { NODE_TYPES } from "@/utils/node-type";

describe("project store graph editing", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it("keeps an output connection after editing the source node", () => {
    const store = useProjectStore.getState();
    store.addNode("mix", { x: 10, y: 10 });

    const mix = useProjectStore
      .getState()
      .layers[0].nodes.filter(isShader)
      .find((node) => node.data.type === "mix");
    expect(mix).toBeDefined();

    store.onConnect({
      source: mix!.id,
      sourceHandle: "output",
      target: "__output",
      targetHandle: "color",
    });
    store.updateNodeDefaultValue(mix!.id, "factor", 0.75);

    const layer = useProjectStore.getState().layers[0];
    expect(layer.edges).toHaveLength(1);
    expect(layer.edges[0]).toMatchObject({
      source: mix!.id,
      sourceHandle: "output",
      target: "__output",
      targetHandle: "color",
    });
    expect(() => RenderPipeline.create(layer, NODE_TYPES)).not.toThrow();
  });
});
