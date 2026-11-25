import type { AlgorithmId } from '../types';

export type RunProgressPhase =
  | 'preparing'
  | 'running'
  | 'finalizing'
  | 'done';

export type RunProgress = {
  phase: RunProgressPhase;
  currentAlgorithm: AlgorithmId | null;
  algorithmIndex: number;
  completedAlgorithms: AlgorithmId[];
  detail: string;
  /** 0–1 progress within the current algorithm step */
  subProgress: number;
  /** 0–1 overall across all four algorithms */
  overallProgress: number;
};

export type ProgressReporter = {
  onProgress: (p: RunProgress) => void;
};

export const ALGORITHM_STEPS: Record<
  AlgorithmId,
  { title: string; short: string }
> = {
  greedy: {
    title: 'Greedy Earliest-Finish',
    short: 'Greedy',
  },
  prioritized: {
    title: 'Prioritized + Waits',
    short: 'Prioritized',
  },
  aco: {
    title: 'Ant Colony (ACO)',
    short: 'ACO',
  },
  genetic: {
    title: 'Genetic Algorithm',
    short: 'Genetic',
  },
};

const ALGORITHM_COUNT = 4;

export function overallFromCompleted(
  completedCount: number,
  subProgress: number,
): number {
  return Math.min(1, (completedCount + subProgress) / ALGORITHM_COUNT);
}

export function initialRunProgress(): RunProgress {
  return {
    phase: 'preparing',
    currentAlgorithm: null,
    algorithmIndex: 0,
    completedAlgorithms: [],
    detail: 'Starting…',
    subProgress: 0,
    overallProgress: 0,
  };
}

/** Yield so React can paint between planning steps. */
export function yieldToUI(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
}

export async function reportAndYield(
  reporter: ProgressReporter | undefined,
  progress: RunProgress,
): Promise<void> {
  reporter?.onProgress(progress);
  if (reporter) {
    await yieldToUI();
  }
}

/** Passed into each algorithm runner for nested progress updates. */
export type AlgorithmRunContext = {
  reporter?: ProgressReporter;
  algorithmId: AlgorithmId;
  algorithmIndex: number;
  completedAlgorithms: AlgorithmId[];
};

function baseProgress(
  ctx: AlgorithmRunContext,
  detail: string,
  subProgress: number,
): RunProgress {
  return {
    phase: 'running',
    currentAlgorithm: ctx.algorithmId,
    algorithmIndex: ctx.algorithmIndex,
    completedAlgorithms: [...ctx.completedAlgorithms],
    detail,
    subProgress: Math.min(1, Math.max(0, subProgress)),
    overallProgress: overallFromCompleted(
      ctx.completedAlgorithms.length,
      subProgress,
    ),
  };
}

export async function reportRobotSweep(
  ctx: AlgorithmRunContext | undefined,
  k: number,
  total: number,
): Promise<void> {
  if (!ctx?.reporter) return;
  const subProgress = total > 0 ? k / total : 1;
  const label = ALGORITHM_STEPS[ctx.algorithmId].short;
  await reportAndYield(
    ctx.reporter,
    baseProgress(
      ctx,
      `${label} · ${k}/${total} robot${total === 1 ? '' : 's'} · paths · waits · cost`,
      subProgress,
    ),
  );
}

export async function reportAcoIteration(
  ctx: AlgorithmRunContext | undefined,
  k: number,
  kMax: number,
  iter: number,
  iterMax: number,
): Promise<void> {
  if (!ctx?.reporter) return;
  const sweep = kMax > 0 ? (k - 1) / kMax : 0;
  const inner = iterMax > 0 ? iter / iterMax : 1;
  const subProgress = kMax > 0 ? sweep + inner / kMax : inner;
  await reportAndYield(
    ctx.reporter,
    baseProgress(
      ctx,
      `ACO · iteration ${iter}/${iterMax} · ${k} robot${k === 1 ? '' : 's'}`,
      subProgress,
    ),
  );
}

export async function reportGeneticGeneration(
  ctx: AlgorithmRunContext | undefined,
  k: number,
  kMax: number,
  gen: number,
  genMax: number,
): Promise<void> {
  if (!ctx?.reporter) return;
  const sweep = kMax > 0 ? (k - 1) / kMax : 0;
  const inner = genMax > 0 ? gen / genMax : 1;
  const subProgress = kMax > 0 ? sweep + inner / kMax : inner;
  await reportAndYield(
    ctx.reporter,
    baseProgress(
      ctx,
      `Genetic · generation ${gen}/${genMax} · ${k} robot${k === 1 ? '' : 's'}`,
      subProgress,
    ),
  );
}