import { installActions } from "../actions/index.js"
import { ViewElement } from "../core/index.js"
import { bind, createStore, type Binding, MStore } from "../state/index.js"
import { clearTheme, theme } from "../theme/index.js"
export class Theme extends ViewElement {
  public static readonly tag = "m-theme"
  public static get observedAttributes(): string[] { return ["name"] }
  public connectedCallback(): void {
    this.applyTheme()
  }
  public attributeChangedCallback(): void {
    if (this.isConnected) this.applyTheme()
  }
  private applyTheme(): void {
    const name = this.getAttribute("name")
    if (name) theme.apply(name, this)
    else clearTheme(this)
  }
}

export abstract class Semantic extends ViewElement {
  public connectedCallback(): void {
    const role = this.getAttribute("data-role")
    if (role && !this.hasAttribute("role")) this.setAttribute("role", role)
  }
}

export class Field extends ViewElement {
  public static readonly tag = "m-field"
  public static readonly observedAttributes = ["label"]
  private labelElement: HTMLLabelElement | undefined
  private readonly observer = new MutationObserver(() => this.render())
  private static sequence = 0

  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }
  public connectedCallback(): void {
    this.upgradeProperties()
    this.render()
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ["id", "type"] })
  }
  public disconnectedCallback(): void { this.observer.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.render() }

  private render(): void {
    if (!this.label) { this.labelElement?.remove(); return }
    const label = this.labelElement ??= this.ownerDocument.createElement("label")
    label.dataset.mLabel = ""
    if (label.textContent !== this.label) label.textContent = this.label
    const control = [...this.querySelectorAll<HTMLElement>("input:not([type=hidden]),textarea,select")]
      .find(element => element.closest("m-field") === this)
    if (control) {
      const root = this.getRootNode() as Document | ShadowRoot
      if (!control.id) {
        let id: string
        do { id = `m-field-control-${++Field.sequence}` } while (root.getElementById(id))
        control.id = id
      }
      if (label.htmlFor !== control.id) label.htmlFor = control.id
    } else {
      label.removeAttribute("for")
    }
    if (label.parentElement !== this) this.prepend(label)
  }
}

export class App extends ViewElement {
  public static readonly tag = "m-app"
  private currentStore: MStore | undefined
  private disposeActions: (() => void) | undefined
  private binding: Binding | undefined
  private observer: MutationObserver | undefined

  public get store(): MStore { return this.currentStore ??= createStore() }
  public set store(value: MStore) {
    if (!(value instanceof MStore)) throw new TypeError("App store must be an MStore.")
    if (this.binding && value !== this.currentStore) throw new Error("Disconnect App before replacing its store.")
    this.currentStore = value
  }

  public connectedCallback(): void {
    this.upgradeProperties()
    queueMicrotask(() => this.initialize())
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.observer = undefined
    this.disposeActions?.()
    this.disposeActions = undefined
    this.binding?.()
    this.binding = undefined
  }

  private initialize(): void {
    if (!this.isConnected || this.observer !== undefined) return
    const state = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"][data-m-state]',
    )
    if (state?.textContent?.trim()) {
      if (this.currentStore) throw new Error("App accepts either an explicit store or inline state.")
      const parsed: unknown = JSON.parse(state.textContent)
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("m-app state must be a JSON object.")
      }
      this.store = createStore(parsed as Record<string, unknown>)
      state.remove()
    }
    this.binding = bind(this, this.store)
    try {
      this.disposeActions = installActions(this, this.binding)
    } catch (error) {
      this.binding()
      this.binding = undefined
      throw error
    }
    this.observer = new MutationObserver(() => this.binding?.refresh())
    this.observer.observe(this, { childList: true, subtree: true })
  }
}
