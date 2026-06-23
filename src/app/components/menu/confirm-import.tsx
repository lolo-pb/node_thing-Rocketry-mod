import { Dialog } from "@/ui/dialog";
import { ImportResult } from "@/utils/project";
import { Dispatch, SetStateAction } from "react";

type ConfirmImportProps = {
  importResult: ImportResult;
  setImportResult: Dispatch<SetStateAction<ImportResult>>;
};

export function ConfirmImport({
  importResult,
  setImportResult,
}: ConfirmImportProps) {
  return (
    <Dialog
      trigger={null}
      title="Unsupported project"
      description="This project contains shaders that are not built into this app."
      open={importResult !== undefined}
      onOpenChange={(open) => {
        if (!open) setImportResult(undefined);
      }}
    >
      <p className="text-sm/4">
        Remove these nodes using the older app before importing:
      </p>
      <ul className="my-4 text-base/5 font-medium">
        {importResult?.unsupportedNodeTypes.map((type) => (
          <li key={type} className="ml-2">
            {type}
          </li>
        ))}
      </ul>
      <p className="text-sm/4">The current project was not changed.</p>
    </Dialog>
  );
}
