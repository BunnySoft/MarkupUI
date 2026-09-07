export type StateValue = unknown
export type StateSubscriber = (value: StateValue, path: string) => void

function pathParts(path: string): string[] {
  return path.split(".").map((part) => part.trim()).filter(Boolean)
}

export class MuiStore {
  private readonly subscribers = new Map<string, Set<StateSubscriber>>()

  public constructor(public readonly state: Record<string, StateValue> = {}) {}

  public get(path: string): StateValue {
    let value: StateValue = this.state
    for (const part of pathParts(path)) {
      if (typeof value !== "object" || value === null) return undefined
      value = (value as Record<string, StateValue>)[part]
    }
    return value
  }

  public set(path: string, value: StateValue): void {
    const parts = pathParts(path)
    if (parts.length === 0) throw new Error("State path is required.")
    let target = this.state
    for (const part of parts.slice(0, -1)) {
      const current = target[part]
      if (typeof current !== "object" || current === null || Array.isArray(current)) {
        target[part] = {}
      }
      target = target[part] as Record<string, StateValue>
    }
    target[parts[parts.length - 1]!] = value
    this.notify(path)
  }

  public subscribe(path: string, subscriber: StateSubscriber): () => void {
    const values = this.subscribers.get(path) ?? new Set<StateSubscriber>()
    values.add(subscriber)
    this.subscribers.set(path, values)
    return () => {
      values.delete(subscriber)
      if (values.size === 0) this.subscribers.delete(path)
    }
  }

  private notify(path: string): void {
    for (const [subscribedPath, subscribers] of this.subscribers) {
      if (
        subscribedPath === path
        || subscribedPath.startsWith(`${path}.`)
        || path.startsWith(`${subscribedPath}.`)
      ) {
        const value = this.get(subscribedPath)
        subscribers.forEach((subscriber) => subscriber(value, subscribedPath))
      }
    }
  }
}

export function createStore(state: Record<string, StateValue> = {}): MuiStore {
  return new MuiStore(state)
}

function assignValue(element: Element, property: string, value: StateValue): void {
  if (property === "text") {
    element.textContent = value === null || value === undefined ? "" : String(value)
    return
  }
  if (property === "visible") {
    ;(element as HTMLElement).hidden = !value
    return
  }
  if (property === "disabled") {
    Reflect.set(element, "disabled", Boolean(value))
    element.toggleAttribute("disabled", Boolean(value))
    return
  }
  Reflect.set(element, property, value)
}

export function bind(root: ParentNode, store: MuiStore): () => void {
  const disposers: Array<() => void> = []
  const elements = [
    ...(root instanceof Element ? [root] : []),
    ...root.querySelectorAll("*"),
  ]
  for (const element of elements) {
    const bindings: Array<readonly [string, string]> = []
    const twoWayPath = element.getAttribute("mui-bind")
    const twoWayProperty = element.getAttribute("mui-bind-property")
      ?? (element.matches("mui-checkbox,mui-switch,mui-radio") ? "checked" : "value")
    if (twoWayPath) bindings.push([twoWayProperty, twoWayPath])
    for (const property of ["text", "visible", "disabled"]) {
      const path = element.getAttribute(`mui-${property}`)
      if (path) bindings.push([property, path])
    }
    for (const [property, path] of bindings) {
      const update = (value: StateValue) => assignValue(element, property, value)
      update(store.get(path))
      disposers.push(store.subscribe(path, update))
    }
    if (twoWayPath) {
      const listener = (event: Event) => {
        if (event.target !== element) return
        const detail = (event as CustomEvent).detail
        const value = detail !== undefined ? detail : Reflect.get(element, twoWayProperty)
        store.set(twoWayPath, value)
      }
      element.addEventListener("mui:input", listener)
      element.addEventListener("mui:change", listener)
      disposers.push(() => {
        element.removeEventListener("mui:input", listener)
        element.removeEventListener("mui:change", listener)
      })
    }
  }
  return () => disposers.splice(0).forEach((dispose) => dispose())
}
