import { widgetStyles as styles } from "./widgets.styles.js"
import type { MarkupUIApi } from "../core/api.js"
import type { MuiPlugin } from "../core/plugin.js"



export interface WidgetOption {
  readonly label: string
  readonly value: string
}

export interface CascaderOption extends WidgetOption {
  readonly children?: readonly CascaderOption[]
}

export const widgetElementNames = [
  "mui-breadcrumb",
  "mui-breadcrumb-item",
  "mui-timeline",
  "mui-timeline-item",
  "mui-input-number",
  "mui-color-picker",
  "mui-rating",
  "mui-carousel",
  "mui-carousel-item",
  "mui-transfer",
  "mui-cascader",
] as const

export const widgetsPlugin: MuiPlugin<MarkupUIApi> = {
  name: "widgets",
  install(api) {
    const Base = api.elements.Base

    class MuiBreadcrumb extends Base {
      public connectedCallback(): void {
        this.setAttribute("aria-label", this.getAttribute("label") ?? "Breadcrumb")
      }
    }

    class MuiInputNumber extends Base {
      private control: HTMLInputElement | undefined
      public connectedCallback(): void {
        if (this.control !== undefined) return
        const decrement = this.ownerDocument.createElement("button")
        decrement.type = "button"
        decrement.textContent = "−"
        decrement.setAttribute("aria-label", "Decrease")
        const increment = this.ownerDocument.createElement("button")
        increment.type = "button"
        increment.textContent = "+"
        increment.setAttribute("aria-label", "Increase")
        this.control = this.ownerDocument.createElement("input")
        this.control.type = "number"
        for (const name of ["value", "min", "max", "step", "name", "aria-label"]) {
          const value = this.getAttribute(name)
          if (value !== null) this.control.setAttribute(name, value)
        }
        decrement.addEventListener("click", () => this.step(-1))
        increment.addEventListener("click", () => this.step(1))
        this.control.addEventListener("input", () => this.emitValue("input"))
        this.control.addEventListener("change", () => this.emitValue("change"))
        this.replaceChildren(decrement, this.control, increment)
      }
      public get value(): number { return this.control?.valueAsNumber ?? 0 }
      public set value(value: number) { if (this.control !== undefined) this.control.valueAsNumber = Number(value) }
      private step(direction: -1 | 1): void {
        if (this.control === undefined) return
        direction === 1 ? this.control.stepUp() : this.control.stepDown()
        this.emitValue("change")
      }
      private emitValue(name: string): void {
        this.dispatchEvent(new CustomEvent(`mui:${name}`, { bubbles: true, detail: this.value }))
      }
    }

    class MuiColorPicker extends Base {
      private control: HTMLInputElement | undefined
      public connectedCallback(): void {
        if (this.control !== undefined) return
        this.control = this.ownerDocument.createElement("input")
        this.control.type = "color"
        this.control.value = this.getAttribute("value") ?? "#10b981"
        this.control.setAttribute("aria-label", this.getAttribute("aria-label") ?? "Color")
        this.control.addEventListener("input", () => this.emitValue("input"))
        this.control.addEventListener("change", () => this.emitValue("change"))
        this.replaceChildren(this.control)
      }
      public get value(): string { return this.control?.value ?? "#000000" }
      public set value(value: string) { if (this.control !== undefined) this.control.value = value }
      private emitValue(name: string): void {
        this.dispatchEvent(new CustomEvent(`mui:${name}`, { bubbles: true, detail: this.value }))
      }
    }

    class MuiRating extends Base {
      public connectedCallback(): void { this.render() }
      public get value(): number { return Math.max(0, this.numberAttribute("value", 0)) }
      public set value(value: number) {
        this.setAttribute("value", String(Math.max(0, Math.min(Math.round(value), this.max))))
        this.render()
        this.dispatchEvent(new CustomEvent("mui:change", { bubbles: true, detail: this.value }))
      }
      private get max(): number { return Math.max(1, Math.round(this.numberAttribute("max", 5))) }
      private render(): void {
        const current = this.value
        const maximum = this.max
        const buttons = Array.from({ length: maximum }, (_, index) => {
          const value = index + 1
          const button = this.ownerDocument.createElement("button")
          button.type = "button"
          button.textContent = "★"
          button.toggleAttribute("data-active", value <= current)
          button.toggleAttribute("selected", value === current)
          button.setAttribute("aria-label", `${value} of ${maximum}`)
          button.setAttribute("aria-pressed", String(value === current))
          button.addEventListener("click", () => { this.value = value })
          return button
        })
        this.setAttribute("role", "radiogroup")
        this.replaceChildren(...buttons)
      }
    }

    class MuiCarousel extends Base {
      private index = 0
      private viewport: HTMLElement | undefined
      public connectedCallback(): void {
        if (this.viewport !== undefined) return
        const items = [...this.querySelectorAll<HTMLElement>(":scope > mui-carousel-item")]
        this.viewport = this.ownerDocument.createElement("div")
        this.viewport.dataset.muiCarouselViewport = ""
        this.viewport.append(...items)
        const controls = this.ownerDocument.createElement("div")
        controls.dataset.muiCarouselControls = ""
        const previous = this.ownerDocument.createElement("button")
        previous.type = "button"
        previous.textContent = "Previous"
        previous.addEventListener("click", () => this.previous())
        const next = this.ownerDocument.createElement("button")
        next.type = "button"
        next.textContent = "Next"
        next.addEventListener("click", () => this.next())
        controls.append(previous, next)
        this.replaceChildren(this.viewport, controls)
        this.index = Math.max(0, Math.min(this.numberAttribute("index", 0), items.length - 1))
        this.update()
      }
      public next(): void { this.select(this.index + 1) }
      public previous(): void { this.select(this.index - 1) }
      public select(index: number): void {
        const count = this.viewport?.childElementCount ?? 0
        if (count === 0) return
        this.index = (index + count) % count
        this.update()
        this.dispatchEvent(new CustomEvent("mui:change", { bubbles: true, detail: this.index }))
      }
      private update(): void {
        this.viewport?.querySelectorAll<HTMLElement>(":scope > mui-carousel-item")
          .forEach((item, index) => {
            item.hidden = index !== this.index
            item.setAttribute("aria-hidden", String(index !== this.index))
          })
      }
    }

    class MuiTransfer extends Base {
      private data: readonly WidgetOption[] = []
      private selectedValues: string[] = []
      private pendingSource = ""
      private pendingTarget = ""
      public connectedCallback(): void { this.render() }
      public get options(): readonly WidgetOption[] { return this.data }
      public set options(value: readonly WidgetOption[]) {
        this.data = Array.isArray(value) ? value : []
        this.render()
      }
      public get value(): string[] { return [...this.selectedValues] }
      public set value(value: readonly string[]) {
        this.selectedValues = Array.isArray(value) ? [...value] : []
        this.render()
      }
      private move(toTarget: boolean): void {
        const value = toTarget ? this.pendingSource : this.pendingTarget
        if (!value) return
        this.selectedValues = toTarget
          ? [...new Set([...this.selectedValues, value])]
          : this.selectedValues.filter((item) => item !== value)
        this.pendingSource = ""
        this.pendingTarget = ""
        this.render()
        this.dispatchEvent(new CustomEvent("mui:change", {
          bubbles: true,
          detail: this.value,
        }))
      }
      private renderList(options: readonly WidgetOption[], target: boolean): HTMLElement {
        const list = this.ownerDocument.createElement("div")
        list.dataset.muiTransferList = ""
        options.forEach((option) => {
          const button = this.ownerDocument.createElement("button")
          button.type = "button"
          button.textContent = option.label
          const selected = (target ? this.pendingTarget : this.pendingSource) === option.value
          button.toggleAttribute("selected", selected)
          button.addEventListener("click", () => {
            if (target) this.pendingTarget = option.value
            else this.pendingSource = option.value
            this.render()
          })
          list.append(button)
        })
        return list
      }
      private render(): void {
        if (!this.isConnected) return
        const selected = new Set(this.selectedValues)
        const source = this.data.filter((option) => !selected.has(option.value))
        const target = this.data.filter((option) => selected.has(option.value))
        const actions = this.ownerDocument.createElement("div")
        actions.dataset.muiTransferActions = ""
        const add = this.ownerDocument.createElement("button")
        add.type = "button"
        add.textContent = "›"
        add.setAttribute("aria-label", "Move to selected")
        add.addEventListener("click", () => this.move(true))
        const remove = this.ownerDocument.createElement("button")
        remove.type = "button"
        remove.textContent = "‹"
        remove.setAttribute("aria-label", "Remove from selected")
        remove.addEventListener("click", () => this.move(false))
        actions.append(add, remove)
        this.replaceChildren(this.renderList(source, false), actions, this.renderList(target, true))
      }
    }

    class MuiCascader extends Base {
      private data: readonly CascaderOption[] = []
      private selectedPath: string[] = []
      public connectedCallback(): void { this.render() }
      public get options(): readonly CascaderOption[] { return this.data }
      public set options(value: readonly CascaderOption[]) {
        this.data = Array.isArray(value) ? value : []
        this.selectedPath = []
        this.render()
      }
      public get value(): string[] { return [...this.selectedPath] }
      private render(): void {
        if (!this.isConnected) return
        const selects: HTMLSelectElement[] = []
        let options = this.data
        let level = 0
        while (options.length > 0) {
          const select = this.ownerDocument.createElement("select")
          select.setAttribute("aria-label", `Level ${level + 1}`)
          const selected = this.selectedPath[level] ?? options[0]?.value ?? ""
          options.forEach((option) => {
            const item = this.ownerDocument.createElement("option")
            item.value = option.value
            item.textContent = option.label
            select.append(item)
          })
          select.value = selected
          const currentLevel = level
          select.addEventListener("change", () => {
            this.selectedPath = [...this.selectedPath.slice(0, currentLevel), select.value]
            this.render()
            this.dispatchEvent(new CustomEvent("mui:change", {
              bubbles: true,
              detail: this.value,
            }))
          })
          selects.push(select)
          const selectedOption = options.find((option) => option.value === selected)
          this.selectedPath[level] = selected
          options = selectedOption?.children ?? []
          level += 1
        }
        this.selectedPath = this.selectedPath.slice(0, level)
        this.replaceChildren(...selects)
      }
    }

    const style = document.createElement("style")
    style.id = "mui-widgets-styles"
    style.textContent = styles
    if (document.getElementById(style.id) === null) document.head.append(style)

    const constructors = [
      MuiBreadcrumb,
      class extends Base {},
      class extends Base {},
      class extends Base {},
      MuiInputNumber,
      MuiColorPicker,
      MuiRating,
      MuiCarousel,
      class extends Base {},
      MuiTransfer,
      MuiCascader,
    ] as const
    widgetElementNames.forEach((name, index) => {
      const constructor = constructors[index]
      if (constructor !== undefined) api.elements.register(name, constructor)
    })
  },
}
