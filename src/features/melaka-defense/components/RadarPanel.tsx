"use client";

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
    <section className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-300/20 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200">
            Strait of Melaka Radar
          </p>
          <p className="mt-1 text-sm text-slate-300">Fort at X = 0. Hostile ships enter from X = {STRAIT_LENGTH}.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onTogglePause}
            className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            aria-label={isPaused ? "Resume game loop" : "Pause game loop"}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>

          <button
            type="button"
            onClick={onResetGame}
            className="rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
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

