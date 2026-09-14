import { ViewElement } from "../../core/index.js"
import { timelineItemTypes } from "./model.js"
import type { TimelineItemType } from "./model.js"

const inert = "template,script,style"

/**
 * An individual milestone or event item within a timeline.
 * @region {"name":"content","accepts":["text","content","phrasing"],"min":0,"max":null}
 */
export class TimelineItem extends ViewElement {
  public static readonly tag = "m-timeline-item"
  public static readonly observedAttributes = ["title", "content", "time", "type"]

  private generatedMarker: HTMLElement | undefined
  private generatedBody: HTMLElement | undefined
  private generatedTitle: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private generatedFooter: HTMLElement | undefined
  private generatedTime: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private initialized = false
  private rendering = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "item"
    this.classList.add("m-timeline-item")
    if (!this.hasAttribute("role")) this.setAttribute("role", "listitem")
    this.observer ??= new MutationObserver(() => {
      if (!this.rendering) this.synchronize()
    })
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string): void {
    if (this.initialized && this.isConnected && TimelineItem.observedAttributes.includes(name)) {
      this.synchronize()
    }
  }

  /**
   * Title text for the timeline item.
   */
  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  /**
   * Main content or description text for the timeline item.
   */
  public get content(): string {
    return this.getAttribute("content") ?? ""
  }
  public set content(value: string) {
    this.setStringAttribute("content", value)
  }

  /**
   * Time or date string for the timeline item.
   */
  public get time(): string {
    return this.getAttribute("time") ?? ""
  }
  public set time(value: string) {
    this.setStringAttribute("time", value)
  }

  /**
   * Type / status variant of the timeline item.
   */
  public get type(): TimelineItemType {
    return this.choiceAttribute("type", timelineItemTypes, "default")
  }
  public set type(value: TimelineItemType) {
    this.setChoiceAttribute("type", value, timelineItemTypes)
  }

  public synchronize(): void {
    if (!this.isConnected || this.rendering) return
    this.rendering = true
    this.observer?.disconnect()

    try {
      try {
        const currentType = this.type
        if (currentType !== "default") {
          this.setAttribute("data-type", currentType)
        } else {
          this.removeAttribute("data-type")
        }
      } catch {
        // Leave existing data-type if type attribute was set to invalid value
      }

      // Check for authored marker
      const authoredMarker = Array.from(this.children).find((child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== this.generatedMarker &&
        !child.matches(inert) &&
        (child.classList.contains("m-timeline-marker") || child.dataset.part === "marker" || child.getAttribute("slot") === "marker")
      )

      if (authoredMarker) {
        this.generatedMarker?.remove()
        this.generatedMarker = undefined
      } else {
        if (!this.generatedMarker) {
          this.generatedMarker = this.ownerDocument.createElement("span")
          this.generatedMarker.className = "m-timeline-marker"
          this.generatedMarker.dataset.part = "marker"
          this.generatedMarker.setAttribute("aria-hidden", "true")
          this.prepend(this.generatedMarker)
        } else if (this.generatedMarker.parentElement !== this) {
          this.prepend(this.generatedMarker)
        }
      }

      const activeMarker = authoredMarker ?? this.generatedMarker

      // Check for authored body
      const authoredBody = Array.from(this.children).find((child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== this.generatedBody &&
        child !== activeMarker &&
        !child.matches(inert) &&
        (child.classList.contains("m-timeline-body") || child.dataset.part === "body")
      )

      if (authoredBody) {
        if (this.generatedBody && this.generatedBody !== authoredBody) {
          this.generatedBody.remove()
          this.generatedBody = undefined
          this.generatedTitle = undefined
          this.generatedContent = undefined
          this.generatedFooter = undefined
          this.generatedTime = undefined
        }
      } else {
        if (!this.generatedBody) {
          this.generatedBody = this.ownerDocument.createElement("div")
          this.generatedBody.className = "m-timeline-body"
          this.generatedBody.dataset.part = "body"
          this.append(this.generatedBody)
        } else if (this.generatedBody.parentElement !== this) {
          this.append(this.generatedBody)
        }
      }

      const targetBody = authoredBody ?? this.generatedBody!

      // Title
      const titleText = this.title
      const authoredTitle = Array.from(targetBody.children).find((child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== this.generatedTitle &&
        !child.matches(inert) &&
        (child.classList.contains("m-timeline-title") || child.dataset.part === "title" || /^h[1-6]$/i.test(child.localName))
      )

      if (authoredTitle) {
        this.generatedTitle?.remove()
        this.generatedTitle = undefined
      } else if (titleText) {
        if (!this.generatedTitle) {
          this.generatedTitle = this.ownerDocument.createElement("div")
          this.generatedTitle.className = "m-timeline-title"
          this.generatedTitle.dataset.part = "title"
          targetBody.prepend(this.generatedTitle)
        }
        if (this.generatedTitle.textContent !== titleText) {
          this.generatedTitle.textContent = titleText
        }
        if (this.generatedTitle.parentElement !== targetBody) {
          targetBody.prepend(this.generatedTitle)
        }
      } else {
        this.generatedTitle?.remove()
        this.generatedTitle = undefined
      }

      // Content
      const contentText = this.content
      const authoredContent = Array.from(targetBody.children).find((child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== this.generatedContent &&
        child !== this.generatedTitle &&
        child !== authoredTitle &&
        !child.matches(inert) &&
        (child.classList.contains("m-timeline-content") || child.dataset.part === "content")
      )

      if (authoredContent) {
        this.generatedContent?.remove()
        this.generatedContent = undefined
      } else if (contentText) {
        if (!this.generatedContent) {
          this.generatedContent = this.ownerDocument.createElement("div")
          this.generatedContent.className = "m-timeline-content"
          this.generatedContent.dataset.part = "content"
          if (this.generatedTitle && this.generatedTitle.parentElement === targetBody) {
            this.generatedTitle.after(this.generatedContent)
          } else if (authoredTitle && authoredTitle.parentElement === targetBody) {
            authoredTitle.after(this.generatedContent)
          } else {
            targetBody.prepend(this.generatedContent)
          }
        }
        if (this.generatedContent.textContent !== contentText) {
          this.generatedContent.textContent = contentText
        }
      } else {
        this.generatedContent?.remove()
        this.generatedContent = undefined
      }

      // Time / Footer
      const timeText = this.time
      const authoredFooter = Array.from(targetBody.children).find((child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child !== this.generatedFooter &&
        !child.matches(inert) &&
        (child.classList.contains("m-timeline-footer") || child.classList.contains("m-timeline-time") || child.dataset.part === "footer" || child.dataset.part === "time" || child.localName === "time")
      )

      if (authoredFooter) {
        this.generatedFooter?.remove()
        this.generatedFooter = undefined
        this.generatedTime = undefined
      } else if (timeText) {
        if (!this.generatedFooter) {
          this.generatedFooter = this.ownerDocument.createElement("div")
          this.generatedFooter.className = "m-timeline-footer"
          this.generatedFooter.dataset.part = "footer"
          this.generatedTime = this.ownerDocument.createElement("time")
          this.generatedTime.className = "m-timeline-time"
          this.generatedFooter.append(this.generatedTime)
          targetBody.append(this.generatedFooter)
        }
        if (this.generatedTime && this.generatedTime.textContent !== timeText) {
          this.generatedTime.textContent = timeText
        }
        if (this.generatedFooter.parentElement !== targetBody) {
          targetBody.append(this.generatedFooter)
        }
      } else {
        this.generatedFooter?.remove()
        this.generatedFooter = undefined
        this.generatedTime = undefined
      }

      // Relocate loose child nodes of `this` into targetBody (if targetBody is generated)
      if (targetBody === this.generatedBody) {
        const looseNodes = Array.from(this.childNodes).filter(node =>
          node !== activeMarker &&
          node !== this.generatedBody &&
          !(node instanceof Element && node.matches(inert))
        )
        for (const node of looseNodes) {
          if (this.generatedFooter && this.generatedFooter.parentElement === targetBody) {
            targetBody.insertBefore(node, this.generatedFooter)
          } else {
            targetBody.append(node)
          }
        }
      }
    } finally {
      this.rendering = false
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: true, characterData: true, attributes: false })
      }
    }
  }
}

export { TimelineItem as MTimelineItem }
