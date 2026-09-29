import { ViewElement } from "../../core/index.js"

/**
 * A store-bound item region. Select state explicitly and bind the containing root.
 * @region {"name":"item","accepts":["ListItem"],"min":1,"max":1}
 */
export class ListTemplate extends ViewElement {
  public static readonly tag = "m-list-template"
  public static readonly observedAttributes = ["label"]
  private source: HTMLTemplateElement | undefined
  private container: HTMLUListElement | undefined
  private upgraded = false
  private prepared = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.observer ??= new MutationObserver(() => this.capture())
    this.observer.observe(this, { childList: true })
    // Defer until parser-authored children are available. Capture does not bind a store.
    queueMicrotask(() => { if (this.isConnected) this.capture() })
  }

  public disconnectedCallback(): void { this.observer?.disconnect() }

  public attributeChangedCallback(): void {
    if (this.container) this.syncLabel()
  }

  /** Accessible name of the generated list, not of the inert source. */
  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }

  /** Opt into focusing the list when an active item is removed. Default: require a binding policy. */
  public get focusOnRemove(): boolean { return this.hasAttribute("focus-on-remove") }
  public set focusOnRemove(value: boolean) { this.setBooleanAttribute("focus-on-remove", value) }

  /** Web interoperability: the stable native list, outside the inert source. */
  public get itemsContainer(): HTMLUListElement {
    this.capture()
    return this.container!
  }

  /** Web interoperability: renderer-owned source; references leave its li empty until binding. */
  public get native(): HTMLTemplateElement {
    this.capture()
    if (this.parentElement?.localName !== "m-list"
      || [...this.parentElement.children].some(child => child !== this
        && child.matches("m-list-template,m-list-item,ul,ol,[data-part=items],.m-list-items"))) {
      throw new TypeError("ListTemplate requires one exclusive item region directly inside List.")
    }
    if (this.container!.parentNode !== this || this.source!.parentNode !== this.container
      || this.children.length !== 1) throw new TypeError("ListTemplate renderer ownership changed.")
    const row = this.source!.content.firstElementChild
    if (this.source!.content.children.length !== 1 || row?.localName !== "li"
      || (this.hasAttribute("data-template") ? row.children.length !== 0
        : row.children.length !== 1 || row.firstElementChild?.localName !== "m-list-item")
      || [...row.childNodes].some(node => node.nodeType !== Node.ELEMENT_NODE
        && node.nodeType !== Node.COMMENT_NODE && node.textContent?.trim())) {
      throw new TypeError("ListTemplate requires exactly one ListItem root.")
    }
    for (const name of ["data-each", "data-each-key"]) {
      const value = this.getAttribute(name)
      if (value === null) this.source!.removeAttribute(name)
      else if (this.source!.getAttribute(name) !== value) this.source!.setAttribute(name, value)
    }
    this.prepared = true
    this.observer?.disconnect()
    return this.source!
  }

  /** Focus the semantic list without adding it to sequential keyboard navigation. */
  public override focus(options?: FocusOptions): void { this.itemsContainer.focus(options) }
  public override blur(): void { this.container?.blur() }

  private capture(): void {
    if (this.source) {
      if (!this.prepared && this.container!.parentNode === this && this.source.parentNode === this.container) {
        const row = this.source.content.firstElementChild
        const incoming = [...this.childNodes].filter(node => node !== this.container)
        if (row && incoming.length) row.append(...incoming)
      }
      return
    }
    // An enclosing inert source can clone already captured, but never bound, chrome.
    const adopted = this.querySelector<HTMLUListElement>(":scope > ul[data-list-template]")
    const source = adopted?.querySelector<HTMLTemplateElement>(":scope > template")
    if (adopted && source && adopted.children.length === 1 && this.children.length === 1) {
      this.container = adopted
      this.source = source
    } else {
      const container = this.ownerDocument.createElement("ul")
      container.dataset.listTemplate = ""
      container.setAttribute("role", "list")
      container.tabIndex = -1
      const template = this.ownerDocument.createElement("template")
      const row = this.ownerDocument.createElement("li")
      row.dataset.listTemplateItem = ""
      row.append(...this.childNodes)
      template.content.append(row)
      container.append(template)
      this.source = template
      this.container = container
      this.append(container)
    }
    this.syncLabel()
  }

  private syncLabel(): void {
    if (this.label === null) this.container!.removeAttribute("aria-label")
    else if (this.container!.getAttribute("aria-label") !== this.label) this.container!.setAttribute("aria-label", this.label)
  }
}
