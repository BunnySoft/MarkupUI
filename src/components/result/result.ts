import { ViewElement } from "../../core/index.js"
import { resultStatuses } from "./model.js"
import type { ResultStatus } from "./model.js"

export { resultStatuses } from "./model.js"
export type { ResultStatus } from "./model.js"

const inert = "template,script,style"

/**
 * An outcome indicator with status styling, title, description, and adopted regions.
 * @region {"name":"icon","accepts":["icon","artwork"],"min":0,"max":1}
 * @region {"name":"header","element":"m-result-header","accepts":["heading","title","description"],"min":0,"max":1}
 * @region {"name":"content","element":"m-result-content","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","element":"m-result-footer","accepts":["actions","links"],"min":0,"max":1}
 */
export class Result extends ViewElement {
  public static readonly tag = "m-result"
  public static get observedAttributes(): string[] {
    return ["status", "title", "description"]
  }

  private generatedHeader: HTMLElement | undefined
  private generatedTitle: HTMLElement | undefined
  private generatedDescription: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mResult = ""
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get status(): ResultStatus {
    return this.choiceAttribute("status", resultStatuses, "info")
  }

  public set status(value: ResultStatus) {
    this.setChoiceAttribute("status", value, resultStatuses)
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }

  public override set title(value: string) {
    this.setStringAttribute("title", value ?? null)
  }

  public get description(): string {
    return this.getAttribute("description") ?? ""
  }

  public set description(value: string) {
    this.setStringAttribute("description", value ?? null)
  }

  private region(name: string, except?: Element): HTMLElement | undefined {
    const selector = `:is(m-result-${name}, .m-result-${name}, [data-part="${name}"], [slot="${name}"])`
    return [...this.children].find((el): el is HTMLElement =>
      el instanceof HTMLElement &&
      el !== except &&
      !el.matches(inert) &&
      el.matches(selector),
    )
  }

  private synchronize(): void {
    this.observer?.disconnect()

    try {
      this.dataset.status = this.status
    } catch {
      // Invalid status attribute: preserve authored attribute without throwing in reaction
    }

    if (this.generatedHeader?.parentNode !== this) {
      this.generatedHeader = undefined
      this.generatedTitle = undefined
      this.generatedDescription = undefined
    }
    if (this.generatedContent?.parentNode !== this) {
      this.generatedContent = undefined
    }

    const icon = this.region("icon")
    let header = this.region("header", this.generatedHeader) ?? this.generatedHeader
    let content = this.region("content", this.generatedContent) ?? this.generatedContent
    const footer = this.region("footer")

    const titleText = this.title
    const descriptionText = this.description

    if (header && this.generatedHeader && header !== this.generatedHeader) {
      this.generatedHeader.remove()
      this.generatedHeader = undefined
      this.generatedTitle = undefined
      this.generatedDescription = undefined
    }

    if (!header && (titleText || descriptionText)) {
      this.generatedHeader = this.ownerDocument.createElement("m-result-header")
      this.generatedHeader.className = "m-result-header"
      header = this.generatedHeader
      if (icon && icon.parentElement === this) {
        icon.after(header)
      } else {
        this.prepend(header)
      }
    }

    const genHeader = this.generatedHeader
    if (genHeader && header === genHeader) {
      if (!titleText && !descriptionText) {
        genHeader.remove()
        this.generatedHeader = undefined
        this.generatedTitle = undefined
        this.generatedDescription = undefined
        header = undefined
      } else {
        if (titleText) {
          if (!this.generatedTitle) {
            this.generatedTitle = this.ownerDocument.createElement("div")
            this.generatedTitle.className = "m-result-title"
            this.generatedTitle.dataset.part = "title"
            genHeader.prepend(this.generatedTitle)
          }
          if (this.generatedTitle.textContent !== titleText) {
            this.generatedTitle.textContent = titleText
          }
        } else if (this.generatedTitle) {
          this.generatedTitle.remove()
          this.generatedTitle = undefined
        }

        if (descriptionText) {
          if (!this.generatedDescription) {
            this.generatedDescription = this.ownerDocument.createElement("div")
            this.generatedDescription.className = "m-result-description"
            this.generatedDescription.dataset.part = "description"
            genHeader.append(this.generatedDescription)
          }
          if (this.generatedDescription.textContent !== descriptionText) {
            this.generatedDescription.textContent = descriptionText
          }
        } else if (this.generatedDescription) {
          this.generatedDescription.remove()
          this.generatedDescription = undefined
        }
      }
    }

    const loose = [...this.childNodes].filter((node) => {
      if (node === icon || node === header || node === content || node === footer) return false
      if (node === this.generatedHeader || node === this.generatedContent) return false
      if (node.nodeType === Node.TEXT_NODE) return Boolean(node.textContent?.trim())
      return node instanceof HTMLElement && !node.matches(inert)
    })

    if (content && this.generatedContent && content !== this.generatedContent) {
      this.generatedContent.remove()
      this.generatedContent = undefined
    }

    if (loose.length) {
      if (!content) {
        this.generatedContent = this.ownerDocument.createElement("m-result-content")
        this.generatedContent.className = "m-result-content"
        content = this.generatedContent
        this.insertBefore(content, footer ?? null)
      }
      content.append(...loose)
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: false })
    }
  }
}

export { Result as MResult }
