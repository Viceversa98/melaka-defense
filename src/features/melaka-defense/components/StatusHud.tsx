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

export function StatusHud({
  fortHealth,
  score,
  wave,
  waveShipTotal,
  waveShipsSpawned,
  tick,
  cannonSlots,
  meriamCooldown,
  meriamCooldownSlotId,
}: StatusHudProps) {
  return (
    <div className="grid gap-3 border-b border-cyan-300/20 p-4 text-sm sm:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-slate-400">Fort HP</p>
        <p className="mt-1 text-2xl font-bold text-emerald-300">{fortHealth}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-slate-400">Score</p>
        <p className="mt-1 text-2xl font-bold text-amber-200">{score}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-slate-400">Wave</p>
        <p className="mt-1 text-2xl font-bold text-fuchsia-200">
          {wave}/{MAX_WAVES}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {waveShipsSpawned}/{waveShipTotal} ships
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-slate-400">Reloading</p>
        <div className="mt-2 space-y-1">
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
              <div key={slot.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-cyan-100">
                  C{slot.id.replace("cannon-", "")}
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                  {slot.activeRentakaShots > 0 ? (
                    <span className="rounded-full bg-cyan-300/10 px-1.5 py-0.5 font-semibold text-cyan-200">
                      Rentaka x{slot.activeRentakaShots}
                    </span>
                  ) : null}

                  {slot.activeMeriamShots > 0 || isMeriamCoolingDown ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-300/10 px-1.5 py-0.5 font-semibold text-orange-300">
                      <svg
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5 -rotate-90"
                        aria-hidden="true"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="7"
                          className="fill-transparent stroke-orange-200/25"
                          strokeWidth="3"
                        />
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
                      Meriam {isMeriamCoolingDown ? `${meriamCooldown}t` : ""}
                    </span>
                  ) : null}

                  {slot.activeShots === 0 && !isMeriamCoolingDown ? (
                    <>
                      <span className="rounded-full bg-cyan-300/10 px-1.5 py-0.5 font-semibold text-cyan-200">
                        Rentaka x{readyRentakaShots}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-semibold ${
                          isMeriamReady ? "bg-orange-300/10 text-orange-300" : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {isMeriamReady ? "Meriam Ready" : "Meriam Locked"}
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
}

