import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "./position.js"
import type { PopoverPlacement } from "./position.js"
import { popoverPlacements, popoverTriggers } from "./model.js"
import type { PopoverTriggerMode } from "./model.js"
import { createPopoverController } from "./popover.js"
import type { PopoverController } from "./popover.js"

let popoverSequence = 0

/**
 * Interactive nonmodal floating content positioned relative to an authored trigger.
 * @region {"name":"trigger","element":"m-popover-trigger","accepts":["native button","m-button","native focusable"],"min":0,"max":1}
 * @region {"name":"content","element":"m-popover-content","accepts":["flow content"],"min":0,"max":1}
 */
export class Popover extends ViewElement {
  public static readonly tag = "m-popover"
  public static readonly observedAttributes = [
    "trigger", "placement", "delay", "duration", "gap", "margin", "flip", "disabled", "arrow", "animated",
  ]

  private controller: PopoverController | undefined
  private observer: MutationObserver | undefined
  private bindings = ownedWrites()
  private initialized = false
  private ready = false
  private synchronizing = false
  private triggerElement: HTMLElement | undefined
  private panelElement: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "popover"
    this.observer ??= new MutationObserver(records => {
      if (records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        return target?.closest("m-popover") === this && !(target === this && record.type === "attributes" && Popover.observedAttributes.includes(record.attributeName!))
      })) this.synchronize()
    })
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
    this.controller?.disconnect()
    this.controller = undefined
    this.triggerElement = undefined
    this.panelElement = undefined
    this.bindings.restore()
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected || !this.ready) return
    if (name === "disabled" && this.controller) {
      this.controller.disabled = this.disabled
      if (this.triggerElement instanceof HTMLButtonElement) {
        this.triggerElement.disabled = this.disabled
      }
      if (this.disabled) this.controller.close()
      return
    }
    if (name === "arrow" && this.panelElement) {
      this.panelElement.classList.toggle("m-popover--arrow", this.arrow)
      return
    }
    if (name === "animated" && this.panelElement) {
      this.panelElement.classList.toggle("m-popover--animated", this.animated)
      return
    }
    this.synchronize()
  }

  public get trigger(): PopoverTriggerMode {
    return this.choiceAttribute("trigger", popoverTriggers, "click")
  }
  public set trigger(value: PopoverTriggerMode) {
    this.setChoiceAttribute("trigger", value, popoverTriggers)
  }

  public get placement(): PopoverPlacement {
    return this.choiceAttribute("placement", popoverPlacements, "bottom")
  }
  public set placement(value: PopoverPlacement) {
    this.setChoiceAttribute("placement", value, popoverPlacements)
  }

  /**
   * @min 0
   * @max 60000
   * @integer
   */
  public get delay(): number {
    return this.timing(this.numberAttribute("delay", 100))
  }
  public set delay(value: number) {
    this.setAttribute("delay", String(this.timing(value)))
  }

  /**
   * @min 0
   * @max 60000
   * @integer
   */
  public get duration(): number {
    return this.timing(this.numberAttribute("duration", 100))
  }
  public set duration(value: number) {
    this.setAttribute("duration", String(this.timing(value)))
  }

  /**
   * @min 0
   * @max 60000
   */
  public get gap(): number {
    return this.dimension(this.numberAttribute("gap", 8))
  }
  public set gap(value: number) {
    this.setAttribute("gap", String(this.dimension(value)))
  }

  /**
   * @min 0
   * @max 60000
   */
  public get margin(): number {
    return this.dimension(this.numberAttribute("margin", 8))
  }
  public set margin(value: number) {
    this.setAttribute("margin", String(this.dimension(value)))
  }

  public get flip(): boolean {
    return this.booleanAttribute("flip", true)
  }
  public set flip(value: boolean) {
    this.setBooleanAttribute("flip", value, false)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value, true)
  }

  public get arrow(): boolean {
    return this.hasAttribute("arrow")
  }
  public set arrow(value: boolean) {
    this.setBooleanAttribute("arrow", value, true)
  }

  public get animated(): boolean {
    return this.booleanAttribute("animated", true)
  }
  public set animated(value: boolean) {
    this.setBooleanAttribute("animated", value, false)
  }

  public get show(): boolean {
    return this.controller?.show ?? false
  }

  public open(): boolean {
    if (!this.controller?.connected) return false
    return this.controller.open()
  }

  public close(): void {
    this.controller?.close()
  }

  public toggle(): boolean {
    if (this.show) {
      this.close()
      return false
    }
    return this.open()
  }

  private timing(value: number): number {
    if (!Number.isFinite(value) || value < 0 || value > 60000) {
      throw new RangeError("Timing must be finite between 0 and 60000.")
    }
    return value
  }

  private dimension(value: number): number {
    if (!Number.isFinite(value) || value < 0 || value > 60000) {
      throw new RangeError("Dimension must be finite between 0 and 60000.")
    }
    return value
  }

  private synchronize(): void {
    if (!this.isConnected || this.synchronizing) return
    this.synchronizing = true
    this.observer?.disconnect()
    try {
      const triggerRegion = this.querySelector<HTMLElement>(":scope > m-popover-trigger")
      const contentRegion = this.querySelector<HTMLElement>(":scope > m-popover-content")

      let trigger: HTMLElement | undefined
      if (triggerRegion) {
        trigger = triggerRegion.querySelector<HTMLElement>("button, input:not([type=hidden]), select, textarea, a[href]")
          ?? (triggerRegion.firstElementChild instanceof HTMLElement ? triggerRegion.firstElementChild : triggerRegion)
      } else {
        const candidates = [...this.children].filter(child => child !== contentRegion && !child.classList.contains("m-popover") && child instanceof HTMLElement) as HTMLElement[]
        trigger = candidates[0]
      }

      let panel: HTMLElement | undefined
      if (contentRegion) {
        panel = contentRegion
      } else {
        const candidates = [...this.children].filter(child => child !== trigger && child !== triggerRegion && child instanceof HTMLElement) as HTMLElement[]
        panel = candidates.find(child => child.classList.contains("m-popover") || child.hasAttribute("popover"))
          ?? candidates[0]
      }

      if (!trigger || !panel || trigger === panel) {
        this.controller?.disconnect()
        this.controller = undefined
        return
      }

      let nativeTrigger: HTMLElement = trigger
      const mButton = trigger.localName === "m-button" ? trigger : trigger.querySelector("m-button")
      if (mButton) {
        const control = (mButton as { control?: HTMLElement }).control ?? mButton.querySelector("button, a")
        if (control instanceof HTMLElement) nativeTrigger = control
      }

      this.bindings.restore()

      if (!panel.id) {
        panel.id = `m-popover-${++popoverSequence}`
      }

      panel.classList.add("m-popover")
      panel.classList.toggle("m-popover--arrow", this.arrow)
      panel.classList.toggle("m-popover--animated", this.animated)
      panel.setAttribute("popover", this.trigger === "manual" ? "manual" : "auto")
      if (panel.hasAttribute("hidden")) panel.removeAttribute("hidden")

      if (this.trigger === "click") {
        if (nativeTrigger instanceof HTMLButtonElement) {
          this.bindings.attr(nativeTrigger, "type", "button")
          this.bindings.attr(nativeTrigger, "popovertarget", panel.id)
          this.bindings.attr(nativeTrigger, "popovertargetaction", "toggle")
        }
      } else {
        if (nativeTrigger.hasAttribute("popovertarget")) {
          this.bindings.attr(nativeTrigger, "popovertarget", null)
        }
        if (nativeTrigger.hasAttribute("popovertargetaction")) {
          this.bindings.attr(nativeTrigger, "popovertargetaction", null)
        }
      }

      this.triggerElement = nativeTrigger
      this.panelElement = panel

      this.controller?.disconnect()
      try {
        this.controller = createPopoverController(
          nativeTrigger,
          panel,
          {
            trigger: this.trigger,
            placement: this.placement,
            delay: this.delay,
            duration: this.duration,
            gap: this.gap,
            margin: this.margin,
            flip: this.flip,
            disabled: this.disabled,
          },
          undefined,
          true,
        )
      } catch {
        this.controller = undefined
      }
    } finally {
      this.synchronizing = false
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["id", "class", "popover", "disabled", "hidden"] })
      }
    }
  }
}
