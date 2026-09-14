import { ViewElement } from "../../core/index.js"
import type { PageHeaderBackDetail } from "./model.js"

export type { PageHeaderBackDetail } from "./model.js"

const inert = "template,script,style"

/**
 * A page header for titles, navigation, breadcrumbs, actions, and page-level metadata.
 * @region {"name":"header","accepts":["breadcrumb","navigation","content"],"min":0,"max":1}
 * @region {"name":"back","accepts":["button","link","action"],"min":0,"max":1}
 * @region {"name":"avatar","accepts":["avatar","image","icon"],"min":0,"max":1}
 * @region {"name":"title","accepts":["heading","text"],"min":0,"max":1}
 * @region {"name":"subtitle","accepts":["text","phrasing"],"min":0,"max":1}
 * @region {"name":"extra","accepts":["actions","controls"],"min":0,"max":1}
 * @region {"name":"content","accepts":["content","controls"],"min":0,"max":1}
 * @region {"name":"footer","accepts":["content","controls"],"min":0,"max":1}
 * @event {"name":"Back","web":"m:back","bubbles":true,"cancelable":true,"composed":false,"detail":{"originalEvent":"MouseEvent"}}
 */
export class PageHeader extends ViewElement {
  public static readonly tag = "m-page-header"
  public static get observedAttributes(): string[] {
    return ["title", "subtitle", "extra"]
  }

  private generatedMain: HTMLElement | undefined
  private generatedLead: HTMLElement | undefined
  private generatedTitles: HTMLElement | undefined
  private generatedTitle: HTMLSpanElement | undefined
  private generatedSubtitle: HTMLSpanElement | undefined
  private generatedExtra: HTMLElement | undefined
  private generatedContent: HTMLElement | undefined
  private observer: MutationObserver | undefined
  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mPageHeader = ""
    this.addEventListener("click", this.onBackClick)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
    this.removeEventListener("click", this.onBackClick)
  }

  public attributeChangedCallback(): void {
    if (this.isConnected) this.synchronize()
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }

  public override set title(value: string | undefined | null) {
    this.setStringAttribute("title", value ?? null)
  }

  public get subtitle(): string | null {
    return this.getAttribute("subtitle")
  }

  public set subtitle(value: string | null | undefined) {
    this.setStringAttribute("subtitle", value ?? null)
  }

  public get extra(): string | null {
    return this.getAttribute("extra")
  }

  public set extra(value: string | null | undefined) {
    this.setStringAttribute("extra", value ?? null)
  }

  private region(name: string, except?: Element): HTMLElement | undefined {
    const selector = `:is(.m-page-header-${name}, [data-part="${name}"], [data-m-page-header-${name}], [slot="${name}"])`
    const found = [...this.querySelectorAll(selector)].filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        el !== except &&
        !el.matches(inert) &&
        this.contains(el),
    )
    return found[0]
  }

  private readonly onBackClick = (event: MouseEvent): void => {
    const backTarget = (event.target as Element | null)?.closest?.(
      ".m-page-header-back, [data-part='back'], [data-m-page-header-back], [slot='back']",
    )
    if (!backTarget || !this.contains(backTarget)) return
    if (backTarget.matches(":disabled")) return
    this.emit<PageHeaderBackDetail>(
      "m:back",
      { originalEvent: event },
      { cancelable: true },
    )
  }

  private synchronize(): void {
    this.observer?.disconnect()

    if (this.generatedMain && this.generatedMain.parentElement !== this) {
      this.generatedMain = undefined
    }
    if (this.generatedContent && this.generatedContent.parentElement !== this) {
      this.generatedContent = undefined
    }

    const header = this.region("header")
    if (header && header.parentElement === this && this.firstElementChild !== header) {
      this.prepend(header)
    }

    let main = (this.querySelector(
      ":scope > :is(.m-page-header-main, [data-part='main'])",
    ) as HTMLElement | null) ?? this.generatedMain

    const authoredBack = this.region("back")
    const authoredAvatar = this.region("avatar")
    const authoredTitle = this.region("title", this.generatedTitle)
    const authoredSubtitle = this.region("subtitle", this.generatedSubtitle)
    const authoredExtra = this.region("extra", this.generatedExtra)

    const hasTitle = Boolean(authoredTitle || this.title)
    const hasSubtitle = Boolean(authoredSubtitle || this.subtitle)
    const hasTitles = hasTitle || hasSubtitle
    const hasLead = Boolean(authoredBack || authoredAvatar || hasTitles)
    const hasMain = Boolean(hasLead || authoredExtra || this.extra)

    if (hasMain && !main) {
      main = this.ownerDocument.createElement("div")
      main.className = "m-page-header-main"
      main.dataset.part = "main"
      this.generatedMain = main
      if (header && header.parentElement === this) {
        header.after(main)
      } else {
        this.prepend(main)
      }
    }

    if (main) {
      let lead = (main.querySelector(
        ":scope > :is(.m-page-header-lead, [data-part='lead'])",
      ) as HTMLElement | null) ?? this.generatedLead

      if (hasLead && !lead) {
        lead = this.ownerDocument.createElement("div")
        lead.className = "m-page-header-lead"
        lead.dataset.part = "lead"
        this.generatedLead = lead
        main.prepend(lead)
      }

      if (lead) {
        if (authoredBack && authoredBack.parentElement !== lead) {
          lead.prepend(authoredBack)
        }

        if (authoredAvatar && authoredAvatar.parentElement !== lead) {
          if (authoredBack && authoredBack.parentElement === lead) {
            authoredBack.after(authoredAvatar)
          } else {
            lead.prepend(authoredAvatar)
          }
        }

        let titles = (lead.querySelector(
          ":scope > :is(.m-page-header-titles, [data-part='titles'])",
        ) as HTMLElement | null) ?? this.generatedTitles

        if (hasTitles && !titles) {
          titles = this.ownerDocument.createElement("div")
          titles.className = "m-page-header-titles"
          titles.dataset.part = "titles"
          this.generatedTitles = titles
          lead.append(titles)
        }

        if (titles) {
          if (authoredTitle) {
            this.generatedTitle?.remove()
            this.generatedTitle = undefined
            if (authoredTitle.parentElement !== titles) {
              titles.prepend(authoredTitle)
            }
          } else if (this.title) {
            if (!this.generatedTitle) {
              this.generatedTitle = this.ownerDocument.createElement("span")
              this.generatedTitle.className = "m-page-header-title"
              this.generatedTitle.dataset.part = "title"
            }
            if (this.generatedTitle.textContent !== this.title) {
              this.generatedTitle.textContent = this.title
            }
            if (this.generatedTitle.parentElement !== titles) {
              titles.prepend(this.generatedTitle)
            }
          } else {
            this.generatedTitle?.remove()
            this.generatedTitle = undefined
          }

          if (authoredSubtitle) {
            this.generatedSubtitle?.remove()
            this.generatedSubtitle = undefined
            if (authoredSubtitle.parentElement !== titles) {
              titles.append(authoredSubtitle)
            }
          } else if (this.subtitle) {
            if (!this.generatedSubtitle) {
              this.generatedSubtitle = this.ownerDocument.createElement("span")
              this.generatedSubtitle.className = "m-page-header-subtitle"
              this.generatedSubtitle.dataset.part = "subtitle"
            }
            if (this.generatedSubtitle.textContent !== this.subtitle) {
              this.generatedSubtitle.textContent = this.subtitle
            }
            if (this.generatedSubtitle.parentElement !== titles) {
              titles.append(this.generatedSubtitle)
            }
          } else {
            this.generatedSubtitle?.remove()
            this.generatedSubtitle = undefined
          }

          if (this.generatedTitles && !this.generatedTitles.hasChildNodes()) {
            this.generatedTitles.remove()
            this.generatedTitles = undefined
          }
        }

        if (this.generatedLead && !this.generatedLead.hasChildNodes()) {
          this.generatedLead.remove()
          this.generatedLead = undefined
        }
      }

      if (authoredExtra) {
        this.generatedExtra?.remove()
        this.generatedExtra = undefined
        if (authoredExtra.parentElement !== main) {
          main.append(authoredExtra)
        }
      } else if (this.extra) {
        if (!this.generatedExtra) {
          this.generatedExtra = this.ownerDocument.createElement("div")
          this.generatedExtra.className = "m-page-header-extra"
          this.generatedExtra.dataset.part = "extra"
        }
        if (this.generatedExtra.textContent !== this.extra) {
          this.generatedExtra.textContent = this.extra
        }
        if (this.generatedExtra.parentElement !== main) {
          main.append(this.generatedExtra)
        }
      } else {
        this.generatedExtra?.remove()
        this.generatedExtra = undefined
      }

      if (this.generatedMain && !this.generatedMain.hasChildNodes()) {
        this.generatedMain.remove()
        this.generatedMain = undefined
      }
    }

    const content = this.region("content", this.generatedContent) ?? this.generatedContent
    if (content && this.generatedContent && content !== this.generatedContent) {
      content.prepend(...this.generatedContent.childNodes)
      this.generatedContent.remove()
      this.generatedContent = undefined
    }

    const footer = this.region("footer")

    const loose = [...this.childNodes].filter(
      (node) => {
        if (
          node === header ||
          node === main ||
          node === content ||
          node === this.generatedContent ||
          node === footer
        ) {
          return false
        }
        if (node.nodeType === Node.TEXT_NODE) {
          return Boolean(node.textContent?.trim())
        }
        if (node instanceof Element) {
          return !node.matches(inert)
        }
        return false
      },
    )

    if (loose.length) {
      let targetContent = content
      if (!targetContent) {
        this.generatedContent = this.ownerDocument.createElement("div")
        this.generatedContent.className = "m-page-header-content"
        this.generatedContent.dataset.part = "content"
        targetContent = this.generatedContent
        this.insertBefore(targetContent, footer ?? null)
      }
      targetContent.append(...loose)
    }

    if (this.generatedContent && !this.generatedContent.hasChildNodes()) {
      this.generatedContent.remove()
      this.generatedContent = undefined
    }

    if (footer && footer.parentElement === this && this.lastElementChild !== footer) {
      this.append(footer)
    }

    if (this.isConnected) {
      this.observer?.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    }
  }
}

export { PageHeader as MPageHeader }
