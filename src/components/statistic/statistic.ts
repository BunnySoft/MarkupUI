import { ViewElement } from "../../core/index.js"

const names = ["label", "prefix", "value", "suffix"] as const
type RegionName = typeof names[number]
type Region = { area: HTMLDivElement; text: HTMLSpanElement; content: HTMLDivElement }
const inert = "template,script,style"
function hide(element: HTMLElement, hidden: boolean): void { if (element.hidden !== hidden) element.hidden = hidden }

/**
 * A statistic component for displaying numbers, labels, prefixes, and suffixes.
 * @region {"name":"label","accepts":["text","heading","content"],"min":0,"max":1}
 * @region {"name":"prefix","accepts":["text","icon","content"],"min":0,"max":1}
 * @region {"name":"value","accepts":["text","content"],"min":0,"max":1}
 * @region {"name":"suffix","accepts":["text","content","controls"],"min":0,"max":1}
 */
export class Statistic extends ViewElement {
  public static readonly tag = "m-statistic"
  public static get observedAttributes(): string[] { return ["label", "value", "prefix", "suffix", "tabular-nums"] }

  private regions = new Map<RegionName, Region>()
  private display: HTMLDivElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mStatistic = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get label(): string | null {
    return this.getAttribute("label")
  }
  public set label(value: string | null | undefined) {
    this.assign("label", value)
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }
  public set value(value: string | number | null | undefined) {
    if (value != null && typeof value !== "string" && typeof value !== "number") {
      throw new TypeError("Statistic value must be a string or number.")
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new RangeError("Statistic value must be finite or explicitly authored text.")
    }
    this.assign("value", value == null ? value : String(value))
  }

  public override get prefix(): string | null {
    return this.getAttribute("prefix")
  }
  public override set prefix(value: string | null | undefined) {
    this.assign("prefix", value)
  }

  public get suffix(): string | null {
    return this.getAttribute("suffix")
  }
  public set suffix(value: string | null | undefined) {
    this.assign("suffix", value)
  }

  public get valuePrefix(): string | null {
    return this.getAttribute("prefix")
  }
  public set valuePrefix(value: string | null | undefined) {
    this.assign("prefix", value)
  }

  public get valueSuffix(): string | null {
    return this.getAttribute("suffix")
  }
  public set valueSuffix(value: string | null | undefined) {
    this.assign("suffix", value)
  }

  public get tabularNums(): boolean {
    return this.hasAttribute("tabular-nums")
  }
  public set tabularNums(value: boolean) {
    this.setBooleanAttribute("tabular-nums", value)
  }

  private assign(name: string, value: string | null | undefined): void {
    if (value == null) this.removeAttribute(name)
    else if (typeof value !== "string") throw new TypeError(`Statistic ${name} must be text.`)
    else this.setAttribute(name, value)
  }

  private createRegion(name: RegionName): Region {
    const area = this.ownerDocument.createElement("div")
    area.setAttribute(`data-m-statistic-${name}`, "")
    const text = this.ownerDocument.createElement("span")
    text.dataset.mStatisticText = ""
    const content = this.ownerDocument.createElement("div")
    content.setAttribute("data-m-statistic-slot", name)
    area.append(text, content)
    return { area, text, content }
  }

  private destination(node: Element): RegionName | undefined {
    return names.find((name) =>
      node.hasAttribute(`data-m-statistic-${name}`) ||
      node.getAttribute("data-part") === name ||
      node.getAttribute("slot") === name,
    )
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
      this.display.dataset.mStatisticDisplay = ""
      this.display.dataset.mStatisticValue = ""
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
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: [...names.map((name) => `data-m-statistic-${name}`), "data-part", "slot"],
    })
  }
}

export { Statistic as MStatistic }

