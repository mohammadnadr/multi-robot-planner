import { VALUE_TO_SHELF } from '../constants';
import type { Demand, GridMap, ShelfType, Task } from '../types';
import { manhattan } from './obstacles';

/** Build pick→deliver tasks from demand and nearest shelves to delivery. */
export function buildTasks(map: GridMap, demand: Demand): Task[] {
  if (!map.delivery) return [];

  const shelves: Record<ShelfType, { x: number; y: number }[]> = {
    A: [],
    B: [],
    C: [],
  };

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const typ = VALUE_TO_SHELF[map.cells[y][x]];
      if (typ) shelves[typ].push({ x, y });
    }
  }

  const tasks: Task[] = [];
  let counter = 0;
  (['A', 'B', 'C'] as ShelfType[]).forEach((typ) => {
    const need = Math.min(demand[typ], shelves[typ].length);
    const sorted = shelves[typ]
      .slice()
      .sort(
        (a, b) =>
          manhattan(a, map.delivery!) - manhattan(b, map.delivery!),
      );
    for (let i = 0; i < need; i++) {
      tasks.push({
        id: `${typ}${counter++}`,
        type: typ,
        pick: sorted[i],
        deliv: { ...map.delivery! },
      });
    }
  });

  return tasks;
}
