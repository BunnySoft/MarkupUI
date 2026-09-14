import { ViewElement } from "../../core/index.js"
import { pageWindow, paginationState } from "./model.js"

/**
 * A responsive pagination control supporting page bounds, item counting, and keyboard navigation.
 * @region {"name":"prefix","accepts":["text","content"],"min":0,"max":1}
 * @region {"name":"suffix","accepts":["text","content"],"min":0,"max":1}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"page":"number","pageSize":"number"}}
 */
export class Pagination extends ViewElement {
  public static readonly tag = "m-pagination"
  public static get observedAttributes(): string[] {
    return ["page", "page-size", "page-count", "item-count", "count", "disabled", "simple"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mPagination = ""
    this.classList.add("m-pagination")
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "navigation")
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", this.getAttribute("label") ?? "Pagination")
    }
    this.render()
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.isConnected) {
      this.render()
    }
  }

  public get page(): number {
    return Math.max(1, this.numberAttribute("page", 1))
  }
  public set page(val: number) {
    const total = this.pageCount
    const p = Math.max(1, Math.min(Math.round(val), total))
    const old = this.page
    this.setAttribute("page", String(p))
    if (old !== p) {
      this.emitChange(p)
    }
  }

  public get pageCount(): number {
    const itemCount = this.itemCount
    if (itemCount !== null) {
      return Math.max(1, Math.ceil(itemCount / this.pageSize))
    }
    const countAttr = this.hasAttribute("count") ? this.numberAttribute("count", 1) : null
    const pageCountAttr = this.hasAttribute("page-count") ? this.numberAttribute("page-count", 1) : null
    return Math.max(1, Math.round(countAttr ?? pageCountAttr ?? 1))
  }
  public set pageCount(val: number) {
    this.setAttribute("page-count", String(Math.max(1, Math.round(val))))
  }

  public get count(): number {
    return this.pageCount
  }
  public set count(val: number) {
    this.setAttribute("count", String(Math.max(1, Math.round(val))))
  }

  public get pageSize(): number {
    return Math.max(1, this.numberAttribute("page-size", 10))
  }
  public set pageSize(val: number) {
    this.setAttribute("page-size", String(Math.max(1, Math.round(val))))
  }

  public get itemCount(): number | null {
    return this.numberAttribute("item-count", null)
  }
  public set itemCount(val: number | null) {
    if (val === null) this.removeAttribute("item-count")
    else this.setAttribute("item-count", String(Math.max(0, Math.round(val))))
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(val: boolean) {
    this.setBooleanAttribute("disabled", val)
  }

  public get simple(): boolean {
    return this.hasAttribute("simple")
  }
  public set simple(val: boolean) {
    this.setBooleanAttribute("simple", val)
  }

  public select(page: number): void {
    this.page = page
  }

  private emitChange(page: number): void {
    this.dispatchEvent(
      new CustomEvent("m:change", {
        bubbles: true,
        cancelable: false,
        detail: { page, pageSize: this.pageSize },
      })
    )
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        cancelable: false,
        detail: page,
      })
    )
  }

  private render(): void {
    if (this.querySelector("[data-pagination-pages]") !== null) {
      return
    }

    const count = this.pageCount
    const current = Math.min(this.page, count)
    const isDisabled = this.disabled

    const state = paginationState({
      page: current,
      pageCount: count,
      pageSize: this.pageSize,
      itemCount: this.itemCount,
      disabled: isDisabled,
      simple: this.simple,
    })

    const makeButton = (text: string, target: number, isCurrent = false, label?: string): HTMLButtonElement => {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.textContent = text
      if (label) button.setAttribute("aria-label", label)
      if (isCurrent) button.setAttribute("aria-current", "page")
      if (isDisabled) button.disabled = true
      button.addEventListener("click", () => {
        if (!isDisabled && target !== this.page) {
          this.page = target
        }
      })
      return button
    }

    const previous = makeButton("‹", current - 1, false, "Previous page")
    if (current <= 1) previous.disabled = true

    const next = makeButton("›", current + 1, false, "Next page")
    if (current >= count) next.disabled = true

    const items = pageWindow(state)
    const pageButtons = items.map(item => {
      if (item.gap) {
        const gapBtn = makeButton("…", item.page, false, `Jump to page ${item.page}`)
        gapBtn.dataset.paginationGap = ""
        return gapBtn
      }
      return makeButton(String(item.page), item.page, item.page === current)
    })

    this.replaceChildren(previous, ...pageButtons, next)
  }
}
