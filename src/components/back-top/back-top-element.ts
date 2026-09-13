import { ViewElement } from "../../core/index.js"

/**
 * A back-to-top button that smoothly scrolls a container or page to the top when clicked.
 * @event {"name":"Click","web":"m:click","bubbles":true,"cancelable":true,"composed":false,"detail":{"originalEvent":"MouseEvent"}}
 */
export class BackTop extends ViewElement {
  public static readonly tag = "m-back-top"
  public static get observedAttributes(): string[] {
    return ["visibility-height", "right", "bottom", "target", "listen-to"]
  }

  private upgraded = false
  private observer: MutationObserver | undefined
  private defaultIcon: HTMLSpanElement | undefined
  private currentScrollTarget: EventTarget | null = null

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mBackTop = ""
    this.classList.add("m-back-top", "m-back-top--fixed")
    if (!this.hasAttribute("role")) this.setAttribute("role", "button")
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0")
    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
      this.setAttribute("aria-label", "Back to top")
    }

    this.renderDefaultIcon()
    this.updatePosition()

    this.addEventListener("click", this.onClick)
    this.addEventListener("keydown", this.onKeyDown)
    this.addEventListener("focus", this.onFocus)
    this.addEventListener("blur", this.onBlur)

    const view = this.ownerDocument.defaultView
    view?.addEventListener("resize", this.onScroll, { passive: true })

    this.observer ??= new MutationObserver(() => this.renderDefaultIcon())
    this.observer.observe(this, { childList: true })

    this.attachScrollTarget()
    this.updateVisibility()
  }

  public disconnectedCallback(): void {
    this.detachScrollTarget()
    const view = this.ownerDocument.defaultView
    view?.removeEventListener("resize", this.onScroll)

    this.removeEventListener("click", this.onClick)
    this.removeEventListener("keydown", this.onKeyDown)
    this.removeEventListener("focus", this.onFocus)
    this.removeEventListener("blur", this.onBlur)

    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "right" || name === "bottom") {
      this.updatePosition()
    } else if (name === "visibility-height" || name === "target" || name === "listen-to") {
      this.attachScrollTarget()
      this.updateVisibility()
    }
  }

  /** @min 0 */
  public get visibilityHeight(): number {
    const value = this.numberAttribute("visibility-height", 400)
    if (value < 0) throw new RangeError("Invalid number visibility-height.")
    return value
  }
  public set visibilityHeight(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError("visibilityHeight must be a nonnegative finite number.")
    }
    this.setAttribute("visibility-height", String(value))
  }

  public get right(): string | null {
    return this.getAttribute("right")
  }
  public set right(value: string | null) {
    this.setStringAttribute("right", value)
    this.updatePosition()
  }

  public get bottom(): string | null {
    return this.getAttribute("bottom")
  }
  public set bottom(value: string | null) {
    this.setStringAttribute("bottom", value)
    this.updatePosition()
  }

  public scrollToTop(options: { behavior?: ScrollBehavior } = {}): boolean {
    const behavior = options.behavior ?? "smooth"
    const view = this.ownerDocument.defaultView ?? window
    const reduced = view.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const effectiveBehavior = reduced ? "instant" : behavior

    const target = this.getScrollTarget()
    if (target === view || target === this.ownerDocument || target === this.ownerDocument.documentElement || target === this.ownerDocument.body) {
      if (typeof view.scrollTo === "function") {
        view.scrollTo({ top: 0, left: view.scrollX ?? 0, behavior: effectiveBehavior })
      } else if (this.ownerDocument.documentElement) {
        this.ownerDocument.documentElement.scrollTop = 0
      }
      return true
    } else if (target instanceof HTMLElement) {
      if (typeof target.scrollTo === "function") {
        target.scrollTo({ top: 0, left: target.scrollLeft ?? 0, behavior: effectiveBehavior })
      } else {
        target.scrollTop = 0
      }
      return true
    }
    return false
  }

  private readonly onScroll = (): void => {
    this.updateVisibility()
  }

  private readonly onFocus = (): void => {
    this.updateVisibility()
  }

  private readonly onBlur = (): void => {
    this.updateVisibility()
  }

  private readonly onClick = (event: MouseEvent): void => {
    const allowed = this.emit<{ originalEvent: MouseEvent }>(
      "m:click",
      { originalEvent: event },
      { bubbles: true, cancelable: true, composed: false },
    )
    if (!allowed || event.defaultPrevented) return
    this.scrollToTop()
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      this.click()
    }
  }

  private updatePosition(): void {
    const right = this.right
    if (right !== null) {
      const val = /^\d+$/.test(right.trim()) ? `${right.trim()}px` : right
      this.style.setProperty("--m-back-top-inline-end", val)
    } else {
      this.style.removeProperty("--m-back-top-inline-end")
    }
    const bottom = this.bottom
    if (bottom !== null) {
      const val = /^\d+$/.test(bottom.trim()) ? `${bottom.trim()}px` : bottom
      this.style.setProperty("--m-back-top-block-end", val)
    } else {
      this.style.removeProperty("--m-back-top-block-end")
    }
  }

  private getScrollTarget(): EventTarget {
    const listenTo = this.getAttribute("listen-to") || this.getAttribute("target")
    if (listenTo) {
      try {
        const el = this.ownerDocument.querySelector(listenTo)
        if (el) return el
      } catch {
        // invalid selector fallback
      }
    }
    return this.ownerDocument.defaultView ?? window
  }

  private attachScrollTarget(): void {
    const target = this.getScrollTarget()
    if (this.currentScrollTarget === target) return
    if (this.currentScrollTarget) {
      this.currentScrollTarget.removeEventListener("scroll", this.onScroll)
    }
    this.currentScrollTarget = target
    target.addEventListener("scroll", this.onScroll, { passive: true })
  }

  private detachScrollTarget(): void {
    if (this.currentScrollTarget) {
      this.currentScrollTarget.removeEventListener("scroll", this.onScroll)
      this.currentScrollTarget = null
    }
  }

  private updateVisibility(): void {
    if (!this.isConnected) return
    const scrollTarget = this.getScrollTarget()
    let scrollTop = 0
    if (scrollTarget === window || scrollTarget === this.ownerDocument || scrollTarget === this.ownerDocument.documentElement || scrollTarget === this.ownerDocument.body) {
      const view = this.ownerDocument.defaultView ?? window
      scrollTop = view.scrollY ?? this.ownerDocument.documentElement?.scrollTop ?? 0
    } else if (scrollTarget instanceof HTMLElement) {
      scrollTop = scrollTarget.scrollTop
    }

    let threshold = 400
    try {
      threshold = this.visibilityHeight
    } catch {
      threshold = 400
    }

    const isOverThreshold = scrollTop >= threshold
    const active = this.ownerDocument.activeElement
    const isFocused = active === (this as Element) || (active !== null && this.contains(active))
    const shouldShow = isOverThreshold || isFocused

    if (shouldShow) {
      this.removeAttribute("data-back-top-hidden")
    } else {
      this.setAttribute("data-back-top-hidden", "")
    }
  }

  private renderDefaultIcon(): void {
    const hasAuthoredContent = [...this.childNodes].some(node => {
      if (node === this.defaultIcon) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches("template,script,style")
    })
    if (!hasAuthoredContent) {
      if (!this.defaultIcon || this.defaultIcon.parentNode !== this) {
        this.defaultIcon = this.ownerDocument.createElement("span")
        this.defaultIcon.className = "m-back-top-icon"
        this.defaultIcon.setAttribute("aria-hidden", "true")
        const svg = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "svg")
        svg.setAttribute("viewBox", "0 0 24 24")
        svg.setAttribute("fill", "none")
        svg.setAttribute("stroke", "currentColor")
        svg.setAttribute("stroke-width", "2")
        svg.setAttribute("stroke-linecap", "round")
        svg.setAttribute("stroke-linejoin", "round")
        const path = this.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "path")
        path.setAttribute("d", "M5 5h14M12 9v12M7 14l5-5 5 5")
        svg.append(path)
        this.defaultIcon.append(svg)
        this.append(this.defaultIcon)
      }
    } else if (this.defaultIcon && this.defaultIcon.parentNode === this) {
      this.defaultIcon.remove()
      this.defaultIcon = undefined
    }
  }
}

export { BackTop as MBackTop }
