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

  it("fits the active layer to the canvas when resizing the canvas", () => {
    const store = useProjectStore.getState();
    store.setLayerBounds(50, 60, 320, 240);

    useProjectStore.getState().setCanvasSize(800, 600);

    const state = useProjectStore.getState();
    expect(state.properties.canvas).toEqual({ width: 800, height: 600 });
    expect(state.layers[state.currentLayer]).toMatchObject({
      position: { x: 0, y: 0 },
      size: { width: 800, height: 600 },
    });
  });
});
