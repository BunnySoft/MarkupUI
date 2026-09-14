import { installActions } from "../actions/index.js"
import { MElement } from "../core/element.js"
import { bind, createStore, type MStore } from "../state/index.js"
import { theme } from "../theme/index.js"
export class MTheme extends MElement {
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
  }
}

export class MSemantic extends MElement {
  public connectedCallback(): void {
    const role = this.getAttribute("data-role")
    if (role) this.setAttribute("role", role)
  }
}

export class MField extends MElement {
  public connectedCallback(): void {
    if (this.querySelector(":scope > [data-m-label]") !== null) return
    const text = this.getAttribute("label")
    if (!text) return
    const label = this.ownerDocument.createElement("span")
    label.dataset.mLabel = ""
    label.textContent = text
    const control = this.querySelector("m-input,m-textarea,m-select")
    if (control !== null && !control.hasAttribute("aria-label")) {
      control.setAttribute("aria-label", text)
      control.querySelector("input,textarea,select")?.setAttribute("aria-label", text)
    }
    this.prepend(label)
  }
}

export class MApp extends MElement {
  public store: MStore = createStore()
  private disposeActions?: () => void
  private readonly bindingDisposers: Array<() => void> = []
  private observer?: MutationObserver

  public connectedCallback(): void {
    queueMicrotask(() => this.initialize())
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.disposeActions?.()
    this.bindingDisposers.splice(0).forEach((dispose) => dispose())
  }

  private initialize(): void {
    if (!this.isConnected || this.observer !== undefined) return
    const state = this.querySelector<HTMLScriptElement>(
      ':scope > script[type="application/json"][data-m-state]',
    )
    if (state?.textContent?.trim()) {
      const parsed: unknown = JSON.parse(state.textContent)
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("m-app state must be a JSON object.")
      }
      this.store = createStore(parsed as Record<string, unknown>)
      state.remove()
    }
    this.bindingDisposers.push(bind(this, this.store))
    this.disposeActions = installActions(this, this.store)
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) this.bindingDisposers.push(bind(node, this.store))
        }
      }
    })
    this.observer.observe(this, { childList: true, subtree: true })
  }
}
