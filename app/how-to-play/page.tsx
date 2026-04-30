import Link from "next/link";
import type { Metadata } from "next";
import {
  FORT_HEALTH,
  MAX_WAVES,
  MERIAM_COOLDOWN_TICKS,
  MERIAM_SHOTS_PER_CANNON_PER_TICK,
  RENTAKA_BULLETS_PER_CANNON_PER_TICK,
  STRAIT_LENGTH,
} from "@/src/features/melaka-defense/constants";
import { CodeControlsDiagram } from "@/src/features/melaka-defense/components/CodeControlsDiagram";

export const metadata: Metadata = {
  title: "How to Play | Melaka Defense",
  description:
    "Learn how to defend the Melaka strait: objectives, controls, visual logic vs generated code, and the JavaScript player API.",
};

type ApiCardProps = {
  title: string;
  code: string;
  description: string;
};

const ApiCard = ({ title, code, description }: ApiCardProps) => (
  <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-4 shadow-inner">
    <p className="text-xs font-semibold uppercase tracking-widest text-amber-200/90">{title}</p>
    <pre className="mt-2 overflow-x-auto rounded-lg bg-black/50 p-3 font-mono text-xs leading-relaxed text-cyan-100 sm:text-sm">
      <code>{code}</code>
    </pre>
    <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
  </div>
);

export default function HowToPlayPage() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-cyan-500/20 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Melaka Defense</p>
            <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">How to play</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/10 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            Back to game
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-12 px-4 py-10 sm:px-6">
        <section aria-labelledby="goal-heading">
          <h2 id="goal-heading" className="text-lg font-bold text-white">
            Goal
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Hostile ships sail toward your fort from <strong className="text-cyan-200">X = {STRAIT_LENGTH}</strong>{" "}
            (strait length in meters). Your fort sits at <strong className="text-cyan-200">X = 0</strong>. Each game{" "}
            <strong className="text-amber-200">tick</strong> (about one second), your code can read the radar and order
            your three cannons to fire <strong className="text-amber-200">Rentaka</strong> (fast, lighter shots) or{" "}
            <strong className="text-amber-200">Meriam</strong> (heavy shot, cooldown). Sink ships for score; if ships
            reach the fort they deal damage. Survive up to <strong className="text-fuchsia-200">{MAX_WAVES} waves</strong>{" "}
            with <strong className="text-emerald-200">{FORT_HEALTH} fort HP</strong> to win.
          </p>
        </section>

        <section aria-labelledby="controls-heading">
          <h2 id="controls-heading" className="text-lg font-bold text-white">
            Screen and controls
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-slate-300">
            <li>
              <strong className="text-white">War Room</strong> (left on large screens): programming area. On small
              screens use <strong className="text-white">Code</strong> in the header to open it, then{" "}
              <strong className="text-white">Battle</strong> to focus on the radar.
            </li>
            <li>
              <strong className="text-white">Visual</strong> tab: palette on the left, cannon stacks on the right —
              drag blocks into each cannon to build logic. That is the <strong className="text-white">source of truth</strong>;
              the game always runs the generated script.
            </li>
            <li>
              <strong className="text-white">Code (generated)</strong> tab: read-only preview of the JavaScript produced
              from your blocks—useful to learn how blocks map to real code.
            </li>
            <li>
              <strong className="text-white">Pause / Resume</strong> stops or continues the tick loop.{" "}
              <strong className="text-white">Reset</strong> restarts the match, fort HP, waves, and restores the default
              visual strategy.
            </li>
            <li>
              The <strong className="text-white">HUD</strong> shows fort HP, score, wave progress, and per-cannon reload
              state. Logs appear on the radar during battle.
            </li>
          </ul>
        </section>

        <section aria-labelledby="visual-heading">
          <h2 id="visual-heading" className="text-lg font-bold text-white">
            Visual logic (blocks)
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Each cannon automatically picks the <strong className="text-white">nearest living ship</strong> (by
            distance). After that, your <strong className="text-white">stacked strategy blocks</strong> run from top to
            bottom. Drag blocks in the list to reorder; drag from the left palette to add; use the remove control on a
            block or <strong className="text-white">Reset</strong> to restore the default. The palette includes{" "}
            <strong className="text-white">If / else (strong target)</strong>, <strong className="text-white">For loop (×3)</strong>,{" "}
            <strong className="text-white">Meriam once</strong>, and <strong className="text-white">Rentaka once</strong> — drag Meriam
            or Rentaka (or another container) into the <em>Then</em>, <em>Else</em>, or <em>Loop body</em> areas to nest your logic.
          </p>
        </section>

        <section aria-labelledby="code-heading">
          <h2 id="code-heading" className="text-lg font-bold text-white">
            Writing code (what the generated script looks like)
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Under the hood the game expects either <strong className="text-white">three cannon functions</strong>{" "}
            <code className="font-mono text-cyan-200">cannon1</code>, <code className="font-mono text-cyan-200">cannon2</code>,{" "}
            <code className="font-mono text-cyan-200">cannon3</code> <em>or</em> a single <code className="font-mono text-cyan-200">onTick</code>{" "}
            function. The visual editor always generates the three-cannon style. Each function receives{" "}
            <code className="font-mono text-cyan-200">radar</code>, <code className="font-mono text-cyan-200">artillery</code>, and{" "}
            <code className="font-mono text-cyan-200">command</code>.
          </p>
        </section>

        <section aria-labelledby="diagram-heading">
          <h2 id="diagram-heading" className="text-lg font-bold text-white">
            Which code controls what
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            The diagram matches the radar layout: the fort strip on the left holds three slots (top to bottom). Your
            functions <code className="font-mono text-cyan-200">cannon1</code>, <code className="font-mono text-cyan-200">cannon2</code>, and{" "}
            <code className="font-mono text-cyan-200">cannon3</code> each map to one slot. In the Visual tab, &quot;Cannon 1 / 2 / 3&quot; lists
            are the same mapping. <code className="font-mono text-cyan-200">radar</code> and{" "}
            <code className="font-mono text-cyan-200">artillery</code> are shared APIs — they always refer to the whole battlefield, not a single
            tube; which physical cannon acts is determined by which function you are inside.
          </p>
          <div className="mt-6">
            <CodeControlsDiagram />
          </div>
        </section>

        <section aria-labelledby="api-heading">
          <h2 id="api-heading" className="text-lg font-bold text-white">
            Player API reference
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Values below match the live game rules ({MERIAM_COOLDOWN_TICKS}-tick Meriam cooldown, etc.).
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <ApiCard
              title="Preferred structure"
              code="Preferred: define cannon1(radar, artillery, command), cannon2(...), cannon3(...)"
              description="Split your defense across three functions so each physical cannon slot runs its own logic every tick."
            />
            <ApiCard
              title="Radar"
              code="radar.getShips() -> [{ id, type, distance, hp, maxHp }]"
              description="Returns every ship currently on radar. Filter and sort (for example by distance or HP) to choose a target."
            />
            <ApiCard
              title="Rentaka"
              code={`artillery.fireRentaka(shipId)
// 10 damage, max ${RENTAKA_BULLETS_PER_CANNON_PER_TICK} bullets per cannon per tick`}
              description="Light cannon. To fire more than once per tick from the same cannon, use a for loop in that cannon's function (the game checks the source for this pattern)."
            />
            <ApiCard
              title="Meriam"
              code={`artillery.fireMeriam(shipId)
// 50 damage, max ${MERIAM_SHOTS_PER_CANNON_PER_TICK} per cannon per tick,
// ${MERIAM_COOLDOWN_TICKS}-tick cooldown (global)`}
              description="Heavy shot: high damage but limited rate. Plan which cannon fires Meriam so you do not waste the cooldown."
            />
            <ApiCard
              title="Command log"
              code='command.log("message") -> battle log'
              description="Print strings to the in-game log on the radar. Useful for debugging which branch ran."
            />
          </div>
        </section>

        <section aria-labelledby="tips-heading">
          <h2 id="tips-heading" className="text-lg font-bold text-white">
            Tips
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-slate-300">
            <li>Reserve Meriam for Colonizer Galleons or high-HP targets; use Rentaka bursts on weaker ships.</li>
            <li>Use all three cannons so you are not limited by one slot being busy.</li>
            <li>
              Open the{" "}
              <Link href="/learning-guide" className="font-semibold text-cyan-300 underline-offset-2 hover:underline">
                Learning guide
              </Link>{" "}
              for short examples (loops, if/else, and best practices).
            </li>
          </ul>
        </section>

        <p className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          <Link href="/" className="font-semibold text-cyan-400 underline-offset-4 hover:text-cyan-300 hover:underline">
            Return to Melaka Defense
          </Link>
        </p>
      </main>
    </div>
  );
}
