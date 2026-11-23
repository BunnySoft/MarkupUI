export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
export type JsonObject = { [key: string]: Json }
const unsafe = new Set(["__proto__", "prototype", "constructor"])

export function fail(message: string): never { throw new TypeError(`A2UI: ${message}`) }

/** Snapshot framed input without invoking accessors or accepting non-JSON values. */
export function snapshot(value: unknown): Json {
  let count = 0
  let characters = 0
  function copy(input: unknown, depth: number): Json {
    if (++count > 10_000 || depth > 32) fail("message exceeds the node/depth limit.")
    if (typeof input === "string") {
      characters += input.length
      if (characters > 65_536) fail("message exceeds the string limit.")
      return input
    }
    if (input === null || typeof input === "boolean" || typeof input === "number" && Number.isFinite(input)) return input
    if (typeof input !== "object" || input === null) fail("expected finite JSON data.")
    const array = Array.isArray(input)
    if (![array ? Array.prototype : Object.prototype, null].includes(Object.getPrototypeOf(input))) fail("expected plain JSON data.")
    const output: JsonObject = {}
    const descriptors = Object.getOwnPropertyDescriptors(input)
    for (const key of Reflect.ownKeys(descriptors)) {
      if (typeof key !== "string" || unsafe.has(key)) fail("unsafe data member.")
      const descriptor = descriptors[key]!
      if (descriptor.get || descriptor.set || !descriptor.enumerable && !(array && key === "length")) fail("expected JSON data properties.")
      if (array && key === "length") continue
      if (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= input.length)) fail("expected JSON array indices.")
      characters += key.length
      if (characters > 65_536) fail("message exceeds the string limit.")
      output[key] = copy(descriptor.value, depth + 1)
    }
    if (!array) return output
    if (input.length !== Object.keys(output).length) fail("sparse arrays are unsupported.")
    return Object.values(output)
  }
  return copy(value, 0)
}

export function object(value: Json | undefined): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail("expected an object.")
  return value
}

export function keys(value: JsonObject, allowed: readonly string[], required: readonly string[] = []): void {
  if (Object.keys(value).some(key => !allowed.includes(key)) || required.some(key => !Object.hasOwn(value, key))) {
    fail(`expected only ${allowed.join(", ")}; required ${required.join(", ")}.`)
  }
}

export function identifier(value: Json | undefined): string {
  if (typeof value !== "string" || !value.trim() || value.length > 128) fail("expected a nonempty identifier of at most 128 characters.")
  return value
}

export function choice<const T extends readonly string[]>(value: Json | undefined, values: T, fallback: T[number]): T[number] {
  if (value === undefined) return fallback
  if (typeof value !== "string" || !values.includes(value)) fail(`expected one of ${values.join(", ")}.`)
  return value
}

export function pointer(value: Json | undefined): string[] {
  if (value === undefined || value === "" || value === "/") return []
  if (typeof value !== "string" || !value.startsWith("/") || /~(?![01])/u.test(value)) fail("expected an absolute JSON Pointer.")
  const parts = value.slice(1).split("/").map(part => part.replaceAll("~1", "/").replaceAll("~0", "~"))
  if (parts.length > 32 || parts.some(part => unsafe.has(part))) fail("unsafe or excessive data path.")
  return parts
}

function arrayIndex(part: string, length: number): number {
  if (!/^(0|[1-9]\d*)$/.test(part) || Number(part) > length) fail("array path must address an existing item or the next index.")
  return Number(part)
}

export function read(model: Json, path: string): Json | undefined {
  let value: Json | undefined = model
  for (const part of pointer(path)) {
    if (Array.isArray(value)) value = /^(0|[1-9]\d*)$/.test(part) ? value[Number(part)] : undefined
    else value = value !== null && typeof value === "object" && Object.hasOwn(value, part) ? value[part] : undefined
  }
  return value
}

export function update(model: Json, path: Json | undefined, value: Json): Json {
  const parts = pointer(path)
  if (!parts.length) return value === null ? {} : snapshot(value)
  const result = snapshot(model)
  let parent = result
  for (const [index, part] of parts.entries()) {
    if (parent === null || typeof parent !== "object") fail("data path crosses a scalar.")
    const last = index === parts.length - 1
    if (Array.isArray(parent)) {
      const position = arrayIndex(part, parent.length)
      if (last) {
        if (value === null) parent.splice(position, 1)
        else parent[position] = value
      } else {
        if (position === parent.length) parent.push({})
        parent = parent[position]!
      }
    } else if (last) {
      if (value === null) delete parent[part]
      else parent[part] = value
    } else {
      if (!Object.hasOwn(parent, part)) parent[part] = {}
      parent = parent[part]!
    }
  }
  return snapshot(result)
}

export type Binding = { "@path": string }
export function binding(value: JsonObject): Binding {
  keys(value, ["@path"], ["@path"])
  if (typeof value["@path"] !== "string") fail("binding @path must be a string.")
  pointer(value["@path"])
  return { "@path": value["@path"] }
}

export function resolve(value: Json, model: Json): Json | undefined {
  if (value !== null && typeof value === "object" && !Array.isArray(value) && Object.hasOwn(value, "@path")) {
    return read(model, binding(value)["@path"])
  }
  return value
}
