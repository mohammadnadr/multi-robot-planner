import type { TimedPoint } from '../types';
import { pathToActions } from './pathToActions';
import type {
  CostConfig,
  EnergyByCategory,
  PathAction,
  RobotCostLine,
} from './types';
import { emptyEnergy } from './types';

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function addEnergy(
  bag: EnergyByCategory,
  key: keyof EnergyByCategory,
  amount: number,
) {
  bag[key] += amount;
}

/**
 * Simulate discrete speed state and accumulate energy from v/a inside each action.
 * Motion money is NOT applied here — only energy units.
 */
export function simulateRobotEnergy(
  path: TimedPoint[],
  robotId: number,
  cfg: CostConfig,
): RobotCostLine {
  const energyByCategory = emptyEnergy();
  const actions = pathToActions(path);
  let v = 0;

  for (const action of actions) {
    applyActionEnergy(action, cfg, () => v, (nv) => {
      v = nv;
    }, energyByCategory);
  }

  const totalEnergy = Object.values(energyByCategory).reduce((a, b) => a + b, 0);
  return {
    robotId,
    totalEnergy,
    motionUsd: totalEnergy * cfg.energyPriceUsd,
    energyByCategory,
  };
}

function applyActionEnergy(
  action: PathAction,
  cfg: CostConfig,
  getV: () => number,
  setV: (v: number) => void,
  bag: EnergyByCategory,
) {
  let v = getV();

  if (action.kind === 'wait') {
    if (v > 0) {
      const a = -Math.min(cfg.aMax, v);
      const v2 = clamp(v + a, 0, cfg.vmax);
      const brakeE = cfg.eBrake * Math.abs(a);
      addEnergy(bag, 'brake', brakeE);
      if (v2 > 0) addEnergy(bag, 'cruise', cfg.eCruise * v2);
      v = v2;
    }
    addEnergy(bag, 'idle', cfg.eIdle);
    setV(v);
    return;
  }

  // Turns / reverse: brake toward near-stop, pay maneuver energy, then move with accel
  if (
    action.kind === 'turnL' ||
    action.kind === 'turnR' ||
    action.kind === 'reverse'
  ) {
    while (v > 0) {
      const a = -Math.min(cfg.aMax, v);
      const v2 = clamp(v + a, 0, cfg.vmax);
      addEnergy(bag, 'brake', cfg.eBrake * Math.abs(a));
      v = v2;
      if (Math.abs(a) < 1e-9) break;
    }

    if (action.kind === 'reverse') {
      addEnergy(bag, 'reverse', cfg.eReverse);
    } else {
      addEnergy(bag, 'turn', cfg.eTurn);
    }

    // Re-enter motion after maneuver
    const startedFromRest = v === 0;
    const a = Math.min(cfg.aMax, cfg.vmax - v);
    const v2 = clamp(v + a, 0, cfg.vmax);
    const vAvg = (v + v2) / 2;
    if (startedFromRest && a > 0) addEnergy(bag, 'accel', cfg.eStartup);
    if (a > 0) addEnergy(bag, 'accel', cfg.eAccel * a * vAvg);
    addEnergy(bag, 'cruise', cfg.eCruise * Math.max(v2, 0.5));
    setV(v2);
    return;
  }

  // Straight: accelerate toward vmax or cruise
  const startedFromRest = v === 0;
  let a = 0;
  if (v < cfg.vmax) {
    a = Math.min(cfg.aMax, cfg.vmax - v);
  }
  const v2 = clamp(v + a, 0, cfg.vmax);
  const vAvg = (v + v2) / 2;

  if (a > 0) {
    if (startedFromRest) addEnergy(bag, 'accel', cfg.eStartup);
    addEnergy(bag, 'accel', cfg.eAccel * a * vAvg);
    addEnergy(bag, 'cruise', cfg.eCruise * v2);
  } else {
    addEnergy(bag, 'cruise', cfg.eCruise * v2);
  }

  setV(v2);
}

export function mergeEnergy(
  parts: EnergyByCategory[],
): EnergyByCategory {
  const out = emptyEnergy();
  for (const p of parts) {
    (Object.keys(out) as (keyof EnergyByCategory)[]).forEach((k) => {
      out[k] += p[k];
    });
  }
  return out;
}
