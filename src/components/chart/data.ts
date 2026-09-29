export type ChartValue = string | number | null
export type ChartSource = ChartValue[][] | Record<string, ChartValue>[] | Record<string, ChartValue[]>
export const maxChartRows = 10_000
export const maxChartColumns = 64

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(value))
}

function values(value: unknown): void {
  if (value === null || typeof value === "string" || typeof value === "number" && Number.isFinite(value)) return
  throw new TypeError("Chart cells must be strings, finite numbers or null.")
}

function keys(value: object): string[] {
  if (Object.getOwnPropertySymbols(value).length || Array.isArray(value) && Object.getPrototypeOf(value) !== Array.prototype) {
    throw new TypeError("Chart data requires plain records and arrays without symbols.")
  }
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (["__proto__", "prototype", "constructor"].includes(key) || descriptor.get || descriptor.set
      || Array.isArray(value) && key !== "length" && !/^(0|[1-9]\d*)$/.test(key)) {
      throw new TypeError("Unsafe chart data member.")
    }
  }
  return Object.keys(value)
}

/** Validate supported ECharts dataset forms before exposing them to the renderer. */
export function validateSource(source: unknown): asserts source is ChartSource {
  let rows = 0, columns = 0
  if (Array.isArray(source)) {
    rows = source.length
    if (rows > maxChartRows) throw new RangeError("Chart dataset exceeds 10000 rows.")
    keys(source)
    const arrays = !rows || Array.isArray(source[0])
    const names = new Set<string>()
    let width: number | undefined
    for (const row of source) {
      if (arrays) {
        if (!Array.isArray(row)) throw new TypeError("Chart dataset row types must agree.")
        keys(row)
        width ??= row.length
        if (row.length !== width) throw new TypeError("Chart array rows must have equal widths.")
        columns = width
        if (columns > maxChartColumns) throw new RangeError("Chart dataset exceeds 64 columns.")
        for (const cell of row) values(cell)
      } else {
        if (!record(row)) throw new TypeError("Chart rows must be plain records.")
        for (const name of keys(row)) { names.add(name); values(row[name]) }
        columns = names.size
        if (columns > maxChartColumns) throw new RangeError("Chart dataset exceeds 64 columns.")
      }
    }
  } else {
    if (!record(source)) throw new TypeError("Chart source must be rows or a column-oriented record.")
    const names = keys(source)
    columns = names.length
    if (columns > maxChartColumns) throw new RangeError("Chart dataset exceeds 64 columns.")
    let length: number | undefined
    for (const name of names) {
      const column = source[name]
      if (!Array.isArray(column)) throw new TypeError("Chart columns must be arrays.")
      keys(column)
      length ??= column.length
      if (column.length !== length) throw new TypeError("Chart columns must have equal lengths.")
      rows = length
      if (rows > maxChartRows) throw new RangeError("Chart dataset exceeds 10000 rows.")
      for (const cell of column) values(cell)
    }
  }
}

export function validateDimensions(value: unknown): asserts value is string[] | null {
  if (value === null) return
  if (!Array.isArray(value) || value.length > maxChartColumns) throw new TypeError("Dimensions must be unique nonempty names.")
  keys(value)
  if ([...value].some(name => typeof name !== "string" || !name.trim() || ["__proto__", "prototype", "constructor"].includes(name))
    || new Set(value).size !== value.length) throw new TypeError("Dimensions must be unique nonempty names.")
}

export function chartTable(source: ChartSource, dimensions: string[] | null, header: boolean | "auto"): { columns: string[]; rows: ChartValue[][] } {
  if (!Array.isArray(source)) {
    const columns = dimensions ?? Object.keys(source)
    return { columns, rows: Array.from({ length: source[Object.keys(source)[0] ?? ""]?.length ?? 0 }, (_, i) => columns.map(name => source[name]?.[i] ?? null)) }
  }
  if (!source.length) return { columns: dimensions ?? [], rows: [] }
  if (!Array.isArray(source[0])) {
    const columns = dimensions ?? [...new Set((source as Record<string, ChartValue>[]).flatMap(row => Object.keys(row)))]
    return { columns, rows: (source as Record<string, ChartValue>[]).map(row => columns.map(name => Object.hasOwn(row, name) ? row[name] ?? null : null)) }
  }
  const rows = source as ChartValue[][]
  const hasHeader = header === true || header === "auto" && rows[0]!.every(value => typeof value === "string")
  const columns = dimensions ?? (hasHeader ? rows[0]!.map(String) : rows[0]!.map((_, index) => `Column ${index + 1}`))
  return { columns, rows: hasHeader ? rows.slice(1) : rows }
}
