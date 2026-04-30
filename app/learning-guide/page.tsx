import Link from "next/link";
import type { Metadata } from "next";
import { BEST_PRACTICES, LEARNING_GUIDES } from "@/src/features/melaka-defense/content";

export const metadata: Metadata = {
  title: "Learning Guide | Melaka Defense",
  description: "Short examples for cannon logic: simple calls, loops, conditionals, and best practices.",
};

export default function LearningGuidePage() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-amber-500/20 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Melaka Defense</p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">Learning guide</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-amber-400/40 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              Back to game
            </Link>
            <Link
              href="/how-to-play"
              className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            >
              How to play
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <p className="text-sm leading-7 text-slate-300">
          These snippets mirror what you can express in the Visual tab or in generated code. Drop patterns into your
          cannon functions or adapt them in the Code (generated) view after building blocks.
        </p>

        <div className="grid gap-6 text-sm text-slate-300">
          {LEARNING_GUIDES.map((guide) => (
            <article key={guide.title} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
              <h2 className="text-lg font-bold text-white">{guide.title}</h2>
              <p className="mt-2 leading-6 text-slate-400">{guide.description}</p>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-black/50 p-3 font-mono text-xs leading-relaxed text-cyan-100 sm:text-sm">
                <code>{guide.code}</code>
              </pre>
            </article>
          ))}
        </div>

        <article className="rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-emerald-100">Best practices</h2>
          <ul className="mt-3 space-y-2 leading-6 text-slate-300">
            {BEST_PRACTICES.map((practice) => (
              <li key={practice}>- {practice}</li>
            ))}
          </ul>
        </article>

        <p className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-amber-300 underline-offset-4 hover:text-amber-200 hover:underline">
            Return to Melaka Defense
          </Link>
        </p>
      </main>
    </div>
  );
}
