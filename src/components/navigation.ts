import { MuiElement } from "../core/element.js"

export class MuiTab extends MuiElement {
  public connectedCallback(): void {
    this.setAttribute("role", "tabpanel")
  }
}

export class MuiTabs extends MuiElement {
  private selected = 0
  public connectedCallback(): void {
    const tabs = [...this.querySelectorAll(":scope > mui-tab")] as MuiTab[]
    if (tabs.length === 0 || this.querySelector(":scope > [role=tablist]") !== null) return
    const list = this.ownerDocument.createElement("div")
    list.setAttribute("role", "tablist")
    tabs.forEach((tab, index) => {
      const button = this.ownerDocument.createElement("button")
      button.type = "button"
      button.setAttribute("role", "tab")
      button.textContent = tab.getAttribute("title") ?? `Tab ${index + 1}`
      button.addEventListener("click", () => this.select(index))
      button.addEventListener("keydown", (event) => {
        let target = index
        if (event.key === "ArrowRight") target = (index + 1) % tabs.length
        else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length
        else if (event.key === "Home") target = 0
        else if (event.key === "End") target = tabs.length - 1
        else return
        event.preventDefault()
        this.select(target)
        ;(list.children[target] as HTMLElement | undefined)?.focus()
      })
      list.append(button)
    })
    this.prepend(list)
    this.selected = Math.max(0, tabs.findIndex((tab) => tab.hasAttribute("selected")))
    this.select(this.selected)
  }
  public select(index: number): void {
    const tabs = [...this.querySelectorAll(":scope > mui-tab")] as MuiTab[]
    const buttons = [...this.querySelectorAll(":scope > [role=tablist] > [role=tab]")]
    this.selected = Math.max(0, Math.min(index, tabs.length - 1))
    tabs.forEach((tab, itemIndex) => { tab.hidden = itemIndex !== this.selected })
    buttons.forEach((button, itemIndex) => {
      button.setAttribute("aria-selected", String(itemIndex === this.selected))
    })
    this.emit("change", this.selected)
  }
}

export class MuiMenuItem extends MuiElement {
    public connectedCallback(): void {
      this.setAttribute("role", "menuitem")
      this.tabIndex = this.hasAttribute("disabled") ? -1 : 0
      this.addEventListener("click", this.select)
      this.addEventListener("keydown", this.onKeyDown)
    }
    public disconnectedCallback(): void {
      this.removeEventListener("click", this.select)
      this.removeEventListener("keydown", this.onKeyDown)
    }
    private readonly select = (): void => {
      if (!this.hasAttribute("disabled")) {
        this.emit("select", this.getAttribute("value") ?? this.textContent?.trim() ?? "")
      }
    }
    private readonly onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        this.select()
      }
    }
  }

export class MuiMenu extends MuiElement {
    private readonly onSelect = (event: Event): void => {
      if (!(event.target instanceof MuiMenuItem)) return
      this.value = String((event as CustomEvent).detail ?? "")
      this.emit("change", this.value)
    }
    public connectedCallback(): void {
      this.setAttribute("role", "menu")
      this.addEventListener("mui:select", this.onSelect)
      this.addEventListener("keydown", this.onKeyDown)
      const value = this.getAttribute("value")
      if (value !== null) this.value = value
    }
    public disconnectedCallback(): void {
      this.removeEventListener("mui:select", this.onSelect)
      this.removeEventListener("keydown", this.onKeyDown)
    }
    public get value(): string {
      return this.querySelector<MuiMenuItem>(":scope > mui-menu-item[selected]")
        ?.getAttribute("value") ?? ""
    }
    public set value(value: string) {
      this.querySelectorAll<MuiMenuItem>(":scope > mui-menu-item").forEach((item) => {
        item.toggleAttribute("selected", item.getAttribute("value") === value)
      })
    }
    private readonly onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.target instanceof MuiMenuItem)) return
      const items = [...this.querySelectorAll<MuiMenuItem>(":scope > mui-menu-item:not([disabled])")]
      const index = items.indexOf(event.target)
      let target = index
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        target = (index + 1) % items.length
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        target = (index - 1 + items.length) % items.length
      } else if (event.key === "Home") target = 0
      else if (event.key === "End") target = items.length - 1
      else return
      event.preventDefault()
      items[target]?.focus()
    }
  }

export class MuiPagination extends MuiElement {
    public static get observedAttributes(): string[] { return ["page", "count"] }
    public connectedCallback(): void { this.render() }
    public attributeChangedCallback(): void { if (this.isConnected) this.render() }
    public get page(): number { return Math.max(1, this.numberAttribute("page", 1)) }
    public set page(value: number) {
      const count = Math.max(1, this.numberAttribute("count", 1))
      const page = Math.max(1, Math.min(Math.round(value), count))
      this.setAttribute("page", String(page))
      this.emit("change", page)
    }
    private render(): void {
      const count = Math.max(1, Math.round(this.numberAttribute("count", 1)))
      const page = Math.max(1, Math.min(this.page, count))
      const makeButton = (text: string, target: number, current = false): HTMLButtonElement => {
        const button = this.ownerDocument.createElement("button")
        button.type = "button"
        button.textContent = text
        if (current) button.setAttribute("aria-current", "page")
        button.addEventListener("click", () => { if (target !== page) this.page = target })
        return button
      }
      const previous = makeButton("‹", page - 1)
      previous.disabled = page === 1
      previous.setAttribute("aria-label", "Previous page")
      const next = makeButton("›", page + 1)
      next.disabled = page === count
      next.setAttribute("aria-label", "Next page")
      const pages = Array.from({ length: count }, (_, index) => {
        const target = index + 1
        return makeButton(String(target), target, target === page)
      })
      this.setAttribute("role", "navigation")
      this.setAttribute("aria-label", this.getAttribute("label") ?? "Pagination")
      this.replaceChildren(previous, ...pages, next)
    }
  }

export class MuiSteps extends MuiElement {
    public static get observedAttributes(): string[] { return ["current"] }
    public connectedCallback(): void {
      this.setAttribute("role", "list")
      this.update()
    }
    public get current(): number { return Math.max(1, this.numberAttribute("current", 1)) }
    public set current(value: number) {
      this.setAttribute("current", String(Math.max(1, Math.round(value))))
      this.update()
      this.emit("change", this.current)
    }
    private update(): void {
      const current = this.current
      this.querySelectorAll<HTMLElement>(":scope > mui-step").forEach((step, index) => {
        const number = index + 1
        step.dataset.index = String(number)
        step.setAttribute("role", "listitem")
        step.toggleAttribute("current", number === current)
        step.toggleAttribute("complete", number < current)
        if (number === current) step.setAttribute("aria-current", "step")
        else step.removeAttribute("aria-current")
      })
    }
  }

export class MuiDescriptionItem extends MuiElement {
    public connectedCallback(): void {
      if (this.querySelector(":scope > [data-mui-label]") !== null) return
      const valueNodes = [...this.childNodes]
      const label = this.ownerDocument.createElement("span")
      label.dataset.muiLabel = ""
      label.textContent = this.getAttribute("label") ?? ""
      const value = this.ownerDocument.createElement("span")
      value.dataset.muiValue = ""
      value.append(...valueNodes)
      this.append(label, value)
    }
  }

export class MuiDescriptions extends MuiElement {
    public static get observedAttributes(): string[] { return ["columns"] }
    public connectedCallback(): void {
      this.updateColumns()
    }
    public attributeChangedCallback(): void {
      if (this.isConnected) this.updateColumns()
    }
    private updateColumns(): void {
      const columns = Math.max(1, Math.round(this.numberAttribute("columns", 2)))
      this.style.gridTemplateColumns = `repeat(${columns},minmax(0,1fr))`
    }
  }

export class MuiStatistic extends MuiElement {
    public connectedCallback(): void {
      if (this.querySelector(":scope > [data-mui-statistic-value]") !== null) return
      const label = this.ownerDocument.createElement("span")
      label.dataset.muiStatisticLabel = ""
      label.textContent = this.getAttribute("label") ?? ""
      const value = this.ownerDocument.createElement("span")
      value.dataset.muiStatisticValue = ""
      value.textContent = `${this.getAttribute("prefix") ?? ""}${this.getAttribute("value") ?? this.textContent?.trim() ?? ""}${this.getAttribute("suffix") ?? ""}`
      this.replaceChildren(label, value)
    }
  }

export class MuiTreeNode extends MuiElement {
    private row: HTMLElement | undefined
    private group: HTMLElement | undefined
    public connectedCallback(): void {
      if (this.row !== undefined) return
      const children = [...this.querySelectorAll(":scope > mui-tree-node")]
      this.row = this.ownerDocument.createElement("span")
      this.row.dataset.muiTreeRow = ""
      this.row.tabIndex = 0
      this.row.textContent = this.getAttribute("label") ?? ""
      this.row.addEventListener("click", this.select)
      this.row.addEventListener("keydown", this.onKeyDown)
      this.replaceChildren(this.row)
      if (children.length > 0) {
        this.toggleAttribute("branch", true)
        this.group = this.ownerDocument.createElement("span")
        this.group.setAttribute("role", "group")
        this.group.append(...children)
        this.append(this.group)
        this.expanded = this.hasAttribute("expanded")
      }
      this.setAttribute("role", "treeitem")
    }
    public disconnectedCallback(): void {
      this.row?.removeEventListener("click", this.select)
      this.row?.removeEventListener("keydown", this.onKeyDown)
    }
    public get value(): string { return this.getAttribute("value") ?? this.getAttribute("label") ?? "" }
    public get expanded(): boolean { return this.hasAttribute("expanded") }
    public set expanded(value: boolean) {
      this.toggleAttribute("expanded", value)
      this.setAttribute("aria-expanded", String(value))
      if (this.group !== undefined) this.group.hidden = !value
    }
    private readonly select = (): void => {
      if (this.hasAttribute("branch")) this.expanded = !this.expanded
      this.emit("select", this.value)
    }
    private readonly onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        this.select()
      } else if (event.key === "ArrowRight" && this.hasAttribute("branch")) {
        this.expanded = true
      } else if (event.key === "ArrowLeft" && this.hasAttribute("branch")) {
        this.expanded = false
      }
    }
  }

export class MuiTree extends MuiElement {
    private readonly onSelect = (event: Event): void => {
      if (!(event.target instanceof MuiTreeNode)) return
      this.value = String((event as CustomEvent).detail ?? "")
      this.emit("change", this.value)
    }
    public connectedCallback(): void {
      this.setAttribute("role", "tree")
      this.addEventListener("mui:select", this.onSelect)
    }
    public disconnectedCallback(): void {
      this.removeEventListener("mui:select", this.onSelect)
    }
    public get value(): string {
      return this.querySelector<MuiTreeNode>("mui-tree-node[selected]")?.value ?? ""
    }
    public set value(value: string) {
      this.querySelectorAll<MuiTreeNode>("mui-tree-node").forEach((node) => {
        node.toggleAttribute("selected", node.value === value)
        node.setAttribute("aria-selected", String(node.value === value))
      })
    }
}

