import { ViewElement } from "../../core/index.js"

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
    if (this.hasAttribute("color")) {
      this.style.color = this.getAttribute("color")!
    } else {
      this.style.removeProperty("color")
    }
    if (this.hasAttribute("weight")) {
      this.style.fontWeight = this.getAttribute("weight")!
    } else {
      this.style.removeProperty("font-weight")
    }
  }
}

/**
 * Accessible form label with target control delegation.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Label extends ViewElement {
  public static readonly tag = "m-label"
  public static get observedAttributes(): string[] {
    return ["for", "required"]
  }

  public connectedCallback(): void {
    this.addEventListener("click", this.handleClick)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
  }

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

  private handleClick = (): void => {
    const targetId = this.htmlFor
    if (targetId) {
      const target = this.ownerDocument.getElementById(targetId)
      if (target) {
        if (typeof (target as HTMLElement).focus === "function") {
          (target as HTMLElement).focus()
        }
        target.click()
      }
    }
  }
}

/**
 * Structural footer landmark.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Footer extends ViewElement {
  public static readonly tag = "m-footer"
}

/**
 * Standalone article container.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Article extends ViewElement {
  public static readonly tag = "m-article"
}

/**
 * Strong importance text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Strong extends ViewElement {
  public static readonly tag = "m-strong"
}

/**
 * Emphasized italic text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Em extends ViewElement {
  public static readonly tag = "m-em"
}

/**
 * Small fine-print text wrapper.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Small extends ViewElement {
  public static readonly tag = "m-small"
}

/**
 * Preformatted monospace block.
 * @region {"name":"content","accepts":["text content"],"min":0,"max":null}
 */
export class Pre extends ViewElement {
  public static readonly tag = "m-pre"
}

/**
 * Native disclosure details container.
 * @region {"name":"content","accepts":["Summary","flow content"],"min":0,"max":null}
 */
export class Details extends ViewElement {
  public static readonly tag = "m-details"
  public static get observedAttributes(): string[] {
    return ["open"]
  }

  public get open(): boolean {
    return this.hasAttribute("open")
  }
  public set open(val: boolean) {
    this.setBooleanAttribute("open", val)
  }
}

/**
 * Disclosure summary trigger.
 * @region {"name":"content","accepts":["phrasing content","text"],"min":0,"max":null}
 */
export class Summary extends ViewElement {
  public static readonly tag = "m-summary"

  public connectedCallback(): void {
    this.addEventListener("click", this.handleClick)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
  }

  private handleClick = (): void => {
    const parent = this.closest<Details>("m-details")
    if (parent) {
      parent.open = !parent.open
    }
  }
}
