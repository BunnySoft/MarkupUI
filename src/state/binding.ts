import type { MStore } from "./index.js"
import { pathParts } from "./path.js"

export interface Binding {
  /** Dispose subscriptions/listeners without undoing application state or DOM. */
  (): void
  /** Discover added/removed nodes or changed directives under this explicit root. */
  refresh(): void
}

const roots = new WeakSet<Node>()
const booleanAttributes = new Set(["hidden", "disabled", "checked", "selected", "multiple", "readonly", "required"])
const nativeProperties = new Set(["hidden", "title", "id", "lang", "dir", "value", "checked", "disabled", "readOnly", "required", "selected", "multiple"])
const camel = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
const equal = (a: unknown, b: unknown) => Object.is(a, b) || Array.isArray(a) && Array.isArray(b)
  && a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

function data(value: unknown, seen = new Set<object>()): void {
  if (value == null || typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value)) return
  if (typeof value !== "object" || ![Object.prototype, Array.prototype, null].includes(Object.getPrototypeOf(value))) {
    throw new TypeError("Bindings require plain data values.")
  }
  if (seen.has(value)) throw new TypeError("Bindings do not accept circular data.")
  seen.add(value)
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (["__proto__", "prototype", "constructor"].includes(key) || descriptor.get || descriptor.set) throw new TypeError("Unsafe data member.")
    data(descriptor.value, seen)
  }
  seen.delete(value)
}

function scalar(value: unknown): string {
  if (value == null) return ""
  if (!["string", "number", "boolean"].includes(typeof value) || typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Text and attribute bindings require finite scalar data.")
  }
  return String(value)
}

interface Directive {
  path: string
  update(value: unknown): void
  model?: { property: string; events: string[]; native: boolean }
}

function directives(element: Element): Directive[] {
  const result: Directive[] = []
  const destinations = new Set<string>()
  for (const { name, value: path } of element.attributes) {
    if (name === "data-model-event" || name === "data-model-target") continue
    const model = name.startsWith("data-model-")
    if (!model && !name.startsWith("data-bind-")) continue
    pathParts(path)
    let property = name.slice(model ? 11 : 10)
    let destination = property
    let update: Directive["update"]
    if (!model && property === "text") {
      if (element.matches("script,style,iframe,object")) throw new TypeError("Unsafe text binding target.")
      destination = "textContent"
      update = value => {
        const text = scalar(value)
        if (element.textContent !== text) element.textContent = text
      }
      if ([...element.querySelectorAll("*")].some(child => [...child.attributes].some(attr => /^(data-bind-|data-model-)/.test(attr.name)))) {
        throw new TypeError("Text binding cannot own a bound subtree.")
      }
    } else if (!model && property.startsWith("attr-")) {
      const attribute = property.slice(5)
      if (!/^(?:aria-[a-z-]+|data-(?!bind-|model-)[a-z][a-z0-9-]*|id|title|role|lang|dir)$/.test(attribute) && !booleanAttributes.has(attribute)) {
        throw new TypeError(`Unsafe or unsupported attribute binding: ${attribute}`)
      }
      destination = camel(attribute)
      update = value => {
        if (booleanAttributes.has(attribute)) {
          if (value != null && typeof value !== "boolean") throw new TypeError("Presence attributes require Boolean values.")
          if (element.hasAttribute(attribute) !== !!value) element.toggleAttribute(attribute, !!value)
        } else if (value == null) {
          if (element.hasAttribute(attribute)) element.removeAttribute(attribute)
        } else {
          const text = scalar(value)
          if (element.getAttribute(attribute) !== text) element.setAttribute(attribute, text)
        }
      }
    } else {
      // The reserved text channel has one explicit escape for a logical `text` property.
      if (property === "prop-text") property = "text"
      else if (!/^[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)*$/.test(property)) throw new TypeError("Invalid binding property.")
      property = camel(property)
      destination = property
      const target = element as unknown as Record<string, unknown>
      if (["__proto__", "prototype", "constructor"].includes(property) || property.startsWith("on")
        || !(property in element) || typeof target[property] === "function"
        || (property in HTMLElement.prototype || !element.localName.includes("-")) && !nativeProperties.has(property)) {
        throw new TypeError(`Unsafe or unknown binding property: ${property}`)
      }
      update = value => {
        data(value)
        if (!element.localName.includes("-") && typeof value !== typeof target[property]) throw new TypeError("Native property binding requires a matching scalar type.")
        if (!equal(target[property], value)) target[property] = value
      }
    }
    if (destinations.has(destination)) throw new TypeError(`Conflicting binding ownership: ${destination}`)
    destinations.add(destination)
    const directive: Directive = { path, update }
    if (model) {
      const events = element.getAttribute("data-model-event")?.trim().split(/\s+/)
      const owner = element.getAttribute("data-model-target") ?? "host"
      if (!events?.length || events.some(event => !/^[a-z][\w:-]*$/.test(event)) || !["host", "native"].includes(owner)) {
        throw new TypeError("Models require explicit data-model-event and host/native target.")
      }
      if (owner === "native" && (!("native" in element) || !(element.native instanceof Element))) {
        throw new TypeError("Model native owner is unavailable.")
      }
      directive.model = { property, events: [...new Set(events)], native: owner === "native" }
    }
    result.push(directive)
  }
  return result
}

/** Bind direct properties to an explicitly supplied store. No global lookup or tag inference. */
export function bind(root: ParentNode, store: MStore): Binding {
  if (!(root instanceof Node)) throw new TypeError("Binding root must be a DOM node.")
  for (let node: Node | null = root; node; node = node.parentNode) {
    if (roots.has(node)) throw new TypeError("Binding roots cannot overlap.")
  }
  const records = new Map<Element, { signature: string; stop(): void }>()
  let disposed = false
  const stop = (() => {
    if (disposed) return
    disposed = true
    roots.delete(root)
    records.forEach(record => record.stop())
    records.clear()
  }) as Binding
  stop.refresh = () => {
    if (disposed) throw new Error("Binding is disposed.")
    const elements = [...(root instanceof Element ? [root] : []), ...root.querySelectorAll("*")]
    if (elements.some(element => element !== root && roots.has(element))) throw new TypeError("Binding roots cannot overlap.")
    const present = new Set(elements)
    const planned: Array<{ element: Element; signature: string; entries: Directive[] }> = []
    for (const element of elements) {
      if (element.hasAttribute("data-if") || element.hasAttribute("data-each")) throw new TypeError("Structural binding is not implemented.")
      const signature = JSON.stringify([...element.attributes].filter(attr => /^(data-bind-|data-model-)/.test(attr.name))
        .map(attr => [attr.name, attr.value]))
      if (signature === records.get(element)?.signature) continue
      const entries = directives(element)
      if (entries.length || records.has(element)) planned.push({ element, signature, entries })
    }
    for (const [element, record] of records) if (!present.has(element)) { record.stop(); records.delete(element) }
    for (const { element, signature, entries } of planned) {
      records.get(element)?.stop()
      records.delete(element)
      const cleanup: Array<() => void> = []
      let writing = false
      try {
        for (const { path, update, model } of entries) {
          const apply = (value: unknown) => {
            writing = true
            try { update(value) } finally { writing = false }
          }
          apply(store.get(path))
          cleanup.push(store.subscribe(path, apply))
          if (model) {
            const target = element as unknown as Record<string, unknown>
            const listener = (event: Event) => {
              if (!writing && event.target === (model.native ? target.native : element)) store.set(path, target[model.property])
            }
            model.events.forEach(event => element.addEventListener(event, listener))
            cleanup.push(() => model.events.forEach(event => element.removeEventListener(event, listener)))
          }
        }
        if (entries.length) records.set(element, { signature, stop: () => cleanup.splice(0).forEach(dispose => dispose()) })
      } catch (error) {
        cleanup.forEach(dispose => dispose())
        throw error
      }
    }
  }
  roots.add(root)
  try { stop.refresh() } catch (error) { stop(); throw error }
  return stop
}
