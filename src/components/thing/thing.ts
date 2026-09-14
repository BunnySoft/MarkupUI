import { ViewElement } from "../../core/index.js"

/**
 * A compound-content component with media, header, content, footer, and action regions.
 * @region {"name":"avatar","accepts":["m-thing-avatar","image","icon"],"min":0,"max":1}
 * @region {"name":"header","accepts":["m-thing-header","heading","content"],"min":0,"max":1}
 * @region {"name":"content","accepts":["m-thing-content","content","controls"],"min":0,"max":1}
 * @region {"name":"footer","accepts":["m-thing-footer","content","controls"],"min":0,"max":1}
 * @region {"name":"action","accepts":["m-thing-action","actions","buttons"],"min":0,"max":1}
 */
export class Thing extends ViewElement {
  public static readonly tag = "m-thing"

  public static get observedAttributes(): string[] {
    return ["title", "description"]
  }

  private generatedHeader: HTMLElement | undefined
  private generatedTitle: HTMLSpanElement | undefined
  private generatedDescription: HTMLParagraphElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-thing")
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  /**
   * Title text for the thing.
   */
  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }

  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  /**
   * Description text for the thing.
   */
  public get description(): string {
    return this.getAttribute("description") ?? ""
  }

  public set description(value: string) {
    this.setStringAttribute("description", value)
  }

  private region(name: string, except?: Element): HTMLElement | undefined {
    const selector = `:is(m-thing-${name}, .m-thing-${name}, [data-part="${name}"], [slot="${name}"])`
    const direct = Array.from(this.children).find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        el !== except &&
        el.matches(selector),
    )
    if (direct) return direct
    return Array.from(this.querySelectorAll(selector)).find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        el !== except &&
        this.contains(el),
    )
  }

  private synchronize(): void {
    this.observer?.disconnect()

    if (this.generatedHeader?.parentNode !== this) {
      this.generatedHeader = undefined
      this.generatedTitle = undefined
    }
    if (this.generatedDescription?.parentNode !== this) {
      this.generatedDescription = undefined
    }

    const titleText = this.title
    const descriptionText = this.description

    let header = this.region("header", this.generatedHeader) ?? this.generatedHeader

    if (header && this.generatedHeader && header !== this.generatedHeader) {
      this.generatedTitle?.remove()
      this.generatedTitle = undefined
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }

    if (!header && titleText) {
      this.generatedHeader = this.ownerDocument.createElement("m-thing-header")
      this.generatedHeader.className = "m-thing-header"
      header = this.generatedHeader
      const avatar = this.region("avatar")
      if (avatar) avatar.after(header)
      else this.prepend(header)
    }

    if (header && header === this.generatedHeader) {
      if (titleText) {
        if (!this.generatedTitle) {
          this.generatedTitle = this.ownerDocument.createElement("span")
          this.generatedTitle.className = "m-thing-title"
          this.generatedTitle.dataset.part = "title"
          header.prepend(this.generatedTitle)
        }
        if (this.generatedTitle.textContent !== titleText) {
          this.generatedTitle.textContent = titleText
        }
      } else {
        this.generatedTitle?.remove()
        this.generatedTitle = undefined
        header.remove()
        this.generatedHeader = undefined
        header = undefined
      }
    }

    const authoredDesc = Array.from(this.children).find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        el !== this.generatedDescription &&
        (el.classList.contains("m-thing-description") || el.dataset.part === "description"),
    )

    if (authoredDesc && this.generatedDescription) {
      this.generatedDescription.remove()
      this.generatedDescription = undefined
    }

    if (!authoredDesc && descriptionText) {
      if (!this.generatedDescription) {
        this.generatedDescription = this.ownerDocument.createElement("p")
        this.generatedDescription.className = "m-thing-description"
        this.generatedDescription.dataset.part = "description"
        if (header) header.after(this.generatedDescription)
        else {
          const avatar = this.region("avatar")
          if (avatar) avatar.after(this.generatedDescription)
          else this.prepend(this.generatedDescription)
        }
      }
      if (this.generatedDescription.textContent !== descriptionText) {
        this.generatedDescription.textContent = descriptionText
      }
    } else if (!descriptionText && this.generatedDescription) {
      this.generatedDescription.remove()
      this.generatedDescription = undefined
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true })
    }
  }
}

/**
 * Avatar region of a Thing component.
 */
export class ThingAvatar extends ViewElement {
  public static readonly tag = "m-thing-avatar"

  public connectedCallback(): void {
    this.classList.add("m-thing-avatar")
  }
}

/**
 * Header region of a Thing component.
 */
export class ThingHeader extends ViewElement {
  public static readonly tag = "m-thing-header"

  public connectedCallback(): void {
    this.classList.add("m-thing-header")
  }
}

/**
 * Content region of a Thing component.
 */
export class ThingContent extends ViewElement {
  public static readonly tag = "m-thing-content"

  public connectedCallback(): void {
    this.classList.add("m-thing-content")
  }
}

/**
 * Footer region of a Thing component.
 */
export class ThingFooter extends ViewElement {
  public static readonly tag = "m-thing-footer"

  public connectedCallback(): void {
    this.classList.add("m-thing-footer")
  }
}

/**
 * Action region of a Thing component.
 */
export class ThingAction extends ViewElement {
  public static readonly tag = "m-thing-action"

  public connectedCallback(): void {
    this.classList.add("m-thing-action")
  }
}

export { Thing as MThing }
export { ThingAvatar as MThingAvatar }
export { ThingHeader as MThingHeader }
export { ThingContent as MThingContent }
export { ThingFooter as MThingFooter }
export { ThingAction as MThingAction }
