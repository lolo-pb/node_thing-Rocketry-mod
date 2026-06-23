import { nanoid } from "nanoid";

import { Handle, NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { Graph, GroupNode, isShader } from "@/store/project.types";

export function createNode<
  N extends Record<string, NodeType>,
  T extends keyof N & string,
>(
  type: T,
  position: { x: number; y: number },
  nodeTypes: N,
  parameters: Record<string, { value: string | null }>,
): Omit<ShaderNode, "data"> & {
  data: Omit<ShaderNode["data"], "type"> & { type: T };
} {
  return {
    id: newNodeId(type),
    type: "RenderShaderNode",
    position,
    data: {
      type,
      defaultValues: getDefaultValues(nodeTypes[type]),
      parameters: {
        ...getDefaultParameters(nodeTypes[type]),
        ...parameters,
      },
      uniforms: getDefaultUniforms(nodeTypes[type]),
    },
    selected: true,
  };
}

function getDefaultUniforms(type: NodeType) {
  if (!type.uniforms) return {};

  const uniforms: NodeData["uniforms"] = {};
  for (const [key, uniform] of Object.entries(type.uniforms)) {
    uniforms[key] = uniform.defaultValue;
  }

  return uniforms;
}

function getDefaultParameters(type: NodeType) {
  const parameters: NodeData["parameters"] = {};
  for (const [key, param] of Object.entries(type.parameters)) {
    if (param.type === "select") parameters[key] = { value: "0" };
  }

  return parameters;
}

function getDefaultValues(type: NodeType) {
  const defaultValues: NodeData["defaultValues"] = {};
  for (const [key, input] of Object.entries(type.inputs)) {
    defaultValues[key] = input.default ?? getDefaultDefaultValue(input);
  }
  return defaultValues;
}

function getDefaultDefaultValue(input: Handle): number | number[] {
  if (input.type === "color") return [0.8, 0.8, 0.8, 1];

  let value = 0;
  if (input.min !== undefined && input.max !== undefined)
    value = (input.min + input.max) / 2;
  if (input.step !== undefined)
    value = Math.round(value / input.step) * input.step;

  return value;
}

export function createGroup(
  position: { x: number; y: number },
  graph: Graph,
  nodeTypes: Record<string, NodeType>,
): Graph {
  const selectedNodes = graph.nodes.filter(
    (n) => n.selected && n.id !== "__output",
  );
  const s = (id: string) => selectedNodes.some((n) => n.id === id);

  const innerEdges = graph.edges.filter((e) => s(e.source) && s(e.target));
  const inputEdges = graph.edges.filter((e) => !s(e.source) && s(e.target));
  const outputEdges = graph.edges.filter((e) => s(e.source) && !s(e.target));

  const restNodes = graph.nodes.filter(
    (n) => !n.selected || n.id === "__output",
  );
  const restEdges = graph.edges.filter((e) => !s(e.source) && !s(e.target));

  const inputs = inputEdges
    .map((e) => {
      const target = selectedNodes.find((n) => n.id === e.target);
      if (!target) {
        console.warn(e);
        return null;
      }

      const targetType = isShader(target) ? nodeTypes[target.data.type] : null;
      const type = targetType?.inputs[e.targetHandle ?? ""].type ?? "color"; // TODO group type detection

      const node = createNode(
        `__group_input_${type}`,
        { x: -100, y: 0 },
        nodeTypes,
        { name: { value: `${targetType?.name ?? "Group"} ${e.targetHandle}` } },
      );
      node.selected = false;

      const innerEdge = {
        ...e,
        source: node.id,
        sourceHandle: "value",
      };

      return [node, innerEdge] as const;
    })
    .filter((x) => x !== null);

  const outputs = outputEdges
    .map((e) => {
      const source = selectedNodes.find((n) => n.id === e.source);
      if (!source) {
        console.warn(e);
        return null;
      }

      const sourceType = isShader(source) ? nodeTypes[source.data.type] : null;
      const type = sourceType?.outputs[e.sourceHandle ?? ""].type ?? "color"; // TODO group type detection

      const node = createNode(
        `__group_output_${type}`,
        { x: 100, y: 0 },
        nodeTypes,
        { name: { value: `${sourceType?.name ?? "Group"} ${e.sourceHandle}` } },
      );
      node.selected = false;

      const innerEdge = {
        ...e,
        target: node.id,
        targetHandle: "value",
      };

      return [node, innerEdge] as const;
    })
    .filter((x) => x !== null);

  const inputNodes = inputs.map(([n]) => n);
  const inputInnerEdges = inputs.map(([, e]) => e);
  const outputNodes = outputs.map(([n]) => n);
  const outputInnerEdges = outputs.map(([, e]) => e);

  const newGroup: GroupNode = {
    id: newNodeId("group"),
    type: "RenderGroupNode",
    position,
    data: {
      group: true,
      name: "New group",
      nodes: [...selectedNodes, ...inputNodes, ...outputNodes],
      edges: [...innerEdges, ...inputInnerEdges, ...outputInnerEdges],
    },
    selected: true,
  };

  const inputOuterEdges = inputEdges
    .map((e, i) => {
      const source = restNodes.find((n) => n.id === e.source);
      if (!source) {
        console.warn(e);
        return null;
      }

      const edge = {
        ...e,
        target: newGroup.id,
        targetHandle: inputNodes[i].id,
      };
      return edge;
    })
    .filter((x) => x !== null);

  const outputOuterEdges = outputEdges
    .map((e, i) => {
      const target = restNodes.find((n) => n.id === e.target);
      if (!target) {
        console.warn(e);
        return null;
      }

      const edge = {
        ...e,
        source: newGroup.id,
        sourceHandle: outputNodes[i].id,
      };
      return edge;
    })
    .filter((x) => x !== null);

  return {
    nodes: [...restNodes, newGroup],
    edges: [...restEdges, ...inputOuterEdges, ...outputOuterEdges],
  };
}

function newNodeId(type: string) {
  return `${type.startsWith("__") ? `${type}_` : ""}${nanoid()}`;
}
