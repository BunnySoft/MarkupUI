import { ViewElement } from "../../core/index.js"
import { tooltipPlacements } from "./model.js"
import type { TooltipPlacement } from "./model.js"
import { createTooltip } from "./tooltip.js"
import type { TooltipController } from "./tooltip.js"

let tooltipSequence = 0

/**
 * Noninteractive contextual description positioned relative to an authored trigger.
 * @region {"name":"trigger","element":"m-tooltip-trigger","accepts":["native button","m-button","native focusable"],"min":0,"max":1}
 * @region {"name":"content","element":"m-tooltip-content","accepts":["phrasing content"],"min":0,"max":1}
 */
export class Tooltip extends ViewElement {
  public static readonly tag = "m-tooltip"
  public static readonly observedAttributes = [
    "placement", "delay", "duration", "gap", "margin", "flip", "disabled", "arrow", "animated", "text",
  ]

  private controller: TooltipController | undefined
  private observer: MutationObserver | undefined
  private initialized = false
  private ready = false
  private synchronizing = false
  private panelElement: HTMLElement | undefined
  private generatedPanel: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "tooltip"
    this.observer ??= new MutationObserver(records => {
      if (records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        return target?.closest("m-tooltip") === this && !(target === this && record.type === "attributes" && Tooltip.observedAttributes.includes(record.attributeName!))
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
    this.panelElement = undefined
    if (this.generatedPanel) {
      this.generatedPanel.remove()
      this.generatedPanel = undefined
    }
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected || !this.ready) return
    if (name === "disabled" && this.controller) {
      this.controller.disabled = this.disabled
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
    if (name === "text" && this.generatedPanel) {
      this.generatedPanel.textContent = this.text
      if (!this.controller) this.synchronize()
      return
    }
    this.synchronize()
  }

  public get placement(): TooltipPlacement {
    return this.choiceAttribute("placement", tooltipPlacements, "top")
  }
  public set placement(value: TooltipPlacement) {
    this.setChoiceAttribute("placement", value, tooltipPlacements)
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

  public get text(): string {
    return this.getAttribute("text") ?? ""
  }
  public set text(value: string) {
    this.setAttribute("text", value)
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
      const triggerRegion = this.querySelector<HTMLElement>(":scope > m-tooltip-trigger")
      const contentRegion = this.querySelector<HTMLElement>(":scope > m-tooltip-content")

      let trigger: HTMLElement | undefined
      if (triggerRegion) {
        trigger = triggerRegion.querySelector<HTMLElement>("button, input:not([type=hidden]), select, textarea, a[href]")
          ?? (triggerRegion.firstElementChild instanceof HTMLElement ? triggerRegion.firstElementChild : triggerRegion)
      } else {
        const candidates = [...this.children].filter(child =>
          child !== contentRegion &&
          child !== this.generatedPanel &&
          !child.classList.contains("m-tooltip") &&
          child.localName !== "m-tooltip-content" &&
          child instanceof HTMLElement,
        ) as HTMLElement[]
        trigger = candidates[0]
      }

      let panel: HTMLElement | undefined
      if (contentRegion) {
        if (this.generatedPanel) {
          this.generatedPanel.remove()
          this.generatedPanel = undefined
        }
        panel = contentRegion
      } else {
        const candidates = [...this.children].filter(child =>
          child !== trigger &&
          child !== triggerRegion &&
          child !== this.generatedPanel &&
          child instanceof HTMLElement,
        ) as HTMLElement[]
        panel = candidates.find(child => child.classList.contains("m-tooltip") || child.getAttribute("role") === "tooltip" || child.hasAttribute("popover"))
        if (!panel && this.hasAttribute("text")) {
          if (!this.generatedPanel) {
            this.generatedPanel = this.ownerDocument.createElement("span")
            this.append(this.generatedPanel)
          }
          this.generatedPanel.textContent = this.text
          panel = this.generatedPanel
        } else if (!panel && candidates.length > 0) {
          panel = candidates[0]
        }
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
      const mLink = trigger.localName === "m-link" ? trigger : trigger.querySelector("m-link")
      if (mLink) {
        const native = (mLink as { native?: HTMLElement }).native ?? mLink.querySelector("a")
        if (native instanceof HTMLElement) nativeTrigger = native
      }
      const mInput = trigger.localName === "m-input" ? trigger : trigger.querySelector("m-input")
      if (mInput) {
        const input = (mInput as { input?: HTMLElement }).input ?? mInput.querySelector("input, textarea")
        if (input instanceof HTMLElement) nativeTrigger = input
      }

      if (!panel.id) {
        panel.id = `m-tooltip-${++tooltipSequence}`
      }

      panel.classList.add("m-popover", "m-tooltip")
      panel.classList.toggle("m-popover--arrow", this.arrow)
      panel.classList.toggle("m-popover--animated", this.animated)
      panel.setAttribute("role", "tooltip")
      panel.setAttribute("popover", "manual")
      if (panel.hasAttribute("hidden")) panel.removeAttribute("hidden")

      this.panelElement = panel

      this.controller?.disconnect()
      try {
        this.controller = createTooltip(
          nativeTrigger,
          panel,
          {
            placement: this.placement,
            delay: this.delay,
            duration: this.duration,
            gap: this.gap,
            margin: this.margin,
            flip: this.flip,
            disabled: this.disabled,
          },
          true,
        )
      } catch {
        this.controller = undefined
      }
    } finally {
      this.synchronizing = false
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["id", "class", "popover", "disabled", "hidden", "text"] })
      }
    }
  }
}
