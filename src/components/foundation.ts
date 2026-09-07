import { installActions } from "../actions/index.js"
import { MuiElement } from "../core/element.js"
import { bind, createStore, type MuiStore } from "../state/index.js"
import { theme } from "../theme/index.js"
import { MuiLayout } from "./content.js"

export class MuiGrid extends MuiLayout {
  public override connectedCallback(): void {
    super.connectedCallback()
    const columns = this.getAttribute("columns")
    if (columns !== null) this.style.gridTemplateColumns = columns
  }
}

export class MuiTheme extends MuiElement {
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

export class MuiSemantic extends MuiElement {
  public connectedCallback(): void {
    const role = this.getAttribute("data-role")
    if (role) this.setAttribute("role", role)
  }
}

export class MuiHeading extends MuiElement {
  public connectedCallback(): void {
    const level = Math.max(1, Math.min(6, Number(this.getAttribute("level")) || 2))
    this.setAttribute("role", "heading")
    this.setAttribute("aria-level", String(level))
  }
}

export class MuiLink extends MuiElement {
  public connectedCallback(): void {
    if (this.querySelector(":scope > a") !== null) return
    const anchor = this.ownerDocument.createElement("a")
    for (const name of ["href", "target", "rel", "aria-label"]) {
      const value = this.getAttribute(name)
      if (value !== null) anchor.setAttribute(name, value)
    }
    while (this.firstChild !== null) anchor.append(this.firstChild)
    this.append(anchor)
  }
}

export class MuiField extends MuiElement {
  public connectedCallback(): void {
    if (this.querySelector(":scope > [data-mui-label]") !== null) return
    const text = this.getAttribute("label")
    if (!text) return
    const label = this.ownerDocument.createElement("span")
    label.dataset.muiLabel = ""
    label.textContent = text
    const control = this.querySelector("mui-input,mui-textarea,mui-select")
    if (control !== null && !control.hasAttribute("aria-label")) {
      control.setAttribute("aria-label", text)
      control.querySelector("input,textarea,select")?.setAttribute("aria-label", text)
    }
    this.prepend(label)
  }
}

export class MuiApp extends MuiElement {
  public store: MuiStore = createStore()
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
      ':scope > script[type="application/json"][data-mui-state]',
    )
    if (state?.textContent?.trim()) {
      const parsed: unknown = JSON.parse(state.textContent)
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("mui-app state must be a JSON object.")
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
