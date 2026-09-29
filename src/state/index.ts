import { pathParts, readPath } from "./path.js"
import { changed } from "./changes.js"

export type StateValue = unknown
export type StateSubscriber = (value: StateValue, path: string) => void

export class MStore {
  private readonly subscribers = new Map<string, Set<StateSubscriber>>()

  public constructor(public readonly state: Record<string, StateValue> = {}) {}

  public get(path: string): StateValue {
    return readPath(this.state, path)
  }

  public set(path: string, value: StateValue): void {
    const parts = pathParts(path)
    if (parts.length === 0) throw new Error("State path is required.")
    let target = this.state
    for (const part of parts.slice(0, -1)) {
      const current = Object.hasOwn(target, part) ? target[part] : undefined
      if (current === undefined) target[part] = {}
      else if (typeof current !== "object" || current === null) throw new TypeError("State path crosses a non-object value.")
      target = target[part] as Record<string, StateValue>
    }
    target[parts[parts.length - 1]!] = value
    this.notify(path)
  }

  public subscribe(path: string, subscriber: StateSubscriber): () => void {
    pathParts(path)
    const values = this.subscribers.get(path) ?? new Set<StateSubscriber>()
    values.add(subscriber)
    this.subscribers.set(path, values)
    return () => {
      values.delete(subscriber)
      if (values.size === 0 && this.subscribers.get(path) === values) this.subscribers.delete(path)
    }
  }

  private notify(path: string): void {
    changed(this)
    // Snapshot before callbacks can add or replace subscriptions.
    const pending = [...this.subscribers].map(([key, entries]) => [key, entries, [...entries]] as const)
    for (const [subscribedPath, subscribers, callbacks] of pending) {
      if (
        subscribedPath === path
        || subscribedPath.startsWith(`${path}.`)
        || path.startsWith(`${subscribedPath}.`)
      ) {
        const value = this.get(subscribedPath)
        callbacks.forEach(subscriber => { if (subscribers.has(subscriber)) subscriber(value, subscribedPath) })
      }
    }
  }
}

export function createStore(state: Record<string, StateValue> = {}): MStore {
  return new MStore(state)
}

export { bind, type Binding, type BindingOptions } from "./binding.js"
