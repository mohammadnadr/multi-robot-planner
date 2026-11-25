import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import type { AlgorithmRunContext } from '../planning/runProgress';
import { reportGeneticGeneration } from '../planning/runProgress';
import { emptyResult, evaluateAssignment } from '../planning/evaluatePlan';
import type {
  AlgorithmResult,
  Assignment,
  GridMap,
  PlanResult,
  Robot,
  Task,
} from '../types';

const POP_SIZE = 20;
const GENERATIONS = 18;
const MUTATION_RATE = 0.25;
const TOURNAMENT = 3;
const ELITE = 2;

/** Chromosome: permutation of task indices + robot cut boundaries. */
type Chromosome = {
  order: number[]; // permutation of task indices
  /** cut[i] = number of tasks for robot i; sum = nTasks */
  cuts: number[];
};

/**
 * Genetic Algorithm: evolves task order + how tasks are split across robots.
 * Fitness = Makespan after geometric planning + wait insertion.
 */
export async function runGenetic(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  runCtx?: AlgorithmRunContext,
): Promise<AlgorithmResult> {
  const meta = {
    id: 'genetic' as const,
    name: 'Genetic Algorithm',
    description:
      'Evolves task permutations and robot load splits; fitness is Makespan after path building and wait insertion.',
  };

  if (!robots.length || !tasks.length) {
    return { ...meta, ...emptyResult(robots) };
  }

  let best: PlanResult | null = null;

  for (let k = 1; k <= robots.length; k++) {
    const sub = robots.slice(0, k);
    const candidate = await evolve(
      map,
      sub,
      tasks,
      costConfig,
      runCtx,
      k,
      robots.length,
    );
    if (!candidate) continue;
    if (!best || candidate.makespan < best.makespan) best = candidate;
  }

  return { ...meta, ...(best ?? emptyResult(robots)) };
}

async function evolve(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig,
  runCtx: AlgorithmRunContext | undefined,
  kRobots: number,
  kMax: number,
): Promise<PlanResult | null> {
  const nR = robots.length;
  const nT = tasks.length;

  let population: Chromosome[] = Array.from({ length: POP_SIZE }, () =>
    randomChromosome(nT, nR),
  );

  let best: PlanResult | null = null;

  for (let gen = 0; gen < GENERATIONS; gen++) {
    await reportGeneticGeneration(
      runCtx,
      kRobots,
      kMax,
      gen + 1,
      GENERATIONS,
    );
    const scored = population.map((chrom) => {
      const assign = decode(chrom, tasks, nR);
      const result = evaluateAssignment(map, robots, assign, costConfig);
      return { chrom, result, fitness: result ? result.makespan : 1e9 };
    });

    scored.sort((a, b) => a.fitness - b.fitness);

    for (const s of scored) {
      if (s.result && (!best || s.result.makespan < best.makespan)) {
        best = s.result;
      }
    }

    const next: Chromosome[] = scored
      .slice(0, ELITE)
      .map((s) => cloneChrom(s.chrom));

    while (next.length < POP_SIZE) {
      const p1 = tournament(scored);
      const p2 = tournament(scored);
      let child = crossover(p1, p2, nR);
      if (Math.random() < MUTATION_RATE) child = mutate(child, nR);
      next.push(child);
    }

    population = next;
  }

  return best;
}

function randomChromosome(nT: number, nR: number): Chromosome {
  const order = Array.from({ length: nT }, (_, i) => i);
  shuffle(order);
  return { order, cuts: randomCuts(nT, nR) };
}

function randomCuts(nT: number, nR: number): number[] {
  if (nR === 1) return [nT];
  const cuts = new Array(nR).fill(0);
  for (let i = 0; i < nT; i++) {
    cuts[Math.floor(Math.random() * nR)]++;
  }
  // Ensure we don't leave all on one robot accidentally too often — ok for diversity
  return cuts;
}

function decode(chrom: Chromosome, tasks: Task[], nR: number): Assignment {
  const assign: Assignment = Array.from({ length: nR }, () => []);
  let idx = 0;
  for (let r = 0; r < nR; r++) {
    const count = chrom.cuts[r] ?? 0;
    for (let c = 0; c < count && idx < chrom.order.length; c++) {
      assign[r].push(tasks[chrom.order[idx++]]);
    }
  }
  // Leftovers to last robot
  while (idx < chrom.order.length) {
    assign[nR - 1].push(tasks[chrom.order[idx++]]);
  }
  return assign;
}

function crossover(a: Chromosome, b: Chromosome, nR: number): Chromosome {
  // Order crossover (OX)
  const n = a.order.length;
  const start = Math.floor(Math.random() * n);
  const end = start + Math.floor(Math.random() * (n - start));
  const childOrder = new Array(n).fill(-1);
  for (let i = start; i <= end; i++) childOrder[i] = a.order[i];
  const used = new Set(childOrder.filter((x) => x >= 0));
  let bi = 0;
  for (let i = 0; i < n; i++) {
    if (childOrder[i] >= 0) continue;
    while (used.has(b.order[bi])) bi++;
    childOrder[i] = b.order[bi++];
  }

  const cuts =
    Math.random() < 0.5 ? [...a.cuts] : [...b.cuts];
  // Normalize cuts to sum n
  const sum = cuts.reduce((s, c) => s + c, 0);
  if (sum !== n) {
    return { order: childOrder, cuts: randomCuts(n, nR) };
  }
  return { order: childOrder, cuts };
}

function mutate(chrom: Chromosome, nR: number): Chromosome {
  const order = [...chrom.order];
  if (order.length >= 2) {
    const i = Math.floor(Math.random() * order.length);
    const j = Math.floor(Math.random() * order.length);
    ;[order[i], order[j]] = [order[j], order[i]];
  }
  let cuts = [...chrom.cuts];
  if (Math.random() < 0.5 && nR > 1) {
    cuts = randomCuts(order.length, nR);
  } else if (nR > 1) {
    const from = Math.floor(Math.random() * nR);
    const to = Math.floor(Math.random() * nR);
    if (cuts[from] > 0 && from !== to) {
      cuts[from]--;
      cuts[to]++;
    }
  }
  return { order, cuts };
}

function tournament(
  scored: { chrom: Chromosome; fitness: number }[],
): Chromosome {
  let best = scored[Math.floor(Math.random() * scored.length)];
  for (let i = 1; i < TOURNAMENT; i++) {
    const c = scored[Math.floor(Math.random() * scored.length)];
    if (c.fitness < best.fitness) best = c;
  }
  return cloneChrom(best.chrom);
}

function cloneChrom(c: Chromosome): Chromosome {
  return { order: [...c.order], cuts: [...c.cuts] };
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ;[arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
