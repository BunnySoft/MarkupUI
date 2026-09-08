export interface PaginationValues {
  page?: number
  pageSize?: number
  pageCount?: number | null
  itemCount?: number | null
  pageSlot?: number
  disabled?: boolean
  simple?: boolean
}
export interface PaginationState {
  page: number
  pageSize: number
  pageCount: number
  itemCount: number | null
  startIndex: number | null
  endIndex: number | null
  empty: boolean
  disabled: boolean
  simple: boolean
  pageSlot: number
}
export function integer(value: unknown, minimum: number, name: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < minimum) throw new RangeError(`${name} must be a safe integer >= ${minimum}.`)
  return value as number
}
export function paginationState(values: PaginationValues): PaginationState {
  const pageSize = integer(values.pageSize ?? 10, 1, "pageSize")
  const itemCount = values.itemCount ?? null
  if (itemCount !== null) integer(itemCount, 0, "itemCount")
  const count = values.pageCount ?? 1
  integer(count, 0, "pageCount")
  const total = itemCount === null ? count : Math.ceil(itemCount / pageSize)
  const pageCount = Math.max(1, total)
  const page = Math.min(integer(values.page ?? 1, 1, "page"), pageCount)
  const pageSlot = integer(values.pageSlot ?? 9, 5, "pageSlot")
  if (pageSlot > 31) throw new RangeError("pageSlot must be <= 31.")
  for (const key of ["disabled", "simple"] as const) if (values[key] !== undefined && typeof values[key] !== "boolean") throw new TypeError(`${key} must be boolean.`)
  const startIndex = itemCount === null ? null : (page - 1) * pageSize
  const endIndex = itemCount === null ? null : startIndex! + Math.min(pageSize, itemCount - startIndex!) - 1
  return { page, pageSize, pageCount, itemCount, startIndex, endIndex, empty: total === 0,
    pageSlot, disabled: values.disabled ?? false, simple: values.simple ?? false }
}
export interface PaginationItem { key: string; page: number; gap: boolean }
export function pageWindow(state: PaginationState): PaginationItem[] {
  const { page, pageCount: count, pageSlot: slots } = state
  const items: PaginationItem[] = []
  const add = (value: number, key = String(value), gap = false) => items.push({ key, page: value, gap })
  if (count <= slots) {
    for (let value = 1; value <= count; value++) add(value)
  } else {
    const width = slots - 4
    let start = Math.max(2, Math.min(page - Math.floor(width / 2), count - width))
    let end = start + width - 1
    if (start === 2) end = slots - 2
    if (end === count - 1) start = count - slots + 3
    add(1)
    if (start > 2) add(start - 1, start === 3 ? "2" : "backward", start > 3)
    for (let value = start; value <= end; value++) add(value)
    if (end < count - 1) add(end + 1, end === count - 2 ? String(count - 1) : "forward", end < count - 2)
    add(count)
  }
  return items
}
