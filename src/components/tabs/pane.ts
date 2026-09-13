import { ViewElement } from "../../core/index.js"

/**
 * A single tab panel within Tabs, configuring a title, value identifier, and content.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Tab extends ViewElement {
  public static readonly tag: string = "m-tab"
  public static get observedAttributes(): string[] {
    return ["title", "name", "disabled", "closable"]
  }

  private upgraded = false

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "tab-pane"
    this.dataset.mTab = ""
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tabpanel")
    }
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setAttribute("title", value)
  }

  public get name(): string {
    return this.getAttribute("name") ?? ""
  }
  public set name(value: string) {
    this.setAttribute("name", value)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  public get closable(): boolean {
    return this.hasAttribute("closable")
  }
  public set closable(value: boolean) {
    this.setBooleanAttribute("closable", value)
  }
}

/**
 * Alias for Tab using the m-tab-pane custom element name.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class TabPane extends Tab {
  public static override readonly tag: string = "m-tab-pane"
}
