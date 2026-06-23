import { Menubar } from "@/ui/menu-bar";
import { AnimationMenu } from "./components/menu/animation";
import { EditMenu } from "./components/menu/edit";
import { FileMenu } from "./components/menu/file";
import { LayerMenu } from "./components/menu/layer";
import { ViewMenu } from "./components/menu/view";
import { Renderer } from "./components/renderer";
import { Workspace } from "./components/workspace";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr] fixed w-screen h-screen bg-neutral-900">
      {/* header */}
      <div className="flex items-center px-4 pt-3 gap-4">
        <Image
          src="/logo.svg"
          alt="node_thing"
          width={90}
          height={30}
          priority
        />

        <Menubar className="mr-auto">
          <FileMenu />
          <EditMenu />
          <ViewMenu />
          <LayerMenu />
          <AnimationMenu />
        </Menubar>
      </div>

      {/* Main panel */}
      <main className="flex flex-row min-h-0 max-w-full select-none p-2">
        <Workspace />

        {/* Output panel */}
        <div className="relative min-h-0">
          <div className="absolute inset-0 left-2 z-10">
            <Renderer />
          </div>

          {/* CSS resize hack */}
          <div className="absolute left-0.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded bg-neutral-600 cursor-col-resize" />
          <div className="relative top-1/2 -translate-y-1/2 h-4 w-full resize-x min-w-120 max-w-[70vw] -ml-1.5 overflow-hidden [direction:rtl] opacity-0 cursor-col-resize" />
        </div>
      </main>
    </div>
  );
}
