"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WarRoomPanel } from "./components/WarRoomPanel";
import { RadarPanel } from "./components/RadarPanel";
import type {
  CannonFunctionName,
  CompiledPlayerProgram,
  GameStatus,
  LogTone,
  PlayerApi,
  CannonSlot,
  ExplosionEffect,
  ProjectileEffect,
  Ship,
  TerminalLog,
  WaveBanner,
  WeaponType,
} from "./types";
import {
  FORT_HEALTH,
  MAX_LOGS,
  MAX_WAVES,
  MERIAM_COOLDOWN_TICKS,
  MERIAM_SHOTS_PER_CANNON_PER_TICK,
  RENTAKA_BULLETS_PER_CANNON_PER_TICK,
  STRAIT_LENGTH,
} from "./constants";
import { createCannonSlots, createShip, createStartingShip, getWaveShipTotal } from "./lib/game-factories";
import { getRentakaCannonTopOffset } from "./lib/game-formatters";
import {
  DEFAULT_VISUAL_PROGRAM,
  generateJavaScriptFromVisual,
  type VisualProgram,
} from "./lib/visual-program";

const CANNON_FUNCTION_NAMES: CannonFunctionName[] = ["cannon1", "cannon2", "cannon3"];

const getBlockBody = (sourceCode: string, openingBraceIndex: number) => {
  let depth = 0;

  for (let index = openingBraceIndex; index < sourceCode.length; index++) {
    const character = sourceCode[index];

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return sourceCode.slice(openingBraceIndex + 1, index);
      }
    }
  }

  return "";
};

const getFunctionBody = (sourceCode: string, functionName: CannonFunctionName) => {
  const functionMatch = new RegExp(`function\\s+${functionName}\\s*\\(`).exec(sourceCode);

  if (!functionMatch) {
    return "";
  }

  const functionStartIndex = functionMatch.index + functionMatch[0].length;
  const openingBraceIndex = sourceCode.indexOf("{", functionStartIndex);

  if (openingBraceIndex < 0) {
    return "";
  }

  return getBlockBody(sourceCode, openingBraceIndex);
};

const hasRentakaInsideForLoop = (functionBody: string) => {
  const forLoopPattern = /for\s*\([^)]*\)\s*\{/g;
  let forLoopMatch: RegExpExecArray | null = forLoopPattern.exec(functionBody);

  while (forLoopMatch) {
    const openingBraceIndex = forLoopMatch.index + forLoopMatch[0].length - 1;
    const forLoopBody = getBlockBody(functionBody, openingBraceIndex);

    if (forLoopBody.includes("artillery.fireRentaka")) {
      return true;
    }

    forLoopMatch = forLoopPattern.exec(functionBody);
  }

  return false;
};

const getRentakaLoopPermissionByFunctionName = (sourceCode: string) =>
  CANNON_FUNCTION_NAMES.reduce<Record<CannonFunctionName, boolean>>(
    (permissionByFunctionName, functionName) => ({
      ...permissionByFunctionName,
      [functionName]: hasRentakaInsideForLoop(getFunctionBody(sourceCode, functionName)),
    }),
    {
      cannon1: false,
      cannon2: false,
      cannon3: false,
    },
  );

export default function MelakaDefenseGame() {
  const [visualProgram, setVisualProgram] = useState<VisualProgram>(DEFAULT_VISUAL_PROGRAM);
  const [code, setCode] = useState(() => generateJavaScriptFromVisual(DEFAULT_VISUAL_PROGRAM));
  const [ships, setShips] = useState<Ship[]>(() => [createStartingShip()]);
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: "boot",
      tick: 0,
      tone: "info",
      message: "Melaka command console online. Use Visual logic or read generated JavaScript to defend the fort.",
    },
  ]);
  const [tick, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [fortHealth, setFortHealth] = useState(FORT_HEALTH);
  const [isPaused, setIsPaused] = useState(false);
  const [meriamCooldown, setMeriamCooldown] = useState(0);
  const [meriamCooldownSlotId, setMeriamCooldownSlotId] = useState<string | null>(null);
  const [projectiles, setProjectiles] = useState<ProjectileEffect[]>([]);
  const [explosions, setExplosions] = useState<ExplosionEffect[]>([]);
  const [cannonSlots, setCannonSlots] = useState<CannonSlot[]>(() => createCannonSlots());
  const [radarWidth, setRadarWidth] = useState(0);
  const [wave, setWave] = useState(1);
  const [waveShipTotal, setWaveShipTotal] = useState(() => getWaveShipTotal(1));
  const [waveShipsSpawned, setWaveShipsSpawned] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [waveBanner, setWaveBanner] = useState<WaveBanner>(null);
  const [checkpointWave, setCheckpointWave] = useState(1);
  const [checkpointFortHealth, setCheckpointFortHealth] = useState(FORT_HEALTH);

  const codeRef = useRef(code);
  const shipsRef = useRef(ships);
  const logsRef = useRef(logs);
  const tickRef = useRef(tick);
  const scoreRef = useRef(score);
  const fortHealthRef = useRef(fortHealth);
  const isPausedRef = useRef(isPaused);
  const meriamCooldownRef = useRef(meriamCooldown);
  const meriamCooldownSlotIdRef = useRef<string | null>(meriamCooldownSlotId);
  const cannonSlotsRef = useRef(cannonSlots);
  const waveRef = useRef(wave);
  const waveShipTotalRef = useRef(waveShipTotal);
  const waveShipsSpawnedRef = useRef(waveShipsSpawned);
  const gameStatusRef = useRef(gameStatus);
  const isWaveTransitioningRef = useRef(false);
  const checkpointWaveRef = useRef(checkpointWave);
  const checkpointFortHealthRef = useRef(checkpointFortHealth);
  const radarAreaRef = useRef<HTMLDivElement | null>(null);
  const radarWidthRef = useRef(radarWidth);
  const effectTimeoutsRef = useRef<number[]>([]);
  const shotSequenceRef = useRef(0);

  const [isWarRoomOpen, setIsWarRoomOpen] = useState(false);
  const [isXlViewport, setIsXlViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const handleMediaChange = () => {
      setIsXlViewport(mediaQuery.matches);
    };

    handleMediaChange();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const handleToggleWarRoom = () => {
    setIsWarRoomOpen((current) => !current);
  };

  const handleVisualProgramChange = useCallback((next: VisualProgram) => {
    setVisualProgram(next);
    setCode(generateJavaScriptFromVisual(next));
  }, []);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    shipsRef.current = ships;
  }, [ships]);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    fortHealthRef.current = fortHealth;
  }, [fortHealth]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    meriamCooldownRef.current = meriamCooldown;
  }, [meriamCooldown]);

  useEffect(() => {
    meriamCooldownSlotIdRef.current = meriamCooldownSlotId;
  }, [meriamCooldownSlotId]);

  useEffect(() => {
    cannonSlotsRef.current = cannonSlots;
  }, [cannonSlots]);

  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);

  useEffect(() => {
    waveShipTotalRef.current = waveShipTotal;
  }, [waveShipTotal]);

  useEffect(() => {
    waveShipsSpawnedRef.current = waveShipsSpawned;
  }, [waveShipsSpawned]);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    checkpointWaveRef.current = checkpointWave;
  }, [checkpointWave]);

  useEffect(() => {
    checkpointFortHealthRef.current = checkpointFortHealth;
  }, [checkpointFortHealth]);

  useEffect(() => {
    radarWidthRef.current = radarWidth;
  }, [radarWidth]);

  useEffect(() => {
    const radarArea = radarAreaRef.current;

    if (!radarArea) {
      return;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      setRadarWidth(entry.contentRect.width);
    });

    resizeObserver.observe(radarArea);
    setRadarWidth(radarArea.getBoundingClientRect().width);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const appendLog = useCallback((message: string, tone: LogTone = "info") => {
    const nextLog: TerminalLog = {
      id: `${Date.now()}-${Math.random()}`,
      tick: tickRef.current,
      tone,
      message,
    };
    const nextLogs = [...logsRef.current, nextLog].slice(-MAX_LOGS);

    logsRef.current = nextLogs;
    setLogs(nextLogs);
  }, []);

  const clearEffectTimeouts = useCallback(() => {
    effectTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    effectTimeoutsRef.current = [];
  }, []);

  const registerEffectTimeout = useCallback((handler: () => void, delay: number) => {
    const timeoutId = window.setTimeout(handler, delay);
    effectTimeoutsRef.current = [...effectTimeoutsRef.current, timeoutId];
  }, []);

  const getShipLeftPercent = useCallback(
    (distance: number) => Math.max(0, Math.min(100, (distance / STRAIT_LENGTH) * 100)),
    [],
  );

  const getShipLaneTopPercent = useCallback((lane: number) => 18 + lane * 18, []);

  const acquireCannonSlot = useCallback((weapon: WeaponType, requestedSlotId?: string) => {
    const canFireRentaka = (slot: CannonSlot) => {
      const currentTickRentakaShots =
        slot.rentakaTick === tickRef.current ? slot.rentakaShotsThisTick : 0;

      return currentTickRentakaShots < RENTAKA_BULLETS_PER_CANNON_PER_TICK && slot.activeMeriamShots === 0;
    };

    const canFireMeriam = (slot: CannonSlot) => {
      const currentTickMeriamShots =
        slot.meriamTick === tickRef.current ? slot.meriamShotsThisTick : 0;

      return currentTickMeriamShots < MERIAM_SHOTS_PER_CANNON_PER_TICK && slot.activeMeriamShots === 0;
    };

    const canFireWeapon = (slot: CannonSlot) => (weapon === "rentaka" ? canFireRentaka(slot) : canFireMeriam(slot));

    const availableSlot = requestedSlotId
      ? cannonSlotsRef.current.find((slot) => slot.id === requestedSlotId && canFireWeapon(slot))
      : cannonSlotsRef.current.find(canFireWeapon);

    if (!availableSlot) {
      return null;
    }

    const nextSlots = cannonSlotsRef.current.map((slot) =>
      slot.id === availableSlot.id
        ? {
            ...slot,
            activeShots: slot.activeShots + 1,
            activeRentakaShots: weapon === "rentaka" ? slot.activeRentakaShots + 1 : slot.activeRentakaShots,
            activeMeriamShots: weapon === "meriam" ? slot.activeMeriamShots + 1 : slot.activeMeriamShots,
            rentakaShotsThisTick:
              weapon === "rentaka"
                ? (slot.rentakaTick === tickRef.current ? slot.rentakaShotsThisTick : 0) + 1
                : slot.rentakaShotsThisTick,
            rentakaTick: weapon === "rentaka" ? tickRef.current : slot.rentakaTick,
            meriamShotsThisTick:
              weapon === "meriam"
                ? (slot.meriamTick === tickRef.current ? slot.meriamShotsThisTick : 0) + 1
                : slot.meriamShotsThisTick,
            meriamTick: weapon === "meriam" ? tickRef.current : slot.meriamTick,
            status: "firing" as const,
            weapon,
          }
        : slot,
    );

    cannonSlotsRef.current = nextSlots;
    setCannonSlots(nextSlots);
    return availableSlot.id;
  }, []);

  const releaseCannonSlot = useCallback((slotId: string, weapon: WeaponType) => {
    const nextSlots = cannonSlotsRef.current.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }

      const activeShots = Math.max(0, slot.activeShots - 1);
      const activeRentakaShots = weapon === "rentaka" ? Math.max(0, slot.activeRentakaShots - 1) : slot.activeRentakaShots;
      const activeMeriamShots = weapon === "meriam" ? Math.max(0, slot.activeMeriamShots - 1) : slot.activeMeriamShots;
      const activeWeapon: WeaponType | undefined = activeMeriamShots > 0 ? "meriam" : activeRentakaShots > 0 ? "rentaka" : undefined;

      return {
        ...slot,
        activeShots,
        activeRentakaShots,
        activeMeriamShots,
        status: activeShots > 0 ? ("firing" as const) : ("ready" as const),
        weapon: activeWeapon,
      };
    });

    cannonSlotsRef.current = nextSlots;
    setCannonSlots(nextSlots);
  }, []);

  const queueProjectileEffect = useCallback(
    (ship: Ship, weapon: WeaponType, slotId: string) => {
      const cannonSlot = cannonSlotsRef.current.find((slot) => slot.id === slotId);

      if (!cannonSlot) {
        return 0;
      }

      const projectileId = `${weapon}-${ship.id}-${tickRef.current}-${Math.random()}`;
      const shotSequence = shotSequenceRef.current;
      const laneSpread = weapon === "meriam" ? 1.8 : 1.2;
      const laneOffset = ((shotSequence % 5) - 2) * laneSpread;
      const launchDelay = weapon === "meriam" ? 0 : (shotSequence % 4) * 85;
      const flightDuration = weapon === "meriam" ? 1200 : 850;
      const impactDelay = 20 + launchDelay + flightDuration;
      const radarWidthPixels = Math.max(1, radarWidthRef.current);
      const rentakaBarrelIndex = Math.max(0, Math.min(2, cannonSlot.activeRentakaShots - 1));
      const muzzleOffsetPixels = weapon === "meriam" ? 38 : 34;
      const originLeftPercent = Math.min(10, (muzzleOffsetPixels / radarWidthPixels) * 100);
      const originTopPercent =
        weapon === "meriam"
          ? cannonSlot.topPercent - 4
          : cannonSlot.topPercent + getRentakaCannonTopOffset(rentakaBarrelIndex);

      shotSequenceRef.current += 1;

      setProjectiles((currentProjectiles) => [
        ...currentProjectiles,
        {
          id: projectileId,
          weapon,
          originLeftPercent,
          targetLeftPercent: getShipLeftPercent(ship.distance),
          originTopPercent,
          targetTopPercent: getShipLaneTopPercent(ship.lane) + laneOffset,
          durationMs: flightDuration,
          progress: 0,
        },
      ]);

      registerEffectTimeout(() => {
        setProjectiles((currentProjectiles) =>
          currentProjectiles.map((projectile) => (projectile.id === projectileId ? { ...projectile, progress: 1 } : projectile)),
        );
      }, 20 + launchDelay);

      registerEffectTimeout(() => {
        setProjectiles((currentProjectiles) => currentProjectiles.filter((projectile) => projectile.id !== projectileId));
      }, impactDelay + 160);

      return impactDelay;
    },
    [getShipLaneTopPercent, getShipLeftPercent, registerEffectTimeout],
  );

  const queueExplosionEffect = useCallback(
    (ship: Ship) => {
      const explosionId = `explosion-${ship.id}-${tickRef.current}-${Math.random()}`;

      setExplosions((currentExplosions) => [
        ...currentExplosions,
        {
          id: explosionId,
          leftPercent: getShipLeftPercent(ship.distance),
          laneTopPercent: getShipLaneTopPercent(ship.lane),
          size: ship.type === "Colonizer Galleon" ? "large" : "small",
        },
      ]);

      registerEffectTimeout(() => {
        setExplosions((currentExplosions) => currentExplosions.filter((explosion) => explosion.id !== explosionId));
      }, 900);
    },
    [getShipLaneTopPercent, getShipLeftPercent, registerEffectTimeout],
  );

  const applyProjectileDamage = useCallback(
    (shipId: string, damage: number, weapon: WeaponType, slotId: string) => {
      releaseCannonSlot(slotId, weapon);

      const target = shipsRef.current.find((ship) => ship.id === shipId && ship.hp > 0);
      if (!target) {
        return;
      }

      const damagedShip: Ship = { ...target, hp: Math.max(0, target.hp - damage) };
      const nextShips = shipsRef.current.map((ship) => (ship.id === shipId ? damagedShip : ship));
      const weaponName = weapon === "meriam" ? "Meriam" : "Rentaka";

      appendLog(`${weaponName} hit ${target.type} ${target.id} for ${damage} damage.`, "success");

      if (damagedShip.hp > 0) {
        shipsRef.current = nextShips;
        setShips(nextShips);
        return;
      }

      const earnedScore = target.type === "Colonizer Galleon" ? 150 : 60;
      const survivingShips = nextShips.filter((ship) => ship.hp > 0);

      scoreRef.current += earnedScore;
      shipsRef.current = survivingShips;

      setScore(scoreRef.current);
      setShips(survivingShips);
      queueExplosionEffect(damagedShip);
      appendLog(`${target.type} ${target.id} sunk. +${earnedScore}`, "success");
    },
    [appendLog, queueExplosionEffect, releaseCannonSlot],
  );

  const handleResetGame = () => {
    const startingShips = [createStartingShip()];
    const startingCannonSlots = createCannonSlots();
    const startingLogs: TerminalLog[] = [
      {
        id: "reset",
        tick: 0,
        tone: "info",
        message: "War room reset. The Sultanate awaits your commands.",
      },
    ];

    tickRef.current = 0;
    scoreRef.current = 0;
    fortHealthRef.current = FORT_HEALTH;
    shipsRef.current = startingShips;
    logsRef.current = startingLogs;
    meriamCooldownRef.current = 0;
    meriamCooldownSlotIdRef.current = null;
    isPausedRef.current = false;
    cannonSlotsRef.current = startingCannonSlots;
    waveRef.current = 1;
    waveShipTotalRef.current = getWaveShipTotal(1);
    waveShipsSpawnedRef.current = 1;
    gameStatusRef.current = "playing";
    isWaveTransitioningRef.current = false;
    checkpointWaveRef.current = 1;
    checkpointFortHealthRef.current = FORT_HEALTH;
    shotSequenceRef.current = 0;
    clearEffectTimeouts();

    setTick(0);
    setScore(0);
    setFortHealth(FORT_HEALTH);
    setShips(startingShips);
    setLogs(startingLogs);
    setMeriamCooldown(0);
    setMeriamCooldownSlotId(null);
    setIsPaused(false);
    setProjectiles([]);
    setExplosions([]);
    setCannonSlots(startingCannonSlots);
    setWave(1);
    setWaveShipTotal(getWaveShipTotal(1));
    setWaveShipsSpawned(1);
    setGameStatus("playing");
    setWaveBanner(null);
    setCheckpointWave(1);
    setCheckpointFortHealth(FORT_HEALTH);
    setVisualProgram(DEFAULT_VISUAL_PROGRAM);
    setCode(generateJavaScriptFromVisual(DEFAULT_VISUAL_PROGRAM));
  };

  const handleTogglePause = () => {
    setIsPaused((currentIsPaused) => !currentIsPaused);
  };

  const handleRetryCheckpoint = () => {
    const retryWave = checkpointWaveRef.current;
    const retryFortHealth = Math.max(1, checkpointFortHealthRef.current);
    const retryShip = createShip(tickRef.current, retryWave);
    const retryShipTotal = getWaveShipTotal(retryWave);
    const retryCannonSlots = createCannonSlots();

    clearEffectTimeouts();

    fortHealthRef.current = retryFortHealth;
    shipsRef.current = [retryShip];
    meriamCooldownRef.current = 0;
    meriamCooldownSlotIdRef.current = null;
    cannonSlotsRef.current = retryCannonSlots;
    waveRef.current = retryWave;
    waveShipTotalRef.current = retryShipTotal;
    waveShipsSpawnedRef.current = 1;
    gameStatusRef.current = "playing";
    isWaveTransitioningRef.current = false;
    shotSequenceRef.current = 0;

    setFortHealth(retryFortHealth);
    setShips([retryShip]);
    setMeriamCooldown(0);
    setMeriamCooldownSlotId(null);
    setCannonSlots(retryCannonSlots);
    setProjectiles([]);
    setExplosions([]);
    setWave(retryWave);
    setWaveShipTotal(retryShipTotal);
    setWaveShipsSpawned(1);
    setGameStatus("playing");
    setWaveBanner(null);
    appendLog(`Retrying wave ${retryWave} with ${retryFortHealth} fort HP.`, "warning");
  };

  useEffect(() => {
    const runGameTick = () => {
      if (isPausedRef.current || fortHealthRef.current <= 0 || gameStatusRef.current === "victory") {
        return;
      }

      const nextTick = tickRef.current + 1;
      tickRef.current = nextTick;
      setTick(nextTick);

      let nextFortHealth = fortHealthRef.current;
      let workingShips = shipsRef.current
        .map((ship) => ({
          ...ship,
          distance: Math.max(0, ship.distance - ship.speed),
        }))
        .filter((ship) => {
          if (ship.distance > 0) {
            return true;
          }

          const damage = ship.type === "Colonizer Galleon" ? 25 : 10;
          nextFortHealth = Math.max(0, nextFortHealth - damage);
          queueExplosionEffect({ ...ship, distance: 0 });
          appendLog(`${ship.type} breached the fort walls for ${damage} damage.`, "warning");
          return false;
        });

      if (nextFortHealth <= 0) {
        fortHealthRef.current = nextFortHealth;
        shipsRef.current = workingShips;
        setFortHealth(nextFortHealth);
        setShips(workingShips);
        appendLog("The fort has fallen. Reset the simulation and revise your defense code.", "error");
        return;
      }

      if (
        workingShips.length === 0 &&
        waveShipsSpawnedRef.current >= waveShipTotalRef.current &&
        !isWaveTransitioningRef.current
      ) {
        if (waveRef.current >= MAX_WAVES) {
          gameStatusRef.current = "victory";
          shipsRef.current = [];
          setShips([]);
          setGameStatus("victory");
          appendLog("Victory! The Melaka Sultanate held the strait.", "success");
          return;
        }

        const completedWave = waveRef.current;
        const nextWave = waveRef.current + 1;
        const nextWaveShipTotal = getWaveShipTotal(nextWave);
        isWaveTransitioningRef.current = true;
        setWaveBanner({
          title: `Wave ${completedWave} Complete`,
          subtitle: "The strait is clear for now.",
          tone: "complete",
        });
        appendLog(`Wave ${completedWave} complete.`, "success");

        registerEffectTimeout(() => {
          setWaveBanner({
            title: `Ready for Wave ${nextWave}`,
            subtitle: `${nextWaveShipTotal} hostile ships incoming.`,
            tone: "ready",
          });
          appendLog(`Ready for wave ${nextWave}.`, "warning");
        }, 1400);

        registerEffectTimeout(() => {
          const firstShip = createShip(tickRef.current, nextWave);

          waveRef.current = nextWave;
          waveShipTotalRef.current = nextWaveShipTotal;
          waveShipsSpawnedRef.current = 1;
          shipsRef.current = [firstShip];
          checkpointWaveRef.current = nextWave;
          checkpointFortHealthRef.current = fortHealthRef.current;
          isWaveTransitioningRef.current = false;

          setWave(nextWave);
          setWaveShipTotal(nextWaveShipTotal);
          setWaveShipsSpawned(1);
          setShips([firstShip]);
          setCheckpointWave(nextWave);
          setCheckpointFortHealth(fortHealthRef.current);
          setWaveBanner(null);
          appendLog(`Wave ${nextWave} begins. ${nextWaveShipTotal} hostile ships incoming.`, "warning");
        }, 2800);

        fortHealthRef.current = nextFortHealth;
        shipsRef.current = workingShips;
        setFortHealth(nextFortHealth);
        setShips(workingShips);
        return;
      }

      const radar: PlayerApi["radar"] = {
        getShips: () =>
          workingShips.map(({ id, type, distance, hp, maxHp }) => ({
            id,
            type,
            distance: Math.round(distance),
            hp,
            maxHp,
          })),
      };

      const command: PlayerApi["command"] = {
        log: (message: string) => {
          appendLog(String(message), "info");
        },
      };

      const fireWeapon = (
        shipId: string,
        weapon: WeaponType,
        requestedSlotId?: string,
        canFireMultipleRentaka = false,
      ) => {
        const requestedSlot = requestedSlotId
          ? cannonSlotsRef.current.find((slot) => slot.id === requestedSlotId)
          : undefined;

        if (weapon === "meriam" && requestedSlotId) {
          const meriamShotsThisTick =
            requestedSlot?.meriamTick === tickRef.current ? requestedSlot.meriamShotsThisTick : 0;

          if (meriamShotsThisTick >= MERIAM_SHOTS_PER_CANNON_PER_TICK) {
            appendLog(`${requestedSlot?.label ?? requestedSlotId} already fired Meriam this tick.`, "warning");
            return;
          }
        }

        if (weapon === "meriam" && meriamCooldownRef.current > 0) {
          appendLog(`Meriam is cooling down for ${meriamCooldownRef.current} more tick(s).`, "warning");
          return;
        }

        const target = workingShips.find((ship) => ship.id === shipId && ship.hp > 0);
        const weaponName = weapon === "meriam" ? "Meriam" : "Rentaka";

        if (!target) {
          appendLog(`${weaponName} could not find target "${shipId}".`, "warning");
          return;
        }

        if (weapon === "rentaka" && requestedSlotId) {
          const rentakaShotsThisTick =
            requestedSlot?.rentakaTick === tickRef.current ? requestedSlot.rentakaShotsThisTick : 0;

          if (!canFireMultipleRentaka && rentakaShotsThisTick >= 1) {
            appendLog(
              `${requestedSlot?.label ?? requestedSlotId} needs a for loop to fire Rentaka more than once.`,
              "warning",
            );
            return;
          }

          if (rentakaShotsThisTick >= RENTAKA_BULLETS_PER_CANNON_PER_TICK) {
            appendLog(`${requestedSlot?.label ?? requestedSlotId} already fired 3 Rentaka bullets this tick.`, "warning");
            return;
          }
        }

        const slotId = acquireCannonSlot(weapon, requestedSlotId);

        if (!slotId) {
          const busyMessage = requestedSlotId
            ? `${requestedSlotId.replace("-", " ")} is busy. ${weaponName} order ignored.`
            : `All 3 cannon slots are busy. ${weaponName} order ignored.`;
          appendLog(busyMessage, "warning");
          return;
        }

        const impactDelay = queueProjectileEffect(target, weapon, slotId);

        if (weapon === "meriam") {
          meriamCooldownRef.current = MERIAM_COOLDOWN_TICKS;
          meriamCooldownSlotIdRef.current = slotId;
          setMeriamCooldown(MERIAM_COOLDOWN_TICKS);
          setMeriamCooldownSlotId(slotId);
        }

        registerEffectTimeout(() => {
          applyProjectileDamage(target.id, weapon === "meriam" ? 50 : 10, weapon, slotId);
        }, impactDelay);
      };

      const createArtillery = (
        requestedSlotId?: string,
        canFireMultipleRentaka = false,
      ): PlayerApi["artillery"] => ({
        fireRentaka: (shipId: string) => {
          fireWeapon(shipId, "rentaka", requestedSlotId, canFireMultipleRentaka);
        },
        fireMeriam: (shipId: string) => {
          fireWeapon(shipId, "meriam", requestedSlotId);
        },
      });

      const api: PlayerApi = {
        radar,
        artillery: createArtillery(),
        command,
      };

      try {
        const userProgram = new Function(
          `"use strict";
          ${codeRef.current}
          return {
            onTick: typeof onTick === "function" ? onTick : undefined,
            cannon1: typeof cannon1 === "function" ? cannon1 : undefined,
            cannon2: typeof cannon2 === "function" ? cannon2 : undefined,
            cannon3: typeof cannon3 === "function" ? cannon3 : undefined,
          };`,
        );
        const compiledProgram = userProgram() as CompiledPlayerProgram;
        const hasCannonFunctions = cannonSlotsRef.current.some(
          (slot) => typeof compiledProgram[slot.functionName] === "function",
        );
        const rentakaLoopPermissionByFunctionName = getRentakaLoopPermissionByFunctionName(codeRef.current);

        if (hasCannonFunctions) {
          cannonSlotsRef.current.forEach((slot) => {
            const cannonFunction = compiledProgram[slot.functionName];
            const latestSlot = cannonSlotsRef.current.find((currentSlot) => currentSlot.id === slot.id);

            if (typeof cannonFunction !== "function" || latestSlot?.status !== "ready") {
              return;
            }

            cannonFunction(
              radar,
              createArtillery(slot.id, rentakaLoopPermissionByFunctionName[slot.functionName]),
              command,
            );
          });
        } else if (typeof compiledProgram.onTick === "function") {
          compiledProgram.onTick(api.radar, api.artillery, api.command);
        } else {
          throw new Error("Define onTick(...) or cannon1/cannon2/cannon3 functions.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown JavaScript error";
        appendLog(`Code error: ${message}`, "error");
      }

      if (
        !isWaveTransitioningRef.current &&
        waveShipsSpawnedRef.current < waveShipTotalRef.current &&
        (Math.random() < 0.42 || workingShips.length === 0)
      ) {
        const spawnedShip = createShip(nextTick, waveRef.current);
        workingShips = [...workingShips, spawnedShip];
        waveShipsSpawnedRef.current += 1;
        setWaveShipsSpawned(waveShipsSpawnedRef.current);
        appendLog(`${spawnedShip.type} sighted at ${STRAIT_LENGTH}m.`, "warning");
      }

      if (meriamCooldownRef.current > 0) {
        const nextCooldown = meriamCooldownRef.current - 1;
        meriamCooldownRef.current = nextCooldown;
        setMeriamCooldown(nextCooldown);

        if (nextCooldown <= 0) {
          meriamCooldownSlotIdRef.current = null;
          setMeriamCooldownSlotId(null);
        }
      }

      fortHealthRef.current = nextFortHealth;
      shipsRef.current = workingShips;
      setFortHealth(nextFortHealth);
      setShips(workingShips);
    };

    const intervalId = window.setInterval(runGameTick, 1000);

    return () => {
      window.clearInterval(intervalId);
      clearEffectTimeouts();
    };
  }, [
    appendLog,
    acquireCannonSlot,
    applyProjectileDamage,
    clearEffectTimeouts,
    gameStatus,
    queueExplosionEffect,
    queueProjectileEffect,
    registerEffectTimeout,
  ]);

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-950 text-slate-100 xl:grid xl:h-full xl:min-h-0 xl:grid-cols-[clamp(340px,38vw,560px)_minmax(0,1fr)] xl:grid-rows-1 xl:overflow-hidden">
      <style>{`
        @keyframes wave-pop {
          0% {
            opacity: 0;
            transform: scale(0.82) translateY(14px);
          }
          65% {
            opacity: 1;
            transform: scale(1.04) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      <WarRoomPanel
        code={code}
        visualProgram={visualProgram}
        onVisualProgramChange={handleVisualProgramChange}
        isWarRoomOpen={isWarRoomOpen}
        handleToggleWarRoom={handleToggleWarRoom}
        isXlViewport={isXlViewport}
      />
      <RadarPanel
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onResetGame={handleResetGame}
        fortHealth={fortHealth}
        score={score}
        wave={wave}
        waveShipTotal={waveShipTotal}
        waveShipsSpawned={waveShipsSpawned}
        tick={tick}
        cannonSlots={cannonSlots}
        meriamCooldown={meriamCooldown}
        meriamCooldownSlotId={meriamCooldownSlotId}
        logs={logs}
        ships={ships}
        projectiles={projectiles}
        explosions={explosions}
        radarWidth={radarWidth}
        waveBanner={waveBanner}
        gameStatus={gameStatus}
        checkpointWave={checkpointWave}
        radarAreaRef={radarAreaRef}
        handleRetryCheckpoint={handleRetryCheckpoint}
      />
    </main>
  );
}

