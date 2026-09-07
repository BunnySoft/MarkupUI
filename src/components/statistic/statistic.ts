const names = ["label", "prefix", "value", "suffix"] as const
type RegionName = typeof names[number]
type Region = { area: HTMLDivElement; text: HTMLSpanElement; content: HTMLDivElement }
const inert = "template,script,style"
function hide(element: HTMLElement, hidden: boolean): void { if (element.hidden !== hidden) element.hidden = hidden }

export class MuiStatistic extends HTMLElement {
  public static get observedAttributes(): string[] { return ["label", "value", "prefix", "suffix"] }

  private regions = new Map<RegionName, Region>()
  private display: HTMLDivElement | undefined
  private observer: MutationObserver | undefined
  private ready = false
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["label", "value", "valuePrefix", "valueSuffix", "tabularNums"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiStatistic = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void { this.ready = false; this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.ready && this.isConnected) this.synchronize() }
  public get label(): string | undefined { return this.getAttribute("label") ?? undefined }
  public set label(value: string | null | undefined) { this.assign("label", value) }
  public get value(): string | undefined { return this.getAttribute("value") ?? undefined }
  public set value(value: string | number | null | undefined) {
    if (value != null && typeof value !== "string" && typeof value !== "number") throw new TypeError("Statistic value must be a string or number.")
    if (typeof value === "number" && !Number.isFinite(value)) throw new RangeError("Statistic value must be finite or explicitly authored text.")
    this.assign("value", value == null ? value : String(value))
  }
  public get valuePrefix(): string | undefined { return this.getAttribute("prefix") ?? undefined }
  public set valuePrefix(value: string | null | undefined) { this.assign("prefix", value) }
  public get valueSuffix(): string | undefined { return this.getAttribute("suffix") ?? undefined }
  public set valueSuffix(value: string | null | undefined) { this.assign("suffix", value) }
  public get tabularNums(): boolean { return this.hasAttribute("tabular-nums") }
  public set tabularNums(value: boolean) { this.toggleAttribute("tabular-nums", value) }

  private assign(name: string, value: string | null | undefined): void {
    if (value == null) this.removeAttribute(name)
    else if (typeof value !== "string") throw new TypeError(`Statistic ${name} must be text.`)
    else this.setAttribute(name, value)
  }

  private createRegion(name: RegionName): Region {
    const area = this.ownerDocument.createElement("div")
    area.setAttribute(`data-mui-statistic-${name}`, "")
    const text = this.ownerDocument.createElement("span")
    text.dataset.muiStatisticText = ""
    const content = this.ownerDocument.createElement("div")
    content.setAttribute("data-mui-statistic-slot", name)
    area.append(text, content)
    return { area, text, content }
  }

  private destination(node: Element): RegionName | undefined {
    return names.find((name) => node.hasAttribute(`data-mui-statistic-${name}`))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.display?.parentNode !== this || this.regions.get("label")?.area.parentNode !== this
      || (["prefix", "value", "suffix"] as const).some((name) => this.regions.get(name)?.area.parentNode !== this.display)) {
      for (const region of this.regions.values()) {
        if (this.contains(region.content)) this.append(...region.content.childNodes)
      }
      this.regions.get("label")?.area.remove()
      this.display?.remove()
      this.regions.clear()
      this.display = this.ownerDocument.createElement("div")
      this.display.dataset.muiStatisticDisplay = ""
      for (const name of names) this.regions.set(name, this.createRegion(name))
      this.prepend(this.regions.get("label")!.area, this.display)
      this.display.append(...(["prefix", "value", "suffix"] as const).map((name) => this.regions.get(name)!.area))
    }
    for (const node of [...this.childNodes]) {
      if (node === this.display || node === this.regions.get("label")!.area) continue
      if (node instanceof Element && node.matches(inert)) continue
      if (node.nodeType !== Node.ELEMENT_NODE && (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())) continue
      const name = node instanceof Element ? this.destination(node) ?? "value" : "value"
      this.regions.get(name)!.content.append(node)
    }
    for (const [name, region] of this.regions) {
      for (const node of [...region.content.children]) {
        const destination = this.destination(node) ?? "value"
        if (destination !== name) this.regions.get(destination)!.content.append(node)
      }
    }
    for (const [name, region] of this.regions) {
      const value = this.getAttribute(name)
      const authored = region.content.hasChildNodes()
      const override = name === "value" ? value !== null : name === "label" ? Boolean(value) : !authored && value !== null
      const text = override ? value ?? "" : ""
      if (region.text.textContent !== text) region.text.textContent = text
      hide(region.text, !override)
      hide(region.content, override)
      hide(region.area, !override && !authored || (name !== "value" && !authored && text === ""))
    }
    hide(this.display, (["prefix", "value", "suffix"] as const).every((name) => this.regions.get(name)!.area.hidden))
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: names.map((name) => `data-mui-statistic-${name}`),
    })
  }
}
