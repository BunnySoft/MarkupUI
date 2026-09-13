import { ViewElement } from "../../core/index.js"
import { DEFAULT_BREADCRUMB_SEPARATOR } from "./model.js"
import type { Breadcrumb } from "./breadcrumb.js"

/**
 * An individual breadcrumb item.
 * @region {"name":"content","accepts":["phrasing","text","link"],"min":0,"max":null}
 */
export class BreadcrumbItem extends ViewElement {
  public static readonly tag = "m-breadcrumb-item"
  public static readonly observedAttributes = ["href", "separator"]

  private initialized = false
  private rendering = false
  private observer: MutationObserver | undefined
  private linkElement: HTMLElement | undefined
  private sepElement: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "item"
    if (!this.hasAttribute("role")) this.setAttribute("role", "listitem")
    this.observer ??= new MutationObserver(() => {
      if (!this.rendering) this.render()
    })
    this.render()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string): void {
    if (!this.initialized || !this.isConnected) return
    if (name === "href") {
      this.render()
    } else if (name === "separator") {
      this.updateSeparator()
    }
  }

  public get href(): string | undefined {
    const value = this.getAttribute("href")
    return value === null ? undefined : value
  }

  public set href(value: string | null | undefined) {
    if (value == null) {
      this.removeAttribute("href")
    } else {
      this.setAttribute("href", String(value))
    }
  }

  public get separator(): string | undefined {
    const value = this.getAttribute("separator")
    return value === null ? undefined : value
  }

  public set separator(value: string | null | undefined) {
    if (value == null) {
      this.removeAttribute("separator")
    } else {
      this.setAttribute("separator", String(value))
    }
  }

  public get link(): HTMLElement | null {
    return this.linkElement ?? null
  }

  public get separatorNode(): HTMLElement | null {
    return this.sepElement ?? null
  }

  public updateSeparator(): void {
    if (!this.sepElement) return
    if (this.sepElement.querySelector("svg") || this.sepElement.children.length > 0) return
    const effectiveSeparator = this.separator ?? this.closest<Breadcrumb>("m-breadcrumb")?.separator ?? DEFAULT_BREADCRUMB_SEPARATOR
    if (effectiveSeparator && effectiveSeparator !== "/") {
      this.sepElement.textContent = effectiveSeparator
    } else {
      this.sepElement.textContent = ""
    }
  }

  public render(): void {
    if (!this.isConnected || this.rendering) return
    this.rendering = true
    this.observer?.disconnect()

    try {
      const existingRow = this.querySelector(":scope > .m-breadcrumb-row")
      if (existingRow) {
        this.linkElement = (existingRow.querySelector(":scope > .m-breadcrumb-link") as HTMLElement) ?? undefined
        this.sepElement = (existingRow.querySelector(":scope > .m-breadcrumb-separator") as HTMLElement) ?? undefined
        this.updateSeparator()
        return
      }

      let sep = this.querySelector(":scope > .m-breadcrumb-separator") as HTMLElement | null
      if (!sep) {
        sep = this.ownerDocument.createElement("span")
        sep.className = "m-breadcrumb-separator"
        sep.dataset.part = "separator"
        sep.setAttribute("aria-hidden", "true")
        this.append(sep)
      }
      this.sepElement = sep

      let link = this.querySelector(":scope > :is(.m-breadcrumb-link, a, span:not(.m-breadcrumb-separator))") as HTMLElement | null
      const href = this.href

      if (!link) {
        const contentNodes = [...this.childNodes].filter(node => node !== sep)
        const targetTag = href !== undefined ? "a" : "span"
        link = this.ownerDocument.createElement(targetTag)
        link.className = "m-breadcrumb-link"
        link.dataset.part = "link"
        if (href !== undefined) {
          link.setAttribute("href", href)
        }
        for (const node of contentNodes) {
          link.append(node)
        }
        this.insertBefore(link, sep)
      } else {
        if (href !== undefined) {
          if (link.tagName.toLowerCase() === "a") {
            link.setAttribute("href", href)
          } else if (link.tagName.toLowerCase() === "span") {
            const a = this.ownerDocument.createElement("a")
            a.className = link.className
            a.dataset.part = "link"
            a.setAttribute("href", href)
            while (link.firstChild) a.append(link.firstChild)
            link.replaceWith(a)
            link = a
          }
        } else {
          if (link.tagName.toLowerCase() === "a") {
            link.removeAttribute("href")
          }
        }
        if (!link.classList.contains("m-breadcrumb-link")) {
          link.classList.add("m-breadcrumb-link")
        }
        link.dataset.part = "link"
      }
      this.linkElement = link

      const current = this.getAttribute("aria-current")
      if (current !== null) {
        link.setAttribute("aria-current", current)
      }

      this.updateSeparator()
    } finally {
      this.rendering = false
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true })
      }
    }
  }
}
