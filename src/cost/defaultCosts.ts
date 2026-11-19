import type { CostConfig } from './types';

/** Sample educational defaults — all editable in the UI. */
export const DEFAULT_COST_CONFIG: CostConfig = {
  vmax: 5,
  aMax: 1,
  eCruise: 1.0,
  eAccel: 1.2,
  eBrake: 0.8,
  eTurn: 2.0,
  eReverse: 2.5,
  eIdle: 0.5,
  eStartup: 1.0,
  secondsPerStep: 1,
  energyPriceUsd: 0.15,
  pickFeeUsd: 3,
  deliverFeeUsd: 2,
  fleetFixedUsd: 10,
  timeValuePerMakespanUsd: 0.1,
};
