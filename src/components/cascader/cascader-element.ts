import { ViewElement } from "../../core/index.js"

export type CascaderExpandTrigger = "click" | "hover"
export const cascaderExpandTriggers: readonly CascaderExpandTrigger[] = ["click", "hover"] as const

/**
 * Cascader component for multi-level hierarchical selection with dependent options.
 * @region {"name":"content","accepts":["tree","select","phrasing"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Cascader extends ViewElement {
  public static readonly tag = "m-cascader"
  public static readonly observedAttributes = [
    "value",
    "placeholder",
    "disabled",
    "clearable",
    "expand-trigger",
    "separator",
  ]

  private initialized = false
  private boundControls = new Set<HTMLInputElement | HTMLSelectElement>()
  private boundClear: HTMLButtonElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-cascader")
    this.render()
  }

  public disconnectedCallback(): void {
    this.unbind()
  }

  public attributeChangedCallback(_name: string, _oldValue: string | null, _newValue: string | null): void {
    if (this.initialized && this.isConnected) {
      this.syncControls()
    }
  }

  private data: readonly any[] = []
  private selectedPath: string[] = []

  public get options(): readonly any[] {
    return this.data
  }
  public set options(value: readonly any[]) {
    this.data = Array.isArray(value) ? value : []
    this.selectedPath = []
    this.renderOptions()
  }

  private renderOptions(): void {
    if (!this.isConnected || this.data.length === 0) return
    const selects: HTMLSelectElement[] = []
    let options = this.data
    let level = 0
    while (options && options.length > 0) {
      const select = this.ownerDocument.createElement("select")
      select.setAttribute("aria-label", `Level ${level + 1}`)
      const selected = this.selectedPath[level] ?? options[0]?.value ?? ""
      options.forEach((option) => {
        const item = this.ownerDocument.createElement("option")
        item.value = option.value
        item.textContent = option.label
        select.append(item)
      })
      select.value = selected
      this.selectedPath[level] = selected
      select.addEventListener("change", () => {
        this.selectedPath = [...this.selectedPath.slice(0, level), select.value]
        this.renderOptions()
        this.dispatchEvent(new CustomEvent("m:change", {
          bubbles: true,
          detail: this.selectedPath,
        }))
      })
      selects.push(select)
      const next = options.find((opt) => opt.value === selected)?.children ?? []
      if (next.length > 0 && this.selectedPath[level + 1] === undefined) {
        this.selectedPath[level + 1] = next[0]?.value ?? ""
      }
      options = next
      level += 1
    }
    this.replaceChildren(...selects)
  }

  public get value(): string | string[] | null {
    if (this.selectedPath.length > 0) return [...this.selectedPath]
    return this.getAttribute("value")
  }

  public set value(value: string | string[] | null) {
    if (Array.isArray(value)) {
      this.selectedPath = [...value]
      this.renderOptions()
    } else {
      this.setStringAttribute("value", value)
      if (this.initialized) this.syncControls()
    }
  }

  public get placeholder(): string | null {
    return this.getAttribute("placeholder")
  }

  public set placeholder(value: string | null) {
    this.setStringAttribute("placeholder", value)
    if (this.initialized) this.syncControls()
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.initialized) this.syncControls()
  }

  public get clearable(): boolean {
    return this.hasAttribute("clearable")
  }

  public set clearable(value: boolean) {
    this.setBooleanAttribute("clearable", value)
    if (this.initialized) this.syncControls()
  }

  public get expandTrigger(): CascaderExpandTrigger {
    return this.choiceAttribute("expand-trigger", cascaderExpandTriggers, "click")
  }

  public set expandTrigger(value: CascaderExpandTrigger) {
    this.setChoiceAttribute("expand-trigger", value, cascaderExpandTriggers)
    if (this.initialized) this.syncControls()
  }

  public get separator(): string {
    return this.getAttribute("separator") ?? " / "
  }

  public set separator(value: string) {
    this.setStringAttribute("separator", value)
    if (this.initialized) this.syncControls()
  }

  public override focus(options?: FocusOptions): void {
    const controls = this.childControls()
    controls[0]?.focus(options)
  }

  public override blur(): void {
    const controls = this.childControls()
    controls[0]?.blur()
  }

  public clear(): void {
    this.value = null
    const controls = this.childControls()
    for (const control of controls) {
      control.value = ""
    }
    this.emit<{ value: string }>("m:change", { value: "" }, { bubbles: true, cancelable: false, composed: false })
  }

  private childControls(): (HTMLInputElement | HTMLSelectElement)[] {
    return [...this.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")].filter(
      control => control.closest("m-cascader") === this,
    )
  }

  private childClear(): HTMLButtonElement | undefined {
    return [...this.querySelectorAll<HTMLButtonElement>("button[data-cascader-clear]")].find(
      btn => btn.closest("m-cascader") === this,
    )
  }

  private unbind(): void {
    for (const control of this.boundControls) {
      control.removeEventListener("input", this.onControlChange)
      control.removeEventListener("change", this.onControlChange)
    }
    this.boundControls.clear()
    if (this.boundClear) {
      this.boundClear.removeEventListener("click", this.onClearClick)
      this.boundClear = undefined
    }
  }

  private onControlChange = (event: Event): void => {
    const target = event.target as HTMLInputElement | HTMLSelectElement | null
    if (!target || !this.boundControls.has(target)) return
    const val = target.value
    this.setStringAttribute("value", val || null)
    this.emit<{ value: string }>("m:change", { value: val }, { bubbles: true, cancelable: false, composed: false })
  }

  private onClearClick = (event: MouseEvent): void => {
    event.stopPropagation()
    this.clear()
  }

  private render(): void {
    this.unbind()
    let controls = this.childControls()
    if (controls.length === 0) {
      const input = this.ownerDocument.createElement("input")
      input.setAttribute("data-cascader-control", "")
      input.type = "text"
      if (this.placeholder !== null) {
        input.placeholder = this.placeholder
      }
      const currentVal = this.value
      input.value = (Array.isArray(currentVal) ? currentVal.join(this.separator) : currentVal) ?? ""
      input.disabled = this.disabled
      this.append(input)
      controls = this.childControls()
    }

    let clearBtn = this.childClear()
    if (this.clearable && !clearBtn) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-cascader-clear", "")
      clearBtn.setAttribute("aria-label", "Clear")
      clearBtn.textContent = "Clear"
      this.append(clearBtn)
    }

    for (const control of controls) {
      control.addEventListener("input", this.onControlChange)
      control.addEventListener("change", this.onControlChange)
      this.boundControls.add(control)
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", this.onClearClick)
      this.boundClear = clearBtn
    }

    this.syncControls()
  }

  private syncControls(): void {
    const controls = this.childControls()
    const disabled = this.disabled
    const placeholder = this.placeholder
    const val = this.value

    for (const control of controls) {
      control.disabled = disabled
      if ("placeholder" in control) {
        if (placeholder !== null) {
          control.placeholder = placeholder
        } else {
          control.removeAttribute("placeholder")
        }
      }
      if (controls.length === 1) {
        control.value = (Array.isArray(val) ? val.join(this.separator) : val) ?? ""
      } else if (val === null) {
        control.value = ""
      }
    }

    let clearBtn = this.childClear()
    if (this.clearable && !clearBtn && this.isConnected) {
      clearBtn = this.ownerDocument.createElement("button")
      clearBtn.type = "button"
      clearBtn.setAttribute("data-cascader-clear", "")
      clearBtn.setAttribute("aria-label", "Clear")
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
