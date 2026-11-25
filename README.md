# Multi-Robot Planner

Educational **Multi-AGV / multi-robot task allocation and path planning** simulator (React + TypeScript).

**Live demo (desktop):** [https://mohammadnadr.github.io/multi-robot-planner/](https://mohammadnadr.github.io/multi-robot-planner/)

**Live demo (mobile / responsive):** [https://mohammadnadr.github.io/multi-robot-planner/mobile/](https://mohammadnadr.github.io/multi-robot-planner/mobile/) — same GitHub Pages deploy as the desktop demo (`deploy-pages.yml` builds both paths).

## Algorithms

| Algorithm | Module | Idea |
|---|---|---|
| Greedy Earliest-Finish | `src/algorithms/greedy.ts` | Assign next task to lowest estimated finish |
| Prioritized + Waits | `src/algorithms/prioritized.ts` | Priority-aware load fill; robot 0 highest priority |
| Ant Colony (ACO) | `src/algorithms/aco.ts` | Pheromone search over task→robot assignment |
| Genetic Algorithm | `src/algorithms/genetic.ts` | Evolve task order + robot load splits |

Shared geometry / timing / conflict / energy-cost code lives under `src/planning/` and `src/cost/`.

## Rules

- One item capacity; reverse out of shelves; return home when done
- Grid size **10×10** to **50×50** (default **20×20**); up to **six product types (A–F)**
- Unlimited robots on the map (lower index = higher conflict priority)
- Shared corridors/cells allowed
- Never same cell at the same time — lower-priority robot inserts waits
- No head-on pass-through in a corridor (edge swap conflicts insert waits before rerouting)
- Motion cost from energy(v,a) × energy price (plus ops fees)

## Routes

| Path | Page |
|---|---|
| `/` | Redirects to `/editor` |
| `/editor` | Map editor |
| `/results` | Compare all 4 algorithms |
| `/animation/:algorithmId` | Playback (`greedy`, `prioritized`, `aco`, `genetic`) |

## Local run

```bash
npm install
npm run dev
```

Open the local URL, edit the map, set demand, click **Run All Algorithms**.
