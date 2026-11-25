import { MAX_ROBOTS } from '../constants';
import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import { buildTasks } from '../map/tasks';
import {
  ALGORITHM_STEPS,
  initialRunProgress,
  overallFromCompleted,
  type ProgressReporter,
  reportAndYield,
} from '../planning/runProgress';
import type { AlgorithmRunContext } from '../planning/runProgress';
import type {
  AlgorithmId,
  AlgorithmResult,
  AllResults,
  Demand,
  GridMap,
  Robot,
  Task,
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

type AlgorithmRunner = (
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig,
  ctx: AlgorithmRunContext,
) => Promise<AlgorithmResult>;

const RUNNERS: Record<AlgorithmId, AlgorithmRunner> = {
  greedy: runGreedy,
  prioritized: runPrioritized,
  aco: runAco,
  genetic: runGenetic,
};

export async function runAllAlgorithmsAsync(
  map: GridMap,
  demand: Demand,
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  reporter?: ProgressReporter,
): Promise<AllResults> {
  await reportAndYield(reporter, {
    ...initialRunProgress(),
    detail: 'Building pick/delivery tasks…',
    subProgress: 0,
    overallProgress: 0,
  });

  const tasks = buildTasks(map, demand);
  const robots = map.robots.slice(0, MAX_ROBOTS);

  await reportAndYield(reporter, {
    ...initialRunProgress(),
    phase: 'running',
    detail: `${tasks.length} task${tasks.length === 1 ? '' : 's'} · ${robots.length} robot${robots.length === 1 ? '' : 's'}`,
    subProgress: 0,
    overallProgress: 0,
  });

  const results = {} as AllResults;
  const completed: AlgorithmId[] = [];

  for (let i = 0; i < ALGORITHM_ORDER.length; i++) {
    const id = ALGORITHM_ORDER[i];
    const title = ALGORITHM_STEPS[id].title;

    await reportAndYield(reporter, {
      phase: 'running',
      currentAlgorithm: id,
      algorithmIndex: i,
      completedAlgorithms: [...completed],
      detail: `Starting ${title}…`,
      subProgress: 0,
      overallProgress: overallFromCompleted(completed.length, 0),
    });

    const runCtx = {
      reporter,
      algorithmId: id,
      algorithmIndex: i,
      completedAlgorithms: [...completed],
    };

    results[id] = await RUNNERS[id](map, robots, tasks, costConfig, runCtx);
    completed.push(id);

    await reportAndYield(reporter, {
      phase: 'running',
      currentAlgorithm: id,
      algorithmIndex: i,
      completedAlgorithms: [...completed],
      detail: `${title} complete`,
      subProgress: 1,
      overallProgress: overallFromCompleted(completed.length, 0),
    });
  }

  await reportAndYield(reporter, {
    phase: 'finalizing',
    currentAlgorithm: null,
    algorithmIndex: ALGORITHM_ORDER.length,
    completedAlgorithms: [...completed],
    detail: 'Comparing results…',
    subProgress: 1,
    overallProgress: 1,
  });

  await reportAndYield(reporter, {
    phase: 'done',
    currentAlgorithm: null,
    algorithmIndex: ALGORITHM_ORDER.length,
    completedAlgorithms: [...completed],
    detail: 'Done',
    subProgress: 1,
    overallProgress: 1,
  });

  return results;
}

/** Runs all planners without progress UI (awaits same async pipeline). */
export async function runAllAlgorithms(
  map: GridMap,
  demand: Demand,
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
): Promise<AllResults> {
  return runAllAlgorithmsAsync(map, demand, costConfig);
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