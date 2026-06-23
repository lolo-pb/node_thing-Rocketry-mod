import { NodeType } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";

export function useNodeTypes(): Record<string, NodeType> {
  return NODE_TYPES;
}
