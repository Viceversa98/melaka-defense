import type { LogTone } from "../types";

export const getShipSpriteOffset = (spriteFrame: number) => {
  const column = spriteFrame % 3;
  const row = Math.floor(spriteFrame / 3);

  return {
    left: `-${column * 100}%`,
    top: `-${row * 100}%`,
  };
};

export const getRentakaCannonTopOffset = (cannonIndex: number) => [0, 2.8, 5.6][cannonIndex] ?? 0;

export const getLogToneClassName = (tone: LogTone) => {
  if (tone === "success") {
    return "text-emerald-300";
  }

  if (tone === "warning") {
    return "text-amber-300";
  }

  if (tone === "error") {
    return "text-rose-300";
  }

  return "text-cyan-200";
};

