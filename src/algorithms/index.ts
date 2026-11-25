import { MAX_ROBOTS } from '../constants';
import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import { buildTasks } from '../map/tasks';
import type {
  AlgorithmId,
  AlgorithmResult,
  AllResults,
  Demand,
  GridMap,
} from '../types';
import { runAco } from './aco';
import { runGenetic } from './genetic';
import { runGreedy } from './greedy';
import { runPrioritized } from './prioritized';

export { runAco } from './aco';
export { runGenetic } from './genetic';
export { runGreedy } from './greedy';
export { runPrioritized } from './prioritized';

export const ALGORITHM_ORDER: AlgorithmId[] = [
  'greedy',
  'prioritized',
  'aco',
  'genetic',
];

export function runAllAlgorithms(
  map: GridMap,
  demand: Demand,
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
): AllResults {
  const tasks = buildTasks(map, demand);
  const robots = map.robots.slice(0, MAX_ROBOTS);

  return {
    greedy: runGreedy(map, robots, tasks, costConfig),
    prioritized: runPrioritized(map, robots, tasks, costConfig),
    aco: runAco(map, robots, tasks, costConfig),
    genetic: runGenetic(map, robots, tasks, costConfig),
  };
}

export function bestMakespan(results: AllResults): number {
  return Math.min(
    ...ALGORITHM_ORDER.map((id) => results[id].makespan),
  );
}

export function getAlgorithmList(
  results: AllResults,
): AlgorithmResult[] {
  return ALGORITHM_ORDER.map((id) => results[id]);
}
