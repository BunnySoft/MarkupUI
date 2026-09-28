/** Passive hierarchy data. Rendering this data never registers or activates Tree. */
export interface HierarchyItem {
  value: string
  label: string
  children?: readonly HierarchyItem[] | undefined
  disabled?: boolean
  lazy?: boolean
}
export interface HierarchyLoadResult { nodes: readonly HierarchyItem[]; dispose?: () => void }

/** Validate and snapshot data before touching the connected source. */
export function prepareHierarchy(document: Document, values: readonly HierarchyItem[], maxDepth = 64, limit = 2000) {
  const keys = new Set<string>()
  function prepare(items: readonly HierarchyItem[], depth: number): { items: readonly HierarchyItem[]; nodes: HTMLLIElement[] } {
    if (!Array.isArray(items) || depth > maxDepth && items.length) throw new TypeError("Hierarchy depth exceeds its bound.")
    const nodes: HTMLLIElement[] = []
    const data = Array.from(items, item => {
      if (!item || typeof item.value !== "string" || !item.value || item.value.length > 256 || keys.has(item.value)
        || keys.size >= limit || typeof item.label !== "string" || !item.label.trim() || item.label.length > 1024
        || item.disabled !== undefined && typeof item.disabled !== "boolean"
        || item.lazy !== undefined && typeof item.lazy !== "boolean"
        || item.children !== undefined && !Array.isArray(item.children)
        || item.lazy && item.children?.length) throw new TypeError("Invalid hierarchy key, label, flags or bounds.")
      keys.add(item.value)
      const children = item.children === undefined ? undefined : prepare(item.children, depth + 1)
      const snapshot: HierarchyItem = Object.freeze({ value: item.value, label: item.label,
        children: children?.items, disabled: !!item.disabled, lazy: !!item.lazy })
      const li = document.createElement("li"), row = document.createElement("div"), label = document.createElement("span")
      li.dataset.treeKey = item.value; li.toggleAttribute("data-tree-disabled", !!item.disabled)
      row.dataset.treeRow = ""; label.dataset.treeLabel = ""; label.textContent = item.label; row.append(label); li.append(row)
      if (children || item.lazy) {
        const branch = document.createElement("details"), summary = document.createElement("summary"), list = document.createElement("ul")
        branch.dataset.treeBranch = ""; branch.toggleAttribute("data-tree-lazy", !!item.lazy)
        summary.textContent = item.label; list.dataset.treeList = ""; list.append(...children?.nodes ?? [])
        branch.append(summary, list); li.append(branch)
      }
      nodes.push(li)
      return snapshot
    })
    return { items: Object.freeze(data), nodes }
  }
  return prepare(values, 1)
}
