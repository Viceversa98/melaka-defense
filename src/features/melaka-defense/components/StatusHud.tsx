"use client";

import type { CannonSlot } from "../types";
import {
  MAX_WAVES,
  MERIAM_COOLDOWN_TICKS,
  RENTAKA_BULLETS_PER_CANNON_PER_TICK,
} from "../constants";

type StatusHudProps = {
  fortHealth: number;
  score: number;
  wave: number;
  waveShipTotal: number;
  waveShipsSpawned: number;
  tick: number;
  cannonSlots: CannonSlot[];
  meriamCooldown: number;
  meriamCooldownSlotId: string | null;
};

export const StatusHud = ({
  fortHealth,
  score,
  wave,
  waveShipTotal,
  waveShipsSpawned,
  tick,
  cannonSlots,
  meriamCooldown,
  meriamCooldownSlotId,
}: StatusHudProps) => {
  return (
    <div
      className="grid shrink-0 grid-cols-2 gap-1.5 border-b border-cyan-300/20 p-1.5 text-[10px] sm:grid-cols-4 sm:gap-2 sm:p-2 sm:text-xs"
      aria-label="Battle status"
    >
      <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 sm:rounded-lg sm:px-2.5 sm:py-2">
        <p className="text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">Fort HP</p>
        <p className="leading-none text-base font-bold tabular-nums text-emerald-300 sm:text-lg">{fortHealth}</p>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 sm:rounded-lg sm:px-2.5 sm:py-2">
        <p className="text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">Score</p>
        <p className="leading-none text-base font-bold tabular-nums text-amber-200 sm:text-lg">{score}</p>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 sm:rounded-lg sm:px-2.5 sm:py-2">
        <p className="text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">Wave</p>
        <p className="leading-none text-base font-bold tabular-nums text-fuchsia-200 sm:text-lg">
          {wave}/{MAX_WAVES}
        </p>
        <p className="mt-0.5 text-[9px] leading-tight text-slate-500 sm:text-[10px]">
          {waveShipsSpawned}/{waveShipTotal} ships
        </p>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 sm:rounded-lg sm:px-2.5 sm:py-2">
        <p className="text-[9px] uppercase tracking-wide text-slate-500 sm:text-[10px]">Reloading</p>
        <div className="mt-0.5 space-y-0.5 sm:mt-1 sm:space-y-1">
          {cannonSlots.map((slot) => {
            const isMeriamCoolingDown = meriamCooldownSlotId === slot.id && meriamCooldown > 0;
            const meriamCooldownProgress = isMeriamCoolingDown
              ? (MERIAM_COOLDOWN_TICKS - meriamCooldown + 1) / MERIAM_COOLDOWN_TICKS
              : 0;
            const meriamCooldownDashOffset = 44 - 44 * meriamCooldownProgress;
            const isMeriamReady = meriamCooldown <= 0 && slot.activeMeriamShots === 0;
            const readyRentakaShots =
              slot.rentakaTick === tick
                ? Math.max(0, RENTAKA_BULLETS_PER_CANNON_PER_TICK - slot.rentakaShotsThisTick)
                : RENTAKA_BULLETS_PER_CANNON_PER_TICK;

            return (
              <div
                key={slot.id}
                className="flex flex-col gap-0.5 leading-tight sm:flex-row sm:items-center sm:justify-between sm:gap-1.5"
              >
                <span className="shrink-0 font-bold text-cyan-100">C{slot.id.replace("cannon-", "")}</span>
                <div className="flex min-w-0 flex-wrap justify-start gap-0.5 sm:justify-end">
                  {slot.activeRentakaShots > 0 ? (
                    <span className="rounded-full bg-cyan-300/10 px-1 py-px font-semibold text-cyan-200">
                      R×{slot.activeRentakaShots}
                    </span>
                  ) : null}

                  {slot.activeMeriamShots > 0 || isMeriamCoolingDown ? (
                    <span className="inline-flex max-w-full items-center gap-0.5 rounded-full bg-orange-300/10 px-1 py-px font-semibold text-orange-300">
                      <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 shrink-0 -rotate-90 sm:h-3 sm:w-3" aria-hidden="true">
                        <circle cx="10" cy="10" r="7" className="fill-transparent stroke-orange-200/25" strokeWidth="3" />
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          className="fill-none stroke-orange-300"
                          strokeDasharray="44"
                          strokeDashoffset={meriamCooldownDashOffset}
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      </svg>
                      <span className="truncate">M{isMeriamCoolingDown ? ` ${meriamCooldown}t` : ""}</span>
                    </span>
                  ) : null}

                  {slot.activeShots === 0 && !isMeriamCoolingDown ? (
                    <>
                      <span className="rounded-full bg-cyan-300/10 px-1 py-px font-semibold text-cyan-200">
                        R×{readyRentakaShots}
                      </span>
                      <span
                        className={`rounded-full px-1 py-px font-semibold ${
                          isMeriamReady ? "bg-orange-300/10 text-orange-300" : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {isMeriamReady ? "M ready" : "M lock"}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
