const { createTree } = MarkupUITree
const root = document.querySelector("#files"), events = document.querySelector("#events")
for (const button of document.querySelectorAll("[data-tree-enable]")) button.disabled = false
let disposals = 0, loads = 0
function fresh(key, text) {
  const template = document.querySelector("#lazy-row")
  const row = document.importNode(template.content.firstElementChild, true)
  row.setAttribute("data-tree-key", key)
  row.querySelector("button").textContent = text
  row.querySelector("input").value = key
  row.querySelector("span").textContent = ` Include ${text}`
  return row
}
const tree = createTree(root, {
  multiple: true, cascade: true,
  load(node, { signal }) {
    loads++
    const duplicate = document.querySelector("#duplicate").checked
    const ignore = document.querySelector("#ignore-abort").checked
    return new Promise(resolve => {
      const aborted = () => {
        events.textContent = `Aborted ${node.key}; stale results cannot expand or insert.`
        if (!ignore) { clearTimeout(timer); signal.removeEventListener("abort", aborted); resolve({ nodes: [] }) }
      }
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", aborted)
        resolve({ nodes: [fresh(duplicate ? "readme" : "remote-a", "Remote A"), fresh("remote-b", "Remote B")], dispose() { disposals++ } })
      }, 250)
      signal.addEventListener("abort", aborted, { once: true })
    })
  },
})
const independent = createTree(document.querySelector("#independent"))
function inspect() {
  document.querySelector("#state").textContent = JSON.stringify({
    selected: tree.selectedKeys, checked: tree.getCheckedData().keys, parentReport: tree.getCheckedData("parent").keys,
    childReport: tree.getCheckedData("child").keys, mixed: tree.getIndeterminateData().keys,
    expanded: tree.expandedKeys, loading: tree.loadingKeys, nodes: tree.nodes.length, loads, disposals,
  }, null, 2)
}
for (const type of ["select", "check", "expand", "load", "error"]) root.addEventListener(`mui:tree-${type}`, event => {
  events.textContent = type === "error" ? `Tree error: ${event.detail.error?.message}` : `Native tree ${type} notification.`
  inspect()
})
function action(id, callback) { document.getElementById(id).addEventListener("click", () => { callback(); inspect() }) }
action("select", () => tree.setSelectedKeys(["notes"]))
action("check", () => tree.setCheckedKeys(["project"]))
action("reveal", () => tree.reveal("notes"))
action("rename", () => { tree.nodes.find(node => node.key === "notes").label.textContent = "Zulu notes"; tree.refresh() })
action("race", () => {
  void tree.expand("remote").catch(error => { events.textContent = error.message })
  tree.setExpandedKeys(tree.expandedKeys.filter(key => key !== "remote"))
})
action("retry", () => { void tree.expand("remote").then(inspect).catch(error => { events.textContent = error.message; inspect() }) })
action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
action("disconnect", () => {
  tree.disconnect(); independent.disconnect()
  document.querySelector("#tools").hidden = true
  for (const button of document.querySelectorAll("[data-tree-enable]")) button.disabled = true
  events.textContent = "Disconnected. Authored details, links and native checks remain; loaded rows/resources were released."
})
document.querySelector("#files-form").addEventListener("submit", event => {
  event.preventDefault(); document.querySelector("#submission").textContent = JSON.stringify([...new FormData(event.currentTarget)], null, 2)
})
document.querySelector("#files-form").addEventListener("reset", () => setTimeout(inspect, 0))
document.querySelector("#tools").hidden = false
inspect()
window.treeDemo = { tree, independent, fresh, inspect }
