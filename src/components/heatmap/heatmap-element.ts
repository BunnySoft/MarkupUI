import { ViewElement } from "../../core/index.js"
import { createHeatmap } from "./heatmap.js"
import type { HeatmapController, HeatmapState } from "./heatmap.js"
import { buildHeatmap, heatmapConfig, heatmapDefaults } from "./model.js"
import type { HeatmapConfig, HeatmapDataItem, HeatmapModel, HeatmapSettings } from "./model.js"

/**
 * Bounded date/value data mapped to a native calendar table, legend and persistent detail.
 * @region {"name":"content","accepts":["phrasing","content"],"min":0,"max":null}
 * @event {"name":"HeatmapChange","web":"m:heatmap-change","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"HeatmapExplore","web":"m:heatmap-explore","bubbles":true,"cancelable":false,"composed":false}
 * @event {"name":"HeatmapError","web":"m:heatmap-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class Heatmap extends ViewElement {
  public static readonly tag = "m-heatmap"
  public static readonly observedAttributes = ["settings", "data", "label"]
  #initialized = false
  #controller: HeatmapController | null = null
  #settings: HeatmapConfig = heatmapConfig({})
  #scope: HTMLElement | null = null
  #date: string | null = null
  #preparing = false

  public connectedCallback(): void {
    if (!this.#initialized) {
      if (this.hasAttribute("settings")) this.settings = JSON.parse(this.getAttribute("settings")!)
      if (this.hasAttribute("data")) this.data = JSON.parse(this.getAttribute("data")!)
      this.#initialized = true
      this.upgradeProperties()
    }
    this.#render()
    this.#scope!.setAttribute("aria-label", this.label)
    this.#preparing = true
    try { this.#controller = createHeatmap(this.#scope!, this.#settings, this) }
    finally { this.#preparing = false }
    if (this.#date && this.model?.cells.some(cell => cell?.date === this.#date)) this.#controller.restoreDate(this.#date)
  }

  public disconnectedCallback(): void {
    if (this.#controller) {
      this.#settings = this.#controller.settings
      this.#date = this.#controller.state.currentDate
      this.#controller.disconnect()
    }
  }

  public attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (!this.#initialized || before === after) return
    if (name === "settings") this.settings = after === null ? heatmapDefaults : JSON.parse(after)
    else if (name === "data") this.data = after === null ? [] : JSON.parse(after)
    else this.#scope?.setAttribute("aria-label", this.label)
  }

  public get label(): string { return this.getAttribute("label") ?? "Activity" }
  public set label(value: string) {
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Use a nonempty Heatmap label.")
    this.setStringAttribute("label", value)
  }
  /** Immutable configuration. Writes merge supplied fields; JSON attributes cannot contain callbacks. */
  public get settings(): Readonly<HeatmapConfig> { return this.#controller?.connected ? this.#controller.settings : this.#settings }
  public set settings(value: HeatmapSettings) {
    if (this.#preparing) throw new Error("Do not reenter Heatmap preparation.")
    if (this.#controller?.connected) {
      this.#controller.set(value)
      this.#settings = this.#controller.settings
    } else {
      this.#preparing = true
      try {
        const next = heatmapConfig(value, this.#settings)
        buildHeatmap(next)
        this.#settings = next
      } finally { this.#preparing = false }
    }
  }
  /** At most 366 canonical date/value records. Missing values never become zero. */
  public get data(): readonly HeatmapDataItem[] { return this.settings.data }
  public set data(value: readonly HeatmapDataItem[]) { this.settings = { data: value } }
  public get model(): HeatmapModel | null { return this.#controller?.model ?? null }
  public get state(): HeatmapState | null { return this.#controller?.state ?? null }
  public get error(): unknown { return this.#controller?.error ?? null }
  /** Web-only generated semantic table; authoring requires no native table/template. */
  public get native(): HTMLTableElement | null { return this.#controller?.table ?? null }
  public explore(date: string): void { this.#live().explore(date) }
  public refresh(): void { this.#live().refresh() }
  public override focus(options?: FocusOptions): void {
    this.#scope?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus(options)
  }

  #live(): HeatmapController {
    if (!this.isConnected || !this.#controller?.connected) throw new Error("Heatmap is disconnected.")
    return this.#controller
  }

  #render(): void {
    if (this.#scope) return
    const doc = this.ownerDocument
    const make = <K extends keyof HTMLElementTagNameMap>(tag: K, part: string) => {
      const node = doc.createElement(tag); node.setAttribute(`data-heatmap-${part}`, ""); return node
    }
    const scope = this.#scope = doc.createElement("section")
    scope.className = "m-heatmap"; scope.setAttribute("data-heatmap", ""); scope.tabIndex = -1
    const scroll = make("div", "scroll"), table = make("table", "table"), caption = doc.createElement("caption")
    caption.append(make("span", "caption"))
    table.append(caption, make("thead", "head"), make("tbody", "body")); scroll.append(table)
    const template = make("template", "cell"), cell = doc.createElement("td"), button = make("button", "day")
    button.type = "button"
    button.append(make("span", "swatch"), make("time", "date"), make("span", "value"), make("span", "code"))
    cell.append(button); template.content.append(cell)
    const legend = make("div", "legend"); legend.append(make("ul", "bands"))
    scope.append(scroll, template, legend, make("p", "detail"), make("p", "status"))
    this.append(scope)
  }
}
