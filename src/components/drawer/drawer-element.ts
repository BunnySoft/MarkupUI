import { ViewElement } from "../../core/index.js"
import { drawerPlacements } from "./model.js"
import type { DrawerCloseDetail, DrawerPlacement } from "./model.js"
import { DrawerBody, DrawerContent, DrawerFooter, DrawerHeader } from "./regions.js"

export type { DrawerCloseDetail, DrawerPlacement } from "./model.js"

const inert = "template,script,style"

/**
 * A panel that slides in from the edge of the screen.
 * @region {"name":"content","element":"m-drawer-content","accepts":["regions","content"],"min":0,"max":1}
 * @region {"name":"header","element":"m-drawer-header","accepts":["heading","content","actions"],"min":0,"max":1}
 * @region {"name":"body","element":"m-drawer-body","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","element":"m-drawer-footer","accepts":["actions","controls"],"min":0,"max":1}
 * @event {"name":"Close","web":"m:close","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 */
export class Drawer extends ViewElement {
  public static readonly tag = "m-drawer"
  public static get observedAttributes(): string[] {
    return ["open", "placement", "title", "closable", "mask-closable", "width", "height"]
  }

  private generatedContent: DrawerContent | undefined
  private generatedHeader: DrawerHeader | undefined
  private generatedTitle: HTMLSpanElement | undefined
  private generatedBody: DrawerBody | undefined
  private closeButton: HTMLButtonElement | undefined
  private maskElement: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "drawer"
    this.dataset.mDrawer = ""
    this.addEventListener("keydown", this.onKeyDown)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.removeEventListener("keydown", this.onKeyDown)
    this.closeButton?.removeEventListener("click", this.onCloseClick)
    this.maskElement?.removeEventListener("click", this.onMaskClick)
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public get open(): boolean {
    return this.hasAttribute("open")
  }
  public set open(value: boolean) {
    this.setBooleanAttribute("open", value)
  }

  public get placement(): DrawerPlacement {
    return this.choiceAttribute("placement", drawerPlacements, "right")
  }
  public set placement(value: DrawerPlacement) {
    this.setChoiceAttribute("placement", value, drawerPlacements)
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

  public show(): void {
    this.open = true
  }

  public close(value = ""): void {
    if (!this.open) return
    this.open = false
    this.emit<DrawerCloseDetail>("m:close", { value }, { bubbles: true, cancelable: false, composed: false })
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault()
      this.close("escape")
    }
  }

  private readonly onMaskClick = (event: MouseEvent): void => {
    if (!this.maskClosable || event.target !== this.maskElement) return
    this.close("mask")
  }

  private readonly onCloseClick = (event: MouseEvent): void => {
    event.stopPropagation()
    this.close("close")
  }

  private synchronize(): void {
    this.observer?.disconnect()

    if (this.open) {
      this.removeAttribute("hidden")
      if (!this.maskElement) {
        this.maskElement = this.ownerDocument.createElement("div")
        this.maskElement.className = "m-drawer__mask"
        this.maskElement.dataset.part = "mask"
        this.maskElement.addEventListener("click", this.onMaskClick)
      }
      if (this.maskElement.parentNode !== this) {
        this.prepend(this.maskElement)
      }
    } else {
      this.setAttribute("hidden", "")
      this.maskElement?.remove()
      this.maskElement = undefined
    }

    this.dataset.drawerPlacement = this.placement

    if (this.generatedContent?.parentNode !== this) this.generatedContent = undefined
    let content = [...this.children].find((el): el is DrawerContent =>
      el instanceof DrawerContent && el !== this.maskElement
    ) ?? this.generatedContent

    if (!content) {
      content = this.ownerDocument.createElement("m-drawer-content") as DrawerContent
      this.generatedContent = content
      this.append(content)
    }

    content.dataset.part = "content"
    content.dataset.drawerPlacement = this.placement
    if (!content.classList.contains("m-drawer-content")) {
      content.classList.add("m-drawer-content")
    }

    if (this.width) {
      content.style.width = this.width
      this.style.setProperty("--m-drawer-width", this.width)
    } else {
      content.style.removeProperty("width")
      this.style.removeProperty("--m-drawer-width")
    }

    if (this.height) {
      content.style.height = this.height
      this.style.setProperty("--m-drawer-height", this.height)
    } else {
      content.style.removeProperty("height")
      this.style.removeProperty("--m-drawer-height")
    }

    // Move any direct regions (header, body, footer) from host into content
    const directRegions = [...this.children].filter(
      child => child !== this.maskElement && child !== content &&
        (child instanceof DrawerHeader || child instanceof DrawerBody || child instanceof DrawerFooter ||
         child.localName === "m-drawer-header" || child.localName === "m-drawer-body" || child.localName === "m-drawer-footer")
    )
    for (const region of directRegions) {
      content.append(region)
    }

    // Handle header inside content
    if (this.generatedHeader?.parentNode !== content) this.generatedHeader = undefined
    let header = [...content.children].find((el): el is DrawerHeader =>
      el instanceof DrawerHeader || el.localName === "m-drawer-header"
    ) ?? this.generatedHeader

    if (!header && (this.title || this.closable)) {
      header = this.ownerDocument.createElement("m-drawer-header") as DrawerHeader
      this.generatedHeader = header
      content.prepend(header)
    }

    if (header) {
      header.dataset.part = "header"
      header.setAttribute("data-drawer-header", "")

      if (this.title) {
        if (!this.generatedTitle) {
          this.generatedTitle = this.ownerDocument.createElement("span")
          this.generatedTitle.dataset.part = "title"
          this.generatedTitle.setAttribute("data-drawer-title", "")
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
          this.closeButton.dataset.part = "close"
          this.closeButton.className = "m-drawer__close"
          this.closeButton.setAttribute("aria-label", "Close")
          const icon = this.ownerDocument.createElement("span")
          icon.setAttribute("aria-hidden", "true")
          icon.textContent = "×"
          this.closeButton.append(icon)
          this.closeButton.addEventListener("click", this.onCloseClick)
        }
        if (this.closeButton.parentNode !== header) {
          header.append(this.closeButton)
        }
      } else {
        this.closeButton?.removeEventListener("click", this.onCloseClick)
        this.closeButton?.remove()
        this.closeButton = undefined
      }

      if (header === this.generatedHeader && !this.title && !this.closable) {
        this.generatedHeader.remove()
        this.generatedHeader = undefined
      }
    }

    // Handle body inside content
    if (this.generatedBody?.parentNode !== content) this.generatedBody = undefined
    let body = [...content.children].find((el): el is DrawerBody =>
      el instanceof DrawerBody || el.localName === "m-drawer-body"
    ) ?? this.generatedBody

    // Gather loose nodes from host (excluding mask and content) and from content (excluding header, body, footer)
    const looseInHost = [...this.childNodes].filter(node =>
      node !== this.maskElement && node !== content &&
      (node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && !node.matches(`m-drawer-content,m-drawer-header,m-drawer-body,m-drawer-footer,${inert}`))
    )
    const looseInContent = [...content.childNodes].filter(node =>
      node !== header && node !== body &&
      !(node instanceof Element && (node instanceof DrawerFooter || node.localName === "m-drawer-footer")) &&
      (node.nodeType === Node.TEXT_NODE ? Boolean(node.textContent?.trim())
        : node instanceof Element && !node.matches(`m-drawer-header,m-drawer-body,m-drawer-footer,${inert}`))
    )
    const loose = [...looseInHost, ...looseInContent]

    if (loose.length) {
      if (!body) {
        body = this.ownerDocument.createElement("m-drawer-body") as DrawerBody
        this.generatedBody = body
        const footer = [...content.children].find(el => el instanceof DrawerFooter || el.localName === "m-drawer-footer")
        if (footer) content.insertBefore(body, footer)
        else content.append(body)
      }
      body.append(...loose)
    }

    if (body) {
      body.dataset.part = "body"
      body.setAttribute("data-drawer-body", "")
    }

    // Footer attributes
    const footer = [...content.children].find(el => el instanceof DrawerFooter || el.localName === "m-drawer-footer")
    if (footer instanceof HTMLElement) {
      footer.dataset.part = "footer"
      footer.setAttribute("data-drawer-footer", "")
    }

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: true, characterData: true })
    }
  }
}
