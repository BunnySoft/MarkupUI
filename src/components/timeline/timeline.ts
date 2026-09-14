import { ViewElement } from "../../core/index.js"

/**
 * A timeline displaying a sequence of events or milestones.
 * @region {"name":"items","element":"m-timeline-item","accepts":["TimelineItem"],"min":0,"max":null}
 */
export class Timeline extends ViewElement {
  public static readonly tag = "m-timeline"
  public static readonly observedAttributes = ["horizontal"]

  private initialized = false

  public connectedCallback(): void {
    if (!this.initialized) {
      this.upgradeProperties()
      this.initialized = true
    }
    this.dataset.part = "timeline"
    this.classList.add("m-timeline")
    if (!this.hasAttribute("role")) this.setAttribute("role", "list")
    this.render()
  }

  public disconnectedCallback(): void {}

  public attributeChangedCallback(name: string): void {
    if (this.initialized && this.isConnected && name === "horizontal") {
      this.render()
    }
  }

  /**
   * Whether the timeline displays horizontally.
   */
  public get horizontal(): boolean {
    return this.hasAttribute("horizontal")
  }
  public set horizontal(value: boolean) {
    this.setBooleanAttribute("horizontal", value)
  }

  private render(): void {
    this.toggleAttribute("data-horizontal", this.horizontal)
  }
}

export { Timeline as MTimeline }
