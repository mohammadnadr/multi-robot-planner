import { ALGORITHM_ORDER, bestMakespan } from '../algorithms';
import {
  bestDeliverySeconds,
  bestTotalUsd,
} from '../cost/aggregateCosts';
import { formatCostAtTime } from '../cost/formatDuration';
import { HELP } from '../help/glossary';
import type { AllResults, AlgorithmId, GridMap, TimedPaths } from '../types';
import { CalculationBreakdown } from './CalculationBreakdown';
import { GridCanvas } from './GridCanvas';
import { LabelWithInfo } from './LabelWithInfo';
import { ResultsTable } from './ResultsTable';

function lastFrame(paths: TimedPaths): number {
  let max = 0;
  for (const p of Object.values(paths)) {
    if (p?.length) max = Math.max(max, p.length - 1);
  }
  return max;
}

const ALGO_HELP: Record<AlgorithmId, string> = {
  greedy: HELP.greedy,
  prioritized: HELP.prioritized,
  aco: HELP.aco,
  genetic: HELP.genetic,
};

type Props = {
  map: GridMap;
  results: AllResults;
  onAnimate: (id: AlgorithmId) => void;
  onBack: () => void;
};

export function ComparisonPanel({
  map,
  results,
  onAnimate,
  onBack,
}: Props) {
  const bestMs = bestMakespan(results);
  const bestUsd = bestTotalUsd(results);
  const bestDelivery = bestDeliverySeconds(results);

  return (
    <div className="comparison">
      <div className="comparison-header">
        <h1>
          <LabelWithInfo tip={HELP.results} placement="down">
            Results — time & cost
          </LabelWithInfo>
        </h1>
        <div className="comparison-actions">
          <button type="button" className="btn btn-secondary" onClick={onBack}>
            Back to Editor
          </button>
        </div>
      </div>

      <p className="compare-legend">
        Compare{' '}
        <LabelWithInfo tip={HELP.costAtTime} placement="down">
          <span className="best">$ and delivery time</span>
        </LabelWithInfo>
        , e.g. $200 in 50s vs $150 in 1m. Highlights:{' '}
        <LabelWithInfo tip={HELP.bestMakespan} placement="down">
          <span className="best">best Makespan</span>
        </LabelWithInfo>
        ,{' '}
        <LabelWithInfo tip={HELP.deliverySeconds} placement="down">
          <span className="best">fastest delivery</span>
        </LabelWithInfo>
        ,{' '}
        <LabelWithInfo tip={HELP.bestUsd} placement="down">
          <span className="best">best Total $</span>
        </LabelWithInfo>
        .
      </p>

      <ResultsTable
        results={results}
        bestMs={bestMs}
        bestUsd={bestUsd}
        bestDelivery={bestDelivery}
      />

      <div className="algo-grid">
        {ALGORITHM_ORDER.map((id) => {
          const r = results[id];
          const isBestMs = r.makespan === bestMs;
          const isBestUsd = r.costs.totalUsd === bestUsd;
          const isFastest = r.deliverySeconds === bestDelivery;
          return (
            <article
              key={id}
              className={`algo-card ${
                isBestMs || isBestUsd || isFastest ? 'algo-best' : ''
              }`}
            >
              <header>
                <h3>
                  <LabelWithInfo tip={ALGO_HELP[id]} placement="down">
                    {r.name}
                  </LabelWithInfo>
                </h3>
                <div className="badge-row">
                  {isBestMs && (
                    <span className="badge">
                      <LabelWithInfo tip={HELP.bestMakespan} placement="down">
                        Best Makespan
                      </LabelWithInfo>
                    </span>
                  )}
                  {isFastest && (
                    <span className="badge badge-fast">
                      <LabelWithInfo
                        tip={HELP.deliverySeconds}
                        placement="down"
                      >
                        Fastest delivery
                      </LabelWithInfo>
                    </span>
                  )}
                  {isBestUsd && (
                    <span className="badge badge-usd">
                      <LabelWithInfo tip={HELP.bestUsd} placement="down">
                        Best $
                      </LabelWithInfo>
                    </span>
                  )}
                </div>
              </header>
              <p className="cost-time-summary">
                <LabelWithInfo tip={HELP.costAtTime} placement="down">
                  {formatCostAtTime(r.costs.totalUsd, r.deliverySeconds)}
                </LabelWithInfo>
              </p>
              <p className="algo-desc">{r.description}</p>
              <GridCanvas
                map={map}
                size={260}
                paths={r.paths}
                frame={lastFrame(r.paths)}
                showRobots
              />
              <CalculationBreakdown result={r} />
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => onAnimate(id)}
              >
                Animate
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
