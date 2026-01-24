import { Chip } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { ErrorBoundary } from "../../../common/errorBoundery";
import { DiffViewer } from "../diffViewer";
import { ChangedFile } from "../../../../api/types/ChangedFile";
import { useGetRawFile } from "../../../../api/queries/useGetRawFile";
import { useEffect } from "react";
import { useBooleanState } from "../../../../hooks/useBooleanState";
import { usePRStore } from "../../../../store/pullRequestStore";
import { useMemo } from "react";
import { generateDiffFile } from "@git-diff-view/file";
import { getFileType } from "../../../../utils/getFileType";

interface FileProps {
  repoId: number;
  prId: number;
  file: ChangedFile;
}

// fileStatus: 1 = Added, 2 = Modified, 3 = Deleted
const getFileStatusInfo = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "Added",
        color: "success" as const,
        bgColor: "bg-green-50",
      };
    case 2:
      return {
        label: "Modified",
        color: "primary" as const,
        bgColor: "bg-blue-50",
      };
    case 3:
      return {
        label: "Deleted",
        color: "error" as const,
        bgColor: "bg-red-50",
      };
    default:
      return {
        label: "Unknown",
        color: "default" as const,
        bgColor: "bg-gray-50",
      };
  }
};

export function FileDiff({ repoId, prId, file }: FileProps) {
  const { mutate: getFile, data: rawFile } = useGetRawFile(repoId, prId);
  const { comments } = usePRStore();
  const [isExpand, , , setReverse] = useBooleanState(false);
  const statusInfo = getFileStatusInfo(file.fileStatus);

  console.log("FileDiff rendered for:", file.fileName, "isExpand:", isExpand);

  useEffect(() => {
    if (isExpand) {
      getFile(file);
    }
  }, [isExpand]);

  /* eslint-disable no-console */
  const diff = useMemo(() => {
    if (!rawFile) return null;

    const startCalc = performance.now();
    const instance = generateDiffFile(
      "oldFileName",
      rawFile.oldCode === null ? "" : rawFile.oldCode,
      "newFileName",
      rawFile.newCode === null ? "" : rawFile.newCode,
      getFileType(file.oldPath),
      getFileType(file.newPath)
    );
    instance.init();
    instance.buildSplitDiffLines();
    instance.buildUnifiedDiffLines();
    const endCalc = performance.now();

    console.log(
      `[Diff Calculation - Parent] ${file.fileName} Execution time: ${(
        endCalc - startCalc
      ).toFixed(4)}ms`
    );
    return instance;
  }, [rawFile, file]);
  /* eslint-enable no-console */

  return (
    <div
      className={`border border-gray-200 rounded-lg overflow-hidden mb-2 bg-white ${statusInfo.bgColor}`}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => setReverse()}
      >
        <div className="flex items-center gap-3 w-full">
          <h2 className="text-lg font-bold truncate">{file.newPath}</h2>
          <Chip
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            variant="outlined"
          />
        </div>
        <ArrowDropDownIcon
          className={`transition-transform duration-300 ${
            isExpand ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isExpand ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-200 p-4">
            <ErrorBoundary>
              {rawFile ? (
                diff && (
                  <DiffViewer
                    diff={diff}
                    comments={comments.filter((comment) => comment.position)}
                    file={file}
                  />
                )
              ) : (
                <div className="flex justify-center items-center py-8 text-gray-400">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

