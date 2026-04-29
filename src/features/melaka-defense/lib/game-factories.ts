import type { CannonSlot, Ship } from "../types";
import {
  CANNON_SLOT_COUNT,
  STRAIT_LENGTH,
} from "../constants";

export const getWaveShipTotal = (wave: number) => 3 + wave * 2;

export const createShip = (tick: number, wave = 1): Ship => {
  const isGalleon = Math.random() > Math.max(0.48, 0.72 - wave * 0.03);
  const hpBonus = (wave - 1) * (isGalleon ? 15 : 6);
  const speedBonus = Math.min(30, (wave - 1) * 3);

  return {
    id: `${isGalleon ? "galleon" : "junk"}-${tick}-${Math.floor(Math.random() * 999)}`,
    type: isGalleon ? "Colonizer Galleon" : "Pirate Junk",
    distance: STRAIT_LENGTH,
    hp: (isGalleon ? 150 : 50) + hpBonus,
    maxHp: (isGalleon ? 150 : 50) + hpBonus,
    speed: (isGalleon ? 55 : 95) + speedBonus,
    lane: Math.floor(Math.random() * 4),
    spriteFrame: Math.floor(Math.random() * 9),
  };
};

export const createStartingShip = (): Ship => ({
  id: "junk-0-starting",
  type: "Pirate Junk",
  distance: STRAIT_LENGTH,
  hp: 50,
  maxHp: 50,
  speed: 95,
  lane: 1,
  spriteFrame: 0,
});

export const createCannonSlots = (): CannonSlot[] =>
  Array.from({ length: CANNON_SLOT_COUNT }, (_, index) => ({
    id: `cannon-${index + 1}`,
    label: `Slot ${index + 1}`,
    functionName: `cannon${index + 1}` as CannonSlot["functionName"],
    topPercent: 24 + index * 24,
    status: "ready",
    activeShots: 0,
    activeRentakaShots: 0,
    activeMeriamShots: 0,
    rentakaShotsThisTick: 0,
    rentakaTick: -1,
    meriamShotsThisTick: 0,
    meriamTick: -1,
    // When no shot is active, weapon is undefined (used by some UI states).
    weapon: undefined,
  }));

