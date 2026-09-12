import { ViewElement } from "../../core/index.js"
import { avatarSizes, avatarShapes, imageFits, avatarLoadingModes } from "./model.js"
import type { AvatarSize, AvatarShape, AvatarImageFit, AvatarState, AvatarLoading } from "./model.js"

export interface AvatarLoadDetail {
  src: string
}

export interface AvatarErrorDetail extends AvatarLoadDetail {
  fallback: boolean
  state: AvatarState
}

export class AvatarPlaceholder extends ViewElement {
  public static readonly tag = "m-avatar-placeholder"
}

export class AvatarFallback extends ViewElement {
  public static readonly tag = "m-avatar-fallback"
}

/**
 * Image, text or icon presentation with bounded resource fallback.
 * @region {"name":"content","accepts":["text","image","icon"],"min":0,"max":1}
 * @region {"name":"placeholder","accepts":["display"],"min":0,"max":1,"element":"m-avatar-placeholder"}
 * @region {"name":"fallback","accepts":["display"],"min":0,"max":1,"element":"m-avatar-fallback"}
 */
export class Avatar extends ViewElement {
  public static readonly tag = "m-avatar"
  public static get observedAttributes(): string[] {
    return ["src", "fallback-src", "label", "loading", "size", "image-fit", "shape", "bordered"]
  }
  private image: HTMLImageElement | undefined
  private generatedImage: HTMLImageElement | undefined
  private observer: MutationObserver | undefined
  private resizeObserver: ResizeObserver | undefined
  private readonly textElements = new Set<HTMLElement>()
  private source = ""
  private fallbackImageSource: string | undefined
  private fallbackAttempted = false
  private managedLabel: string | undefined
  private managedRole: string | undefined
  private initialLoading: string | null = null
  private upgraded = false
  private ready = false
  private managedHidden = false
  private readonly templates = new WeakSet<HTMLElement>()
  private readonly styles = new Map<string, { applied: string; original: string; priority: string }>()
  private resourceState: AvatarState = "empty"

  public get state(): AvatarState {
    return this.resourceState
  }

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.ready = true
    this.synchronize()
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(this.fitText)
      this.resizeObserver.observe(this, { box: "border-box" })
      for (const element of this.textElements) this.resizeObserver.observe(element)
    }
    this.observer = new MutationObserver((records) => {
      if (records.some(record => record.type === "childList" || record.target === this.image)) {
        this.synchronize()
      } else {
        this.update()
      }
    })
    this.observer.observe(this, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["src", "alt", "aria-label", "aria-labelledby", "role"] })
  }

  public disconnectedCallback(): void {
    this.ready = false
    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
    this.resizeObserver = undefined
    this.textElements.clear()
    this.unlisten()
  }

  public attributeChangedCallback(name: string, previous: string | null, value: string | null): void {
    if (name === "src" && previous !== null && value === null) this.image?.removeAttribute("src")
    if (this.ready) {
      if (name === "label") this.update()
      else this.synchronize()
    }
  }

  public get src(): string | null { return this.getAttribute("src") }
  public set src(value: string | null) { this.setStringAttribute("src", value) }

  public get fallbackSrc(): string | null { return this.getAttribute("fallback-src") }
  public set fallbackSrc(value: string | null) { this.setStringAttribute("fallback-src", value) }

  public get label(): string | null { return this.getAttribute("label") }
  public set label(value: string | null) { this.setStringAttribute("label", value) }

  public get loading(): AvatarLoading { return this.choiceAttribute("loading", avatarLoadingModes, "eager") }
  public set loading(value: AvatarLoading) {
    this.setChoiceAttribute("loading", value, avatarLoadingModes)
  }

  /** @minExclusive 0 */
  public get size(): AvatarSize {
    const value = Number(this.getAttribute("size"))
    if (Number.isFinite(value) && value > 0) return value
    return this.choiceAttribute("size", avatarSizes, "medium")
  }
  public set size(value: AvatarSize) {
    if (typeof value === "number") {
      if (!Number.isFinite(value) || value <= 0) throw new RangeError("Invalid size.")
      this.setAttribute("size", String(value))
    } else {
      this.setChoiceAttribute("size", value, avatarSizes)
    }
  }

  public get shape(): AvatarShape { return this.choiceAttribute("shape", avatarShapes, "rounded") }
  public set shape(value: AvatarShape) {
    this.setChoiceAttribute("shape", value, avatarShapes)
  }

  public get imageFit(): AvatarImageFit { return this.choiceAttribute("image-fit", imageFits, "fill") }
  public set imageFit(value: AvatarImageFit) {
    this.setChoiceAttribute("image-fit", value, imageFits)
  }

  public get bordered(): boolean { return this.hasAttribute("bordered") }
  public set bordered(value: boolean) { this.setBooleanAttribute("bordered", value) }

  private synchronize(): void {
    const size = this.size
    const fit = this.imageFit
    const loading = this.loading
    // Read every enum before changing the presentation, including CSS-only shape.
    void this.shape
    this.prepareContent()
    let image = this.querySelector<HTMLImageElement>(":scope > img") ?? undefined
    if (image === undefined && this.src) {
      image = this.ownerDocument.createElement("img")
      this.generatedImage = image
      this.prepend(image)
    }
    if (image !== this.image) {
      this.unlisten()
      this.image = image
      this.initialLoading = image?.getAttribute("loading") ?? null
      this.source = ""
      this.fallbackImageSource = undefined
      this.fallbackAttempted = false
    }
    image?.addEventListener("load", this.onLoad)
    image?.addEventListener("error", this.onError)

    if (image !== undefined) {
      if (image === this.generatedImage && image.getAttribute("alt") !== "") image.alt = ""
      if (this.hasAttribute("loading")) image.setAttribute("loading", loading)
      else if (this.initialLoading !== null) image.setAttribute("loading", this.initialLoading)
      else image.removeAttribute("loading")
      const authoredSource = image.getAttribute("src") ?? ""
      const source = this.hasAttribute("src") || image === this.generatedImage
        ? this.src ?? ""
        : authoredSource === this.fallbackImageSource ? this.source : authoredSource
      if (source !== this.source) {
        this.source = source
        this.fallbackAttempted = false
        this.fallbackImageSource = undefined
        this.resourceState = source ? "loading" : "empty"
        if (source) image.setAttribute("src", source)
        else image.removeAttribute("src")
      }
    } else {
      this.resourceState = "empty"
    }

    this.styleToken("--m-avatar-size", typeof size === "number" ? `${size}px` : null)
    this.styleToken("--m-avatar-object-fit", this.hasAttribute("image-fit") ? fit : null)
    this.update()
    if (this.source && image?.complete && this.state === "loading") {
      if (image.naturalWidth > 0) this.onLoad()
      else this.onError()
    }
  }

  private prepareContent(): void {
    for (const name of ["placeholder", "fallback"]) {
      const regions = this.querySelectorAll<HTMLElement>(`:scope > m-avatar-${name}`)
      if (regions.length > 1) throw new TypeError(`Invalid ${name} region count.`)
      const region = regions[0]
      if (region) {
        region.dataset.part = name
        const templates = region.querySelectorAll<HTMLTemplateElement>(":scope > template")
        if (templates.length > 1) throw new TypeError("Avatar regions accept at most one template.")
        const template = templates[0]
        if (template && !this.templates.has(region)) {
          this.templates.add(region)
          region.append(this.ownerDocument.importNode(template.content, true))
        }
      }
    }
    if (this.querySelectorAll(":scope > img").length > 1) throw new TypeError("Avatar accepts only one source image.")
    if (this.querySelector("a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]:not([contenteditable=false])")) {
      throw new TypeError("Avatar content must be noninteractive.")
    }
    const nodes = [...this.childNodes].filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof Element && !node.matches(
        "img,template,m-avatar-fallback,m-avatar-placeholder,[data-part=content]",
      )
    })
    if (nodes.length) {
      let content = this.querySelector<HTMLElement>(":scope > [data-part=content]")
      if (!content) {
        content = this.ownerDocument.createElement("span")
        content.dataset.part = "content"
        this.append(content)
      }
      content.append(...nodes)
    }
  }

  private update(): void {
    this.dataset.state = this.state
    if (this.image) this.image.hidden = this.state === "empty" || this.state === "error"
    const fallback = this.querySelector<HTMLElement>(":scope > m-avatar-fallback")
    const placeholder = this.querySelector<HTMLElement>(":scope > m-avatar-placeholder")
    const content = this.querySelector<HTMLElement>(":scope > [data-part=content]")
    if (fallback) fallback.hidden = this.state !== "error"
    if (placeholder) placeholder.hidden = this.state !== "loading"
    if (content) content.hidden = this.state === "loaded"
      || (this.state === "error" && fallback !== null)
      || (this.state === "loading" && placeholder !== null)

    const label = this.label
      ?? (this.image === this.generatedImage ? null : this.image?.getAttribute("alt"))
      ?? content?.textContent?.trim()
      ?? ""
    if (!this.hasAttribute("aria-labelledby")
      && (!this.hasAttribute("aria-label") || this.getAttribute("aria-label") === this.managedLabel)) {
      if (this.getAttribute("aria-label") !== label) this.setAttribute("aria-label", label)
      this.managedLabel = label
    }
    const named = this.getAttribute("aria-labelledby")?.trim() || this.getAttribute("aria-label")
    if (!this.hasAttribute("role") || this.getAttribute("role") === this.managedRole) {
      this.managedRole = named ? "img" : "presentation"
      if (this.getAttribute("role") !== this.managedRole) this.setAttribute("role", this.managedRole)
    }
    if (!named && !this.hasAttribute("aria-hidden")) {
      this.setAttribute("aria-hidden", "true")
      this.managedHidden = true
    } else if (named && this.managedHidden) {
      if (this.getAttribute("aria-hidden") === "true") this.removeAttribute("aria-hidden")
      this.managedHidden = false
    }
    const elements = new Set([content, fallback, placeholder].filter((element): element is HTMLElement => element !== null))
    for (const element of this.textElements) {
      if (!elements.has(element)) {
        this.resizeObserver?.unobserve(element)
        this.textElements.delete(element)
      }
    }
    for (const element of elements) {
      if (!this.textElements.has(element)) {
        this.textElements.add(element)
        this.resizeObserver?.observe(element)
      }
    }
    this.fitText()
  }

  private styleToken(name: string, value: string | null): void {
    const previous = this.styles.get(name)
    const current = this.style.getPropertyValue(name)
    const priority = this.style.getPropertyPriority(name)
    const owned = previous && current === previous.applied && !priority
    if (value === null) {
      if (owned) {
        this.style.setProperty(name, previous.original, previous.priority)
      }
      this.styles.delete(name)
    } else if (previous?.applied !== value) {
      this.styles.set(name, {
        applied: value,
        original: owned ? previous.original : current,
        priority: owned ? previous.priority : priority,
      })
      this.style.setProperty(name, value)
    }
  }

  private readonly fitText = (): void => {
    if (!this.isConnected) return
    const width = this.offsetWidth, height = this.offsetHeight
    if (!width || !height) return
    for (const element of this.textElements) {
      const textWidth = element.offsetWidth, textHeight = element.offsetHeight
      if (element.hidden || !textWidth || !textHeight) continue
      const scale = String(Math.min(width / textWidth * .9, height / textHeight * .9, 1))
      if (element.style.getPropertyValue("--m-avatar-text-scale") !== scale) {
        element.style.setProperty("--m-avatar-text-scale", scale)
      }
    }
  }

  private readonly onLoad = (): void => {
    if (!this.source || this.state !== "loading") return
    this.resourceState = "loaded"
    this.update()
    this.emit<AvatarLoadDetail>("m:load", { src: this.image?.currentSrc || this.image?.src || "" })
  }

  private readonly onError = (): void => {
    if (!this.source || this.state !== "loading") return
    const failedSrc = this.image?.currentSrc || this.image?.src || ""
    const fallback = this.ownerDocument.createElement("a")
    fallback.href = this.fallbackSrc ?? ""
    if (this.image && this.fallbackSrc && !this.fallbackAttempted && fallback.href !== failedSrc) {
      this.fallbackAttempted = true
      this.fallbackImageSource = this.fallbackSrc
      this.image.src = this.fallbackSrc
    } else {
      this.resourceState = "error"
    }
    this.update()
    this.emit<AvatarErrorDetail>("m:error", { src: failedSrc, fallback: this.fallbackAttempted, state: this.state })
  }

  private unlisten(): void {
    this.image?.removeEventListener("load", this.onLoad)
    this.image?.removeEventListener("error", this.onError)
  }
}
