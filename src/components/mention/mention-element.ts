import { ViewElement } from "../../core/index.js"
import { createMention } from "./mention.js"
import type { MentionController, MentionOption, MentionQueryResult } from "./mention.js"

/**
 * Mention component providing suggestions triggered by prefix characters in text input.
 * @region {"name":"content","accepts":["textarea","input","phrasing"],"min":0,"max":null}
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Mention extends ViewElement {
  public static readonly tag: string = "m-mention"
  public static readonly observedAttributes = [
    "value",
    "prefix",
    "disabled",
  ]

  #initialized = false
  #control: HTMLInputElement | HTMLTextAreaElement | null = null
  #panel: HTMLElement | null = null
  #controller: MentionController | undefined
  #staticOptions: readonly MentionOption[] = []
  #inputHandler: (() => void) | null = null
  #selectHandler: ((event: Event) => void) | null = null

  public connectedCallback(): void {
    if (!this.#initialized) {
      this.#initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-mention")
    this.#setupDOM()
  }

  public disconnectedCallback(): void {
    this.#teardownDOM()
  }

  public attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null): void {
    if (!this.#initialized) return
    if (name === "value") {
      if (this.#control && this.#control.value !== (newValue ?? "")) {
        this.#control.value = newValue ?? ""
      }
    } else if (name === "prefix") {
      this.#recreateController()
    } else if (name === "disabled") {
      if (this.#control) {
        this.#control.disabled = this.disabled
      }
      if (this.disabled && this.#controller) {
        this.#controller.close()
      }
    }
  }

  public get value(): string {
    return this.getAttribute("value") ?? ""
  }

  public set value(value: string) {
    this.setStringAttribute("value", value)
    if (this.#control && this.#control.value !== value) {
      this.#control.value = value
    }
  }

  public override get prefix(): string {
    return this.getAttribute("prefix") ?? "@"
  }

  public override set prefix(value: string) {
    this.setStringAttribute("prefix", value)
    this.#recreateController()
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }

  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
    if (this.#control) {
      this.#control.disabled = value
    }
    if (value && this.#controller) {
      this.#controller.close()
    }
  }

  public select(value: string): boolean {
    return this.#controller?.select(value) ?? false
  }

  public query(): Promise<MentionQueryResult> | undefined {
    return this.#controller?.query()
  }

  public setOptions(options: readonly MentionOption[]): void {
    this.#staticOptions = [...options]
    if (this.#controller) {
      this.#controller.setOptions(this.#staticOptions)
    } else {
      this.#recreateController()
    }
  }

  public close(): void {
    this.#controller?.close()
  }

  public refresh(): void {
    this.#controller?.refresh()
  }

  #setupDOM(): void {
    let control = this.querySelector<HTMLInputElement | HTMLTextAreaElement>("textarea, input, [data-input-control]")
    if (!control) {
      control = this.ownerDocument.createElement("textarea")
      control.className = "m-mention__editor"
      this.prepend(control)
    } else if (!control.classList.contains("m-mention__editor") && !control.hasAttribute("data-input-control")) {
      control.classList.add("m-mention__editor")
    }
    this.#control = control

    if (this.hasAttribute("value")) {
      control.value = this.value
    } else if (control.value) {
      this.setAttribute("value", control.value)
    }

    if (this.hasAttribute("disabled")) {
      control.disabled = this.disabled
    } else if (control.disabled) {
      this.disabled = true
    }

    const optionElements = [...this.querySelectorAll<HTMLElement>("option, m-option")]
    if (optionElements.length > 0) {
      this.#staticOptions = optionElements.map(opt => {
        const option: MentionOption = {
          value: opt.getAttribute("value") ?? opt.textContent?.trim() ?? "",
          disabled: opt.hasAttribute("disabled"),
        }
        const label = opt.getAttribute("label") || opt.textContent?.trim()
        if (label) option.label = label
        return option
      })
      for (const opt of optionElements) {
        opt.hidden = true
      }
    }

    let panel = this.querySelector<HTMLElement>("[data-mention-panel], .m-mention__panel, section[aria-label], section[aria-labelledby]")
    if (!panel || panel === control || control.contains(panel)) {
      panel = this.ownerDocument.createElement("section")
      panel.className = "m-mention__panel"
      panel.setAttribute("aria-label", "Mention choices")
      panel.hidden = true
      const list = this.ownerDocument.createElement("ul")
      list.className = "m-mention__options"
      list.setAttribute("data-mention-options", "")
      panel.append(list)
      const status = this.ownerDocument.createElement("p")
      status.setAttribute("data-mention-status", "")
      status.textContent = "No search yet."
      panel.append(status)
      this.append(panel)
    } else {
      let list = panel.querySelector<HTMLElement>("[data-mention-options]")
      if (!list) {
        list = this.ownerDocument.createElement("ul")
        list.className = "m-mention__options"
        list.setAttribute("data-mention-options", "")
        panel.append(list)
      }
      if (!panel.hasAttribute("aria-label") && !panel.hasAttribute("aria-labelledby")) {
        panel.setAttribute("aria-label", "Mention choices")
      }
      panel.hidden = true
    }
    this.#panel = panel

    this.#setupController()

    this.#inputHandler = () => {
      if (this.#control) {
        this.setAttribute("value", this.#control.value)
      }
    }
    this.#control.addEventListener("input", this.#inputHandler)

    this.#selectHandler = (event: Event) => {
      const customEvent = event as CustomEvent<{ option?: MentionOption; prefix?: string }>
      const option = customEvent.detail?.option
      const value = option?.value ?? ""
      this.emit<{ value: string }>("m:select", { value }, { bubbles: true, cancelable: false, composed: false })
    }
    this.#control.addEventListener("m:mention-select", this.#selectHandler)
  }

  #setupController(): void {
    if (!this.#control || !this.#panel) return
    const prefix = this.prefix || "@"
    try {
      this.#controller = createMention(this.#control, {
        panel: this.#panel,
        prefix: [prefix],
        options: this.#staticOptions,
        debounce: 0,
      })
    } catch {
      // Anatomy or initialization failed
    }
  }

  #recreateController(): void {
    if (!this.isConnected || !this.#control || !this.#panel) return
    this.#controller?.disconnect()
    this.#controller = undefined
    this.#setupController()
  }

  #teardownDOM(): void {
    if (this.#control) {
      if (this.#inputHandler) this.#control.removeEventListener("input", this.#inputHandler)
      if (this.#selectHandler) this.#control.removeEventListener("m:mention-select", this.#selectHandler)
    }
    this.#controller?.disconnect()
    this.#controller = undefined
    this.#control = null
    this.#panel = null
    this.#inputHandler = null
    this.#selectHandler = null
  }
}

export const MMention = Mention

export function registerMention(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  if (registry.get(Mention.tag)) return
  ViewElement.register([Mention], registry)
}

if (typeof customElements !== "undefined" && !customElements.get(Mention.tag)) registerMention()
