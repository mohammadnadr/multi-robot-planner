import { HELP } from '../help/glossary';
import type { Tool } from '../types';
import { InfoTip } from './InfoTip';
import { LabelWithInfo } from './LabelWithInfo';

type Props = {
  tool: Tool;
  onTool: (t: Tool) => void;
};

const TOOLS: {
  id: Tool;
  label: string;
  className: string;
  tip: string;
}[] = [
  { id: 'shelfA', label: 'Shelf A', className: 'tool-a', tip: HELP.shelfA },
  { id: 'shelfB', label: 'Shelf B', className: 'tool-b', tip: HELP.shelfB },
  { id: 'shelfC', label: 'Shelf C', className: 'tool-c', tip: HELP.shelfC },
  { id: 'delivery', label: 'Delivery', className: 'tool-d', tip: HELP.delivery },
  { id: 'robot', label: 'Robot (max 3)', className: 'tool-r', tip: HELP.robot },
  { id: 'eraser', label: 'Eraser', className: 'tool-e', tip: HELP.eraser },
];

export function ToolBar({ tool, onTool }: Props) {
  return (
    <section className="panel-section">
      <h2>
        <LabelWithInfo tip={HELP.tools}>Tools</LabelWithInfo>
      </h2>
      {TOOLS.map((t) => (
        <div key={t.id} className="tool-row">
          <button
            type="button"
            className={`btn ${t.className} ${tool === t.id ? 'on' : ''}`}
            onClick={() => onTool(t.id)}
          >
            {t.label}
          </button>
          <InfoTip text={t.tip} placement="up" />
        </div>
      ))}
    </section>
  );
}
