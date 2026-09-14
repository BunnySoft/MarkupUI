import { ViewElement } from "../../core/index.js"

/**
 * ColorPicker component for selecting colors.
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["input","phrasing"],"min":0,"max":null}
 */
export class ColorPicker extends ViewElement {
  public static readonly tag = "m-color-picker"
  public static readonly observedAttributes = ["value", "disabled", "show-alpha"]

  private initialized = false
  private rendering = false
  private boundControl: HTMLInputElement | undefined
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-color-picker")
    this.render()
    this.ownerDocument.addEventListener("reset", this.onReset, true)
  }

  public disconnectedCallback(): void {
    this.unbind()
    this.observer?.disconnect()
    this.ownerDocument.removeEventListener("reset", this.onReset, true)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.initialized && this.isConnected && !this.rendering) {
      this.syncControl()
    }
  }

  /**
   * The current color value in hex format.
   */
  public get value(): string {
    return this.getAttribute("value") ?? "#000000"
  }

  public set value(value: string) {
    this.setAttribute("value", value)
    if (this.initialized) this.syncControl()
  }

  /**
   * Whether the color picker is disabled.
   */
  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.initialized) this.syncControl()
  }

  /**
   * Whether to show alpha transparency controls.
   */
  public get showAlpha(): boolean {
    return this.hasAttribute("show-alpha")
  }

  public set showAlpha(value: boolean) {
    this.setBooleanAttribute("show-alpha", value)
    if (this.initialized) this.syncControl()
  }

  public override focus(options?: FocusOptions): void {
    const control = this.childInput()
    if (control) control.focus(options)
    else super.focus(options)
  }

  public override blur(): void {
    const control = this.childInput()
    if (control) control.blur()
    else super.blur()
  }

  private childInput(): HTMLInputElement | null {
    return this.querySelector<HTMLInputElement>("input[type=color], input[data-color-control]")
      ?? this.querySelector<HTMLInputElement>("input")
  }

  private render(): void {
    this.rendering = true
    try {
      let control = this.childInput()
      if (!control) {
        control = this.ownerDocument.createElement("input")
        control.type = "color"
        control.setAttribute("data-color-control", "")
        control.defaultValue = this.value
        control.value = this.value
        control.classList.add("m-color-picker__control")
        this.append(control)
      } else {
        if (!control.classList.contains("m-color-picker__control")) {
          control.classList.add("m-color-picker__control")
        }
        if (!this.hasAttribute("value") && control.value) {
          this.setAttribute("value", control.value)
        }
        if (!this.hasAttribute("disabled") && control.disabled) {
          this.disabled = true
        }
      }

      if (control !== this.boundControl) {
        this.unbind()
        control.addEventListener("input", this.onInput)
        control.addEventListener("change", this.onChange)
        this.boundControl = control
      }

      this.syncControl()

      this.observer ??= new MutationObserver(() => {
        const current = this.childInput()
        if (current !== this.boundControl) {
          this.render()
        }
      })
      this.observer.observe(this, { childList: true })
    } finally {
      this.rendering = false
    }
  }

  private unbind(): void {
    if (this.boundControl) {
      this.boundControl.removeEventListener("input", this.onInput)
      this.boundControl.removeEventListener("change", this.onChange)
      this.boundControl = undefined
    }
  }

  private syncControl(): void {
    const control = this.childInput()
    if (!control) return
    if (control.value !== this.value) {
      control.value = this.value
    }
    control.disabled = this.disabled
    if (this.showAlpha) {
      this.setAttribute("data-show-alpha", "")
    } else {
      this.removeAttribute("data-show-alpha")
    }
    const output = this.querySelector<HTMLElement>("[data-color-output]")
    if (output) {
      output.textContent = this.value
      output.hidden = false
    }
  }

  private onInput = (event: Event): void => {
    const control = this.childInput()
    if (!control || event.target !== control) return
    const val = control.value
    if (this.value !== val) {
      this.rendering = true
      try {
        this.setAttribute("value", val)
      } finally {
        this.rendering = false
      }
      const output = this.querySelector<HTMLElement>("[data-color-output]")
      if (output) output.textContent = val
      this.emit<{ value: string }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onChange = (event: Event): void => {
    const control = this.childInput()
    if (!control || event.target !== control) return
    const val = control.value
    if (this.value !== val) {
      this.rendering = true
      try {
        this.setAttribute("value", val)
      } finally {
        this.rendering = false
      }
      const output = this.querySelector<HTMLElement>("[data-color-output]")
      if (output) output.textContent = val
      this.emit<{ value: string }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onReset = (event: Event): void => {
    const control = this.childInput()
    if (control && control.form === event.target) {
      setTimeout(() => {
        if (this.isConnected && control) {
          this.value = control.value
        }
      }, 0)
    }
  }
}
