"use client";

import Link from "next/link";
import type { CannonSlot, ExplosionEffect, GameStatus, ProjectileEffect, Ship, TerminalLog, WaveBanner } from "../types";
import { STRAIT_LENGTH } from "../constants";
import { StatusHud } from "./StatusHud";
import { RadarPlayArea } from "./RadarPlayArea";

type RadarPanelProps = {
  isPaused: boolean;
  onTogglePause: () => void;
  onResetGame: () => void;

  fortHealth: number;
  score: number;
  wave: number;
  waveShipTotal: number;
  waveShipsSpawned: number;
  tick: number;
  cannonSlots: CannonSlot[];
  meriamCooldown: number;
  meriamCooldownSlotId: string | null;

  logs: TerminalLog[];
  ships: Ship[];
  projectiles: ProjectileEffect[];
  explosions: ExplosionEffect[];
  radarWidth: number;
  waveBanner: WaveBanner;
  gameStatus: GameStatus;
  checkpointWave: number;
  radarAreaRef: React.RefObject<HTMLDivElement | null>;
  handleRetryCheckpoint: () => void;
};

export function RadarPanel({
  isPaused,
  onTogglePause,
  onResetGame,
  fortHealth,
  score,
  wave,
  waveShipTotal,
  waveShipsSpawned,
  tick,
  cannonSlots,
  meriamCooldown,
  meriamCooldownSlotId,
  logs,
  ships,
  projectiles,
  explosions,
  radarWidth,
  waveBanner,
  gameStatus,
  checkpointWave,
  radarAreaRef,
  handleRetryCheckpoint,
}: RadarPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 xl:h-full xl:min-h-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-cyan-300/20 px-3 py-2 sm:gap-3 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200 sm:text-xs sm:tracking-[0.35em]">
            Melaka Strait — battle radar
          </p>
          <p className="mt-0.5 text-xs leading-snug text-slate-300 sm:mt-1 sm:text-sm sm:leading-normal">
            Fort holds the narrows at <span className="text-cyan-100">X = 0</span>. Hostile contacts appear seaward at{" "}
            <span className="text-cyan-100">X = {STRAIT_LENGTH}</span> and close west each tick.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2">
          <Link
            href="/how-to-play"
            className="rounded-full border border-cyan-400/35 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/15 focus:outline-none focus:ring-2 focus:ring-cyan-200 sm:px-4 sm:py-2 sm:text-sm"
            aria-label="Open how to play and coding instructions"
          >
            How to play
          </Link>
          <button
            type="button"
            onClick={onTogglePause}
            className="rounded-full border border-cyan-300/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-200 sm:px-4 sm:py-2 sm:text-sm"
            aria-label={isPaused ? "Resume game loop" : "Pause game loop"}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>

          <button
            type="button"
            onClick={onResetGame}
            className="rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100 sm:px-4 sm:py-2 sm:text-sm"
            aria-label="Reset the defense simulation"
          >
            Reset
          </button>
        </div>
      </div>

      <StatusHud
        fortHealth={fortHealth}
        score={score}
        wave={wave}
        waveShipTotal={waveShipTotal}
        waveShipsSpawned={waveShipsSpawned}
        tick={tick}
        cannonSlots={cannonSlots}
        meriamCooldown={meriamCooldown}
        meriamCooldownSlotId={meriamCooldownSlotId}
      />

      <RadarPlayArea
        logs={logs}
        ships={ships}
        projectiles={projectiles}
        explosions={explosions}
        cannonSlots={cannonSlots}
        meriamCooldown={meriamCooldown}
        meriamCooldownSlotId={meriamCooldownSlotId}
        radarWidth={radarWidth}
        waveBanner={waveBanner}
        fortHealth={fortHealth}
        wave={wave}
        gameStatus={gameStatus}
        checkpointWave={checkpointWave}
        score={score}
        radarAreaRef={radarAreaRef}
        handleRetryCheckpoint={handleRetryCheckpoint}
        handleResetGame={onResetGame}
      />
    </section>
  );
}

