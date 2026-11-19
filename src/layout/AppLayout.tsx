import { Outlet } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { CostConfigPanel } from '../components/CostConfigPanel';
import { DemandPanel } from '../components/DemandPanel';
import { LabelWithInfo } from '../components/LabelWithInfo';
import { RulesPanel } from '../components/RulesPanel';
import { ToolBar } from '../components/ToolBar';
import { usePlanner } from '../context/PlannerContext';
import { HELP } from '../help/glossary';

export function AppLayout() {
  const {
    map,
    tool,
    setTool,
    demand,
    setDemand,
    status,
    running,
    costConfig,
    setCostConfig,
    runAlgorithms,
    resetDefaultMap,
    clearAll,
    resize,
  } = usePlanner();

  return (
    <div className="app">
      {running && (
        <div className="overlay">
          <div>Calculating paths + energy costs…</div>
          <div className="overlay-sub">
            Accel/brake energy · shelf reverse · wait conflicts · $ scoring
          </div>
        </div>
      )}

      <aside className="sidebar">
        <h1>Multi-AGV Planner</h1>
        <p className="subtitle">React · 4 algorithms · energy-first costs</p>

        <ToolBar tool={tool} onTool={setTool} />
        <DemandPanel demand={demand} onChange={setDemand} />

        <section className="panel-section">
          <h2>
            <LabelWithInfo tip={HELP.gridSize}>Grid size</LabelWithInfo>
          </h2>
          <div className="row">
            <label>
              <LabelWithInfo tip={HELP.gridW}>W</LabelWithInfo>
              <input
                type="number"
                min={5}
                max={20}
                value={map.width}
                onChange={(e) => {
                  const w = Math.max(5, Math.min(20, +e.target.value || 10));
                  resize(w, map.height);
                }}
              />
            </label>
            <label>
              <LabelWithInfo tip={HELP.gridH}>H</LabelWithInfo>
              <input
                type="number"
                min={5}
                max={20}
                value={map.height}
                onChange={(e) => {
                  const h = Math.max(5, Math.min(20, +e.target.value || 10));
                  resize(map.width, h);
                }}
              />
            </label>
          </div>
        </section>

        <CostConfigPanel config={costConfig} onChange={setCostConfig} />

        <button type="button" className="btn btn-run" onClick={runAlgorithms}>
          ▶ Run All Algorithms
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={resetDefaultMap}
        >
          Reset Default Map
        </button>
        <button type="button" className="btn btn-danger" onClick={clearAll}>
          Clear All
        </button>

        <RulesPanel />
        <div className="status">{status}</div>
      </aside>

      <main className="main">
        <Breadcrumb />
        <Outlet />
      </main>
    </div>
  );
}
