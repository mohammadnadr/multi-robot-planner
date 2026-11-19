import { MAX_DEMAND } from '../constants';
import { HELP } from '../help/glossary';
import type { Demand, ShelfType } from '../types';
import { InfoTip } from './InfoTip';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  demand: Demand;
  onChange: (demand: Demand) => void;
};

const TYPES: { typ: ShelfType; tip: string }[] = [
  { typ: 'A', tip: HELP.demandA },
  { typ: 'B', tip: HELP.demandB },
  { typ: 'C', tip: HELP.demandC },
];

export function DemandPanel({ demand, onChange }: Props) {
  const bump = (typ: ShelfType, delta: number) => {
    onChange({
      ...demand,
      [typ]: Math.max(0, Math.min(MAX_DEMAND, demand[typ] + delta)),
    });
  };

  return (
    <section className="panel-section">
      <h2>
        <LabelWithInfo tip={HELP.demand}>Demand</LabelWithInfo>
      </h2>
      {TYPES.map(({ typ, tip }) => (
        <div className="row" key={typ}>
          <span className="demand-label">
            {typ}
            <InfoTip text={tip} />
          </span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => bump(typ, -1)}
          >
            −
          </button>
          <span className="val">{demand[typ]}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => bump(typ, 1)}
          >
            +
          </button>
        </div>
      ))}
    </section>
  );
}
