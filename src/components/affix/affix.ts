import { ViewElement } from "../../core/index.js"
import type { AffixChangeDetail } from "./model.js"

export type { AffixChangeDetail } from "./model.js"

/**
 * Sticky positioning container that pins content to offsets when scrolled.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"affixed":"boolean"}}
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 */
export class Affix extends ViewElement {
  public static readonly tag = "m-affix"
  public static get observedAttributes(): string[] {
    return ["inset-top", "inset-bottom"]
  }

  private upgraded = false
  private _affixed = false
  private managingTop = false
  private managingBottom = false
  private scrollTarget: HTMLElement | Window | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mAffix = ""
    this.classList.add("m-affix")
    this.bindScroll()
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.unbindScroll()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) {
      this.synchronize()
    }
  }

  /**
   * Distance in pixels from the top of the viewport or scroll container before sticking.
   */
  public get insetTop(): number | null {
    return this.numberAttribute("inset-top", null)
  }
  public set insetTop(value: number | null) {
    if (value !== null && !Number.isFinite(value)) throw new RangeError("Invalid inset-top.")
    if (value === null) this.removeAttribute("inset-top")
    else this.setAttribute("inset-top", String(value))
  }

  /**
   * Distance in pixels from the bottom of the viewport or scroll container before sticking.
   */
  public get insetBottom(): number | null {
    return this.numberAttribute("inset-bottom", null)
  }
  public set insetBottom(value: number | null) {
    if (value !== null && !Number.isFinite(value)) throw new RangeError("Invalid inset-bottom.")
    if (value === null) this.removeAttribute("inset-bottom")
    else this.setAttribute("inset-bottom", String(value))
  }

  public update(): void {
    if (!this.isConnected) return
    const isAffixed = this.checkAffixed()
    if (isAffixed !== this._affixed) {
      this._affixed = isAffixed
      this.emit<AffixChangeDetail>("m:change", { affixed: isAffixed }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private synchronize(): void {
    if (this.hasAttribute("inset-top")) {
      try {
        const top = this.insetTop
        if (top !== null) {
          this.style.setProperty("--m-affix-block-start", `${top}px`)
          this.managingTop = true
        }
      } catch {
        // Preserve authored styles if attribute is invalid
      }
    } else if (this.managingTop) {
      this.style.removeProperty("--m-affix-block-start")
      this.managingTop = false
    }

    if (this.hasAttribute("inset-bottom")) {
      try {
        const bottom = this.insetBottom
        if (bottom !== null) {
          this.style.setProperty("--m-affix-block-end", `${bottom}px`)
          this.managingBottom = true
        }
      } catch {
        // Preserve authored styles if attribute is invalid
      }
    } else if (this.managingBottom) {
      this.style.removeProperty("--m-affix-block-end")
      this.managingBottom = false
    }

    try {
      this.update()
    } catch {
      // Ignore calculation errors for invalid attributes
    }
  }

  private checkAffixed(): boolean {
    const top = this.insetTop
    const bottom = this.insetBottom
    if (top === null && bottom === null) return false

    const scrollContainer = this.getScrollContainer()
    const isWindow = scrollContainer === window
    const targetRect = this.getBoundingClientRect()

    if (targetRect.top === 0 && targetRect.bottom === 0 && targetRect.height === 0 && targetRect.width === 0) {
      return false
    }

    if (top !== null) {
      const containerTop = isWindow ? 0 : (scrollContainer as HTMLElement).getBoundingClientRect().top
      if (targetRect.top - containerTop <= top) {
        return true
      }
    }
    if (bottom !== null) {
      const containerBottom = isWindow
        ? (window.innerHeight || document.documentElement?.clientHeight || 0)
        : (scrollContainer as HTMLElement).getBoundingClientRect().bottom
      if (containerBottom - targetRect.bottom <= bottom) {
        return true
      }
    }
    return false
  }

  private getScrollContainer(): HTMLElement | Window {
    let parent = this.parentElement
    while (parent) {
      const style = window.getComputedStyle(parent)
      if (/(?:auto|scroll|hidden|overlay)/.test(style.overflow + style.overflowY)) {
        return parent
      }
      parent = parent.parentElement
    }
    return window
  }

  private bindScroll(): void {
    this.unbindScroll()
    if (typeof window === "undefined") return
    const target = this.getScrollContainer()
    this.scrollTarget = target
    target.addEventListener("scroll", this.onScroll, { passive: true })
    if (target !== window) {
      window.addEventListener("scroll", this.onScroll, { passive: true })
    }
    window.addEventListener("resize", this.onScroll, { passive: true })
  }

  private unbindScroll(): void {
    if (this.scrollTarget) {
      this.scrollTarget.removeEventListener("scroll", this.onScroll)
      this.scrollTarget = undefined
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("scroll", this.onScroll)
      window.removeEventListener("resize", this.onScroll)
    }
  }

  private readonly onScroll = (): void => {
    this.update()
  }
}

export const MAffix = Affix
