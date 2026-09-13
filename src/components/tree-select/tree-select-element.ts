import { ViewElement } from "../../core/index.js"

/**
 * TreeSelect component for hierarchical selection.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["tree-node","phrasing"],"min":0,"max":null}
 */
export class TreeSelect extends ViewElement {
  public static readonly tag = "m-tree-select"
  public static readonly observedAttributes = ["value", "placeholder", "disabled", "clearable", "multiple", "checkable"]

  private initialized = false
  private boundControl: HTMLSelectElement | undefined
  private boundClear: HTMLButtonElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-tree-select")
    this.render()
  }

  public disconnectedCallback(): void {
    this.unbind()
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (this.initialized && this.isConnected) {
      if (name === "multiple") {
        this.render()
      } else {
        this.syncControl()
      }
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }

  public set value(value: string | null) {
    this.setStringAttribute("value", value)
    if (this.initialized) this.syncControl()
  }

  public get placeholder(): string | null {
    return this.getAttribute("placeholder")
  }

  public set placeholder(value: string | null) {
    this.setStringAttribute("placeholder", value)
    if (this.initialized) this.syncControl()
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.initialized) this.syncControl()
  }

  public get clearable(): boolean {
    return this.hasAttribute("clearable")
  }

  public set clearable(value: boolean) {
    this.setBooleanAttribute("clearable", value)
    if (this.initialized) this.syncControl()
  }

  public get multiple(): boolean {
    return this.hasAttribute("multiple")
  }

  public set multiple(value: boolean) {
    this.setBooleanAttribute("multiple", value)
    if (this.initialized && this.isConnected) this.render()
  }

  public get checkable(): boolean {
    return this.hasAttribute("checkable")
  }

  public set checkable(value: boolean) {
    this.setBooleanAttribute("checkable", value)
    if (this.initialized) this.syncControl()
  }

  public clear(): void {
    this.value = null
    const control = this.childControl()
    if (control) {
      control.value = ""
    }
    this.emit<{ value: string }>("m:change", { value: "" }, { bubbles: true, cancelable: false, composed: false })
  }

  public override focus(options?: FocusOptions): void {
    const control = this.childControl()
    control?.focus(options)
  }

  public override blur(): void {
    const control = this.childControl()
    control?.blur()
  }

  private childControl(): HTMLSelectElement | null {
    const selects = [...this.querySelectorAll<HTMLSelectElement>("select")].filter(
      s => s.closest("m-tree-select") === this,
    )
    return selects[0] ?? null
  }

  private unbind(): void {
    if (this.boundControl) {
      this.boundControl.removeEventListener("input", this.onControlChange)
      this.boundControl.removeEventListener("change", this.onControlChange)
      this.boundControl = undefined
    }
    if (this.boundClear) {
      this.boundClear.removeEventListener("click", this.onClearClick)
      this.boundClear = undefined
    }
  }

  private onControlChange = (): void => {
    const control = this.childControl()
    if (control) {
      const val = control.value || null
      this.setStringAttribute("value", val)
      this.emit<{ value: string }>("m:change", { value: val ?? "" }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onClearClick = (event: MouseEvent): void => {
    event.preventDefault()
    this.clear()
  }

  private render(): void {
    this.unbind()
    let control = this.childControl()
    if (!control) {
      const field = this.ownerDocument.createElement("div")
      field.setAttribute("data-tree-select-field", "")
      control = this.ownerDocument.createElement("select")
      control.setAttribute("data-select-control", "")
      field.append(control)
      this.append(field)
    } else if (!control.hasAttribute("data-select-control")) {
      control.setAttribute("data-select-control", "")
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-tree-select-clear]")
    if (this.clearable && !clearBtn) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-tree-select-clear", "")
      clearBtn.setAttribute("aria-label", "Clear selection")
      clearBtn.textContent = "Clear"
      this.append(clearBtn)
    }

    control.addEventListener("input", this.onControlChange)
    control.addEventListener("change", this.onControlChange)
    this.boundControl = control

    if (clearBtn) {
      clearBtn.addEventListener("click", this.onClearClick)
      this.boundClear = clearBtn
    }

    this.syncControl()
  }

  private syncControl(): void {
    const control = this.childControl()
    const disabled = this.disabled
    const placeholder = this.placeholder
    const val = this.value
    const multiple = this.multiple

    if (control) {
      control.disabled = disabled
      control.multiple = multiple

      let placeholderOption = control.querySelector<HTMLOptionElement>("option[data-tree-select-placeholder]")
      if (!placeholderOption && control.options.length > 0 && control.options[0]!.value === "") {
        placeholderOption = control.options[0]!
      }
      if (placeholder !== null) {
        if (!placeholderOption) {
          placeholderOption = this.ownerDocument.createElement("option")
          placeholderOption.value = ""
          placeholderOption.setAttribute("data-tree-select-placeholder", "")
          control.prepend(placeholderOption)
        }
        placeholderOption.textContent = placeholder
      } else if (placeholderOption && placeholderOption.hasAttribute("data-tree-select-placeholder")) {
        placeholderOption.remove()
      }

      if (val !== null) {
        const matching = [...control.options].find(opt => opt.value === val)
        if (matching) {
          matching.selected = true
        } else {
          const option = this.ownerDocument.createElement("option")
          option.value = val
          option.textContent = val
          option.selected = true
          control.append(option)
        }
        control.value = val
      } else {
        control.value = ""
      }
    }

    let clearBtn = this.querySelector<HTMLButtonElement>("[data-tree-select-clear]")
    if (this.clearable && !clearBtn && this.isConnected) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-tree-select-clear", "")
      clearBtn.setAttribute("aria-label", "Clear selection")
      clearBtn.textContent = "Clear"
      clearBtn.addEventListener("click", this.onClearClick)
      this.boundClear = clearBtn
      this.append(clearBtn)
    }

    if (clearBtn) {
      clearBtn.disabled = disabled
      clearBtn.hidden = !this.clearable
    }
  }
}
