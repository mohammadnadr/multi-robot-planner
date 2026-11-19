import { useEffect, useMemo, useState } from 'react';
import { ALGORITHM_ORDER } from '../algorithms';
import { HELP } from '../help/glossary';
import type { AlgorithmId, AllResults, GridMap } from '../types';
import { CalculationBreakdown } from './CalculationBreakdown';
import { GridCanvas } from './GridCanvas';
import { LabelWithInfo } from './LabelWithInfo';

const ALGO_HELP: Record<AlgorithmId, string> = {
  greedy: HELP.greedy,
  prioritized: HELP.prioritized,
  aco: HELP.aco,
  genetic: HELP.genetic,
};

type Props = {
  map: GridMap;
  results: AllResults;
  initialId: AlgorithmId;
  onBack: () => void;
  onAlgorithmChange?: (id: AlgorithmId) => void;
};

export function AnimationView({
  map,
  results,
  initialId,
  onBack,
  onAlgorithmChange,
}: Props) {
  const algId = initialId;
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState(0);

  const result = results[algId];
  const maxFrame = useMemo(() => {
    let m = 1;
    Object.values(result.paths).forEach((p) => {
      if (p?.length) m = Math.max(m, p.length);
    });
    return Math.max(1, m);
  }, [result]);

  useEffect(() => {
    setFrame(0);
    setPlaying(true);
  }, [algId]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setFrame((f) => {
        if (f + 1 >= maxFrame) {
          setPlaying(false);
          return maxFrame - 1;
        }
        return f + 1;
      });
    }, 160);
    return () => window.clearInterval(id);
  }, [playing, maxFrame]);

  return (
    <div className="animation-view">
      <div className="anim-controls">
        <LabelWithInfo tip={HELP.animation} placement="down">
          Animation
        </LabelWithInfo>
        <button
          type="button"
          className="btn btn-accent"
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setFrame(0);
            setPlaying(true);
          }}
        >
          Reset
        </button>
        <select
          value={algId}
          onChange={(e) => {
            const next = e.target.value as AlgorithmId;
            onAlgorithmChange?.(next);
          }}
          className="alg-select"
        >
          {ALGORITHM_ORDER.map((id) => (
            <option key={id} value={id}>
              {results[id].name} (T{results[id].makespan}, R
              {results[id].robotsUsed})
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Back to comparison
        </button>
        <span className="frame-label">
          <LabelWithInfo tip={HELP.frame} placement="down">
            Frame {frame}/{maxFrame - 1}
          </LabelWithInfo>
        </span>
      </div>

      <div className="anim-layout">
        <GridCanvas
          map={map}
          size={500}
          paths={result.paths}
          frame={frame}
        />
        <aside>
          <h2>
            <LabelWithInfo tip={ALGO_HELP[algId]} placement="down">
              {result.name}
            </LabelWithInfo>
          </h2>
          <CalculationBreakdown result={result} />
        </aside>
      </div>
    </div>
  );
}
