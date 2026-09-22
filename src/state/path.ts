/** Data paths only: no expressions, inherited members or prototype mutation. */
export function pathParts(path: string): string[] {
  if (typeof path !== "string" || !/^[A-Za-z_$][\w$]*(?:\.(?:[A-Za-z_$][\w$]*|0|[1-9]\d*))*$/.test(path)) {
    throw new TypeError("Expected a nonempty dot-separated data path.")
  }
  const parts = path.split(".")
  if (parts.some(part => ["__proto__", "prototype", "constructor"].includes(part))) {
    throw new TypeError("Unsafe data path.")
  }
  return parts
}

export function readPath(value: unknown, path: string): unknown {
  for (const part of pathParts(path)) {
    if (typeof value !== "object" || value === null || !Object.hasOwn(value, part)) return undefined
    value = (value as Record<string, unknown>)[part]
  }
  return value
}
