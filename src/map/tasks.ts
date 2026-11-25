import { ACTIVE_PRODUCT_TYPES, VALUE_TO_SHELF } from '../constants';
import type { Demand, GridMap, ShelfType, Task } from '../types';

/** Build deliver tasks from demand; shelf cells are chosen at plan time from the pool. */
export function buildTasks(map: GridMap, demand: Demand): Task[] {
  if (!map.delivery) return [];

  const shelfCount = Object.fromEntries(
    ACTIVE_PRODUCT_TYPES.map((typ) => [typ, 0]),
  ) as Record<ShelfType, number>;

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const typ = VALUE_TO_SHELF[map.cells[y][x]];
      if (typ) shelfCount[typ]++;
    }
  }

  const tasks: Task[] = [];
  let counter = 0;
  ACTIVE_PRODUCT_TYPES.forEach((typ) => {
    const need = Math.min(demand[typ], shelfCount[typ]);
    for (let i = 0; i < need; i++) {
      tasks.push({
        id: `${typ}${counter++}`,
        type: typ,
        deliv: { ...map.delivery! },
      });
    }
  });

  return tasks;
}