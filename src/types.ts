/** 0 empty; 1–6 shelves A–F; 7 delivery */
export type CellType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Point = { x: number; y: number };

export type TimedPoint = Point & { t: number; wait?: boolean };

export type ShelfType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type Demand = Record<ShelfType, number>;

export type Task = {
  id: string;
  type: ShelfType;
  /** Set after dynamic shelf resolution; omitted when tasks are generated. */
  pick?: Point;
  deliv: Point;
};

export type ResolvedTask = Task & { pick: Point };

export type Robot = Point & { id: number };

export type GridMap = {
  width: number;
  height: number;
  cells: CellType[][]; // [y][x]
  robots: Robot[];
  delivery: Point | null;
};

export type Tool =
  | 'shelfA'
  | 'shelfB'
  | 'shelfC'
  | 'shelfD'
  | 'shelfE'
  | 'shelfF'
  | 'delivery'
  | 'robot'
  | 'eraser';

export type Assignment = Task[][]; // index = robot index

export type RobotMetrics = {
  robotId: number;
  taskIds: string[];
  geometricLength: number;
  waitSteps: number;
  accelPenalty: number;
  finishTime: number;
};

export type PlanMetrics = {
  makespan: number;
  totalGeometricLength: number;
  robotsUsed: number;
  waitSteps: number;
  accelPenalty: number;
  perRobot: RobotMetrics[];
};

export type TimedPaths = Record<number, TimedPoint[]>;

export type EnergyByCategory = {
  cruise: number;
  accel: number;
  brake: number;
  turn: number;
  reverse: number;
  idle: number;
};

export type UsdByCategory = EnergyByCategory & {
  pick: number;
  deliver: number;
  fleet: number;
  timeValue: number;
};

export type RobotCostLine = {
  robotId: number;
  totalEnergy: number;
  motionUsd: number;
  energyByCategory: EnergyByCategory;
};

export type CostBreakdown = {
  totalEnergy: number;
  motionUsd: number;
  opsUsd: number;
  totalUsd: number;
  energyByCategory: EnergyByCategory;
  usdByCategory: UsdByCategory;
  perRobot: RobotCostLine[];
};

export type PlanResult = PlanMetrics & {
  paths: TimedPaths;
  assignment: Assignment;
  geometricPaths: Point[][];
  costs: CostBreakdown;
  /** Simulated delivery time: makespan × secondsPerStep. */
  deliverySeconds: number;
};

export type AlgorithmId = 'greedy' | 'prioritized' | 'aco' | 'genetic';

export type AlgorithmResult = PlanResult & {
  id: AlgorithmId;
  name: string;
  description: string;
};

export type AllResults = Record<AlgorithmId, AlgorithmResult>;

export function emptyDemand(): Demand {
  return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
}