import { ViewElement } from "../../core/index.js"

export class CarouselViewport extends ViewElement {
  public static readonly tag = "m-carousel-viewport"
  public static readonly observedAttributes: string[] = []
  public connectedCallback(): void { this.dataset.part = "viewport" }
}

export class CarouselItem extends ViewElement {
  public static readonly tag = "m-carousel-item"
  public static readonly observedAttributes: string[] = []
  public connectedCallback(): void {
    this.upgradeProperties()
    this.dataset.part = "item"
  }
  /** Optional unique nonempty identity for replacement items; call Carousel.refresh after edits. */
  public get key(): string | null { return this.getAttribute("key") }
  public set key(value: string | null) {
    if (value !== null && (typeof value !== "string" || !value.trim())) throw new RangeError("key must be nonempty.")
    this.setStringAttribute("key", value)
  }
  public get index(): number { return this.numberAttribute("data-index", -1) }
  public get current(): boolean { return this.matches('[data-state~="current"]') }
  public get previous(): boolean { return this.matches('[data-state~="previous"]') }
  public get next(): boolean { return this.matches('[data-state~="next"]') }
}

export class CarouselControls extends ViewElement {
  public static readonly tag = "m-carousel-controls"
  public static readonly observedAttributes: string[] = []
  public connectedCallback(): void { this.dataset.part = "controls" }
}

export class CarouselReadout extends ViewElement {
  public static readonly tag = "m-carousel-readout"
  public static readonly observedAttributes: string[] = []
  public connectedCallback(): void { this.dataset.part = "readout" }
}
