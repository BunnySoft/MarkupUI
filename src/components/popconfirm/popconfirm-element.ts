import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import type { PopoverPlacement } from "../popover/position.js"
import { createPopconfirm } from "./popconfirm.js"
import type { PopconfirmController } from "./popconfirm.js"

export interface PopconfirmClickDetail {
  value: string
}

let popconfirmSequence = 0

/**
 * A popconfirm component for displaying confirmation dialogs next to triggers.
 * @region {"name":"trigger","element":"m-popconfirm-trigger","accepts":["native button","m-button","native focusable"],"min":0,"max":1}
 * @region {"name":"panel","element":"m-popconfirm-panel","accepts":["flow content"],"min":0,"max":1}
 * @event {"name":"PositiveClick","web":"m:positive-click","bubbles":true,"cancelable":true,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"NegativeClick","web":"m:negative-click","bubbles":true,"cancelable":true,"composed":false,"detail":{"value":"string"}}
 */
export class Popconfirm extends ViewElement {
  public static readonly tag = "m-popconfirm"
  public static readonly observedAttributes = [
    "title", "positive-text", "negative-text", "placement", "disabled", "show",
  ]

  private controller: PopconfirmController | undefined
  private observer: MutationObserver | undefined
  private bindings = ownedWrites()
  private initialized = false
  private ready = false
  private synchronizing = false
  private triggerElement: HTMLElement | undefined
  private panelElement: HTMLElement | undefined
  private generatedPanel: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "popconfirm"
    this.observer ??= new MutationObserver(records => {
      if (records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        if (!target || target.closest("m-popconfirm") !== this) return false
        if (this.panelElement && (target === this.panelElement || this.panelElement.contains(target))) return false
        if (target === this && record.type === "attributes" && Popconfirm.observedAttributes.includes(record.attributeName!)) return false
        return true
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
    if (this.generatedPanel) {
      this.generatedPanel.remove()
      this.generatedPanel = undefined
    }
    this.bindings.restore()
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected || !this.ready) return
    if (name === "disabled" && this.controller) {
      this.controller.disabled = this.disabled
      if (this.triggerElement instanceof HTMLButtonElement) {
        this.triggerElement.disabled = this.disabled
      }
      const mButton = this.querySelector("m-button")
      if (mButton) {
        (mButton as { disabled?: boolean }).disabled = this.disabled
      }
      if (this.disabled) this.controller.close()
      return
    }
    if (name === "title") {
      if (this.panelElement) {
        this.panelElement.setAttribute("aria-label", this.title || "Confirm")
        const content = this.panelElement.querySelector<HTMLElement>("[data-popconfirm-content]")
        if (content) content.textContent = this.title || "Are you sure?"
      }
      return
    }
    if (name === "positive-text") {
      const positive = this.panelElement?.querySelector<HTMLButtonElement>("[data-popconfirm-positive]")
      if (positive) positive.textContent = this.positiveText
      return
    }
    if (name === "negative-text") {
      const negative = this.panelElement?.querySelector<HTMLButtonElement>("[data-popconfirm-negative]")
      if (negative) negative.textContent = this.negativeText
      return
    }
    if (name === "show") {
      const shouldShow = this.hasAttribute("show")
      if (shouldShow !== this.show) {
        if (shouldShow) this.open()
        else this.close()
      }
      return
    }
    this.synchronize()
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  public get positiveText(): string {
    return this.getAttribute("positive-text") ?? "Confirm"
  }
  public set positiveText(value: string) {
    this.setStringAttribute("positive-text", value)
  }

  public get negativeText(): string {
    return this.getAttribute("negative-text") ?? "Cancel"
  }
  public set negativeText(value: string) {
    this.setStringAttribute("negative-text", value)
  }

  public get placement(): string {
    return this.getAttribute("placement") ?? "top"
  }
  public set placement(value: string) {
    this.setStringAttribute("placement", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get show(): boolean {
    return this.controller?.show ?? false
  }
  public set show(value: boolean) {
    if (typeof value !== "boolean") throw new RangeError("Invalid boolean show.")
    if (value) this.open()
    else this.close()
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

  private synchronize(): void {
    if (!this.isConnected || this.synchronizing) return
    this.synchronizing = true
    this.observer?.disconnect()
    try {
      const triggerRegion = this.querySelector<HTMLElement>(":scope > m-popconfirm-trigger")
      const panelRegion = this.querySelector<HTMLElement>(":scope > m-popconfirm-panel")

      let trigger: HTMLElement | undefined
      if (triggerRegion) {
        trigger = triggerRegion.querySelector<HTMLElement>("button, input:not([type=hidden]), select, textarea, a[href]")
          ?? (triggerRegion.firstElementChild instanceof HTMLElement ? triggerRegion.firstElementChild : triggerRegion)
      } else {
        const candidates = [...this.children].filter(child =>
          child !== panelRegion &&
          child !== this.generatedPanel &&
          !child.classList.contains("m-popconfirm") &&
          child.localName !== "m-popconfirm-panel" &&
          child instanceof HTMLElement,
        ) as HTMLElement[]
        trigger = candidates[0]
      }

      let panel: HTMLElement | undefined
      if (panelRegion) {
        if (this.generatedPanel && this.generatedPanel !== panelRegion) {
          this.generatedPanel.remove()
          this.generatedPanel = undefined
        }
        panel = panelRegion
      } else {
        const candidates = [...this.children].filter(child =>
          child !== trigger &&
          child !== triggerRegion &&
          child !== this.generatedPanel &&
          child instanceof HTMLElement,
        ) as HTMLElement[]
        panel = candidates.find(child => child.classList.contains("m-popconfirm") || child.hasAttribute("popover"))
        if (!panel) {
          if (!this.generatedPanel) {
            this.generatedPanel = this.ownerDocument.createElement("m-popconfirm-panel")
            this.append(this.generatedPanel)
          }
          panel = this.generatedPanel
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

      this.bindings.restore()

      if (!panel.id) {
        panel.id = `m-popconfirm-${++popconfirmSequence}`
      }

      panel.classList.add("m-popover", "m-popconfirm")
      panel.setAttribute("role", "dialog")
      panel.setAttribute("aria-modal", "false")
      panel.setAttribute("popover", "auto")
      if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby")) {
        panel.setAttribute("aria-label", this.title || "Confirm")
      }

      // Check or construct content
      let content = panel.querySelector<HTMLElement>("[data-popconfirm-content]")
      if (!content) {
        let body = panel.querySelector<HTMLElement>("[data-popconfirm-body]")
        if (!body) {
          body = this.ownerDocument.createElement("div")
          body.setAttribute("data-popconfirm-body", "")
          const icon = this.ownerDocument.createElement("span")
          icon.setAttribute("data-popconfirm-icon", "")
          icon.setAttribute("aria-hidden", "true")
          icon.textContent = "?"
          body.append(icon)
          panel.prepend(body)
        }
        content = this.ownerDocument.createElement("p")
        content.setAttribute("data-popconfirm-content", "")
        content.id = `${panel.id}-content`
        content.textContent = this.title || "Are you sure?"
        body.append(content)
      } else {
        if (!content.id) {
          content.id = `${panel.id}-content`
        }
        if (!content.textContent?.trim()) {
          content.textContent = this.title || "Are you sure?"
        }
      }

      const describedBy = panel.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean) ?? []
      if (!describedBy.includes(content.id)) {
        describedBy.push(content.id)
        panel.setAttribute("aria-describedby", describedBy.join(" "))
      }

      // Check or construct actions
      let actions = panel.querySelector<HTMLElement>("[data-popconfirm-actions]")
      if (!actions) {
        actions = this.ownerDocument.createElement("div")
        actions.setAttribute("data-popconfirm-actions", "")
        panel.append(actions)
      }
      let negative = actions.querySelector<HTMLButtonElement>("[data-popconfirm-negative]")
      if (!negative) {
        negative = this.ownerDocument.createElement("button")
        negative.type = "button"
        negative.setAttribute("data-popconfirm-negative", "")
        negative.textContent = this.negativeText
        actions.append(negative)
      }
      let positive = actions.querySelector<HTMLButtonElement>("[data-popconfirm-positive]")
      if (!positive) {
        positive = this.ownerDocument.createElement("button")
        positive.type = "button"
        positive.setAttribute("data-popconfirm-positive", "")
        positive.textContent = this.positiveText
        actions.append(positive)
      }

      // Check status & error regions
      let pending = panel.querySelector<HTMLElement>("[data-popconfirm-pending]")
      if (!pending) {
        pending = this.ownerDocument.createElement("p")
        pending.setAttribute("data-popconfirm-pending", "")
        pending.setAttribute("role", "status")
        pending.hidden = true
        pending.textContent = "Processing."
        panel.append(pending)
      }
      let error = panel.querySelector<HTMLElement>("[data-popconfirm-error]")
      if (!error) {
        error = this.ownerDocument.createElement("p")
        error.setAttribute("data-popconfirm-error", "")
        error.setAttribute("role", "alert")
        error.hidden = true
        error.textContent = "Action failed."
        panel.append(error)
      }
      let complete = panel.querySelector<HTMLElement>("[data-popconfirm-complete]")
      if (!complete) {
        complete = this.ownerDocument.createElement("p")
        complete.setAttribute("data-popconfirm-complete", "")
        complete.setAttribute("role", "status")
        complete.hidden = true
        complete.textContent = "Completed."
        panel.append(complete)
      }

      if (nativeTrigger instanceof HTMLButtonElement) {
        this.bindings.attr(nativeTrigger, "type", "button")
        this.bindings.attr(nativeTrigger, "popovertarget", panel.id)
        this.bindings.attr(nativeTrigger, "popovertargetaction", "toggle")
      }

      this.triggerElement = nativeTrigger
      this.panelElement = panel

      this.controller?.disconnect()
      try {
        this.controller = createPopconfirm(
          nativeTrigger,
          panel,
          {
            placement: this.placement as PopoverPlacement,
            onPositive: () => {
              const allowed = this.emit<PopconfirmClickDetail>(
                "m:positive-click",
                { value: this.positiveText },
                { bubbles: true, cancelable: true, composed: false },
              )
              return allowed
            },
            onNegative: () => {
              const allowed = this.emit<PopconfirmClickDetail>(
                "m:negative-click",
                { value: this.negativeText },
                { bubbles: true, cancelable: true, composed: false },
              )
              return allowed
            },
          },
        )
        if (this.disabled) {
          this.controller.disabled = true
        }
      } catch {
        this.controller = undefined
      }

      if (this.hasAttribute("show") && !this.show) {
        this.open()
      }
    } finally {
      this.synchronizing = false
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["id", "class", "popover", "disabled", "hidden"] })
      }
    }
  }
}
