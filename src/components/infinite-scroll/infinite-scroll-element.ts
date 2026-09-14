import { ViewElement } from "../../core/index.js"

export interface InfiniteScrollLoadDetail {
  distance: number
}

/**
 * Infinite scroll container that emits a load event when scrolled near the end.
 * @event {"name":"Load","web":"m:load","bubbles":true,"cancelable":false,"composed":false,"detail":{"distance":"number"}}
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 */
export class InfiniteScroll extends ViewElement {
  public static readonly tag = "m-infinite-scroll"
  public static get observedAttributes(): string[] {
    return ["distance", "disabled"]
  }

  private upgraded = false
  private scrollTarget: HTMLElement | Window | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mInfiniteScroll = ""
    this.classList.add("m-infinite-scroll")
    this.bindScroll()
  }

  public disconnectedCallback(): void {
    this.unbindScroll()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "distance" || name === "disabled") {
      this.check()
    }
  }

  /**
   * Distance in pixels from the bottom of the scroll container before triggering load.
   * @min 0
   */
  public get distance(): number {
    const value = this.numberAttribute("distance", 20)
    if (value < 0) throw new RangeError("distance must be a non-negative finite number.")
    return value
  }
  public set distance(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError("distance must be a non-negative finite number.")
    }
    this.setAttribute("distance", String(value))
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public check(): void {
    if (!this.isConnected || this.disabled) return
    const container = this.getScrollContainer()
    if (container instanceof HTMLElement) {
      this.checkTarget(container)
    } else {
      const view = this.ownerDocument.defaultView ?? window
      const doc = this.ownerDocument.documentElement
      const scrollTop = view.scrollY ?? doc?.scrollTop ?? 0
      const scrollHeight = doc?.scrollHeight ?? 0
      const clientHeight = view.innerHeight || doc?.clientHeight || 0
      if (scrollHeight > 0 && clientHeight > 0) {
        if (scrollHeight - scrollTop - clientHeight <= this.distance) {
          this.triggerLoad()
        }
      }
    }
  }

  public triggerLoad(): void {
    if (!this.isConnected || this.disabled) return
    this.emit<InfiniteScrollLoadDetail>(
      "m:load",
      { distance: this.distance },
      { bubbles: true, cancelable: false, composed: false },
    )
  }

  private checkTarget(target: HTMLElement): void {
    if (!this.isConnected || this.disabled) return
    const { scrollTop, scrollHeight, clientHeight } = target
    if (scrollHeight > 0 && clientHeight > 0) {
      if (scrollHeight - scrollTop - clientHeight <= this.distance) {
        this.triggerLoad()
      }
    } else if (scrollTop > 0) {
      if (scrollHeight - scrollTop - clientHeight <= this.distance) {
        this.triggerLoad()
      }
    }
  }

  private getScrollContainer(): HTMLElement | Window {
    const style = this.ownerDocument.defaultView?.getComputedStyle(this)
    if (style && /(?:auto|scroll)/.test(style.overflow + style.overflowY)) {
      return this
    }
    const viewport = this.querySelector<HTMLElement>(".m-infinite-scroll__viewport, [data-viewport], [data-feed-viewport]")
    if (viewport) {
      return viewport
    }
    let parent = this.parentElement
    while (parent) {
      const parentStyle = this.ownerDocument.defaultView?.getComputedStyle(parent)
      if (parentStyle && /(?:auto|scroll)/.test(parentStyle.overflow + parentStyle.overflowY)) {
        return parent
      }
      parent = parent.parentElement
    }
    return this
  }

  private bindScroll(): void {
    this.unbindScroll()
    const view = this.ownerDocument.defaultView ?? window
    const target = this.getScrollContainer()
    this.scrollTarget = target
    target.addEventListener("scroll", this.onScroll, { passive: true })
    if (target !== this) {
      this.addEventListener("scroll", this.onScroll, { passive: true })
    }
    if (target !== view) {
      view.addEventListener("scroll", this.onScroll, { passive: true })
    }
    view.addEventListener("resize", this.onScroll, { passive: true })
  }

  private unbindScroll(): void {
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener("scroll", this.onScroll)
      this.scrollTarget = undefined
    }
    this.removeEventListener("scroll", this.onScroll)
    const view = this.ownerDocument.defaultView ?? window
    if (view) {
      view.removeEventListener("scroll", this.onScroll)
      view.removeEventListener("resize", this.onScroll)
    }
  }

  private readonly onScroll = (event?: Event): void => {
    if (event?.target instanceof HTMLElement) {
      this.checkTarget(event.target)
    } else {
      this.check()
    }
  }
}

export const MInfiniteScroll = InfiniteScroll
