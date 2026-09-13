import { ViewElement } from "../../core/index.js"
import { TreeNode } from "./tree-node.js"

/**
 * A hierarchical tree outline component supporting disclosure, selection, and checkbox cascades.
 * @region {"name":"nodes","accepts":["TreeNode"],"min":0,"max":null}
 * @event {"name":"Select","web":"m:select","bubbles":true,"cancelable":false,"composed":false,"detail":{"value":"string"}}
 * @event {"name":"Check","web":"m:check","bubbles":true,"cancelable":false,"composed":false,"detail":{"checkedKeys":"Array"}}
 */
export class Tree extends ViewElement {
  public static readonly tag = "m-tree"
  public static get observedAttributes(): string[] {
    return ["value", "checkable", "selectable", "cascade", "block-line"]
  }

  private upgraded = false
  private observer: MutationObserver | undefined

  public connectedCallback(): void {
    if (!this.upgraded) {
      this.upgraded = true
      this.upgradeProperties()
    }
    this.classList.add("m-tree")
    this.dataset.part = "tree"
    this.dataset.mTree = ""
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tree")
    }
    this.addEventListener("m:node-select", this.handleNodeSelect as EventListener)
    this.addEventListener("m:node-check", this.handleNodeCheck as EventListener)
    this.addEventListener("keydown", this.handleKeyDown)
    this.observer ??= new MutationObserver(() => this.synchronize())
    this.observer.observe(this, { childList: true })
    this.synchronize()
  }

  public disconnectedCallback(): void {
    this.removeEventListener("m:node-select", this.handleNodeSelect as EventListener)
    this.removeEventListener("m:node-check", this.handleNodeCheck as EventListener)
    this.removeEventListener("keydown", this.handleKeyDown)
    this.observer?.disconnect()
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (!this.isConnected) return
    if (name === "value") {
      this.updateSelectedNode(newValue)
    } else if (name === "block-line") {
      this.toggleAttribute("data-tree-block-labels", this.blockLine)
    }
    this.synchronize()
  }

  public get value(): string | null {
    return this.getAttribute("value")
  }
  public set value(val: string | null) {
    this.setStringAttribute("value", val)
    this.updateSelectedNode(val)
  }

  public get checkable(): boolean {
    return this.hasAttribute("checkable")
  }
  public set checkable(val: boolean) {
    this.setBooleanAttribute("checkable", val)
  }

  public get selectable(): boolean {
    return this.hasAttribute("selectable")
  }
  public set selectable(val: boolean) {
    this.setBooleanAttribute("selectable", val)
  }

  public get cascade(): boolean {
    return this.hasAttribute("cascade")
  }
  public set cascade(val: boolean) {
    this.setBooleanAttribute("cascade", val)
  }

  public get blockLine(): boolean {
    return this.hasAttribute("block-line")
  }
  public set blockLine(val: boolean) {
    this.setBooleanAttribute("block-line", val)
  }

  public getCheckedKeys(): string[] {
    return [...this.querySelectorAll<TreeNode>("m-tree-node")]
      .filter(node => node.checked)
      .map(node => node.value)
  }

  public setCheckedKeys(keys: readonly string[]): void {
    const keySet = new Set(keys)
    const nodes = [...this.querySelectorAll<TreeNode>("m-tree-node")]
    nodes.forEach(node => {
      if (!node.disabled) {
        node.checked = keySet.has(node.value)
      }
    })
    if (this.cascade) {
      nodes.forEach(node => {
        const children = node.getChildNodes()
        if (children.length > 0) {
          this.cascadeUp(children[0]!)
        }
      })
    }
  }

  public synchronize(): void {
    this.toggleAttribute("data-tree-block-labels", this.blockLine)
    const val = this.value
    if (val !== null) {
      this.updateSelectedNode(val)
    }
    const nodes = this.querySelectorAll<TreeNode>("m-tree-node")
    nodes.forEach(node => {
      if (typeof node.render === "function") {
        node.render()
      }
    })
  }

  private updateSelectedNode(value: string | null): void {
    const nodes = this.querySelectorAll<TreeNode>("m-tree-node")
    nodes.forEach(node => {
      const match = value !== null && node.value === value
      node.selected = match
    })
  }

  private readonly handleNodeSelect = (event: CustomEvent<{ value: string; node: TreeNode }>): void => {
    event.stopPropagation()
    const { value } = event.detail
    this.value = value
    this.dispatchEvent(new CustomEvent("m:select", {
      bubbles: true,
      cancelable: false,
      composed: false,
      detail: { value },
    }))
  }

  private readonly handleNodeCheck = (event: CustomEvent<{ checked: boolean; node: TreeNode }>): void => {
    event.stopPropagation()
    const { node, checked } = event.detail
    if (this.cascade) {
      this.cascadeDown(node, checked)
      this.cascadeUp(node)
    }
    const checkedKeys = this.getCheckedKeys()
    this.dispatchEvent(new CustomEvent("m:check", {
      bubbles: true,
      cancelable: false,
      composed: false,
      detail: { checkedKeys },
    }))
  }

  private cascadeDown(node: TreeNode, checked: boolean): void {
    const descendants = node.querySelectorAll<TreeNode>("m-tree-node")
    descendants.forEach(child => {
      if (!child.disabled) {
        child.checked = checked
      }
    })
  }

  private cascadeUp(node: TreeNode): void {
    let parent = node.parentElement?.closest<TreeNode>("m-tree-node")
    while (parent) {
      const children = parent.getChildNodes()
      const enabledChildren = children.filter(c => !c.disabled)
      if (enabledChildren.length > 0) {
        const allChecked = enabledChildren.every(c => c.checked)
        const someChecked = enabledChildren.some(c => c.checked || c.isIndeterminate())
        if (allChecked) {
          parent.checked = true
          parent.setIndeterminate(false)
        } else if (someChecked) {
          parent.checked = false
          parent.setIndeterminate(true)
        } else {
          parent.checked = false
          parent.setIndeterminate(false)
        }
      }
      parent = parent.parentElement?.closest<TreeNode>("m-tree-node")
    }
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    const focusableNodes = [...this.querySelectorAll<TreeNode>("m-tree-node:not([disabled])")]
      .filter(node => {
        let parent = node.parentElement?.closest<TreeNode>("m-tree-node")
        while (parent) {
          if (!parent.expanded) return false
          parent = parent.parentElement?.closest<TreeNode>("m-tree-node")
        }
        return true
      })

    if (focusableNodes.length === 0) return

    const activeNode = (document.activeElement as HTMLElement | null)?.closest<TreeNode>("m-tree-node")
    const index = activeNode ? focusableNodes.indexOf(activeNode) : -1

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const nextIndex = index < focusableNodes.length - 1 ? index + 1 : 0
      focusableNodes[nextIndex]?.focus()
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      const prevIndex = index > 0 ? index - 1 : focusableNodes.length - 1
      focusableNodes[prevIndex]?.focus()
    } else if (event.key === "ArrowRight") {
      if (activeNode) {
        const children = activeNode.getChildNodes()
        const isBranch = children.length > 0 || activeNode.hasAttribute("branch")
        if (isBranch && !activeNode.expanded) {
          event.preventDefault()
          activeNode.expanded = true
        } else if (isBranch && activeNode.expanded) {
          const firstChild = children.find(c => !c.disabled)
          if (firstChild) {
            event.preventDefault()
            firstChild.focus()
          }
        }
      }
    } else if (event.key === "ArrowLeft") {
      if (activeNode) {
        const children = activeNode.getChildNodes()
        const isBranch = children.length > 0 || activeNode.hasAttribute("branch")
        if (isBranch && activeNode.expanded) {
          event.preventDefault()
          activeNode.expanded = false
        } else {
          const parent = activeNode.parentElement?.closest<TreeNode>("m-tree-node")
          if (parent && !parent.disabled) {
            event.preventDefault()
            parent.focus()
          }
        }
      }
    } else if (event.key === "Home") {
      event.preventDefault()
      focusableNodes[0]?.focus()
    } else if (event.key === "End") {
      event.preventDefault()
      focusableNodes[focusableNodes.length - 1]?.focus()
    } else if (event.key === "Enter" || event.key === " ") {
      if (activeNode) {
        event.preventDefault()
        activeNode.select()
      }
    }
  }
}

export function registerTree(registry: Pick<CustomElementRegistry, "get" | "define"> = customElements): void {
  if (!registry.get(Tree.tag)) {
    ViewElement.register([Tree, TreeNode], registry)
  }
}

if (typeof customElements !== "undefined" && !customElements.get(Tree.tag)) registerTree()
