import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { bestMakespan, runAllAlgorithms } from '../algorithms';
import { DEFAULT_DEMAND, DELIVERY_CELL, MAX_ROBOTS } from '../constants';
import { shelfToolCellValue } from '../map/products';
import { DEFAULT_COST_CONFIG } from '../cost/defaultCosts';
import { rescoreAllResults } from '../cost/aggregateCosts';
import type { CostConfig } from '../cost/types';
import {
  createDefaultMap,
  createEmptyMap,
} from '../map/defaultMap';
import type {
  AllResults,
  CellType,
  Demand,
  GridMap,
  Tool,
} from '../types';

type PlannerContextValue = {
  map: GridMap;
  setMap: React.Dispatch<React.SetStateAction<GridMap>>;
  tool: Tool;
  setTool: (t: Tool) => void;
  demand: Demand;
  setDemand: (d: Demand) => void;
  status: string;
  setStatus: (s: string) => void;
  results: AllResults | null;
  setResults: React.Dispatch<React.SetStateAction<AllResults | null>>;
  running: boolean;
  costConfig: CostConfig;
  setCostConfig: (cfg: CostConfig) => void;
  runAlgorithms: () => void;
  resetDefaultMap: () => void;
  clearAll: () => void;
  handleCellClick: (x: number, y: number) => void;
  resize: (width: number, height: number) => void;
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [map, setMap] = useState<GridMap>(() => createDefaultMap());
  const [tool, setTool] = useState<Tool>('shelfA');
  const [demand, setDemand] = useState<Demand>(() => ({ ...DEFAULT_DEMAND }));
  const [status, setStatus] = useState(
    'Place shelves, delivery, robots — then run all algorithms.',
  );
  const [results, setResults] = useState<AllResults | null>(null);
  const [running, setRunning] = useState(false);
  const [costConfig, setCostConfigState] = useState<CostConfig>(() => ({
    ...DEFAULT_COST_CONFIG,
  }));
  const skipRescoreOnce = useRef(true);
  const resultsRef = useRef<AllResults | null>(null);
  resultsRef.current = results;

  const setCostConfig = useCallback((cfg: CostConfig) => {
    setCostConfigState(cfg);
  }, []);

  // Re-score last paths when only cost rates change (no re-pathing).
  useEffect(() => {
    if (skipRescoreOnce.current) {
      skipRescoreOnce.current = false;
      return;
    }
    const prev = resultsRef.current;
    if (!prev) return;
    setResults(rescoreAllResults(prev, costConfig));
    setStatus(
      'Cost rates updated — re-scored energy/$ on existing paths (no re-plan).',
    );
  }, [costConfig]);

  const handleCellClick = useCallback(
    (x: number, y: number) => {
      setMap((prev) => {
        const next: GridMap = {
          ...prev,
          cells: prev.cells.map((row) => [...row]),
          robots: [...prev.robots],
          delivery: prev.delivery ? { ...prev.delivery } : null,
        };

        if (tool === 'robot') {
          if (
            next.robots.length < MAX_ROBOTS &&
            !next.robots.some((r) => r.x === x && r.y === y) &&
            next.cells[y][x] === 0
          ) {
            next.robots.push({ id: next.robots.length, x, y });
            setStatus(
              `Robots: ${next.robots.length}/${MAX_ROBOTS} placed (robot ${next.robots.length})`,
            );
          } else if (next.robots.length >= MAX_ROBOTS) {
            setStatus(`Robot limit reached (max ${MAX_ROBOTS}).`);
          }
          return next;
        }

        if (tool === 'delivery') {
          if (next.delivery) {
            next.cells[next.delivery.y][next.delivery.x] = 0;
          }
          next.delivery = { x, y };
          next.cells[y][x] = DELIVERY_CELL;
          next.robots = next.robots
            .filter((r) => !(r.x === x && r.y === y))
            .map((r, i) => ({ ...r, id: i }));
          setStatus('Delivery set');
          return next;
        }

        if (tool === 'eraser') {
          next.cells[y][x] = 0;
          next.robots = next.robots
            .filter((r) => !(r.x === x && r.y === y))
            .map((r, i) => ({ ...r, id: i }));
          if (next.delivery && next.delivery.x === x && next.delivery.y === y) {
            next.delivery = null;
          }
          setStatus('Cleared cell');
          return next;
        }

        const shelfVal = shelfToolCellValue(tool);
        if (shelfVal === null) return next;
        next.cells[y][x] = shelfVal;
        next.robots = next.robots
          .filter((r) => !(r.x === x && r.y === y))
          .map((r, i) => ({ ...r, id: i }));
        if (next.delivery && next.delivery.x === x && next.delivery.y === y) {
          next.delivery = null;
        }
        setStatus(`Shelf ${tool.slice(-1)} placed`);
        return next;
      });
    },
    [tool],
  );

  const runAlgorithms = useCallback(() => {
    if (!map.robots.length || !map.delivery) {
      setStatus('Need at least one robot and a delivery point.');
      return;
    }
    setRunning(true);
    setStatus('Running Greedy, Prioritized, ACO, Genetic + cost scoring…');
    window.setTimeout(() => {
      try {
        const all = runAllAlgorithms(map, demand, costConfig);
        setResults(all);
        const best = bestMakespan(all);
        const bestUsd = Math.min(
          ...Object.values(all).map((r) => r.costs.totalUsd),
        );
        setStatus(
          `Done. Best Makespan=${best}, best Total $=$${bestUsd.toFixed(2)}.`,
        );
        navigate('/results');
      } catch (e) {
        setStatus(`Error: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setRunning(false);
      }
    }, 40);
  }, [map, demand, costConfig, navigate]);

  const resetDefaultMap = useCallback(() => {
    setMap(createDefaultMap(map.width, map.height));
    setResults(null);
    setStatus('Default map loaded');
    navigate('/editor');
  }, [map.width, map.height, navigate]);

  const clearAll = useCallback(() => {
    setMap(createEmptyMap(map.width, map.height));
    setResults(null);
    setStatus('Cleared');
    navigate('/editor');
  }, [map.width, map.height, navigate]);

  const resize = useCallback((width: number, height: number) => {
    setMap((m) => resizeMap(m, width, height));
  }, []);

  const value = useMemo(
    () => ({
      map,
      setMap,
      tool,
      setTool,
      demand,
      setDemand,
      status,
      setStatus,
      results,
      setResults,
      running,
      costConfig,
      setCostConfig,
      runAlgorithms,
      resetDefaultMap,
      clearAll,
      handleCellClick,
      resize,
    }),
    [
      map,
      tool,
      demand,
      status,
      results,
      running,
      costConfig,
      setCostConfig,
      runAlgorithms,
      resetDefaultMap,
      clearAll,
      handleCellClick,
      resize,
    ],
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within PlannerProvider');
  return ctx;
}

function resizeMap(map: GridMap, width: number, height: number): GridMap {
  const cells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => {
      if (y < map.height && x < map.width) return map.cells[y][x];
      return 0 as CellType;
    }),
  );

  const robots = map.robots
    .filter((r) => r.x < width && r.y < height)
    .slice(0, MAX_ROBOTS)
    .map((r, i) => ({ ...r, id: i }));

  let delivery = map.delivery;
  if (delivery && (delivery.x >= width || delivery.y >= height)) {
    delivery = null;
  }

  return { width, height, cells, robots, delivery };
}
