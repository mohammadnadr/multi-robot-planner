import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
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
export function assignGreedy(robots: Robot[], tasks: Task[]): Assignment {
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
        const c = estimateTaskCost(pos[r], rem[ti], load[r]);
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

export function runGreedy(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
): AlgorithmResult {
  if (!robots.length || !tasks.length) {
    return {
      id: 'greedy',
      name: 'Greedy Earliest-Finish',
      description:
        'Assigns each next task to the robot with the lowest estimated finish time, then resolves collisions with waits.',
      ...emptyResult(robots),
    };
  }

  const best = findBestRobotCount(
    map,
    robots,
    tasks,
    assignGreedy,
    costConfig,
  );
  return {
    id: 'greedy',
    name: 'Greedy Earliest-Finish',
    description:
      'Assigns each next task to the robot with the lowest estimated finish time, then resolves collisions with waits.',
    ...(best ?? emptyResult(robots)),
  };
}
