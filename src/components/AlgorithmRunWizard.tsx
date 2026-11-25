import { ALGORITHM_ORDER } from '../algorithms';
import {
  ALGORITHM_STEPS,
  type RunProgress,
} from '../planning/runProgress';
import type { AlgorithmId } from '../types';

type StepState = 'pending' | 'active' | 'done';

function stepState(
  id: AlgorithmId,
  progress: RunProgress,
): StepState {
  if (progress.completedAlgorithms.includes(id)) return 'done';
  if (progress.currentAlgorithm === id) return 'active';
  if (
    progress.phase === 'finalizing' ||
    progress.phase === 'done'
  ) {
    return 'done';
  }
  const curIdx = progress.currentAlgorithm
    ? ALGORITHM_ORDER.indexOf(progress.currentAlgorithm)
    : progress.algorithmIndex;
  const idx = ALGORITHM_ORDER.indexOf(id);
  if (idx < curIdx || progress.completedAlgorithms.length > idx) {
    return 'done';
  }
  return 'pending';
}

type Props = {
  progress: RunProgress;
};

export function AlgorithmRunWizard({ progress }: Props) {
  const pct = Math.round(progress.overallProgress * 100);

  return (
    <div
      className="overlay run-wizard"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-wizard-title"
      aria-describedby="run-wizard-detail"
    >
      <h2 id="run-wizard-title" className="run-wizard__title">
        Running planners
      </h2>
      <p id="run-wizard-detail" className="run-wizard__detail" aria-live="polite">
        {progress.detail}
      </p>

      <div
        className="run-wizard__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Overall progress"
      >
        <div
          className="run-wizard__bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="run-wizard__pct">{pct}%</span>

      <ol className="run-wizard__steps">
        {ALGORITHM_ORDER.map((id) => {
          const state = stepState(id, progress);
          const { title } = ALGORITHM_STEPS[id];
          return (
            <li
              key={id}
              className={`run-wizard__step run-wizard__step--${state}`}
            >
              <span className="run-wizard__step-icon" aria-hidden="true">
                {state === 'done' ? '✓' : state === 'active' ? '●' : '○'}
              </span>
              <span className="run-wizard__step-label">{title}</span>
              {state === 'active' && (
                <span className="run-wizard__step-hint">
                  A* paths · wait conflicts · energy $
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {progress.phase === 'preparing' && (
        <p className="run-wizard__hint overlay-sub">
          Building tasks from demand and shelf map…
        </p>
      )}
    </div>
  );
}