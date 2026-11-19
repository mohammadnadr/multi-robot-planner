import {
  formatCostAtTime,
  formatDuration,
} from '../cost/formatDuration';
import { HELP } from '../help/glossary';
import type { AlgorithmResult } from '../types';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  result: AlgorithmResult;
  compact?: boolean;
};

function fmt(n: number, digits = 2): string {
  return n.toFixed(digits);
}

export function CalculationBreakdown({ result, compact }: Props) {
  const c = result.costs;
  const e = c.energyByCategory;
  const u = c.usdByCategory;

  return (
    <div className={`calc-breakdown ${compact ? 'compact' : ''}`}>
      <div className="calc-row cost-time-row">
        <LabelWithInfo tip={HELP.costAtTime}>Cost @ time</LabelWithInfo>
        <strong className="cost-time-value">
          {formatCostAtTime(c.totalUsd, result.deliverySeconds)}
        </strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.makespan}>Makespan</LabelWithInfo>
        <strong>{result.makespan}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.deliverySeconds}>Delivery time</LabelWithInfo>
        <strong>{formatDuration(result.deliverySeconds)}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.pathLen}>Path length</LabelWithInfo>
        <strong>{result.totalGeometricLength}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.robotsUsed}>Robots</LabelWithInfo>
        <strong>{result.robotsUsed}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.energy}>Total energy</LabelWithInfo>
        <strong>{fmt(c.totalEnergy, 1)}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.motionUsd}>Motion $</LabelWithInfo>
        <strong>{fmt(c.motionUsd)}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.opsUsd}>Ops $</LabelWithInfo>
        <strong>{fmt(c.opsUsd)}</strong>
      </div>
      <div className="calc-row">
        <LabelWithInfo tip={HELP.totalUsd}>Total $</LabelWithInfo>
        <strong>{fmt(c.totalUsd)}</strong>
      </div>

      {!compact && (
        <>
          <div className="per-robot">
            <h4>
              <LabelWithInfo tip={HELP.energyByAction}>
                Energy by action (→ $ via price)
              </LabelWithInfo>
            </h4>
            {(
              [
                ['cruise', e.cruise, u.cruise, HELP.eCruiseCol],
                ['accel', e.accel, u.accel, HELP.eAccelCol],
                ['brake', e.brake, u.brake, HELP.eBrakeCol],
                ['turn', e.turn, u.turn, HELP.eTurnCol],
                ['reverse', e.reverse, u.reverse, HELP.eReverseCol],
                ['idle', e.idle, u.idle, HELP.eIdleCol],
              ] as const
            ).map(([name, en, usd, tip]) => (
              <div key={name} className="calc-row">
                <LabelWithInfo tip={tip}>{name}</LabelWithInfo>
                <strong>
                  {fmt(en, 1)} E · ${fmt(usd)}
                </strong>
              </div>
            ))}
            <div className="calc-row">
              <LabelWithInfo tip={HELP.pickDeliver}>
                pick / deliver
              </LabelWithInfo>
              <strong>
                ${fmt(u.pick)} / ${fmt(u.deliver)}
              </strong>
            </div>
            <div className="calc-row">
              <LabelWithInfo tip={HELP.fleetTime}>
                fleet / time-value
              </LabelWithInfo>
              <strong>
                ${fmt(u.fleet)} / ${fmt(u.timeValue)}
              </strong>
            </div>
          </div>

          <div className="per-robot">
            <h4>
              <LabelWithInfo tip={HELP.perRobot}>Per robot</LabelWithInfo>
            </h4>
            {result.perRobot.length === 0 && <p className="muted">No tasks</p>}
            {result.perRobot.map((r) => {
              const rc = c.perRobot.find((x) => x.robotId === r.robotId);
              return (
                <div key={r.robotId} className="robot-line">
                  <span>
                    R{r.robotId + 1}: [{r.taskIds.join(', ') || '—'}]
                  </span>
                  <span>
                    T{r.finishTime} · E{fmt(rc?.totalEnergy ?? 0, 1)} · $
                    {fmt(rc?.motionUsd ?? 0)}
                  </span>
                </div>
              );
            })}
            <p className="formula-mini">
              motion$ = Σ energy(v,a) × energyPrice · total$ = motion$ + ops$
            </p>
          </div>
        </>
      )}
    </div>
  );
}
