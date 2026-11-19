export type Heading = 'N' | 'E' | 'S' | 'W';

export type ActionKind =
  | 'straight'
  | 'turnL'
  | 'turnR'
  | 'reverse'
  | 'wait'
  | 'brake'
  | 'accel';

export type EnergyCategory =
  | 'cruise'
  | 'accel'
  | 'brake'
  | 'turn'
  | 'reverse'
  | 'idle';

export type EnergyByCategory = Record<EnergyCategory, number>;

export type UsdByCategory = EnergyByCategory & {
  pick: number;
  deliver: number;
  fleet: number;
  timeValue: number;
};

export type CostConfig = {
  vmax: number;
  aMax: number;
  eCruise: number;
  eAccel: number;
  eBrake: number;
  eTurn: number;
  eReverse: number;
  eIdle: number;
  eStartup: number;
  /** Simulated seconds per Makespan time-step (deliverySeconds = makespan × this). */
  secondsPerStep: number;
  /** $ per energy unit */
  energyPriceUsd: number;
  pickFeeUsd: number;
  deliverFeeUsd: number;
  fleetFixedUsd: number;
  timeValuePerMakespanUsd: number;
};

export type PathAction = {
  kind: ActionKind;
  heading: Heading | null;
  from: { x: number; y: number };
  to: { x: number; y: number };
  wait?: boolean;
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

export function emptyEnergy(): EnergyByCategory {
  return {
    cruise: 0,
    accel: 0,
    brake: 0,
    turn: 0,
    reverse: 0,
    idle: 0,
  };
}

export function emptyUsd(): UsdByCategory {
  return {
    ...emptyEnergy(),
    pick: 0,
    deliver: 0,
    fleet: 0,
    timeValue: 0,
  };
}
