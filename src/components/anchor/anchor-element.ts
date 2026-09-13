import { ViewElement } from "../../core/index.js"
import { createAnchor } from "./anchor.js"
import type { AnchorController, AnchorLocation, AnchorOptions } from "./anchor.js"
import type { NativeScrollBehavior, NativeScrollRoot } from "./scroll.js"
import { AnchorLink } from "./link.js"

/**
 * Anchor navigation component for tracking and scrolling to page sections.
 * @region {"name":"links","element":"m-anchor-link","accepts":["AnchorLink"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"href":"string"}}
 */
export class Anchor extends ViewElement {
  public static readonly tag = "m-anchor"
  public static readonly observedAttributes = ["affix", "offset-top", "bound"]

  private upgraded = false
  private controller: AnchorController | undefined
  private customRoot: NativeScrollRoot | undefined

  private handleAnchorChange = (event: Event): void => {
    const custom = event as CustomEvent<AnchorLocation>
    const href = custom.detail?.href ?? ""
    this.emitChange(href)
  }

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "anchor"
    this.dataset.anchor = ""
    this.classList.add("m-anchor")
    if (!this.hasAttribute("role")) this.setAttribute("role", "navigation")
    if (!this.hasAttribute("aria-label") && !this.hasAttribute("aria-labelledby")) {
      this.setAttribute("aria-label", "Anchor")
    }
    this.syncAffix()
    this.connectController()
  }

  public disconnectedCallback(): void {
    this.disconnectController()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "affix") {
      this.syncAffix()
    } else if (name === "offset-top" || name === "bound") {
      this.syncAffix()
      this.connectController()
    }
  }

  /**
   * Whether to fix the anchor navigation (sticky positioning).
   */
  public get affix(): boolean {
    return this.booleanAttribute("affix", false)
  }
  public set affix(value: boolean) {
    this.setBooleanAttribute("affix", value)
  }

  /**
   * Offset from top of viewport when calculating location and sticky position.
   * @min 0
   * @max 60000
   */
  public override get offsetTop(): number {
    return this.numberAttribute("offset-top", 0)
  }
  public override set offsetTop(value: number) {
    this.setAttribute("offset-top", String(value))
  }

  /**
   * Tolerance in pixels after the location reference line.
   * @min 0
   * @max 60000
   */
  public get bound(): number {
    return this.numberAttribute("bound", 12)
  }
  public set bound(value: number) {
    this.setAttribute("bound", String(value))
  }

  public override scrollTo(options?: ScrollToOptions): void
  public override scrollTo(x: number, y: number): void
  public override scrollTo(href: string, options?: { behavior?: NativeScrollBehavior }): boolean
  public override scrollTo(
    targetOrOptions?: string | ScrollToOptions | number,
    yOrOptions?: { behavior?: NativeScrollBehavior } | number,
  ): boolean | void {
    if (typeof targetOrOptions === "string") {
      return this.controller?.scrollTo(targetOrOptions, yOrOptions as { behavior?: NativeScrollBehavior }) ?? false
    }
    if (typeof targetOrOptions === "number") {
      super.scrollTo(targetOrOptions, yOrOptions as number)
      return
    }
    super.scrollTo(targetOrOptions)
  }

  public refresh(): void {
    this.controller?.refresh()
  }

  public update(): void {
    this.controller?.update()
  }

  public getActiveHref(): string | null {
    return this.controller?.activeHref ?? null
  }

  public setScrollRoot(root: NativeScrollRoot | undefined): void {
    this.customRoot = root
    if (this.isConnected) {
      this.connectController()
    }
  }

  private emitChange(href: string): void {
    this.emit<{ href: string }>("m:change", { href }, { bubbles: true, cancelable: false, composed: false })
  }

  private syncAffix(): void {
    this.classList.toggle("m-anchor--sticky", this.affix)
    if (this.offsetTop > 0) {
      this.style.setProperty("--m-anchor-sticky-offset", `${this.offsetTop}px`)
    } else {
      this.style.removeProperty("--m-anchor-sticky-offset")
    }
  }

  private connectController(): void {
    this.disconnectController()
    if (!this.isConnected) return
    for (const link of this.querySelectorAll<AnchorLink>("m-anchor-link")) {
      if (typeof link.render === "function") link.render()
    }
    this.addEventListener("m:anchor-change", this.handleAnchorChange)
    const rootAttr = this.getAttribute("root")
    const rootElem = rootAttr ? (this.ownerDocument.getElementById(rootAttr) ?? undefined) : undefined
    const resolvedRoot = this.customRoot ?? rootElem
    const options: AnchorOptions = {
      bound: this.bound,
      offset: this.offsetTop,
    }
    if (resolvedRoot !== undefined) {
      options.root = resolvedRoot
    }
    this.controller = createAnchor(this, options)
  }

  private disconnectController(): void {
    this.removeEventListener("m:anchor-change", this.handleAnchorChange)
    this.controller?.disconnect()
    this.controller = undefined
  }
}
