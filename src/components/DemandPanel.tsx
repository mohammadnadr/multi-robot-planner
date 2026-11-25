import { ACTIVE_PRODUCT_TYPES, MAX_DEMAND } from '../constants';
import { HELP } from '../help/glossary';
import type { Demand, ShelfType } from '../types';
import { InfoTip } from './InfoTip';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  demand: Demand;
  onChange: (demand: Demand) => void;
};

const DEMAND_HELP: Record<ShelfType, string> = {
  A: HELP.demandA,
  B: HELP.demandB,
  C: HELP.demandC,
  D: HELP.demandD,
  E: HELP.demandE,
  F: HELP.demandF,
};

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
      {ACTIVE_PRODUCT_TYPES.map((typ) => (
        <div className="row" key={typ}>
          <span className="demand-label">
            {typ}
            <InfoTip text={DEMAND_HELP[typ]} />
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