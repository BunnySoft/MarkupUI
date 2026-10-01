import { ViewElement } from "../../core/index.js"
import { createMention, prepareMentionConfiguration, writeMentionField } from "./mention.js"
import type { MentionConfiguration, MentionControl, MentionController, MentionOption, MentionQueryResult } from "./mention.js"

/**
 * Prefix suggestions sharing one native text owner with createMention.
 * @region {"name":"content","accepts":["textarea","input","phrasing"],"min":0,"max":null}
 * @event {"name":"Input","web":"input","bubbles":true,"cancelable":false,"composed":true}
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string","option":"Readonly<MentionOption>","prefix":"string"}}
 * @event {"name":"Search","web":"m:mention-search","bubbles":true,"cancelable":false,"composed":false,"detail":{"prefix":"string","query":"string","start":"number","end":"number"}}
 * @event {"name":"Results","web":"m:mention-results","bubbles":true,"cancelable":false,"composed":false,"detail":{"context":"MentionContext","options":"readonly Readonly<MentionOption>[]","result":"MentionQueryResult"}}
 * @event {"name":"Error","web":"m:mention-error","bubbles":true,"cancelable":false,"composed":false,"detail":{"error":"unknown","context":"MentionContext | null"}}
 * @event {"name":"Visibility","web":"m:mention-visibility","bubbles":true,"cancelable":false,"composed":false,"detail":{"shown":"boolean"}}
 * @event {"name":"Reject","web":"m:mention-reject","bubbles":true,"cancelable":false,"composed":false,"detail":{"reason":"string","option":"Readonly<MentionOption>","prefix":"string"}}
 */
export class Mention extends ViewElement {
  public static readonly tag: string = "m-mention"
  public static readonly observedAttributes = ["value", "prefix", "disabled", "readonly"]

  #initialized = false
  #mapped = false
  #control: MentionControl | null = null
  #panel: HTMLElement | null = null
  #controller: MentionController | undefined
  #configuration = prepareMentionConfiguration({})
  #configured = false
  #hiddenOptions = new Map<HTMLElement, string | null>()

  public connectedCallback(): void {
    this.classList.add("m-mention")
    this.#setupDOM()
    if (!this.#initialized) {
      this.#initialized = true
      this.upgradeProperties()
    }
    if (!this.#controller?.connected) this.#controller = createMention(this.native, { panel: this.#panel!, ...this.#configuration })
  }

  public disconnectedCallback(): void {
    if (this.#controller) this.#configuration = prepareMentionConfiguration(this.#controller.configuration)
    this.#controller?.disconnect()
    this.#controller = undefined
    for (const [option, before] of this.#hiddenOptions) {
      if (option.getAttribute("hidden") !== "") continue
      if (before === null) option.removeAttribute("hidden")
      else option.setAttribute("hidden", before)
    }
    this.#hiddenOptions.clear()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.#mapped || oldValue === newValue) return
    if (name === "value") this.defaultValue = newValue ?? ""
    else if (name === "prefix") this.prefix = newValue ?? "@"
    else if (name === "disabled") this.disabled = newValue !== null
    else if (name === "readonly") this.readOnly = newValue !== null
  }

  /** The actual Web editor owns labels, value, caret, validity and form association. */
  public get native(): MentionControl {
    const controls = [...this.querySelectorAll<MentionControl>("input, textarea")].filter(control => control.closest("m-mention") === this)
    if (controls.length > 1) throw new TypeError("Mention needs exactly one native text editor.")
    const control = controls[0] ?? this.#control
    if (control) {
      if (this.#control && control !== this.#control) throw new TypeError("Do not replace the Mention editor implicitly.")
      if (control.localName === "input" && !["text", "search"].includes((control as HTMLInputElement).type)) throw new TypeError("Mention supports text/search inputs and textareas.")
      this.#control = control
    } else {
      this.#control = this.ownerDocument.createElement("textarea")
      this.#control.className = "m-mention__editor"
      this.prepend(this.#control)
    }
    return this.#control
  }

  /** Live native text; "" is empty. Silent property writes never rewrite the value/default attribute. */
  public get value(): string { return this.native.value }
  public set value(value: string) { this.#write("value", value) }

  /** Native reset text. The host value attribute maps here, preserving the native dirty-value rule. */
  public get defaultValue(): string { return this.native.defaultValue }
  public set defaultValue(value: string) { this.#write("defaultValue", value) }

  /** Primary prefix. Assignment explicitly replaces the prefix set; configure() supports multiple prefixes. */
  public override get prefix(): string { return (this.configuration.prefix as readonly string[])[0]! }
  public override set prefix(value: string) {
    if (typeof value !== "string") throw new TypeError("Mention prefix needs one nonwhitespace BMP character.")
    this.configure({ ...this.configuration, prefix: value })
  }

  /** Native explicit disabled state; disabled fieldsets also prevent query and selection. */
  public get disabled(): boolean { return this.native.disabled }
  public set disabled(value: boolean) { this.#write("disabled", value) }

  public get readOnly(): boolean { return this.native.readOnly }
  public set readOnly(value: boolean) { this.#write("readOnly", value) }

  public get form(): HTMLFormElement | null { return this.native.form }
  public get connected(): boolean { return this.#controller?.connected ?? false }
  public get context() { return this.#controller?.context ?? null }
  public get error(): unknown { return this.#controller?.error ?? null }

  /** Immutable effective configuration, including native-Web loader/filter callbacks. */
  public get configuration(): Readonly<MentionConfiguration> { return this.#controller?.configuration ?? this.#configuration }

  /** Explicit atomic configuration replacement; retains editor, defaults, text, caret and IME state. */
  public configure(configuration: MentionConfiguration): void {
    if (this.#controller) {
      this.#controller.configure(configuration)
      this.#configuration = prepareMentionConfiguration(this.#controller.configuration)
    } else this.#configuration = prepareMentionConfiguration(configuration)
    this.#configured = true
  }

  public setOptions(options: readonly MentionOption[]): void {
    if (this.configuration.load) throw new TypeError("Use configure() to explicitly switch from a loader to static options.")
    this.configure({ ...this.configuration, options })
  }

  public select(value: string): boolean {
    if (typeof value !== "string") throw new TypeError("Mention selection needs a string value.")
    return this.#controller?.select(value) ?? false
  }

  public query(): Promise<MentionQueryResult> {
    if (!this.#controller) return Promise.reject(new Error("Mention is disconnected."))
    return this.#controller.query()
  }

  public close(): void { this.#controller?.close() }
  public refresh(): void { this.#controller?.refresh() }

  #write(name: "value" | "defaultValue" | "disabled" | "readOnly", value: string | boolean): void {
    if (this.#controller) {
      if (name === "value" || name === "defaultValue") this.#controller[name] = value as string
      else this.#controller[name] = value as boolean
    } else writeMentionField(this.native, name, value)
  }

  #setupDOM(): void {
    const control = this.native
    if (!control.hasAttribute("data-input-control")) control.classList.add("m-mention__editor")
    if (!this.#mapped) {
      if (this.hasAttribute("value")) writeMentionField(control, "defaultValue", this.getAttribute("value")!)
      if (this.hasAttribute("disabled")) writeMentionField(control, "disabled", true)
      if (this.hasAttribute("readonly")) writeMentionField(control, "readOnly", true)
      if (this.hasAttribute("prefix") && !this.#configured) this.#configuration = prepareMentionConfiguration({ ...this.#configuration, prefix: this.getAttribute("prefix")! })
      if (!this.#configured) {
        const options = [...this.querySelectorAll<HTMLElement>("option, m-option")].filter(option => option.closest("m-mention") === this)
        if (options.length) this.#configuration = prepareMentionConfiguration({
          ...this.#configuration,
          options: options.map(option => ({
            value: option.getAttribute("value") ?? option.textContent?.trim() ?? "",
            label: option.getAttribute("label") ?? option.textContent?.trim() ?? "",
            disabled: option.hasAttribute("disabled"),
          })),
        })
      }
      this.#mapped = true
    }
    for (const option of [...this.querySelectorAll<HTMLElement>("option, m-option")].filter(option => option.closest("m-mention") === this)) {
      this.#hiddenOptions.set(option, option.getAttribute("hidden"))
      option.hidden = true
    }
    const panels = [...this.querySelectorAll<HTMLElement>("[data-mention-panel], .m-mention__panel, section[aria-label], section[aria-labelledby]")].filter(panel => panel.closest("m-mention") === this)
    if (panels.length > 1) throw new TypeError("Mention supports one adjacent choices panel.")
    if (panels[0]) {
      if (this.#panel && panels[0] !== this.#panel) throw new TypeError("Do not replace the Mention panel implicitly.")
      this.#panel = panels[0]
    } else if (!this.#panel) {
      const panel = this.ownerDocument.createElement("section")
      panel.className = "m-mention__panel"
      panel.setAttribute("aria-label", "Mention choices")
      panel.hidden = true
      const list = this.ownerDocument.createElement("ul")
      list.className = "m-mention__options"
      list.setAttribute("data-mention-options", "")
      const status = this.ownerDocument.createElement("p")
      status.setAttribute("data-mention-status", "")
      status.textContent = "No search yet."
      panel.append(list, status)
      this.append(panel)
      this.#panel = panel
    }
  }
}

export function registerMention(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Mention], registry)
}

if (typeof customElements !== "undefined") registerMention()
