import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import type { PopoverPlacement } from "../popover/position.js"
import { popoverPlacements, popoverTriggers } from "../popover/model.js"
import type { PopoverTriggerMode } from "../popover/model.js"
import { createPopover } from "../popover/popover.js"
import type { PopoverController } from "../popover/popover.js"

let popselectSequence = 0

/**
 * A popselect component for selecting values from a popup panel.
 * @region {"name":"trigger","element":"m-popselect-trigger","accepts":["native button","m-button","native focusable"],"min":0,"max":1}
 * @region {"name":"panel","element":"m-popselect-panel","accepts":["flow content"],"min":0,"max":1}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Popselect extends ViewElement {
  public static readonly tag = "m-popselect"
  public static readonly observedAttributes = [
    "value", "placeholder", "disabled", "placement", "multiple", "trigger",
  ]

  private popoverController: PopoverController | undefined
  private observer: MutationObserver | undefined
  private bindings = ownedWrites()
  private initialized = false
  private ready = false
  private synchronizing = false
  private triggerElement: HTMLElement | undefined
  private panelElement: HTMLElement | undefined
  private selectControl: HTMLSelectElement | undefined
  private generatedPanel: HTMLElement | undefined
  private generatedTrigger: HTMLButtonElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "popselect"
    this.classList.add("m-popselect")
    this.observer ??= new MutationObserver(records => {
      if (this.synchronizing) return
      if (records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement
        if (!target || target.closest("m-popselect") !== this) return false
        if (this.panelElement && (target === this.panelElement || this.panelElement.contains(target))) return false
        if (target === this && record.type === "attributes" && Popselect.observedAttributes.includes(record.attributeName!)) return false
        return true
      })) this.synchronize()
    })
    this.ready = true
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
    this.popoverController?.disconnect()
    this.popoverController = undefined
    if (this.selectControl) {
      this.selectControl.removeEventListener("change", this.onSelectChange)
      this.selectControl = undefined
    }
    this.triggerElement = undefined
    this.panelElement = undefined
    if (this.generatedPanel) {
      this.generatedPanel.remove()
      this.generatedPanel = undefined
    }
    if (this.generatedTrigger) {
      this.generatedTrigger.remove()
      this.generatedTrigger = undefined
    }
    this.bindings.restore()
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected || !this.ready) return
    if (name === "disabled") {
      if (this.popoverController) {
        this.popoverController.disabled = this.disabled
      }
      if (this.triggerElement instanceof HTMLButtonElement) {
        this.triggerElement.disabled = this.disabled
      }
      const mButton = this.querySelector("m-button")
      if (mButton) {
        (mButton as { disabled?: boolean }).disabled = this.disabled
      }
      if (this.selectControl) {
        this.selectControl.disabled = this.disabled
      }
      if (this.disabled) this.popoverController?.close()
      return
    }
    if (name === "value") {
      if (this.selectControl && this.selectControl.value !== this.value) {
        this.selectControl.value = this.value
      }
      this.updateReadout()
      return
    }
    if (name === "placeholder") {
      this.updateReadout()
      return
    }
    if (name === "multiple") {
      if (this.selectControl) {
        this.selectControl.multiple = this.multiple
      }
      return
    }
    this.synchronize()
  }

  public get value(): string {
    return this.getAttribute("value") ?? ""
  }
  public set value(value: string) {
    this.setStringAttribute("value", value)
  }

  public get placeholder(): string {
    return this.getAttribute("placeholder") ?? ""
  }
  public set placeholder(value: string) {
    this.setStringAttribute("placeholder", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get placement(): PopoverPlacement {
    return this.choiceAttribute("placement", popoverPlacements, "bottom-start")
  }
  public set placement(value: PopoverPlacement) {
    this.setChoiceAttribute("placement", value, popoverPlacements)
  }

  public get multiple(): boolean {
    return this.hasAttribute("multiple")
  }
  public set multiple(value: boolean) {
    this.setBooleanAttribute("multiple", value)
  }

  public get trigger(): PopoverTriggerMode {
    return this.choiceAttribute("trigger", popoverTriggers, "click")
  }
  public set trigger(value: PopoverTriggerMode) {
    this.setChoiceAttribute("trigger", value, popoverTriggers)
  }

  public open(): boolean {
    if (!this.popoverController?.connected) return false
    return this.popoverController.open()
  }

  public close(): void {
    this.popoverController?.close()
  }

  public toggle(): boolean {
    if (this.popoverController?.show) {
      this.close()
      return false
    }
    return this.open()
  }

  public syncPosition(): boolean {
    return this.popoverController?.syncPosition() ?? false
  }

  private onSelectChange = (): void => {
    if (!this.selectControl) return
    const newValue = this.selectControl.value
    this.value = newValue
    this.dispatchEvent(
      new CustomEvent("m:change", {
        bubbles: true,
        cancelable: false,
        composed: false,
        detail: { value: newValue },
      }),
    )
    this.updateReadout()
  }

  private updateReadout(): void {
    const selectedOptions = this.selectControl
      ? [...this.selectControl.options].filter(o => o.selected)
      : []
    const displayText = selectedOptions.length > 0
      ? selectedOptions.map(o => o.label || o.text).join(", ")
      : (this.placeholder || "")

    const readout = this.querySelector<HTMLElement>("[data-popselect-value]")
    if (readout) {
      readout.textContent = displayText
    }
    if (this.generatedTrigger && this.generatedTrigger === this.triggerElement) {
      this.generatedTrigger.textContent = displayText || "Select"
    }
  }

  private synchronize(): void {
    if (!this.isConnected || this.synchronizing) return
    this.synchronizing = true
    this.observer?.disconnect()
    try {
      const triggerRegion = this.querySelector<HTMLElement>(":scope > m-popselect-trigger")
      const panelRegion = this.querySelector<HTMLElement>(":scope > m-popselect-panel")

      let trigger: HTMLElement | undefined
      if (triggerRegion) {
        trigger = triggerRegion.querySelector<HTMLElement>("button, input:not([type=hidden]), select, textarea, a[href], m-button")
          ?? (triggerRegion.firstElementChild instanceof HTMLElement ? triggerRegion.firstElementChild : triggerRegion)
      } else {
        const candidates = [...this.children].filter(child =>
          child !== panelRegion &&
          child !== this.generatedPanel &&
          child.localName !== "m-popselect-panel" &&
          child.localName !== "option" &&
          child.localName !== "optgroup" &&
          child.localName !== "select" &&
          !(child.classList.contains("m-popover") || child.classList.contains("m-popselect-panel")) &&
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
        panel = candidates.find(child => child.classList.contains("m-popselect-panel") || child.classList.contains("m-popover") || child.hasAttribute("popover"))
        if (!panel) {
          if (!this.generatedPanel) {
            this.generatedPanel = this.ownerDocument.createElement("m-popselect-panel")
            this.append(this.generatedPanel)
          }
          panel = this.generatedPanel
        }
      }

      if (!panel) {
        this.popoverController?.disconnect()
        this.popoverController = undefined
        return
      }

      if (!panel.id) {
        panel.id = `m-popselect-panel-${++popselectSequence}`
      }

      panel.classList.add("m-popover", "m-popselect-panel")
      panel.setAttribute("data-popselect-panel", "")
      panel.setAttribute("role", "region")
      panel.setAttribute("popover", "auto")
      if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby")) {
        panel.setAttribute("aria-label", this.placeholder || "Choices")
      }

      let selectRoot = panel.querySelector<HTMLElement>(".m-select, [data-select]")
      let selectControl = panel.querySelector<HTMLSelectElement>("select, [data-select-control]")

      if (!selectControl) {
        const directSelect = this.querySelector<HTMLSelectElement>(":scope > select")
        if (directSelect) {
          selectControl = directSelect
        }
      }

      if (!selectRoot && !selectControl) {
        selectRoot = this.ownerDocument.createElement("div")
        selectRoot.className = "m-select"
        selectRoot.setAttribute("data-select", "")
        panel.prepend(selectRoot)
      }

      if (!selectControl) {
        selectControl = this.ownerDocument.createElement("select")
        selectControl.setAttribute("data-select-control", "")
        selectControl.size = 5
        if (selectRoot) selectRoot.append(selectControl)
        else panel.prepend(selectControl)
      } else {
        if (!selectControl.hasAttribute("data-select-control")) {
          selectControl.setAttribute("data-select-control", "")
        }
        if (!selectControl.hasAttribute("size")) {
          selectControl.size = 5
        }
        if (selectRoot && !selectRoot.contains(selectControl)) {
          selectRoot.append(selectControl)
        } else if (!panel.contains(selectControl)) {
          panel.append(selectControl)
        }
      }

      const directOptions = [...this.children].filter(c => c.localName === "option" || c.localName === "optgroup")
      for (const opt of directOptions) {
        selectControl.append(opt)
      }
      const panelOptions = [...panel.children].filter(c => c.localName === "option" || c.localName === "optgroup")
      for (const opt of panelOptions) {
        selectControl.append(opt)
      }

      let done = panel.querySelector<HTMLButtonElement>("[data-popselect-done]")
      if (!done) {
        done = this.ownerDocument.createElement("button")
        done.type = "button"
        done.setAttribute("data-popselect-done", "")
        done.setAttribute("popovertarget", panel.id)
        done.setAttribute("popovertargetaction", "hide")
        done.textContent = "Done"
        let footer = panel.querySelector<HTMLElement>("footer")
        if (!footer) {
          footer = this.ownerDocument.createElement("footer")
          panel.append(footer)
        }
        footer.append(done)
      } else {
        done.setAttribute("popovertarget", panel.id)
        done.setAttribute("popovertargetaction", "hide")
      }

      if (!trigger) {
        if (!this.generatedTrigger) {
          this.generatedTrigger = this.ownerDocument.createElement("button")
          this.generatedTrigger.type = "button"
          this.generatedTrigger.className = "m-popselect-trigger"
          this.generatedTrigger.setAttribute("data-popselect-trigger", "")
          this.prepend(this.generatedTrigger)
        }
        trigger = this.generatedTrigger
      }

      const mButton = trigger.localName === "m-button" ? trigger : trigger.querySelector("m-button")
      let nativeTrigger: HTMLElement = trigger
      if (mButton) {
        const control = (mButton as { control?: HTMLElement }).control ?? mButton.querySelector("button, a")
        if (control instanceof HTMLElement) nativeTrigger = control
      }

      if (nativeTrigger instanceof HTMLButtonElement) {
        if (!nativeTrigger.hasAttribute("type")) nativeTrigger.type = "button"
        nativeTrigger.disabled = this.disabled
      }
      if (trigger instanceof HTMLButtonElement) {
        trigger.disabled = this.disabled
      }
      if (mButton) {
        (mButton as { disabled?: boolean }).disabled = this.disabled
      }

      selectControl.multiple = this.multiple
      selectControl.disabled = this.disabled

      this.bindings.restore()

      if (this.trigger === "click") {
        nativeTrigger.setAttribute("popovertarget", panel.id)
        if (trigger !== nativeTrigger) {
          trigger.setAttribute("popovertarget", panel.id)
        }
      } else {
        nativeTrigger.removeAttribute("popovertarget")
        if (trigger !== nativeTrigger) {
          trigger.removeAttribute("popovertarget")
        }
      }

      selectControl.removeEventListener("change", this.onSelectChange)
      selectControl.addEventListener("change", this.onSelectChange)

      this.triggerElement = trigger
      this.panelElement = panel
      this.selectControl = selectControl

      if (this.hasAttribute("value")) {
        selectControl.value = this.value
      } else if (selectControl.value) {
        this.setStringAttribute("value", selectControl.value)
      }

      this.popoverController?.disconnect()
      this.popoverController = createPopover(nativeTrigger, panel, {
        trigger: this.trigger,
        placement: this.placement,
        disabled: this.disabled,
      })

      this.updateReadout()
    } finally {
      this.synchronizing = false
      if (this.isConnected && this.observer) {
        this.observer.observe(this, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["disabled", "value", "placeholder", "multiple", "placement", "trigger"],
        })
      }
    }
  }
}
