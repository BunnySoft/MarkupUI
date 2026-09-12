import { ViewElement } from "../../core/index.js"
import { cardSizes, cardSegments } from "./model.js"
import type { CardSize, CardSegment, CardCloseDetail } from "./model.js"

const regionSelector = "m-card-cover,m-card-header,m-card-header-extra,m-card-content,m-card-footer,m-card-action"

/**
 * An application-owned surface with native close intent and light-DOM regions.
 * @region {"name":"cover","element":"m-card-cover","accepts":["display"],"min":0,"max":1}
 * @region {"name":"header","element":"m-card-header","accepts":["heading","content"],"min":0,"max":1}
 * @region {"name":"headerExtra","element":"m-card-header-extra","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"content","element":"m-card-content","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","element":"m-card-footer","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"action","element":"m-card-action","accepts":["actions"],"min":0,"max":1}
 * @states structured
 */
export class Card extends ViewElement {
  public static readonly tag = "m-card"
  public static get observedAttributes(): string[] { return ["title", "closable", "close-label", "close-focusable"] }

  private generatedHeader: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private generatedTitle: HTMLSpanElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "card"
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.closeButton?.removeEventListener("click", this.onClose)
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public override get title(): string { return this.getAttribute("title") ?? "" }
  public override set title(value: string) { this.setStringAttribute("title", value) }
  public get size(): CardSize { return this.choiceAttribute("size", cardSizes, "medium") }
  public set size(value: CardSize) { this.setChoiceAttribute("size", value, cardSizes) }
  public get bordered(): boolean { return this.booleanAttribute("bordered", true) }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value, false) }
  public get closable(): boolean { return this.hasAttribute("closable") }
  public set closable(value: boolean) { this.setBooleanAttribute("closable", value) }
  public get closeFocusable(): boolean { return this.booleanAttribute("close-focusable", true) }
  public set closeFocusable(value: boolean) { this.setBooleanAttribute("close-focusable", value, false) }
  public get closeLabel(): string { return this.getAttribute("close-label")?.trim() || "Close card" }
  public set closeLabel(value: string) { this.setStringAttribute("close-label", value) }
  public get hoverable(): boolean { return this.hasAttribute("hoverable") }
  public set hoverable(value: boolean) { this.setBooleanAttribute("hoverable", value) }
  public get embedded(): boolean { return this.hasAttribute("embedded") }
  public set embedded(value: boolean) { this.setBooleanAttribute("embedded", value) }
  public get segmented(): boolean { return this.hasAttribute("segmented") }
  public set segmented(value: boolean) { this.setBooleanAttribute("segmented", value) }
  public get segmentedContent(): CardSegment | null { return this.choiceAttribute("segmented-content", cardSegments, null) }
  public set segmentedContent(value: CardSegment | null) { this.setNullableChoiceAttribute("segmented-content", value, cardSegments) }
  public get segmentedFooter(): CardSegment | null { return this.choiceAttribute("segmented-footer", cardSegments, null) }
  public set segmentedFooter(value: CardSegment | null) { this.setNullableChoiceAttribute("segmented-footer", value, cardSegments) }
  public get segmentedAction(): CardSegment | null { return this.choiceAttribute("segmented-action", cardSegments, null) }
  public set segmentedAction(value: CardSegment | null) { this.setNullableChoiceAttribute("segmented-action", value, cardSegments) }
  public get contentScrollable(): boolean { return this.hasAttribute("content-scrollable") }
  public set contentScrollable(value: boolean) { this.setBooleanAttribute("content-scrollable", value) }

  private region(name: string, except?: HTMLElement): HTMLElement | undefined {
    return [...this.children].find((element): element is HTMLElement =>
      element instanceof HTMLElement && element !== except && element.localName === `m-card-${name}`)
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.generatedHeader?.parentNode !== this) this.generatedHeader = undefined
    if (this.generatedContent?.parentNode !== this) this.generatedContent = undefined

    let header = this.region("header", this.generatedHeader) ?? this.generatedHeader
    const extras = [...this.children].filter(element => element.localName === "m-card-header-extra")
    if (!header && (this.title || this.closable || extras.length)) {
      header = this.ownerDocument.createElement("div")
      header.dataset.part = "header"
      this.generatedHeader = header
      const cover = this.region("cover")
      if (cover) cover.after(header)
      else this.prepend(header)
    }
    if (header && this.generatedHeader && header !== this.generatedHeader) {
      this.generatedTitle?.remove()
      header.append(...this.generatedHeader.childNodes)
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }
    if (header && header === this.generatedHeader && this.title) {
      if (!this.generatedTitle) {
        this.generatedTitle = this.ownerDocument.createElement("span")
        this.generatedTitle.dataset.part = "title"
      }
      if (this.generatedTitle.textContent !== this.title) this.generatedTitle.textContent = this.title
      if (this.generatedTitle.parentNode !== header) header.prepend(this.generatedTitle)
    } else {
      this.generatedTitle?.remove()
      this.generatedTitle = undefined
    }
    if (header) {
      for (const extra of extras) header.insertBefore(extra, this.closeButton?.parentNode === header ? this.closeButton : null)
    }
    if (this.closable && header) {
      if (!this.closeButton) {
        this.closeButton = this.ownerDocument.createElement("button")
        this.closeButton.type = "button"
        this.closeButton.dataset.part = "close"
        const icon = this.ownerDocument.createElement("span")
        icon.setAttribute("aria-hidden", "true")
        this.closeButton.append(icon)
      }
      this.closeButton.setAttribute("aria-label", this.closeLabel)
      this.closeButton.tabIndex = this.closeFocusable ? 0 : -1
      if (header.lastChild !== this.closeButton) header.append(this.closeButton)
      this.closeButton.addEventListener("click", this.onClose)
    } else {
      this.closeButton?.removeEventListener("click", this.onClose)
      this.closeButton?.remove()
      this.closeButton = undefined
    }
    if (this.generatedHeader && ![...this.generatedHeader.childNodes].some((node) =>
      node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()))) {
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }

    let content = this.region("content", this.generatedContent) ?? this.generatedContent
    if (content && this.generatedContent && content !== this.generatedContent) {
      content.prepend(...this.generatedContent.childNodes)
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    const loose = [...this.childNodes].filter((node) =>
      node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && node !== this.generatedHeader && node !== this.generatedContent
          && !node.matches(`${regionSelector},template,script,style`))
    if (loose.length) {
      if (!content) {
        content = this.ownerDocument.createElement("div")
        content.dataset.part = "content"
        this.generatedContent = content
        this.insertBefore(content, this.region("footer") ?? this.region("action") ?? null)
      }
      content.append(...loose)
    }
    if (this.generatedContent && !this.generatedContent.hasChildNodes()) {
      this.generatedContent.remove()
      this.generatedContent = undefined
    }
    this.dataset.state = [...this.children].some(element =>
      element === this.generatedHeader || element === this.generatedContent || element.matches(regionSelector)) ? "structured" : ""
    if (this.isConnected) {
      this.observer?.observe(this, {
        childList: true, subtree: true, characterData: true,
      })
    }
  }

  private readonly onClose = (event: MouseEvent): void => {
    if (!this.closable || !this.isConnected || this.closeButton?.matches(":disabled")) return
    this.emit<CardCloseDetail>("m:close", { originalEvent: event }, { cancelable: true })
  }
}
