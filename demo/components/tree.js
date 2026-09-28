import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITree
  if (!api) throw new Error("Tree runtime did not load.")
  void loadComponentApi(document.getElementById("tree-api"), new URL("../api/tree.json", import.meta.url))

  const selectableTree = document.getElementById("selectable-tree")
  const selectionStatus = document.getElementById("selection-status")
  if (selectableTree && selectionStatus) {
    selectableTree.addEventListener("m:tree-select", (event) => {
      selectionStatus.textContent = `Selected: ${event.detail.selectedKeys.join(", ") || "none"}`
    })
  }

  const checkableTree = document.getElementById("checkable-tree")
  const checkableStatus = document.getElementById("checkable-status")
  if (checkableTree && checkableStatus) {
    checkableTree.addEventListener("m:tree-check", (event) => {
      checkableStatus.textContent = `Checked: ${event.detail.keys.join(", ") || "none"}`
    })
  }

  const actionsTree = document.getElementById("actions-tree")
  const btnSelect = document.getElementById("btn-select-components")
  if (btnSelect && actionsTree) {
    btnSelect.addEventListener("click", () => {
      actionsTree.selectedKeys = ["components"]
    })
  }

  const btnExpand = document.getElementById("btn-expand-all")
  if (btnExpand && actionsTree) {
    btnExpand.addEventListener("click", () => {
      actionsTree.expandedKeys = actionsTree.nodes.filter(node => node.branch).map(node => node.key)
    })
  }

  const btnCollapse = document.getElementById("btn-collapse-all")
  if (btnCollapse && actionsTree) {
    btnCollapse.addEventListener("click", () => {
      actionsTree.expandedKeys = []
    })
  }

  const form = document.getElementById("tree-form")
  form.addEventListener("submit", event => {
    event.preventDefault()
    document.getElementById("form-status").textContent = `Files: ${new FormData(event.target).getAll("files").join(", ") || "none"}`
  })
  const lazy = document.getElementById("lazy-tree")
  lazy.load = (_node, { signal }) => new Promise(resolve => {
    const timer = setTimeout(() => resolve({ nodes: [
      { value: "remote-readme", title: "Remote README" },
      { value: "remote-license", title: "Remote LICENSE" },
    ] }), 200)
    signal.addEventListener("abort", () => { clearTimeout(timer); resolve({ nodes: [] }) }, { once: true })
  })
  lazy.addEventListener("m:tree-load", () => { document.getElementById("lazy-status").textContent = "Remote files loaded" })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

