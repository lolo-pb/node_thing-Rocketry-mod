import { NodeProps } from "@xyflow/react";
import { useState } from "react";

import { GroupNode, isShader } from "@/store/project.types";
import { Button } from "@/ui/button";
import { useProjectStore } from "@/store/project.store";

import { ShaderNodeContainer } from "../shader-node";
import { GroupHandle } from "./group-handle";
import { GroupMenu } from "./group-menu";
import { Input } from "@/ui/input";

export function RenderGroupNode(props: NodeProps<GroupNode>) {
  const openGroup = useProjectStore((s) => s.openGroup);
  const renameGroup = useProjectStore((s) => s.renameGroup);
  const [editingName, setEditingName] = useState(false);

  const nodes = props.data.nodes;
  const inputs = nodes
    .filter(isShader)
    .filter((n) => n.data.type.startsWith("__group_input"));
  const outputs = nodes
    .filter(isShader)
    .filter((n) => n.data.type.startsWith("__group_output"));

  const rename = (name: string) => {
    renameGroup(name, props.id);
    setEditingName(false);
  };

  return (
    <ShaderNodeContainer {...props}>
      <div className="text-xs/5 px-3 py-1.5 font-bold border-b border-white/15 bg-clip-padding rounded-t-[11px] bg-amber-400/15">
        <div className="flex items-center gap-1 min-w-40">
          {editingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const newName = formData.get("name")?.toString() || "";
                rename(newName);
              }}
            >
              <Input
                ref={(self) => {
                  // Set a short timeout because radix messes with focus
                  setTimeout(() => self?.focus(), 1);
                }}
                size="sm"
                variant="outline"
                name="name"
                defaultValue={props.data.name}
                onBlur={(e) => rename(e.target.value)}
                className="-mx-2 px-1.75 py-1 -my-1.5 !text-xs/4 w-full max-w-36 bg-black/40"
              />
            </form>
          ) : (
            <div>{props.data.name || "(Unnamed group)"}</div>
          )}
          <GroupMenu {...props} rename={() => setEditingName(true)} />
        </div>
      </div>

      <div className="p-2 grid grid-cols-[auto_auto_auto] gap-x-2">
        {inputs.map(({ id, data }) => (
          <GroupHandle
            key={id}
            id={id}
            type="target"
            input={{
              name: data.parameters.name?.value ?? "Input",
              type: id.endsWith("color") ? "color" : "number",
            }}
          />
        ))}

        {outputs.map(({ id, data }) => (
          <GroupHandle
            key={id}
            id={id}
            type="source"
            input={{
              name: data.parameters.name?.value ?? "Output",
              type: id.endsWith("color") ? "color" : "number",
            }}
          />
        ))}

        <Button
          variant="outline"
          className="col-span-3 mt-2"
          onClick={() => openGroup(props.id)}
        >
          Edit
        </Button>
      </div>
    </ShaderNodeContainer>
  );
}
