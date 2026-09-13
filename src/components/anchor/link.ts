import { ViewElement } from "../../core/index.js"

/**
 * An individual hyperlink item within an Anchor navigation.
 * @region {"name":"content","accepts":["AnchorLink","text","flow content"],"min":0,"max":null}
 */
export class AnchorLink extends ViewElement {
  public static readonly tag = "m-anchor-link"
  public static readonly observedAttributes = ["href", "title"]

  private upgraded = false
  private rendering = false
  private linkElement: HTMLAnchorElement | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "anchor-link"
    this.addEventListener("click", this.handleClick)
    this.render()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    this.render()
  }

  /**
   * Target fragment identifier or URL for this anchor link.
   */
  public get href(): string {
    return this.getAttribute("href") ?? ""
  }
  public set href(value: string | null) {
    this.setStringAttribute("href", value)
  }

  /**
   * Text title or label for this anchor link.
   */
  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  /**
   * Render or synchronize the inner native anchor link element.
   */
  public render(): void {
    if (this.rendering) return
    this.rendering = true
    try {
      let a = this.querySelector<HTMLAnchorElement>(":scope > a.m-anchor-link, :scope > a[data-part='link']")
      if (!a) {
        a = this.querySelector<HTMLAnchorElement>(":scope > a")
      }
      if (!a) {
        a = this.ownerDocument.createElement("a")
        a.className = "m-anchor-link"
        a.dataset.part = "link"
        const nonLinkChildren = [...this.childNodes].filter(node =>
          !(node instanceof Element && node.localName === "m-anchor-link") && node !== a
        )
        if (this.title) {
          a.textContent = this.title
          a.title = this.title
        } else if (nonLinkChildren.length > 0) {
          for (const child of nonLinkChildren) {
            a.append(child)
          }
        }
        const firstNested = this.querySelector<HTMLElement>(":scope > m-anchor-link")
        if (firstNested) {
          this.insertBefore(a, firstNested)
        } else {
          this.prepend(a)
        }
      } else {
        if (this.title && (!a.children.length || !a.textContent?.trim())) {
          a.textContent = this.title
        }
      }
      const href = this.href
      if (href) {
        a.setAttribute("href", href)
      } else {
        a.removeAttribute("href")
      }
      if (this.title) {
        a.title = this.title
      }
      // Delegate geometry to parent m-anchor-link if mock/client rects are on parent
      const parent = this
      const origGetRect = a.getBoundingClientRect.bind(a)
      const origGetRects = a.getClientRects.bind(a)
      a.getBoundingClientRect = () => {
        const parentRects = parent.getClientRects()
        return parentRects.length ? parent.getBoundingClientRect() : origGetRect()
      }
      a.getClientRects = () => {
        const parentRects = parent.getClientRects()
        return parentRects.length ? parentRects : origGetRects()
      }
      this.linkElement = a
    } finally {
      this.rendering = false
    }
  }

  private handleClick = (event: MouseEvent): void => {
    if (event.target === this.linkElement || (this.linkElement && this.linkElement.contains(event.target as Node))) return
    this.linkElement?.click()
  }
}
