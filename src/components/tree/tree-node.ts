import { ViewElement } from "../../core/index.js"
import type { Tree } from "./tree-element.js"

/**
 * An individual node within a Tree outline.
 * @region {"name":"content","accepts":["TreeNode","flow content","text"],"min":0,"max":null}
 */
export class TreeNode extends ViewElement {
  public static readonly tag = "m-tree-node"
  public static get observedAttributes(): string[] {
    return ["value", "title", "disabled", "expanded", "checked", "selected"]
  }

  private upgraded = false
  private rendering = false
  private rowElement: HTMLElement | undefined
  private switcherElement: HTMLElement | undefined
  private checkboxElement: HTMLInputElement | undefined
  private labelElement: HTMLElement | undefined
  private childrenGroup: HTMLElement | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.dataset.part = "tree-node"
    this.tabIndex = this.disabled ? -1 : 0
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "treeitem")
    }
    this.render()
  }

  public disconnectedCallback(): void {
    this.rowElement?.removeEventListener("click", this.handleRowClick)
    this.checkboxElement?.removeEventListener("change", this.handleCheckboxChange)
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    if (name === "disabled") {
      this.tabIndex = this.disabled ? -1 : 0
      if (this.checkboxElement) this.checkboxElement.disabled = this.disabled
    } else if (name === "expanded") {
      this.updateExpanded()
    } else if (name === "checked") {
      if (this.checkboxElement) this.checkboxElement.checked = this.checked
    } else if (name === "selected") {
      this.updateSelected()
    } else if (name === "title" || name === "value") {
      this.updateLabel()
    }
  }

  public get value(): string {
    return this.getAttribute("value") ?? ""
  }
  public set value(val: string) {
    this.setAttribute("value", val)
  }

  public override get title(): string {
    return this.getAttribute("title") ?? ""
  }
  public override set title(val: string) {
    this.setAttribute("title", val)
  }

  public get disabled(): boolean {
    return this.hasAttribute("disabled")
  }
  public set disabled(val: boolean) {
    this.setBooleanAttribute("disabled", val)
  }

  public get expanded(): boolean {
    return this.hasAttribute("expanded")
  }
  public set expanded(val: boolean) {
    this.setBooleanAttribute("expanded", val)
  }

  public get checked(): boolean {
    return this.hasAttribute("checked")
  }
  public set checked(val: boolean) {
    this.setBooleanAttribute("checked", val)
  }

  public get selected(): boolean {
    return this.hasAttribute("selected")
  }
  public set selected(val: boolean) {
    this.setBooleanAttribute("selected", val)
  }

  public isIndeterminate(): boolean {
    return this.checkboxElement?.indeterminate ?? false
  }

  public setIndeterminate(val: boolean): void {
    if (this.checkboxElement) {
      this.checkboxElement.indeterminate = val
    }
  }

  private get tree(): Tree | null {
    return this.closest<Tree>("m-tree")
  }

  public getChildNodes(): TreeNode[] {
    return [...this.querySelectorAll<TreeNode>("m-tree-node")].filter(
      node => node !== this && node.parentElement?.closest("m-tree-node") === this
    )
  }

  private get isBranch(): boolean {
    return this.getChildNodes().length > 0 || this.hasAttribute("branch")
  }

  public select(): void {
    if (this.disabled) return
    this.selected = true
    this.dispatchEvent(new CustomEvent("m:node-select", {
      bubbles: true,
      composed: true,
      detail: { value: this.value, node: this },
    }))
  }

  private readonly handleRowClick = (event: MouseEvent): void => {
    if (this.disabled) {
      event.preventDefault()
      return
    }

    const target = event.target as HTMLElement | null
    if (target?.matches("[data-part='checkbox'], [data-tree-check], input[type='checkbox']")) {
      return
    }

    const isBranch = this.isBranch
    const isSwitcher = target?.matches("[data-part='switcher'], .m-tree-switcher")

    if (isSwitcher) {
      this.expanded = !this.expanded
      return
    }

    if (isBranch) {
      this.expanded = !this.expanded
    }

    const tree = this.tree
    const selectable = tree ? tree.selectable : false
    if (selectable || !isBranch) {
      this.select()
    }
  }

  private readonly handleCheckboxChange = (event: Event): void => {
    if (this.disabled) return
    const checkbox = event.target as HTMLInputElement
    this.checked = checkbox.checked
    this.dispatchEvent(new CustomEvent("m:node-check", {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, node: this },
    }))
  }

  private updateExpanded(): void {
    const expanded = this.expanded
    this.setAttribute("aria-expanded", String(expanded))
    if (this.switcherElement) {
      this.switcherElement.textContent = expanded ? "▾" : "▸"
    }
    if (this.childrenGroup) {
      this.childrenGroup.hidden = !expanded
    }
  }

  private updateSelected(): void {
    const selected = this.selected
    this.setAttribute("aria-selected", String(selected))
    if (this.labelElement) {
      this.labelElement.setAttribute("aria-pressed", String(selected))
    }
  }

  private updateLabel(): void {
    if (!this.labelElement) return
    const text = this.title || this.getAttribute("label") || this.value
    this.labelElement.textContent = text
  }

  public render(): void {
    if (this.rendering || !this.isConnected) return
    this.rendering = true

    try {
      const directChildren = [...this.children].filter(
        child => child instanceof HTMLElement && child.localName === "m-tree-node"
      ) as TreeNode[]

      let row = this.querySelector<HTMLElement>(":scope > [data-part='row']")
      if (!row) {
        row = this.ownerDocument.createElement("div")
        row.dataset.part = "row"
        row.dataset.mTreeRow = ""
        row.dataset.treeRow = ""
        row.className = "m-tree-row"
        row.tabIndex = 0
        this.prepend(row)
      }
      this.rowElement = row
      this.rowElement.removeEventListener("click", this.handleRowClick)
      this.rowElement.addEventListener("click", this.handleRowClick)

      const isBranch = directChildren.length > 0 || this.hasAttribute("branch")
      let switcher = row.querySelector<HTMLElement>(":scope > [data-part='switcher']")
      if (isBranch) {
        if (!switcher) {
          switcher = this.ownerDocument.createElement("span")
          switcher.dataset.part = "switcher"
          switcher.className = "m-tree-switcher"
          switcher.setAttribute("aria-hidden", "true")
          row.prepend(switcher)
        }
        switcher.textContent = this.expanded ? "▾" : "▸"
        this.switcherElement = switcher
      } else if (switcher) {
        switcher.remove()
        this.switcherElement = undefined
      }

      const tree = this.tree
      const checkable = tree ? tree.checkable : this.hasAttribute("checkable")
      let checkbox = row.querySelector<HTMLInputElement>(":scope > [data-part='checkbox']")
      if (checkable) {
        if (!checkbox) {
          checkbox = this.ownerDocument.createElement("input")
          checkbox.type = "checkbox"
          checkbox.dataset.part = "checkbox"
          checkbox.dataset.treeCheck = ""
          checkbox.className = "m-tree-checkbox"
          if (switcher) switcher.after(checkbox)
          else row.prepend(checkbox)
        }
        checkbox.checked = this.checked
        checkbox.disabled = this.disabled
        checkbox.removeEventListener("change", this.handleCheckboxChange)
        checkbox.addEventListener("change", this.handleCheckboxChange)
        this.checkboxElement = checkbox
      } else if (checkbox) {
        checkbox.remove()
        this.checkboxElement = undefined
      }

      let label = row.querySelector<HTMLElement>(":scope > [data-part='label']")
      if (!label) {
        label = this.ownerDocument.createElement("span")
        label.dataset.part = "label"
        label.dataset.treeLabel = ""
        label.className = "m-tree-label"
        row.append(label)
      }
      this.labelElement = label
      this.updateLabel()
      this.updateSelected()

      if (directChildren.length > 0) {
        let group = this.querySelector<HTMLElement>(":scope > [data-part='children']")
        if (!group) {
          group = this.ownerDocument.createElement("div")
          group.dataset.part = "children"
          group.dataset.treeList = ""
          group.setAttribute("role", "group")
          group.className = "m-tree-children"
          this.append(group)
        }
        this.childrenGroup = group
        for (const child of directChildren) {
          if (child.parentElement !== group) {
            group.append(child)
          }
        }
        group.hidden = !this.expanded
      } else if (this.childrenGroup) {
        this.childrenGroup.hidden = !this.expanded
      }

      this.setAttribute("aria-expanded", String(this.expanded))
    } finally {
      this.rendering = false
    }
  }
}
