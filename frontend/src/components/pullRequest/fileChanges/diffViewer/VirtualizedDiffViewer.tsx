import { useMemo, useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import {
  getSplitContentLines,
  DiffFile,
  SplitSide,
  getSyntaxDiffTemplate,
  getPlainDiffTemplate,
  getSyntaxLineTemplate,
  getPlainLineTemplate,
} from "@git-diff-view/react";
import { DiffFileLineType } from "@git-diff-view/core";
import { Comment } from "../../../../api/types/Comment";
import { ChangedFile } from "../../../../api/types/ChangedFile";
import { CommentThread } from "../commentThread";
import { FileMarkDownEditor } from "../fileMarkDownEditor";
import "@git-diff-view/react/styles/diff-view.css";

// Utility to match the library's internal theme variable names
const diffFontSizeName = "--diff-font-size";

interface VirtualizedDiffViewerProps {
  diff: DiffFile;
  comments: Comment[];
  file: ChangedFile;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
}

export function VirtualizedDiffViewer({
  diff,
  comments,
  file,
  diffViewTheme = "light",
  diffViewFontSize = 14,
  diffViewHighlight = true,
}: VirtualizedDiffViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeWidget, setActiveWidget] = useState<{
    side: SplitSide;
    lineNumber: number;
  } | null>(null);

  // Initialize highlighting
  useEffect(() => {
    if (!diff) return;
    diff.initTheme(diffViewTheme);
    if (diffViewHighlight && !diff.getBundle().hasInitSyntax) {
      diff.initSyntax();
    }
    diff.notifyAll();
  }, [diff, diffViewTheme, diffViewHighlight]);

  // Sync theme
  useEffect(() => {
    if (!diff || !wrapperRef.current) return;
    wrapperRef.current.setAttribute("data-theme", diff._getTheme() || "light");
    wrapperRef.current.setAttribute(
      "data-highlighter",
      diff._getHighlighterName()
    );
  }, [diff, diffViewTheme]);

  // Combined list of hunks and content lines for virtualization
  const virtualData = useMemo(() => {
    try {
      const contentLines = getSplitContentLines(diff);
      const hunkMap = diff.getBundle().splitHunkLines || {};
      
      const result: any[] = [];
      let lastIndex = -1;

      contentLines.forEach((item) => {
        // If there's a hunk header at this index, insert it before the content
        if (hunkMap[item.index] && item.index !== lastIndex) {
          result.push({
            type: DiffFileLineType.hunk,
            index: item.index,
            data: hunkMap[item.index]
          });
          lastIndex = item.index;
        }
        result.push({
          type: DiffFileLineType.content,
          index: item.index,
          data: item
        });
      });

      return result;
    } catch (e) {
      console.error("Failed to build virtual data:", e);
      return [];
    }
  }, [diff]);

  const commentsMap = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    comments.forEach((c) => {
      if (c.position) {
        const side =
          c.position.oldLine !== null && c.position.oldLine !== 0 ? 1 : 2;
        const lineNum = side === 1 ? c.position.oldLine! : c.position.newLine!;
        const key = `${side}-${lineNum}`;
        if (!map[key]) map[key] = [];
        map[key].push(c);
      }
    });
    return map;
  }, [comments]);

  const onAddWidget = (side: SplitSide, lineNumber: number) => {
    setActiveWidget({ side, lineNumber });
  };

  return (
    <div
      className="diff-tailwindcss-wrapper w-full"
      data-component="git-diff-view"
      data-version="0.0.36"
      ref={wrapperRef}
    >
      <div
        className="diff-style-root"
        style={
          {
            [diffFontSizeName]: `${diffViewFontSize}px`,
          } as React.CSSProperties
        }
      >
        <div className="diff-view-wrapper border border-gray-200 rounded-md bg-white overflow-hidden">
          <div className="split-diff-view split-diff-view-normal w-full">
            {virtualData.length > 0 ? (
              <Virtuoso
                useWindowScroll
                data={virtualData}
                increaseViewportBy={2000}
                itemContent={(_index, item) => {
                  if (item.type === DiffFileLineType.hunk) {
                    return (
                      <div className="diff-line-hunk w-full bg-blue-50/20 text-blue-400 py-1.5 px-12 text-[11px] border-b border-gray-100 flex items-center select-none font-mono font-medium">
                        <span className="opacity-60">{item.data.splitInfo?.plainText || item.data.text || "@@ ... @@"}</span>
                      </div>
                    );
                  }

                  // Content lines
                  const splitLine = item.data.splitLine;
                  const leftLine = splitLine.left || {};
                  const rightLine = splitLine.right || {};

                  const leftComments = leftLine.lineNumber
                    ? commentsMap[`1-${leftLine.lineNumber}`] || []
                    : [];
                  const rightComments = rightLine.lineNumber
                    ? commentsMap[`2-${rightLine.lineNumber}`] || []
                    : [];

                  const showLeftWidget =
                    activeWidget?.side === SplitSide.old &&
                    leftLine.lineNumber !== undefined &&
                    activeWidget?.lineNumber === leftLine.lineNumber;
                  const showRightWidget =
                    activeWidget?.side === SplitSide.new &&
                    rightLine.lineNumber !== undefined &&
                    activeWidget?.lineNumber === rightLine.lineNumber;

                  return (
                    <div className="flex flex-col w-full border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                      <div className="grid grid-cols-[50px_1fr_50px_1fr] w-full font-mono text-[13px] leading-[1.6]">
                        {/* Left Side Num */}
                        <div className="diff-line-old-num sticky left-0 select-none px-2 text-right text-gray-400 bg-gray-50 border-r border-gray-200 min-w-[50px]">
                          <div className="relative group">
                            {leftLine.lineNumber || ""}
                            {leftLine.lineNumber && (
                              <button
                                onClick={() => onAddWidget(SplitSide.old, leftLine.lineNumber!)}
                                className="absolute right-[-14px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] z-10 shadow-sm"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Left Side Content */}
                        <div
                          className={`diff-line-old-content px-2 overflow-hidden whitespace-pre border-r border-gray-200 min-w-0 ${
                            leftLine.diff?.type === 2 ? "bg-[rgb(255,235,233)]" : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: getLineHtml(diff, leftLine, SplitSide.old),
                          }}
                        />
                        {/* Right Side Num */}
                        <div className="diff-line-new-num sticky left-0 select-none px-2 text-right text-gray-400 bg-gray-50 border-r border-gray-200 min-w-[50px]">
                          <div className="relative group">
                            {rightLine.lineNumber || ""}
                            {rightLine.lineNumber && (
                              <button
                                onClick={() =>
                                  onAddWidget(
                                    SplitSide.new,
                                    rightLine.lineNumber!
                                  )
                                }
                                className="absolute right-[-14px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] z-10 shadow-sm"
                              >
                                +
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Right Side Content */}
                        <div
                          className={`diff-line-new-content px-2 overflow-hidden whitespace-pre min-w-0 ${
                            rightLine.diff?.type === 1 ? "bg-[rgb(230,255,236)]" : ""
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: getLineHtml(diff, rightLine, SplitSide.new),
                          }}
                        />
                      </div>

                      {/* Comments and Widgets */}
                      {(leftComments.length > 0 ||
                        rightComments.length > 0 ||
                        showLeftWidget ||
                        showRightWidget) && (
                        <div className="grid grid-cols-[50px_1fr_50px_1fr] w-full bg-white border-t border-gray-50">
                          <div className="col-start-2 border-r border-gray-200 px-4 py-2">
                            {leftComments.map((c) => (
                              <CommentThread key={c.commentId} comment={c} />
                            ))}
                            {showLeftWidget && (
                              <FileMarkDownEditor
                                file={file}
                                oldStartLine={leftLine.lineNumber || null}
                                oldEndLine={leftLine.lineNumber || null}
                                newStartLine={null}
                                newEndLine={null}
                                lineType={leftLine.diff?.type || 0}
                                onClose={() => setActiveWidget(null)}
                              />
                            )}
                          </div>
                          <div className="col-start-4 px-4 py-2">
                            {rightComments.map((c) => (
                              <CommentThread key={c.commentId} comment={c} />
                            ))}
                            {showRightWidget && (
                              <FileMarkDownEditor
                                file={file}
                                newStartLine={rightLine.lineNumber || null}
                                newEndLine={rightLine.lineNumber || null}
                                oldStartLine={null}
                                oldEndLine={null}
                                lineType={rightLine.diff?.type || 0}
                                onClose={() => setActiveWidget(null)}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full py-20 text-gray-400 italic bg-gray-50/50">
                <p>No changes to display in this file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getLineHtml(diff: DiffFile, line: any, side: SplitSide): string {
  if (!line || !line.lineNumber) return "&nbsp;";

  const val =
    line.value ||
    (side === SplitSide.old
      ? diff.getOldPlainLine(line.lineNumber).value
      : diff.getNewPlainLine(line.lineNumber).value) ||
    "";

  const syntaxLine =
    side === SplitSide.old
      ? diff.getOldSyntaxLine(line.lineNumber)
      : diff.getNewSyntaxLine(line.lineNumber);

  const operator =
    line.diff?.type === 1 ? "add" : line.diff?.type === 2 ? "del" : undefined;

  let html = "";
  if (syntaxLine) {
    if (line.diff) {
      try {
        getSyntaxDiffTemplate({
          diffLine: line.diff,
          syntaxLine,
          operator: operator as any,
        });
        html = line.diff.syntaxTemplate || "";
      } catch {
        // Fallback
      }
    }

    if (!html) {
      try {
        html = getSyntaxLineTemplate(syntaxLine);
      } catch {
        // Fallback
      }
    }
  }

  if (!html) {
    if (line.diff) {
      try {
        getPlainDiffTemplate({
          diffLine: line.diff,
          rawLine: val,
          operator: operator as any,
        });
        html = line.diff.plainTemplate || "";
      } catch {
        // Fallback
      }
    }

    if (!html) {
      try {
        html = getPlainLineTemplate(val);
      } catch {
        html = escapeHtml(val);
      }
    }
  }

  return html || "&nbsp;";
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
