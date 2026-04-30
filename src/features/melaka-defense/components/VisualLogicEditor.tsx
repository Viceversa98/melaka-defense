"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import type { CannonFunctionName } from "../types";
import {
  DEFAULT_VISUAL_PROGRAM,
  PALETTE_ORDER,
  PALETTE_TEMPLATE_CATALOG,
  buildPaletteNode,
  cloneStrategyNode,
  descendList,
  modifyListAtPath,
  moveNodeWithinList,
  nodeDescriptionText,
  nodeSummaryLabel,
  type BranchPath,
  type PaletteTemplateId,
  type StrategyNode,
  type VisualProgram,
  insertNodeAt,
  removeNodeAt,
} from "../lib/visual-program";

type VisualLogicEditorProps = {
  visualProgram: VisualProgram;
  onVisualProgramChange: (next: VisualProgram) => void;
};

type DragPayload =
  | { kind: "palette"; templateId: PaletteTemplateId }
  | { kind: "tree"; cannonName: CannonFunctionName; path: BranchPath; index: number };

const CANNON_LABELS: Record<CannonFunctionName, string> = {
  cannon1: "Cannon 1",
  cannon2: "Cannon 2",
  cannon3: "Cannon 3",
};

const CANNON_ORDER: CannonFunctionName[] = ["cannon1", "cannon2", "cannon3"];

const pathKey = (path: BranchPath) => JSON.stringify(path);

const parseDragPayload = (raw: string): DragPayload | null => {
  try {
    const value = JSON.parse(raw) as DragPayload;
    if (value.kind === "palette" && typeof value.templateId === "string") {
      return value;
    }

    if (
      value.kind === "tree" &&
      typeof value.cannonName === "string" &&
      Array.isArray(value.path) &&
      typeof value.index === "number"
    ) {
      return value;
    }

    return null;
  } catch {
    return null;
  }
};

type BlockDescriptionToggleProps = {
  isOpen: boolean;
  tipId: string;
  blockLabel: string;
  onToggle: () => void;
};

const BlockDescriptionToggle = ({ isOpen, tipId, blockLabel, onToggle }: BlockDescriptionToggleProps) => (
  <button
    type="button"
    tabIndex={0}
    className="shrink-0 rounded-full border border-cyan-500/40 p-0.5 text-cyan-200 transition hover:bg-cyan-500/15 focus:outline-none focus:ring-2 focus:ring-cyan-300"
    aria-label={`Description for ${blockLabel}`}
    aria-expanded={isOpen}
    aria-controls={tipId}
    onMouseDown={(event) => {
      event.stopPropagation();
    }}
    onClick={(event) => {
      event.stopPropagation();
      onToggle();
    }}
    onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();
      onToggle();
    }}
  >
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.1V11.2M8 4.9h.01" strokeLinecap="round" strokeWidth="1.4" />
    </svg>
  </button>
);

type DropGapProps = {
  dropKey: string;
  dragOverKey: string | null;
  setDragOverKey: Dispatch<SetStateAction<string | null>>;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
};

const DropGap = ({ dropKey, dragOverKey, setDragOverKey, onDrop }: DropGapProps) => {
  const isActive = dragOverKey === dropKey;

  return (
    <div
      className={`h-1 rounded-full transition-colors ${isActive ? "bg-cyan-400" : "bg-transparent"}`}
      onDragOver={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragOverKey(dropKey);
        event.dataTransfer.dropEffect = "move";
      }}
      onDragLeave={() => {
        setDragOverKey((current) => (current === dropKey ? null : current));
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDrop(event);
      }}
      aria-hidden="true"
    />
  );
};

type StrategyListViewProps = {
  cannonName: CannonFunctionName;
  listPath: BranchPath;
  nodes: StrategyNode[];
  visualProgram: VisualProgram;
  dragOverKey: string | null;
  setDragOverKey: Dispatch<SetStateAction<string | null>>;
  listInfoKey: string | null;
  setListInfoKey: (next: string | null) => void;
  handleToggleTreeInfo: (key: string) => void;
  onApplyProgram: (next: VisualProgram) => void;
  nestClassName?: string;
};

const branchPathsEqual = (a: BranchPath, b: BranchPath) => pathKey(a) === pathKey(b);

export const VisualLogicEditor = ({ visualProgram, onVisualProgramChange }: VisualLogicEditorProps) => {
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [paletteInfoId, setPaletteInfoId] = useState<PaletteTemplateId | null>(null);
  const [listInfoKey, setListInfoKey] = useState<string | null>(null);

  useEffect(() => {
    if (paletteInfoId === null && listInfoKey === null) {
      return;
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setPaletteInfoId(null);
        setListInfoKey(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [paletteInfoId, listInfoKey]);

  const handleTogglePaletteInfo = (templateId: PaletteTemplateId) => {
    setListInfoKey(null);
    setPaletteInfoId((current) => (current === templateId ? null : templateId));
  };

  const handleToggleTreeInfo = useCallback((key: string) => {
    setPaletteInfoId(null);
    setListInfoKey((current) => (current === key ? null : key));
  }, []);

  const handleResetToDefault = () => {
    setListInfoKey(null);
    setPaletteInfoId(null);
    onVisualProgramChange(DEFAULT_VISUAL_PROGRAM);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden p-1.5 text-slate-100 sm:gap-2 sm:p-2">
      <div className="shrink-0 rounded-lg border border-cyan-400/25 bg-slate-950/60 p-1.5 text-[9px] leading-snug text-slate-300 sm:p-2 sm:text-[10px] sm:leading-snug">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="font-bold text-cyan-200">Visual logic</p>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="shrink-0 rounded-full border border-slate-500/60 px-2 py-0.5 text-[10px] font-semibold text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:px-2.5 sm:py-1 sm:text-xs"
            aria-label="Reset visual logic to default strategy for all cannons"
          >
            Reset
          </button>
        </div>
        <p className="mt-0.5 sm:hidden">Palette: if/else, loop, shots. Nest Meriam/Rentaka inside branches.</p>
        <p className="mt-0.5 hidden sm:block">
          Use <span className="font-semibold text-cyan-200">If / else</span> and <span className="font-semibold text-cyan-200">For loop</span> palette blocks; drag <span className="font-semibold text-cyan-200">Meriam</span> or{" "}
          <span className="font-semibold text-cyan-200">Rentaka</span> into each branch or loop body.
        </p>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-row gap-1.5 overflow-hidden sm:gap-2">
        <aside
          className="flex min-h-0 w-[min(40%,11.5rem)] max-w-[15rem] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-600/60 bg-slate-950/80 sm:w-44"
          aria-label="Strategy block palette"
        >
          <div className="shrink-0 border-b border-slate-700/70 px-1.5 py-1 sm:px-2 sm:py-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 sm:text-[10px]">Palette</p>
            <p className="mt-0.5 text-[8px] leading-tight text-slate-500 sm:text-[9px]">Drag into cannon or nested area</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-1.5 sm:gap-1.5 sm:p-2">
            {PALETTE_ORDER.map((templateId) => {
              const meta = PALETTE_TEMPLATE_CATALOG[templateId];
              const isInfoOpen = paletteInfoId === templateId;
              const tipId = `palette-desc-${templateId}`;

              return (
                <div key={templateId} className="relative w-full shrink-0">
                  <div
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "copyMove";
                      event.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ kind: "palette", templateId } satisfies DragPayload),
                      );
                    }}
                    className="cursor-grab rounded-md border border-slate-500/50 bg-slate-900 px-1.5 py-1 text-left active:cursor-grabbing sm:px-2 sm:py-1"
                    aria-label={`${meta.label}. Drag into a cannon list or nested branch.`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className="min-w-0 flex-1 truncate text-[10px] font-semibold leading-tight text-slate-100 sm:text-[11px]"
                        title={meta.label}
                      >
                        {meta.label}
                      </p>
                      <BlockDescriptionToggle
                        isOpen={isInfoOpen}
                        tipId={tipId}
                        blockLabel={meta.label}
                        onToggle={() => {
                          handleTogglePaletteInfo(templateId);
                        }}
                      />
                    </div>
                  </div>
                  {isInfoOpen ? (
                    <div
                      id={tipId}
                      role="tooltip"
                      className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border border-cyan-500/35 bg-slate-900/98 p-2 text-[10px] leading-snug text-slate-300 shadow-lg ring-1 ring-black/40"
                    >
                      {meta.description}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 overflow-hidden overscroll-contain sm:gap-2">
          {CANNON_ORDER.map((cannonName) => (
            <div
              key={cannonName}
              className="flex min-h-0 flex-1 basis-0 flex-col overflow-hidden rounded-lg border border-amber-400/25 bg-slate-900/80 p-1.5 sm:rounded-xl sm:p-2"
            >
              <div className="shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200 sm:text-xs">
                  {CANNON_LABELS[cannonName]}
                </p>
                <p className="mt-0.5 hidden text-[8px] text-slate-500 md:block md:text-[9px]">After nearest-ship lock-on</p>
              </div>

              <div className="mt-1 flex min-h-0 flex-1 overflow-hidden">
                <StrategyListView
                  cannonName={cannonName}
                  listPath={[]}
                  nodes={visualProgram[cannonName]}
                  visualProgram={visualProgram}
                  dragOverKey={dragOverKey}
                  setDragOverKey={setDragOverKey}
                  listInfoKey={listInfoKey}
                  setListInfoKey={setListInfoKey}
                  handleToggleTreeInfo={handleToggleTreeInfo}
                  onApplyProgram={onVisualProgramChange}
                  nestClassName=""
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StrategyListView = ({
  cannonName,
  listPath,
  nodes,
  visualProgram,
  dragOverKey,
  setDragOverKey,
  listInfoKey,
  setListInfoKey,
  handleToggleTreeInfo,
  onApplyProgram,
  nestClassName = "",
}: StrategyListViewProps) => {
  const pathStr = pathKey(listPath);

  const onDropAt = useMemo(
    () => (dropIndex: number) => {
      const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOverKey(null);

        const payload = parseDragPayload(event.dataTransfer.getData("application/json"));
        if (!payload) {
          return;
        }

        setListInfoKey(null);

        if (payload.kind === "palette") {
          const fresh = buildPaletteNode(payload.templateId);
          onApplyProgram(
            modifyListAtPath(visualProgram, cannonName, listPath, (list) => insertNodeAt(list, dropIndex, fresh)),
          );
          return;
        }

        const { cannonName: srcCannon, path: srcPath, index: srcIndex } = payload;
        const srcList = descendList(visualProgram[srcCannon], srcPath);
        const moving = srcList[srcIndex];
        if (moving === undefined) {
          return;
        }

        if (srcCannon === cannonName && branchPathsEqual(srcPath, listPath)) {
          onApplyProgram(
            modifyListAtPath(visualProgram, cannonName, listPath, (list) =>
              moveNodeWithinList(list, srcIndex, dropIndex),
            ),
          );
          return;
        }

        const without = modifyListAtPath(visualProgram, srcCannon, srcPath, (list) =>
          removeNodeAt(list, srcIndex),
        );

        onApplyProgram(
          modifyListAtPath(without, cannonName, listPath, (list) =>
            insertNodeAt(list, dropIndex, cloneStrategyNode(moving)),
          ),
        );
      };

      return handleDrop;
    },
    [visualProgram, cannonName, listPath, onApplyProgram, setDragOverKey, setListInfoKey],
  );

  return (
    <div
      className={`flex min-h-0 min-w-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden rounded-md border border-dashed border-slate-600/80 bg-slate-950/50 p-1.5 sm:p-2 ${nestClassName}`}
    >
      <DropGap
        dropKey={`${cannonName}-${pathStr}-gap-0`}
        dragOverKey={dragOverKey}
        setDragOverKey={setDragOverKey}
        onDrop={onDropAt(0)}
      />

      {nodes.length === 0 ? (
        <div
          className={`flex min-h-0 flex-1 flex-col justify-center rounded border py-2 text-center text-[11px] sm:py-3 sm:text-xs ${
            dragOverKey === `${cannonName}-${pathStr}-empty`
              ? "border-cyan-400 bg-cyan-950/30 text-cyan-100"
              : "border-transparent text-slate-500"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOverKey(`${cannonName}-${pathStr}-empty`);
            event.dataTransfer.dropEffect = "move";
          }}
          onDragLeave={() => {
            setDragOverKey((current) => (current === `${cannonName}-${pathStr}-empty` ? null : current));
          }}
          onDrop={onDropAt(0)}
        >
          Drop here
        </div>
      ) : null}

      {nodes.map((node, index) => {
        const gapAfterKey = `${cannonName}-${pathStr}-gap-${index + 1}`;

        return (
          <div key={`${pathStr}-${index}-${node.kind}`} className="flex flex-col gap-0.5">
            <StrategyNodeShell
              cannonName={cannonName}
              listPath={listPath}
              index={index}
              node={node}
              visualProgram={visualProgram}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              listInfoKey={listInfoKey}
              handleToggleTreeInfo={handleToggleTreeInfo}
              onRemove={(path, ix) =>
                modifyListAtPath(visualProgram, cannonName, path, (list) => removeNodeAt(list, ix))
              }
              onApplyProgram={onApplyProgram}
              setListInfoKey={setListInfoKey}
            />
            <DropGap
              dropKey={gapAfterKey}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              onDrop={onDropAt(index + 1)}
            />
          </div>
        );
      })}
    </div>
  );
};

type StrategyNodeShellProps = {
  cannonName: CannonFunctionName;
  listPath: BranchPath;
  index: number;
  node: StrategyNode;
  visualProgram: VisualProgram;
  dragOverKey: string | null;
  setDragOverKey: Dispatch<SetStateAction<string | null>>;
  listInfoKey: string | null;
  handleToggleTreeInfo: (key: string) => void;
  onRemove: (path: BranchPath, index: number) => VisualProgram;
  onApplyProgram: (next: VisualProgram) => void;
  setListInfoKey: (next: string | null) => void;
};

const StrategyNodeShell = ({
  cannonName,
  listPath,
  index,
  node,
  visualProgram,
  dragOverKey,
  setDragOverKey,
  listInfoKey,
  handleToggleTreeInfo,
  onRemove,
  onApplyProgram,
  setListInfoKey,
}: StrategyNodeShellProps) => {
  const infoKeyBase = `${cannonName}:${pathKey(listPath)}:${index}`;

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(
        "application/json",
        JSON.stringify({
          kind: "tree",
          cannonName,
          path: listPath,
          index,
        } satisfies DragPayload),
      );
    },
    [cannonName, listPath, index],
  );

  const handleDragEnd = useCallback(() => {
    setDragOverKey(null);
  }, [setDragOverKey]);

  const handleRemoveSelf = () => {
    setListInfoKey(null);
    onApplyProgram(onRemove(listPath, index));
  };

  const handleRemoveSelfKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleRemoveSelf();
  };

  if (node.kind === "leaf") {
    const label = nodeSummaryLabel(node);
    const tipId = `node-desc-${infoKeyBase}`;
    const isOpen = listInfoKey === infoKeyBase;

    return (
      <div className="relative">
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab items-center gap-1 rounded-md border border-cyan-300/20 bg-slate-900 px-1.5 py-1 active:cursor-grabbing sm:gap-1.5 sm:px-2"
          role="listitem"
          tabIndex={0}
          aria-label={`${label}. Press Delete or use remove control to delete.`}
          onKeyDown={(event) => {
            if (event.key === "Delete" || event.key === "Backspace") {
              event.preventDefault();
              handleRemoveSelf();
            }
          }}
        >
          <span className="shrink-0 select-none text-[10px] text-slate-500" aria-hidden="true">
            ::
          </span>
          <div className="relative min-w-0 flex-1">
            <div className="flex items-center justify-between gap-0.5">
              <p className="min-w-0 flex-1 truncate text-[10px] font-semibold leading-tight text-cyan-100 sm:text-[11px]" title={label}>
                {label}
              </p>
              <BlockDescriptionToggle
                isOpen={isOpen}
                tipId={tipId}
                blockLabel={label}
                onToggle={() => {
                  handleToggleTreeInfo(infoKeyBase);
                }}
              />
            </div>
          </div>
          <button
            type="button"
            tabIndex={0}
            aria-label={`Remove ${label}`}
            onClick={handleRemoveSelf}
            onKeyDown={handleRemoveSelfKeyDown}
            className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase text-rose-300 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400 sm:px-1.5 sm:text-[10px]"
          >
            ✕
          </button>
        </div>
        {isOpen ? (
          <div
            id={tipId}
            role="tooltip"
            className="absolute left-0 right-12 top-full z-30 mt-1 rounded-md border border-cyan-500/35 bg-slate-900/98 p-2 text-[10px] leading-snug text-slate-300 shadow-lg ring-1 ring-black/40 sm:right-20"
          >
            {nodeDescriptionText(node)}
          </div>
        ) : null}
      </div>
    );
  }

  const containerTitle = nodeSummaryLabel(node);
  const tipId = `node-desc-${infoKeyBase}`;
  const isOpen = listInfoKey === infoKeyBase;
  const thenPath: BranchPath = [...listPath, { containerIndex: index, branch: "then" }];
  const elsePath: BranchPath = [...listPath, { containerIndex: index, branch: "else" }];
  const bodyPath: BranchPath = [...listPath, { containerIndex: index, branch: "body" }];

  if (node.kind === "if_strong_else") {
    return (
      <div className="rounded-md border border-violet-400/35 bg-violet-950/20 py-1.5">
        <div className="flex items-center gap-1 px-1.5 sm:gap-2 sm:px-2">
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="min-w-0 flex-1 cursor-grab truncate text-[10px] font-bold uppercase tracking-wide text-violet-200 active:cursor-grabbing sm:text-[11px]"
            title={containerTitle}
            tabIndex={0}
            aria-label={`Drag ${containerTitle}`}
          >
            {containerTitle}
          </div>
          <BlockDescriptionToggle
            isOpen={isOpen}
            tipId={tipId}
            blockLabel={containerTitle}
            onToggle={() => {
              handleToggleTreeInfo(infoKeyBase);
            }}
          />
          <button
            type="button"
            tabIndex={0}
            aria-label={`Remove ${containerTitle}`}
            onClick={handleRemoveSelf}
            onKeyDown={handleRemoveSelfKeyDown}
            className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase text-rose-300 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            ✕
          </button>
        </div>
        {isOpen ? (
          <p className="mx-2 mb-1 text-[9px] leading-snug text-slate-400">{nodeDescriptionText(node)}</p>
        ) : null}

        <div className="mt-1 space-y-1.5 px-1 sm:px-1.5">
          <div>
            <p className="mb-0.5 text-[8px] font-bold uppercase tracking-wide text-violet-300/90">Then (strong)</p>
            <StrategyListView
              cannonName={cannonName}
              listPath={thenPath}
              nodes={node.thenNodes}
              visualProgram={visualProgram}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              listInfoKey={listInfoKey}
              setListInfoKey={setListInfoKey}
              handleToggleTreeInfo={handleToggleTreeInfo}
              onApplyProgram={onApplyProgram}
              nestClassName="border-violet-500/20"
            />
          </div>
          <div>
            <p className="mb-0.5 text-[8px] font-bold uppercase tracking-wide text-violet-300/90">Else</p>
            <StrategyListView
              cannonName={cannonName}
              listPath={elsePath}
              nodes={node.elseNodes}
              visualProgram={visualProgram}
              dragOverKey={dragOverKey}
              setDragOverKey={setDragOverKey}
              listInfoKey={listInfoKey}
              setListInfoKey={setListInfoKey}
              handleToggleTreeInfo={handleToggleTreeInfo}
              onApplyProgram={onApplyProgram}
              nestClassName="border-violet-500/20"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-emerald-400/35 bg-emerald-950/20 py-1.5">
      <div className="flex items-center gap-1 px-1.5 sm:gap-2 sm:px-2">
        <div
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className="min-w-0 flex-1 cursor-grab truncate text-[10px] font-bold uppercase tracking-wide text-emerald-200 active:cursor-grabbing sm:text-[11px]"
          title={containerTitle}
          tabIndex={0}
          aria-label={`Drag ${containerTitle}`}
        >
          {containerTitle}
        </div>
        <BlockDescriptionToggle
          isOpen={isOpen}
          tipId={tipId}
          blockLabel={containerTitle}
          onToggle={() => {
            handleToggleTreeInfo(infoKeyBase);
          }}
        />
        <button
          type="button"
          tabIndex={0}
          aria-label={`Remove ${containerTitle}`}
          onClick={handleRemoveSelf}
          onKeyDown={handleRemoveSelfKeyDown}
          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase text-rose-300 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          ✕
        </button>
      </div>
      {isOpen ? (
        <p className="mx-2 mb-1 text-[9px] leading-snug text-slate-400">{nodeDescriptionText(node)}</p>
      ) : null}

      <div className="mt-1 px-1 sm:px-1.5">
        <p className="mb-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-300/90">Loop body</p>
        <StrategyListView
          cannonName={cannonName}
          listPath={bodyPath}
          nodes={node.bodyNodes}
          visualProgram={visualProgram}
          dragOverKey={dragOverKey}
          setDragOverKey={setDragOverKey}
          listInfoKey={listInfoKey}
          setListInfoKey={setListInfoKey}
          handleToggleTreeInfo={handleToggleTreeInfo}
          onApplyProgram={onApplyProgram}
          nestClassName="border-emerald-500/20"
        />
      </div>
    </div>
  );
};
