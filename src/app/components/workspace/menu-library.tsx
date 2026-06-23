import * as Accordion from "@radix-ui/react-accordion";
import { Fragment } from "react";

import { NodeType } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/ui/accordion";
import { useNodeTypes } from "@/utils/use-node-types";
import { RenderShaderNode } from "./shader-node";

type ShaderListProps = {
  nodeKey: string;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
};

const SidebarShader = ({ nodeKey, onDragStart }: ShaderListProps) => {
  return (
    <div
      className="cursor-grab"
      onDragStart={(event) => onDragStart(event, nodeKey)}
      draggable
    >
      <RenderShaderNode
        mock
        id={nodeKey}
        data={{
          type: nodeKey,
          defaultValues: {},
          parameters: {},
        }}
        selected={false}
        type={""}
        dragging={false}
        zIndex={0}
        selectable={false}
        deletable={false}
        draggable={false}
        isConnectable={false}
        positionAbsoluteX={0}
        positionAbsoluteY={0}
      />
    </div>
  );
};

export function MenuLibrary() {
  const nodeTypes = useNodeTypes();
  const currentGroup = useProjectStore((s) => s.currentGroup);

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("type", nodeType);
  };

  const nodesByCategory: Record<string, Record<string, NodeType>> = {};
  Object.entries(nodeTypes)
    .filter(([key]) => !key.startsWith("__output"))
    .forEach(([key, type]) => {
      if (type.category === "Group" && !currentGroup.length) return;
      if (!nodesByCategory[type.category]) nodesByCategory[type.category] = {};
      nodesByCategory[type.category][key] = type;
    });

  return (
    <div className="border-t border-white/15 flex flex-col h-full">
      <div className="grow overflow-auto min-h-0 border-b border-white/15">
        <Accordion.Root type="multiple">
          {Object.entries(nodesByCategory).map(([category, types]) => (
            <Fragment key={category}>
              <AccordionItem value={category}>
                <AccordionTrigger className="font-semibold text-sm/4 hover:bg-white/8 transition duration-80">
                  {category}
                </AccordionTrigger>
                <AccordionContent className="border-b border-white/15">
                  <div className="flex flex-col gap-3 p-1">
                    {Object.entries(types).map(([key]) => (
                      <SidebarShader
                        key={key}
                        nodeKey={key}
                        onDragStart={onDragStart}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Fragment>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
}
