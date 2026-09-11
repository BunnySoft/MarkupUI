import { createCarousel } from "./carousel.js"
import type { CarouselController, CarouselSettings, CarouselState } from "./carousel.js"

const observedAttributes = [
  "current-index",
  "default-index",
  "direction",
  "loop",
  "autoplay",
  "interval",
  "keyboard",
  "smooth",
  "disabled",
]

export class MCarousel extends HTMLElement {
  public static get observedAttributes(): string[] {
    return observedAttributes
  }

  private carousel: CarouselController | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      for (const name of ["currentIndex", "defaultIndex", "direction", "loop", "autoplay", "interval", "keyboard", "smooth", "disabled"]) {
        if (Object.prototype.hasOwnProperty.call(this, name)) {
          const value: unknown = Reflect.get(this, name)
          Reflect.deleteProperty(this, name)
          Reflect.set(this, name, value)
        }
      }
    }
    this.classList.add("m-carousel")
    this.toggleAttribute("data-carousel", true)
    this.carousel ??= createCarousel(this, this.settings())
  }

  public disconnectedCallback(): void {
    this.carousel?.disconnect()
    this.carousel = undefined
  }

  public attributeChangedCallback(): void {
    if (this.carousel) {
      this.carousel.set(this.settings())
    }
  }

  public get controller(): CarouselController {
    if (!this.carousel) {
      throw new Error("Carousel is not connected.")
    }
    return this.carousel
  }

  public get state(): CarouselState {
    return this.controller.state
  }

  public get slides(): readonly HTMLElement[] {
    return this.controller.slides
  }

  public get currentIndex(): number {
    return this.carousel?.getCurrentIndex() ?? this.number("current-index", 0)
  }

  public set currentIndex(value: number) {
    this.setAttribute("current-index", String(value))
  }

  public get defaultIndex(): number {
    return this.number("default-index", 0)
  }

  public set defaultIndex(value: number) {
    this.setAttribute("default-index", String(value))
  }

  public get direction(): "horizontal" | "vertical" {
    return this.getAttribute("direction") === "vertical" ? "vertical" : "horizontal"
  }

  public set direction(value: "horizontal" | "vertical") {
    this.setAttribute("direction", value)
  }

  public get loop(): boolean {
    return this.boolean("loop", true)
  }

  public set loop(value: boolean) {
    this.setAttribute("loop", String(value))
  }

  public get autoplay(): boolean {
    return this.boolean("autoplay", false)
  }

  public set autoplay(value: boolean) {
    this.setAttribute("autoplay", String(value))
  }

  public get interval(): number {
    return this.number("interval", 5000)
  }

  public set interval(value: number) {
    this.setAttribute("interval", String(value))
  }

  public get keyboard(): boolean {
    return this.boolean("keyboard", true)
  }

  public set keyboard(value: boolean) {
    this.setAttribute("keyboard", String(value))
  }

  public get smooth(): boolean {
    return this.boolean("smooth", true)
  }

  public set smooth(value: boolean) {
    this.setAttribute("smooth", String(value))
  }

  public get disabled(): boolean {
    return this.boolean("disabled", false)
  }

  public set disabled(value: boolean) {
    this.setAttribute("disabled", String(value))
  }

  public to(index: number): void {
    this.controller.to(index)
  }

  public prev(): void {
    this.controller.prev()
  }

  public next(): void {
    this.controller.next()
  }

  public play(): void {
    this.controller.play()
  }

  public pause(): void {
    this.controller.pause()
  }

  public reset(): void {
    this.controller.reset()
  }

  public refresh(): void {
    this.controller.refresh()
  }

  private settings(): CarouselSettings {
    const settings: CarouselSettings = {
      defaultIndex: this.defaultIndex,
      direction: this.direction,
      loop: this.loop,
      autoplay: this.autoplay,
      interval: this.interval,
      keyboard: this.keyboard,
      smooth: this.smooth,
      disabled: this.disabled,
    }
    if (this.hasAttribute("current-index")) {
      settings.currentIndex = this.number("current-index", 0)
    }
    return settings
  }

  private boolean(name: string, fallback: boolean): boolean {
    const value = this.getAttribute(name)
    return value === null ? fallback : value !== "false"
  }

  private number(name: string, fallback: number): number {
    const value = this.getAttribute(name)
    return value === null ? fallback : Number(value)
  }
}
