import { ViewElement } from "../../core/index.js"
import { splitDirections } from "./model.js"
import type { SplitDirection, SplitChangeDetail } from "./model.js"
import type { SplitPane } from "./split-pane.js"

/**
 * A resizable split pane container dividing available space between two content panes.
 * @region {"name":"panes","element":"m-split-pane","accepts":["SplitPane"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"size":"number"}}
 */
export class Split extends ViewElement {
  public static readonly tag = "m-split"
  public static readonly observedAttributes = ["direction", "size", "min", "max", "disabled"]

  private initialized = false
  private observer: MutationObserver | undefined
  private handleElement: HTMLElement | undefined
  private isDragging = false
  private dragStartX = 0
  private dragStartY = 0
  private dragStartRatio = 0
  private pointerId = -1

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.classList.add("m-split")
    this.observer ??= new MutationObserver(() => this.render())
    this.observer.observe(this, { childList: true })
    this.render()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.cleanupHandle()
    this.ownerDocument.removeEventListener("pointermove", this.onPointerMove)
    this.ownerDocument.removeEventListener("pointerup", this.onPointerUp)
    this.ownerDocument.removeEventListener("pointercancel", this.onPointerUp)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.initialized && this.isConnected) {
      this.render()
    }
  }

  /**
   * Layout direction for splitting panes: horizontal (side-by-side) or vertical (stacked).
   */
  public get direction(): SplitDirection {
    return this.choiceAttribute("direction", splitDirections, "horizontal")
  }
  public set direction(value: SplitDirection) {
    this.setChoiceAttribute("direction", value, splitDirections)
  }

  /**
   * Proportion of container space allocated to the first pane (from 0 to 1).
   */
  public get size(): number {
    return this.numberAttribute("size", 0.5)
  }
  public set size(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number size.")
    this.setAttribute("size", String(value))
  }

  /**
   * Minimum ratio constraint for the first pane size.
   */
  public get min(): number {
    return this.numberAttribute("min", 0.1)
  }
  public set min(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number min.")
    this.setAttribute("min", String(value))
  }

  /**
   * Maximum ratio constraint for the first pane size.
   */
  public get max(): number {
    return this.numberAttribute("max", 0.9)
  }
  public set max(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value)) throw new RangeError("Invalid number max.")
    this.setAttribute("max", String(value))
  }

  /**
   * Disables user interaction and resizing.
   */
  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  /**
   * Collection of child split pane elements.
   */
  public get panes(): readonly SplitPane[] {
    return Object.freeze(
      [...this.querySelectorAll<SplitPane>(":scope > m-split-pane, :scope > [data-part='pane']")]
    )
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (this.disabled || event.button !== 0 || !event.isPrimary) return
    event.preventDefault()
    this.isDragging = true
    this.pointerId = event.pointerId
    this.dragStartX = event.clientX
    this.dragStartY = event.clientY
    this.dragStartRatio = this.size

    this.setAttribute("data-split-dragging", "")
    const handle = this.handleElement
    if (handle) {
      handle.focus()
      try {
        handle.setPointerCapture(event.pointerId)
      } catch {}
    }
    this.ownerDocument.addEventListener("pointermove", this.onPointerMove)
    this.ownerDocument.addEventListener("pointerup", this.onPointerUp)
    this.ownerDocument.addEventListener("pointercancel", this.onPointerUp)
  }

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging || event.pointerId !== this.pointerId) return
    const direction = this.direction
    const rect = this.getBoundingClientRect()
    const total = direction === "horizontal" ? rect.width : rect.height
    if (total <= 0) return

    const delta = direction === "horizontal" ? (event.clientX - this.dragStartX) : (event.clientY - this.dragStartY)
    const ratioDelta = delta / total
    const raw = this.dragStartRatio + ratioDelta
    const clamped = Math.max(this.min, Math.min(this.max, Math.round(raw * 1000) / 1000))
    if (clamped !== this.size) {
      this.size = clamped
      this.emit<SplitChangeDetail>("m:change", { size: this.size }, { bubbles: true, cancelable: false, composed: false })
    }
  }

  private onPointerUp = (event: PointerEvent): void => {
    if (!this.isDragging || event.pointerId !== this.pointerId) return
    this.isDragging = false
    this.removeAttribute("data-split-dragging")
    const handle = this.handleElement
    if (handle) {
      try {
        if (handle.hasPointerCapture(event.pointerId)) {
          handle.releasePointerCapture(event.pointerId)
        }
      } catch {}
    }
    this.pointerId = -1
    this.ownerDocument.removeEventListener("pointermove", this.onPointerMove)
    this.ownerDocument.removeEventListener("pointerup", this.onPointerUp)
    this.ownerDocument.removeEventListener("pointercancel", this.onPointerUp)
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.disabled) return
    const direction = this.direction
    const horizontal = direction === "horizontal"
    const step = event.shiftKey ? 0.1 : 0.02

    let nextSize: number | undefined
    if (event.key === "Home") {
      nextSize = this.min
    } else if (event.key === "End") {
      nextSize = this.max
    } else if ((horizontal && event.key === "ArrowLeft") || (!horizontal && event.key === "ArrowUp")) {
      nextSize = Math.max(this.min, Math.min(this.max, Math.round((this.size - step) * 1000) / 1000))
    } else if ((horizontal && event.key === "ArrowRight") || (!horizontal && event.key === "ArrowDown")) {
      nextSize = Math.max(this.min, Math.min(this.max, Math.round((this.size + step) * 1000) / 1000))
    }

    if (nextSize !== undefined) {
      event.preventDefault()
      if (nextSize !== this.size) {
        this.size = nextSize
        this.emit<SplitChangeDetail>("m:change", { size: this.size }, { bubbles: true, cancelable: false, composed: false })
      }
    }
  }

  private attachHandleEvents(handle: HTMLElement): void {
    handle.addEventListener("pointerdown", this.onPointerDown)
    handle.addEventListener("keydown", this.onKeyDown)
  }

  private cleanupHandle(): void {
    if (this.handleElement) {
      this.handleElement.removeEventListener("pointerdown", this.onPointerDown)
      this.handleElement.removeEventListener("keydown", this.onKeyDown)
      this.handleElement = undefined
    }
  }

  private render(): void {
    if (!this.isConnected) return
    this.observer?.disconnect()

    try {
      const direction = this.direction
      const disabled = this.disabled
      const size = this.size
      const min = this.min
      const max = this.max

      this.setAttribute("data-split-direction", direction)
      this.setAttribute("data-split-layout", "ready")
      if (disabled) {
        this.setAttribute("data-split-disabled", "")
      } else {
        this.removeAttribute("data-split-disabled")
      }

      if (typeof PointerEvent !== "undefined") {
        this.setAttribute("data-split-pointer", "")
      }

      const children = [...this.children]
      let pane1: HTMLElement | undefined
      let pane2: HTMLElement | undefined
      let handle: HTMLElement | undefined

      const nonHandles = children.filter(child => {
        if (child instanceof HTMLElement && child.hasAttribute("data-split-handle")) {
          handle = child
          return false
        }
        return child instanceof HTMLElement
      }) as HTMLElement[]

      if (nonHandles[0]) {
        pane1 = nonHandles[0]
        pane1.setAttribute("data-split-pane", "1")
      }
      if (nonHandles[1]) {
        pane2 = nonHandles[1]
        pane2.setAttribute("data-split-pane", "2")
      }

      if (!handle) {
        handle = this.ownerDocument.createElement("div")
        handle.setAttribute("data-split-handle", "")
        handle.dataset.part = "handle"
        if (pane1) {
          pane1.after(handle)
        } else {
          this.append(handle)
        }
      }

      if (this.handleElement !== handle) {
        this.cleanupHandle()
        this.handleElement = handle
        this.attachHandleEvents(handle)
      }

      handle.setAttribute("role", "separator")
      handle.tabIndex = disabled ? -1 : 0
      handle.setAttribute("aria-orientation", direction === "horizontal" ? "vertical" : "horizontal")
      handle.setAttribute("aria-valuemin", String(Math.round(min * 100)))
      handle.setAttribute("aria-valuemax", String(Math.round(max * 100)))
      handle.setAttribute("aria-valuenow", String(Math.round(size * 100)))
      handle.setAttribute("aria-disabled", disabled ? "true" : "false")
      if (!handle.hasAttribute("aria-label")) {
        handle.setAttribute("aria-label", "Resize split")
      }
      if (pane1?.id) {
        handle.setAttribute("aria-controls", pane1.id)
      }

      const rect = this.getBoundingClientRect()
      const total = direction === "horizontal" ? rect.width : rect.height
      if (total > 0) {
        const handleSize = 12
        const available = Math.max(0, total - handleSize)
        const pixels = available * size
        this.style.setProperty("--m-split-first", `${Math.round(pixels * 1000) / 1000}px`)
      } else {
        this.style.setProperty("--m-split-first", `${Math.round(size * 1000) / 10}%`)
      }
    } finally {
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true })
      }
    }
  }
}
