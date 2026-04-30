"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import Editor from "@monaco-editor/react";
import type { VisualProgram } from "../lib/visual-program";
import { VisualLogicEditor } from "./VisualLogicEditor";

type ProgrammingSurface = "visual" | "code";

type WarRoomPanelProps = {
  code: string;
  visualProgram: VisualProgram;
  onVisualProgramChange: (next: VisualProgram) => void;
  isWarRoomOpen: boolean;
  handleToggleWarRoom: () => void;
  isXlViewport: boolean;
};

export const WarRoomPanel = ({
  code,
  visualProgram,
  onVisualProgramChange,
  isWarRoomOpen,
  handleToggleWarRoom,
  isXlViewport,
}: WarRoomPanelProps) => {
  const [surface, setSurface] = useState<ProgrammingSurface>("visual");
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);

  const apiDocs = [
    "Preferred: define cannon1(radar, artillery, command), cannon2(...), cannon3(...)",
    "radar.getShips() -> [{ id, type, distance, hp, maxHp }]",
    "artillery.fireRentaka(shipId) -> 10 damage, max 3 bullets per cannon per tick",
    "artillery.fireMeriam(shipId) -> 50 damage, max 1 shot per cannon per tick, 3 tick cooldown",
    "command.log(message) -> print to terminal",
  ];

  const showFullWarRoom = isXlViewport || isWarRoomOpen;

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleToggleWarRoom();
  };

  const handleSurfaceKeyDown = (event: KeyboardEvent<HTMLButtonElement>, nextSurface: ProgrammingSurface) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    setSurface(nextSurface);
  };

  useEffect(() => {
    if (!isApiDialogOpen) {
      return;
    }

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsApiDialogOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isApiDialogOpen]);

  const handleOpenApiDialog = () => {
    setIsApiDialogOpen(true);
  };

  const handleCloseApiDialog = () => {
    setIsApiDialogOpen(false);
  };

  const handleApiDialogBackdropClick = () => {
    handleCloseApiDialog();
  };

  return (
    <section
      className={`flex flex-col overflow-hidden border-b border-amber-400/20 bg-slate-900 xl:h-full xl:min-h-0 xl:border-b-0 xl:border-r ${
        showFullWarRoom && !isXlViewport ? "min-h-0 flex-1" : ""
      } ${!showFullWarRoom && !isXlViewport ? "shrink-0" : ""} ${isXlViewport ? "xl:min-h-0" : ""}`}
    >
      <div className="shrink-0 border-b border-amber-400/20 px-3 py-2 sm:px-5 sm:py-3 xl:block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-300 sm:text-xs">The War Room</p>
            <h1 className="mt-0.5 text-lg font-bold text-white sm:mt-2 sm:text-3xl">Melaka Empire Defense</h1>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              Created by{" "}
              <a
                href="https://alifasraf.asia"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-cyan-200 underline-offset-2 hover:text-cyan-100 hover:underline"
              >
                alifasraf.asia
              </a>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Link
              href="/learning-guide"
              className="rounded-full border border-amber-400/45 bg-amber-500/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-amber-100 transition hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              Learning guide
            </Link>
            <button
              type="button"
              onClick={handleOpenApiDialog}
              className="rounded-full border border-cyan-400/45 bg-cyan-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-200"
              aria-haspopup="dialog"
              aria-expanded={isApiDialogOpen}
              {...(isApiDialogOpen ? { "aria-controls": "war-room-api-dialog" } : {})}
            >
              Commands
            </button>
            {!isXlViewport ? (
              <button
                type="button"
                onClick={handleToggleWarRoom}
                onKeyDown={handleToggleKeyDown}
                className="rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-100 transition hover:bg-amber-300/20 focus:outline-none focus:ring-2 focus:ring-amber-200"
                aria-expanded={isWarRoomOpen}
                aria-controls="war-room-editor-panel"
                aria-label={isWarRoomOpen ? "Collapse war room and show battle view" : "Expand war room to edit code"}
              >
                {isWarRoomOpen ? "Battle" : "Code"}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showFullWarRoom ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div id="war-room-editor-panel" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className="flex shrink-0 border-b border-amber-400/20 bg-slate-950/50 px-2 pt-2"
              role="tablist"
              aria-label="Programming surface"
            >
              <button
                type="button"
                role="tab"
                aria-selected={surface === "visual"}
                id="tab-visual"
                aria-controls="panel-visual"
                onClick={() => {
                  setSurface("visual");
                }}
                onKeyDown={(event) => {
                  handleSurfaceKeyDown(event, "visual");
                }}
                className={`rounded-t-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-amber-200 sm:px-4 sm:text-sm ${
                  surface === "visual"
                    ? "bg-slate-900 text-amber-100 ring-1 ring-b-0 ring-amber-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Visual
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={surface === "code"}
                id="tab-code"
                aria-controls="panel-code"
                onClick={() => {
                  setSurface("code");
                }}
                onKeyDown={(event) => {
                  handleSurfaceKeyDown(event, "code");
                }}
                className={`rounded-t-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition focus:outline-none focus:ring-2 focus:ring-amber-200 sm:px-4 sm:text-sm ${
                  surface === "code"
                    ? "bg-slate-900 text-amber-100 ring-1 ring-b-0 ring-amber-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Code (generated)
              </button>
            </div>

            {surface === "visual" ? (
              <div
                id="panel-visual"
                role="tabpanel"
                aria-labelledby="tab-visual"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <VisualLogicEditor visualProgram={visualProgram} onVisualProgramChange={onVisualProgramChange} />
              </div>
            ) : (
              <div
                id="panel-code"
                role="tabpanel"
                aria-labelledby="tab-code"
                className="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                <p className="shrink-0 border-b border-slate-700/80 bg-slate-950/80 px-3 py-2 text-[10px] text-slate-400 sm:text-xs">
                  Read-only preview. Edit logic on the Visual tab; the game runs this generated script.
                </p>
                <div className="min-h-0 flex-1">
                  <Editor
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      tabSize: 2,
                      readOnly: true,
                      domReadOnly: true,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {isApiDialogOpen ? (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={handleApiDialogBackdropClick}
        >
          <div
            id="war-room-api-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="war-room-api-dialog-title"
            className="max-h-[min(90dvh,720px)] w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-400/30 bg-slate-900 shadow-2xl"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 px-4 py-3 sm:px-5">
              <h2 id="war-room-api-dialog-title" className="text-base font-bold text-white sm:text-lg">
                Command reference
              </h2>
              <button
                type="button"
                onClick={handleCloseApiDialog}
                className="rounded-full border border-slate-500/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                aria-label="Close command reference"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(min(90dvh,720px)-4rem)] overflow-y-auto p-4 sm:p-5">
              <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-2 sm:gap-4 sm:text-sm">
                {apiDocs.map((doc) => (
                  <div key={doc} className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-3 sm:px-4">
                    <code className="break-words font-mono text-cyan-100">{doc}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
