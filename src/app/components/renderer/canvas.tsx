"use client";

import cn from "classnames";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";

import { useAnimationStore } from "@/store/animation.store";
import { useProjectStore } from "@/store/project.store";
import { useUtilityStore } from "@/store/utility.store";
import { usePropRef } from "@/utils/use-prop-ref";
import { render } from "./implementation/renderer";
import { useGPU } from "./use-gpu";
import { usePipeline } from "./use-pipeline";
import { useTextureCache } from "./use-texture-cache";
import { useWebGPUContext } from "./use-webgpu-context";
import { useConfigStore } from "@/store/config.store";
import { zip } from "@/utils/zip";
import { expandGroups } from "./pipeline";

const SAMPLER_DESC: GPUSamplerDescriptor = {
  magFilter: "linear",
  minFilter: "linear",
};

export function Canvas() {
  /*
   * State
   */
  const { canvas: canvasProperties } = useProjectStore((s) => s.properties);
  const layers = useProjectStore((s) => s.layers);
  const currentLayer = useProjectStore((s) => s.currentLayer);

  const animation = useAnimationStore();
  const updateAnimation = useAnimationStore((s) => s.update);
  const setAnimationState = useAnimationStore((s) => s.setState);

  const view = useConfigStore((s) => s.view);

  const canvas = useUtilityStore((s) => s.canvas);
  const setCanvas = useUtilityStore((s) => s.setCanvas);
  const nextRenderFinishedCallback = useUtilityStore(
    (s) => s.nextRenderFinishedCallback,
  );
  const onNextRenderFinished = useUtilityStore((s) => s.onNextRenderFinished);
  const _recorder = useUtilityStore((s) => s.recorder);

  const frameRequestHandle = useRef<number | null>(null);

  /*
   * Handle resize
   */
  useLayoutEffect(() => {
    const scale = view.zoom / window.devicePixelRatio;
    canvas?.style.setProperty("width", `${canvas.width * scale}px`);
    canvas?.style.setProperty("height", `${canvas.height * scale}px`);
  }, [canvas, view.zoom, canvasProperties]);

  /*
   * Get GPU device and configure canvas WebGPU context
   */
  const device = useGPU();
  const ctx = useWebGPUContext(device, canvas);

  /*
   * Texture cache and sampler
   */
  const textures = useTextureCache(device);
  const sampler = useMemo(
    () => device?.createSampler(SAMPLER_DESC) ?? null,
    [device],
  );

  /*
   * Get the WebGPU pipeline
   */
  const pipeline = usePipeline(device, ctx);

  /*
   * Render a frame
   */
  const animationState = usePropRef(animation.state);
  const animationSpeed = usePropRef(animation.options.speed);
  const framerateLimit = usePropRef(animation.options.framerateLimit);
  const recordingFramerate = usePropRef(animation.recordingOptions.framerate);
  const recording = usePropRef(animation.recording);
  const recorder = usePropRef(_recorder);

  const frameIndex = useRef(0);
  const elapsedTime = useRef(0);
  useEffect(() => {
    frameIndex.current = animation.frameIndex;
    elapsedTime.current = animation.time;
  }, [animation.frameIndex, animation.time]);

  const flatLayers = useMemo(() => layers.map(expandGroups), [layers]);

  const lastFrameTime = useRef(performance.now());
  const lastFrameError = useRef(0);

  ///LOLO weird stuff, probably nasty
  const manualRender = useCallback(async () => {
    // Guard: Ensure WebGPU is initialized before trying to draw
    if (!canvas || !ctx || !device || !pipeline || !sampler) return;

    let renderPipeline = zip(pipeline, flatLayers);
    if (view.display !== "final-render") {
      renderPipeline = renderPipeline.slice(0, currentLayer + 1);
    }

    const target = ctx.getCurrentTexture();
    for (const [p, layer] of renderPipeline) {
      if (p) {
        render(
          device,
          p,
          layer,
          target,
          textures,
          sampler,
          frameIndex.current,
          elapsedTime.current,
        );
      }
    }

    // Finish the GPU commands
    await device.queue.onSubmittedWorkDone();
    console.log("Manual render complete");
  }, [
    canvas,
    ctx,
    device,
    pipeline,
    textures,
    sampler,
    flatLayers,
    currentLayer,
    view.display,
  ]);
  ///LOLO weird stuff end

  useEffect(() => {
    const cancel = () => {
      if (frameRequestHandle.current)
        cancelAnimationFrame(frameRequestHandle.current);
    };

    const frame = () => {
      //frameRequestHandle.current = requestAnimationFrame(renderFrame);
    };

    cancel();

    if (!canvas || !ctx || !device || !pipeline || !sampler) return;

    const renderFrame = async () => {
      cancel();

      const minFrametime = 1000 / framerateLimit.current;

      const now = performance.now();
      const deltaTime = recording.current
        ? 1000 / recordingFramerate.current
        : now - lastFrameTime.current;
      if (
        animationState.current !== "running" ||
        recording.current ||
        deltaTime + lastFrameError.current > minFrametime
      ) {
        let renderPipeline = zip(pipeline, flatLayers);
        if (view.display !== "final-render") {
          renderPipeline = renderPipeline.slice(0, currentLayer + 1);
        }

        const target = ctx.getCurrentTexture();
        for (const [pipeline, layer] of renderPipeline) {
          if (pipeline) {
            console.log("----rendered");
            render(
              device,
              pipeline,
              layer,
              target,
              textures,
              sampler,
              frameIndex.current,
              elapsedTime.current,
            );
          }
        }

        if (nextRenderFinishedCallback) {
          nextRenderFinishedCallback(canvas);
          onNextRenderFinished(null);
        }

        if (recorder.current) {
          if (recording.current) {
            recorder.current.source.add(
              elapsedTime.current / 1000,
              deltaTime / 1000,
            );
          } else {
            recorder.current.onRecordingFinished();
          }
        }

        await device.queue.onSubmittedWorkDone();

        if (animationState.current === "running") {
          updateAnimation(deltaTime * animationSpeed.current);

          lastFrameTime.current = now;
          lastFrameError.current = deltaTime - minFrametime;
        }
      }

      if (animationState.current === "running") frame();
      if (animationState.current === "frame") setAnimationState("stopped");
    };

    lastFrameTime.current = performance.now();
    cancel();
    if (false) {
      frame();
    }

    return () => {
      cancel();
    };
  }, [
    canvas,
    ctx,
    device,
    pipeline,
    textures,
    sampler,
    animation.state,
    nextRenderFinishedCallback,
    onNextRenderFinished,
    framerateLimit,
    animationState,
    animationSpeed,
    setAnimationState,
    updateAnimation,
    recording,
    recordingFramerate,
    recorder,
    flatLayers,
    currentLayer,
    view.display,
  ]);

  return (
    // 1. The Wrapper: "relative" allows us to position children absolutely inside it
    <div className="relative w-full h-full">
      {/* 2. The Button: "absolute" floats it on top. z-10 ensures it's clickable. */}
      <button
        onClick={manualRender}
        className="absolute top-4 left-4 z-10 px-4 py-2 bg-white text-black font-bold rounded shadow-lg hover:bg-gray-200"
      >
        Render Frame
      </button>

      {/* 3. The Canvas: Your original canvas code */}
      <canvas
        ref={(ref) => setCanvas(ref)}
        id="main-canvas"
        className={cn("bg-pattern-squares bg-neutral-950 text-neutral-900", {
          "[image-rendering:pixelated]": view.zoom > 1,
        })}
        {...canvasProperties}
      />
    </div>
  );
}
