/** Plain-language help text for info-icon tooltips. */
export const HELP = {
  // Sections
  tools: 'Paint mode for the map: place shelves, delivery, robots, or erase cells.',
  demand:
    'How many items of each shelf type (A–D) must be picked and delivered in this run.',
  gridSize: 'Width and height of the warehouse grid (cells). Larger maps allow bigger layouts.',
  gridW: 'Number of columns in the grid.',
  gridH: 'Number of rows in the grid.',
  costEnergy:
    'Physics and money model. Motion cost comes only from energy used (v and a), times the energy price. Ops fees are separate flat charges.',
  dynamics: 'Speed limits: how fast a robot may go and how quickly it may accelerate or brake.',
  energyRates:
    'How much energy each kind of motion burns. Motion $ = total energy × energy price — not stacked flat fees for turn/straight.',
  opsFees:
    'Non-physics dollar fees: picking, delivering, owning each robot, and valuing Makespan time.',
  rules:
    'Movement and collision rules: no same cell at same time, no head-on swap moves in a corridor; lower-priority robots insert waits.',
  shelfApproach:
    'Picks the shelf aisle (left/right/top/bottom) with the shortest timed path from the robot—including enter and reverse—then builds delivery legs. Waits from other robots may still add time.',
  results: 'Side-by-side comparison of all algorithms on time (Makespan) and cost (energy + $).',

  // Tools
  shelfA: 'Place type-A shelf cells (pick locations for A items). Treated as obstacles except when entering to pick.',
  shelfB: 'Place type-B shelf cells (pick locations for B items).',
  shelfC: 'Place type-C shelf cells (pick locations for C items).',
  shelfD: 'Place type-D shelf cells (pick locations for D items).',
  shelfE: 'Place type-E shelf cells (pick locations for E items).',
  shelfF: 'Place type-F shelf cells (pick locations for F items).',
  delivery: 'Set the delivery / drop-off zone. Robots bring picked items here.',
  robot:
    'Place a robot start position (max 4). Robot 0 has highest priority in conflicts.',
  eraser: 'Clear a cell: removes shelves, delivery, or a robot on that cell.',

  // Demand
  demandA: 'Number of A items to deliver (capped by how many A shelves exist).',
  demandB: 'Number of B items to deliver (capped by how many B shelves exist).',
  demandC: 'Number of C items to deliver (capped by how many C shelves exist).',
  demandD: 'Number of D items to deliver (capped by how many D shelves exist).',
  demandE: 'Number of E items to deliver (capped by how many E shelves exist).',
  demandF: 'Number of F items to deliver (capped by how many F shelves exist).',

  // Cost config
  vmax: 'Maximum robot speed (cells per step equivalent). Higher speed burns more cruise energy.',
  aMax: 'Maximum acceleration/brake change per step (|a| ≤ aMax).',
  secondsPerStep:
    'How many real seconds one Makespan time-step represents. delivery time = Makespan × seconds/step (default 1 → Makespan 50 = 50s).',
  deliverySeconds:
    'Simulated wall-clock time until the last robot finishes delivering (Makespan × seconds/step). Lower means products arrive sooner.',
  costAtTime:
    'Shortcut summary: Total $ and delivery duration together, e.g. “$150.00 in 1m 0s”. Compare cost vs how fast the fleet finishes.',
  eCruise: 'Cruise energy per cell ≈ eCruise × current speed v. At v=5 with eCruise=1 you burn 5 energy.',
  eAccel: 'Extra energy when speeding up: eAccel × |Δv| × average speed.',
  eBrake: 'Energy/wear when slowing down: eBrake × |Δv|. Still costs money (no free regen).',
  eTurn: 'Extra energy for a 90° yaw after braking to near-stop. Turn $ comes from this energy × price.',
  eReverse: 'Extra energy for reversing (e.g. exiting a shelf the way you entered).',
  eIdle: 'Energy burned each wait/idle step while standing still.',
  eStartup: 'One-time energy when leaving speed 0 (pulling away from rest).',
  energyPriceUsd: 'Dollars per energy unit. motion$ = totalEnergy × this price.',
  pickFeeUsd: 'Flat ops fee charged once per pick (shelf cycle), not from physics.',
  deliverFeeUsd: 'Flat ops fee charged once per delivery stop.',
  fleetFixedUsd: 'Fixed cost per robot used in the plan (fleet ownership / deployment).',
  timeValuePerMakespanUsd: 'Dollars per Makespan step — turns schedule length into money.',

  // Results / metrics
  algorithm: 'Which planner produced this row (Greedy, Prioritized, ACO, or Genetic).',
  makespan:
    'Time when the last robot finishes (including waits and accel dwell). Lower is better for speed.',
  pathLen: 'Total geometric path length (cells visited) summed over robots, before wait insertion timing.',
  robotsUsed: 'How many robots this plan actually used (best of 1…N by Makespan).',
  energy: 'Total energy burned by all robots from v/a physics (cruise, accel, brake, turn, reverse, idle).',
  motionUsd: 'Money from motion only: totalEnergy × energy price. Not a second charge on top of turns.',
  opsUsd: 'Sum of pick + deliver + fleet fixed + time-value fees.',
  totalUsd: 'motion$ + ops$. Best Total $ may differ from best Makespan.',
  eCruiseCol: 'Energy spent while cruising at speed v (straight motion).',
  eAccelCol: 'Energy spent accelerating (including startup from rest).',
  eBrakeCol: 'Energy spent braking before stops, turns, or waits.',
  eTurnCol: 'Extra energy from 90° turns after slowing down.',
  eReverseCol: 'Extra energy from reverse maneuvers (shelf exit).',
  eIdleCol: 'Energy spent while waiting (conflict waits or idle).',
  bestMakespan: 'This algorithm has the lowest Makespan among the four.',
  bestUsd: 'This algorithm has the lowest Total $ among the four.',
  pickDeliver: 'Ops fees for each pick cycle and each delivery stop.',
  fleetTime: 'Fleet fixed cost × robots used, plus time-value × Makespan.',
  perRobot: 'Per-robot finish time, energy, and motion $ for transparency.',
  energyByAction: 'Energy split by action type; each converts to $ via energy price.',

  // Algorithms
  greedy:
    'Greedy earliest-finish: repeatedly assigns the next task to the robot with the lowest estimated finish time, then inserts waits for conflicts.',
  prioritized:
    'Priority-aware load fill: higher-priority robots (lower index) get tasks when loads are equal; lower-priority robots wait on cell conflicts.',
  aco: 'Ant Colony Optimization searches task→robot assignments with pheromone; fitness is Makespan after path build and waits.',
  genetic:
    'Genetic algorithm evolves task order and how tasks are split across robots; fitness is Makespan after path build and waits.',

  // Animation
  animation: 'Playback of timed paths. Arrow shows heading; dimmed arrow means the robot is waiting.',
  frame: 'Current simulation step along the timed trajectories (including wait steps).',
} as const;

export type HelpKey = keyof typeof HELP;
