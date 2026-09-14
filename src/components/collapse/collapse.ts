import { ViewElement } from "../../core/index.js"
import { createCollapse, validateHeader } from "./controller.js"
import type { CollapseController } from "./controller.js"
import type { CollapseErrorDetail, CollapseExpandedChangedDetail, CollapseHeaderActivatedDetail } from "./model.js"

interface RenderedItem {
  details: HTMLDetailsElement
  summary: HTMLElement
  arrow: SVGSVGElement
}
const rendered = new WeakMap<CollapseItem, RenderedItem>()

function renderItem(item: CollapseItem): RenderedItem | undefined {
  let record = rendered.get(item)
  const regions = (tag: string) => [...item.querySelectorAll<HTMLElement>(tag)].filter(node =>
    node.closest("m-collapse-item") === item && (node.parentElement === item
      || node.parentElement === record?.summary || node.parentElement === record?.details))
  const headers = regions("m-collapse-header"), contents = regions("m-collapse-content"), extras = regions("m-collapse-header-extra")
  if (headers.length > 1 || contents.length > 1 || extras.length > 1) throw new TypeError("CollapseItem regions must be unique.")
  if (!headers.length || !contents.length || !item.key.trim()) return undefined
  const header = headers[0]!, content = contents[0]!
  validateHeader(header)
  if ([...item.children].some(child => child !== record?.details && child !== header && child !== content && child !== extras[0])) throw new TypeError("Author only named CollapseItem regions.")
  if (!record) {
    const details = item.ownerDocument.createElement("details"), summary = item.ownerDocument.createElement("summary")
    const arrow = item.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg")
    details.dataset.part = "disclosure"
    summary.dataset.part = "summary"
    arrow.dataset.part = "arrow"
    arrow.setAttribute("aria-hidden", "true")
    arrow.setAttribute("viewBox", "0 0 24 24")
    arrow.setAttribute("focusable", "false")
    const path = item.ownerDocument.createElementNS(arrow.namespaceURI, "path")
    path.setAttribute("d", "m9 6 6 6-6 6")
    path.setAttribute("fill", "none")
    path.setAttribute("stroke", "currentColor")
    path.setAttribute("stroke-width", "2")
    path.setAttribute("stroke-linecap", "round")
    path.setAttribute("stroke-linejoin", "round")
    arrow.append(path)
    summary.append(arrow)
    details.append(summary)
    record = { details, summary, arrow }
    rendered.set(item, record)
  }
  if (record.details.parentElement !== item || record.summary.parentElement !== record.details) {
    record.summary.replaceChildren(record.arrow, header)
    record.details.replaceChildren(record.summary, content)
    item.prepend(record.details)
  }
  if (header.parentElement !== record.summary) record.summary.append(header)
  if (record.arrow.parentElement !== record.summary) record.summary.prepend(record.arrow)
  if (content.parentElement !== record.details) record.details.append(content)
  if (extras[0] && extras[0].parentElement !== item) item.append(extras[0])
  return record
}

/**
 * A keyed, native disclosure group. Key collections are property-only.
 * @region {"name":"items","element":"m-collapse-item","accepts":["CollapseItem"],"min":0,"max":null}
 */
export class Collapse extends ViewElement {
  public static readonly tag = "m-collapse"
  public static readonly observedAttributes = ["accordion"]
  private controller: CollapseController | undefined
  private observer: MutationObserver | undefined
  private upgraded = false
  private initialized = false
  private pending: readonly string[] | undefined
  private defaults: readonly string[] = Object.freeze([])
  private retained: readonly string[] = Object.freeze([])
  private known = new Map<string, RenderedItem>()
  private phase: "disconnected" | "pending" | "ready" | "invalid" = "disconnected"

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "collapse"
    this.observer ??= new MutationObserver(records => {
      if (records.some(record => (record.target instanceof Element ? record.target : record.target.parentElement)?.closest("m-collapse") === this)) this.synchronize()
    })
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.retained = this.expandedKeys
    this.observer?.disconnect()
    this.controller?.disconnect()
    this.phase = "disconnected"
    this.removeAttribute("data-state")
  }

  public attributeChangedCallback(): void {
    if (this.controller?.connected) {
      this.controller.accordion = this.accordion
      this.updateItems()
    }
  }

  public get accordion(): boolean { return this.hasAttribute("accordion") }
  public set accordion(value: boolean) { this.setBooleanAttribute("accordion", value) }
  /** Current native expansion, or the pending/retained collection before connection. */
  public get expandedKeys(): readonly string[] {
    return this.controller?.connected ? Object.freeze([...(this.controller.expandedNames as readonly string[])])
      : this.pending ?? (this.initialized ? this.retained : this.defaults)
  }
  public set expandedKeys(value: readonly string[]) {
    const keys = this.checkKeys(value, this.controller?.connected ?? false)
    if (this.controller?.connected) {
      this.controller.expandedNames = keys
      this.updateItems()
    } else this.pending = keys
  }
  /** Initial expansion and explicit reset target; later writes do not expand items.
   * @default []
   */
  public get defaultExpandedKeys(): readonly string[] { return this.defaults }
  public set defaultExpandedKeys(value: readonly string[]) { this.defaults = this.checkKeys(value, this.controller?.connected ?? false) }
  public get items(): readonly CollapseItem[] {
    return Object.freeze([...this.children].filter((node): node is CollapseItem => node instanceof CollapseItem))
  }
  public get state(): "disconnected" | "pending" | "ready" | "invalid" { return this.phase }

  public expand(key: string): void {
    this.requireConnected()
    this.expandedKeys = this.accordion ? [key] : [...new Set([...this.expandedKeys, key])]
  }
  public collapse(key: string): void {
    this.requireConnected()
    this.checkKeys([key], true)
    this.expandedKeys = this.expandedKeys.filter(value => value !== key)
  }
  public toggle(key: string): void {
    this.requireConnected()
    if (this.expandedKeys.includes(key)) this.collapse(key)
    else this.expand(key)
  }
  public reset(): void {
    this.requireConnected()
    this.expandedKeys = this.defaults
  }
  public refresh(): void {
    if (!this.isConnected) throw new Error("Connect Collapse before refreshing.")
    this.synchronize(true)
  }

  private requireConnected(): void {
    if (!this.controller?.connected) throw new Error("Connect a valid Collapse before requesting expansion.")
  }
  private checkKeys(value: readonly string[], known: boolean): readonly string[] {
    if (!Array.isArray(value) || value.some(key => typeof key !== "string" || !key.trim()) || new Set(value).size !== value.length) throw new TypeError("Expanded keys must be a unique nonempty string array.")
    if (this.accordion && value.length > 1) throw new RangeError("Accordion allows only one expanded key.")
    if (known) for (const key of value) if (!this.items.some(item => item.key === key)) throw new RangeError(`Unknown Collapse item: ${key}.`)
    return Object.freeze([...value])
  }
  private updateItems(): void {
    this.retained = this.expandedKeys
    for (const item of this.items) item.dataset.state = `${item.expanded ? "expanded" : "collapsed"}${item.disabled ? " disabled" : ""}`
  }
  private fail(error: unknown): void {
    this.phase = "invalid"
    this.dataset.state = "invalid"
    this.emit<CollapseErrorDetail>("m:error", { error })
  }
  private synchronize(strict = false): void {
    if (!this.isConnected) return
    this.observer?.disconnect()
    try {
      if ([...this.querySelectorAll("m-collapse-item")].some(item => item.closest("m-collapse") === this && item.parentElement !== this)) throw new TypeError("Nested items need their own Collapse group.")
      const next = new Map<string, RenderedItem>()
      for (const child of this.children) {
        if (!(child instanceof CollapseItem)) throw new TypeError("Collapse children must be CollapseItem elements.")
        const record = renderItem(child)
        if (!record) {
          this.retained = this.expandedKeys
          this.phase = "pending"
          this.dataset.state = "pending"
          if (strict) throw new TypeError("Each item needs a key, header and content.")
          return
        }
        if (next.has(child.key)) throw new TypeError("Collapse item keys must be unique.")
        const previous = this.known.get(child.key)
        if (previous && previous !== record) record.details.open = previous.details.open
        next.set(child.key, record)
      }
      const initial = this.pending ?? (!this.initialized ? this.defaults : undefined)
      if (initial) this.checkKeys(initial, true)
      if (this.controller?.connected) this.controller.refresh()
      else this.controller = createCollapse(this, {
        accordion: this.accordion,
        onHeader: detail => {
          this.emit<CollapseHeaderActivatedDetail>("m:header-activated", {
            key: detail.name, expanded: detail.expanded, item: detail.item.parentElement as CollapseItem, originalEvent: detail.event,
          })
        },
        onChange: detail => {
          this.updateItems()
          this.emit<CollapseExpandedChangedDetail>("m:expanded-changed", {
            expandedKeys: this.expandedKeys, key: detail.name, expanded: detail.expanded,
            item: detail.item.parentElement as CollapseItem, originalEvent: detail.event,
          })
        },
        onError: error => this.fail(error),
      })
      if (initial) this.controller.expandedNames = initial
      this.pending = undefined
      this.initialized = true
      this.known = next
      this.phase = "ready"
      this.updateItems()
    } catch (error) {
      this.controller?.disconnect()
      this.fail(error)
      if (strict) throw error
    } finally {
      if (this.isConnected) this.observer?.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["key", "disabled"] })
    }
  }
}

/**
 * A stable keyed item rendered as details/summary, with independent header extras.
 * @region {"name":"header","element":"m-collapse-header","accepts":["noninteractive label"],"min":1,"max":1}
 * @region {"name":"headerExtra","element":"m-collapse-header-extra","accepts":["content","native actions"],"min":0,"max":1}
 * @region {"name":"content","element":"m-collapse-content","accepts":["content","controls","Collapse"],"min":1,"max":1}
 * @states expanded collapsed disabled
 */
export class CollapseItem extends ViewElement {
  public static readonly tag = "m-collapse-item"
  public static readonly observedAttributes = ["disabled"]
  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "item"
    this.addEventListener("click", this.blockDisabled, true)
  }
  public disconnectedCallback(): void {
    this.removeEventListener("click", this.blockDisabled, true)
  }
  public attributeChangedCallback(): void {
    const root = this.parentElement
    if (root instanceof Collapse && root.state === "ready") root.refresh()
  }
  public get key(): string { return this.getAttribute("key") ?? "" }
  public set key(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new RangeError("CollapseItem key must be nonempty.")
    if (this.parentElement instanceof Collapse && this.parentElement.items.some(item => item !== this && item.key === value)) throw new RangeError("Collapse item keys must be unique.")
    this.setStringAttribute("key", value)
  }
  public get disabled(): boolean { return this.hasAttribute("disabled") }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value) }
  public get expanded(): boolean { return rendered.get(this)?.details.open ?? false }
  private readonly blockDisabled = (event: MouseEvent): void => {
    if (this.disabled && event.target instanceof Element && event.target.closest("summary") === rendered.get(this)?.summary) event.preventDefault()
  }
}
