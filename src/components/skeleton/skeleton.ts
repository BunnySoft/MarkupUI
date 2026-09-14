import { ViewElement } from "../../core/index.js"
import { skeletonSizes } from "./model.js"
import type { SkeletonSize, SkeletonValidationError } from "./model.js"

export { skeletonSizes } from "./model.js"
export type { SkeletonPresetSize, SkeletonSize, SkeletonValidationError } from "./model.js"

const maxRepeat = 100

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

/**
 * A decorative placeholder for loading content, supporting shapes, repetition, and dimension normalization.
 */
export class Skeleton extends ViewElement {
  public static readonly tag = "m-skeleton"
  public static get observedAttributes(): string[] {
    return ["width", "height", "repeat", "size", "text", "round", "circle", "animated", "sharp"]
  }

  private group: HTMLSpanElement | undefined
  private bars: HTMLSpanElement[] = []
  private observer: MutationObserver | undefined
  private ready = false
  private upgraded = false

  public connectedCallback(): void {
    this.ready = false
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mSkeleton = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected && this.ready) this.synchronize()
  }

  public get width(): string | undefined {
    const value = this.getAttribute("width")
    if (value === null) return undefined
    return value
  }
  public set width(value: string | number | null | undefined) {
    this.setDimension("width", value)
  }

  public get height(): string | undefined {
    const value = this.getAttribute("height")
    if (value === null) return undefined
    return value
  }
  public set height(value: string | number | null | undefined) {
    this.setDimension("height", value)
  }

  /**
   * @min 0
   * @max 100
   * @integer
   */
  public get repeat(): number | undefined {
    return repeatCount(this.getAttribute("repeat"))
  }
  public set repeat(value: string | number | null | undefined) {
    if (value == null) {
      this.removeAttribute("repeat")
    } else if (repeatCount(String(value)) === undefined) {
      throw new RangeError("Skeleton repeat must be an integer from 0 to 100.")
    } else {
      this.setAttribute("repeat", String(value))
    }
  }

  public get size(): SkeletonSize | undefined {
    const value = this.getAttribute("size")
    if (value === null) return undefined
    return value as SkeletonSize
  }
  public set size(value: SkeletonSize | null | undefined) {
    if (value == null) {
      this.removeAttribute("size")
    } else if (!skeletonSizes.includes(value as any)) {
      throw new RangeError("Skeleton size must be small, medium or large.")
    } else {
      this.setAttribute("size", value)
    }
  }

  public get text(): boolean { return this.hasAttribute("text") }
  public set text(value: boolean) { this.setBooleanAttribute("text", value, true) }

  public get round(): boolean { return this.hasAttribute("round") }
  public set round(value: boolean) { this.setBooleanAttribute("round", value, true) }

  public get circle(): boolean { return this.hasAttribute("circle") }
  public set circle(value: boolean) { this.setBooleanAttribute("circle", value, true) }

  public get animated(): boolean { return this.booleanAttribute("animated", true) }
  public set animated(value: boolean) { this.setBooleanAttribute("animated", value, false) }

  public get sharp(): boolean { return this.booleanAttribute("sharp", true) }
  public set sharp(value: boolean) { this.setBooleanAttribute("sharp", value, false) }

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
    const size = this.getAttribute("size")
    if (size !== null && !skeletonSizes.includes(size as any)) errors.push("size")
    return { width, height, count, errors }
  }

  private synchronize(): void {
    if (!this.ready || !this.isConnected) return
    this.observer?.disconnect()
    const { width, height, count, errors } = this.configuration()
    for (const [name, value] of [["width", width], ["height", height]] as const) {
      const property = `--_m-skeleton-${name}`
      if (value == null) this.style.removeProperty(property)
      else if (this.style.getPropertyValue(property) !== value) this.style.setProperty(property, value)
    }
    if (errors.length) this.setAttribute("data-m-skeleton-invalid", errors.join(" "))
    else this.removeAttribute("data-m-skeleton-invalid")
    const relativeHeight = !errors.length && Boolean(count) && typeof height === "string" && /%|(?:var|env)\(/i.test(height)
    this.toggleAttribute("data-m-skeleton-relative-height", relativeHeight)
    if (relativeHeight) {
      if (this.style.getPropertyValue("--_m-skeleton-repeat") !== String(count)) this.style.setProperty("--_m-skeleton-repeat", String(count))
    } else {
      this.style.removeProperty("--_m-skeleton-repeat")
    }
    if (this.group?.parentNode !== this) {
      this.group = this.ownerDocument.createElement("span")
      this.group.dataset.mSkeletonGroup = ""
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
        bar.dataset.mSkeletonItem = ""
        group.append(bar)
        this.bars.push(bar)
      }
    }
    if (this.isConnected) this.observer?.observe(this, { childList: true, subtree: true })
  }
}

export { Skeleton as MSkeleton }
