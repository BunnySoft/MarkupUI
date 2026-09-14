import { ViewElement } from "../../core/index.js"
import type { Image } from "./image.js"

export interface ImageGroupDetail {
  readonly current: number
  readonly src: string
}

/**
 * Container for coordinating multiple images and preview gallery navigation.
 * @region {"name":"items","accepts":["Image"],"min":0,"max":null,"element":"m-image"}
 */
export class ImageGroup extends ViewElement {
  public static readonly tag = "m-image-group"
  public static get observedAttributes(): string[] { return [] }

  private activeIndex = 0
  private previewDialog: HTMLDialogElement | null = null
  private closeButton: HTMLButtonElement | null = null
  private prevButton: HTMLButtonElement | null = null
  private nextButton: HTMLButtonElement | null = null
  private positionElement: HTMLElement | null = null
  private stageImage: HTMLImageElement | null = null
  private originalLink: HTMLAnchorElement | null = null
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
  }

  public disconnectedCallback(): void {
    this.close()
    if (this.previewDialog) {
      this.previewDialog.remove()
      this.previewDialog = null
    }
  }

  public get images(): Image[] {
    return [...this.querySelectorAll<Image>("m-image")].filter(
      (img) => img.closest("m-image-group") === this,
    )
  }

  public get current(): number {
    return this.activeIndex
  }

  public set current(index: number) {
    const list = this.images
    if (!Number.isInteger(index) || index < 0 || index >= list.length) {
      throw new RangeError("Image index is outside this group.")
    }
    this.activeIndex = index
    if (this.show) {
      this.updatePreview()
    }
  }

  public get show(): boolean {
    return Boolean(this.previewDialog?.open)
  }

  public set show(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Image show must be a boolean.")
    if (value) {
      if (!this.open(this.activeIndex)) throw new Error("Image preview is unavailable for this group.")
    } else {
      this.close()
    }
  }

  public open(index = 0): boolean {
    if (!this.isConnected) return false
    const list = this.images
    if (typeof index !== "number" || !Number.isInteger(index) || index < 0) {
      throw new RangeError("Image index must be a non-negative integer.")
    }
    if (list.length === 0 || index >= list.length) return false
    this.activeIndex = index
    this.ensureDialog()
    if (!this.previewDialog) return false
    this.updatePreview()
    if (typeof this.previewDialog.showModal === "function") {
      this.previewDialog.showModal()
    } else {
      this.previewDialog.open = true
    }
    this.closeButton?.focus({ preventScroll: true })
    const src = this.currentSrc
    this.emit<ImageGroupDetail>("m:image-open", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
    return true
  }

  public openPreviewFor(img: Image): boolean {
    const idx = this.images.indexOf(img)
    if (idx >= 0) return this.open(idx)
    return false
  }

  public close(): void {
    if (this.previewDialog?.open) {
      if (typeof this.previewDialog.close === "function") {
        this.previewDialog.close()
      } else {
        this.previewDialog.open = false
        this.previewDialog.dispatchEvent(new Event("close"))
      }
    }
  }

  public next(): boolean {
    const list = this.images
    if (!this.show || list.length < 2) return false
    this.activeIndex = (this.activeIndex + 1) % list.length
    this.updatePreview()
    const src = this.currentSrc
    this.emit<ImageGroupDetail>("m:image-next", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
    this.emit<ImageGroupDetail>("m:image-change", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
    return true
  }

  public prev(): boolean {
    const list = this.images
    if (!this.show || list.length < 2) return false
    this.activeIndex = (this.activeIndex - 1 + list.length) % list.length
    this.updatePreview()
    const src = this.currentSrc
    this.emit<ImageGroupDetail>("m:image-prev", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
    this.emit<ImageGroupDetail>("m:image-change", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
    return true
  }

  private get currentSrc(): string {
    const list = this.images
    const active = list[this.activeIndex]
    return active ? (active.previewSrc || active.src) : ""
  }

  private updatePreview(): void {
    const list = this.images
    const active = list[this.activeIndex]
    if (!active) return
    const src = active.previewSrc || active.src
    if (this.stageImage) {
      this.stageImage.src = src
      this.stageImage.alt = active.alt
    }
    if (this.positionElement) {
      this.positionElement.textContent = `Image ${this.activeIndex + 1} of ${list.length}`
    }
    if (this.prevButton) {
      this.prevButton.disabled = list.length < 2
    }
    if (this.nextButton) {
      this.nextButton.disabled = list.length < 2
    }
    if (this.originalLink) {
      this.originalLink.href = src
    }
  }

  private ensureDialog(): void {
    if (this.previewDialog && this.previewDialog.isConnected) return
    const dialog = this.ownerDocument.createElement("dialog")
    dialog.classList.add("m-image-preview")
    dialog.setAttribute("aria-label", "Image preview")

    const closeBtn = this.ownerDocument.createElement("button")
    closeBtn.type = "button"
    closeBtn.setAttribute("data-image-close", "")
    closeBtn.setAttribute("aria-label", "Close preview")
    closeBtn.textContent = "Close preview"

    const pos = this.ownerDocument.createElement("p")
    pos.setAttribute("data-image-position", "")

    const stage = this.ownerDocument.createElement("div")
    stage.setAttribute("data-image-stage", "")

    const fullImg = this.ownerDocument.createElement("img")
    fullImg.setAttribute("data-image-full", "")
    fullImg.decoding = "async"
    stage.append(fullImg)

    const err = this.ownerDocument.createElement("p")
    err.setAttribute("data-image-preview-error", "")
    err.hidden = true
    err.textContent = "Preview failed"

    const toolbar = this.ownerDocument.createElement("div")
    toolbar.setAttribute("data-image-toolbar", "")

    const prevBtn = this.ownerDocument.createElement("button")
    prevBtn.type = "button"
    prevBtn.setAttribute("data-image-prev", "")
    prevBtn.textContent = "Previous image"

    const nextBtn = this.ownerDocument.createElement("button")
    nextBtn.type = "button"
    nextBtn.setAttribute("data-image-next", "")
    nextBtn.textContent = "Next image"

    const origLink = this.ownerDocument.createElement("a")
    origLink.setAttribute("data-image-original", "")
    origLink.target = "_blank"
    origLink.rel = "noopener noreferrer"
    origLink.textContent = "Open original"

    toolbar.append(prevBtn, nextBtn, origLink)
    dialog.append(closeBtn, pos, stage, err, toolbar)

    closeBtn.addEventListener("click", () => this.close())
    prevBtn.addEventListener("click", () => this.prev())
    nextBtn.addEventListener("click", () => this.next())
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.close()
    })
    dialog.addEventListener("close", () => {
      const src = this.currentSrc
      this.emit<ImageGroupDetail>("m:image-close", { current: this.activeIndex, src }, { bubbles: true, cancelable: false, composed: false })
      const active = this.images[this.activeIndex]
      active?.focus({ preventScroll: true })
    })

    this.append(dialog)
    this.previewDialog = dialog
    this.closeButton = closeBtn
    this.prevButton = prevBtn
    this.nextButton = nextBtn
    this.positionElement = pos
    this.stageImage = fullImg
    this.originalLink = origLink
  }
}

export { ImageGroup as MImageGroup }
