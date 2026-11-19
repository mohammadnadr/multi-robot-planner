import { GridCanvas } from '../components/GridCanvas';
import { usePlanner } from '../context/PlannerContext';

export function EditorPage() {
  const { map, handleCellClick } = usePlanner();

  return (
    <div className="page editor-page">
      <GridCanvas map={map} size={500} onCellClick={handleCellClick} />
    </div>
  );
}
