export const maximumMeasures = 16
export type ProgressGradient = { stops: readonly [string, string] }
export type ProgressPaint = string | ProgressGradient
export type ProgressColor = ProgressPaint | readonly ProgressPaint[]

export function dataValue(raw: string | null): unknown {
  if (raw === null) return undefined
  if (raw.length > 8192) return null
  if (!/^[\[{]/.test(raw.trim())) return raw
  try { return JSON.parse(raw) } catch { return null }
}

export function numberValue(raw: string | null, fallback?: number): number | undefined {
  if (raw === null) return fallback
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(raw.trim())) return undefined
  const number = Number(raw)
  return Number.isFinite(number) ? number : undefined
}

export function percentages(raw: string | null): number | number[] | null | undefined {
  if (raw === null) return undefined
  const value = dataValue(raw)
  if (typeof value === "string") return numberValue(value) ?? null
  return Array.isArray(value) && value.length <= maximumMeasures
    && value.every((item) => typeof item === "number" && Number.isFinite(item)) ? value : null
}

export function cssValue(document: Document, property: string, raw: string | null, numericPixels = false): string | null | undefined {
  if (raw === null) return undefined
  let value = raw.trim()
  if (!value || /^(inherit|initial|unset|revert|revert-layer)$/i.test(value)) return null
  if (numericPixels) {
    const number = numberValue(value)
    if (number !== undefined) {
      if (number < 0) return null
      value = `${number}px`
    }
  }
  if (property === "border-radius" && !radiusValue(document, value)) return null
  const style = document.createElement("span").style
  style.setProperty(property, value)
  return style.getPropertyValue(property) || null
}

function radiusValue(document: Document, value: string): boolean {
  const groups: string[][] = [[]]
  let depth = 0, token = ""
  const flush = () => { if (token) { groups[groups.length - 1]!.push(token); token = "" } }
  for (const character of value) {
    if (character === "(") depth++
    if (character === ")" && --depth < 0) return false
    if (depth === 0 && (/\s/.test(character) || character === "/")) {
      flush()
      if (character === "/") groups.push([])
    } else token += character
  }
  flush()
  if (depth !== 0 || groups.length > 2) return false
  return groups.every((group) => group.length >= 1 && group.length <= 4 && group.every((part) => {
    if (/^[a-z-]+$/i.test(part)) return false
    const style = document.createElement("span").style
    style.width = part
    return Boolean(style.width)
  }))
}

export function paints(document: Document, raw: string | null, gradients: boolean): ProgressPaint[] | null | undefined {
  if (raw === null) return undefined
  const value = dataValue(raw)
  const entries: unknown[] = Array.isArray(value) ? value : [value]
  if (entries.length > maximumMeasures) return null
  const result: ProgressPaint[] = []
  for (const item of entries) {
    if (typeof item === "string") {
      const color = cssValue(document, "color", item)
      if (!color) return null
      result.push(color)
    } else if (gradients && item !== null && typeof item === "object"
      && Object.keys(item).every((key) => key === "stops")
      && "stops" in item && Array.isArray(item.stops) && item.stops.length === 2) {
      const stops = item.stops.map((stop: unknown) => typeof stop === "string" ? cssValue(document, "color", stop) : null)
      if (!stops[0] || !stops[1]) return null
      result.push({ stops: [stops[0], stops[1]] })
    } else return null
  }
  return result
}

export function serialize(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value)
}
