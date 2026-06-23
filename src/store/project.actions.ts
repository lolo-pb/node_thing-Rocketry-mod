import { Edge, EdgeChange, Node, NodeChange } from "@xyflow/react";
import { nanoid } from "nanoid";

import { ShaderNode } from "@/schemas/node.schema";
import {
  Project,
  Layer,
  StoredProject,
  isShader,
  Graph,
  isGroup,
} from "./project.types";
import { Command } from "./types/command";
import { diff, revertChangeset } from "json-diff-ts";

const initialNodes: ShaderNode[] = [
  {
    id: "__output",
    position: { x: 0, y: 0 },
    data: { type: "__output", defaultValues: {}, parameters: {} },
    type: "RenderShaderNode",
    deletable: false,
  },
];
const initialEdges: Edge[] = [];
const initialSize = { width: 1920, height: 1080 };

export function prepareProjectForExport(project: Project): StoredProject {
  const {
    layers,
    currentLayer,
    currentGroup,
    properties,
    projectName,
    history,
    done,
  } = project;
  return {
    layers,
    currentLayer,
    currentGroup,
    properties,
    projectName,
    history,
    done,
  };
}

export function modifyNode(
  state: Project,
  id: string,
  updater: (node: ShaderNode) => Partial<ShaderNode>,
): Partial<Project> {
  return modifyGroup(state, ({ nodes }) => {
    const node = nodes.find((n) => n.id === id);
    if (!node || !isShader(node)) return {};

    return {
      nodes: nodes.map((current) =>
        current.id === id
          ? {
              ...node,
              ...updater(node),
              id: node.id,
            }
          : current,
      ),
    };
  });
}

export function modifyGroup(
  state: Project,
  updater: (data: Graph) => Partial<Graph>,
): Partial<Project> {
  const modify = (data: Graph, groupPath: string[]): Partial<Graph> => {
    if (groupPath.length === 0) return updater(data);

    const group = data.nodes.filter(isGroup).find((n) => n.id === groupPath[0]);
    if (!group) return {};

    return {
      nodes: [
        ...data.nodes.filter((n) => n.id !== group.id),
        {
          ...group,
          data: { ...group.data, ...modify(group.data, groupPath.slice(1)) },
        },
      ],
    };
  };

  return modifyLayer(state, (layer) => modify(layer, state.currentGroup));
}

export function modifyLayer(
  state: Project,
  updater: (layer: Layer) => Partial<Layer>,
  idx?: number,
): Partial<Project> {
  const { layers, currentLayer } = state;

  const layerIdx = idx ?? currentLayer;
  const layerToModify = layers[layerIdx];
  if (!layerToModify) return {};

  const layersUnder = layers.slice(0, layerIdx);
  const layersOver = layers.slice(layerIdx + 1);

  return {
    layers: [
      ...layersUnder,
      {
        ...layerToModify,
        ...updater(layerToModify),
      },
      ...layersOver,
    ],
  };
}

export function createLayer(
  name: string,
  size = { width: 1920, height: 1080 },
): Layer {
  return {
    nodes: [...initialNodes],
    edges: [...initialEdges],
    position: { x: 0, y: 0 },
    size,
    id: newLayerId(),
    name,
  };
}

export function newLayerId(): string {
  return `layer_${nanoid()}`;
}

export function createInitialState(): Project {
  return {
    layers: [createLayer("Background")],
    currentLayer: 0,
    currentGroup: [],

    properties: { canvas: initialSize },
    projectName: "Untitled Project",

    history: [],
    done: -1, // todo, deberia haber un action inicial y arrancar en 0
  };
}

export function mergeProject(imported: unknown, current: Project): Project {
  return {
    ...current,
    ...(imported as Project),
    properties: {
      ...current.properties,
      ...(imported as Project).properties,
    },
  };
}

export function historyPush(h: Project["history"], cmd: Command) {
  return [cmd, ...h];
}

type HistoryOptions = {
  collapse?: boolean;
};

export function withHistory(
  state: Project,
  newState: Partial<Project>,
  command: string,
  options: HistoryOptions = {
    collapse: false,
  },
) {
  const { history, done, ...cleanState } = state;
  const serializable = JSON.parse(JSON.stringify(cleanState));
  const fullNewState = { ...serializable, ...newState };

  if (
    options.collapse &&
    done === 0 &&
    history[done]?.command === command &&
    history[done]?.diff
  ) {
    const oldState = revertChangeset(serializable, history[done].diff);
    return {
      ...newState,
      history: historyPush(history.slice(done + 1), {
        command,
        diff: diff(oldState, fullNewState),
        layerIdx: fullNewState.currentLayer,
      }),
      done: 0,
    };
  }

  return {
    ...newState,
    history: historyPush(history.slice(done), {
      command,
      diff: diff(serializable, fullNewState),
      layerIdx: fullNewState.currentLayer,
    }),
    done: 0,
  };
}

const nodeChangeTypes = {
  add: "tracked",
  remove: "tracked",
  replace: "tracked",
  position: "collapsed",
  dimensions: "untracked",
  select: "untracked",
} satisfies Record<
  NodeChange<Node>["type"],
  "tracked" | "collapsed" | "untracked"
>;

export function getNodeChangesByType(changes: NodeChange<Node>[]) {
  return {
    tracked: changes.filter(
      (change) => nodeChangeTypes[change.type] === "tracked",
    ),
    collapsed: changes.filter(
      (change) => nodeChangeTypes[change.type] === "collapsed",
    ),
    untracked: changes.filter(
      (change) => nodeChangeTypes[change.type] === "untracked",
    ),
  };
}

const edgeChangeTypes = {
  add: "tracked",
  remove: "tracked",
  replace: "tracked",
  select: "untracked",
} satisfies Record<EdgeChange<Edge>["type"], "tracked" | "untracked">;

export function getEdgeChangesByType(changes: EdgeChange<Edge>[]) {
  return {
    tracked: changes.filter(
      (change) => edgeChangeTypes[change.type] === "tracked",
    ),
    untracked: changes.filter(
      (change) => edgeChangeTypes[change.type] === "untracked",
    ),
  };
}
