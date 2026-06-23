import JSZip from "jszip";

import { imageTypeSchema } from "@/schemas/asset.schema";
import { useAssetStore } from "@/store/asset.store";
import { useProjectStore } from "@/store/project.store";
import { openFile, saveFile } from "./file";
import { getImageType } from "./image";
import { GroupNode, isGroup, isShader, Project } from "@/store/project.types";
import { NODE_TYPES } from "./node-type";

export async function importProjectFromFile() {
  const file = await openFile(["application/zip"]);
  if (file) return importProject(file);
}

export async function exportProjectFromFile() {
  const file = await exportProject();

  saveFile({
    suggestedName: "project.zip",
    types: [{ accept: { "application/zip": [".zip"] } }],
    data: file,
  });
}

export async function exportProject() {
  const project = useProjectStore.getState().exportProject();
  const images = useAssetStore.getState().images;

  const zip = new JSZip();
  zip.file("project.json", JSON.stringify(project));

  const imagesFolder = zip.folder("images");
  if (imagesFolder !== null) {
    for (const [name, asset] of Object.entries(images)) {
      imagesFolder.file(name, asset.data);
    }
  }

  return await zip.generateAsync({ type: "blob" });
}

export async function importProject(file: File) {
  const zip = await JSZip.loadAsync(file);
  const project = await getProject(zip);

  async function doImport() {
    useAssetStore.persist.clearStorage();
    useAssetStore.setState({ images: {} });

    for (const filename of getAssetFilenames(zip)) {
      try {
        const { name, asset } = await getAsset(zip, filename);
        useAssetStore.getState().addImage(name, asset);
      } catch {
        console.warn(`Import: asset file ${filename} not found, skipping`);
      }
    }

    useProjectStore.getState().importProject(project);
  }

  const unsupportedNodeTypes = getUnsupportedNodeTypes(project);
  if (unsupportedNodeTypes.length) return { unsupportedNodeTypes };

  await doImport();
}

export type ImportResult = Awaited<ReturnType<typeof importProject>>;

export function getUnsupportedNodeTypes(project: Project) {
  const visit = (nodes: Project["layers"][number]["nodes"]): string[] =>
    nodes.flatMap((node) => {
      if (isGroup(node)) return visit((node as GroupNode).data.nodes);
      if (isShader(node) && !Object.hasOwn(NODE_TYPES, node.data.type))
        return [node.data.type];
      return [];
    });

  return [...new Set(project.layers.flatMap((layer) => visit(layer.nodes)))];
}

function getAssetFilenames(zip: JSZip) {
  return Object.keys(zip.files).filter(
    (f) => f.startsWith("images/") && !f.endsWith("/"),
  );
}

async function getAsset(zip: JSZip, filename: string) {
  const fileObj = zip.file(filename);
  if (!fileObj) throw new Error("file not found");

  const arrayBuffer = await fileObj.async("arraybuffer");
  const data = new Uint8Array(arrayBuffer);

  const prefix = "images/";
  const name = filename.startsWith(prefix)
    ? filename.substring(prefix.length)
    : filename;

  const type = imageTypeSchema.parse(getImageType(name));
  return { name, asset: { type, data } };
}

async function getProject(zip: JSZip) {
  const jsonFile = zip.file("project.json");
  if (!jsonFile) {
    throw new Error("project.json not found");
  }

  const json = await jsonFile.async("string");
  const project = JSON.parse(json);

  // TODO add zod validation
  return project as Project;
}
