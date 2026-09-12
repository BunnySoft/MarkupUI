import { ViewElement } from "../../core/index.js"

/** @region {"name":"items","accepts":["Avatar"],"min":0,"max":null,"element":"m-avatar"} */
export class AvatarGroup extends ViewElement {
  public static readonly tag = "m-avatar-group"
  public static get observedAttributes(): string[] { return ["max", "vertical", "label", "rest-label"] }
  private observer: MutationObserver | undefined
  private overflow: HTMLDetailsElement | undefined
  private managedLabel: string | null = null

  public connectedCallback(): void {
    this.upgradeProperties()
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
  /**
   * @min 0
   * @integer
   */
  public get max(): number | null {
    const value = this.numberAttribute("max", null)
    if (value !== null && (!Number.isSafeInteger(value) || value < 0)) throw new RangeError("Invalid max.")
    return value
  }
  public set max(value: number | null) {
    if (value !== null && (!Number.isSafeInteger(value) || value < 0)) throw new RangeError("Invalid max.")
    if (value === null) this.removeAttribute("max")
    else this.setAttribute("max", String(value))
  }

  public get vertical(): boolean { return this.hasAttribute("vertical") }
  public set vertical(value: boolean) { this.setBooleanAttribute("vertical", value) }

  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }

  public get restLabel(): string | null { return this.getAttribute("rest-label") }
  public set restLabel(value: string | null) { this.setStringAttribute("rest-label", value) }

  private synchronize(): void {
    this.observer?.disconnect()
    if (this.overflow?.parentElement !== this) this.overflow = undefined
    this.setAttribute("role", "group")
    if (!this.hasAttribute("aria-label") || this.getAttribute("aria-label") === this.managedLabel) {
      if (this.label === null) this.removeAttribute("aria-label")
      else this.setAttribute("aria-label", this.label)
      this.managedLabel = this.label
    }
    const items = [...this.querySelectorAll<HTMLElement>(
      ":scope > m-avatar, :scope > [data-part=overflow] > [data-part=rest] > m-avatar",
    )]
    const max = this.max ?? items.length
    const visible = items.slice(0, max)
    const remaining = items.slice(max)

    if (remaining.length) {
      if (!this.overflow) {
        this.overflow = this.ownerDocument.createElement("details")
        this.overflow.dataset.part = "overflow"
        const summary = this.ownerDocument.createElement("summary")
        const rest = this.ownerDocument.createElement("span")
        rest.dataset.part = "rest"
        this.overflow.append(summary, rest)
        this.append(this.overflow)
      }
      const summary = this.overflow.querySelector("summary")
      const rest = this.overflow.querySelector(":scope > [data-part=rest]")
      if (summary) {
        summary.textContent = `+${remaining.length}`
        summary.setAttribute("aria-label", this.restLabel ?? `${remaining.length} more avatars`)
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
