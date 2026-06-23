import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodePositionChange,
} from "@xyflow/react";
import { applyChangeset, revertChangeset } from "json-diff-ts";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import { NodeData, ShaderNode } from "@/schemas/node.schema";
import { createGroup, createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";
import { Point } from "@/utils/point";
import {
  createInitialState,
  createLayer,
  getEdgeChangesByType,
  getNodeChangesByType,
  mergeProject,
  modifyGroup,
  modifyLayer,
  modifyNode,
  newLayerId,
  prepareProjectForExport,
  withHistory,
} from "./project.actions";
import { isGroup, Layer, Project } from "./project.types";

type ProjectStore = ReturnType<typeof createInitialState> & {
  undo: () => void;
  redo: () => void;
};

export const useProjectStore = create(
  persist(
    combine(createInitialState(), (set, get) => ({
      setActiveLayer: (idx: number) => {
        set({ currentLayer: idx, currentGroup: [] });
      },

      openGroup: (id: string) => {
        set(({ currentGroup }) => ({ currentGroup: [...currentGroup, id] }));
      },

      closeGroup: (level?: number) => {
        set(({ currentGroup }) => ({
          currentGroup: currentGroup.slice(0, level ?? -1),
        }));
      },

      onNodesChange: (changes: NodeChange<Node>[]) => {
        let state = get();
        const { tracked, untracked, collapsed } = getNodeChangesByType(changes);
        const apply = (project: Project, selected: NodeChange<Node>[]) =>
          modifyGroup(project, (graph) => ({
            nodes: applyNodeChanges(selected, graph.nodes) as ShaderNode[],
          }));

        if (untracked.length) set(apply(state, untracked));
        if (collapsed.length) {
          state = get();
          set(
            withHistory(
              state,
              apply(state, collapsed),
              `moveNodes::${collapsed
                .map((change) => (change as NodePositionChange).id)
                .join(":")}`,
              { collapse: true },
            ),
          );
        }
        if (tracked.length) {
          state = get();
          set(withHistory(state, apply(state, tracked), "nodesChange"));
        }
      },

      onEdgesChange: (changes: EdgeChange<Edge>[]) => {
        let state = get();
        const { tracked, untracked } = getEdgeChangesByType(changes);
        const apply = (project: Project, selected: EdgeChange<Edge>[]) =>
          modifyGroup(project, (graph) => ({
            edges: applyEdgeChanges(selected, graph.edges),
          }));

        if (untracked.length) set(apply(state, untracked));
        if (tracked.length) {
          state = get();
          set(withHistory(state, apply(state, tracked), "edgesChange"));
        }
      },

      onConnect: (connection: Connection) => {
        const state = get();
        const newState = modifyGroup(state, (graph) => ({
          edges: addEdge(
            connection,
            graph.edges.filter(
              (edge) =>
                edge.target !== connection.target ||
                edge.targetHandle !== connection.targetHandle,
            ),
          ),
        }));
        set(withHistory(state, newState, "connect"));
      },

      updateNodeDefaultValue: (
        id: string,
        input: string,
        value: number | number[],
      ) => {
        const state = get();
        const newState = modifyNode(state, id, (node) => ({
          data: {
            ...node.data,
            defaultValues: { ...node.data.defaultValues, [input]: value },
          },
        }));
        set(
          withHistory(
            state,
            newState,
            `updateNodeDefaultValue::${id}::${input}`,
            { collapse: true },
          ),
        );
      },

      updateNodeParameter: (
        id: string,
        param: string,
        value: string | null,
      ) => {
        const state = get();
        const newState = modifyNode(state, id, (node) => ({
          data: {
            ...node.data,
            parameters: { ...node.data.parameters, [param]: { value } },
          },
        }));
        set(withHistory(state, newState, "updateNodeParameter"));
      },

      updateNodeUniform: (
        id: string,
        name: string,
        value: number | number[],
      ) => {
        const state = get();
        const newState = modifyNode(state, id, (node) => ({
          data: {
            ...node.data,
            uniforms: { ...node.data.uniforms, [name]: value },
          },
        }));
        set(
          withHistory(state, newState, `updateNodeUniform::${id}::${name}`, {
            collapse: true,
          }),
        );
      },

      setCanvasSize: (width: number, height: number) => {
        const state = get();
        const resizedLayer = modifyLayer(state, () => ({
          position: { x: 0, y: 0 },
          size: { width, height },
        }));
        set(
          withHistory(
            state,
            {
              ...resizedLayer,
              properties: {
                ...state.properties,
                canvas: { width, height },
              },
            },
            "setCanvasSize",
          ),
        );
      },

      addLayer: () => {
        const state = get();
        set(
          withHistory(
            state,
            {
              layers: [
                ...state.layers,
                createLayer(
                  `Layer ${state.layers.length}`,
                  state.properties.canvas,
                ),
              ],
              currentLayer: state.layers.length,
              currentGroup: [],
            },
            "addLayer",
          ),
        );
      },

      setLayerBounds: (x: number, y: number, width: number, height: number) => {
        const state = get();
        const newState = modifyLayer(state, () => ({
          position: { x, y },
          size: { width, height },
        }));
        set(
          withHistory(
            state,
            newState,
            `setLayerBounds::${state.layers[state.currentLayer].id}`,
            { collapse: true },
          ),
        );
      },

      reorderLayers: (from: number, to: number) => {
        const state = get();
        const layers = state.layers.slice();
        const [moved] = layers.splice(from, 1);
        layers.splice(to, 0, moved);

        let currentLayer = state.currentLayer;
        if (currentLayer === from) currentLayer = to;
        else if (from < currentLayer && to >= currentLayer) currentLayer--;
        else if (from > currentLayer && to <= currentLayer) currentLayer++;

        set(withHistory(state, { layers, currentLayer }, "reorderLayer"));
      },

      reset: () => set(createInitialState()),

      exportLayer: (index: number) =>
        JSON.stringify(get().layers[index], null, 2),

      importLayer: (json: string) => {
        const state = get();
        const layer: Layer = JSON.parse(json);
        layer.id = newLayerId();
        set(
          withHistory(
            state,
            {
              layers: [...state.layers, layer],
              currentLayer: state.layers.length,
              currentGroup: [],
            },
            "importLayer",
          ),
        );
      },

      exportProject: () => prepareProjectForExport(get()),

      importProject: (project: Project) =>
        set((current) => mergeProject(project, current)),

      addNode: (
        type: string,
        position: Point,
        parameters: NodeData["parameters"] = {},
      ) => {
        const state = get();
        const newState = modifyGroup(state, (graph) => ({
          nodes: [
            ...graph.nodes.map((node) => ({ ...node, selected: false })),
            createNode(
              type as keyof typeof NODE_TYPES,
              position,
              NODE_TYPES,
              parameters,
            ),
          ],
        }));
        set(withHistory(state, newState, "addNode"));
      },

      addGroup: (position: Point) => {
        const state = get();
        set(
          withHistory(
            state,
            modifyGroup(state, (graph) =>
              createGroup(position, graph, NODE_TYPES),
            ),
            "addGroup",
          ),
        );
      },

      renameGroup: (name: string, id: string) => {
        const state = get();
        const newState = modifyGroup(state, (graph) => {
          const group = graph.nodes.find((node) => node.id === id);
          if (!group || !isGroup(group)) return {};
          return {
            nodes: graph.nodes.map((node) =>
              node.id === id
                ? { ...group, data: { ...group.data, name } }
                : node,
            ),
          };
        });
        set(withHistory(state, newState, "renameGroup"));
      },

      removeNode: (id: string) => {
        const state = get();
        set(
          withHistory(
            state,
            modifyGroup(state, (graph) => ({
              nodes: graph.nodes.filter((node) => node.id !== id),
              edges: graph.edges.filter(
                (edge) => edge.source !== id && edge.target !== id,
              ),
            })),
            "removeNode",
          ),
        );
      },

      changeLayerName: (name: string, index: number) => {
        const state = get();
        set(
          withHistory(
            state,
            modifyLayer(state, () => ({ name }), index),
            "renameLayer",
          ),
        );
      },

      removeLayer: (index: number) => {
        const state = get();
        if (state.layers.length <= 1) return;
        const layers = [
          ...state.layers.slice(0, index),
          ...state.layers.slice(index + 1),
        ];
        const currentLayer =
          index <= state.currentLayer
            ? Math.max(0, state.currentLayer - 1)
            : state.currentLayer;
        set(
          withHistory(
            state,
            { layers, currentLayer, currentGroup: [] },
            "removeLayer",
          ),
        );
      },

      duplicateLayer: (index: number) => {
        const state = get();
        const source = state.layers[index];
        const copy = {
          ...source,
          name: `${source.name} copy`,
          id: newLayerId(),
        };
        const target = index + 1;
        const layers = [
          ...state.layers.slice(0, target),
          copy,
          ...state.layers.slice(target),
        ];
        set(
          withHistory(
            state,
            { layers, currentLayer: target, currentGroup: [] },
            "duplicateLayer",
          ),
        );
      },

      goTo: (target: number) => {
        let done = get().done;
        if (target === done) return;
        if (target > done) {
          while (done !== target) {
            (get() as ProjectStore).undo();
            done++;
          }
        } else {
          while (done !== target) {
            (get() as ProjectStore).redo();
            done--;
          }
        }
      },

      undo: () => {
        const state = get() as ProjectStore;
        if (state.history.length <= state.done) return;
        const newState = revertChangeset(
          JSON.parse(JSON.stringify(state)),
          state.history[state.done].diff,
        );
        set({
          ...newState,
          done: state.done + 1,
          currentLayer: state.history[state.done].layerIdx ?? 0,
        });
      },

      redo: () => {
        const state = get() as ProjectStore;
        if (state.done <= 0) return;
        const newState = applyChangeset(
          JSON.parse(JSON.stringify(state)),
          state.history[state.done - 1].diff,
        );
        set({
          ...newState,
          done: state.done - 1,
          currentLayer: state.history[state.done - 1].layerIdx ?? 0,
        });
      },
    })),
    {
      name: "main-store-v2",
      merge: (persisted, current) => ({
        ...current,
        ...mergeProject(persisted, current),
      }),
      partialize: (state) => prepareProjectForExport(state),
    },
  ),
);
