export const MAX_TREE_NODES = 2000
export const MAX_TREE_DEPTH = 64
export interface TreeNode {
  readonly key: string
  readonly element: HTMLLIElement
  readonly parent: TreeNode | null
  readonly children: readonly TreeNode[]
  readonly label: HTMLElement
  readonly target: HTMLElement | null
  readonly checkbox: HTMLInputElement | null
  readonly branch: HTMLDetailsElement | null
  readonly list: HTMLUListElement | HTMLOListElement | null
  readonly summary: HTMLElement | null
}
export interface TreeHierarchy { readonly nodes: readonly TreeNode[]; readonly byKey: ReadonlyMap<string, TreeNode> }
export function treeLabel(node: TreeNode): string {
  const label = node.label, ids = label.getAttribute("aria-labelledby")?.trim().split(/\s+/)
  const text = ids?.map(id => label.ownerDocument.getElementById(id)?.textContent?.trim() ?? "")
  if (text?.some(value => !value)) throw new TypeError("Tree label references must resolve.")
  return (text?.join(" ") ?? label.getAttribute("aria-label") ?? label.textContent ?? "").trim()
}

/** An index over real authored nodes, also used to validate a detached lazy insertion before commit. */
export function readTreeHierarchy(root: HTMLElement, addition?: { list: Element; nodes: readonly HTMLLIElement[] }): TreeHierarchy {
  const document = root.ownerDocument, view = document.defaultView!
  const references = root.getAttribute("aria-labelledby")?.trim().split(/\s+/)
  const named = references?.length ? references.every(id => document.getElementById(id)?.textContent?.trim()) : !!root.getAttribute("aria-label")?.trim()
  if (!root.isConnected || root.getRootNode() !== document || !root.matches(".mui-tree[data-tree]")
    || !["section", "nav", "div"].includes(root.localName) || root.hasAttribute("role")
    || !named) throw new TypeError("Author a connected named native .mui-tree[data-tree] outline, not an ARIA tree.")
  const lists = [...root.children].filter(node => node.hasAttribute("data-tree-list"))
  if (lists.length !== 1) throw new TypeError("Author exactly one direct data-tree-list.")
  const nodes: TreeNode[] = [], byKey = new Map<string, TreeNode>()
  const stack: { element: Element; parent: TreeNode | null; depth: number }[] = []
  function push(list: Element, parent: TreeNode | null, depth: number) {
    if (!(list instanceof view.HTMLUListElement || list instanceof view.HTMLOListElement)
      || list.hasAttribute("role") && list.getAttribute("role") !== "list") throw new TypeError("Tree levels must be native ul/ol lists.")
    const children = [...list.children, ...addition?.list === list ? addition.nodes : []]
    for (let index = children.length - 1; index >= 0; index--) stack.push({ element: children[index]!, parent, depth })
  }
  push(lists[0]!, null, 1)
  while (stack.length) {
    const { element, parent, depth } = stack.pop()!
    if (nodes.length >= MAX_TREE_NODES || depth > MAX_TREE_DEPTH) throw new RangeError("Tree supports at most 2000 nodes and 64 levels.")
    const key = element.getAttribute("data-tree-key")
    if (!(element instanceof view.HTMLLIElement) || !key || key.length > 256 || byKey.has(key)
      || element.hasAttribute("role") || element.hasAttribute("data-tree")) throw new TypeError("Use unique nonempty string data-tree-key values (up to 256 characters) on native li nodes.")
    const direct = [...element.children], row = direct.find(node => node.hasAttribute("data-tree-row"))
    const branchNode = direct.find(node => node.hasAttribute("data-tree-branch"))
    if (!(row instanceof view.HTMLElement) || row.localName !== "div" || row.hasAttribute("role") || direct.filter(node => node.hasAttribute("data-tree-row")).length !== 1
      || direct.filter(node => node.hasAttribute("data-tree-branch")).length > 1) throw new TypeError("Each node needs exactly one direct native data-tree-row.")
    const own = (node: Element) => node.closest("[data-tree-key]") === element
      && node.closest("[data-tree]") === element.closest("[data-tree]")
    const labels = [...row.querySelectorAll<HTMLElement>("[data-tree-label]")].filter(own)
    if (labels.length !== 1) throw new TypeError("Each row needs exactly one data-tree-label.")
    const label = labels[0]!
    if (!["button", "a", "span"].includes(label.localName) || label.hasAttribute("role")
      || label instanceof view.HTMLButtonElement && label.type !== "button"
      || label instanceof view.HTMLAnchorElement && !label.hasAttribute("href")
      || label.hasAttribute("data-tree-select") && (!(label instanceof view.HTMLButtonElement) || element.hasAttribute("data-tree-group"))
      || label.querySelector("button,input,select,textarea,a,summary,[tabindex]")) throw new TypeError("Use a native type=button selection label, native link, or static span; group labels are not selection actions.")
    const checks = [...row.querySelectorAll<HTMLInputElement>("[data-tree-check]")].filter(own)
    const checkbox = checks[0] ?? null
    if (checks.length > 1 || checkbox && (!(checkbox instanceof view.HTMLInputElement) || checkbox.type !== "checkbox"
      || checkbox.hasAttribute("role") || !(checkbox.closest("label")?.textContent?.trim()
        || [...checkbox.labels ?? []].some(label => label.textContent?.trim())))) throw new TypeError("Use at most one labelled native input[type=checkbox][data-tree-check] per node.")
    let branch: HTMLDetailsElement | null = null, list: TreeNode["list"] = null, summary: HTMLElement | null = null
    if (branchNode) {
      if (!(branchNode instanceof view.HTMLDetailsElement) || branchNode.hasAttribute("name")
        || branchNode.hasAttribute("role") || branchNode.firstElementChild?.localName !== "summary") throw new TypeError("Branches need native details with first summary and no shared name.")
      branch = branchNode; summary = branch.firstElementChild as HTMLElement
      const childLists = [...branch.children].filter(node => node.hasAttribute("data-tree-list"))
      if (childLists.length !== 1 || summary.hasAttribute("role") || [...branch.children].filter(node => node.localName === "summary").length !== 1
        || summary.querySelector("a,button,input,select,textarea,label,[tabindex]")
        || !summary.textContent?.trim()) throw new TypeError("Keep branch summaries labelled and free of embedded controls; author one direct child list.")
      list = childLists[0] as TreeNode["list"]
      if (branch.hasAttribute("data-tree-lazy") && list!.children.length && addition?.list !== list) throw new TypeError("Unloaded lazy branches must have an empty child list.")
    } else if (element.hasAttribute("data-tree-group")) throw new TypeError("A group needs a native branch.")
    const target = label.localName === "span" ? summary : label
    const node: TreeNode = { key, element, parent, children: [], label, target, checkbox, branch, list, summary }
    if (!treeLabel(node)) throw new TypeError("Tree labels must be named.")
    nodes.push(node); byKey.set(key, node)
    if (parent) (parent.children as TreeNode[]).push(node)
    if (list) push(list, node, depth + 1)
  }
  const expected = new Set(nodes.map(node => node.element))
  for (const node of root.querySelectorAll("[data-tree-key]")) if (node.closest("[data-tree]") === root && !expected.has(node as HTMLLIElement)) throw new TypeError("Keep all owned tree nodes in the explicit nested-list hierarchy.")
  for (const node of nodes) { Object.freeze(node.children); Object.freeze(node) }
  return Object.freeze({ nodes: Object.freeze(nodes), byKey })
}
