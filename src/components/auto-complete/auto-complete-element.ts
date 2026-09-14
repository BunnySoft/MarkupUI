import { ViewElement } from "../../core/index.js"

export type AutoCompleteSize = "small" | "medium" | "large"
export const autoCompleteSizes: readonly AutoCompleteSize[] = ["small", "medium", "large"] as const

/**
 * AutoComplete component providing suggestions for text input.
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @region {"name":"content","accepts":["input","datalist","phrasing"],"min":0,"max":null}
 */
export class AutoComplete extends ViewElement {
  public static readonly tag: string = "m-auto-complete"
  public static readonly observedAttributes = [
    "value",
    "placeholder",
    "disabled",
    "clearable",
    "size",
  ]

  #initialized = false
  #input: HTMLInputElement | null = null
  #clearBtn: HTMLButtonElement | null = null
  #inputHandler: (() => void) | null = null
  #changeHandler: (() => void) | null = null
  #clearHandler: ((event: MouseEvent) => void) | null = null

  public connectedCallback(): void {
    if (!this.#initialized) {
      this.#initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-auto-complete")
    this.dataset.size = this.size
    this.#setupDOM()
  }

  public disconnectedCallback(): void {
    this.#teardownDOM()
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (!this.#initialized) return
    if (name === "value") {
      if (this.#input && this.#input.value !== (newValue ?? "")) {
        this.#input.value = newValue ?? ""
      }
      this.#updateClearButton()
    } else if (name === "placeholder") {
      if (this.#input) {
        this.#input.placeholder = newValue ?? ""
      }
    } else if (name === "disabled") {
      if (this.#input) {
        this.#input.disabled = this.disabled
      }
      this.#updateClearButton()
    } else if (name === "clearable") {
      this.#updateClearButton()
    } else if (name === "size") {
      this.dataset.size = this.size
    }
  }

  public get value(): string {
    return this.getAttribute("value") ?? ""
  }

  public set value(value: string) {
    this.setStringAttribute("value", value)
    if (this.#input) {
      this.#input.value = value
    }
    this.#updateClearButton()
  }

  public get placeholder(): string {
    return this.getAttribute("placeholder") ?? ""
  }

  public set placeholder(value: string) {
    this.setStringAttribute("placeholder", value)
    if (this.#input) {
      this.#input.placeholder = value
    }
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.#input) {
      this.#input.disabled = value
    }
    this.#updateClearButton()
  }

  public get clearable(): boolean {
    return this.hasAttribute("clearable")
  }

  public set clearable(value: boolean) {
    this.setBooleanAttribute("clearable", value)
    this.#updateClearButton()
  }

  public get size(): AutoCompleteSize {
    return this.choiceAttribute("size", autoCompleteSizes, "medium")
  }

  public set size(value: AutoCompleteSize) {
    this.setChoiceAttribute("size", value, autoCompleteSizes)
    this.dataset.size = value
  }

  public clear(): void {
    this.value = ""
    if (this.#input) {
      this.#input.value = ""
      this.#input.focus()
    }
    this.#updateClearButton()
    this.emit<{ value: string }>("m:change", { value: "" }, { bubbles: true, cancelable: false, composed: false })
  }

  public override focus(options?: FocusOptions): void {
    this.#input?.focus(options)
  }

  public override blur(): void {
    this.#input?.blur()
  }

  #setupDOM(): void {
    let input = this.querySelector<HTMLInputElement>("input")
    let field = this.querySelector<HTMLElement>(".m-auto-complete__field")

    if (!input) {
      input = this.ownerDocument.createElement("input")
      input.setAttribute("data-auto-complete-control", "")
      if (this.placeholder) input.placeholder = this.placeholder
      if (this.value) input.value = this.value
      if (this.disabled) input.disabled = true

      if (!field) {
        field = this.ownerDocument.createElement("div")
        field.className = "m-auto-complete__field"
        field.append(input)
        this.prepend(field)
      } else {
        field.append(input)
      }
    } else {
      if (this.hasAttribute("value") && !input.value) {
        input.value = this.value
      } else if (input.value && !this.hasAttribute("value")) {
        this.setAttribute("value", input.value)
      }
      if (this.placeholder && !input.placeholder) {
        input.placeholder = this.placeholder
      }
      if (this.disabled) {
        input.disabled = true
      }
      if (!field && input.parentElement === this) {
        field = this.ownerDocument.createElement("div")
        field.className = "m-auto-complete__field"
        this.insertBefore(field, input)
        field.append(input)
      }
    }

    this.#input = input

    // Handle datalist and options
    const listId = input.getAttribute("list")
    let datalist: HTMLDataListElement | null = listId
      ? (this.ownerDocument.getElementById(listId) as HTMLDataListElement | null)
      : this.querySelector<HTMLDataListElement>("datalist")

    const rawOptions = [...this.querySelectorAll("option, m-option")]
    if (rawOptions.length > 0) {
      if (!datalist) {
        datalist = this.ownerDocument.createElement("datalist")
        datalist.id = listId || `m-ac-list-${Math.random().toString(36).slice(2, 9)}`
        this.append(datalist)
      }
      for (const opt of rawOptions) {
        if (opt.parentElement === datalist) continue
        if (opt instanceof HTMLOptionElement) {
          datalist.append(opt)
        } else {
          const option = this.ownerDocument.createElement("option")
          option.value = opt.getAttribute("value") ?? opt.textContent?.trim() ?? ""
          const label = opt.getAttribute("label")
          if (label) option.label = label
          datalist.append(option)
          opt.remove()
        }
      }
    }

    if (datalist) {
      if (!datalist.id) {
        datalist.id = `m-ac-list-${Math.random().toString(36).slice(2, 9)}`
      }
      if (input.getAttribute("list") !== datalist.id) {
        input.setAttribute("list", datalist.id)
      }
    }

    // Clear button
    if (this.clearable && field) {
      let clearBtn = field.querySelector<HTMLButtonElement>("[data-auto-complete-clear]")
      if (!clearBtn) {
        clearBtn = this.ownerDocument.createElement("button")
        clearBtn.type = "button"
        clearBtn.setAttribute("data-auto-complete-clear", "")
        clearBtn.setAttribute("aria-label", "Clear")
        clearBtn.textContent = "✕"
        field.append(clearBtn)
      }
      this.#clearBtn = clearBtn
      this.#clearHandler = (event: MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()
        this.clear()
      }
      clearBtn.addEventListener("click", this.#clearHandler)
    }

    this.#updateClearButton()

    // Listeners
    this.#inputHandler = () => {
      const nextValue = input.value
      this.setAttribute("value", nextValue)
      this.#updateClearButton()

      const currentListId = input.getAttribute("list")
      const currentList = currentListId
        ? (this.ownerDocument.getElementById(currentListId) as HTMLDataListElement | null)
        : this.querySelector<HTMLDataListElement>("datalist")

      if (currentList) {
        const matches = [...currentList.options].some(opt => opt.value === nextValue)
        if (matches && nextValue.length > 0) {
          this.emit<{ value: string }>("m:select", { value: nextValue }, { bubbles: true, cancelable: false, composed: false })
        }
      }
    }

    this.#changeHandler = () => {
      this.setAttribute("value", input.value)
      this.#updateClearButton()
      this.emit<{ value: string }>("m:change", { value: input.value }, { bubbles: true, cancelable: false, composed: false })
    }

    input.addEventListener("input", this.#inputHandler)
    input.addEventListener("change", this.#changeHandler)
  }

  #teardownDOM(): void {
    if (this.#input) {
      if (this.#inputHandler) this.#input.removeEventListener("input", this.#inputHandler)
      if (this.#changeHandler) this.#input.removeEventListener("change", this.#changeHandler)
    }
    if (this.#clearBtn && this.#clearHandler) {
      this.#clearBtn.removeEventListener("click", this.#clearHandler)
    }
    this.#input = null
    this.#clearBtn = null
    this.#inputHandler = null
    this.#changeHandler = null
    this.#clearHandler = null
  }

  #updateClearButton(): void {
    const clearBtn = this.querySelector<HTMLButtonElement>("[data-auto-complete-clear]")
    if (clearBtn) {
      clearBtn.hidden = !this.clearable || !this.value || this.disabled
    }
  }
}

/**
 * AutoComplete alias component.
 * @region {"name":"content","accepts":["input","datalist","phrasing"],"min":0,"max":null}
 */
export class MAutocomplete extends AutoComplete {
  public static override readonly tag: string = "m-autocomplete"
}

export const MAutoComplete = AutoComplete
export const AutoCompleteAlias = MAutocomplete

export function registerAutoComplete(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  if (registry.get("m-auto-complete") && registry.get("m-autocomplete")) return
  ViewElement.register([AutoComplete, MAutocomplete], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(AutoComplete.tag)) registerAutoComplete()
