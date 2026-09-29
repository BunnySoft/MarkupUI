import { ViewElement } from "../../core/index.js"
import { NativeContent } from "./native-content.js"

/**
 * Inline text phrasing container.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Span extends ViewElement {
  public static readonly tag = "m-span"
  public static get observedAttributes(): string[] {
    return ["color", "weight"]
  }

  public connectedCallback(): void {
    this.upgradeProperties()
    this.syncStyles()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.syncStyles()
  }

  public get color(): string | null {
    return this.getAttribute("color")
  }
  public set color(val: string | null) {
    this.setStringAttribute("color", val)
  }

  public get weight(): string | null {
    return this.getAttribute("weight")
  }
  public set weight(val: string | null) {
    this.setStringAttribute("weight", val)
  }

  private syncStyles(): void {
    this.style.color = this.color ?? ""
    this.style.fontWeight = this.weight ?? ""
  }
}

/**
 * Portable label backed by a native label. The target may be a field or its native owner.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Label extends NativeContent<HTMLLabelElement> {
  public static readonly tag = "m-label"
  public static override readonly observedAttributes = [...NativeContent.observedAttributes, "for", "required"]
  private readonly targets = new MutationObserver(() => this.resolveTarget())
  private static sequence = 0

  public constructor() { super("label") }

  public override connectedCallback(): void {
    super.connectedCallback()
    this.targets.observe(this.getRootNode(), { childList: true, subtree: true, attributes: true, attributeFilter: ["id"] })
    queueMicrotask(() => { if (this.isConnected) this.resolveTarget() })
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.targets.disconnect()
  }

  public override attributeChangedCallback(): void { super.attributeChangedCallback(); if (this.isConnected) this.resolveTarget() }
  public get htmlFor(): string | null {
    return this.getAttribute("for")
  }
  public set htmlFor(val: string | null) {
    this.setStringAttribute("for", val)
  }

  public get required(): boolean {
    return this.hasAttribute("required")
  }
  public set required(val: boolean) {
    this.setBooleanAttribute("required", val)
  }

  /** Web semantic owner; null until an eligible target exists. */
  public get control(): HTMLElement | null { return this.native.control }
  public override click(): void { this.native.click() }
  public override focus(options?: FocusOptions): void { this.control?.focus(options) }
  protected override render(): void { this.resolveTarget() }

  private resolveTarget(): void {
    let id = this.htmlFor
    const root = this.getRootNode() as Document | ShadowRoot
    const target = id && root.getElementById?.(id)
    if (target instanceof ViewElement && "native" in target) {
      const control = target.native
      if (control instanceof HTMLElement && control.matches("input:not([type=hidden]),select,textarea,button,meter,output,progress")) {
        if (!control.id) {
          do { id = `m-label-control-${++Label.sequence}` } while (root.getElementById(id))
          control.id = id
        }
        id = control.id
      }
    }
    if (id === null) this.native.removeAttribute("for")
    else if (this.native.htmlFor !== id) this.native.htmlFor = id
  }
}

/**
 * Structural footer landmark.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Footer extends NativeContent<HTMLElement> {
  public static readonly tag = "m-footer"
  public constructor() { super("footer") }
}

/**
 * Standalone article container.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Article extends NativeContent<HTMLElement> {
  public static readonly tag = "m-article"
  public constructor() { super("article") }
}

/**
 * Strong importance text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Strong extends NativeContent<HTMLElement> {
  public static readonly tag = "m-strong"
  public constructor() { super("strong") }
}

/**
 * Emphasized italic text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Em extends NativeContent<HTMLElement> {
  public static readonly tag = "m-em"
  public constructor() { super("em") }
}

/**
 * Small fine-print text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Small extends NativeContent<HTMLElement> {
  public static readonly tag = "m-small"
  public constructor() { super("small") }
}

/**
 * Preformatted monospace block.
 * @region {"name":"content","accepts":["text content"],"min":0,"max":null}
 */
export class Pre extends NativeContent<HTMLPreElement> {
  public static readonly tag = "m-pre"
  public constructor() { super("pre") }
}

/**
 * Native disclosure details container.
 * @region {"name":"content","accepts":["Summary","flow content"],"min":0,"max":null}
 */
export class Details extends NativeContent<HTMLDetailsElement> {
  public static readonly tag = "m-details"
  public static override readonly observedAttributes = [...NativeContent.observedAttributes, "open"]
  private summary = this.ownerDocument.createElement("summary")

  public constructor() { super("details") }
  public override connectedCallback(): void {
    super.connectedCallback()
    this.native.addEventListener("toggle", this.onToggle)
  }
  public override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.native.removeEventListener("toggle", this.onToggle)
    this.toggleAttribute("open", this.native.open)
  }
  public override attributeChangedCallback(name?: string): void {
    super.attributeChangedCallback()
    if (name === "open") this.native.open = this.hasAttribute("open")
  }

  public get open(): boolean {
    return this.native.open
  }
  public set open(val: boolean) {
    this.setBooleanAttribute("open", val)
    this.native.open = val
  }

  protected override render(): void {
    const summaries = [...this.native.querySelectorAll<Summary>("m-summary")].filter(node => node.closest("m-details") === this)
    if (summaries.length > 1) throw new TypeError("Details accepts at most one Summary.")
    const summary = summaries[0]
    if (summary) {
      if (summary.parentElement?.localName === "summary" && summary.parentElement.parentElement === this.native) {
        this.summary = summary.parentElement
      }
      if (summary.parentElement !== this.native && summary.parentElement !== this.summary) throw new TypeError("Summary must belong directly to Details.")
      if (summary.parentElement !== this.summary) this.summary.replaceChildren(summary)
      if (this.native.firstChild !== this.summary) this.native.prepend(this.summary)
    } else this.summary.remove()
  }

  private readonly onToggle = (): void => {
    this.toggleAttribute("open", this.native.open)
    this.emit("m:toggle", { open: this.native.open })
  }
}

/**
 * Disclosure summary trigger.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Summary extends ViewElement {
  public static readonly tag = "m-summary"
  public get native(): HTMLElement | null { return this.parentElement?.localName === "summary" ? this.parentElement : null }
  public override click(): void { this.native?.click() }
  public override focus(options?: FocusOptions): void { this.native?.focus(options) }
}
