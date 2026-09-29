import type { MStore } from "./index.js"
import { pathParts } from "./path.js"
import { bindingData } from "./data.js"
import { TemplateTree, type BindingOptions } from "./templates.js"
import type { BindingScope } from "./scope.js"
import { observeChanges } from "./changes.js"
import { isIdBinding } from "./ids.js"

export type { BindingOptions } from "./templates.js"

export interface Binding {
  /** Dispose subscriptions/listeners without undoing application state or DOM. */
  (): void
  /** The explicit store shared with consumers such as named actions. */
  readonly store: MStore
  /** Read current scoped data for an element discovered by the last successful refresh. */
  read(element: Element, path: string): unknown
  /** Discover added/removed nodes or changed directives under this explicit root. */
  refresh(): void
}

const roots = new WeakSet<Node>()
const booleanAttributes = new Set(["hidden", "disabled", "checked", "selected", "multiple", "readonly", "required"])
const nativeProperties = new Set(["hidden", "title", "id", "lang", "dir", "value", "checked", "disabled", "readOnly", "required", "selected", "multiple"])
const camel = (name: string) => name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
const equal = (a: unknown, b: unknown) => Object.is(a, b) || Array.isArray(a) && Array.isArray(b)
  && a.length === b.length && a.every((value, index) => Object.is(value, b[index]))

function scalar(value: unknown): string {
  if (value == null) return ""
  if (!["string", "number", "boolean"].includes(typeof value) || typeof value === "number" && !Number.isFinite(value)) {
    throw new TypeError("Text and attribute bindings require finite scalar data.")
  }
  return String(value)
}

interface Directive {
  path: string
  relationship: boolean
  text: boolean
  validate(value: unknown): void
  update(value: unknown): void
  model?: { property: string; events: string[]; native: boolean }
}

function directives(element: Element, deferredNative = false): Directive[] {
  const result: Directive[] = []
  const destinations = new Set<string>()
  for (const { name, value: path } of element.attributes) {
    if (name === "data-model-event" || name === "data-model-target") continue
    const model = name.startsWith("data-model-")
    if (!model && !name.startsWith("data-bind-")) continue
    if (name === "data-model-id" || name === "data-model-html-for") {
      throw new TypeError("ID and label-reference models are not supported; use one-way bindings.")
    }
    pathParts(path)
    let property = name.slice(model ? 11 : 10)
    let destination = property
    let update: Directive["update"]
    let validate: Directive["validate"]
    if (!model && property === "text") {
      if (element.matches("script,style,iframe,object")) throw new TypeError("Unsafe text binding target.")
      destination = "textContent"
      validate = value => { scalar(value) }
      update = value => {
        const text = scalar(value)
        if (element.textContent !== text) element.textContent = text
      }
    } else if (!model && property.startsWith("attr-")) {
      const attribute = property.slice(5)
      if (!/^(?:aria-[a-z-]+|data-(?!bind-|model-|template$|if$|each(?:-key)?$)[a-z][a-z0-9-]*|id|for|title|role|lang|dir)$/.test(attribute) && !booleanAttributes.has(attribute)) {
        throw new TypeError(`Unsafe or unsupported attribute binding: ${attribute}`)
      }
      destination = attribute === "for" ? "htmlFor" : camel(attribute)
      if (attribute === "for" && !element.matches("label,m-label")) throw new TypeError("Bound for attributes require a label.")
      validate = value => {
        if (booleanAttributes.has(attribute)) {
          if (value != null && typeof value !== "boolean") throw new TypeError("Presence attributes require Boolean values.")
        } else scalar(value)
      }
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
        || (property in HTMLElement.prototype || !element.localName.includes("-")) && !nativeProperties.has(property)
          && !(property === "htmlFor" && element.localName === "label")) {
        throw new TypeError(`Unsafe or unknown binding property: ${property}`)
      }
      validate = value => {
        bindingData(value)
        if (!element.localName.includes("-") && typeof value !== typeof target[property]) throw new TypeError("Native property binding requires a matching scalar type.")
      }
      update = value => {
        validate(value)
        if (!equal(target[property], value)) target[property] = value
      }
    }
    if (destinations.has(destination)) throw new TypeError(`Conflicting binding ownership: ${destination}`)
    destinations.add(destination)
    const directive: Directive = { path, relationship: isIdBinding(name), text: name === "data-bind-text", validate, update }
    if (model) {
      const events = element.getAttribute("data-model-event")?.trim().split(/\s+/)
      const owner = element.getAttribute("data-model-target") ?? "host"
      if (!events?.length || events.some(event => !/^[a-z][\w:-]*$/.test(event)) || !["host", "native"].includes(owner)) {
        throw new TypeError("Models require explicit data-model-event and host/native target.")
      }
      if (owner === "native" && !deferredNative && (!("native" in element) || !(element.native instanceof Element))) {
        throw new TypeError("Model native owner is unavailable.")
      }
      directive.model = { property, events: [...new Set(events)], native: owner === "native" }
    }
    result.push(directive)
  }
  return result
}

/** Bind direct properties and declared structural sources to an explicit store. No global lookup. */
export function bind(root: ParentNode, store: MStore, options: BindingOptions = {}): Binding {
  if (!(root instanceof Node)) throw new TypeError("Binding root must be a DOM node.")
  for (let node: Node | null = root; node; node = node.parentNode) {
    if (roots.has(node)) throw new TypeError("Binding roots cannot overlap.")
  }
  interface BoundElement {
    signature: string
    scoped: boolean
    entries: Directive[]
    values: unknown[]
    apply(index: number, value: unknown): void
    activate(): void
    stop(): void
  }
  const records = new Map<Element, BoundElement>()
  const tree = new TemplateTree(root, store, options)
  let disposed = false
  let busy = false
  let pending = false
  const unobserve = observeChanges(store, () => {
    if (tree.active || busy) stop.refresh()
  })
  const stop = (() => {
    if (disposed) return
    disposed = true
    roots.delete(root)
    unobserve()
    records.forEach(record => record.stop())
    records.clear()
    tree.dispose()
  }) as Binding
  Object.defineProperty(stop, "store", { value: store })
  stop.read = (element, path) => {
    if (disposed) throw new Error("Binding is disposed.")
    if (busy) throw new Error("Binding data is unavailable during an update.")
    return tree.read(element, path)
  }
  const refresh = () => {
    if ([...root.querySelectorAll("*")].some(element => roots.has(element))) throw new TypeError("Binding roots cannot overlap.")
    const present = new Set<Element>()
    const planned: Array<{ element: Element; signature: string; entries: Directive[]; scope: BindingScope | undefined; values: unknown[] | undefined }> = []
    const commit = tree.prepare((element, scope) => {
      present.add(element)
      if (element !== root && roots.has(element)) throw new TypeError("Binding roots cannot overlap.")
      // Tree ownership can change without changing this element's cached scalar directives.
      if (element.hasAttribute("data-bind-text") && [...element.querySelectorAll("*")]
        .some(child => [...child.attributes].some(attr => /^(data-bind-|data-model-|data-if$|data-each$)/.test(attr.name)))) {
        throw new TypeError("Text binding cannot own a bound subtree.")
      }
      const signature = JSON.stringify([...element.attributes].filter(attr => /^(data-bind-|data-model-)/.test(attr.name))
        .map(attr => [attr.name, attr.value]))
      const record = records.get(element)
      if (signature === record?.signature && !scope && !record.scoped) return
      const entries = signature === record?.signature ? record.entries : directives(element, !!scope)
      const values = scope ? entries.map(entry => {
        const value = scope.read(entry.path)
        entry.validate(value)
        return value
      }) : undefined
      if (entries.length || record) planned.push({ element, signature, entries, scope, values })
      if (!values) return
      const text = entries.findIndex(entry => entry.text)
      const textValue = values[text]
      // Only a scheduled text write can remove a descendant from the next ID tree.
      return text >= 0 && (signature !== record?.signature || !equal(record.values[text], textValue))
        && element.textContent !== scalar(textValue)
    }, element => { directives(element, true) })
    const added: Element[] = []
    try {
      for (const { element, signature, entries, scope, values } of planned) {
        const previous = records.get(element)
        if (previous?.signature === signature && previous.scoped === !!scope && values) {
          values.forEach((value, index) => {
            if (entries[index]!.relationship || !equal(previous.values[index], value)) previous.apply(index, value)
          })
          continue
        }
        records.get(element)?.stop()
        records.delete(element)
        const cleanup: Array<() => void> = []
        let writing = false
        let ready = !scope
        const record: BoundElement = {
          signature, scoped: !!scope, entries, values: [],
          apply: (index, value) => {
            writing = true
            try {
              entries[index]!.update(value)
              record.values[index] = Array.isArray(value) ? [...value] : value
            } finally { writing = false }
          },
          stop: () => cleanup.splice(0).forEach(dispose => dispose()),
          activate: () => { ready = true },
        }
        try {
          for (const [index, { path, model }] of entries.entries()) {
            const value = values ? values[index] : store.get(path)
            if (previous?.signature === signature && !entries[index]!.relationship && equal(previous.values[index], value)) {
              record.values[index] = previous.values[index]
            } else record.apply(index, value)
            if (disposed) throw new Error("Binding was disposed during an update.")
            if (!scope) cleanup.push(store.subscribe(path, value => record.apply(index, value)))
            if (model) {
              const target = element as unknown as Record<string, unknown>
              const listener = (event: Event) => {
                if (ready && !writing && !disposed && tree.owns(element) && event.target === (model.native ? target.native : element)) {
                  if (scope) scope.write(path, target[model.property])
                  else store.set(path, target[model.property])
                }
              }
              model.events.forEach(event => element.addEventListener(event, listener))
              cleanup.push(() => model.events.forEach(event => element.removeEventListener(event, listener)))
            }
          }
          if (entries.length) { records.set(element, record); added.push(element) }
        } catch (error) {
          cleanup.forEach(dispose => dispose())
          throw error
        }
      }
      if (disposed) throw new Error("Binding was disposed during an update.")
      commit(() => {
        if (disposed) throw new Error("Binding was disposed during attachment.")
        for (const { element, entries, scope } of planned) {
          if (scope && entries.some(entry => entry.model?.native) && (!("native" in element) || !(element.native instanceof Element))) {
            throw new TypeError("Model native owner is unavailable after attachment.")
          }
        }
      })
      for (const element of added) records.get(element)?.activate()
      for (const [element, record] of records) if (!present.has(element)) { record.stop(); records.delete(element) }
    } catch (error) {
      for (const element of added) { records.get(element)?.stop(); records.delete(element) }
      throw error
    }
  }
  stop.refresh = () => {
    if (disposed) throw new Error("Binding is disposed.")
    if (busy) { pending = true; return }
    busy = true
    try {
      let passes = 0
      do {
        pending = false
        if (++passes > 100) throw new Error("Binding updates did not settle.")
        refresh()
      } while (pending && !disposed)
    } finally { busy = false; pending = false }
  }
  roots.add(root)
  try { stop.refresh() } catch (error) { stop(); throw error }
  return stop
}
