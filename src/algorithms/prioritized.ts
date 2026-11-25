import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import type { AlgorithmRunContext } from '../planning/runProgress';
import { emptyResult, findBestRobotCount } from '../planning/evaluatePlan';
import type {
  AlgorithmResult,
  Assignment,
  GridMap,
  Robot,
  Task,
} from '../types';

/**
 * Prioritized / round-robin assignment:
 * tasks distributed in order across robots by priority index.
 * Lower-index robots have higher priority in conflict resolution.
 */
export function assignRoundRobin(robots: Robot[], tasks: Task[]): Assignment {
  const n = robots.length;
  const assign: Assignment = Array.from({ length: n }, () => []);
  tasks.forEach((t, i) => {
    assign[i % n].push(t);
  });
  return assign;
}

/**
 * Priority-ordered sequential fill: higher-priority robots take tasks
 * until their estimated load catches up (more balanced than pure RR).
 */
export function assignPriorityFill(robots: Robot[], tasks: Task[]): Assignment {
  const n = robots.length;
  const assign: Assignment = Array.from({ length: n }, () => []);
  const counts = new Array(n).fill(0);

  for (const task of tasks) {
    // Give next task to the highest-priority robot among those with min load
    let minLoad = Math.min(...counts);
    let chosen = -1;
    for (let r = 0; r < n; r++) {
      if (counts[r] === minLoad) {
        chosen = r;
        break; // prefer higher priority (lower index)
      }
    }
    assign[chosen].push(task);
    counts[chosen]++;
  }

  return assign;
}

export async function runPrioritized(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  runCtx?: AlgorithmRunContext,
): Promise<AlgorithmResult> {
  if (!robots.length || !tasks.length) {
    return {
      id: 'prioritized',
      name: 'Prioritized + Waits',
      description:
        'Assigns tasks with priority-aware load balancing; robot 0 has highest priority and lower-priority robots wait on conflicts.',
      ...emptyResult(robots),
    };
  }

  const best = await findBestRobotCount(
    map,
    robots,
    tasks,
    assignPriorityFill,
    costConfig,
    runCtx,
  );
  return {
    id: 'prioritized',
    name: 'Prioritized + Waits',
    description:
      'Assigns tasks with priority-aware load balancing; robot 0 has highest priority and lower-priority robots wait on conflicts.',
    ...(best ?? emptyResult(robots)),
  };
}
