import { createGraphic, createRing, updateRing } from "./geometry.js"
import type { Ring } from "./geometry.js"
import { cssValue, dataValue, maximumMeasures, numberValue, paints, percentages, serialize } from "./values.js"
import type { ProgressColor } from "./values.js"

const types = ["line", "circle", "multiple-circle", "dashboard"]
const statuses = ["default", "success", "error", "warning", "info"]
const semanticNames = ["aria-label", "aria-labelledby", "aria-describedby", "aria-valuetext"] as const
type Override = { original: string | null; applied: string | null }
type Control = { node: HTMLProgressElement; generated: boolean; overrides: Map<string, Override> }
type Measure = { value: number | null; max: number; percentage: number | null }
let nextId = 0
function invalid(name: string): never { throw new RangeError(`Invalid Progress ${name}.`) }

export class MuiProgress extends HTMLElement {
  public static get observedAttributes(): string[] {
    return ["percentage", "value", "max", "indeterminate", "type", "status", "unit", "show-indicator",
      "color", "rail-color", "height", "border-radius", "fill-border-radius", "indicator-text-color",
      "stroke-width", "circle-gap", "view-box-width", "gap-degree", "gap-offset-degree", "offset-degree",
      "offset-degress", "indicator-placement", "indicator-position", "label", "role", ...semanticNames]
  }

  private readonly idPrefix = `mui-progress-gradient-${++nextId}`
  private records: Control[] = []
  private nativeGroup: HTMLSpanElement | undefined
  private graphic: HTMLSpanElement | undefined
  private svg: SVGSVGElement | undefined
  private defs: SVGDefsElement | undefined
  private rings: Ring[] = []
  private indicator: HTMLSpanElement | undefined
  private text: HTMLSpanElement | undefined
  private indicatorSlot: HTMLSpanElement | undefined
  private observer: MutationObserver | undefined
  private ready = false
  private upgraded = false
  private syncing = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["percentage", "value", "max", "indeterminate", "type", "status", "unit", "showIndicator",
        "processing", "color", "railColor", "height", "borderRadius", "fillBorderRadius", "indicatorTextColor",
        "strokeWidth", "circleGap", "viewBoxWidth", "gapDegree", "gapOffsetDegree", "offsetDegree", "offsetDegress",
        "indicatorPlacement", "indicatorPosition", "label"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiProgress = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
    for (const record of this.records) this.restore(record)
  }
  public attributeChangedCallback(): void { if (this.ready && this.isConnected && !this.syncing) this.synchronize() }
  public get controls(): readonly HTMLProgressElement[] { return this.records.map((record) => record.node) }
  public get valid(): boolean { return this.validationErrors.length === 0 }
  public get validationErrors(): readonly string[] { return this.configuration().errors }
  public get normalizedPercentages(): readonly (number | null)[] { return this.configuration().measures.map((measure) => measure.percentage) }
  public get percentage(): number | readonly number[] | undefined { return percentages(this.getAttribute("percentage")) ?? undefined }
  public set percentage(value: number | readonly number[] | null | undefined) {
    if (value == null) { this.removeAttribute("percentage"); return }
    if ((Array.isArray(value) && (value.length > maximumMeasures || !value.every((item) => typeof item === "number" && Number.isFinite(item))))
      || (!Array.isArray(value) && (typeof value !== "number" || !Number.isFinite(value)))) invalid("percentage")
    this.setAttribute("percentage", serialize(value))
  }
  public get value(): number | undefined { return numberValue(this.getAttribute("value"), 0) }
  public set value(value: number | null | undefined) { this.setNumber("value", value) }
  public get max(): number | undefined { return numberValue(this.getAttribute("max"), 100) }
  public set max(value: number | null | undefined) { this.setNumber("max", value, 0, undefined, true) }
  public get type(): string { return this.getAttribute("type") ?? "line" }
  public set type(value: string) { this.setEnum("type", value, types) }
  public get status(): string { return this.getAttribute("status") ?? "default" }
  public set status(value: string) { this.setEnum("status", value, statuses) }
  public get unit(): string { return this.getAttribute("unit") ?? "%" }
  public set unit(value: string) { this.setAttribute("unit", value) }
  public get label(): string { return this.getAttribute("label") ?? this.getAttribute("aria-label") ?? "Progress" }
  public set label(value: string) { this.setAttribute("label", value) }
  public get indeterminate(): boolean { return this.hasAttribute("indeterminate") }
  public set indeterminate(value: boolean) { this.toggleAttribute("indeterminate", value) }
  public get processing(): boolean { return this.hasAttribute("processing") }
  public set processing(value: boolean) { this.toggleAttribute("processing", value) }
  public get showIndicator(): boolean { return this.getAttribute("show-indicator") !== "false" }
  public set showIndicator(value: boolean) { this.setAttribute("show-indicator", String(value)) }
  public get indicatorPlacement(): string { return this.getAttribute("indicator-placement") ?? this.getAttribute("indicator-position") ?? "outside" }
  public set indicatorPlacement(value: string) { this.setEnum("indicator-placement", value, ["inside", "outside"]) }
  public get indicatorPosition(): string { return this.indicatorPlacement }
  public set indicatorPosition(value: string) { this.setEnum("indicator-position", value, ["inside", "outside"]) }
  public get height(): number | undefined { return numberValue(this.getAttribute("height")) }
  public set height(value: number | null | undefined) { this.setNumber("height", value, 0) }
  public get strokeWidth(): number | undefined { return numberValue(this.getAttribute("stroke-width"), 7) }
  public set strokeWidth(value: number | null | undefined) { this.setNumber("stroke-width", value, 0) }
  public get circleGap(): number | undefined { return numberValue(this.getAttribute("circle-gap"), 1) }
  public set circleGap(value: number | null | undefined) { this.setNumber("circle-gap", value, 0) }
  public get viewBoxWidth(): number | undefined { return numberValue(this.getAttribute("view-box-width"), 100) }
  public set viewBoxWidth(value: number | null | undefined) { this.setNumber("view-box-width", value, 0, undefined, true) }
  public get gapDegree(): number | undefined { return numberValue(this.getAttribute("gap-degree"), this.type === "dashboard" ? 75 : 0) }
  public set gapDegree(value: number | null | undefined) { this.setNumber("gap-degree", value, 0, 360) }
  public get gapOffsetDegree(): number | undefined { return numberValue(this.getAttribute("gap-offset-degree"), 0) }
  public set gapOffsetDegree(value: number | null | undefined) { this.setNumber("gap-offset-degree", value) }
  public get offsetDegree(): number | undefined { return numberValue(this.getAttribute("offset-degree") ?? this.getAttribute("offset-degress"), 0) }
  public set offsetDegree(value: number | null | undefined) { this.setNumber("offset-degree", value) }
  public get offsetDegress(): number | undefined { return this.offsetDegree }
  public set offsetDegress(value: number | null | undefined) { this.setNumber("offset-degress", value) }
  public get color(): ProgressColor | undefined { return (dataValue(this.getAttribute("color")) ?? undefined) as ProgressColor | undefined }
  public set color(value: ProgressColor | null | undefined) { this.setPaint("color", value, true) }
  public get railColor(): string | readonly string[] | undefined { return (dataValue(this.getAttribute("rail-color")) ?? undefined) as string | readonly string[] | undefined }
  public set railColor(value: string | readonly string[] | null | undefined) { this.setPaint("rail-color", value, false) }
  public get borderRadius(): string | undefined { return this.getAttribute("border-radius") ?? undefined }
  public set borderRadius(value: string | number | null | undefined) { this.setCss("border-radius", "border-radius", value, true) }
  public get fillBorderRadius(): string | undefined { return this.getAttribute("fill-border-radius") ?? undefined }
  public set fillBorderRadius(value: string | number | null | undefined) { this.setCss("fill-border-radius", "border-radius", value, true) }
  public get indicatorTextColor(): string | undefined { return this.getAttribute("indicator-text-color") ?? undefined }
  public set indicatorTextColor(value: string | null | undefined) { this.setCss("indicator-text-color", "color", value) }

  private setEnum(name: string, value: string, allowed: readonly string[]): void {
    if (!allowed.includes(value)) invalid(name)
    this.setAttribute(name, value)
  }
  private setNumber(name: string, value: number | null | undefined, min?: number, max?: number, exclusive = false): void {
    if (value == null) { this.removeAttribute(name); return }
    if (!Number.isFinite(value) || (min !== undefined && (exclusive ? value <= min : value < min)) || (max !== undefined && value > max)) invalid(name)
    this.setAttribute(name, String(value))
  }
  private setCss(name: string, property: string, value: string | number | null | undefined, pixels = false): void {
    if (value == null) { this.removeAttribute(name); return }
    if (cssValue(this.ownerDocument, property, String(value), pixels) === null) invalid(name)
    this.setAttribute(name, String(value))
  }
  private setPaint(name: string, value: unknown, gradients: boolean): void {
    if (value == null) { this.removeAttribute(name); return }
    if (Array.isArray(value) && value.length > maximumMeasures) invalid(name)
    const raw = serialize(value)
    if (paints(this.ownerDocument, raw, gradients) === null) invalid(name)
    this.setAttribute(name, raw)
  }

  private baseline(record: Control, name: string): string | null {
    const current = record.node.getAttribute(name), override = record.overrides.get(name)
    return override && current === override.applied ? override.original : current
  }
  private manage(record: Control, name: string, value: string | null | undefined): void {
    const current = record.node.getAttribute(name)
    let override = record.overrides.get(name)
    if (override && current !== override.applied) override.original = current
    if (value === undefined) {
      if (!override) return
      value = override.original
      record.overrides.delete(name)
    } else {
      if (!override) {
        override = { original: current, applied: value }
        record.overrides.set(name, override)
      }
      override.applied = value
    }
    if (value === null) record.node.removeAttribute(name)
    else if (current !== value) record.node.setAttribute(name, value)
  }
  private restore(record: Control): void {
    for (const name of record.overrides.keys()) this.manage(record, name, undefined)
    for (const property of ["--_mui-progress-fill-start", "--_mui-progress-fill-end", "--_mui-progress-rail"]) record.node.style.removeProperty(property)
  }

  private configuration() {
    const errors: string[] = [], measures: Measure[] = []
    const authored = this.records.filter((record) => !record.generated && record.node.parentNode === this.nativeGroup)
    const multiple = this.type === "multiple-circle", radial = this.type !== "line"
    const requested = percentages(this.getAttribute("percentage"))
    let clamped = false
    const add = (value: number | null, max: number) => {
      const normalized = value === null ? null : Math.max(0, Math.min(max, value))
      if (normalized !== value) clamped = true
      measures.push({ value: this.indeterminate ? null : normalized, max, percentage: this.indeterminate || normalized === null ? null : normalized / max * 100 })
    }
    if (!types.includes(this.type)) errors.push("type")
    if (!statuses.includes(this.status)) errors.push("status")
    if (!["inside", "outside"].includes(this.indicatorPlacement)) errors.push("indicator-placement")
    if (this.getAttribute("role") === "progressbar") errors.push("role")
    if (requested === null || (requested !== undefined && Array.isArray(requested) !== multiple)) errors.push("percentage")
    else if (requested !== undefined) for (const value of typeof requested === "number" ? [requested] : requested) add(value, 100)
    else if (this.hasAttribute("value") || this.hasAttribute("max")) {
      const value = this.value, max = this.max
      if (value === undefined) errors.push("value")
      if (max === undefined || max <= 0) errors.push("max")
      if (value !== undefined && max !== undefined && max > 0) add(value, max)
    } else if (authored.length) {
      for (const record of authored) {
        const raw = this.baseline(record, "value")
        const value = raw === null ? null : numberValue(raw)
        const max = numberValue(this.baseline(record, "max"), 1)
        if (value === undefined) errors.push("native-value")
        if (max === undefined || max <= 0) errors.push("native-max")
        if (value !== undefined && max !== undefined && max > 0) add(value, max)
      }
    } else add(0, 100)
    if ((!multiple && measures.length > 1) || measures.length > maximumMeasures || authored.length > measures.length) errors.push("controls")
    if (authored.some((record) => record.node.querySelector("button,a[href],input,select,textarea,summary,[tabindex],[contenteditable]"))) errors.push("controls")
    if (this.indicatorSlot?.querySelector("progress,[role=progressbar]")) errors.push("indicator")

    const strokeWidth = this.strokeWidth, circleGap = this.circleGap, viewBoxWidth = this.viewBoxWidth
    const gapDegree = this.gapDegree, gapOffsetDegree = this.gapOffsetDegree, offsetDegree = this.offsetDegree, height = this.height
    for (const [name, value, min, exclusive] of [
      ["stroke-width", strokeWidth, 0, false], ["circle-gap", circleGap, 0, false], ["view-box-width", viewBoxWidth, 0, true],
    ] as const) if (value === undefined || (exclusive ? value <= min : value < min)) errors.push(name)
    if (gapDegree === undefined || gapDegree < 0 || gapDegree > 360) errors.push("gap-degree")
    if (gapOffsetDegree === undefined) errors.push("gap-offset-degree")
    if (offsetDegree === undefined) errors.push("offset-degree")
    if (this.hasAttribute("height") && (height === undefined || height < 0)) errors.push("height")
    if (radial && viewBoxWidth !== undefined && strokeWidth !== undefined && circleGap !== undefined && measures.length
      && viewBoxWidth / 2 - strokeWidth / 2 - (multiple ? measures.length - 1 : 0) * (strokeWidth + circleGap) <= 0) errors.push("geometry")
    const color = paints(this.ownerDocument, this.getAttribute("color"), true)
    const railColor = paints(this.ownerDocument, this.getAttribute("rail-color"), false)
    for (const [name, value] of [["color", color], ["rail-color", railColor]] as const) {
      const array = this.getAttribute(name)?.trim().startsWith("[")
      if (value === null || (array && (!multiple || (value && value.length !== 0 && value.length !== measures.length)))) errors.push(name)
    }
    const borderRadius = cssValue(this.ownerDocument, "border-radius", this.getAttribute("border-radius"), true)
    const fillBorderRadius = cssValue(this.ownerDocument, "border-radius", this.getAttribute("fill-border-radius"), true)
    const textColor = cssValue(this.ownerDocument, "color", this.getAttribute("indicator-text-color"))
    if (borderRadius === null) errors.push("border-radius")
    if (fillBorderRadius === null) errors.push("fill-border-radius")
    if (textColor === null) errors.push("indicator-text-color")
    return { errors: [...new Set(errors)], measures, clamped, multiple, radial, color, railColor, strokeWidth, circleGap,
      viewBoxWidth, gapDegree, gapOffsetDegree, offsetDegree, height, borderRadius, fillBorderRadius, textColor }
  }

  private prepare(): void {
    if (this.nativeGroup?.parentNode !== this || this.graphic?.parentNode !== this || this.indicator?.parentNode !== this) {
      for (const record of this.records) this.restore(record)
      if (this.nativeGroup?.parentNode === this) {
        for (const child of [...this.nativeGroup.children]) {
          if (child instanceof HTMLProgressElement && !this.records.some((record) => record.node === child && record.generated)) this.insertBefore(child, this.nativeGroup)
        }
      }
      if (this.indicator?.parentNode === this && this.indicatorSlot) {
        for (const child of [...this.indicatorSlot.childNodes]) this.insertBefore(child, this.indicator)
      }
      this.records = []
      this.nativeGroup?.remove()
      this.graphic?.remove()
      this.indicator?.remove()
      this.nativeGroup = this.ownerDocument.createElement("span")
      this.nativeGroup.dataset.muiProgressNativeGroup = ""
      this.graphic = this.ownerDocument.createElement("span")
      this.graphic.dataset.muiProgressGraphic = ""
      this.graphic.setAttribute("aria-hidden", "true")
      this.graphic.setAttribute("inert", "")
      const { svg, defs } = createGraphic(this.ownerDocument)
      this.svg = svg
      this.defs = defs
      this.rings = []
      this.graphic.append(svg)
      this.indicator = this.ownerDocument.createElement("span")
      this.indicator.dataset.muiProgressIndicator = ""
      this.text = this.ownerDocument.createElement("span")
      this.text.dataset.muiProgressText = ""
      this.text.setAttribute("aria-hidden", "true")
      this.indicatorSlot = this.ownerDocument.createElement("span")
      this.indicatorSlot.dataset.muiProgressSlot = ""
      this.indicator.append(this.text, this.indicatorSlot)
      this.prepend(this.nativeGroup, this.graphic)
      this.append(this.indicator)
    }
    for (const node of [...this.children]) if (node instanceof HTMLProgressElement) this.nativeGroup!.append(node)
    const native = [...this.nativeGroup!.children].filter((node): node is HTMLProgressElement => node instanceof HTMLProgressElement)
    for (const record of this.records) if (!native.includes(record.node)) this.restore(record)
    this.records = native.map((node) => this.records.find((record) => record.node === node)
      ?? { node, generated: false, overrides: new Map() })
    const loose = [...this.childNodes].filter((node) => {
      if (node === this.nativeGroup || node === this.graphic || node === this.indicator) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches("template,script,style,[data-mui-progress-label]")
    })
    this.indicatorSlot!.append(...loose)
  }

  private css(node: HTMLElement, name: string, value: string | undefined | null): void {
    if (value == null) node.style.removeProperty(name)
    else if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value)
  }

  private synchronize(): void {
    if (!this.ready || !this.isConnected || this.syncing) return
    this.syncing = true
    this.observer?.disconnect()
    this.prepare()
    const config = this.configuration()
    if (config.errors.length) this.setAttribute("data-mui-progress-invalid", config.errors.join(" "))
    else this.removeAttribute("data-mui-progress-invalid")
    this.toggleAttribute("data-mui-progress-clamped", config.clamped)
    this.dataset.muiProgressType = this.type
    this.dataset.muiProgressPlacement = this.indicatorPlacement
    this.toggleAttribute("data-mui-progress-has-label", this.querySelector(":scope > [data-mui-progress-label]") !== null)
    this.toggleAttribute("data-mui-progress-indeterminate", config.measures.some((measure) => measure.percentage === null))
    this.css(this, "--_mui-progress-height", config.height === undefined ? undefined : `${config.height}px`)
    this.css(this, "--_mui-progress-radius", config.borderRadius)
    this.css(this, "--_mui-progress-fill-radius", config.fillBorderRadius)
    this.css(this, "--_mui-progress-text-color", config.textColor)
    this.nativeGroup!.hidden = config.errors.length > 0 || !config.measures.length
    this.graphic!.hidden = config.errors.length > 0 || !config.radial || !config.measures.length
    if (!config.errors.length) {
      const authored = this.records.filter((record) => !record.generated)
      const generated = this.records.filter((record) => record.generated)
      while (authored.length + generated.length > config.measures.length) generated.pop()!.node.remove()
      while (authored.length + generated.length < config.measures.length) {
        const node = this.ownerDocument.createElement("progress")
        generated.push({ node, generated: true, overrides: new Map() })
        this.nativeGroup!.append(node)
      }
      this.records = [...authored, ...generated]
      for (const [index, record] of this.records.entries()) {
        if (this.nativeGroup!.children[index] !== record.node) this.nativeGroup!.insertBefore(record.node, this.nativeGroup!.children[index] ?? null)
        const measure = config.measures[index]!
        this.manage(record, "max", String(measure.max))
        this.manage(record, "value", measure.value === null ? null : String(measure.value))
        for (const name of ["aria-valuenow", "aria-valuemin", "aria-valuemax"]) this.manage(record, name, null)
        this.manage(record, "tabindex", config.radial ? "-1" : undefined)
        const named = this.baseline(record, "aria-label") !== null || this.baseline(record, "aria-labelledby") !== null || Boolean(record.node.labels?.length)
        for (const name of semanticNames) {
          let fallback: string | undefined = this.getAttribute(name) ?? undefined
          if (name === "aria-label") fallback = named || this.getAttribute("aria-labelledby") ? undefined : config.multiple ? `${this.label} ${index + 1}` : this.label
          if (name === "aria-labelledby" && named) fallback = undefined
          this.manage(record, name, this.baseline(record, name) !== null ? undefined : fallback)
        }
        const paint = config.color?.[this.getAttribute("color")?.trim().startsWith("[") ? index : 0]
        const rail = config.railColor?.[this.getAttribute("rail-color")?.trim().startsWith("[") ? index : 0]
        this.css(record.node, "--_mui-progress-fill-start", typeof paint === "string" ? paint : paint?.stops[0])
        this.css(record.node, "--_mui-progress-fill-end", typeof paint === "string" ? paint : paint?.stops[1])
        this.css(record.node, "--_mui-progress-rail", typeof rail === "string" ? rail : undefined)
      }
      this.css(this.nativeGroup!, "--_mui-progress-percent", `${config.measures[0]?.percentage ?? 0}%`)
      if (config.radial) this.renderRings(config)
    }
    const custom = this.indicatorSlot!.hasChildNodes()
    this.text!.hidden = custom || config.errors.length > 0
    const text = config.measures.map((measure) => measure.percentage === null ? "…" : `${Number(measure.percentage.toFixed(2))}${this.unit}`).join(" / ")
    if (this.text!.textContent !== text) this.text!.textContent = text
    this.indicator!.hidden = !this.showIndicator
    this.observer?.observe(this, { childList: true, subtree: true, attributes: true,
      attributeFilter: ["value", "max", "aria-label", "aria-labelledby", "aria-describedby", "aria-valuetext", "tabindex", "data-mui-progress-label"] })
    this.syncing = false
  }

  private renderRings(config: ReturnType<MuiProgress["configuration"]>): void {
    const width = config.viewBoxWidth!
    // Keep native viewBox coordinates while matching the source's stroke-expanded circle.
    const stroke = config.strokeWidth! / (config.multiple ? 1 : 1 + config.strokeWidth! / width)
    this.svg!.setAttribute("viewBox", `0 0 ${width} ${width}`)
    while (this.rings.length > config.measures.length) {
      const ring = this.rings.pop()!
      ring.group.remove()
      ring.gradient.remove()
    }
    while (this.rings.length < config.measures.length) {
      const ring = createRing(this.ownerDocument, `${this.idPrefix}-${this.rings.length}`)
      this.svg!.append(ring.group)
      this.defs!.append(ring.gradient)
      this.rings.push(ring)
    }
    this.rings.forEach((ring, index) => {
      const paint = config.color?.[this.getAttribute("color")?.trim().startsWith("[") ? index : 0]
      const rail = config.railColor?.[this.getAttribute("rail-color")?.trim().startsWith("[") ? index : 0]
      updateRing(ring, {
        center: width / 2,
        radius: width / 2 - stroke / 2 - (config.multiple ? index : 0) * (stroke + config.circleGap!),
        strokeWidth: stroke, gap: config.multiple ? 0 : config.gapDegree!,
        gapOffset: config.multiple ? 0 : config.gapOffsetDegree!, offset: config.multiple ? 0 : config.offsetDegree! + (config.gapDegree ? 0 : 180),
        value: config.measures[index]!.percentage, color: paint, railColor: typeof rail === "string" ? rail : undefined,
      })
    })
  }
}
