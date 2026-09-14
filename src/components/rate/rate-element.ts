import { ViewElement } from "../../core/index.js"

export type RateSize = "small" | "medium" | "large"
export const rateSizes: readonly RateSize[] = ["small", "medium", "large"] as const

/**
 * A rate component for rating with stars or custom icons.
 * @region {"name":"content","accepts":["phrasing","text"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"number"}}
 */
export class Rate extends ViewElement {
  public static readonly tag = "m-rate"
  public static readonly observedAttributes = [
    "value",
    "count",
    "allow-half",
    "disabled",
    "readonly",
    "clearable",
    "size",
  ]

  private fallbackName = "m-rate-" + Math.random().toString(36).slice(2, 9)
  private generated = false
  private initialized = false

  private get groupName(): string {
    return this.getAttribute("name") || (this.id ? `${this.id}-choice` : this.fallbackName)
  }

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-rate")
    this.setAttribute("data-rate-cumulative", "")
    this.setAttribute("data-size", this.size)
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "radiogroup")
    }
    this.render()
    this.syncDisabled()
    this.syncReadonly()
    this.setupListeners()
  }

  public disconnectedCallback(): void {
    this.cleanupListeners()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.initialized || !this.isConnected) return
    if (name === "size") {
      this.setAttribute("data-size", this.size)
    } else if (name === "disabled") {
      this.syncDisabled()
    } else if (name === "readonly") {
      this.syncReadonly()
    } else if (name === "value") {
      this.syncValue()
    } else if (name === "count" || name === "allow-half") {
      this.render()
    } else if (name === "clearable") {
      this.syncClearable()
    }
  }

  public get value(): number {
    return this.numberAttribute("value", 0)
  }
  public set value(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError("Invalid rate value.")
    }
    this.setAttribute("value", String(value))
  }

  public get count(): number {
    return this.numberAttribute("count", 5)
  }
  public set count(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
      throw new RangeError("Invalid rate count.")
    }
    this.setAttribute("count", String(value))
  }

  public get allowHalf(): boolean {
    return this.hasAttribute("allow-half")
  }
  public set allowHalf(value: boolean) {
    this.setBooleanAttribute("allow-half", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get readonly(): boolean {
    return this.hasAttribute("readonly")
  }
  public set readonly(value: boolean) {
    this.setBooleanAttribute("readonly", value)
  }

  public get clearable(): boolean {
    return this.hasAttribute("clearable")
  }
  public set clearable(value: boolean) {
    this.setBooleanAttribute("clearable", value)
  }

  public get size(): RateSize {
    return this.choiceAttribute("size", rateSizes, "medium")
  }
  public set size(value: RateSize) {
    this.setChoiceAttribute("size", value, rateSizes)
  }

  public override focus(options?: FocusOptions): void {
    const inputs = [...this.querySelectorAll<HTMLInputElement>("input[type='radio']")]
    const checked = inputs.find(i => i.checked)
    const target = checked ?? inputs[0]
    target?.focus(options)
  }

  public override blur(): void {
    const inputs = [...this.querySelectorAll<HTMLInputElement>("input[type='radio']")]
    const active = inputs.find(i => i === this.ownerDocument.activeElement)
    active?.blur()
  }

  public clear(): void {
    if (this.disabled || this.readonly) return
    const prev = this.value
    this.value = 0
    if (prev !== 0) {
      this.emit<{ value: number }>("m:change", { value: 0 }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  public setValue(value: number): void {
    this.value = value
  }

  private setupListeners(): void {
    this.addEventListener("change", this.onInputChange)
    this.addEventListener("click", this.onClick)
  }

  private cleanupListeners(): void {
    this.removeEventListener("change", this.onInputChange)
    this.removeEventListener("click", this.onClick)
  }

  private onInputChange = (event: Event): void => {
    const target = event.target as HTMLElement | null
    if (target instanceof HTMLInputElement && target.type === "radio" && target.closest("m-rate") === this) {
      const newVal = Number(target.value)
      if (newVal !== this.value) {
        this.value = newVal
        this.emit<{ value: number }>("m:change", { value: newVal }, { bubbles: true, cancelable: false, composed: false })
      }
    }
  }

  private onClick = (event: MouseEvent): void => {
    if (this.disabled || this.readonly) return
    const target = event.target as HTMLElement | null
    if (!target) return

    const clearBtn = target.closest("[data-rate-clear]")
    if (clearBtn && this.contains(clearBtn)) {
      event.preventDefault()
      this.clear()
      return
    }

    if (this.clearable) {
      const choice = target.closest(".m-rate__choice")
      if (choice && this.contains(choice)) {
        const input = choice.querySelector<HTMLInputElement>("input[type='radio']")
        if (input && Number(input.value) === this.value && this.value !== 0) {
          event.preventDefault()
          this.clear()
        }
      }
    }
  }

  private render(): void {
    let choicesContainer = this.querySelector<HTMLElement>(".m-rate__choices")
    if (!choicesContainer) {
      choicesContainer = this.ownerDocument.createElement("div")
      choicesContainer.className = "m-rate__choices"
      this.append(choicesContainer)
      this.generated = true
    }

    if (this.generated) {
      const count = this.count
      const allowHalf = this.allowHalf
      const factor = allowHalf ? 2 : 1
      const totalSteps = count * factor
      const val = this.value
      const groupName = this.groupName

      const fragment = this.ownerDocument.createDocumentFragment()
      for (let i = 1; i <= totalSteps; i++) {
        const stepVal = i / factor
        const isHalf = allowHalf && i % 2 !== 0

        const label = this.ownerDocument.createElement("label")
        label.className = "m-rate__choice"

        const input = this.ownerDocument.createElement("input")
        input.type = "radio"
        input.setAttribute("data-radio", "")
        input.name = groupName
        input.value = String(stepVal)
        if (val === stepVal) {
          input.checked = true
        }
        if (this.disabled || this.readonly) {
          input.disabled = true
        }

        const glyph = this.ownerDocument.createElement("span")
        glyph.className = "m-rate__glyph"
        glyph.setAttribute("aria-hidden", "true")
        if (isHalf) {
          glyph.setAttribute("data-half", "")
          glyph.textContent = "★"
          const halfFill = this.ownerDocument.createElement("span")
          halfFill.className = "m-rate__half-fill"
          halfFill.textContent = "★"
          glyph.append(halfFill)
        } else {
          glyph.textContent = "★"
        }

        const score = this.ownerDocument.createElement("span")
        score.className = "m-rate__score"
        score.textContent = `${stepVal} of ${count}`

        label.append(input, glyph, score)
        fragment.append(label)
      }
      choicesContainer.replaceChildren(fragment)

      let clearBtn = this.querySelector<HTMLButtonElement>("[data-rate-clear]")
      if (this.clearable) {
        if (!clearBtn) {
          clearBtn = this.ownerDocument.createElement("button")
          clearBtn.setAttribute("data-rate-clear", "")
          clearBtn.type = "button"
          clearBtn.textContent = "Clear"
          clearBtn.setAttribute("aria-label", "Clear rating")
          this.append(clearBtn)
        }
        clearBtn.hidden = val === 0
        clearBtn.disabled = this.disabled || this.readonly
      } else if (clearBtn && this.generated) {
        clearBtn.remove()
      }
    } else {
      this.syncValue()
      this.syncDisabled()
    }
  }

  private syncValue(): void {
    const val = this.value
    const inputs = this.querySelectorAll<HTMLInputElement>("input[type='radio']")
    for (const input of inputs) {
      input.checked = Number(input.value) === val
    }
    const clearBtn = this.querySelector<HTMLButtonElement>("[data-rate-clear]")
    if (clearBtn && this.clearable) {
      clearBtn.hidden = val === 0
    }
  }

  private syncDisabled(): void {
    const isDisabled = this.disabled
    if (isDisabled) {
      this.setAttribute("aria-disabled", "true")
    } else {
      this.removeAttribute("aria-disabled")
    }
    const inputs = this.querySelectorAll<HTMLInputElement>("input[type='radio']")
    for (const input of inputs) {
      input.disabled = isDisabled || this.readonly
    }
    const clearBtn = this.querySelector<HTMLButtonElement>("[data-rate-clear]")
    if (clearBtn) {
      clearBtn.disabled = isDisabled || this.readonly
    }
  }

  private syncReadonly(): void {
    const isReadonly = this.readonly
    if (isReadonly) {
      this.setAttribute("aria-readonly", "true")
    } else {
      this.removeAttribute("aria-readonly")
    }
    const inputs = this.querySelectorAll<HTMLInputElement>("input[type='radio']")
    for (const input of inputs) {
      input.disabled = this.disabled || isReadonly
    }
    const clearBtn = this.querySelector<HTMLButtonElement>("[data-rate-clear]")
    if (clearBtn) {
      clearBtn.disabled = this.disabled || isReadonly
    }
  }

  private syncClearable(): void {
    let clearBtn = this.querySelector<HTMLButtonElement>("[data-rate-clear]")
    if (this.clearable) {
      if (!clearBtn && this.generated) {
        clearBtn = this.ownerDocument.createElement("button")
        clearBtn.setAttribute("data-rate-clear", "")
        clearBtn.type = "button"
        clearBtn.textContent = "Clear"
        clearBtn.setAttribute("aria-label", "Clear rating")
        this.append(clearBtn)
      }
      if (clearBtn) {
        clearBtn.hidden = this.value === 0
        clearBtn.disabled = this.disabled || this.readonly
      }
    } else if (clearBtn && this.generated) {
      clearBtn.remove()
    }
  }
}
