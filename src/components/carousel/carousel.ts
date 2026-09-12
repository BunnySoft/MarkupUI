import { ViewElement } from "../../core/index.js"
import { createCarousel } from "./controller.js"
import type { CarouselController } from "./controller.js"
import { carouselDirections, validateCarouselGap } from "./model.js"
import type { CarouselCurrentChangedDetail, CarouselDirection, CarouselState } from "./model.js"
import type { CarouselItem } from "./regions.js"

/**
 * One-view native scroll snap with settled identity and safe opt-in rotation.
 * @region {"name":"viewport","element":"m-carousel-viewport","accepts":["CarouselItem"],"min":1,"max":1}
 * @region {"name":"items","element":"m-carousel-item","accepts":["content","controls"],"min":0,"max":null}
 * @region {"name":"controls","element":"m-carousel-controls","accepts":["native buttons"],"min":0,"max":1}
 * @region {"name":"readout","element":"m-carousel-readout","accepts":["text"],"min":1,"max":1}
 */
export class Carousel extends ViewElement {
  public static readonly tag = "m-carousel"
  public static get observedAttributes(): string[] {
    return ["current-index", "default-index", "direction", "gap", "loop", "autoplay", "interval", "keyboard", "smooth", "disabled"]
  }

  private carousel: CarouselController | undefined
  private upgraded = false
  private requestedIndex: number | undefined
  private resume: { index: number; item: HTMLElement | null; key: string | null; paused: boolean } | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    if (this.carousel) return
    this.dataset.part = "carousel"
    const items = [...(this.querySelector(":scope > m-carousel-viewport")?.children ?? [])]
    const retained = this.resume?.item
    const identity = retained && items.includes(retained) ? items.indexOf(retained)
      : this.resume?.key ? items.findIndex(item => item.getAttribute("key") === this.resume!.key) : -1
    const currentIndex = this.requestedIndex ?? (this.resume ? identity >= 0 ? identity : this.resume.index
      : this.hasAttribute("current-index") ? this.currentIndex : this.defaultIndex)
    this.carousel = createCarousel(this, {
      currentIndex, defaultIndex: this.defaultIndex, direction: this.direction, gap: this.gap, loop: this.loop,
      autoplay: this.autoplay, interval: this.interval, keyboard: this.keyboard, smooth: this.smooth, disabled: this.disabled,
      onChange: detail => { this.emit<CarouselCurrentChangedDetail>("m:current-changed", detail) },
    })
    this.requestedIndex = undefined
    if (this.resume?.paused) this.carousel.pause()
    this.resume = undefined
  }

  public disconnectedCallback(): void {
    if (!this.carousel) return
    const index = this.carousel.getCurrentIndex(), item = this.carousel.slides[index] ?? null
    this.resume = { index, item, key: item?.getAttribute("key") ?? null, paused: this.carousel.state.paused }
    this.carousel.disconnect()
    this.carousel = undefined
  }

  public attributeChangedCallback(name: string, previous: string | null, value: string | null): void {
    if (previous === value) return
    if (name === "current-index") {
      if (value === null) {
        this.requestedIndex = undefined
        return
      }
      const index = this.integer(this.numberAttribute("current-index", 0))
      if (this.carousel) this.carousel.request(index)
      else this.requestedIndex = index
      return
    }
    if (!this.carousel) return
    switch (name) {
      case "default-index": this.carousel.set({ defaultIndex: this.defaultIndex }); break
      case "direction": this.carousel.set({ direction: this.direction }); break
      case "gap": this.carousel.set({ gap: this.gap }); break
      case "loop": this.carousel.set({ loop: this.loop }); break
      case "autoplay": this.carousel.set({ autoplay: this.autoplay }); break
      case "interval": this.carousel.set({ interval: this.interval }); break
      case "keyboard": this.carousel.set({ keyboard: this.keyboard }); break
      case "smooth": this.carousel.set({ smooth: this.smooth }); break
      case "disabled": this.carousel.set({ disabled: this.disabled }); break
    }
  }

  /** Settled index when connected; writes request a clamped target, not a wrapping command.
   * @integer
   * @min -9007199254740991
   * @max 9007199254740991
   */
  public get currentIndex(): number {
    if (this.carousel) return this.carousel.getCurrentIndex()
    if (this.requestedIndex !== undefined) return this.requestedIndex
    if (this.resume) return this.resume.index
    const index = this.integer(this.numberAttribute("current-index", 0))
    return this.hasAttribute("current-index") ? index : this.defaultIndex
  }
  public set currentIndex(value: number) {
    this.integer(value)
    if (this.getAttribute("current-index") === String(value)) {
      if (this.carousel) this.carousel.request(value)
      else this.requestedIndex = value
    } else this.setAttribute("current-index", String(value))
  }

  /** @integer
   * @min -9007199254740991
   * @max 9007199254740991
   */
  public get defaultIndex(): number { return this.integer(this.numberAttribute("default-index", 0)) }
  public set defaultIndex(value: number) { this.setAttribute("default-index", String(this.integer(value))) }
  public get direction(): CarouselDirection { return this.choiceAttribute("direction", carouselDirections, "horizontal") }
  public set direction(value: CarouselDirection) { this.setChoiceAttribute("direction", value, carouselDirections) }
  /** Space between full-view slides, in logical units mapped to CSS pixels on Web.
   * @min 0
   */
  public get gap(): number {
    return validateCarouselGap(this.numberAttribute("gap", 0))
  }
  public set gap(value: number) {
    this.setAttribute("gap", String(validateCarouselGap(value)))
  }
  public get loop(): boolean { return this.booleanAttribute("loop", true) }
  public set loop(value: boolean) { this.setBooleanAttribute("loop", value, false) }
  public get autoplay(): boolean { return this.booleanAttribute("autoplay", false) }
  public set autoplay(value: boolean) {
    this.carousel?.validate({ autoplay: value })
    this.setBooleanAttribute("autoplay", value, false)
  }
  /** Delay in milliseconds; timers start after a completed move.
   * @integer
   * @min 1000
   * @max 2147483647
   */
  public get interval(): number { return this.duration(this.numberAttribute("interval", 5000)) }
  public set interval(value: number) { this.setAttribute("interval", String(this.duration(value))) }
  public get keyboard(): boolean { return this.booleanAttribute("keyboard", true) }
  public set keyboard(value: boolean) { this.setBooleanAttribute("keyboard", value, false) }
  public get smooth(): boolean { return this.booleanAttribute("smooth", true) }
  public set smooth(value: boolean) { this.setBooleanAttribute("smooth", value, false) }
  public get disabled(): boolean { return this.booleanAttribute("disabled", false) }
  public set disabled(value: boolean) { this.setBooleanAttribute("disabled", value, false) }

  /** Live immutable snapshot; unavailable while disconnected. */
  public get state(): CarouselState { return this.controller.state }
  /** Authored item identities; never clones. Unavailable while disconnected. */
  public get items(): readonly CarouselItem[] { return this.controller.slides as readonly CarouselItem[] }

  public to(index: number): void { this.controller.to(index) }
  public previous(): void { this.controller.prev() }
  public next(): void { this.controller.next() }
  public play(): void { this.controller.play() }
  public pause(): void { this.controller.pause() }
  public reset(): void { this.controller.reset() }
  public refresh(): void { this.controller.refresh() }

  private get controller(): CarouselController {
    if (!this.carousel) throw new Error("Carousel is not connected.")
    return this.carousel
  }
  private integer(value: number): number {
    if (!Number.isSafeInteger(value)) throw new RangeError("Index must be a safe integer.")
    return value
  }
  private duration(value: number): number {
    if (!Number.isInteger(value) || value < 1000 || value > 2147483647) throw new RangeError("interval must be 1000..2147483647 milliseconds.")
    return value
  }
}
