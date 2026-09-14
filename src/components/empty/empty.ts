import { ViewElement } from "../../core/index.js"
import { emptySizes } from "./model.js"
import type { EmptySize } from "./model.js"

export { emptySizes } from "./model.js"
export type { EmptySize } from "./model.js"

const inert = "template,script,style"

function illustration(document: Document): SVGSVGElement {
  const namespace = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(namespace, "svg")
  svg.setAttribute("viewBox", "0 0 48 48")
  svg.setAttribute("aria-hidden", "true")
  svg.setAttribute("focusable", "false")
  svg.setAttribute("fill", "none")
  svg.setAttribute("stroke", "currentColor")
  svg.setAttribute("stroke-width", "3")
  svg.setAttribute("stroke-linejoin", "round")
  for (const [index, d] of [
    "M23 10H10a4 4 0 0 0-4 4v26a4 4 0 0 0 4 4h25a4 4 0 0 0 4-4V25M6 28h11a6 6 0 0 0 12 0h10",
    "M34 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3 5.5 3 3 3-3 1.5 1.5-3 3 3 3-1.5 1.5-3-3-3 3-1.5-1.5 3-3-3-3Z",
  ].entries()) {
    const path = document.createElementNS(namespace, "path")
    path.setAttribute("d", d)
    if (index === 1) {
      path.setAttribute("fill", "currentColor")
      path.setAttribute("fill-rule", "evenodd")
      path.setAttribute("stroke", "none")
    }
    svg.append(path)
  }
  return svg
}

/**
 * An empty-state indicator with readable fallback text, decorative illustration, and adopted regions.
 * @region {"name":"icon","accepts":["icon"],"min":0,"max":1}
 * @region {"name":"description","accepts":["text","phrasing"],"min":0,"max":1}
 * @region {"name":"extra","accepts":["actions","controls"],"min":0,"max":1}
 */
export class Empty extends ViewElement {
  public static readonly tag = "m-empty"
  public static get observedAttributes(): string[] {
    return ["description", "show-description", "show-icon", "size", "icon"]
  }

  private generatedDescription: HTMLElement | undefined
  private fallbackText: Text | undefined
  private generatedIcon: HTMLSpanElement | undefined
  private renderedGlyph: string | null | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mEmpty = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void { if (this.isConnected) this.synchronize() }

  public get description(): string { return this.getAttribute("description") ?? "No Data" }
  public set description(value: string | null | undefined) {
    this.setStringAttribute("description", value ?? null)
  }
  public get showDescription(): boolean { return this.booleanAttribute("show-description", true) }
  public set showDescription(value: boolean) { this.setBooleanAttribute("show-description", value, false) }
  public get showIcon(): boolean { return this.booleanAttribute("show-icon", true) }
  public set showIcon(value: boolean) { this.setBooleanAttribute("show-icon", value, false) }
  public get size(): EmptySize { return this.choiceAttribute("size", emptySizes, "medium") }
  public set size(value: EmptySize) { this.setChoiceAttribute("size", value, emptySizes) }
  public get icon(): string { return this.getAttribute("icon") ?? "" }
  public set icon(value: string | null | undefined) {
    this.setStringAttribute("icon", value ?? null)
  }

  private region(name: string, except?: Element): Element | undefined {
    return [...this.children].find((node) =>
      node !== except && node.hasAttribute(`data-m-empty-${name}`) && !node.matches(inert))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.generatedDescription?.parentNode !== this) {
      this.generatedDescription = undefined
      this.fallbackText = undefined
    }
    if (this.fallbackText?.parentNode !== this.generatedDescription) this.fallbackText = undefined
    if (this.generatedIcon?.parentNode !== this) {
      this.generatedIcon = undefined
      this.renderedGlyph = undefined
    }

    let icon = this.region("icon", this.generatedIcon)
    if (icon) {
      this.generatedIcon?.remove()
      this.generatedIcon = undefined
      this.renderedGlyph = undefined
    } else if (this.showIcon || this.generatedIcon) {
      if (!this.generatedIcon) {
        this.generatedIcon = this.ownerDocument.createElement("span")
        this.generatedIcon.dataset.mEmptyIcon = ""
        this.generatedIcon.setAttribute("aria-hidden", "true")
        this.prepend(this.generatedIcon)
      }
      const glyph = this.getAttribute("icon")
      if (glyph !== this.renderedGlyph) {
        this.generatedIcon.replaceChildren(glyph === null ? illustration(this.ownerDocument) : this.ownerDocument.createTextNode(glyph))
        this.renderedGlyph = glyph
      }
      icon = this.generatedIcon
    }

    let description = this.region("description", this.generatedDescription) ?? this.generatedDescription
    if (description && this.generatedDescription && description !== this.generatedDescription) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
      description.prepend(...this.generatedDescription.childNodes)
      this.generatedDescription.remove()
      this.generatedDescription = undefined
    }
    const extra = this.region("extra")
    const loose = [...this.childNodes].filter((node) => {
      if (node === icon || node === description || node === extra) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(inert)
    })
    if (!description) {
      this.generatedDescription = this.ownerDocument.createElement("div")
      this.generatedDescription.dataset.mEmptyDescription = ""
      description = this.generatedDescription
      this.insertBefore(description, extra ?? null)
    }
    if (loose.length) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
      description.append(...loose)
    }
    const authored = description !== this.generatedDescription || [...description.childNodes].some((node) => node !== this.fallbackText)
    if (authored) {
      this.fallbackText?.remove()
      this.fallbackText = undefined
    } else if (!this.fallbackText) {
      this.fallbackText = this.ownerDocument.createTextNode(this.description)
      description.append(this.fallbackText)
    } else if (this.fallbackText.data !== this.description) {
      this.fallbackText.data = this.description
    }

    if (extra && description.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_PRECEDING) this.insertBefore(description, extra)
    if (icon && icon.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_PRECEDING) this.insertBefore(icon, description)
    if (this.isConnected) this.observer?.observe(this, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ["data-m-empty-description", "data-m-empty-icon", "data-m-empty-extra"],
    })
  }
}

export { Empty as MEmpty }
