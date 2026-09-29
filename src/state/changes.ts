import type { MStore } from "./index.js"

const listeners = new WeakMap<MStore, Set<() => void>>()

/** Internal whole-store observation for live keyed routes, not a public empty path. */
export function observeChanges(store: MStore, listener: () => void): () => void {
  let entries = listeners.get(store)
  if (!entries) listeners.set(store, entries = new Set())
  entries.add(listener)
  return () => {
    entries.delete(listener)
    if (!entries.size) listeners.delete(store)
  }
}

export function changed(store: MStore): void {
  const entries = listeners.get(store)
  for (const listener of [...entries ?? []]) if (entries?.has(listener)) listener()
}
