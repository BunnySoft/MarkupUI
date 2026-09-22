import { ViewElement } from "../../core/index.js"

/** Fixed native shell for portable primitives; authored nodes remain live children. */
export abstract class NativeContent<T extends HTMLElement> extends ViewElement {
  public static readonly observedAttributes: readonly string[] = ["aria-label", "aria-labelledby", "aria-describedby"]
  private readonly content: T
  protected readonly observer = new MutationObserver(() => this.refresh())

  protected constructor(tag: string) {
    super()
    this.content = this.ownerDocument.createElement(tag) as T
    this.native.dataset.part = "content"
  }

  public get native(): T { return this.content }
  public connectedCallback(): void {
    this.upgradeProperties()
    this.refresh()
  }

  public disconnectedCallback(): void { this.observer.disconnect() }
  public attributeChangedCallback(): void {
    for (const name of NativeContent.observedAttributes) {
      const value = this.getAttribute(name)
      if (value === null) this.native.removeAttribute(name)
      else this.native.setAttribute(name, value)
    }
  }

  public refresh(): void {
    this.observer.disconnect()
    const active = this.ownerDocument.activeElement as HTMLElement | null
    try {
      if (this.native.parentNode !== this) {
        this.native.replaceChildren()
        const nodes = [...this.childNodes]
        this.append(this.native)
        this.native.append(...nodes)
      } else {
        const before = [...this.childNodes].slice(0, [...this.childNodes].indexOf(this.native))
        const first = this.native.firstChild
        for (const node of before) this.native.insertBefore(node, first)
        for (const node of [...this.childNodes]) if (node !== this.native) this.native.append(node)
      }
      this.render()
      if (active && this.contains(active) && this.ownerDocument.activeElement !== active) active.focus({ preventScroll: true })
    } finally {
      if (this.isConnected) this.observer.observe(this, { childList: true, subtree: true })
    }
  }

  protected render(): void {}
}
