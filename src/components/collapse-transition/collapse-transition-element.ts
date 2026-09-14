import { ViewElement } from "../../core/index.js"
import { createCollapseTransition, internalOwnerKey } from "./collapse-transition.js"
import type { CollapseTransitionController } from "./collapse-transition.js"

/**
 * A container with optional native collapse/expand transition motion.
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 * @event {"name":"CollapseTransitionError","web":"m:collapse-transition-error","bubbles":false,"cancelable":true,"composed":false,"detail":{"error":"unknown","phase":"string","stale":"boolean"}}
 */
export class CollapseTransition extends ViewElement {
  public static readonly tag = "m-collapse-transition"
  public static get observedAttributes(): string[] {
    return ["show"]
  }

  private upgraded = false
  public controller: CollapseTransitionController | undefined
  public [internalOwnerKey] = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mCollapseTransition = ""
    this.classList.add("m-collapse-transition")
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.controller?.dispose()
    this.controller = undefined
    this[internalOwnerKey] = false
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    if (name === "show") {
      this.synchronize()
    }
  }

  public get show(): boolean {
    return this.booleanAttribute("show", true)
  }

  public set show(value: boolean) {
    this.setBooleanAttribute("show", value, false)
  }

  public toggle(): void {
    this.show = !this.show
  }

  private synchronize(): void {
    const targetShow = this.show
    if (this.controller) {
      void this.controller.setShow(targetShow).catch(() => {})
      return
    }

    const inner = this.querySelector<HTMLElement>(":scope > [data-collapse-transition-content]")
    if (inner && this.children.length === 1 && this.isConnected) {
      try {
        this[internalOwnerKey] = true
        this.controller = createCollapseTransition(this, { show: targetShow })
        return
      } catch {
        this[internalOwnerKey] = false
      }
    }

    this.toggleAttribute("hidden", !targetShow)
  }
}

export const MCollapseTransition = CollapseTransition
