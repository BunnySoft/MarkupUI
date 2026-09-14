import { ViewElement } from "../../core/index.js"
import { tabsPlacements, tabsTypes, tabsSizes, tabsActivations } from "./model.js"
import type { TabsPlacement, TabsType, TabsSize, TabsActivation } from "./model.js"
import { Tab } from "./pane.js"

/**
 * A tabbed navigation and content container managing active panels and keyboard interaction.
 * @region {"name":"panes","accepts":["Tab","TabPane"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string","previous":"string"}}
 */
export class Tabs extends ViewElement {
  public static readonly tag = "m-tabs"
  public static get observedAttributes(): string[] {
    return ["value", "placement", "type", "size", "activation", "animated"]
  }

  private upgraded = false
  private observer: MutationObserver | undefined
  private tabBar: HTMLElement | undefined
  private tabList: HTMLElement | undefined
  private selectedIndex = 0

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.mTabs = ""
    this.classList.add("m-tabs")
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    if (name === "value") {
      const panes = this.panes
      const currentPane = panes[this.selectedIndex]
      const currentValue = currentPane ? ((currentPane as Tab).name || currentPane.getAttribute("name") || currentPane.getAttribute("title")) : null
      if (newValue !== currentValue && newValue !== null) {
        this.select(newValue)
      }
    } else {
      this.synchronize()
    }
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }
  public set value(val: string | null) {
    this.setStringAttribute("value", val)
  }

  public get placement(): TabsPlacement {
    return this.choiceAttribute("placement", tabsPlacements, "top")
  }
  public set placement(val: TabsPlacement) {
    this.setChoiceAttribute("placement", val, tabsPlacements)
  }

  public get type(): TabsType {
    return this.choiceAttribute("type", tabsTypes, "line")
  }
  public set type(val: TabsType) {
    this.setChoiceAttribute("type", val, tabsTypes)
  }

  public get size(): TabsSize {
    return this.choiceAttribute("size", tabsSizes, "medium")
  }
  public set size(val: TabsSize) {
    this.setChoiceAttribute("size", val, tabsSizes)
  }

  public get activation(): TabsActivation {
    return this.choiceAttribute("activation", tabsActivations, "automatic")
  }
  public set activation(val: TabsActivation) {
    this.setChoiceAttribute("activation", val, tabsActivations)
  }

  public get animated(): boolean {
    return this.hasAttribute("animated")
  }
  public set animated(val: boolean) {
    this.setBooleanAttribute("animated", val)
  }

  public get panes(): readonly Tab[] {
    return Object.freeze(
      [...this.querySelectorAll<Tab>(":scope > m-tab, :scope > m-tab-pane, :scope > [data-part='tab-pane']")]
    )
  }

  public select(target: number | string): void {
    const panes = this.panes
    if (panes.length === 0) return

    let nextIndex = -1
    if (typeof target === "number") {
      nextIndex = Math.max(0, Math.min(target, panes.length - 1))
    } else {
      nextIndex = panes.findIndex(p => (p as Tab).name === target || p.getAttribute("name") === target || p.getAttribute("data-tabs-key") === target || p.getAttribute("title") === target)
      if (nextIndex < 0) return
    }

    const previousPane = panes[this.selectedIndex]
    const previousValue = previousPane ? ((previousPane as Tab).name || previousPane.getAttribute("name") || previousPane.getAttribute("title") || String(this.selectedIndex)) : null

    const currentPane = panes[nextIndex]
    const currentValue = currentPane ? ((currentPane as Tab).name || currentPane.getAttribute("name") || currentPane.getAttribute("title") || String(nextIndex)) : String(nextIndex)

    if (nextIndex === this.selectedIndex && this.getAttribute("value") === currentValue) {
      return
    }

    this.selectedIndex = nextIndex

    panes.forEach((pane, i) => {
      pane.hidden = i !== this.selectedIndex
      if (i === this.selectedIndex) {
        pane.setAttribute("selected", "")
      } else {
        pane.removeAttribute("selected")
      }
    })

    if (this.tabList) {
      const buttons = [...this.tabList.querySelectorAll<HTMLButtonElement>(":scope > [role=tab]")]
      buttons.forEach((button, i) => {
        button.setAttribute("aria-selected", String(i === this.selectedIndex))
        button.tabIndex = i === this.selectedIndex ? 0 : -1
      })
    }

    this.setAttribute("value", currentValue)
    this.emitChange(currentValue, previousValue, nextIndex)
  }

  private emitChange(currentValue: string, previousValue: string | null, index: number): void {
    this.dispatchEvent(
      new CustomEvent("m:change", {
        bubbles: true,
        cancelable: false,
        detail: { value: currentValue, previous: previousValue },
      })
    )
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        cancelable: false,
        detail: index,
      })
    )
  }

  private synchronize(): void {
    this.observer?.disconnect()

    this.dataset.tabsType = this.type
    this.dataset.tabsPlacement = this.placement
    this.classList.toggle("m-tabs--animated", this.animated)
    this.classList.toggle("m-tabs--small", this.size === "small")
    this.classList.toggle("m-tabs--large", this.size === "large")

    const panes = this.panes
    if (panes.length === 0) {
      if (this.isConnected) {
        this.observer?.observe(this, { childList: true, subtree: false })
      }
      return
    }

    if (!this.tabList) {
      let existingBar = [...this.children].find(
        (c): c is HTMLElement => c instanceof HTMLElement && (c.matches("[data-tabs-bar], .m-tabs-bar") || c.getAttribute("role") === "tablist")
      )
      if (!existingBar) {
        this.tabBar = this.ownerDocument.createElement("div")
        this.tabBar.setAttribute("data-tabs-bar", "")
        this.tabBar.className = "m-tabs-bar"
        this.tabList = this.ownerDocument.createElement("div")
        this.tabList.setAttribute("role", "tablist")
        this.tabList.setAttribute("data-tabs-list", "")
        this.tabBar.append(this.tabList)
        this.prepend(this.tabBar)
      } else if (existingBar.getAttribute("role") === "tablist") {
        this.tabList = existingBar
      } else {
        this.tabBar = existingBar
        this.tabList = existingBar.querySelector<HTMLElement>("[role=tablist], [data-tabs-list]") ?? undefined
        if (!this.tabList) {
          this.tabList = this.ownerDocument.createElement("div")
          this.tabList.setAttribute("role", "tablist")
          this.tabList.setAttribute("data-tabs-list", "")
          this.tabBar.append(this.tabList)
        }
      }
    }

    if (this.tabList && this.tabList.children.length !== panes.length) {
      this.renderButtons(panes)
    } else if (this.tabList) {
      panes.forEach((pane, index) => {
        const button = this.tabList?.children[index] as HTMLButtonElement | undefined
        if (!button) return
        button.textContent = (pane as Tab).title || pane.getAttribute("title") || `Tab ${index + 1}`
        button.setAttribute("aria-selected", String(index === this.selectedIndex))
        button.tabIndex = index === this.selectedIndex ? 0 : -1
      })
    }

    const currentValue = this.value
    let targetIndex = -1
    if (currentValue !== null) {
      targetIndex = panes.findIndex(p => (p as Tab).name === currentValue || p.getAttribute("name") === currentValue || p.getAttribute("title") === currentValue)
    }
    if (targetIndex < 0) {
      targetIndex = panes.findIndex(p => p.hasAttribute("selected"))
    }
    if (targetIndex < 0) {
      targetIndex = 0
    }

    this.selectedIndex = Math.max(0, targetIndex)
    panes.forEach((pane, i) => {
      pane.hidden = i !== this.selectedIndex
      if (i === this.selectedIndex) {
        pane.setAttribute("selected", "")
      } else {
        pane.removeAttribute("selected")
      }
    })

    if (this.isConnected) {
      this.observer?.observe(this, { childList: true, subtree: false })
    }
  }

  private renderButtons(panes: readonly Tab[]): void {
    if (!this.tabList) return
    this.tabList.replaceChildren()

    panes.forEach((pane, index) => {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.setAttribute("role", "tab")
      button.setAttribute("data-tabs-tab", "")
      button.textContent = (pane as Tab).title || pane.getAttribute("title") || `Tab ${index + 1}`
      button.setAttribute("aria-selected", String(index === this.selectedIndex))
      button.tabIndex = index === this.selectedIndex ? 0 : -1

      const isDisabled = pane.hasAttribute("disabled") || (pane as Tab).disabled
      if (isDisabled) {
        button.disabled = true
      }

      button.addEventListener("click", () => {
        if (!isDisabled) {
          this.select(index)
        }
      })

      button.addEventListener("keydown", (event) => {
        const total = panes.length
        let target = index
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          target = (index + 1) % total
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          target = (index - 1 + total) % total
        } else if (event.key === "Home") {
          target = 0
        } else if (event.key === "End") {
          target = total - 1
        } else {
          return
        }

        event.preventDefault()
        this.select(target)
        const nextButton = this.tabList?.children[target] as HTMLElement | undefined
        nextButton?.focus()
      })

      this.tabList?.append(button)
    })
  }
}
