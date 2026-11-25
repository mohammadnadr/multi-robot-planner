import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import { getObstacleSet } from '../map/obstacles';
import type { AlgorithmRunContext } from '../planning/runProgress';
import { reportAcoIteration } from '../planning/runProgress';
import {
  emptyResult,
  evaluateAssignment,
} from '../planning/evaluatePlan';
import { estimateTaskCost } from '../planning/pickCost';
import { buildShelfPool, type ShelfPool } from '../planning/shelfPool';
import { reserveBestShelf } from '../planning/resolvePicks';
import type {
  AlgorithmResult,
  Assignment,
  GridMap,
  PlanResult,
  Robot,
  Task,
} from '../types';

const ANTS = 12;
const ITERATIONS = 14;
const ALPHA = 1; // pheromone weight
const BETA = 2; // heuristic weight
const RHO = 0.35; // evaporation
const Q = 100;

type EdgeKey = string; // `${taskIndex}->${robotIndex}`

function edgeKey(ti: number, ri: number): EdgeKey {
  return `${ti}->${ri}`;
}

/**
 * Ant Colony Optimization over task→robot assignment.
 * Each ant builds a full assignment; pheromone reinforces low-Makespan solutions.
 */
export async function runAco(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  costConfig: CostConfig = DEFAULT_COST_CONFIG,
  runCtx?: AlgorithmRunContext,
): Promise<AlgorithmResult> {
  const meta = {
    id: 'aco' as const,
    name: 'Ant Colony (ACO)',
    description:
      'Pheromone search over task→robot assignments; ants reinforce allocations with better Makespan after wait insertion.',
  };

  if (!robots.length || !tasks.length) {
    return { ...meta, ...emptyResult(robots) };
  }

  let best: PlanResult | null = null;

  for (let k = 1; k <= robots.length; k++) {
    const sub = robots.slice(0, k);
    const candidate = await optimizeAco(
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

async function optimizeAco(
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
  const obstacles = getObstacleSet(map);
  const pheromone = new Map<EdgeKey, number>();

  for (let ti = 0; ti < nT; ti++) {
    for (let ri = 0; ri < nR; ri++) {
      pheromone.set(edgeKey(ti, ri), 1);
    }
  }

  let best: PlanResult | null = null;
  let bestAssign: Assignment | null = null;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    await reportAcoIteration(
      runCtx,
      kRobots,
      kMax,
      iter + 1,
      ITERATIONS,
    );
    const antResults: { assign: Assignment; result: PlanResult }[] = [];

    for (let a = 0; a < ANTS; a++) {
      const assign = buildAntAssignment(
        map,
        robots,
        tasks,
        pheromone,
        obstacles,
      );
      const result = evaluateAssignment(map, robots, assign, costConfig);
      if (!result) continue;
      antResults.push({ assign, result });
      if (!best || result.makespan < best.makespan) {
        best = result;
        bestAssign = assign;
      }
    }

    // Evaporate
    for (const [ek, val] of pheromone) {
      pheromone.set(ek, Math.max(0.05, val * (1 - RHO)));
    }

    // Deposit
    for (const { assign, result } of antResults) {
      const deposit = Q / Math.max(1, result.makespan);
      assign.forEach((robotTasks, ri) => {
        robotTasks.forEach((task) => {
          const ti = tasks.findIndex((t) => t.id === task.id);
          if (ti < 0) return;
          const ek = edgeKey(ti, ri);
          pheromone.set(ek, (pheromone.get(ek) ?? 1) + deposit);
        });
      });
    }

    // Elite deposit on global best
    if (bestAssign && best) {
      const elite = (Q * 2) / Math.max(1, best.makespan);
      bestAssign.forEach((robotTasks, ri) => {
        robotTasks.forEach((task) => {
          const ti = tasks.findIndex((t) => t.id === task.id);
          if (ti < 0) return;
          const ek = edgeKey(ti, ri);
          pheromone.set(ek, (pheromone.get(ek) ?? 1) + elite);
        });
      });
    }
  }

  return best;
}

function buildAntAssignment(
  map: GridMap,
  robots: Robot[],
  tasks: Task[],
  pheromone: Map<EdgeKey, number>,
  obstacles: Set<string>,
): Assignment {
  const nR = robots.length;
  const assign: Assignment = Array.from({ length: nR }, () => []);
  const load = new Array(nR).fill(0);
  const pos = robots.map((r) => ({ x: r.x, y: r.y }));
  const pool: ShelfPool = buildShelfPool(map);

  // Random task order with slight pheromone-biased shuffle
  const order = [...tasks.keys()];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    ;[order[i], order[j]] = [order[j], order[i]];
  }

  for (const ti of order) {
    const task = tasks[ti];
    const weights: number[] = [];
    let sum = 0;

    for (let ri = 0; ri < nR; ri++) {
      const tau = pheromone.get(edgeKey(ti, ri)) ?? 1;
      const eta =
        1 /
        Math.max(
          1,
          estimateTaskCost(map, pos[ri], task, load[ri], obstacles, pool),
        );
      const w = Math.pow(tau, ALPHA) * Math.pow(eta, BETA);
      weights.push(w);
      sum += w;
    }

    let pick = Math.random() * sum;
    let chosen = 0;
    for (let ri = 0; ri < nR; ri++) {
      pick -= weights[ri];
      if (pick <= 0) {
        chosen = ri;
        break;
      }
    }

    assign[chosen].push(task);
    load[chosen] = estimateTaskCost(
      map,
      pos[chosen],
      task,
      load[chosen],
      obstacles,
      pool,
    );
    reserveBestShelf(map, pos[chosen], task.type, pool, obstacles);
    pos[chosen] = { ...task.deliv };
  }

  return assign;
}
