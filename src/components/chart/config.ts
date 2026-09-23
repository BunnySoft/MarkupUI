import { ViewElement } from "../../core/index.js"

type Dimension = string | number | Array<string | number>
type Radius = string | number | [string | number, string | number]
const seriesTypes = ["bar", "line", "pie", "scatter"] as const
const axisTypes = ["category", "value"] as const

function dimension(value: unknown): asserts value is Dimension | null {
  if (value === null) return
  const entries = Array.isArray(value) ? value : [value]
  if (!entries.length || entries.some(item => !(typeof item === "string" && item.length || typeof item === "number" && Number.isInteger(item) && item >= 0))) {
    throw new TypeError("Encode requires dimension names or nonnegative indices.")
  }
}
function radius(value: unknown): asserts value is Radius | null {
  if (value === null) return
  if (Array.isArray(value) && value.length !== 2) throw new TypeError("Radius range requires two values.")
  for (const item of Array.isArray(value) ? value : [value]) {
    if (!(typeof item === "number" && Number.isFinite(item) && item >= 0 || typeof item === "string" && /^(?:100|\d{1,2}(?:\.\d+)?)%$/.test(item))) {
      throw new TypeError("Radius requires nonnegative pixels or percentages.")
    }
  }
}

abstract class Config extends ViewElement {
  public connectedCallback(): void { this.upgradeProperties(); this.changed() }
  public attributeChangedCallback(): void { if (this.isConnected) this.changed() }
  protected changed(): void { this.emit("m:chart-config-change", {}) }
  protected json(name: string): unknown { return this.hasAttribute(name) ? JSON.parse(this.getAttribute(name)!) : null }
  protected setJson(name: string, value: unknown): void { this.setStringAttribute(name, value === null ? null : JSON.stringify(value)) }
  protected encode(name: string): Dimension | null {
    const text = this.getAttribute(name)
    const value: unknown = text === null ? null : text.startsWith("[") ? JSON.parse(text) : /^\d+$/.test(text) ? Number(text) : text
    dimension(value)
    return value
  }
  protected setEncode(name: string, value: Dimension | null): void {
    dimension(value)
    this.setStringAttribute(name, value === null ? null : typeof value === "string" ? value : JSON.stringify(value))
  }
}

export class ChartTitle extends Config {
  public static readonly tag = "m-chart-title"
  public static readonly observedAttributes = ["text", "subtext"]
  public get text(): string { return this.getAttribute("text") ?? "" }
  public set text(value: string) { this.setStringAttribute("text", value) }
  public get subtext(): string { return this.getAttribute("subtext") ?? "" }
  public set subtext(value: string) { this.setStringAttribute("subtext", value) }
}
export class ChartTooltip extends Config {
  public static readonly tag = "m-chart-tooltip"
  public static readonly observedAttributes = ["trigger", "show"]
  public get trigger(): "item" | "axis" { return this.choiceAttribute("trigger", ["item", "axis"], "item") }
  public set trigger(value: "item" | "axis") { this.setChoiceAttribute("trigger", value, ["item", "axis"]) }
  public get show(): boolean { return this.booleanAttribute("show", true) }
  public set show(value: boolean) { this.setBooleanAttribute("show", value, false) }
}
export class ChartLegend extends Config {
  public static readonly tag = "m-chart-legend"
  public static readonly observedAttributes = ["show"]
  public get show(): boolean { return this.booleanAttribute("show", true) }
  public set show(value: boolean) { this.setBooleanAttribute("show", value, false) }
}
abstract class Axis extends Config {
  public static readonly observedAttributes = ["type", "name"]
  public get name(): string | null { return this.getAttribute("name") }
  public set name(value: string | null) { this.setStringAttribute("name", value) }
}
export class ChartXAxis extends Axis {
  public static readonly tag = "m-chart-x-axis"
  public get type(): "category" | "value" { return this.choiceAttribute("type", axisTypes, "category") }
  public set type(value: "category" | "value") { this.setChoiceAttribute("type", value, axisTypes) }
}
export class ChartYAxis extends Axis {
  public static readonly tag = "m-chart-y-axis"
  public get type(): "category" | "value" { return this.choiceAttribute("type", axisTypes, "value") }
  public set type(value: "category" | "value") { this.setChoiceAttribute("type", value, axisTypes) }
}
export class ChartEncode extends Config {
  public static readonly tag = "m-chart-encode"
  public static readonly observedAttributes = ["x", "y", "value", "item-name", "tooltip"]
  public get x(): Dimension | null { return this.encode("x") }
  public set x(value: Dimension | null) { this.setEncode("x", value) }
  public get y(): Dimension | null { return this.encode("y") }
  public set y(value: Dimension | null) { this.setEncode("y", value) }
  public get value(): Dimension | null { return this.encode("value") }
  public set value(value: Dimension | null) { this.setEncode("value", value) }
  public get itemName(): Dimension | null { return this.encode("item-name") }
  public set itemName(value: Dimension | null) { this.setEncode("item-name", value) }
  public get tooltip(): Dimension | null { return this.encode("tooltip") }
  public set tooltip(value: Dimension | null) { this.setEncode("tooltip", value) }
}
export class ChartLabel extends Config {
  public static readonly tag = "m-chart-label"
  public static readonly observedAttributes = ["show", "position"]
  public get show(): boolean { return this.booleanAttribute("show", false) }
  public set show(value: boolean) { this.setBooleanAttribute("show", value, false) }
  public get position(): string | null { return this.getAttribute("position") }
  public set position(value: string | null) {
    if (value !== null && !["top", "bottom", "left", "right", "inside", "outside", "center"].includes(value)) throw new RangeError("Invalid chart label position.")
    this.setStringAttribute("position", value)
  }
}
export class ChartSeries extends Config {
  public static readonly tag = "m-chart-series"
  public static readonly observedAttributes = ["id", "type", "name", "dataset-id", "stack", "smooth", "area-style", "radius", "series-layout-by"]
  public get type(): typeof seriesTypes[number] { return this.choiceAttribute("type", seriesTypes, "bar") }
  public set type(value: typeof seriesTypes[number]) { this.setChoiceAttribute("type", value, seriesTypes) }
  public get name(): string | null { return this.getAttribute("name") }
  public set name(value: string | null) { this.setStringAttribute("name", value) }
  public get datasetId(): string | null { return this.getAttribute("dataset-id") }
  public set datasetId(value: string | null) { this.setStringAttribute("dataset-id", value) }
  public get stack(): string | null { return this.getAttribute("stack") }
  public set stack(value: string | null) { this.setStringAttribute("stack", value) }
  public get smooth(): boolean { return this.booleanAttribute("smooth", false) }
  public set smooth(value: boolean) { this.setBooleanAttribute("smooth", value, false) }
  public get areaStyle(): Record<string, never> | null {
    const value = this.json("area-style")
    if (value !== null && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length)) throw new TypeError("First-batch area-style accepts {} only.")
    return value as Record<string, never> | null
  }
  public set areaStyle(value: Record<string, never> | null) {
    if (value !== null && (typeof value !== "object" || Array.isArray(value) || Object.keys(value).length)) throw new TypeError("First-batch area-style accepts {} only.")
    this.setJson("area-style", value)
  }
  public get radius(): Radius | null { const value = this.json("radius"); radius(value); return value }
  public set radius(value: Radius | null) { radius(value); this.setJson("radius", value) }
  public get seriesLayoutBy(): "column" | "row" { return this.choiceAttribute("series-layout-by", ["column", "row"], "column") }
  public set seriesLayoutBy(value: "column" | "row") { this.setChoiceAttribute("series-layout-by", value, ["column", "row"]) }
}
