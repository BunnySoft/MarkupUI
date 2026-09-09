import { createDynamicInput } from "../dynamic-input/index.js"
import type { DynamicInputContext, DynamicInputController, DynamicInputRow } from "../dynamic-input/index.js"

export interface DynamicTag extends DynamicInputRow { readonly control: HTMLInputElement }
export type DynamicTagsRejection = "empty" | "duplicate" | "max" | "invalid" | "composing" | "unavailable" | "stale"
export type DynamicTagsCommitResult = { readonly status: "added"; readonly tag: DynamicTag }
  | { readonly status: "rejected"; readonly reason: DynamicTagsRejection }
export interface DynamicTagsOptions {
  max?: number
  duplicates?: "allow" | "reject"
  create?: (draft: string) => string
  connect?: (row: HTMLElement, context: DynamicInputContext) => void
}
export interface DynamicTagsController {
  readonly editor: HTMLInputElement
  readonly connected: boolean
  readonly error: unknown
  readonly tags: readonly DynamicTag[]
  readonly values: readonly string[]
  readonly max: number
  commit(): DynamicTagsCommitResult
  remove(key: string): boolean
  setMax(max: number): void
  refresh(): void
  disconnect(): void
}
class Rejection extends Error {
  constructor(readonly reason: DynamicTagsRejection, message: string) { super(message) }
}
const owner = Symbol.for("markup-ui.dynamic-tags.owner")
type Owned = Element & { [owner]?: DynamicTagsController }
interface Intent {
  value: string
  revision: number
  form: HTMLFormElement | null
  active: Element | null
  key?: string
  created?: string
}

/** Adds only draft policy/editor coordination; Dynamic Input owns row creation, removal and cleanup. */
export function createDynamicTags(root: HTMLElement, options: DynamicTagsOptions = {}): DynamicTagsController {
  const document = root?.ownerDocument, view = document?.defaultView
  if (!view || !(root instanceof view.HTMLElement) || !root.matches("[data-dynamic-tags][data-dynamic-input]")) throw new TypeError("Dynamic Tags needs an authored tags/collection root.")
  if (!options || typeof options !== "object" || Array.isArray(options)
    || Object.keys(options).some(key => !["max", "duplicates", "create", "connect"].includes(key))
    || options.max !== undefined && (!Number.isInteger(options.max) || options.max < 1 || options.max > 100)
    || options.duplicates !== undefined && !["allow", "reject"].includes(options.duplicates)
    || options.create !== undefined && typeof options.create !== "function"
    || options.connect !== undefined && typeof options.connect !== "function") throw new TypeError("Use max 1-100, an explicit duplicate policy and synchronous create/connect callbacks.")
  const duplicates = options.duplicates ?? "allow", create = options.create, connect = options.connect
  const own = (node: Element) => node.closest("[data-dynamic-input]") === root
  function one(selector: string, required = true) {
    const matches = [...root.querySelectorAll<HTMLElement>(selector)].filter(own)
    if (matches.length > 1 || required && matches.length !== 1) throw new TypeError(`Author ${required ? "one" : "at most one"} owned ${selector}.`)
    return matches[0] ?? null
  }
  const field = one("[data-tags-editor]"), entry = one("[data-tags-entry]")!, add = one("[data-dynamic-add]")
  const container = one("[data-dynamic-rows]")!, templateNode = one("[data-dynamic-template]"), status = one("[data-tags-status]", false)
  if (!(field instanceof view.HTMLInputElement) || !(add instanceof view.HTMLButtonElement) || !(templateNode instanceof view.HTMLTemplateElement)
    || !entry.contains(field) || !entry.contains(add) || entry.contains(container) || !entry.hidden) throw new TypeError("Keep a labelled editor/add entry hidden before enhancement and separate from rows/template.")
  const editor = field, addButton = add, template = templateNode, maxLength = editor.maxLength
  const controls = new WeakMap<HTMLElement, HTMLInputElement>(), descriptors = new WeakMap<HTMLElement, DynamicTag>()
  const nodes = [root, editor, entry, ...(status ? [status] : [])]
  for (const node of nodes) if ((node as Owned)[owner]) throw new Error("Dynamic Tags node already has an owner.")
  function nativeRows() { return [...container.children] as HTMLElement[] }
  function tagControl(row: HTMLElement, prototype = false) {
    const ownRow = (node: Element) => node.closest("[data-dynamic-row]") === row
      && node.closest("[data-dynamic-input]") === row.closest("[data-dynamic-input]")
    const values = [...row.querySelectorAll<HTMLElement>("[data-tags-value]")].filter(ownRow)
    const control = values[0]
    if (values.length !== 1 || !(control instanceof view!.HTMLInputElement) || control.type !== "text" || !control.readOnly || !control.name
      || row.matches("input, button, select, textarea, label, a[href], summary") || row.hasAttribute("role") || row.hasAttribute("tabindex")
      || row.closest("label, button, a[href], summary") || control.hasAttribute("hidden") || control.hasAttribute("role")
      || [...row.querySelectorAll("input, select, textarea")].filter(ownRow).length !== 1
      || [...row.querySelectorAll("[data-dynamic-action]")].filter(ownRow).some(node => node.getAttribute("data-dynamic-action") !== "remove")) {
      throw new TypeError("Each tag needs one visible readonly named text field and optional sibling remove button, not an interactive chip root or proxy fields.")
    }
    for (let node: HTMLElement | null = control; node; node = node === row ? null : node.parentElement) {
      const style = view!.getComputedStyle(node)
      if (node.hidden || node.getAttribute("aria-hidden") === "true" || style.display === "none" || style.visibility === "hidden") {
        throw new TypeError("Committed tags must use visible readonly fields, not hidden value proxies.")
      }
    }
    if (controls.has(row) && controls.get(row) !== control) throw new TypeError("Keep the original tag value control.")
    if (!prototype) controls.set(row, control)
    return control
  }
  function valuePolicy(value: unknown): asserts value is string {
    if (typeof value !== "string") throw new TypeError("Dynamic Tags values and create results must be strings, not objects or numbers.")
    if (!value.trim()) throw new Rejection("empty", "Enter a nonblank tag; the draft was kept.")
    if (value.length > maxLength || /[\r\n]/.test(value)) throw new Rejection("invalid", `Tags must be single-line strings of at most ${maxLength} UTF-16 code units; the draft was kept.`)
  }
  function anatomy() {
    if (!root.isConnected || root.getRootNode() !== document || !root.matches("[data-dynamic-tags][data-dynamic-input]")
      || [editor, entry, container, template, addButton].some(node => !root.contains(node) || !own(node))
      || !entry.contains(editor) || !entry.contains(addButton) || editor.type !== "text" || editor.hasAttribute("name")
      || editor.maxLength !== maxLength || maxLength < 1 || maxLength > 2048
      || editor.hasAttribute("role") || editor.hasAttribute("autofocus")
      || one("[data-tags-editor]") !== editor || one("[data-tags-entry]") !== entry || one("[data-tags-status]", false) !== status
      || status && (status.children.length || !["span", "p", "div"].includes(status.localName) || status.isContentEditable
        || status.hasAttribute("tabindex") || status.hasAttribute("role") || status.hasAttribute("aria-live")
        || status.closest('label, button, a[href], [aria-live]:not([aria-live="off" i]), [role~="alert" i], [role~="status" i], [role~="log" i]'))) {
      throw new TypeError("Keep the original unnamed text editor with maxlength 1-2048, native labels and optional plain nonlive status.")
    }
    if (template.content.children.length !== 1) throw new TypeError("Author one tag row in the native template.")
    tagControl(template.content.firstElementChild as HTMLElement, true)
    const seen = new Set<string>()
    for (const row of nativeRows()) {
      const value = tagControl(row).value
      valuePolicy(value)
      if (duplicates === "reject" && seen.has(value)) throw new TypeError("Current tags violate the exact-string duplicate policy.")
      seen.add(value)
    }
  }
  anatomy()
  let alive = true, working = false, closing = false, revision = 0, composing = false, fenced = false, composition = 0
  let collection: DynamicInputController | null = null, pending: Intent | null = null, error: unknown = null
  let reset: { event: Event; revision: number; composition: number } | null = null
  const tasks = new Set<number>(), removers: (() => void)[] = []
  let entryBefore = entry.getAttribute("hidden"), entryLast: string | null = entryBefore
  let text: { before: string; last: string } | null = null, state: { before: string | null; last: string | null } | null = null
  function present(message: string, value: string) {
    if (!status || !alive) return
    const current = status.textContent ?? "", attribute = status.getAttribute("data-tags-state")
    if (!text) text = { before: current, last: current }
    if (!state) state = { before: attribute, last: attribute }
    if (current !== text.last) text.before = current
    if (attribute !== state.last) state.before = attribute
    status.textContent = message; text.last = message
    status.setAttribute("data-tags-state", value); state.last = value
  }
  function restoreStatus() {
    if (text && status?.textContent === text.last) status.textContent = text.before
    if (state && status?.getAttribute("data-tags-state") === state.last) {
      if (state.before === null) status.removeAttribute("data-tags-state")
      else status.setAttribute("data-tags-state", state.before)
    }
    text = state = null
  }
  function report(reason: unknown, committed: boolean) {
    error = reason
    present(committed ? "The tag action committed, but resource cleanup failed." : "Tag creation failed; the draft was kept.", "error")
    root.dispatchEvent(new view!.CustomEvent("mui:dynamic-tags-error", { detail: { error: reason, committed } }))
  }
  function reject(reason: DynamicTagsRejection, message: string): DynamicTagsCommitResult {
    error = null
    present(message, "rejected")
    root.dispatchEvent(new view!.CustomEvent("mui:dynamic-tags-reject", { detail: Object.freeze({ reason, message }) }))
    return Object.freeze({ status: "rejected", reason })
  }
  function available() {
    if (editor.matches(":disabled") || editor.readOnly || editor.closest("[hidden], [inert]")) return false
    for (let node: HTMLElement | null = editor; node; node = node.parentElement) {
      const style = view!.getComputedStyle(node)
      if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") return false
    }
    return true
  }
  function snapshot(): Intent { return { value: editor.value, revision, form: editor.form, active: document!.activeElement } }
  function settleReset() {
    const previous = reset
    if (!previous || previous.event.eventPhase !== 0) return
    reset = null
    if (previous.event.defaultPrevented) return
    if (composition === previous.composition) { composing = false; fenced = false }
    if (revision === previous.revision) { revision++; restoreStatus() }
  }
  function check(intent: Intent) {
    settleReset()
    if (composing || fenced) throw new Rejection("composing", "Finish composing before adding a tag; the draft was kept.")
    if (!available()) throw new Rejection("unavailable", "The tag editor is unavailable; the draft was kept.")
    if (intent.revision !== revision || intent.value !== editor.value || intent.form !== editor.form) throw new Rejection("stale", "The draft changed; confirm the current text again.")
    if (!editor.validity.valid) throw new Rejection("invalid", editor.validationMessage || "The draft is invalid.")
    valuePolicy(intent.value)
  }
  function descriptor(row: DynamicInputRow): DynamicTag {
    let result = descriptors.get(row.element)
    if (!result) { result = Object.freeze({ ...row, control: tagControl(row.element) }); descriptors.set(row.element, result) }
    return result
  }
  function notify(type: "add" | "remove", row: DynamicInputRow) {
    const tag = descriptor(row)
    root.dispatchEvent(new view!.CustomEvent("mui:dynamic-tags-change", { detail: Object.freeze({
      type, tag, tags: api.tags, values: api.values,
    }) }))
  }
  function ready() {
    if (working || closing) throw new Error("Do not reenter Dynamic Tags during a creation/resource transaction.")
    if (!alive || !collection?.connected) throw new Error("Dynamic Tags is disconnected.")
    anatomy(); collection.refresh()
    if (!alive || !collection.connected) throw new Error("Dynamic Tags was disconnected during refresh.")
  }
  function commitIntent(intent: Intent): DynamicTagsCommitResult {
    ready()
    try {
      check(intent)
      if (collection!.rows.length >= collection!.max) return reject("max", "Maximum tag count reached; the draft was kept.")
    } catch (reason) {
      if (reason instanceof Rejection) return reject(reason.reason, reason.message)
      throw reason
    }
    pending = intent; working = true
    let row: DynamicInputRow | null
    try {
      if (intent.active === addButton && document!.activeElement === addButton && available()) editor.focus({ preventScroll: true })
      check(intent)
      row = collection!.add()
    }
    catch (reason) {
      if (reason instanceof Rejection) return reject(reason.reason, reason.message)
      if (error !== reason) report(reason, false)
      throw reason
    } finally { pending = null; working = false }
    if (!row) return reject("max", "Maximum tag count reached; the draft was kept.")
    settleReset()
    if (alive && intent.revision === revision && editor.value === intent.value && editor.form === intent.form) {
      editor.value = ""; revision++
    }
    error = null; present("Tag added. The draft editor remains available.", "added")
    notify("add", row)
    if (alive && collection!.connected && intent.active === addButton && document!.activeElement === addButton && available()) editor.focus({ preventScroll: true })
    return Object.freeze({ status: "added", tag: descriptor(row) })
  }
  function commit() { settleReset(); return commitIntent(snapshot()) }
  function listen(node: EventTarget, type: string, handler: EventListener, capture = false) {
    node.addEventListener(type, handler, capture); removers.push(() => node.removeEventListener(type, handler, capture))
  }
  function later(callback: () => void) {
    const id = view!.setTimeout(() => { tasks.delete(id); if (alive) callback() }, 0); tasks.add(id)
  }
  function request(event: Event) {
    if (event.defaultPrevented) return
    // Tags owns commit intent; the reused collection's delegated add sees this cancellation.
    event.preventDefault()
    if (!alive || !collection) return
    settleReset()
    if (event instanceof view!.KeyboardEvent && (event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey)) return
    const intent = snapshot()
    if (composing || fenced || event instanceof view!.KeyboardEvent && event.isComposing) { reject("composing", "Finish composing before adding a tag; the draft was kept."); return }
    later(() => {
      if (intent.revision !== revision) return
      try { commitIntent(intent) } catch (reason) { if (error !== reason) report(reason, false) }
    })
  }
  listen(addButton, "click", request)
  listen(editor, "keydown", event => {
    const keyboard = event as KeyboardEvent
    if (keyboard.key === "Enter") request(event)
    else if (keyboard.key === "Escape" && !keyboard.defaultPrevented && !keyboard.isComposing && !composing) {
      keyboard.preventDefault(); revision++; restoreStatus()
    }
  })
  listen(editor, "input", () => { settleReset(); revision++; restoreStatus() })
  listen(editor, "change", () => { settleReset(); revision++; restoreStatus() })
  listen(editor, "compositionstart", () => { settleReset(); composition++; composing = true; revision++ })
  listen(editor, "compositionend", () => {
    settleReset()
    composing = false; fenced = true; revision++
    const version = ++composition
    later(() => { if (composition === version) fenced = false })
  })
  listen(document!, "reset", event => {
    if (event.target !== editor.form) return
    settleReset()
    const previous = { event, revision, composition }; reset = previous
    view!.queueMicrotask(() => {
      if (!alive || reset !== previous) return
      settleReset()
      if (!event.defaultPrevented) try { anatomy() } catch (reason) {
        try { disconnect() } catch (cleanup) { reason = new AggregateError([reason, cleanup], "Reset revealed invalid tags and cleanup failed.") }
        report(reason, false)
      }
    })
  }, true)
  listen(root, "mui:dynamic-input-error", event => {
    if (event.target !== root) return
    const detail = (event as CustomEvent<{ error: unknown; committed: boolean }>).detail
    if (!(detail.error instanceof Rejection)) report(detail.error, detail.committed)
  })
  listen(root, "mui:dynamic-input-change", event => {
    if (event.target !== root) return
    const detail = (event as CustomEvent<{ type: string; row: DynamicInputRow }>).detail
    if (detail.type === "remove") {
      revision++; present("Tag removed. Remaining native values were retained.", "removed"); notify("remove", detail.row)
    }
  })
  const observer = new view.MutationObserver(records => {
    for (const record of records) if (record.target === entry && record.attributeName === "hidden") entryBefore = entry.getAttribute("hidden")
    try { anatomy(); if (collection && !collection.connected) disconnect() }
    catch (reason) { try { disconnect() } catch (cleanup) { reason = new AggregateError([reason, cleanup], "Tags validation and cleanup failed.") }; report(reason, false) }
  })
  function refresh() {
    if (working) throw new Error("Do not refresh during a tag creation/resource transaction.")
    if (!alive) return
    settleReset()
    revision++
    try { ready(); restoreStatus(); error = null }
    catch (reason) {
      try { disconnect() } catch (cleanup) { reason = new AggregateError([reason, cleanup], "Tags refresh and cleanup failed.") }
      report(reason, false); throw reason
    }
  }
  function disconnect() {
    if (!alive || closing) return
    if (working) throw new Error("Do not disconnect during a tag creation/resource transaction.")
    closing = true
    let failed = false, failure: unknown
    try { collection?.disconnect() } catch (reason) {
      if (collection?.connected) { closing = false; throw reason }
      failed = true; failure = reason
    }
    alive = false; revision++; reset = null; observer.disconnect()
    removers.splice(0).forEach(remove => remove()); tasks.forEach(id => view!.clearTimeout(id)); tasks.clear()
    try {
      restoreStatus()
      if (entry.getAttribute("hidden") === entryLast) {
        if (entryBefore === null) entry.removeAttribute("hidden")
        else entry.setAttribute("hidden", entryBefore)
      }
      for (const node of nodes) if ((node as Owned)[owner] === api) delete (node as Owned)[owner]
    } finally { closing = false }
    if (failed) throw failure
  }
  const api: DynamicTagsController = {
    editor, get connected() { return alive && !!collection?.connected }, get error() { return error },
    get tags() { return Object.freeze((collection?.rows ?? []).map(descriptor)) },
    get values() { return Object.freeze(api.tags.map(tag => tag.control.value)) },
    get max() { return collection?.max ?? options.max ?? 20 },
    commit, remove(key) { ready(); return collection!.remove(key) }, setMax(max) { ready(); collection!.setBounds(0, max); revision++ },
    refresh, disconnect,
  }
  try {
    for (const node of nodes) Object.defineProperty(node, owner, { value: api, configurable: true })
    collection = createDynamicInput(root, {
      max: options.max ?? 20,
      initialize(row, context) {
        const intent = pending
        if (!intent) throw new Error("Create tags through explicit editor commit, not raw collection insertion.")
        check(intent)
        const result: unknown = create ? create(intent.value) : intent.value
        if (result && typeof (result as PromiseLike<unknown>).then === "function") void Promise.resolve(result).catch(reason => report(reason, false))
        valuePolicy(result); check(intent)
        if (duplicates === "reject" && nativeRows().some(row => tagControl(row).value === result)) throw new Rejection("duplicate", "That exact tag already exists; the draft was kept.")
        const control = tagControl(row)
        control.defaultValue = result; control.value = result
        intent.key = context.key; intent.created = result
      },
      connect(row, context) {
        const control = tagControl(row)
        descriptor({ key: context.key, element: row })
        const result = connect?.(row, context)
        anatomy()
        if (pending?.key === context.key) {
          check(pending)
          if (control !== tagControl(row) || control.value !== pending.created || control.defaultValue !== pending.created) throw new Error("Connect resources without replacing or changing the committed tag value/default.")
        }
        return result
      },
    })
    entry.removeAttribute("hidden"); entryLast = null
    observer.observe(document!, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "readonly", "type", "name", "maxlength",
      "value", "form", "role", "aria-live", "tabindex", "contenteditable", "data-tags-editor", "data-tags-entry", "data-tags-value", "data-tags-status", "data-dynamic-tags"] })
  } catch (reason) {
    try { disconnect() } catch (cleanup) { throw new AggregateError([reason, cleanup], "Dynamic Tags initialization and cleanup failed.") }
    throw reason
  }
  return api
}
