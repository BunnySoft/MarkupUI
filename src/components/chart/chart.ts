import { ViewElement } from "../../core/index.js"
import { validateSource, type ChartSource } from "./data.js"
import { chartConfiguration, directTable, type ChartOption, type ChartTableData } from "./options.js"
import { createChartRenderer, type ChartRenderer } from "./renderer.js"

/** Optional ECharts Web renderer. Authored configuration and fallback content remain live. */
export class Chart extends ViewElement {
  public static readonly tag = "m-chart"
  public static readonly observedAttributes = ["aria-label", "aria-labelledby", "aria-describedby", "height", "theme", "renderer"]
  private readonly surface = this.ownerDocument.createElement("div")
  private readonly status = this.ownerDocument.createElement("p")
  private readonly disclosure = this.ownerDocument.createElement("details")
  private readonly table = this.ownerDocument.createElement("table")
  private readonly selection = this.ownerDocument.createElement("select")
  private readonly previous = this.ownerDocument.createElement("button")
  private readonly next = this.ownerDocument.createElement("button")
  private readonly pageLabel = this.ownerDocument.createElement("span")
  private instance: ChartRenderer | undefined
  private instanceKey = ""
  private resizeObserver: ResizeObserver | undefined
  private readonly observer = new MutationObserver(records => {
    if (records.some(record => record.target === this || record.target instanceof Element && record.target.localName.startsWith("m-chart-"))) this.schedule()
  })
  private configured: ChartOption | null = null
  private fallback: ChartSource | null = null
  private tables: ChartTableData[] = []
  private page = 0
  private queued = false
  private failure: Error | null = null
  private phase: "waiting" | "loading" | "empty" | "ready" | "error" = "waiting"

  public constructor() {
    super()
    this.surface.dataset.part = "chart"
    this.surface.setAttribute("role", "img")
    this.status.setAttribute("role", "status")
    const summary = this.ownerDocument.createElement("summary")
    summary.textContent = "Chart data"
    this.selection.setAttribute("aria-label", "Dataset")
    this.previous.type = this.next.type = "button"
    this.previous.textContent = "Previous"
    this.next.textContent = "Next"
    this.previous.setAttribute("aria-label", "Previous data page")
    this.next.setAttribute("aria-label", "Next data page")
    this.previous.addEventListener("click", () => { this.page--; this.renderTable() })
    this.next.addEventListener("click", () => { this.page++; this.renderTable() })
    this.selection.addEventListener("change", () => { this.page = 0; this.renderTable() })
    this.pageLabel.setAttribute("aria-live", "polite")
    this.disclosure.append(summary, this.selection, this.table, this.previous, this.pageLabel, this.next)
  }

  public connectedCallback(): void {
    this.upgradeProperties()
    for (const node of [this.surface, this.status, this.disclosure]) if (node.parentElement !== this) this.append(node)
    this.addEventListener("m:chart-config-change", this.changed)
    this.addEventListener("m:chart-data-change", this.changed)
    this.observer.observe(this, { childList: true, subtree: true, attributes: true })
    if (typeof ResizeObserver !== "undefined") { this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(this.surface) }
    this.ownerDocument.defaultView?.addEventListener("resize", this.onResize)
    this.schedule()
  }
  public disconnectedCallback(): void {
    this.observer.disconnect()
    this.resizeObserver?.disconnect()
    this.resizeObserver = undefined
    this.ownerDocument.defaultView?.removeEventListener("resize", this.onResize)
    this.removeEventListener("m:chart-config-change", this.changed)
    this.removeEventListener("m:chart-data-change", this.changed)
    this.instance?.dispose()
    this.instance = undefined
  }
  public attributeChangedCallback(): void { if (this.isConnected) this.schedule() }
  public get native(): HTMLElement { return this.surface }
  public get state(): typeof this.phase { return this.phase }
  public get error(): Error | null { return this.failure }
  public get height(): number { const value = this.numberAttribute("height", 320); if (value <= 0) throw new RangeError("Chart height must be positive."); return value }
  public set height(value: number) { if (!Number.isFinite(value) || value <= 0) throw new RangeError("Chart height must be positive."); this.setAttribute("height", String(value)) }
  public get renderer(): "svg" | "canvas" { return this.choiceAttribute("renderer", ["svg", "canvas"], "svg") }
  public set renderer(value: "svg" | "canvas") { this.setChoiceAttribute("renderer", value, ["svg", "canvas"]) }
  public get theme(): "light" | "dark" { return this.choiceAttribute("theme", ["light", "dark"], "light") }
  public set theme(value: "light" | "dark") { this.setChoiceAttribute("theme", value, ["light", "dark"]) }
  /** Trusted application options; null returns to declarative configuration. */
  public get option(): ChartOption | null { return this.configured }
  public set option(value: ChartOption | null) {
    if (value !== null) {
      if (typeof value !== "object" || Array.isArray(value)) throw new TypeError("Chart option must be an object.")
      if ([...this.children].some(child => child.localName.startsWith("m-chart-"))) throw new TypeError("Direct options conflict with configuration children.")
      this.validateDirect(value)
    }
    this.configured = value
    this.schedule()
  }
  /** Required accessible source for direct options, independent of trusted callbacks. */
  public get tableSource(): ChartSource | null { return this.fallback }
  public set tableSource(value: ChartSource | null) { if (value !== null) validateSource(value); this.fallback = value; this.schedule() }

  public refresh(): void {
    if (!this.isConnected) return
    try {
      if (!this.getAttribute("aria-label")?.trim() && !this.getAttribute("aria-labelledby")?.trim()) throw new TypeError("Chart requires an accessible name.")
      for (const name of ["aria-label", "aria-labelledby", "aria-describedby"]) {
        const value = this.getAttribute(name)
        if (value === null) this.surface.removeAttribute(name)
        else this.surface.setAttribute(name, value)
      }
      this.surface.style.height = `${this.height}px`
      let option: ChartOption, tables: ChartTableData[], loading = false
      if (this.configured !== null) {
        if ([...this.children].some(child => child.localName.startsWith("m-chart-"))) throw new TypeError("Direct options conflict with configuration children.")
        this.validateDirect(this.configured)
        if (this.fallback === null) throw new TypeError("Direct Chart options require tableSource for the accessible alternative.")
        validateSource(this.fallback)
        option = this.configured
        tables = directTable(this.fallback)
      } else ({ option, tables, loading } = chartConfiguration(this))
      this.tables = tables
      const selected = Math.max(0, this.selection.selectedIndex)
      this.selection.replaceChildren(...tables.map((data, index) => {
        const entry = this.ownerDocument.createElement("option")
        entry.value = String(index); entry.textContent = data.name
        return entry
      }))
      this.selection.selectedIndex = Math.min(selected, tables.length - 1)
      this.selection.hidden = tables.length < 2
      this.renderTable()
      this.failure = null
      if (loading) { this.setState("loading"); return }
      if (!tables.some(data => data.rows.length)) { this.instance?.dispose(); this.instance = undefined; this.setState("empty"); return }
      if (this.surface.clientWidth <= 0 || this.surface.clientHeight <= 0) { this.setState("waiting"); return }
      const key = `${this.theme}:${this.renderer}`
      if (this.instance && this.instanceKey !== key) { this.instance.dispose(); this.instance = undefined }
      if (!this.instance) {
        this.instance = createChartRenderer(this.surface, this.theme, this.renderer)
        this.instanceKey = key
        const instance = this.instance
        this.instance.on("click", event => {
          if (!this.isConnected || this.instance !== instance) return
          const data = event as { seriesIndex?: number; dataIndex?: number; name?: string; value?: unknown }
          this.emit("m:chart-select", { seriesIndex: data.seriesIndex, dataIndex: data.dataIndex, name: data.name, value: data.value })
        })
      }
      const reduced = this.ownerDocument.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      this.instance.setOption({ animation: false, ...option, ...(reduced ? { animation: false } : {}) }, { notMerge: true, lazyUpdate: false })
      this.instance.resize()
      this.setState("ready")
    } catch (error) {
      this.failure = error instanceof Error ? error : new Error(String(error))
      this.instance?.dispose()
      this.instance = undefined
      this.tables = []
      this.renderTable()
      this.setState("error")
      this.emit("m:chart-error", { error: this.failure })
    }
  }
  public resize(): void {
    if (!this.isConnected || !this.surface.clientWidth || !this.surface.clientHeight) return
    if (this.instance && this.phase === "ready") this.instance.resize()
    else this.refresh()
  }
  private readonly onResize = (): void => this.resize()
  private readonly changed = (event: Event): void => {
    if (event.target instanceof Element && event.target.closest("m-chart") === this) this.schedule()
  }
  private schedule(): void {
    if (this.queued || !this.isConnected) return
    this.queued = true
    queueMicrotask(() => { this.queued = false; if (this.isConnected) this.refresh() })
  }
  private validateDirect(option: ChartOption): void {
    const series = Array.isArray(option.series) ? option.series : option.series ? [option.series] : []
    if (!series.length || series.some(item => !item || !["bar", "line", "pie", "scatter"].includes(item.type))) throw new TypeError("Direct options require supported first-batch series.")
  }
  private setState(state: typeof this.phase): void {
    const changed = this.phase !== state
    this.phase = state
    this.status.textContent = state === "error" ? "Chart could not be updated." : state === "loading" ? "Loading chart data." : state === "empty" ? "No chart data." : ""
    this.surface.setAttribute("aria-busy", String(state === "loading"))
    if (changed) this.emit("m:chart-state", { state })
  }
  private renderTable(): void {
    const data = this.tables[this.selection.selectedIndex]
    const count = data?.rows.length ?? 0
    this.page = Math.max(0, Math.min(this.page, Math.max(0, Math.ceil(count / 50) - 1)))
    this.table.replaceChildren()
    const caption = this.table.createCaption()
    caption.textContent = `${this.getAttribute("aria-label") ?? "Chart"}: ${data?.name ?? "Data"}`
    const head = this.table.createTHead().insertRow()
    for (const column of data?.columns ?? []) {
      const cell = this.ownerDocument.createElement("th"); cell.scope = "col"; cell.textContent = column; head.append(cell)
    }
    const body = this.table.createTBody()
    for (const row of data?.rows.slice(this.page * 50, this.page * 50 + 50) ?? []) {
      const tr = body.insertRow()
      for (const value of row) tr.insertCell().textContent = value === null ? "" : String(value)
    }
    this.previous.disabled = this.page === 0
    this.next.disabled = (this.page + 1) * 50 >= count
    this.pageLabel.textContent = count ? `${this.page * 50 + 1}-${Math.min((this.page + 1) * 50, count)} of ${count}` : "0 rows"
  }
}
