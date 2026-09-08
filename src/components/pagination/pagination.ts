import { ownedWrites } from "../popover/position.js"
import { integer, paginationState, pageWindow } from "./model.js"
import type { PaginationState, PaginationValues, PaginationItem } from "./model.js"

export interface PaginationOptions extends PaginationValues {
  defaultPage?: number
  defaultPageSize?: number
}
export type PaginationSource = "page" | "previous" | "next" | "gap" | "size" | "jump"
export interface PaginationChange { state: PaginationState; previous: PaginationState; source: PaginationSource }
export interface PaginationController {
  readonly connected: boolean
  readonly state: PaginationState
  page: number
  pageSize: number
  set(values: PaginationValues): void
  refresh(): void
  connect(): void
  disconnect(): void
}
type Control = HTMLButtonElement | HTMLSelectElement | HTMLInputElement
interface PageNode { item: PaginationItem; button: HTMLButtonElement; number: HTMLElement }
const owners = new WeakMap<HTMLElement, PaginationController>()
const valueKeys = ["page", "pageSize", "pageCount", "itemCount", "pageSlot", "disabled", "simple"]

export function createPagination(nav: HTMLElement, options: PaginationOptions = {}): PaginationController {
  const document = nav?.ownerDocument, view = document?.defaultView
  if (!view || !(nav instanceof view.HTMLElement) || !nav.matches("nav.mui-pagination[data-pagination]")) throw new TypeError("Pagination needs an authored nav.mui-pagination[data-pagination].")
  function check(values: PaginationOptions, defaults = false) {
    if (!values || typeof values !== "object" || Array.isArray(values)) throw new TypeError("Pagination values must be an object.")
    for (const [key, value] of Object.entries(values)) {
      if (!valueKeys.includes(key) && !(defaults && ["defaultPage", "defaultPageSize"].includes(key))) throw new TypeError(`Unsupported Pagination option: ${key}.`)
      if (value === undefined || value === null && !["pageCount", "itemCount"].includes(key)) throw new TypeError(`Invalid ${key}.`)
      if (key.startsWith("default")) integer(value, 1, key)
    }
  }
  check(options, true)
  const own = (node: Element) => node.closest("[data-pagination]") === nav
  const find = (selector: string) => [...nav.querySelectorAll<HTMLElement>(selector)].filter(own)
  function one<T extends HTMLElement>(selector: string, required = false): T | null {
    const nodes = find(selector)
    if (nodes.length > 1 || required && !nodes.length) throw new TypeError(`Pagination needs ${required ? "one" : "at most one"} ${selector}.`)
    return nodes[0] as T ?? null
  }
  function named(node: HTMLElement) {
    const ids = node.getAttribute("aria-labelledby")?.trim().split(/\s+/)
    return ids?.length ? ids.every(id => document!.getElementById(id)?.textContent?.trim())
      : !!(node.getAttribute("aria-label")?.trim() || [...(node as HTMLInputElement).labels ?? []].some(label => label.textContent?.trim())
        || [...node.childNodes].some(child => child.nodeType === 3 ? child.textContent?.trim()
          : child instanceof view!.HTMLElement && !child.hidden && child.getAttribute("aria-hidden") !== "true" && child.localName !== "template" && child.textContent?.trim()))
  }
  function button(node: HTMLElement) {
    if (!(node instanceof view!.HTMLButtonElement) || node.getAttribute("type")?.toLowerCase() !== "button"
      || node.hasAttribute("popovertarget") || node.hasAttribute("commandfor") || node.hasAttribute("role")
      || node.getAttribute("aria-hidden") === "true"
      || node.querySelector("a, button, input, select, textarea, summary, [tabindex], [contenteditable], [role]")
      || node.parentElement?.closest("a[href], button, summary, label") || !named(node)) throw new TypeError("Author named type=button controls without nested interaction or other commands.")
  }
  function template(selector: string) {
    const node = one<HTMLTemplateElement>(selector, true)!
    if (!(node instanceof view!.HTMLTemplateElement) || node.content.children.length !== 1) throw new TypeError("Pagination templates need one native button.")
    const sample = node.content.firstElementChild as HTMLElement
    button(sample)
    if (sample.hasAttribute("tabindex") || sample.matches("[id], [disabled], [hidden], [inert]")
      || sample.querySelector("[id], [name], template") || sample.querySelectorAll("[data-pagination-number]").length !== 1) {
      throw new TypeError("Page templates need one number span, no IDs, names, hidden or disabled state.")
    }
    const number = sample.querySelector("[data-pagination-number]")!
    if (number.localName !== "span" || number.children.length) throw new TypeError("Page numbers need an authored text-only span.")
    return node
  }
  let region: HTMLElement, pageTemplate: HTMLTemplateElement, gapTemplate: HTMLTemplateElement
  let previous: HTMLButtonElement, next: HTMLButtonElement
  let size: HTMLSelectElement | null, jump: HTMLInputElement | null, go: HTMLButtonElement | null
  let count: HTMLElement | null, fallback: HTMLElement | null
  let connected = false, generation = 0, lastFocus: HTMLElement | null = null
  let writes = ownedWrites()
  const nodes = new Map<string, PageNode>()
  const tasks = new Set<number>(), removers: (() => void)[] = []
  const disabled = new Map<Control, string | null>()
  const values = new Map<HTMLInputElement | HTMLSelectElement, { before: string; last: string }>()
  let countText = "", lastCount = ""
  let jumpRequired = false
  let config: PaginationValues = {}
  let state: PaginationState
  function mark(records: MutationRecord[]) {
    for (const record of records) if (disabled.has(record.target as Control)) disabled.set(record.target as Control, (record.target as Element).getAttribute("disabled"))
  }
  const observer = new view.MutationObserver(records => { mark(records) })
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() { for (const control of disabled.keys()) observer.observe(control, { attributes: true, attributeFilter: ["disabled"] }) }
  function disable(control: Control, condition: boolean) {
    const original = disabled.get(control)!
    const value = condition ? original ?? "" : original
    if (value === null) control.removeAttribute("disabled")
    else control.setAttribute("disabled", value)
  }
  function writeValue(control: HTMLInputElement | HTMLSelectElement, value: string) {
    if (!values.has(control)) values.set(control, { before: control.value, last: control.value })
    control.value = value
    values.get(control)!.last = control.value
  }
  function available(control: HTMLElement) {
    return control.isConnected && own(control) && !control.matches(":disabled")
      && !control.closest("[hidden], [inert]") && control.getAttribute("aria-disabled") !== "true"
  }
  function validate() {
    if (!nav.isConnected || nav.getRootNode() !== document || !nav.matches("nav.mui-pagination[data-pagination]")
      || ![null, "navigation"].includes(nav.getAttribute("role")) || !(nav.getAttribute("aria-label")?.trim()
        || nav.hasAttribute("aria-labelledby") && named(nav))) throw new TypeError("Keep Pagination connected and named with native navigation semantics.")
    for (const element of [region, pageTemplate, gapTemplate, previous, next, size, jump, go, count, fallback]) {
      if (element && (!nav.contains(element) || !own(element))) throw new TypeError("Pagination anatomy changed; call refresh to adopt replacements.")
    }
    for (const control of [previous, next, go]) if (control) button(control)
    if (size) {
      if (size.multiple || size.size > 1 || !named(size) || size.hasAttribute("role")) throw new TypeError("Use a labelled native single page-size select.")
      const seen = new Set<number>()
      for (const option of size.options) {
        if (!/^[1-9]\d*$/.test(option.value)) throw new TypeError("Page-size option values must be positive decimal integers.")
        const number = integer(Number(option.value), 1, "page-size option")
        if (seen.has(number)) throw new TypeError("Page-size options must be unique.")
        seen.add(number)
      }
      if (!seen.has(state.pageSize)) throw new RangeError("The page size must exist in the authored select.")
    }
    if (jump && (jump.type !== "number" || !named(jump) || jump.hasAttribute("role"))) throw new TypeError("Quick jump needs a labelled input[type=number].")
    if (state.simple && (!jump || !count)) throw new TypeError("Simple Pagination needs quick-jump input and count text.")
    for (const child of region.children) if (![...nodes.values()].some(node => node.button === child)) throw new TypeError("The generated page region is exclusively controller-owned.")
  }
  function focusLost(old: HTMLElement | null) {
    if (!old || !connected || document!.activeElement !== document!.body && document!.activeElement !== old) return
    if (old.isConnected && available(old) && !(region.contains(old) && state.simple)) {
      if (document!.activeElement !== old) old.focus({ preventScroll: true })
      return
    }
    const target = [...nodes.values()].find(node => !state.simple && node.item.page === state.page && !node.item.gap && available(node.button))?.button
      ?? [jump, size, previous, next].find(control => control && available(control))
    if (target) target.focus({ preventScroll: true })
    else {
      if (!nav.hasAttribute("tabindex")) writes.attr(nav, "tabindex", "-1")
      nav.focus({ preventScroll: true })
    }
  }
  function render(syncJump = false) {
    validate()
    const active = document!.activeElement as HTMLElement | null
    const focused = active && own(active) && (nav.contains(active) || active === nav) ? active
      : active === document!.body && lastFocus && !available(lastFocus) ? lastFocus : null
    pause()
    const items = pageWindow(state), keys = new Set(items.map(item => item.key))
    for (const [key, node] of nodes) if (!keys.has(key)) { node.button.remove(); nodes.delete(key) }
    for (const [index, item] of items.entries()) {
      let node = nodes.get(item.key)
      if (!node) {
        const control = (item.gap ? gapTemplate : pageTemplate).content.firstElementChild!.cloneNode(true) as HTMLButtonElement
        node = { item, button: control, number: control.querySelector("[data-pagination-number]")! }
        nodes.set(item.key, node)
      }
      node.item = item
      node.number.textContent = String(item.page)
      node.button.disabled = state.disabled || state.empty
      if (!item.gap && item.page === state.page) node.button.setAttribute("aria-current", "page")
      else node.button.removeAttribute("aria-current")
      if (region.children[index] !== node.button) region.insertBefore(node.button, region.children[index] ?? null)
    }
    writes.attr(region, "hidden", state.simple ? "" : null)
    writes.attr(nav, "data-pagination-disabled", state.disabled ? "" : null)
    writes.attr(nav, "data-pagination-simple", state.simple ? "" : null)
    if (fallback) writes.attr(fallback, "hidden", "")
    disable(previous, state.disabled || state.empty || state.page === 1)
    disable(next, state.disabled || state.empty || state.page === state.pageCount)
    if (size) { disable(size, state.disabled); writeValue(size, String(state.pageSize)) }
    if (jump) {
      disable(jump, state.disabled || state.empty)
      writes.attr(jump, "min", "1"); writes.attr(jump, "max", String(state.pageCount)); writes.attr(jump, "step", "1")
      if (syncJump || state.simple && document!.activeElement !== jump) writeValue(jump, state.simple ? String(state.page) : "")
    }
    if (go) disable(go, state.disabled || state.empty)
    if (count) { count.textContent = String(state.empty ? 0 : state.pageCount); lastCount = count.textContent }
    observe()
    focusLost(focused)
  }
  function clearTasks() { generation++; for (const task of tasks) view!.clearTimeout(task); tasks.clear() }
  function error(cause: unknown) { controller.disconnect(); nav.dispatchEvent(new view!.CustomEvent("mui:pagination-error", { detail: { error: cause } })) }
  function request(patch: PaginationValues, source: PaginationSource) {
    if (state.disabled || !connected) return false
    const proposed = paginationState({ ...config, ...patch }), before = { ...state }, version = generation
    if (proposed.page === state.page && proposed.pageSize === state.pageSize) return true
    const event = new view!.CustomEvent<PaginationChange>("mui:pagination-request", { cancelable: true,
      detail: { state: { ...proposed }, previous: before, source } })
    const allowed = nav.dispatchEvent(event)
    if (!connected || generation !== version) return false
    if (!allowed) return true
    controller.set(patch)
    if (connected && generation === version + 1) nav.dispatchEvent(new view!.CustomEvent<PaginationChange>("mui:pagination-change", { detail: { state: { ...state }, previous: before, source } }))
    return connected && generation === version + 1
  }
  function defer(event: Event, control: HTMLElement, callback: () => void, enter = false) {
    const version = generation
    const task = view!.setTimeout(() => {
      tasks.delete(task)
      if (!connected || generation !== version || !available(control) || event.defaultPrevented && !enter) return
      try { validate(); callback() } catch (cause) { error(cause) }
    }, 0)
    tasks.add(task)
  }
  function jumpToPage() {
    if (!jump || !available(jump)) return
    if (!jump.required) { writes.attr(jump, "required", ""); jumpRequired = true }
    if (!jump.reportValidity()) return
    const page = jump.valueAsNumber
    if (!Number.isSafeInteger(page) || page < 1 || page > state.pageCount) return
    clearJumpRequired()
    request({ page }, "jump")
  }
  function clearJumpRequired() {
    if (jumpRequired && jump?.getAttribute("required") === "") writes.attr(jump, "required", null)
    jumpRequired = false
  }
  function click(event: Event) {
    const mouse = event as MouseEvent, target = event.target as Element
    if (event.defaultPrevented || mouse.button !== 0 || mouse.ctrlKey || mouse.metaKey || mouse.shiftKey || mouse.altKey || !own(target)) return
    const control = target.closest("button")
    if (!control || !available(control)) return
    const generated = [...nodes.values()].find(node => node.button === control)
    const page = generated?.item.page ?? (control === previous ? state.page - 1 : state.page + 1)
    const source = generated ? generated.item.gap ? "gap" : "page" : control === previous ? "previous" : "next"
    if (generated || control === previous || control === next) defer(event, control, () => request({ page }, source))
    else if (control === go) defer(event, control, jumpToPage)
  }
  function change(event: Event) {
    if (event.target !== size || !size || !available(size)) return
    const draft = size.value
    defer(event, size, () => {
      if (size!.value !== draft) return
      if (request({ pageSize: Number(draft) }, "size") && connected && size) writeValue(size, String(state.pageSize))
    })
  }
  function key(event: Event) {
    const keyboard = event as KeyboardEvent
    if (event.target !== jump || keyboard.key !== "Enter" || event.defaultPrevented) return
    event.preventDefault()
    if (keyboard.isComposing || keyboard.ctrlKey || keyboard.metaKey || keyboard.altKey || keyboard.shiftKey) return
    if (jump && available(jump)) defer(event, jump, jumpToPage, true)
  }
  function release() {
    pause()
    for (const [control, original] of disabled) {
      if (original === null) control.removeAttribute("disabled")
      else control.setAttribute("disabled", original)
    }
    disabled.clear()
    for (const [control, value] of values) if (control.value === value.last) control.value = value.before
    values.clear()
    jumpRequired = false
    if (count && count.textContent === lastCount) count.textContent = countText
    for (const node of nodes.values()) node.button.remove()
    nodes.clear()
    writes.restore()
    writes = ownedWrites()
  }
  function adopt() {
    region = one("[data-pagination-pages]", true)!
    pageTemplate = template("template[data-pagination-page]")
    gapTemplate = template("template[data-pagination-gap]")
    previous = one("[data-pagination-previous]", true)!
    next = one("[data-pagination-next]", true)!
    size = one("[data-pagination-size]")
    jump = one("[data-pagination-jump]")
    go = one("[data-pagination-go]")
    count = one("[data-pagination-count]")
    fallback = one("[data-pagination-fallback]")
    if (size && !(size instanceof view!.HTMLSelectElement) || jump && !(jump instanceof view!.HTMLInputElement)
      || !!jump !== !!go || count && (count.children.length || count === region)
      || [previous, next, size, jump, go, count, fallback].some(node => node && (region.contains(node) || fallback?.contains(node) && node !== fallback))
      || region.localName !== "div" || region.children.length) throw new TypeError("Use a separate empty div page region, paired native jump/go controls and a text-only count.")
    for (const control of [previous, next, size, jump, go]) if (control) disabled.set(control, control.getAttribute("disabled"))
    if (count) { countText = count.textContent ?? ""; lastCount = countText }
  }
  const controller: PaginationController = {
    get connected() { return connected },
    get state() { return { ...state } },
    get page() { return state.page }, set page(page) { controller.set({ page }) },
    get pageSize() { return state.pageSize }, set pageSize(pageSize) { controller.set({ pageSize }) },
    set(patch) {
      check(patch)
      const candidate = { ...config, ...patch }, proposed = paginationState(candidate)
      if (size && ![...size.options].some(option => option.value === String(proposed.pageSize))) throw new RangeError("Page size must exist in the authored select.")
      if (proposed.simple && (!jump || !count)) throw new TypeError("Simple Pagination needs quick-jump input and count text.")
      clearTasks()
      config = { ...candidate, page: proposed.page, pageSize: proposed.pageSize }
      state = proposed
      if (connected) try { render() } catch (cause) { controller.disconnect(); throw cause }
    },
    refresh() {
      if (!connected) throw new Error("Connect Pagination before refreshing.")
      clearTasks()
      const focused = document!.activeElement as HTMLElement
      const restoreFocus = own(focused) && nav.contains(focused) || focused === document!.body && lastFocus && !available(lastFocus)
      try { release(); adopt(); render(); if (restoreFocus) focusLost(focused === document!.body ? lastFocus : focused) }
      catch (cause) { controller.disconnect(); throw cause }
    },
    connect() {
      if (connected) return
      if (owners.has(nav)) throw new Error("Pagination already has an active controller.")
      try {
        adopt()
        if (!state) {
          const { defaultPage, defaultPageSize, ...initial } = options
          config = { ...initial, page: options.page ?? defaultPage ?? 1, pageSize: options.pageSize ?? defaultPageSize ?? (size ? Number(size.value) : 10) }
          state = paginationState(config)
          config.page = state.page
        }
        owners.set(nav, controller); connected = true
        const listen = (target: EventTarget, type: string, handler: EventListener) => {
          target.addEventListener(type, handler); removers.push(() => target.removeEventListener(type, handler))
        }
        listen(nav, "click", click); listen(nav, "change", change); listen(nav, "keydown", key)
        listen(nav, "input", event => { if (event.target === jump) clearJumpRequired() })
        listen(nav, "focusout", event => { if (event.target === jump) clearJumpRequired() })
        listen(document!, "focusin", event => { const target = event.target as HTMLElement; lastFocus = own(target) ? target : null })
        render(true)
      } catch (cause) { controller.disconnect(); throw cause }
    },
    disconnect() {
      const current = document!.activeElement as HTMLElement | null
      const active = current === document!.body && lastFocus && !available(lastFocus) ? lastFocus : current
      const losingFocus = active && [...nodes.values()].some(node => node.button === active)
      connected = false; clearTasks()
      for (const remove of removers.splice(0)) remove()
      release()
      lastFocus = null
      if (owners.get(nav) === controller) owners.delete(nav)
      if (losingFocus && nav.isConnected && document!.activeElement === document!.body) {
        const target = fallback?.querySelector<HTMLElement>('a[href][aria-current="page"], a[href]')
          ?? [previous, next, size, jump].find(control => control && available(control))
        if (target && available(target)) target.focus({ preventScroll: true })
        else {
          const original = nav.getAttribute("tabindex")
          if (original === null) nav.setAttribute("tabindex", "-1")
          nav.focus({ preventScroll: true })
          if (original === null && nav.getAttribute("tabindex") === "-1" && !owners.has(nav)) nav.removeAttribute("tabindex")
        }
      }
    },
  }
  controller.connect()
  return controller
}
