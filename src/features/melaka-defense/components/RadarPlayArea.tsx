"use client";

import { useEffect, useState } from "react";
import type React from "react";
import type {
  CannonSlot,
  ExplosionEffect,
  GameStatus,
  ProjectileEffect,
  Ship,
  TerminalLog,
  WaveBanner,
} from "../types";
import { DEFEAT_TIPS } from "../content";
import {
  LOCATION_SPRITE_URL,
  MERIAM_BALL_SPRITE_URL,
  MERIAM_CANNON_SPRITE_URL,
  MAX_WAVES,
  PAHLAWAN_SPRITE_URL,
  RENTAKA_BALL_SPRITE_URL,
  RENTAKA_CANNON_SPRITE_URL,
  SHIP_SPRITE_URL,
  STRAIT_LENGTH,
} from "../constants";
import {
  getLogToneClassName,
  getShipSpriteOffset,
} from "../lib/game-formatters";

type RadarPlayAreaProps = {
  logs: TerminalLog[];
  ships: Ship[];
  projectiles: ProjectileEffect[];
  explosions: ExplosionEffect[];
  cannonSlots: CannonSlot[];
  meriamCooldown: number;
  meriamCooldownSlotId: string | null;
  radarWidth: number;
  waveBanner: WaveBanner;
  fortHealth: number;
  wave: number;
  gameStatus: GameStatus;
  checkpointWave: number;
  score: number;
  radarAreaRef: React.RefObject<HTMLDivElement | null>;
  handleRetryCheckpoint: () => void;
  handleResetGame: () => void;
};

const getShipLeftPercent = (distance: number) =>
  Math.max(0, Math.min(100, (distance / STRAIT_LENGTH) * 100));

const getShipLaneTopPercent = (lane: number) => 18 + lane * 18;

export function RadarPlayArea({
  logs,
  ships,
  projectiles,
  explosions,
  cannonSlots,
  meriamCooldown,
  meriamCooldownSlotId,
  radarWidth,
  waveBanner,
  fortHealth,
  wave,
  gameStatus,
  checkpointWave,
  score,
  radarAreaRef,
  handleRetryCheckpoint,
  handleResetGame,
}: RadarPlayAreaProps) {
  const [pahlawanFrame, setPahlawanFrame] = useState(0);
  const pahlawanOffset = getShipSpriteOffset(pahlawanFrame);

  useEffect(() => {
    const pahlawanAnimationInterval = window.setInterval(() => {
      setPahlawanFrame((currentFrame) => (currentFrame + 1) % 9);
    }, 500);

    return () => {
      window.clearInterval(pahlawanAnimationInterval);
    };
  }, []);

  return (
    <div
      className="relative min-h-[420px] flex-1 overflow-hidden border-b border-cyan-300/20 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${LOCATION_SPRITE_URL})` }}
    >
      <div
        className="absolute inset-0 bg-slate-950/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2"
        aria-live="polite"
        aria-label="Recent battle logs"
      >
        {logs.slice(-5).map((log) => (
          <div key={log.id} className="font-mono text-xs drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            <p className={`leading-5 ${getLogToneClassName(log.tone)}`}>{log.message}</p>
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 top-0 w-[25%]"
      >
        {cannonSlots.map((slot) => {
          const isMeriamCoolingDown = meriamCooldownSlotId === slot.id && meriamCooldown > 0;
          const shouldShowMeriamCannon = slot.activeMeriamShots > 0 || isMeriamCoolingDown;
          const shouldShowPahlawan = slot.id === "cannon-1" || slot.id === "cannon-2" || slot.id === "cannon-3";

          return (
            <div
              key={slot.id}
              className="absolute right-[-14px] z-10 flex -translate-y-1/2 items-center"
              style={{ top: `${slot.topPercent}%` }}
              aria-label={`${slot.label} is ${slot.status}`}
            >
              <div className="absolute -left-24 flex min-w-20 flex-col items-end pr-2">
                <span className="rounded-full border border-cyan-200/40 bg-slate-950/85 px-2 py-0.5 text-[10px] font-black tracking-widest text-cyan-100 shadow-[0_0_12px_rgba(103,232,249,0.35)]">
                  Slot {slot.id.replace("cannon-", "")}
                </span>
              </div>
              {shouldShowPahlawan ? (
                <div
                  className="pointer-events-none absolute -left-30 top-1/2 z-0 h-14 w-14 -translate-y-1/2 overflow-hidden drop-shadow-[0_8px_10px_rgba(0,0,0,0.75)]"
                  aria-hidden="true"
                >
                  <div
                    className="absolute h-[300%] w-[300%] bg-no-repeat"
                    style={{
                      backgroundImage: `url(${PAHLAWAN_SPRITE_URL})`,
                      backgroundSize: "100% 100%",
                      left: pahlawanOffset.left,
                      top: pahlawanOffset.top,
                    }}
                  />
                </div>
              ) : null}
              <div className="absolute -left-7 h-40 w-8 rounded-full border border-amber-100/40 bg-slate-950/80 shadow-inner">
                {shouldShowMeriamCannon ? (
                  <div className="absolute left-1/2 top-2 h-6 w-6 -translate-x-1/2">
                    <div
                      className="h-full w-full bg-contain bg-center bg-no-repeat"
                      aria-hidden="true"
                      style={{
                        backgroundImage: `url(${MERIAM_CANNON_SPRITE_URL})`,
                        transform: "scaleX(-1) scale(4)",
                      }}
                    />
                  </div>
                ) : null}

                {Array.from({ length: slot.activeRentakaShots }, (_, cannonIndex) => (
                  <div
                    key={`${slot.id}-platform-rentaka-${cannonIndex}`}
                    className="absolute left-1/2 h-6 w-6 -translate-x-1/2"
                    style={{ top: `${shouldShowMeriamCannon ? 48 + cannonIndex * 38 : 10 + cannonIndex * 38}px` }}
                  >
                    <div
                      className="h-full w-full bg-contain bg-center bg-no-repeat"
                      aria-hidden="true"
                      style={{
                        backgroundImage: `url(${RENTAKA_CANNON_SPRITE_URL})`,
                        transform: "scale(2.5)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-10 left-5 text-xs font-black uppercase tracking-[0.35em] text-amber-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          Fort
        </div>
      </div>

      <div ref={radarAreaRef} className="absolute inset-y-0 left-[25%] right-0">
        {cannonSlots.map((slot) => {
          // When actively firing: show only the edge icon
          // (barrel sprite is hidden during active shots)
          const shouldShowMeriamCannon = slot.activeMeriamShots > 0;

          if (slot.activeRentakaShots === 0 && !shouldShowMeriamCannon) {
            return null;
          }

          return (
            <div
              key={`${slot.id}-edge-counts`}
              className="pointer-events-none absolute left-6 z-30 flex -translate-y-1/2 flex-nowrap items-center gap-1"
              style={{ top: `${slot.topPercent}%` }}
              aria-hidden="true"
            >
              {slot.activeRentakaShots > 0 ? (
                <span className="whitespace-nowrap rounded-full border border-cyan-200/30 bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-cyan-100 shadow-[0_0_10px_rgba(103,232,249,0.35)]">
                  Rentaka cannon x{slot.activeRentakaShots}
                </span>
              ) : null}
              {shouldShowMeriamCannon ? (
                <span className="whitespace-nowrap rounded-full border border-orange-200/30 bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-orange-200 shadow-[0_0_10px_rgba(251,146,60,0.35)]">
                  Meriam cannon x1
                </span>
              ) : null}
            </div>
          );
        })}

        {projectiles.map((projectile) => {
          const isMeriam = projectile.weapon === "meriam";
          const currentLeftPercent =
            projectile.originLeftPercent +
            (projectile.targetLeftPercent - projectile.originLeftPercent) * projectile.progress;
          const currentTopPercent =
            projectile.originTopPercent +
            (projectile.targetTopPercent - projectile.originTopPercent) * projectile.progress;

          return (
            <div
              key={projectile.id}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all ease-out"
              style={{
                left: `${currentLeftPercent}%`,
                top: `${currentTopPercent}%`,
                transitionDuration: `${projectile.durationMs}ms`,
              }}
              aria-hidden="true"
            >
              <div className="relative">
                <div
                  className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full blur-[1px] ${
                    isMeriam
                      ? "h-2 w-14 bg-gradient-to-l from-amber-200 to-transparent"
                      : "h-1 w-10 bg-gradient-to-l from-cyan-200 to-transparent"
                  }`}
                />
                <div
                    className={`relative overflow-hidden rounded-full ${
                      isMeriam
                        ? "h-18 w-18 shadow-[0_0_24px_rgba(253,186,116,1)]"
                        : "h-9 w-9 shadow-[0_0_16px_rgba(165,243,252,1)]"
                    }`}
                    style={{
                      backgroundImage: `url(${isMeriam ? MERIAM_BALL_SPRITE_URL : RENTAKA_BALL_SPRITE_URL})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                />
              </div>
            </div>
          );
        })}

        {ships.map((ship) => {
          const leftPercent = getShipLeftPercent(ship.distance);
          const hpPercent = Math.max(0, (ship.hp / ship.maxHp) * 100);
          const isGalleon = ship.type === "Colonizer Galleon";
          const shipSizeClassName = isGalleon ? "h-28 w-28" : "h-20 w-20";
          const pixelsMoved = ((STRAIT_LENGTH - ship.distance) / STRAIT_LENGTH) * radarWidth;
          const animatedSpriteFrame = (ship.spriteFrame + Math.floor(pixelsMoved / 2)) % 9;
          const spriteOffset = getShipSpriteOffset(animatedSpriteFrame);

          return (
            <div
              key={ship.id}
              className="absolute -translate-x-1/2 transition-all duration-1000 ease-linear"
              style={{
                left: `${leftPercent}%`,
                top: `${getShipLaneTopPercent(ship.lane)}%`,
              }}
              aria-label={`${ship.type} at ${Math.round(ship.distance)} meters with ${ship.hp} hit points`}
            >
              <div
                className={`relative ${shipSizeClassName} drop-shadow-[0_12px_18px_rgba(0,0,0,0.75)]`}
              >
                <div className="absolute inset-0 overflow-hidden" style={{ transform: "scaleX(-1)" }}>
                  <div
                    className="absolute h-[300%] w-[300%] bg-no-repeat"
                    style={{
                      backgroundImage: `url(${SHIP_SPRITE_URL})`,
                      backgroundSize: "100% 100%",
                      left: spriteOffset.left,
                      top: spriteOffset.top,
                      filter: isGalleon
                        ? "drop-shadow(0 0 10px rgba(244,63,94,0.35))"
                        : "drop-shadow(0 0 8px rgba(251,146,60,0.35))",
                    }}
                  />
                </div>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                  {isGalleon ? "Galleon" : "Junk"}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-900 ring-1 ring-white/20">
                <div className="h-full rounded-full bg-emerald-300" style={{ width: `${hpPercent}%` }} />
              </div>
              <p className="mt-1 text-center text-[10px] text-cyan-100">
                {ship.hp}/{ship.maxHp} HP | {Math.round(ship.distance)}m
              </p>
            </div>
          );
        })}

        {explosions.map((explosion) => {
          const isLargeExplosion = explosion.size === "large";

          return (
            <div
              key={explosion.id}
              className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${explosion.leftPercent}%`,
                top: `${explosion.laneTopPercent}%`,
              }}
              aria-hidden="true"
            >
              <div
                className={`relative rounded-full bg-orange-300 opacity-90 shadow-[0_0_38px_rgba(251,146,60,0.95)] animate-ping ${
                  isLargeExplosion ? "h-20 w-20" : "h-14 w-14"
                }`}
              />
              <div
                className={`absolute left-1/2 top-1/2 rounded-full bg-amber-100 shadow-[0_0_26px_rgba(254,243,199,1)] ${
                  isLargeExplosion ? "h-10 w-10 -translate-x-5 -translate-y-5" : "h-7 w-7 -translate-x-3.5 -translate-y-3.5"
                }`}
              />
              <div className="absolute left-1/2 top-1/2 h-2 w-16 -translate-x-8 -translate-y-1 rotate-45 rounded-full bg-rose-400/80" />
              <div className="absolute left-1/2 top-1/2 h-2 w-16 -translate-x-8 -translate-y-1 -rotate-45 rounded-full bg-amber-300/80" />
            </div>
          );
        })}

        {ships.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-cyan-100/70">
            No hostile ships on radar.
          </div>
        ) : null}
      </div>

      {waveBanner ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6">
          <div
            className={`rounded-2xl border px-8 py-5 text-center shadow-[0_0_40px_rgba(0,0,0,0.45)] backdrop-blur-sm ${
              waveBanner.tone === "complete"
                ? "border-emerald-300/40 bg-emerald-950/60"
                : "border-amber-300/40 bg-amber-950/60"
            }`}
            style={{ animation: "wave-pop 500ms ease-out" }}
          >
            <p
              className={`text-3xl font-black uppercase tracking-[0.25em] ${
                waveBanner.tone === "complete" ? "text-emerald-100" : "text-amber-100"
              }`}
            >
              {waveBanner.title}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-200">{waveBanner.subtitle}</p>
          </div>
        </div>
      ) : null}

      {fortHealth <= 0 ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="defeat-dialog-title"
        >
          <div className="max-w-xl rounded-2xl border border-rose-300/40 bg-slate-950/95 p-6 text-center shadow-[0_0_45px_rgba(244,63,94,0.35)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-200/50 bg-rose-500/20">
              <div className="h-9 w-9 animate-ping rounded-full bg-rose-300/70" />
            </div>
            <h2
              id="defeat-dialog-title"
              className="mt-4 text-2xl font-black uppercase tracking-[0.2em] text-rose-100"
            >
              Fort Breached
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The Melaka fort has fallen on wave {wave}. Improve your cannon code and defend the strait again.
            </p>
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200">Tips to improve</p>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-300">
                {DEFEAT_TIPS.map((tip) => (
                  <li key={tip}>- {tip}</li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRetryCheckpoint}
                className="rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-100"
                aria-label="Retry from the wave where the fort fell"
              >
                Retry Wave {checkpointWave}
              </button>
              <button
                type="button"
                onClick={handleResetGame}
                className="rounded-full border border-rose-200/40 px-5 py-2 text-sm font-bold text-rose-100 transition hover:bg-rose-300/10 focus:outline-none focus:ring-2 focus:ring-rose-100"
                aria-label="Reset the game after defeat"
              >
                Restart From Wave 1
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {gameStatus === "victory" ? (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="victory-dialog-title"
        >
          <div className="max-w-md rounded-2xl border border-emerald-300/40 bg-slate-950/95 p-6 text-center shadow-[0_0_45px_rgba(52,211,153,0.35)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200/50 bg-emerald-500/20">
              <div className="h-9 w-9 animate-ping rounded-full bg-emerald-300/70" />
            </div>
            <h2
              id="victory-dialog-title"
              className="mt-4 text-2xl font-black uppercase tracking-[0.2em] text-emerald-100"
            >
              Strait Defended
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Victory! You survived all {MAX_WAVES} waves and protected the Melaka Sultanate Fort.
            </p>
            <p className="mt-2 text-sm font-bold text-amber-200">Final Score: {score}</p>
            <button
              type="button"
              onClick={handleResetGame}
              className="mt-5 rounded-full bg-emerald-300 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              aria-label="Reset the game after victory"
            >
              Play Again
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

