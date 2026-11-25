import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import type { AlgorithmRunContext } from '../planning/runProgress';
import { getObstacleSet } from '../map/obstacles';
import {
  emptyResult,
  estimateTaskCost,
  findBestRobotCount,
} from '../planning/evaluatePlan';
import type {
  AlgorithmResult,
  Assignment,
  GridMap,
  Robot,
  Task,
} from '../types';

/**
 * Greedy earliest-finish assignment:
 * repeatedly assign the (robot, task) pair with lowest estimated finish cost.
 */
export function assignGreedy(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  obstacles: Set<string>,
): Assignment {
  const n = robots.length;
  const assign: Assignment = Array.from({ length: n }, () => []);
  const rem = [...tasks];
  const load = new Array(n).fill(0);
  const pos = robots.map((r) => ({ x: r.x, y: r.y }));

  while (rem.length) {
    let bestR = 0;
    let bestT = 0;
    let bestC = Infinity;

    for (let ti = 0; ti < rem.length; ti++) {
      for (let r = 0; r < n; r++) {
        const c = estimateTaskCost(map, pos[r], rem[ti], load[r], obstacles);
        if (c < bestC) {
          bestC = c;
          bestR = r;
          bestT = ti;
        }
      }
    }

    const task = rem.splice(bestT, 1)[0];
    assign[bestR].push(task);
    load[bestR] = bestC;
    // Approximate next position at delivery
    pos[bestR] = { ...task.deliv };
  }

  return assign;
}

export async function runGreedy(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  runCtx?: AlgorithmRunContext,
): Promise<AlgorithmResult> {
  if (!robots.length || !tasks.length) {
    return {
      id: 'greedy',
      name: 'Greedy Earliest-Finish',
      description:
        'Assigns each next task to the robot with the lowest estimated finish time, then resolves collisions with waits.',
      ...emptyResult(robots),
    };
  }

  const obstacles = getObstacleSet(map);
  const best = await findBestRobotCount(
    map,
    robots,
    tasks,
    (r, t) => assignGreedy(map, r, t, obstacles),
    costConfig,
    runCtx,
  );
  return {
    id: 'greedy',
    name: 'Greedy Earliest-Finish',
    description:
      'Assigns each next task to the robot with the lowest estimated finish time, then resolves collisions with waits.',
    ...(best ?? emptyResult(robots)),
  };
}
