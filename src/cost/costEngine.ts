import type { Assignment, PlanResult, TimedPaths } from '../types';
import { DEFAULT_COST_CONFIG } from './defaultCosts';
import { mergeEnergy, simulateRobotEnergy } from './energyEngine';
import type { CostBreakdown, CostConfig, UsdByCategory } from './types';
import { emptyEnergy, emptyUsd } from './types';

export type ScoreInput = {
  paths: TimedPaths;
  assignment: Assignment;
  makespan: number;
  robotsUsed: number;
  robotIds: number[];
};

/** Build full cost breakdown from timed paths + assignment (ops fees). */
export function computeCostBreakdown(
  input: ScoreInput,
  cfg: CostConfig = DEFAULT_COST_CONFIG,
): CostBreakdown {
  const perRobot = input.robotIds.map((robotId, index) => {
    const path = input.paths[index] ?? [];
    return simulateRobotEnergy(path, robotId, cfg);
  });

  const energyByCategory = mergeEnergy(
    perRobot.map((r) => r.energyByCategory),
  );
  const totalEnergy = perRobot.reduce((s, r) => s + r.totalEnergy, 0);
  const motionUsd = totalEnergy * cfg.energyPriceUsd;

  const taskCount = input.assignment.reduce(
    (s, tasks) => s + (tasks?.length ?? 0),
    0,
  );
  const pickUsd = taskCount * cfg.pickFeeUsd;
  const deliverUsd = taskCount * cfg.deliverFeeUsd;
  const fleetUsd = input.robotsUsed * cfg.fleetFixedUsd;
  const timeValueUsd = input.makespan * cfg.timeValuePerMakespanUsd;
  const opsUsd = pickUsd + deliverUsd + fleetUsd + timeValueUsd;

  const usdByCategory: UsdByCategory = {
    cruise: energyByCategory.cruise * cfg.energyPriceUsd,
    accel: energyByCategory.accel * cfg.energyPriceUsd,
    brake: energyByCategory.brake * cfg.energyPriceUsd,
    turn: energyByCategory.turn * cfg.energyPriceUsd,
    reverse: energyByCategory.reverse * cfg.energyPriceUsd,
    idle: energyByCategory.idle * cfg.energyPriceUsd,
    pick: pickUsd,
    deliver: deliverUsd,
    fleet: fleetUsd,
    timeValue: timeValueUsd,
  };

  return {
    totalEnergy,
    motionUsd,
    opsUsd,
    totalUsd: motionUsd + opsUsd,
    energyByCategory,
    usdByCategory,
    perRobot,
  };
}

export function emptyCosts(): CostBreakdown {
  return {
    totalEnergy: 0,
    motionUsd: 0,
    opsUsd: 0,
    totalUsd: 0,
    energyByCategory: emptyEnergy(),
    usdByCategory: emptyUsd(),
    perRobot: [],
  };
}

/** Re-score an existing plan result with a new cost config (no re-pathing). */
export function rescorePlanResult(
  result: PlanResult,
  cfg: CostConfig,
): PlanResult {
  const robotIds =
    result.perRobot.length > 0
      ? result.perRobot.map((r) => r.robotId)
      : Object.keys(result.paths).map(Number);

  const costs = computeCostBreakdown(
    {
      paths: result.paths,
      assignment: result.assignment,
      makespan: result.makespan,
      robotsUsed: result.robotsUsed,
      robotIds,
    },
    cfg,
  );

  return {
    ...result,
    costs,
    deliverySeconds: result.makespan * cfg.secondsPerStep,
  };
}
