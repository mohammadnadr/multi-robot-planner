import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import { emptyCosts, computeCostBreakdown } from '../cost/costEngine';
import type { CostConfig } from '../cost/types';
import { getObstacleSet, manhattan } from '../map/obstacles';
import type {
  Assignment,
  GridMap,
  PlanResult,
  Point,
  Robot,
  RobotMetrics,
  Task,
} from '../types';
import type { AlgorithmRunContext } from './runProgress';
import { reportRobotSweep } from './runProgress';
import { addWaits } from './conflictResolve';
import { buildRobotSequence } from './robotSequence';

/**
 * Build geometric sequences from an assignment, resolve conflicts with waits,
 * score energy/$ with cost config, and compute metrics.
 */
export function evaluateAssignment(
  map: GridMap,
  robots: Robot[],
  assignment: Assignment,
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
): PlanResult | null {
  const obstacles = getObstacleSet(map);
  const geometricPaths: Point[][] = [];
  const usedAssignment: Assignment = [];

  for (let i = 0; i < robots.length; i++) {
    const tasks = assignment[i] ?? [];
    usedAssignment.push(tasks);
    if (tasks.length === 0) {
      geometricPaths.push([{ x: robots[i].x, y: robots[i].y }]);
      continue;
    }
    const seq = buildRobotSequence(
      map,
      robots[i],
      tasks,
      obstacles,
    );
    if (!seq) return null;
    geometricPaths.push(seq);
  }

  let lastUsed = -1;
  for (let i = 0; i < robots.length; i++) {
    if ((assignment[i] ?? []).length > 0) lastUsed = i;
  }
  const activeCount = lastUsed + 1;
  const activePaths =
    activeCount > 0
      ? geometricPaths.slice(0, activeCount)
      : geometricPaths.slice(0, 1);
  const activeRobots =
    activeCount > 0 ? robots.slice(0, activeCount) : robots.slice(0, 1);
  const activeAssign =
    activeCount > 0
      ? usedAssignment.slice(0, activeCount)
      : usedAssignment.slice(0, 1);

  const resolved = addWaits(activePaths);

  let totalGeometricLength = 0;
  const perRobot: RobotMetrics[] = activeRobots.map((r, i) => {
    const geoLen = activePaths[i]?.length ?? 0;
    totalGeometricLength += geoLen;
    return {
      robotId: r.id,
      taskIds: (activeAssign[i] ?? []).map((t) => t.id),
      geometricLength: geoLen,
      waitSteps: resolved.perRobotWaits[i] ?? 0,
      accelPenalty: resolved.perRobotAccel[i] ?? 0,
      finishTime: resolved.perRobotFinish[i] ?? 0,
    };
  });

  const costs = computeCostBreakdown(
    {
      paths: resolved.paths,
      assignment: activeAssign,
      makespan: resolved.makespan,
      robotsUsed: activeRobots.length,
      robotIds: activeRobots.map((r) => r.id),
    },
    costConfig,
  );

  return {
    paths: resolved.paths,
    assignment: activeAssign,
    geometricPaths: activePaths,
    makespan: resolved.makespan,
    totalGeometricLength,
    robotsUsed: activeRobots.length,
    waitSteps: resolved.waitSteps,
    accelPenalty: resolved.accelPenalty,
    perRobot,
    costs,
    deliverySeconds: resolved.makespan * costConfig.secondsPerStep,
  };
}

/** Try robot counts 1..N and keep the best Makespan. */
export async function findBestRobotCount(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  assignFn: (robots: Robot[], tasks: Task[]) => Assignment,
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  runCtx?: AlgorithmRunContext,
): Promise<PlanResult | null> {
  let best: PlanResult | null = null;

  for (let k = 1; k <= robots.length; k++) {
    await reportRobotSweep(runCtx, k, robots.length);
    const sub = robots.slice(0, k);
    const assignment = assignFn(sub, tasks);
    const result = evaluateAssignment(map, sub, assignment, costConfig);
    if (!result) continue;
    if (!best || result.makespan < best.makespan) {
      best = result;
    }
  }

  return best;
}

export function estimateTaskCost(
  robotPos: Point,
  task: Task,
  loadSoFar: number,
): number {
  return (
    loadSoFar +
    manhattan(robotPos, task.pick) +
    manhattan(task.pick, task.deliv) +
    2
  );
}

export function emptyResult(robots: Robot[]): PlanResult {
  return {
    paths: {},
    assignment: robots.map(() => []),
    geometricPaths: robots.map((r) => [{ x: r.x, y: r.y }]),
    makespan: 0,
    totalGeometricLength: 0,
    robotsUsed: 0,
    waitSteps: 0,
    accelPenalty: 0,
    perRobot: [],
    costs: emptyCosts(),
    deliverySeconds: 0,
  };
}
