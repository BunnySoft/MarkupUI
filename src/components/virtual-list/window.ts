export const MAX_VIRTUAL_PIXELS = 8_000_000
export const MAX_VIRTUAL_ROWS = 512
export const MAX_VIEWPORT_HEIGHT = 16_384

export function virtualWindow(count: number, rowSize: number, height: number, top: number, overscan: number) {
  if (!Number.isSafeInteger(count) || count < 0 || count > 1_000_000
    || !Number.isFinite(rowSize) || rowSize < 1 || rowSize > 65_536
    || count * rowSize > MAX_VIRTUAL_PIXELS
    || !Number.isFinite(height) || height < 0 || height > MAX_VIEWPORT_HEIGHT
    || !Number.isFinite(top) || !Number.isInteger(overscan) || overscan < 0 || overscan > 50) {
    throw new RangeError("Invalid fixed-size geometry: at most 1,000,000 items, 8,000,000 CSS pixels and a 16,384px viewport.")
  }
  const total = count * rowSize
  const offset = Math.min(Math.max(0, top), Math.max(0, total - height))
  const start = height && count ? Math.max(0, Math.floor(offset / rowSize) - overscan) : 0
  const end = height && count ? Math.min(count, Math.ceil((offset + height) / rowSize) + overscan) : 0
  if (end - start > MAX_VIRTUAL_ROWS) throw new RangeError("Viewport plus overscan must mount at most 512 rows.")
  return Object.freeze({ start, end, offset, total })
}
