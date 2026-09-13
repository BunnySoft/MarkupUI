import { ViewElement } from "../../core/index.js"

/**
 * A virtual list component that renders only visible items for high performance with large datasets.
 * @region {"name":"items","accepts":["ul","ol","content"],"min":0,"max":1}
 * @event {"name":"VirtualListError","web":"m:virtual-list-error","bubbles":true,"cancelable":false,"composed":false}
 */
export class VirtualList extends ViewElement {
  public static readonly tag = "m-virtual-list"
  public static get observedAttributes(): string[] {
    return ["item-size", "height"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-virtual-list")
    this.dataset.mVirtualList = ""
    this.syncItemSize()
    this.syncHeight()
  }

  public disconnectedCallback(): void {
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    if (name === "item-size") {
      this.syncItemSize()
    } else if (name === "height") {
      this.syncHeight()
    }
  }

  public get itemSize(): number {
    return this.numberAttribute("item-size", 40)
  }
  public set itemSize(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new RangeError("Invalid number item-size.")
    }
    this.setAttribute("item-size", String(value))
  }

  public get height(): string {
    return this.getAttribute("height") ?? ""
  }
  public set height(value: number | string) {
    if (typeof value !== "number" && typeof value !== "string") {
      throw new RangeError("Invalid height.")
    }
    if (typeof value === "string" && !value.trim()) {
      this.removeAttribute("height")
      return
    }
    this.setAttribute("height", String(value))
  }

  private syncItemSize(): void {
    if (this.hasAttribute("item-size")) {
      const size = this.getAttribute("item-size")
      if (size !== null) {
        const num = Number(size)
        if (Number.isFinite(num) && num > 0) {
          this.style.setProperty("--m-virtual-row-size", `${num}px`)
        }
      }
    }
  }

  private syncHeight(): void {
    if (this.hasAttribute("height")) {
      const raw = this.getAttribute("height")
      if (raw !== null && raw.trim() !== "") {
        const trimmed = raw.trim()
        const cssValue = /^\d+(?:\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed
        this.style.setProperty("--m-virtual-list-height", cssValue)
      } else {
        this.style.removeProperty("--m-virtual-list-height")
      }
    } else {
      this.style.removeProperty("--m-virtual-list-height")
    }
  }
}
