import type { MStore } from "./index.js"
import { bindingData } from "./data.js"
import { pathParts } from "./path.js"

export type ItemKey = string | number

interface ItemContext {
  owner: BindingScope
  collectionPath: string
  keyPath: string
  key: ItemKey
}

interface ResolvedPath {
  value: unknown
  parts: string[] | null
}

function plainObject(value: unknown): asserts value is Record<string, unknown> {
  if (typeof value !== "object" || value === null
    || ![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError("Scope paths require plain data objects.")
  }
}

function ownData(value: unknown, parts: readonly string[]): unknown {
  for (const part of parts) {
    if (typeof value !== "object" || value === null) return undefined
    plainObject(value)
    const descriptor = Object.getOwnPropertyDescriptor(value, part)
    if (!descriptor) return undefined
    if (!("value" in descriptor)) throw new TypeError("Scope paths cannot invoke accessors.")
    value = descriptor.value
  }
  return value
}

function itemKey(value: unknown): asserts value is ItemKey {
  if (!(typeof value === "string" && value.length > 0) && !(typeof value === "number" && Number.isSafeInteger(value))) {
    throw new TypeError("Item keys require nonempty strings or safe integers.")
  }
}

/** Prepare the entire collection before a renderer changes any instances. */
export function keyedItems(value: unknown, keyPath: string): Map<ItemKey, { item: unknown; index: number }> {
  const parts = pathParts(keyPath)
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype || value.length > 1000) {
    throw new TypeError("Repeated bindings require plain arrays of at most 1000 items.")
  }
  bindingData(value)
  const result = new Map<ItemKey, { item: unknown; index: number }>()
  for (let index = 0; index < value.length; index++) {
    if (!Object.hasOwn(value, index)) throw new TypeError("Repeated bindings require dense arrays.")
    const item: unknown = value[index]
    const key = ownData(item, parts)
    itemKey(key)
    if (result.has(key)) throw new TypeError("Repeated bindings require unique keys.")
    result.set(key, { item, index })
  }
  return result
}

function overlaps(a: readonly string[], b: readonly string[]): boolean {
  return a.slice(0, Math.min(a.length, b.length)).every((part, index) => part === b[index])
}

function writable(state: unknown, parts: readonly string[]): void {
  let target = state
  for (let index = 0; index < parts.length; index++) {
    plainObject(target)
    const part = parts[index]!
    const descriptor = Object.getOwnPropertyDescriptor(target, part)
    if (descriptor && !("value" in descriptor)) throw new TypeError("Scope paths cannot invoke accessors.")
    if (index === parts.length - 1 || descriptor?.value === undefined) {
      if (Array.isArray(target) && part === "length") throw new TypeError("Array length is read-only in scope models; replace the collection.")
      if (descriptor ? !descriptor.writable : !Object.isExtensible(target)) throw new TypeError("Scope path is not writable.")
      if (Array.isArray(target) && /^(?:0|[1-9]\d*)$/.test(part) && Number(part) < 0xffffffff && Number(part) >= target.length
        && !Object.getOwnPropertyDescriptor(target, "length")!.writable) throw new TypeError("Scope array cannot grow.")
      return
    }
    target = descriptor.value
  }
}

/**
 * Internal template data context. No DOM ownership, subscriptions or public entry export.
 * Item contexts retain routes and keys, never insertion-time indices or record copies.
 */
export class BindingScope {
  private parent: BindingScope | undefined
  private item: ItemContext | undefined
  private inTemplate = false
  private disposed = false
  private readonly preparation: { collections?: Map<unknown, Map<string, ReturnType<typeof keyedItems>>> | undefined }

  public constructor(private readonly store: MStore, preparation: BindingScope["preparation"] = {}) {
    this.preparation = preparation
  }

  /** Cache validation only during a synchronous, read-only render preparation. */
  public prepare<T>(read: () => T): T {
    const previous = this.preparation.collections
    this.preparation.collections = new Map()
    try { return read() } finally { this.preparation.collections = previous }
  }

  public template(): BindingScope {
    this.active()
    const scope = new BindingScope(this.store, this.preparation)
    scope.parent = this
    scope.item = this.item
    scope.inTemplate = true
    return scope
  }

  public each(collectionPath: string, keyPath: string, key: ItemKey): BindingScope {
    this.active()
    pathParts(collectionPath)
    pathParts(keyPath)
    itemKey(key)
    const scope = this.template()
    scope.item = { owner: this, collectionPath, keyPath, key }
    scope.current(scope.item)
    return scope
  }

  public read(path: string): unknown {
    const { value } = this.resolve(path)
    bindingData(value)
    return value
  }

  /** Event reads must validate every enclosing key, even for a root-only argument. */
  public readCurrent(path: string): unknown {
    return this.prepare(() => {
      this.active()
      for (let context = this.item; context; context = context.owner.item) this.current(context)
      return this.read(path)
    })
  }

  public collection(path: string, keyPath: string): Map<ItemKey, { item: unknown; index: number }> {
    return this.keys(this.resolve(path).value, keyPath)
  }

  public write(path: string, value: unknown): void {
    // Events/setters must never write through a render-time validation cache.
    const previous = this.preparation.collections
    this.preparation.collections = undefined
    try { this.writeCurrent(path, value) } finally { this.preparation.collections = previous }
  }

  private writeCurrent(path: string, value: unknown): void {
    const { parts } = this.resolve(path)
    if (!parts?.length) throw new TypeError("Scope context is read-only.")
    // Protect identity even when the model uses an explicit root/parent alias.
    for (let context = this.item; context; context = context.owner.item) {
      const current = this.current(context)
      if (overlaps(parts, [...current.parts, ...pathParts(context.keyPath)])) {
        throw new TypeError("Model writes cannot change an item key or its ancestors.")
      }
    }
    bindingData(value)
    writable(this.store.state, parts)
    this.store.set(parts.join("."), value)
  }

  public dispose(): void {
    this.disposed = true
  }

  private active(): void {
    if (this.disposed) throw new Error("Binding scope is disposed.")
    this.parent?.active()
  }

  private current(context: ItemContext): { value: unknown; index: number; parts: string[] } {
    const collection = context.owner.resolve(context.collectionPath)
    if (!collection.parts?.length) throw new TypeError("Item collections require an explicit store route.")
    const entry = this.keys(collection.value, context.keyPath).get(context.key)
    if (!entry) throw new TypeError("Item key no longer exists in its collection.")
    return { value: entry.item, index: entry.index, parts: [...collection.parts, String(entry.index)] }
  }

  private keys(value: unknown, path: string): ReturnType<typeof keyedItems> {
    const cache = this.preparation.collections
    if (!cache) return keyedItems(value, path)
    let paths = cache.get(value)
    if (!paths) cache.set(value, paths = new Map())
    let result = paths.get(path)
    if (!result) paths.set(path, result = keyedItems(value, path))
    return result
  }

  private resolve(path: string): ResolvedPath {
    this.active()
    const parts = pathParts(path)
    const prefix = parts[0]
    if (this.inTemplate && ["$item", "$parent", "$index", "$key"].includes(prefix!)) {
      const context = prefix === "$parent" ? this.item?.owner.item : this.item
      if (!context) throw new TypeError(`Unavailable scope context: ${prefix}`)
      const current = this.current(context)
      if (prefix === "$index" || prefix === "$key") {
        if (parts.length !== 1) throw new TypeError("Index and key contexts do not have child paths.")
        return { value: prefix === "$index" ? current.index : context.key, parts: null }
      }
      const tail = parts.slice(1)
      return { value: ownData(current.value, tail), parts: [...current.parts, ...tail] }
    }
    const route = this.inTemplate && prefix === "$root" ? parts.slice(1) : parts
    return { value: ownData(this.store.state, route), parts: route }
  }
}
