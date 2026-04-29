export type ShipType = "Pirate Junk" | "Colonizer Galleon";
export type LogTone = "info" | "success" | "warning" | "error";

export type Ship = {
  id: string;
  type: ShipType;
  distance: number;
  hp: number;
  maxHp: number;
  speed: number;
  lane: number;
  spriteFrame: number;
};

export type RadarShip = Pick<Ship, "id" | "type" | "distance" | "hp" | "maxHp">;

export type TerminalLog = {
  id: string;
  tick: number;
  tone: LogTone;
  message: string;
};

export type WeaponType = "rentaka" | "meriam";
export type CannonFunctionName = "cannon1" | "cannon2" | "cannon3";
export type GameStatus = "playing" | "victory";

export type WaveBanner =
  | {
      title: string;
      subtitle: string;
      tone: "complete" | "ready";
    }
  | null;

export type ProjectileEffect = {
  id: string;
  weapon: WeaponType;
  originLeftPercent: number;
  targetLeftPercent: number;
  originTopPercent: number;
  targetTopPercent: number;
  durationMs: number;
  progress: number;
};

export type ExplosionEffect = {
  id: string;
  leftPercent: number;
  laneTopPercent: number;
  size: "small" | "large";
};

export type CannonSlot = {
  id: string;
  label: string;
  functionName: CannonFunctionName;
  topPercent: number;
  status: "ready" | "firing";
  activeShots: number;
  activeRentakaShots: number;
  activeMeriamShots: number;
  rentakaShotsThisTick: number;
  rentakaTick: number;
  meriamShotsThisTick: number;
  meriamTick: number;
  weapon?: WeaponType;
};

export type PlayerApi = {
  radar: {
    getShips: () => RadarShip[];
  };
  artillery: {
    fireRentaka: (shipId: string) => void;
    fireMeriam: (shipId: string) => void;
  };
  command: {
    log: (message: string) => void;
  };
};

export type CompiledPlayerProgram = Partial<
  Record<
    CannonFunctionName,
    (radar: PlayerApi["radar"], artillery: PlayerApi["artillery"], command: PlayerApi["command"]) => void
  >
> & {
  onTick?: (radar: PlayerApi["radar"], artillery: PlayerApi["artillery"], command: PlayerApi["command"]) => void;
};

