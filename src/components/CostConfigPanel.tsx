import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import type { CostConfig } from '../cost/types';
import { HELP } from '../help/glossary';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  config: CostConfig;
  onChange: (cfg: CostConfig) => void;
};

type Field = {
  key: keyof CostConfig;
  label: string;
  tip: string;
  step?: number;
  min?: number;
};

const PHYSICS: Field[] = [
  { key: 'vmax', label: 'vmax', tip: HELP.vmax, step: 1, min: 1 },
  { key: 'aMax', label: 'aMax', tip: HELP.aMax, step: 1, min: 1 },
  {
    key: 'secondsPerStep',
    label: 'sec / step',
    tip: HELP.secondsPerStep,
    step: 0.1,
    min: 0.01,
  },
];

const ENERGY: Field[] = [
  { key: 'eCruise', label: 'eCruise (×v)', tip: HELP.eCruise, step: 0.1, min: 0 },
  { key: 'eAccel', label: 'eAccel', tip: HELP.eAccel, step: 0.1, min: 0 },
  { key: 'eBrake', label: 'eBrake', tip: HELP.eBrake, step: 0.1, min: 0 },
  { key: 'eTurn', label: 'eTurn', tip: HELP.eTurn, step: 0.1, min: 0 },
  { key: 'eReverse', label: 'eReverse', tip: HELP.eReverse, step: 0.1, min: 0 },
  { key: 'eIdle', label: 'eIdle', tip: HELP.eIdle, step: 0.1, min: 0 },
  { key: 'eStartup', label: 'eStartup', tip: HELP.eStartup, step: 0.1, min: 0 },
  {
    key: 'energyPriceUsd',
    label: '$ / energy',
    tip: HELP.energyPriceUsd,
    step: 0.01,
    min: 0,
  },
];

const OPS: Field[] = [
  { key: 'pickFeeUsd', label: 'Pick $', tip: HELP.pickFeeUsd, step: 0.5, min: 0 },
  {
    key: 'deliverFeeUsd',
    label: 'Deliver $',
    tip: HELP.deliverFeeUsd,
    step: 0.5,
    min: 0,
  },
  {
    key: 'fleetFixedUsd',
    label: 'Fleet $/robot',
    tip: HELP.fleetFixedUsd,
    step: 1,
    min: 0,
  },
  {
    key: 'timeValuePerMakespanUsd',
    label: 'Time-value $/MS',
    tip: HELP.timeValuePerMakespanUsd,
    step: 0.05,
    min: 0,
  },
];

export function CostConfigPanel({ config, onChange }: Props) {
  const set = (key: keyof CostConfig, raw: string) => {
    const n = Number(raw);
    if (Number.isNaN(n)) return;
    onChange({ ...config, [key]: n });
  };

  const renderFields = (fields: Field[]) =>
    fields.map((f) => (
      <label key={f.key} className="cost-field">
        <LabelWithInfo tip={f.tip}>{f.label}</LabelWithInfo>
        <input
          type="number"
          step={f.step ?? 1}
          min={f.min ?? 0}
          value={config[f.key]}
          onChange={(e) => set(f.key, e.target.value)}
        />
      </label>
    ));

  return (
    <section className="panel-section cost-panel">
      <h2>
        <LabelWithInfo tip={HELP.costEnergy}>Cost & energy</LabelWithInfo>
      </h2>
      <p className="cost-hint">
        Motion $ = Σ energy(v,a) × energy price. Turns/brake/straight do not
        stack flat $ on top of energy.
      </p>

      <h3 className="cost-sub">
        <LabelWithInfo tip={HELP.dynamics}>Dynamics</LabelWithInfo>
      </h3>
      {renderFields(PHYSICS)}

      <h3 className="cost-sub">
        <LabelWithInfo tip={HELP.energyRates}>Energy rates</LabelWithInfo>
      </h3>
      {renderFields(ENERGY)}

      <h3 className="cost-sub">
        <LabelWithInfo tip={HELP.opsFees}>Ops fees ($)</LabelWithInfo>
      </h3>
      {renderFields(OPS)}

      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => onChange({ ...DEFAULT_COST_CONFIG })}
      >
        Reset cost samples
      </button>
    </section>
  );
}
