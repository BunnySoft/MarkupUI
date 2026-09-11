import { MElement } from "../../core/element.js"

export class MAvatarGroup extends MElement {
  public static get observedAttributes(): string[] { return ["max", "label", "rest-label"] }
  private observer: MutationObserver | undefined
  private overflow: HTMLDetailsElement | undefined

  public connectedCallback(): void {
    if (Object.prototype.hasOwnProperty.call(this, "max")) {
      const value: unknown = Reflect.get(this, "max")
      Reflect.deleteProperty(this, "max")
      Reflect.set(this, "max", value)
    }
    this.synchronize()
    this.observer = new MutationObserver((records) => {
      if (records.some(({ target }) => target === this || target === this.overflow?.lastElementChild)) {
        this.synchronize()
      }
    })
    this.observer.observe(this, { childList: true, subtree: true })
  }
  public disconnectedCallback(): void { this.observer?.disconnect() }
  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }
  public get max(): number {
    const value = this.numberAttribute("max", Infinity)
    return Math.max(0, Math.floor(value))
  }
  public set max(value: number) {
    if (value === Infinity) this.removeAttribute("max")
    else this.setAttribute("max", String(value))
  }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.overflow?.parentElement !== this) this.overflow = undefined
    this.setAttribute("role", "group")
    if (this.hasAttribute("label")) this.setAttribute("aria-label", this.getAttribute("label") ?? "")
    const items = [...this.querySelectorAll<HTMLElement>(
      ":scope > m-avatar, :scope > [data-m-avatar-overflow] > [data-m-avatar-rest] > m-avatar",
    )]
    const visible = items.slice(0, this.max)
    const remaining = items.slice(this.max)

    if (remaining.length) {
      if (!this.overflow) {
        this.overflow = this.ownerDocument.createElement("details")
        this.overflow.dataset.mAvatarOverflow = ""
        const summary = this.ownerDocument.createElement("summary")
        const rest = this.ownerDocument.createElement("span")
        rest.dataset.mAvatarRest = ""
        this.overflow.append(summary, rest)
        this.append(this.overflow)
      }
      const summary = this.overflow.querySelector("summary")
      const rest = this.overflow.querySelector("[data-m-avatar-rest]")
      if (summary) {
        summary.textContent = `+${remaining.length}`
        summary.setAttribute("aria-label", this.getAttribute("rest-label") ?? `${remaining.length} more avatars`)
      }
      rest?.append(...remaining)
      visible.forEach((item) => this.insertBefore(item, this.overflow ?? null))
    } else {
      this.append(...visible)
      this.overflow?.remove()
      this.overflow = undefined
    }
    if (this.isConnected) this.observer?.observe(this, { childList: true, subtree: true })
  }
}
