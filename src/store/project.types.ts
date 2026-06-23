import { Edge, Node } from "@xyflow/react";

import { ShaderNode } from "@/schemas/node.schema";
import { Command } from "./types/command";

export type GroupData = {
  group: true;
  name: string;

  nodes: (ShaderNode | GroupNode)[];
  edges: Edge[];
};

export type GroupNode = Node<GroupData>;

export type Graph = Pick<Layer, "nodes" | "edges">;
export type FlatGraph = {
  nodes: ShaderNode[];
  edges: Edge[];
};

export function isShader(node: ShaderNode | GroupNode): node is ShaderNode {
  return (node as ShaderNode).data.type !== undefined;
}

export function isGroup(node: ShaderNode | GroupNode): node is GroupNode {
  return (node as GroupNode).data.group !== undefined;
}

export function isEdgeBetweenShaders(
  edge: Edge,
  nodes: (ShaderNode | GroupNode)[],
) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);

  return source && target && isShader(source) && isShader(target);
}

export type Layer = {
  nodes: (ShaderNode | GroupNode)[];
  edges: Edge[];

  position: { x: number; y: number };
  size: { width: number; height: number };

  id: string;
  name: string;
};

export type ProjectProperties = {
  canvas: {
    width: number;
    height: number;
  };
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
  currentGroup: string[];

  properties: ProjectProperties;
  projectName: string;

  history: Command[];
  done: number;
};

export type StoredProject = Project;
