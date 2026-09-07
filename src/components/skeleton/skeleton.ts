const maxRepeat = 100
const sizes = ["small", "medium", "large"]
export type SkeletonValidationError = "width" | "height" | "repeat" | "size"

function repeatCount(value: string | null): number | undefined {
  if (value === null) return 1
  if (!/^\d+$/.test(value.trim())) return undefined
  const count = Number(value)
  return Number.isSafeInteger(count) && count <= maxRepeat ? count : undefined
}

function dimension(document: Document, name: "width" | "height", value: string | null): string | null | undefined {
  if (value === null) return undefined
  let candidate = value.trim()
  if (!candidate || /^(inherit|initial|unset|revert|revert-layer)$/i.test(candidate)) return null
  const plain = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)([a-z%]*)$/i.exec(candidate)
  if (plain) {
    const number = Number(plain[1])
    if (!Number.isFinite(number) || number < 0) return null
    if (!plain[2]) candidate = `${number}px`
  }
  const probe = document.createElement("span").style
  probe.setProperty(name, candidate)
  return probe.getPropertyValue(name) || null
}

export class MuiSkeleton extends HTMLElement {
  public static get observedAttributes(): string[] { return ["width", "height", "repeat", "size"] }

  private group: HTMLSpanElement | undefined
  private bars: HTMLSpanElement[] = []
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["width", "height", "repeat", "size", "text", "round", "circle", "animated", "sharp"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.dataset.muiSkeleton = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }
  public get width(): string | undefined { return this.getAttribute("width") ?? undefined }
  public set width(value: string | number | null | undefined) { this.setDimension("width", value) }
  public get height(): string | undefined { return this.getAttribute("height") ?? undefined }
  public set height(value: string | number | null | undefined) { this.setDimension("height", value) }
  public get repeat(): number | undefined { return repeatCount(this.getAttribute("repeat")) }
  public set repeat(value: string | number | null | undefined) {
    if (value == null) this.removeAttribute("repeat")
    else if (repeatCount(String(value)) === undefined) throw new RangeError("Skeleton repeat must be an integer from 0 to 100.")
    else this.setAttribute("repeat", String(value))
  }
  public get size(): string | undefined { return this.getAttribute("size") ?? undefined }
  public set size(value: string | null | undefined) {
    if (value == null) this.removeAttribute("size")
    else if (!sizes.includes(value)) throw new RangeError("Skeleton size must be small, medium or large.")
    else this.setAttribute("size", value)
  }
  public get text(): boolean { return this.hasAttribute("text") }
  public set text(value: boolean) { this.toggleAttribute("text", value) }
  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.toggleAttribute("round", value) }
  public get circle(): boolean { return this.hasAttribute("circle") }
  public set circle(value: boolean) { this.toggleAttribute("circle", value) }
  public get animated(): boolean { return this.getAttribute("animated") !== "false" }
  public set animated(value: boolean) { this.setAttribute("animated", String(value)) }
  public get sharp(): boolean { return this.getAttribute("sharp") !== "false" }
  public set sharp(value: boolean) { this.setAttribute("sharp", String(value)) }
  public get validationErrors(): readonly SkeletonValidationError[] { return this.configuration().errors }
  public get valid(): boolean { return this.validationErrors.length === 0 }

  private setDimension(name: "width" | "height", value: string | number | null | undefined): void {
    if (value == null) {
      this.removeAttribute(name)
      return
    }
    if (dimension(this.ownerDocument, name, String(value)) === null) {
      throw new RangeError(`Skeleton ${name} must be a nonnegative finite number or supported CSS dimension.`)
    }
    this.setAttribute(name, String(value))
  }

  private configuration(): { width: string | null | undefined; height: string | null | undefined; count: number | undefined; errors: SkeletonValidationError[] } {
    const width = dimension(this.ownerDocument, "width", this.getAttribute("width"))
    const height = dimension(this.ownerDocument, "height", this.getAttribute("height"))
    const count = repeatCount(this.getAttribute("repeat"))
    const errors: SkeletonValidationError[] = []
    if (width === null) errors.push("width")
    if (height === null) errors.push("height")
    if (count === undefined) errors.push("repeat")
    if (this.size !== undefined && !sizes.includes(this.size)) errors.push("size")
    return { width, height, count, errors }
  }

  private synchronize(): void {
    this.observer?.disconnect()
    const { width, height, count, errors } = this.configuration()
    for (const [name, value] of [["width", width], ["height", height]] as const) {
      const property = `--_mui-skeleton-${name}`
      if (value == null) this.style.removeProperty(property)
      else if (this.style.getPropertyValue(property) !== value) this.style.setProperty(property, value)
    }
    if (errors.length) this.setAttribute("data-mui-skeleton-invalid", errors.join(" "))
    else this.removeAttribute("data-mui-skeleton-invalid")
    const relativeHeight = !errors.length && Boolean(count) && typeof height === "string" && /%|(?:var|env)\(/i.test(height)
    this.toggleAttribute("data-mui-skeleton-relative-height", relativeHeight)
    if (relativeHeight) {
      if (this.style.getPropertyValue("--_mui-skeleton-repeat") !== String(count)) this.style.setProperty("--_mui-skeleton-repeat", String(count))
    } else {
      this.style.removeProperty("--_mui-skeleton-repeat")
    }
    if (this.group?.parentNode !== this) {
      this.group = this.ownerDocument.createElement("span")
      this.group.dataset.muiSkeletonGroup = ""
      this.bars = []
      this.prepend(this.group)
    }
    const group = this.group
    if (group.getAttribute("aria-hidden") !== "true") group.setAttribute("aria-hidden", "true")
    if (!group.hasAttribute("inert")) group.setAttribute("inert", "")
    group.hidden = errors.length > 0 || count === 0
    this.bars = this.bars.filter((bar) => bar.parentNode === group)
    if (!errors.length && count !== undefined) {
      while (this.bars.length > count) this.bars.pop()!.remove()
      while (this.bars.length < count) {
        const bar = this.ownerDocument.createElement("span")
        bar.dataset.muiSkeletonItem = ""
        group.append(bar)
        this.bars.push(bar)
      }
    }
    if (this.isConnected) this.observer?.observe(this, { childList: true, subtree: true })
  }
}
