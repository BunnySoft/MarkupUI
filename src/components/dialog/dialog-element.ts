import { ViewElement } from "../../core/index.js"

export const dialogTypes = ["default", "info", "success", "warning", "error"] as const
export type DialogType = (typeof dialogTypes)[number]

const regionSelector = "m-dialog-header,m-dialog-body,m-dialog-footer,m-dialog-action"
const inertSelector = "template,script,style"

/**
 * A dialog window or panel for user prompts and decisions.
 * @region {"name":"header","element":"m-dialog-header","accepts":["heading","content"],"min":0,"max":1}
 * @region {"name":"body","element":"m-dialog-body","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","element":"m-dialog-footer","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"action","element":"m-dialog-action","accepts":["actions"],"min":0,"max":1}
 * @event {"name":"Close","web":"m:close","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Cancel","web":"m:cancel","bubbles":true,"cancelable":true,"composed":false,"detail":{"value":"string"}}
 */
export class Dialog extends ViewElement {
  public static readonly tag = "m-dialog"
  public static get observedAttributes(): string[] {
    return ["open", "title", "closable", "mask-closable", "type"]
  }

  private generatedHeader: HTMLElement | undefined
  private generatedTitle: HTMLElement | undefined
  private generatedBody: HTMLElement | undefined
  private closeButton: HTMLButtonElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-dialog")
    this.dataset.part = "dialog"
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "dialog")
    }
    if (!this.hasAttribute("aria-modal")) {
      this.setAttribute("aria-modal", "true")
    }
    this.addEventListener("click", this.handleClick)
    this.ownerDocument.addEventListener("keydown", this.handleKeyDown)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.removeEventListener("click", this.handleClick)
    this.ownerDocument.removeEventListener("keydown", this.handleKeyDown)
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.isConnected) {
      this.synchronize()
    }
  }

  public get open(): boolean {
    return this.hasAttribute("open")
  }
  public set open(value: boolean) {
    this.setBooleanAttribute("open", value)
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setStringAttribute("title", value)
  }

  public get closable(): boolean {
    return this.hasAttribute("closable")
  }
  public set closable(value: boolean) {
    this.setBooleanAttribute("closable", value)
  }

  public get maskClosable(): boolean {
    return this.booleanAttribute("mask-closable", true)
  }
  public set maskClosable(value: boolean) {
    this.setBooleanAttribute("mask-closable", value, false)
  }

  public get type(): DialogType {
    return this.choiceAttribute("type", dialogTypes, "default")
  }
  public set type(value: DialogType) {
    this.setChoiceAttribute("type", value, dialogTypes)
  }

  public showModal(): void {
    this.open = true
  }

  public close(result?: string): void {
    if (!this.open) return
    this.open = false
    this.emit<{ value: string }>("m:close", { value: result ?? "" }, { bubbles: true, cancelable: false, composed: false })
  }

  private region(name: string, except?: HTMLElement): HTMLElement | undefined {
    return [...this.children].find((element): element is HTMLElement =>
      element instanceof HTMLElement && element !== except && element.localName === `m-dialog-${name}`)
  }

  private synchronize(): void {
    this.observer?.disconnect()

    this.hidden = !this.open
    this.dataset.dialogType = this.type

    if (this.generatedHeader?.parentNode !== this) this.generatedHeader = undefined
    if (this.generatedBody?.parentNode !== this) this.generatedBody = undefined

    let header = this.region("header", this.generatedHeader) ?? this.generatedHeader
    if (!header && (this.title || this.closable)) {
      header = this.ownerDocument.createElement("div")
      header.setAttribute("data-dialog-header", "")
      header.dataset.part = "header"
      this.generatedHeader = header
      this.prepend(header)
    }

    if (header && this.generatedHeader && header !== this.generatedHeader) {
      this.generatedTitle?.remove()
      header.append(...this.generatedHeader.childNodes)
      this.generatedHeader.remove()
      this.generatedHeader = undefined
    }

    if (header) {
      header.setAttribute("data-dialog-header", "")
      if (this.title) {
        if (!this.generatedTitle) {
          const titleEl = this.ownerDocument.createElement("h2")
          titleEl.setAttribute("data-dialog-title", "")
          titleEl.dataset.part = "title"
          this.generatedTitle = titleEl
        }
        if (this.generatedTitle.textContent !== this.title) {
          this.generatedTitle.textContent = this.title
        }
        if (this.generatedTitle.parentNode !== header) {
          header.prepend(this.generatedTitle)
        }
      } else {
        this.generatedTitle?.remove()
        this.generatedTitle = undefined
      }

      if (this.closable) {
        if (!this.closeButton) {
          this.closeButton = this.ownerDocument.createElement("button")
          this.closeButton.type = "button"
          this.closeButton.setAttribute("data-dialog-action", "close")
          this.closeButton.dataset.part = "close"
          this.closeButton.setAttribute("aria-label", "Close")
          this.closeButton.textContent = "×"
        }
        if (this.closeButton.parentNode !== header) {
          header.append(this.closeButton)
        }
      } else {
        this.closeButton?.remove()
        this.closeButton = undefined
      }

      if (this.generatedHeader && ![...this.generatedHeader.childNodes].some(node =>
        node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim()))) {
        this.generatedHeader.remove()
        this.generatedHeader = undefined
      }
    }

    let body = this.region("body", this.generatedBody) ?? this.generatedBody
    if (body && this.generatedBody && body !== this.generatedBody) {
      body.prepend(...this.generatedBody.childNodes)
      this.generatedBody.remove()
      this.generatedBody = undefined
    }

    const loose = [...this.childNodes].filter(node =>
      node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && node !== this.generatedHeader && node !== this.generatedBody
          && !node.matches(`${regionSelector},${inertSelector}`))
    if (loose.length) {
      if (!body) {
        body = this.ownerDocument.createElement("div")
        body.setAttribute("data-dialog-content", "")
        body.dataset.part = "body"
        this.generatedBody = body
        const footer = this.region("footer") ?? this.region("action")
        if (footer) this.insertBefore(body, footer)
        else this.append(body)
      }
      body.append(...loose)
    }

    const footer = this.region("footer")
    if (footer) {
      footer.setAttribute("data-dialog-actions", "")
    }

    const action = this.region("action")
    if (action) {
      action.dataset.part = "action"
    }

    if (this.isConnected) {
      this.observer?.observe(this, {
        childList: true, subtree: true, characterData: true,
      })
    }
  }

  private readonly handleClick = (event: MouseEvent): void => {
    const target = event.target as Element | null
    const closeBtn = target?.closest<HTMLElement>("[data-dialog-action='close'], [data-part='close']")
    if (closeBtn && this.contains(closeBtn)) {
      if (!this.closable) return
      const cancelled = !this.emit<{ value: string }>("m:cancel", { value: "close" }, { bubbles: true, cancelable: true, composed: false })
      if (!cancelled) {
        this.close("close")
      }
      return
    }

    if (event.target === this && this.maskClosable) {
      const cancelled = !this.emit<{ value: string }>("m:cancel", { value: "mask" }, { bubbles: true, cancelable: true, composed: false })
      if (!cancelled) {
        this.close("mask")
      }
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault()
      const cancelled = !this.emit<{ value: string }>("m:cancel", { value: "escape" }, { bubbles: true, cancelable: true, composed: false })
      if (!cancelled) {
        this.close("escape")
      }
    }
  }
}
