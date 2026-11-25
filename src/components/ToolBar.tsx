import { ACTIVE_PRODUCT_TYPES, MAX_ROBOTS } from '../constants';
import { HELP } from '../help/glossary';
import { shelfToolId } from '../map/products';
import type { ShelfType, Tool } from '../types';
import { InfoTip } from './InfoTip';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  tool: Tool;
  onTool: (t: Tool) => void;
};

const SHELF_HELP: Record<ShelfType, string> = {
  A: HELP.shelfA,
  B: HELP.shelfB,
  C: HELP.shelfC,
  D: HELP.shelfD,
  E: HELP.shelfE,
  F: HELP.shelfF,
};

const SHELF_CLASS: Record<ShelfType, string> = {
  A: 'tool-a',
  B: 'tool-b',
  C: 'tool-c',
  D: 'tool-d',
  E: 'tool-e',
  F: 'tool-f',
};

export function ToolBar({ tool, onTool }: Props) {
  return (
    <section className="panel-section">
      <h2>
        <LabelWithInfo tip={HELP.tools}>Tools</LabelWithInfo>
      </h2>
      {ACTIVE_PRODUCT_TYPES.map((typ) => {
        const id = shelfToolId(typ);
        return (
          <div key={id} className="tool-row">
            <button
              type="button"
              className={`btn ${SHELF_CLASS[typ]} ${tool === id ? 'on' : ''}`}
              onClick={() => onTool(id)}
            >
              Shelf {typ}
            </button>
            <InfoTip text={SHELF_HELP[typ]} placement="up" />
          </div>
        );
      })}
      <div className="tool-row">
        <button
          type="button"
          className={`btn tool-delivery ${tool === 'delivery' ? 'on' : ''}`}
          onClick={() => onTool('delivery')}
        >
          Delivery
        </button>
        <InfoTip text={HELP.delivery} placement="up" />
      </div>
      <div className="tool-row">
        <button
          type="button"
          className={`btn tool-r ${tool === 'robot' ? 'on' : ''}`}
          onClick={() => onTool('robot')}
        >
          Robot (max {MAX_ROBOTS})
        </button>
        <InfoTip text={HELP.robot} placement="up" />
      </div>
      <div className="tool-row">
        <button
          type="button"
          className={`btn tool-eraser ${tool === 'eraser' ? 'on' : ''}`}
          onClick={() => onTool('eraser')}
        >
          Eraser
        </button>
        <InfoTip text={HELP.eraser} placement="up" />
      </div>
    </section>
  );
}