import { ViewElement } from "../../core/index.js"

export const stepStatuses = ["process", "finish", "error", "wait"] as const
export type StepStatus = (typeof stepStatuses)[number]

const statusLabels: Record<StepStatus, string> = {
  wait: "Waiting",
  process: "In progress",
  finish: "Completed",
  error: "Error",
}

function applyStepState(step: Step, stepIndex: number, stepStatus: StepStatus, isCurrent: boolean, hasFollowing: boolean): void {
  step.dataset.stepState = stepStatus
  step.setAttribute("data-step-state", stepStatus)
  step.toggleAttribute("current", isCurrent)
  step.toggleAttribute("complete", stepStatus === "finish")
  if (isCurrent) {
    step.setAttribute("aria-current", "step")
  } else {
    step.removeAttribute("aria-current")
  }
  if (hasFollowing) {
    step.setAttribute("data-step-following", "")
  } else {
    step.removeAttribute("data-step-following")
  }
  if (step.disabled) {
    step.setAttribute("data-step-action-disabled", "")
  } else {
    step.removeAttribute("data-step-action-disabled")
  }

  const statusText = step.querySelector(":scope > .m-step__layout > .m-step__body > [data-step-status-text]")
  if (statusText) {
    statusText.textContent = statusLabels[stepStatus]
  }

  const icon = step.querySelector(":scope > .m-step__layout > .m-step__icon")
  if (icon) {
    if (stepStatus === "finish") {
      icon.textContent = "✓"
    } else if (stepStatus === "error") {
      icon.textContent = "!"
    } else {
      icon.textContent = String(stepIndex)
    }
  }
}

/**
 * A progress summary displaying a sequence of steps.
 * @region {"name":"steps","accepts":["Step"],"min":0,"max":null}
 * @event {"name":"Change","web":"m:change","bubbles":true,"cancelable":false,"composed":false,"detail":{"current":"number"}}
 */
export class Steps extends ViewElement {
  public static readonly tag = "m-steps"
  public static get observedAttributes(): string[] {
    return ["current", "status", "vertical"]
  }

  private initialized = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-steps")
    this.dataset.part = "steps"
    this.dataset.mSteps = ""
    this.setAttribute("data-steps", "")
    this.setAttribute("data-steps-connected", "")
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "list")
    }
    this.addEventListener("click", this.handleClick)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.observer.observe(this, { childList: true })
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("click", this.handleClick)
    this.observer?.disconnect()
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (this.isConnected) {
      this.synchronize()
    }
  }

  /**
   * Current active step index (1-based).
   * @min 1
   * @integer
   */
  public get current(): number {
    return this.numberAttribute("current", 1)
  }
  public set current(value: number) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 1) {
      throw new RangeError("Invalid number current.")
    }
    this.setAttribute("current", String(Math.floor(value)))
  }

  /**
   * Overall status of the current step.
   */
  public get status(): StepStatus {
    return this.choiceAttribute("status", stepStatuses, "process")
  }
  public set status(value: StepStatus) {
    this.setChoiceAttribute("status", value, stepStatuses)
  }

  /**
   * Whether steps are displayed in a vertical layout.
   */
  public get vertical(): boolean {
    return this.hasAttribute("vertical")
  }
  public set vertical(value: boolean) {
    this.setBooleanAttribute("vertical", value)
  }

  /**
   * Child step elements.
   */
  public get steps(): readonly Step[] {
    return Object.freeze(
      [...this.querySelectorAll<Step>(":scope > m-step, :scope > [data-part='step']")]
    )
  }

  public select(index: number): void {
    if (index < 1 || !Number.isSafeInteger(index)) return
    const stepList = this.steps
    if (stepList.length > 0 && index > stepList.length) return
    const targetStep = stepList[index - 1]
    if (targetStep?.disabled) return
    const previous = this.current
    this.current = index
    if (previous !== index) {
      this.emit<{ current: number }>(
        "m:change",
        { current: index },
        { bubbles: true, cancelable: false, composed: false }
      )
    }
  }

  public next(): void {
    this.select(this.current + 1)
  }

  public previous(): void {
    this.select(this.current - 1)
  }

  public synchronize(): void {
    this.classList.toggle("m-steps--vertical", this.vertical)
    const stepList = this.steps
    const current = this.current
    const currentStatus = this.status

    stepList.forEach((step, index) => {
      const stepIndex = index + 1
      const isCurrent = stepIndex === current
      const overrideStatus = step.getAttribute("status") as StepStatus | null
        ?? step.getAttribute("data-step-status") as StepStatus | null

      let stepStatus: StepStatus
      if (overrideStatus && stepStatuses.includes(overrideStatus)) {
        stepStatus = overrideStatus
      } else if (stepIndex < current) {
        stepStatus = "finish"
      } else if (isCurrent) {
        stepStatus = currentStatus
      } else {
        stepStatus = "wait"
      }

      applyStepState(step, stepIndex, stepStatus, isCurrent, index < stepList.length - 1)
    })
  }

  private handleClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return
    const target = event.target as HTMLElement | null
    if (!target) return
    if (target.closest("a[href]")) return
    const stepEl = target.closest("m-step") as Step | null
    if (!stepEl || stepEl.parentElement !== this) return
    if (stepEl.disabled) return
    const stepList = this.steps
    const index = stepList.indexOf(stepEl) + 1
    if (index > 0 && index !== this.current) {
      this.select(index)
    }
  }
}

/**
 * A single step item within Steps.
 * @region {"name":"content","accepts":["flow content","text","components"],"min":0,"max":null}
 */
export class Step extends ViewElement {
  public static readonly tag = "m-step"
  public static get observedAttributes(): string[] {
    return ["title", "description", "disabled"]
  }

  private initialized = false
  private layoutElement: HTMLElement | undefined
  private titleElement: HTMLElement | undefined
  private descriptionElement: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.initialized) {
      this.initialized = true
      this.upgradeProperties()
    }
    this.classList.add("m-step")
    this.dataset.part = "step"
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem")
    }
    this.render()
  }

  public disconnectedCallback(): void {
    // cleanup
  }

  public attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    this.render()
    const parent = this.closest<Steps>("m-steps")
    parent?.synchronize()
  }

  /**
   * Title of the step.
   */
  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(value: string) {
    this.setAttribute("title", value)
  }

  /**
   * Description text of the step.
   */
  public get description(): string {
    return this.getAttribute("description") ?? ""
  }
  public set description(value: string) {
    this.setAttribute("description", value)
  }

  /**
   * Whether the step is disabled.
   */
  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(value: boolean) {
    this.setBooleanAttribute("disabled", value)
  }

  private render(): void {
    const existingLayout = this.querySelector(":scope > .m-step__layout")
    if (existingLayout) {
      this.layoutElement = existingLayout as HTMLElement
      const body = existingLayout.querySelector(":scope > .m-step__body")
      if (body) {
        this.titleElement = (body.querySelector(":scope > [data-step-title]") as HTMLElement) ?? undefined
        this.descriptionElement = (body.querySelector(":scope > .m-step__description, :scope > p") as HTMLElement) ?? undefined
      }
      return
    }

    if (!this.layoutElement) {
      const layout = this.ownerDocument.createElement("div")
      layout.className = "m-step__layout"

      const icon = this.ownerDocument.createElement("span")
      icon.className = "m-step__icon"
      icon.setAttribute("aria-hidden", "true")

      const body = this.ownerDocument.createElement("div")
      body.className = "m-step__body"

      const titleEl = this.ownerDocument.createElement("div")
      titleEl.className = "m-step__title"
      titleEl.setAttribute("data-step-title", "")

      const statusEl = this.ownerDocument.createElement("span")
      statusEl.className = "m-step__status-text"
      statusEl.setAttribute("data-step-status-text", "")

      body.append(titleEl, statusEl)

      const existingChildren = [...this.childNodes]
      for (const child of existingChildren) {
        body.append(child)
      }

      layout.append(icon, body)
      this.append(layout)

      this.layoutElement = layout
      this.titleElement = titleEl
    }

    if (this.titleElement) {
      this.titleElement.textContent = this.title
    }

    const desc = this.description
    if (desc) {
      if (!this.descriptionElement) {
        this.descriptionElement = this.ownerDocument.createElement("p")
        this.descriptionElement.className = "m-step__description"
        const body = this.layoutElement?.querySelector(".m-step__body")
        body?.append(this.descriptionElement)
      }
      this.descriptionElement.textContent = desc
    } else if (this.descriptionElement) {
      this.descriptionElement.remove()
      this.descriptionElement = undefined
    }
  }
}

export function registerSteps(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  ViewElement.register([Steps, Step], registry)
}

if (typeof customElements !== "undefined") registerSteps()
