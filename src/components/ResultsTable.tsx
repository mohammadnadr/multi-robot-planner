import { ALGORITHM_ORDER } from '../algorithms';
import {
  formatCostAtTime,
  formatDuration,
} from '../cost/formatDuration';
import { HELP } from '../help/glossary';
import type { AllResults } from '../types';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  results: AllResults;
  bestMs: number;
  bestUsd: number;
  bestDelivery: number;
};

function fmt(n: number, digits = 1): string {
  return n.toFixed(digits);
}

export function ResultsTable({
  results,
  bestMs,
  bestUsd,
  bestDelivery,
}: Props) {
  return (
    <div className="results-table-wrap">
      <table className="results-table">
        <thead>
          <tr>
            <th>
              <LabelWithInfo tip={HELP.algorithm} placement="down">
                Algorithm
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.makespan} placement="down">
                Makespan
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.deliverySeconds} placement="down">
                Delivery time
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.costAtTime} placement="down">
                Cost @ time
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.pathLen} placement="down">
                Path Len
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.robotsUsed} placement="down">
                Robots
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.energy} placement="down">
                Energy
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.motionUsd} placement="down">
                Motion $
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.opsUsd} placement="down">
                Ops $
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.totalUsd} placement="down">
                Total $
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eCruiseCol} placement="down">
                E cruise
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eAccelCol} placement="down">
                E accel
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eBrakeCol} placement="down">
                E brake
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eTurnCol} placement="down">
                E turn
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eReverseCol} placement="down">
                E reverse
              </LabelWithInfo>
            </th>
            <th>
              <LabelWithInfo tip={HELP.eIdleCol} placement="down">
                E idle
              </LabelWithInfo>
            </th>
          </tr>
        </thead>
        <tbody>
          {ALGORITHM_ORDER.map((id) => {
            const r = results[id];
            const isBestMs = r.makespan === bestMs;
            const isBestUsd = r.costs.totalUsd === bestUsd;
            const isFastest = r.deliverySeconds === bestDelivery;
            const e = r.costs.energyByCategory;
            return (
              <tr
                key={id}
                className={
                  isBestMs || isBestUsd || isFastest ? 'best-row' : undefined
                }
              >
                <td>{r.name}</td>
                <td className={isBestMs ? 'best' : ''}>{r.makespan}</td>
                <td className={isFastest ? 'best' : ''}>
                  {formatDuration(r.deliverySeconds)}
                  <span className="sec-raw">
                    ({fmt(r.deliverySeconds, 1)}s)
                  </span>
                </td>
                <td className="cost-at-time">
                  {formatCostAtTime(r.costs.totalUsd, r.deliverySeconds)}
                </td>
                <td>{r.totalGeometricLength}</td>
                <td>{r.robotsUsed}</td>
                <td>{fmt(r.costs.totalEnergy)}</td>
                <td>{fmt(r.costs.motionUsd)}</td>
                <td>{fmt(r.costs.opsUsd)}</td>
                <td className={isBestUsd ? 'best' : ''}>
                  {fmt(r.costs.totalUsd)}
                </td>
                <td>{fmt(e.cruise)}</td>
                <td>{fmt(e.accel)}</td>
                <td>{fmt(e.brake)}</td>
                <td>{fmt(e.turn)}</td>
                <td>{fmt(e.reverse)}</td>
                <td>{fmt(e.idle)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
