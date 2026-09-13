import { ViewElement } from "../../core/index.js"

/**
 * A decorative watermark overlay providing repeated pattern tiles over content.
 * @region {"name":"content","accepts":["flow content"],"min":0,"max":null}
 * @event {"name":"WatermarkState","web":"m:watermark-state","bubbles":true,"cancelable":false,"composed":false}
 */
export class Watermark extends ViewElement {
  public static readonly tag = "m-watermark"
  public static get observedAttributes(): string[] {
    return ["content", "cross", "fullscreen", "width", "height", "z-index", "rotate"]
  }

  private upgraded = false
  private objectUrl: string | null = null

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-watermark")
    this.dataset.mWatermark = ""
    this.dataset.watermark = ""
    this.ensureOverlay()
    this.synchronize()
  }

  public disconnectedCallback(): void {
    if (this.objectUrl) {
      const view = this.ownerDocument.defaultView ?? globalThis
      if (typeof view.URL?.revokeObjectURL === "function") {
        view.URL.revokeObjectURL(this.objectUrl)
      }
      this.objectUrl = null
    }
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || !this.isConnected) return
    this.synchronize()
  }

  /**
   * Literal text content for the watermark tile.
   */
  public get content(): string {
    return this.getAttribute("content") ?? ""
  }
  public set content(value: string | null) {
    this.setStringAttribute("content", value)
  }

  /**
   * Whether to alternate tiles in a cross pattern.
   */
  public get cross(): boolean {
    return this.hasAttribute("cross")
  }
  public set cross(value: boolean) {
    this.setBooleanAttribute("cross", value)
  }

  /**
   * Whether the watermark overlay is fixed across the entire viewport.
   */
  public get fullscreen(): boolean {
    return this.hasAttribute("fullscreen")
  }
  public set fullscreen(value: boolean) {
    this.setBooleanAttribute("fullscreen", value)
  }

  /**
   * Mark width in pixels.
   * @min 1
   * @max 1024
   */
  public get width(): number {
    const value = this.numberAttribute("width", 160)
    if (value < 1 || value > 1024) throw new RangeError("Invalid number width.")
    return value
  }
  public set width(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 1024) {
      throw new RangeError("width must be finite in 1..1024.")
    }
    this.setAttribute("width", String(value))
  }

  /**
   * Mark height in pixels.
   * @min 1
   * @max 1024
   */
  public get height(): number {
    const value = this.numberAttribute("height", 80)
    if (value < 1 || value > 1024) throw new RangeError("Invalid number height.")
    return value
  }
  public set height(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1 || value > 1024) {
      throw new RangeError("height must be finite in 1..1024.")
    }
    this.setAttribute("height", String(value))
  }

  /**
   * Overlay z-index layer.
   * @integer
   * @min -2147483647
   * @max 2147483647
   */
  public get zIndex(): number {
    const value = this.numberAttribute("z-index", 10)
    if (!Number.isInteger(value) || value < -2147483647 || value > 2147483647) {
      throw new RangeError("Invalid number z-index.")
    }
    return value
  }
  public set zIndex(value: number) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < -2147483647 || value > 2147483647) {
      throw new RangeError("zIndex must be an integer in -2147483647..2147483647.")
    }
    this.setAttribute("z-index", String(value))
  }

  /**
   * Rotation angle in degrees.
   * @min -360
   * @max 360
   */
  public get rotate(): number {
    const value = this.numberAttribute("rotate", 0)
    if (value < -360 || value > 360) throw new RangeError("Invalid number rotate.")
    return value
  }
  public set rotate(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < -360 || value > 360) {
      throw new RangeError("rotate must be finite in -360..360.")
    }
    this.setAttribute("rotate", String(value))
  }

  private ensureOverlay(): HTMLDivElement {
    let overlay = this.querySelector<HTMLDivElement>(":scope > [data-watermark-overlay]")
    if (!overlay) {
      overlay = this.ownerDocument.createElement("div")
      overlay.setAttribute("data-watermark-overlay", "")
      overlay.hidden = true
      overlay.setAttribute("aria-hidden", "true")
      this.append(overlay)
    }
    return overlay
  }

  private synchronize(): void {
    if (!this.isConnected) return
    const overlay = this.ensureOverlay()

    if (this.fullscreen) {
      overlay.setAttribute("data-watermark-fullscreen", "")
    } else {
      overlay.removeAttribute("data-watermark-fullscreen")
    }

    overlay.style.setProperty("--m-watermark-z-index", String(this.zIndex))

    const text = this.content
    if (!text.trim()) {
      overlay.hidden = true
      overlay.style.removeProperty("--m-watermark-image")
      if (this.objectUrl) {
        const view = this.ownerDocument.defaultView ?? globalThis
        if (typeof view.URL?.revokeObjectURL === "function") {
          view.URL.revokeObjectURL(this.objectUrl)
        }
        this.objectUrl = null
      }
      this.dispatchEvent(new CustomEvent("m:watermark-state", {
        bubbles: true,
        detail: { phase: "empty", hasTile: false },
      }))
      return
    }

    const doc = this.ownerDocument
    const win = doc.defaultView ?? globalThis
    const width = this.width + 40
    const height = this.height + 40
    const dpr = typeof win.devicePixelRatio === "number" && win.devicePixelRatio > 0 ? win.devicePixelRatio : 1
    const pixelRatio = Math.min(4, Math.max(0.5, dpr))
    const pixelWidth = Math.ceil(width * pixelRatio)
    const pixelHeight = Math.ceil(height * pixelRatio)

    const canvas = doc.createElement("canvas")
    canvas.width = pixelWidth
    canvas.height = pixelHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.scale(pixelWidth / width, pixelHeight / height)
    ctx.font = "normal normal 400 14px sans-serif"
    ctx.fillStyle = "rgba(128, 128, 128, .3)"
    ctx.textAlign = "left"
    ctx.textBaseline = "alphabetic"

    const lines = text.split("\n").map(line => ({ text: line, metrics: ctx.measureText(line) }))
    const maxWidth = Math.max(...lines.map(l => l.metrics.width))
    const lineHeight = 20
    const boxes = lines.map(({ text: lineText, metrics: m }, i) => {
      const x = (maxWidth - m.width) * 0.5
      const y = i * lineHeight
      const left = Number.isFinite(m.actualBoundingBoxLeft) ? m.actualBoundingBoxLeft : 0
      const right = Number.isFinite(m.actualBoundingBoxRight) ? m.actualBoundingBoxRight : m.width
      const ascent = Number.isFinite(m.actualBoundingBoxAscent) ? m.actualBoundingBoxAscent : 14
      const descent = Number.isFinite(m.actualBoundingBoxDescent) ? m.actualBoundingBoxDescent : 14 * 0.3
      return { text: lineText, x, y, left: x - left, right: x + right, top: y - ascent, bottom: y + descent }
    })
    const leftBound = Math.min(...boxes.map(b => b.left))
    const rightBound = Math.max(...boxes.map(b => b.right))
    const topBound = Math.min(...boxes.map(b => b.top))
    const bottomBound = Math.max(...boxes.map(b => b.bottom))

    const draw = (): void => {
      for (const line of boxes) {
        ctx.fillText(line.text, line.x - (leftBound + rightBound) / 2, line.y - (topBound + bottomBound) / 2)
      }
    }

    const angle = (this.rotate * Math.PI) / 180
    const centers: [number, number][] = [[this.width / 2, this.height / 2]]
    if (this.cross) centers.push([this.width / 2 + width / 2, this.height / 2 + height / 2])
    for (const [cx, cy] of centers) {
      for (const dx of [-width, 0, width]) {
        for (const dy of [-height, 0, height]) {
          ctx.save()
          ctx.translate(cx + dx, cy + dy)
          ctx.rotate(angle)
          draw()
          ctx.restore()
        }
      }
    }

    try {
      if (typeof canvas.toBlob === "function") {
        canvas.toBlob(blob => {
          if (!blob || !this.isConnected) return
          if (this.objectUrl) {
            if (typeof win.URL?.revokeObjectURL === "function") {
              win.URL.revokeObjectURL(this.objectUrl)
            }
          }
          const url = win.URL.createObjectURL(blob)
          this.objectUrl = url
          overlay.style.setProperty("--m-watermark-image", `url("${url}")`)
          overlay.style.setProperty("--m-watermark-width", `${width}px`)
          overlay.style.setProperty("--m-watermark-height", `${height}px`)
          overlay.style.setProperty("--m-watermark-z-index", String(this.zIndex))
          overlay.hidden = false
          this.dispatchEvent(new CustomEvent("m:watermark-state", {
            bubbles: true,
            detail: { phase: "ready", hasTile: true },
          }))
        }, "image/png")
      }
    } catch (err) {
      this.dispatchEvent(new CustomEvent("m:watermark-state", {
        bubbles: true,
        detail: { phase: "error", hasTile: false, error: err },
      }))
    }
  }
}

export { Watermark as MWatermark }
