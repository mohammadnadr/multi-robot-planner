import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { CostConfigPanel } from '../components/CostConfigPanel';
import { DemandPanel } from '../components/DemandPanel';
import { LabelWithInfo } from '../components/LabelWithInfo';
import { RulesPanel } from '../components/RulesPanel';
import { ToolBar } from '../components/ToolBar';
import { usePlanner } from '../context/PlannerContext';
import { HELP } from '../help/glossary';
import { DEFAULT_GRID_SIZE, GRID_MAX, GRID_MIN } from '../constants';
import { useIsMobileLayout } from '../hooks/useMediaQuery';

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
  const isMobile = useIsMobileLayout();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, location.pathname]);

  return (
    <div className={`app${isMobile ? ' app--mobile' : ''}`}>
      {running && (
        <div className="overlay">
          <div>Calculating paths + energy costs…</div>
          <div className="overlay-sub">
            Accel/brake energy · shelf reverse · wait conflicts · $ scoring
          </div>
        </div>
      )}

      {isMobile && (
        <header className="mobile-topbar">
          <button
            type="button"
            className="btn btn-ghost mobile-menu-btn"
            aria-expanded={sidebarOpen}
            aria-controls="planner-sidebar"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? '✕ Close' : '☰ Controls'}
          </button>
          <span className="mobile-topbar-title">Multi-AGV Planner</span>
        </header>
      )}

      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close controls"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        id="planner-sidebar"
        className={`sidebar${isMobile ? (sidebarOpen ? ' sidebar--open' : ' sidebar--closed') : ''}`}
      >
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
                min={GRID_MIN}
                max={GRID_MAX}
                value={map.width}
                onChange={(e) => {
                  const w = Math.max(
                    GRID_MIN,
                    Math.min(GRID_MAX, +e.target.value || DEFAULT_GRID_SIZE),
                  );
                  resize(w, map.height);
                }}
              />
            </label>
            <label>
              <LabelWithInfo tip={HELP.gridH}>H</LabelWithInfo>
              <input
                type="number"
                min={GRID_MIN}
                max={GRID_MAX}
                value={map.height}
                onChange={(e) => {
                  const h = Math.max(
                    GRID_MIN,
                    Math.min(GRID_MAX, +e.target.value || DEFAULT_GRID_SIZE),
                  );
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
