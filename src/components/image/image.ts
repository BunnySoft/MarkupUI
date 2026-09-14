import { ViewElement } from "../../core/index.js"
import { imageFits } from "./model.js"
import type { ImageObjectFit, ImageLoadDetail, ImageErrorDetail } from "./model.js"
import type { ImageGroup } from "./group.js"

/**
 * Image presentation with fallback, object-fit control and dialog preview.
 * @region {"name":"content","accepts":["image","picture","phrasing"],"min":0,"max":1}
 * @event {"name":"Load","web":"m:load","bubbles":true,"cancelable":false,"composed":false,"detail":{"src":"string"}}
 * @event {"name":"Error","web":"m:error","bubbles":true,"cancelable":false,"composed":false,"detail":{"src":"string"}}
 */
export class Image extends ViewElement {
  public static readonly tag = "m-image"
  public static get observedAttributes(): string[] {
    return ["src", "alt", "width", "height", "preview", "preview-src", "fallback-src", "object-fit"]
  }

  private imgElement: HTMLImageElement | null = null
  private fallbackAttempted = false
  private previewDialog: HTMLDialogElement | null = null
  private closeButton: HTMLButtonElement | null = null
  private stageImage: HTMLImageElement | null = null
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.ensureImage()
    this.synchronize()
    this.addEventListener("click", this.handleClick)
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
    this.closePreview()
    if (this.previewDialog) {
      this.previewDialog.remove()
      this.previewDialog = null
      this.closeButton = null
      this.stageImage = null
    }
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (name === "src") {
      this.fallbackAttempted = false
    }
    if (this.isConnected) {
      this.synchronize()
    }
  }

  public get src(): string {
    return this.getAttribute("src") ?? ""
  }
  public set src(value: string | null) {
    this.fallbackAttempted = false
    this.setStringAttribute("src", value)
  }

  public get alt(): string {
    return this.getAttribute("alt") ?? ""
  }
  public set alt(value: string | null) {
    this.setStringAttribute("alt", value)
  }

  public get width(): string | null {
    return this.getAttribute("width")
  }
  public set width(value: string | null) {
    this.setStringAttribute("width", value)
  }

  public get height(): string | null {
    return this.getAttribute("height")
  }
  public set height(value: string | null) {
    this.setStringAttribute("height", value)
  }

  public get preview(): boolean {
    return this.booleanAttribute("preview", true)
  }
  public set preview(value: boolean) {
    this.setBooleanAttribute("preview", value, false)
  }

  public get previewSrc(): string | null {
    return this.getAttribute("preview-src")
  }
  public set previewSrc(value: string | null) {
    this.setStringAttribute("preview-src", value)
  }

  public get fallbackSrc(): string | null {
    return this.getAttribute("fallback-src")
  }
  public set fallbackSrc(value: string | null) {
    this.setStringAttribute("fallback-src", value)
  }

  public get objectFit(): ImageObjectFit {
    return this.choiceAttribute("object-fit", imageFits, "fill")
  }
  public set objectFit(value: ImageObjectFit) {
    this.setChoiceAttribute("object-fit", value, imageFits)
  }

  public get image(): HTMLImageElement | null {
    return this.imgElement
  }

  public openPreview(): boolean {
    if (!this.isConnected || !this.preview) return false
    const src = this.previewSrc || this.src
    if (!src) return false
    this.ensurePreviewDialog()
    if (!this.previewDialog) return false
    if (this.stageImage) {
      this.stageImage.src = src
      this.stageImage.alt = this.alt
    }
    if (typeof this.previewDialog.showModal === "function") {
      this.previewDialog.showModal()
    } else {
      this.previewDialog.open = true
    }
    this.closeButton?.focus({ preventScroll: true })
    return true
  }

  public closePreview(): void {
    if (this.previewDialog?.open) {
      if (typeof this.previewDialog.close === "function") {
        this.previewDialog.close()
      } else {
        this.previewDialog.open = false
        this.previewDialog.dispatchEvent(new Event("close"))
      }
    }
  }

  private ensureImage(): HTMLImageElement {
    if (!this.imgElement || this.imgElement.parentElement !== this) {
      const existing = this.querySelector<HTMLImageElement>(":scope > img")
      if (existing) {
        this.imgElement = existing
      } else {
        const img = this.ownerDocument.createElement("img")
        img.classList.add("m-image")
        this.prepend(img)
        this.imgElement = img
      }
      this.imgElement.removeEventListener("load", this.handleImgLoad)
      this.imgElement.removeEventListener("error", this.handleImgError)
      this.imgElement.addEventListener("load", this.handleImgLoad)
      this.imgElement.addEventListener("error", this.handleImgError)
    }
    return this.imgElement
  }

  private synchronize(): void {
    const img = this.ensureImage()
    const src = this.src
    if (img.getAttribute("src") !== src && src) {
      img.setAttribute("src", src)
    } else if (!src && img.hasAttribute("src")) {
      img.removeAttribute("src")
    }

    const alt = this.alt
    if (img.alt !== alt) {
      img.alt = alt
    }

    const width = this.width
    if (width !== null) {
      img.setAttribute("width", width)
    } else {
      img.removeAttribute("width")
    }

    const height = this.height
    if (height !== null) {
      img.setAttribute("height", height)
    } else {
      img.removeAttribute("height")
    }

    const fit = this.objectFit
    this.style.setProperty("--m-image-fit", fit)
  }

  private readonly handleImgLoad = (): void => {
    const src = this.imgElement?.currentSrc || this.imgElement?.src || this.src
    this.emit<ImageLoadDetail>("m:load", { src }, { bubbles: true, cancelable: false, composed: false })
  }

  private readonly handleImgError = (): void => {
    if (!this.fallbackAttempted && this.fallbackSrc) {
      this.fallbackAttempted = true
      if (this.imgElement) {
        this.imgElement.src = this.fallbackSrc
        return
      }
    }
    const src = this.imgElement?.src || this.src
    this.emit<ImageErrorDetail>("m:error", { src }, { bubbles: true, cancelable: false, composed: false })
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0 || !this.preview) return
    const group = this.closest("m-image-group") as ImageGroup | null
    if (group && typeof group.openPreviewFor === "function") {
      if (group.openPreviewFor(this)) {
        event.preventDefault()
      }
      return
    }
    if (this.openPreview()) {
      event.preventDefault()
    }
  }

  private ensurePreviewDialog(): void {
    if (this.previewDialog && this.previewDialog.isConnected) return
    const dialog = this.ownerDocument.createElement("dialog")
    dialog.classList.add("m-image-preview")
    dialog.setAttribute("aria-label", "Image preview")

    const closeBtn = this.ownerDocument.createElement("button")
    closeBtn.type = "button"
    closeBtn.setAttribute("data-image-close", "")
    closeBtn.setAttribute("aria-label", "Close preview")
    closeBtn.textContent = "Close preview"

    const stage = this.ownerDocument.createElement("div")
    stage.setAttribute("data-image-stage", "")

    const fullImg = this.ownerDocument.createElement("img")
    fullImg.setAttribute("data-image-full", "")
    fullImg.decoding = "async"
    fullImg.alt = this.alt
    stage.append(fullImg)

    const err = this.ownerDocument.createElement("p")
    err.setAttribute("data-image-preview-error", "")
    err.hidden = true
    err.textContent = "Preview failed"

    dialog.append(closeBtn, stage, err)

    closeBtn.addEventListener("click", () => this.closePreview())
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) this.closePreview()
    })
    dialog.addEventListener("close", () => {
      this.focus({ preventScroll: true })
    })

    this.append(dialog)
    this.previewDialog = dialog
    this.closeButton = closeBtn
    this.stageImage = fullImg
  }
}

export { Image as MImage }