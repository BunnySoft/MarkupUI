class MCarouselRegion extends HTMLElement {
  protected marker = ""

  public connectedCallback(): void {
    this.toggleAttribute(this.marker, true)
  }
}

export class MCarouselViewport extends MCarouselRegion {
  protected override marker = "data-carousel-viewport"
}

export class MCarouselItem extends MCarouselRegion {
  protected override marker = "data-carousel-item"
}

export class MCarouselControls extends MCarouselRegion {
  protected override marker = "data-carousel-controls"
}

export class MCarouselReadout extends MCarouselRegion {
  protected override marker = "data-carousel-readout"
}
