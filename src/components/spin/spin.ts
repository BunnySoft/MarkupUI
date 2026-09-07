const presets = ["small", "medium", "large"]
const inertElements = "template,script,style"
const maximumDelay = 2_147_483_647
export type SpinValidationError = "size" | "delay" | "stroke-width" | "radius" | "scale" | "stroke"

function numeric(value: string | null, fallback?: number): number | undefined {
  if (value === null) return fallback
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(value.trim())) return undefined
  const result = Number(value)
  return Number.isFinite(result) ? result : undefined
}

function color(document: Document, value: string | null): string | null | undefined {
  if (value === null) return undefined
  if (!value.trim() || /^(inherit|initial|unset|revert|revert-layer)$/i.test(value.trim())) return null
  const probe = document.createElement("span").style
  probe.color = value
  return probe.color || null
}

export class MuiSpin extends HTMLElement {
  public static get observedAttributes(): string[] {
    return ["show", "delay", "size", "stroke-width", "radius", "scale", "stroke", "description", "label", "hidden", "aria-label", "aria-labelledby"]
  }

  private content: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private indicator: HTMLSpanElement | undefined
  private iconBox: HTMLSpanElement | undefined
  private descriptionBox: HTMLSpanElement | undefined
  private descriptionSlot: HTMLSpanElement | undefined
  private textNode: HTMLSpanElement | undefined
  private svg: SVGSVGElement | undefined
  private circleNode: SVGCircleElement | undefined
  private observer: MutationObserver | undefined
  private timer: ReturnType<typeof setTimeout> | undefined
  private timerDelay: number | undefined
  private generation = 0
  private requested = false
  private wrapped = false
  private shown = false
  private invalid = false
  private ready = false
  private upgraded = false

  public connectedCallback(): void {
    this.ready = false
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["show", "delay", "size", "strokeWidth", "radius", "scale", "stroke", "description", "label", "rotate"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiSpin = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
    this.cancelTimer()
    this.requested = false
    this.shown = false
    this.renderState()
  }

  public attributeChangedCallback(): void { if (this.isConnected && this.ready) this.synchronize() }
  public get contentElement(): HTMLElement | null { return this.content ?? null }
  public get indicatorElement(): HTMLElement | null { return this.indicator ?? null }
  public get active(): boolean { return this.shown }
  public get valid(): boolean { return this.validationErrors.length === 0 }
  public get validationErrors(): readonly SpinValidationError[] { return this.configuration().errors }
  public get show(): boolean { return this.getAttribute("show") !== "false" }
  public set show(value: boolean) { this.setAttribute("show", String(value)) }
  public get rotate(): boolean { return this.getAttribute("rotate") !== "false" }
  public set rotate(value: boolean) { this.setAttribute("rotate", String(value)) }
  public get description(): string | undefined { return this.getAttribute("description") ?? undefined }
  public set description(value: string | null | undefined) { this.setText("description", value) }
  public get label(): string { return this.getAttribute("label")?.trim() || "Loading" }
  public set label(value: string | null | undefined) { this.setText("label", value) }
  public get size(): string | number | undefined {
    const value = this.getAttribute("size") ?? "medium"
    if (presets.includes(value)) return value
    const number = numeric(value)
    return number !== undefined && number >= 0 ? number : undefined
  }
  public set size(value: string | number | null | undefined) {
    if (value == null) this.removeAttribute("size")
    else if (typeof value === "string" && presets.includes(value)) this.setAttribute("size", value)
    else this.setNumber("size", value, 0)
  }
  public get delay(): number | undefined {
    const value = numeric(this.getAttribute("delay"), 0)
    return value !== undefined && Number.isInteger(value) && value >= 0 && value <= maximumDelay ? value : undefined
  }
  public set delay(value: number | null | undefined) { this.setNumber("delay", value, 0, maximumDelay, true) }
  public get radius(): number | undefined {
    const value = numeric(this.getAttribute("radius"), 100)
    return value !== undefined && value > 0 ? value : undefined
  }
  public set radius(value: number | null | undefined) { this.setNumber("radius", value, 0, undefined, false, true) }
  public get scale(): number | undefined {
    const value = numeric(this.getAttribute("scale"), 1)
    return value !== undefined && value > 0 ? value : undefined
  }
  public set scale(value: number | null | undefined) { this.setNumber("scale", value, 0, undefined, false, true) }
  public get strokeWidth(): number | undefined {
    const fallback = this.size === "small" ? 20 : this.size === "large" ? 16 : 18
    const value = numeric(this.getAttribute("stroke-width"), fallback)
    return value !== undefined && value >= 0 ? value : undefined
  }
  public set strokeWidth(value: number | null | undefined) { this.setNumber("stroke-width", value, 0) }
  public get stroke(): string | undefined { return this.getAttribute("stroke") ?? undefined }
  public set stroke(value: string | null | undefined) {
    if (color(this.ownerDocument, value ?? null) === null) throw new RangeError("Spin stroke must be a supported CSS color.")
    this.setText("stroke", value)
  }

  private setText(name: string, value: string | null | undefined): void {
    if (value == null) this.removeAttribute(name)
    else this.setAttribute(name, value)
  }

  private setNumber(name: string, value: string | number | null | undefined, minimum: number, maximum?: number, integer = false, exclusive = false): void {
    if (value == null) { this.removeAttribute(name); return }
    const number = numeric(String(value))
    if (number === undefined || (exclusive ? number <= minimum : number < minimum)
      || (maximum !== undefined && number > maximum) || (integer && !Number.isInteger(number))) {
      throw new RangeError(`Invalid Spin ${name}.`)
    }
    this.setAttribute(name, String(value))
  }

  private configuration() {
    const size = this.size, delay = this.delay, radius = this.radius, scale = this.scale, strokeWidth = this.strokeWidth
    const stroke = color(this.ownerDocument, this.getAttribute("stroke"))
    const errors: SpinValidationError[] = []
    if (size === undefined) errors.push("size")
    if (delay === undefined) errors.push("delay")
    if (radius === undefined) errors.push("radius")
    if (scale === undefined || (radius !== undefined && (!Number.isFinite(radius / scale * 2) || radius / scale * 2 <= 0))) errors.push("scale")
    if (strokeWidth === undefined || (radius !== undefined && strokeWidth >= radius * 2)) errors.push("stroke-width")
    if (stroke === null) errors.push("stroke")
    return { size, delay, radius, scale, strokeWidth, stroke, errors }
  }

  private synchronize(): void {
    if (!this.ready || !this.isConnected) return
    this.observer?.disconnect()
    const config = this.configuration()
    this.invalid = config.errors.length > 0
    if (this.invalid) this.setAttribute("data-mui-spin-invalid", config.errors.join(" "))
    else this.removeAttribute("data-mui-spin-invalid")
    if (typeof config.size === "number") {
      if (this.style.getPropertyValue("--_mui-spin-size") !== `${config.size}px`) this.style.setProperty("--_mui-spin-size", `${config.size}px`)
    } else {
      this.style.removeProperty("--_mui-spin-size")
    }
    this.prepareContent()
    this.updateDescription()
    if (!this.invalid && !this.hasCustomIcon()) {
      this.ensureGraphic()
      const center = config.radius! / config.scale!
      this.svg!.setAttribute("viewBox", `0 0 ${center * 2} ${center * 2}`)
      if (config.stroke === undefined) this.svg!.removeAttribute("color")
      else this.svg!.setAttribute("color", config.stroke!)
      this.circleNode!.setAttribute("cx", String(center))
      this.circleNode!.setAttribute("cy", String(center))
      this.circleNode!.setAttribute("r", String(config.radius! - config.strokeWidth! / 2))
      this.circleNode!.setAttribute("stroke-width", String(config.strokeWidth))
    } else if (this.hasCustomIcon()) {
      this.svg?.remove()
    }
    this.toggleAttribute("data-mui-spin-custom-icon", this.hasCustomIcon())
    const wrapped = this.content !== undefined
    const changedMode = wrapped !== this.wrapped
    const requested = !this.hidden && !this.invalid && (!wrapped || this.show)
    const previousRequest = this.requested
    this.wrapped = wrapped
    this.requested = requested
    this.dataset.muiSpinMode = wrapped ? "wrapped" : "standalone"
    if (!requested) {
      this.cancelTimer()
      this.shown = false
    } else if (!wrapped || config.delay === 0) {
      this.cancelTimer()
      this.shown = true
    } else if (changedMode || !previousRequest || (!this.shown && this.timerDelay !== config.delay)) {
      this.cancelTimer()
      this.shown = false
      this.timerDelay = config.delay
      const generation = this.generation
      this.timer = setTimeout(() => {
        if (generation !== this.generation || !this.ready || !this.isConnected || !this.requested) return
        this.timer = undefined
        this.timerDelay = undefined
        this.shown = true
        this.renderState()
      }, config.delay)
    }
    this.renderState()
    this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-mui-spin-content", "data-mui-spin-icon", "data-mui-spin-description"],
    })
  }

  private prepareContent(): void {
    if (this.indicator?.parentNode !== this) {
      this.indicator = this.ownerDocument.createElement("span")
      this.indicator.dataset.muiSpinIndicator = ""
      this.iconBox = this.ownerDocument.createElement("span")
      this.iconBox.dataset.muiSpinIconBox = ""
      this.descriptionBox = this.ownerDocument.createElement("span")
      this.descriptionBox.dataset.muiSpinDescriptionArea = ""
      this.textNode = this.ownerDocument.createElement("span")
      this.textNode.dataset.muiSpinText = ""
      this.descriptionSlot = this.ownerDocument.createElement("span")
      this.descriptionSlot.dataset.muiSpinDescriptionSlot = ""
      this.descriptionBox.append(this.textNode, this.descriptionSlot)
      this.indicator.append(this.iconBox, this.descriptionBox)
      this.svg = undefined
      this.circleNode = undefined
      this.append(this.indicator)
    }
    for (const [box, attribute] of [[this.iconBox!, "data-mui-spin-icon"], [this.descriptionSlot!, "data-mui-spin-description"]] as const) {
      for (const child of [...box.children]) {
        if (child !== this.svg && !child.hasAttribute(attribute)) this.insertBefore(child, this.indicator)
      }
      for (const child of [...this.children]) {
        if (child.hasAttribute(attribute) && !child.matches(inertElements)) box.append(child)
      }
    }
    if (this.generatedContent?.parentNode !== this) this.generatedContent = undefined
    let content = [...this.children].find((node): node is HTMLElement =>
      node instanceof HTMLElement && node !== this.generatedContent && node.hasAttribute("data-mui-spin-content") && !node.matches(inertElements))
      ?? this.generatedContent
    if (content && this.generatedContent && content !== this.generatedContent) {
      content.prepend(...this.generatedContent.childNodes)
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    const loose = [...this.childNodes].filter((node) => {
      if (node === this.indicator || node === content) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(inertElements)
    })
    if (loose.length) {
      if (!content) {
        this.generatedContent = this.ownerDocument.createElement("div")
        this.generatedContent.dataset.muiSpinContent = ""
        content = this.generatedContent
        this.insertBefore(content, this.indicator)
      }
      content.append(...loose)
    }
    if (this.generatedContent && !this.generatedContent.hasChildNodes()) {
      this.generatedContent.remove()
      this.generatedContent = undefined
      content = undefined
    }
    this.content = content
  }

  private hasCustomIcon(): boolean { return Boolean(this.iconBox?.querySelector(":scope > [data-mui-spin-icon]")) }

  private ensureGraphic(): void {
    if (!this.svg) {
      const namespace = "http://www.w3.org/2000/svg"
      this.svg = this.ownerDocument.createElementNS(namespace, "svg")
      this.svg.setAttribute("data-mui-spin-default", "")
      this.svg.setAttribute("aria-hidden", "true")
      this.svg.setAttribute("focusable", "false")
      this.svg.setAttribute("fill", "none")
      this.svg.setAttribute("stroke", "currentColor")
      this.circleNode = this.ownerDocument.createElementNS(namespace, "circle")
      this.circleNode.setAttribute("pathLength", "100")
      this.circleNode.setAttribute("stroke-dasharray", "72 28")
      this.circleNode.setAttribute("stroke-linecap", "round")
      this.svg.append(this.circleNode)
    }
    if (this.svg.parentNode !== this.iconBox) this.iconBox!.append(this.svg)
  }

  private updateDescription(): void {
    const description = this.description?.trim()
    const custom = this.descriptionSlot!.hasChildNodes()
    const explicitName = Boolean(this.getAttribute("aria-label")?.trim() || this.getAttribute("aria-labelledby")?.trim())
    const fallback = !description && !custom && !explicitName
    const text = description || (fallback ? this.label : "")
    if (this.textNode!.textContent !== text) this.textNode!.textContent = text
    this.textNode!.hidden = !description && !fallback
    this.textNode!.toggleAttribute("data-mui-spin-fallback", fallback)
    this.descriptionSlot!.hidden = Boolean(description)
    this.descriptionBox!.toggleAttribute("data-mui-spin-visible-description", Boolean(description) || custom)
  }

  private cancelTimer(): void {
    this.generation++
    if (this.timer !== undefined) clearTimeout(this.timer)
    this.timer = undefined
    this.timerDelay = undefined
  }

  private renderState(): void {
    if (this.indicator) this.indicator.hidden = !this.shown
    this.toggleAttribute("data-mui-spin-active", this.shown && this.wrapped)
    this.dataset.muiSpinState = this.invalid ? "invalid" : this.shown ? "visible" : this.timer !== undefined ? "waiting" : "hidden"
  }
}
