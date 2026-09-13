import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUITree
  if (!api) throw new Error("Tree runtime did not load.")
  void loadComponentApi(document.getElementById("tree-api"), new URL("../api/tree.json", import.meta.url))

  const selectableTree = document.getElementById("selectable-tree")
  const selectionStatus = document.getElementById("selection-status")
  if (selectableTree && selectionStatus) {
    selectableTree.addEventListener("m:select", (event) => {
      selectionStatus.textContent = `Selected: ${event.detail.value}`
    })
  }

  const checkableTree = document.getElementById("checkable-tree")
  const checkableStatus = document.getElementById("checkable-status")
  if (checkableTree && checkableStatus) {
    checkableTree.addEventListener("m:check", (event) => {
      checkableStatus.textContent = `Checked: ${event.detail.checkedKeys.join(", ") || "none"}`
    })
  }

  const actionsTree = document.getElementById("actions-tree")
  const btnSelect = document.getElementById("btn-select-components")
  if (btnSelect && actionsTree) {
    btnSelect.addEventListener("click", () => {
      actionsTree.value = "components"
    })
  }

  const btnExpand = document.getElementById("btn-expand-all")
  if (btnExpand && actionsTree) {
    btnExpand.addEventListener("click", () => {
      actionsTree.querySelectorAll("m-tree-node").forEach((node) => {
        node.expanded = true
      })
    })
  }

  const btnCollapse = document.getElementById("btn-collapse-all")
  if (btnCollapse && actionsTree) {
    btnCollapse.addEventListener("click", () => {
      actionsTree.querySelectorAll("m-tree-node").forEach((node) => {
        node.expanded = false
      })
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

