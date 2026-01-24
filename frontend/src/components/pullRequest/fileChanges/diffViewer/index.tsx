import { DiffView, DiffModeEnum, DiffFile } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";
import { useMemo } from "react";
import { FileMarkDownEditor } from "../fileMarkDownEditor";
import { CommentThread } from "../commentThread";
import { ChangedFile } from "../../../../api/types/ChangedFile";
import { Comment } from "../../../../api/types/Comment";

interface DiffViewerProps {
  diff: DiffFile;
  comments: Comment[];
  file: ChangedFile;
}

export function DiffViewer({ diff, comments, file }: DiffViewerProps) {
  const getLinesAndType = (
    side: number,
    diffFile: DiffFile,
    lineNumber: number
  ) => {
    // oldCode 선택한 경우
    if (side === 1) {
      const idx = diffFile
        .getBundle()
        .splitLeftLines.findIndex((item) => item.lineNumber === lineNumber);
      const oldline = diffFile.getBundle().splitLeftLines[idx].lineNumber;
      const newline =
        diffFile.getBundle().splitLeftLines[idx].diff?.newLineNumber;
      const linetype = diffFile.getBundle().splitLeftLines[idx].diff?.type;
      return { oldline, newline, linetype };
    } else {
      // Code 선택한 경우
      const idx = diffFile
        .getBundle()
        .splitRightLines.findIndex((item) => item.lineNumber === lineNumber);
      const newline = diffFile.getBundle().splitRightLines[idx].lineNumber;
      const oldline =
        diffFile.getBundle().splitRightLines[idx].diff?.oldLineNumber;
      const linetype = diffFile.getBundle().splitRightLines[idx].diff?.type;
      return { oldline, newline, linetype };
    }
  };

  const parseComments = (comments: Comment[]) => {
    const extendData: {
      oldFile: { [key: number]: { data: Comment[] } };
      newFile: { [key: number]: { data: Comment[] } };
    } = {
      oldFile: {},
      newFile: {},
    };
    comments.forEach((comment) => {
      if (comment.fileId === file.fileId) {
        if (
          comment.position?.newLine !== undefined &&
          comment.position.newLine !== null &&
          (comment.position.oldLine === null || comment.position.oldLine === 0)
        ) {
          const currentComments =
            extendData.newFile[comment.position.newLine]?.data ?? [];
          extendData.newFile = {
            ...extendData.newFile,
            [comment.position.newLine]: {
              data: [...currentComments, comment],
            },
          };
        } else if (
          comment.position?.oldLine !== undefined &&
          comment.position.oldLine !== null
        ) {
          const currentComments =
            extendData.oldFile[comment.position.oldLine]?.data ?? [];
          extendData.oldFile = {
            ...extendData.oldFile,
            [comment.position.oldLine]: {
              data: [...currentComments, comment],
            },
          };
        }
      }
    });
    console.log(extendData);
    return extendData;
  };

  /* eslint-disable no-console */
  const startTotal = performance.now();
  // diff is now passed as a prop, ensuring it survives as long as the parent is mounted.
  const endTotal = performance.now();
  console.log(
    `[Diff Viewer] Execution total (including prop access): ${(
      endTotal - startTotal
    ).toFixed(4)}ms`
  );
  /* eslint-enable no-console */
  const parsedComments = useMemo(() => {
    return parseComments(comments);
  }, [comments]);

  return (
    <div className="w-full border">
      <DiffView
        diffFile={diff}
        extendData={parsedComments}
        diffViewAddWidget
        renderExtendLine={({ data }) => {
          return (
            <div className="border p-2">
              {data.map((comment: Comment) => (
                <CommentThread key={comment.commentId} comment={comment} />
              ))}
            </div>
          );
        }}
        renderWidgetLine={({ diffFile, side, lineNumber, onClose }) => {
          // 0 그대로 , 1 추가, 2 제거
          const { oldline, newline, linetype } = getLinesAndType(
            side,
            diffFile,
            lineNumber
          );
          return (
            <FileMarkDownEditor
              newStartLine={newline === undefined ? null : newline}
              newEndLine={newline === undefined ? null : newline}
              oldStartLine={oldline === undefined ? null : oldline}
              oldEndLine={oldline === undefined ? null : oldline}
              onClose={onClose}
              lineType={linetype === undefined ? 0 : linetype}
              file={file}
            />
          );
        }}
        diffViewTheme={"light"}
        diffViewHighlight={true}
        diffViewMode={DiffModeEnum.Split}
        diffViewWrap={true}
      />
    </div>
  );
}
