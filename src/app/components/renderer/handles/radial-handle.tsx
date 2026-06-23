"use client";

import cn from "classnames";
import { CSSProperties, useLayoutEffect, useMemo, useRef } from "react";

import { useConfigStore } from "@/store/config.store";
import { Rectangle } from "@/utils/point";
import { useMove } from "./use-move";
import { DIR, useResize } from "./use-resize";
import { useRotate } from "./use-rotate";
import { NodeData } from "@/schemas/node.schema";
import { useProjectStore } from "@/store/project.store";

type RadialHandleProps = { nodeId: string; node: NodeData };

export function RadialHandle({ nodeId, node }: RadialHandleProps) {
  const view = useConfigStore((s) => s.view);
  const updateNodeUniform = useProjectStore((s) => s.updateNodeUniform);

  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const { bounds, angle, innerRadius } = useMemo(() => {
    const position = node.uniforms!.position as [number, number];
    const size = node.uniforms!.size as [number, number];
    const angle = node.uniforms!.angle as number;
    const innerRadius = node.uniforms!.innerRadius as number;

    const bounds = {
      x: position[0] - size[0],
      y: position[1] - size[1],
      w: size[0] * 2,
      h: size[1] * 2,
    };

    return { bounds, angle, innerRadius };
  }, [node.uniforms]);

  const setBounds = (bounds: Rectangle) => {
    const position = [bounds.x + bounds.w / 2, bounds.y + bounds.h / 2];
    const size = [bounds.w / 2, bounds.h / 2];

    updateNodeUniform(nodeId, "position", position);
    updateNodeUniform(nodeId, "size", size);
  };

  const setAngle = (angle: number) => {
    updateNodeUniform(nodeId, "angle", angle);
  };

  const setInnerRadius = (innerRadius: number) => {
    updateNodeUniform(nodeId, "innerRadius", innerRadius);
  };

  const resizeN = useResize(ref, setBounds, "N", { centered: true, angle });
  const resizeE = useResize(ref, setBounds, "E", { centered: true, angle });
  const moveHandler = useMove(ref, setBounds);
  const rotateHandler = useRotate(ref, setAngle);
  const resizeInnerHandler = useResize(
    innerRef,
    ({ h }) => setInnerRadius(Math.min(h / bounds.h, 1)),
    "S",
    {
      centered: true,
      angle,
      ratio: "preserve",
      constrainRatio: true,
    },
  );

  const resizeHandlers = {
    N: resizeN,
    E: resizeE,
  };

  useLayoutEffect(() => {
    const scale = view.zoom / window.devicePixelRatio;
    ref.current?.style.setProperty("top", `${bounds.y * scale}px`);
    ref.current?.style.setProperty("left", `${bounds.x * scale}px`);
    ref.current?.style.setProperty("width", `${bounds.w * scale}px`);
    ref.current?.style.setProperty("height", `${bounds.h * scale}px`);
  }, [bounds, view.zoom]);

  useLayoutEffect(() => {
    const scale = view.zoom / window.devicePixelRatio;
    innerRef.current?.style.setProperty(
      "top",
      `calc(${1 - innerRadius} * 50% - ${innerRadius} * 1px)`,
    );
    innerRef.current?.style.setProperty(
      "left",
      `calc(${1 - innerRadius} * 50% - ${innerRadius} * 1px)`,
    );
    innerRef.current?.style.setProperty(
      "width",
      `${bounds.w * innerRadius * scale}px`,
    );
    innerRef.current?.style.setProperty(
      "height",
      `${bounds.h * innerRadius * scale}px`,
    );
  }, [bounds, view.zoom, innerRadius]);

  useLayoutEffect(() => {
    ref.current?.style.setProperty(
      "transform",
      `rotate(${angle * (180 / Math.PI)}deg)`,
    );
  }, [angle]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute rounded-[50%] border border-teal-300 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black cursor-move",
        { "bg-radial from-red-500/40 to-transparent": false },
      )}
      style={
        {
          "--tw-gradient-from-position": `${100 * innerRadius}%`,
        } as CSSProperties
      }
      onPointerDown={moveHandler}
    >
      <div
        className="absolute w-0 border-l border-teal-300 outline outline-black"
        style={{
          bottom: 1,
          left: "calc(50% - 0.5px)",
          height: `calc(${50 * (1 - innerRadius)}% - 2px)`,
        }}
      />
      <div
        className="absolute w-0 border-l border-teal-300 outline outline-black"
        style={{
          top: 1,
          left: "calc(50% - 0.5px)",
          height: `calc(${50 * (1 - innerRadius)}% - 2px)`,
        }}
      />
      <div
        className="absolute h-0 border-t border-teal-300 outline outline-black"
        style={{
          left: 1,
          top: "calc(50% - 0.5px)",
          width: `calc(${50 * (1 - innerRadius)}% - 2px)`,
        }}
      />
      <div
        className="absolute h-0 border-t border-teal-300 outline outline-black"
        style={{
          right: 1,
          top: "calc(50% - 0.5px)",
          width: `calc(${50 * (1 - innerRadius)}% - 2px)`,
        }}
      />
      <div
        ref={innerRef}
        className="absolute rounded-[50%] border border-teal-300 shadow-[0_0_0_1px,inset_0_0_0_1px] shadow-black cursor-move"
      >
        <div
          className={cn(
            "absolute rounded-full w-1.75 h-1.75 border border-teal-300 bg-black outline outline-black",
            "cursor-grab",
          )}
          style={{
            top:
              innerRadius === 0 ? "calc(100% - 4.5px)" : "calc(100% - 3.5px)",
            left: innerRadius === 0 ? "calc(50% - 4.5px)" : "calc(50% - 3.5px)",
          }}
          onPointerDown={resizeInnerHandler}
        />
      </div>

      <div
        className={cn(
          "absolute w-0 h-5 border-l border-teal-300 outline outline-black",
        )}
        style={{ top: "calc(0% - 24px)", left: "calc(50% - 0.5px)" }}
      />
      {(["N", "E"] as const).map((dir) => (
        <div
          key={dir}
          className={cn(
            "absolute rounded-xs w-1.75 h-1.75 border border-teal-300 bg-black outline outline-black",
            "cursor-grab",
          )}
          style={{ ...DIR[dir] }}
          onPointerDown={resizeHandlers[dir]}
        />
      ))}
      <div
        className={cn(
          "absolute rounded-full w-1.75 h-1.75 border border-teal-300 bg-black outline outline-black",
          "cursor-grab",
        )}
        style={{ top: "calc(0% - 24px)", left: "calc(50% - 3.5px)" }}
        onPointerDown={rotateHandler}
      />
    </div>
  );
}
