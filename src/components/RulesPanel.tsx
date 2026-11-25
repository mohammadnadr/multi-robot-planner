import { HELP } from '../help/glossary';
import { LabelWithInfo } from './LabelWithInfo';

export function RulesPanel() {
  return (
    <section className="panel-section rules">
      <h2>
        <LabelWithInfo tip={HELP.rules}>Rules</LabelWithInfo>
      </h2>
      <ul>
        <li>One item capacity per robot.</li>
        <li>Enter shelf → reverse out (no turn inside).</li>
        <li>Shared corridors OK; never same cell at same time.</li>
        <li>No head-on pass-through (opposite robots swap cells).</li>
        <li>Lower-priority robot waits (inserts waits).</li>
        <li>After a turn, next 2 cells cost +1 (accel).</li>
        <li>Return home when tasks are done.</li>
      </ul>
      <div className="formula">
        <LabelWithInfo tip={HELP.makespan}>
          <strong>Makespan</strong>
        </LabelWithInfo>{' '}
        = max finish time over robots
        <br />
        <LabelWithInfo tip={HELP.motionUsd}>
          <strong>Motion $</strong>
        </LabelWithInfo>{' '}
        = Σ energy(v,a) × energy price
        <br />
        Turns / brake / cruise burn energy — not stacked flat fees.
      </div>
    </section>
  );
}
