import { ViewElement } from "../../core/index.js"

/**
 * Inline or block code presentation element.
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 */
export class Code extends ViewElement {
  public static readonly tag = "m-code"
  public static get observedAttributes(): string[] {
    return ["language", "word-wrap", "show-line-numbers"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mCode = ""
    this.classList.add("m-code")
    this.synchronize()
  }

  public disconnectedCallback(): void {
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) {
      this.synchronize()
    }
  }

  /**
   * Code language identifier for syntax highlighting or presentation metadata.
   */
  public get language(): string | null {
    return this.getAttribute("language")
  }
  public set language(value: string | null) {
    this.setStringAttribute("language", value)
  }

  /**
   * Whether to soft-wrap long lines.
   */
  public get wordWrap(): boolean {
    return this.booleanAttribute("word-wrap", false)
  }
  public set wordWrap(value: boolean) {
    this.setBooleanAttribute("word-wrap", value)
  }

  /**
   * Whether to display line numbers.
   */
  public get showLineNumbers(): boolean {
    return this.booleanAttribute("show-line-numbers", false)
  }
  public set showLineNumbers(value: boolean) {
    this.setBooleanAttribute("show-line-numbers", value)
  }

  private synchronize(): void {
    let wrap = false
    let lines = false
    try {
      wrap = this.wordWrap
    } catch {
      // Retain authored attributes without throwing in lifecycle
    }
    try {
      lines = this.showLineNumbers
    } catch {
      // Retain authored attributes without throwing in lifecycle
    }
    const lang = this.language

    this.toggleAttribute("data-word-wrap", wrap)
    this.toggleAttribute("data-line-numbers", lines)
    if (lang !== null) {
      this.setAttribute("data-language", lang)
    } else {
      this.removeAttribute("data-language")
    }

    const pre = this.querySelector<HTMLPreElement>("pre.m-code-block")
    if (pre) {
      pre.toggleAttribute("data-word-wrap", wrap)
      pre.toggleAttribute("data-line-numbers", lines)
      if (lang !== null) {
        pre.setAttribute("data-language", lang)
      } else {
        pre.removeAttribute("data-language")
      }
    }
  }
}

export const MCode = Code
