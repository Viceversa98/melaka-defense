"use client";

import Editor from "@monaco-editor/react";
import { LEARNING_GUIDES, BEST_PRACTICES } from "../content";

type WarRoomPanelProps = {
  code: string;
  handleEditorChange: (value?: string) => void;
};

export function WarRoomPanel({ code, handleEditorChange }: WarRoomPanelProps) {
  const apiDocs = [
    "Preferred: define cannon1(radar, artillery, command), cannon2(...), cannon3(...)",
    "radar.getShips() -> [{ id, type, distance, hp, maxHp }]",
    "artillery.fireRentaka(shipId) -> 10 damage, max 3 bullets per cannon per tick",
    "artillery.fireMeriam(shipId) -> 50 damage, max 1 shot per cannon per tick, 3 tick cooldown",
    "command.log(message) -> print to terminal",
  ];

  return (
    <section className="flex min-h-[520px] flex-col border-b border-amber-400/20 bg-slate-900 lg:border-b-0 lg:border-r">
      <div className="border-b border-amber-400/20 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">The War Room</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Melaka Empire Defense</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Write real-time JavaScript to command Rentaka swivel guns and Meriam cannons.
        </p>
      </div>

      <div className="grid gap-3 border-b border-amber-400/20 p-4 text-xs text-slate-300 sm:grid-cols-2">
        {apiDocs.map((doc) => (
          <div key={doc} className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
            <code>{doc}</code>
          </div>
        ))}
      </div>

      <details className="border-b border-amber-400/20 bg-slate-950/40 px-4 py-3">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
          Learning Guide
        </summary>
        <div className="mt-3 grid max-h-64 gap-3 overflow-y-auto pr-1 text-xs text-slate-300">
          {LEARNING_GUIDES.map((guide) => (
            <article key={guide.title} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <h2 className="font-bold text-white">{guide.title}</h2>
              <p className="mt-1 leading-5 text-slate-400">{guide.description}</p>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-2 text-[11px] leading-5 text-cyan-100">
                <code>{guide.code}</code>
              </pre>
            </article>
          ))}

          <article className="rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-3">
            <h2 className="font-bold text-emerald-100">Best Practice</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              {BEST_PRACTICES.map((practice) => (
                <li key={practice}>- {practice}</li>
              ))}
            </ul>
          </article>
        </div>
      </details>

      <div className="min-h-[460px] flex-1">
        <Editor
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
          }}
        />
      </div>
    </section>
  );
}

