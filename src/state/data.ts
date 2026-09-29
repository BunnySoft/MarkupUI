export function bindingData(value: unknown, seen = new Set<object>()): void {
  if (value == null || typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) return
  if (typeof value !== "object" || ![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError("Bindings require plain data values.")
  }
  if (seen.has(value)) throw new TypeError("Bindings do not accept circular data.")
  seen.add(value)
  const descriptors = Object.getOwnPropertyDescriptors(value)
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== "string" || ["__proto__", "prototype", "constructor"].includes(key)) throw new TypeError("Unsafe data member.")
    const descriptor = descriptors[key]!
    if (descriptor.get || descriptor.set) throw new TypeError("Unsafe data member.")
    bindingData(descriptor.value, seen)
  }
  seen.delete(value)
}
