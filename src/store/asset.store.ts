import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import {
  type ImageAsset,
  type AssetsState,
  assetsStateSchema,
} from "@/schemas/asset.schema";
import { opfsStorage } from "./storage/opfs-storage";

const initialState: AssetsState = { images: {} };

export const useAssetStore = create(
  persist(
    combine(initialState, (set) => ({
      addImage: (name: string, data: ImageAsset) => {
        set(({ images }) => ({
          images: {
            ...images,
            [name]: data,
          },
        }));
      },

      removeImage: (name: string) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(({ images: { [name]: _, ...rest } }) => ({ images: rest })),

      clear: () => set(initialState),
    })),
    {
      name: "asset-storage-v2",
      storage: opfsStorage,
      skipHydration: true,
      onRehydrateStorage: () => (_, err) => {
        if (err) console.error(err);
      },
      merge: (persisted, current) => {
        const persistedImages = assetsStateSchema.parse(persisted).images;

        return {
          ...current,
          images: {
            ...current.images,
            ...persistedImages,
          },
        };
      },
    },
  ),
);
