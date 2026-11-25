import { ACTIVE_PRODUCT_TYPES, SHELF_VALUE } from '../constants';
import type { CellType, ShelfType, Tool } from '../types';

export function shelfToolId(type: ShelfType): Tool {
  return `shelf${type}` as Tool;
}

export function toolToShelfType(tool: Tool): ShelfType | null {
  if (!tool.startsWith('shelf') || tool.length !== 6) return null;
  const letter = tool.slice(-1);
  if (!ACTIVE_PRODUCT_TYPES.includes(letter as ShelfType)) return null;
  return letter as ShelfType;
}

export function shelfToolCellValue(tool: Tool): CellType | null {
  const typ = toolToShelfType(tool);
  return typ ? SHELF_VALUE[typ] : null;
}