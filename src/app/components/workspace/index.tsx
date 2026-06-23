"use client";

import { Fragment, useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LuChevronRight, LuGroup, LuLayers2, LuX } from "react-icons/lu";

import { useProjectStore } from "@/store/project.store";
import { useAssetStore } from "@/store/asset.store";
import { Button } from "@/ui/button";
import { Sidebar } from "./sidebar";
import { Viewport } from "./viewport";
import { Graph, GroupNode, isGroup } from "@/store/project.types";

export function Workspace() {
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);
  const currentGroup = useProjectStore((s) => s.currentGroup);

  const closeGroup = useProjectStore((s) => s.closeGroup);

  const [storeHydrated, setStoreHydrated] = useState(false);
  useEffect(() => {
    useAssetStore.persist.onFinishHydration(() => {
      setStoreHydrated(true);
    });
    useAssetStore.persist.rehydrate();

    setStoreHydrated(useAssetStore.persist.hasHydrated());
  }, []);

  if (!storeHydrated)
    return (
      <div className="relative w-full h-full flex-1 grid place-items-center rounded-2xl border border-white/15 bg-neutral-950">
        <div className="font-semibold text-lg">Loading...</div>
      </div>
    );

  const groups: GroupNode[] = [];
  const layer = layers[currentLayer];

  let graph: Graph = layer;
  for (const groupId of currentGroup) {
    const group = graph.nodes.find((n) => n.id === groupId);
    if (!group || !isGroup(group)) break;

    groups.push(group);
    graph = group.data;
  }

  return (
    <ReactFlowProvider>
      <div className="flex flex-col w-full h-full flex-1 min-h-0 gap-2">
        {currentGroup.length ? (
          <div className="flex flex-row gap-1 items-center">
            <Button size="sm" variant="ghost" onClick={() => closeGroup(0)}>
              <LuLayers2 /> {layer.name}
            </Button>
            {groups.map((group, i) => (
              <Fragment key={group.id}>
                <LuChevronRight className="text-white/40" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => closeGroup(i + 1)}
                >
                  <LuGroup /> {group.data.name}
                </Button>
              </Fragment>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => closeGroup()}
              className="ml-auto"
            >
              <LuX /> Exit
            </Button>
          </div>
        ) : null}

        <div className="relative w-full h-full flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15">
          <Sidebar />
          <Viewport />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
