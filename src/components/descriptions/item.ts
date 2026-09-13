import { ViewElement } from "../../core/index.js"
import { ownedWrites } from "../popover/position.js"
import { positiveInteger } from "./model.js"

const inert = "template,script,style"

/**
 * An item inside Descriptions defining a label and value/content.
 * @region {"name":"content","accepts":["native flow","text","components"],"min":0,"max":null}
 */
export class DescriptionItem extends ViewElement {
  public static readonly tag = "m-description-item"
  public static readonly observedAttributes = ["label", "span"]

  private generatedLabel: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private initialized = false
  private readonly writes = ownedWrites()

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.writes.restore()
  }

  public attributeChangedCallback(): void {
    if (this.initialized && this.isConnected) this.synchronize()
  }

  /**
   * The item label text. Null removes the label attribute.
   */
  public get label(): string | null {
    return this.getAttribute("label")
  }
  public set label(value: string | null) {
    this.setStringAttribute("label", value)
  }

  /**
   * Column span occupied by this item. Defaults to 1.
   * @min 1
   * @integer
   */
  public get span(): number {
    return positiveInteger(this.numberAttribute("span", 1), "span")
  }
  public set span(value: number) {
    positiveInteger(value, "span")
    this.setAttribute("span", String(value))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    const span = this.span
    this.writes.restore()
    if (this.hasAttribute("span")) {
      this.writes.style(this, "--_m-description-span", String(span))
    }

    const label = this.label
    const authoredLabel = [...this.children].find(
      child => child !== this.generatedLabel && (
        child.localName === "dt" ||
        (child.hasAttribute("data-part") && child.getAttribute("data-part") === "label") ||
        child.classList.contains("m-description-item-label")
      )
    )

    if (authoredLabel) {
      this.generatedLabel?.remove()
      this.generatedLabel = undefined
    } else if (label !== null) {
      if (!this.generatedLabel) {
        this.generatedLabel = this.ownerDocument.createElement("span")
        this.generatedLabel.className = "m-description-item-label"
        this.generatedLabel.dataset.part = "label"
        this.generatedLabel.dataset.mLabel = ""
      }
      if (this.generatedLabel.textContent !== label) {
        this.generatedLabel.textContent = label
      }
      if (this.generatedLabel.parentElement !== this) {
        this.prepend(this.generatedLabel)
      }
    } else {
      this.generatedLabel?.remove()
      this.generatedLabel = undefined
    }

    const authoredContent = [...this.children].find(
      child => child !== this.generatedContent && (
        child.localName === "dd" ||
        (child.hasAttribute("data-part") && child.getAttribute("data-part") === "content") ||
        child.classList.contains("m-description-item-content")
      )
    )

    if (authoredContent) {
      if (this.generatedContent) {
        this.generatedContent.remove()
        this.generatedContent = undefined
      }
    } else if (this.generatedLabel || authoredLabel) {
      const activeLabel = this.generatedLabel ?? authoredLabel
      const loose = [...this.childNodes].filter(node => {
        if (node === this.generatedLabel || node === this.generatedContent) return false
        if (activeLabel && (node === activeLabel || activeLabel.contains(node))) return false
        if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
        return node instanceof Element && !node.matches(inert)
      })
      if (loose.length) {
        if (!this.generatedContent) {
          this.generatedContent = this.ownerDocument.createElement("div")
          this.generatedContent.className = "m-description-item-content"
          this.generatedContent.dataset.part = "content"
          this.append(this.generatedContent)
        }
        this.generatedContent.append(...loose)
      }
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: true, characterData: true, attributes: false })
    }
  }
}

export { DescriptionItem as MDescriptionItem }
