import type { AllResults, AlgorithmId, PlanResult } from '../types';
import { rescorePlanResult } from './costEngine';
import type { CostConfig } from './types';

const IDS: AlgorithmId[] = ['greedy', 'prioritized', 'aco', 'genetic'];

export function rescoreAllResults(
  results: AllResults,
  cfg: CostConfig,
): AllResults {
  const next = {} as AllResults;
  for (const id of IDS) {
    const r = results[id];
    next[id] = {
      ...rescorePlanResult(r, cfg),
      id: r.id,
      name: r.name,
      description: r.description,
    };
  }
  return next;
}

export function bestTotalUsd(results: AllResults): number {
  return Math.min(...IDS.map((id) => results[id].costs.totalUsd));
}

export function bestDeliverySeconds(results: AllResults): number {
  return Math.min(...IDS.map((id) => results[id].deliverySeconds));
}

export function attachCosts(
  result: PlanResult,
  cfg: CostConfig,
): PlanResult {
  return rescorePlanResult(result, cfg);
}
