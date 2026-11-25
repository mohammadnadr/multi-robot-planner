import { GridCanvas } from '../components/GridCanvas';
import { usePlanner } from '../context/PlannerContext';
import { useCanvasSize } from '../hooks/useCanvasSize';

export function EditorPage() {
  const { map, handleCellClick } = usePlanner();
  const canvasSize = useCanvasSize({ max: 560, min: 280 });

  return (
    <div className="page editor-page">
      <GridCanvas
        map={map}
        size={canvasSize}
        onCellClick={handleCellClick}
        className="grid-canvas--responsive"
      />
    </div>
  );
}
