const { createCascader } = MarkupUICascader
const root = document.querySelector("#location"), form = document.querySelector("#location-form")
const events = document.querySelector("#events")
root.disabled = false
document.querySelector("#branch").disabled = false
let loads = 0, disposals = 0
function fresh(key, label) {
  const row = document.importNode(document.querySelector("#lazy-source").content.firstElementChild, true)
  row.dataset.treeKey = key; row.querySelector("[data-tree-label]").textContent = label; return row
}
const cascader = createCascader(root, {
  defaultValue: "paris",
  load(node, { signal }) {
    loads++
    const ignore = document.querySelector("#ignore-abort").checked, duplicate = document.querySelector("#duplicate").checked
    return new Promise(resolve => {
      const aborted = () => {
        events.textContent = `Aborted ${node.key}; obsolete children cannot replace the new path.`
        if (!ignore) { clearTimeout(timer); signal.removeEventListener("abort", aborted); resolve({ nodes: [] }) }
      }
      const timer = setTimeout(() => {
        signal.removeEventListener("abort", aborted)
        resolve({ nodes: [fresh(duplicate ? "paris" : "remote-a", "Lazy City A"), fresh("remote-b", "Lazy City B")],
          dispose() { disposals++ } })
      }, 1000)
      signal.addEventListener("abort", aborted, { once: true })
    })
  },
})
const branch = createCascader(document.querySelector("#branch"), { selection: "any", defaultValue: "category", separator: " → " })
function inspect() {
  document.querySelector("#state").textContent = JSON.stringify({ ...cascader.state, nativeFields: [...new FormData(form)], loads, disposals }, null, 2)
}
for (const type of ["change", "load", "error"]) root.addEventListener(`mui:cascader-${type}`, event => {
  events.textContent = type === "error" ? `Cascader error: ${event.detail.error?.message}` : `Cascader ${type}: ${event.detail.value ?? "no terminal value"}`
  inspect()
})
function action(id, callback) {
  document.getElementById(id).addEventListener("click", () => { try { callback(); inspect() } catch (error) { events.textContent = error.message } })
}
action("new-york", () => cascader.setValue("nyc"))
action("default-lyon", () => cascader.setDefaultValue("lyon"))
action("cancel-reset", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
action("missing-default", () => { root.querySelector('[data-tree-key="paris"]')?.remove(); cascader.refresh() })
action("rename", () => { root.querySelector('[data-tree-key="lyon"] [data-tree-label]').textContent = "Lyon — renamed"; cascader.refresh() })
action("retry", () => { void cascader.load().then(inspect).catch(error => { events.textContent = error.message; inspect() }) })
action("race", () => {
  cascader.setPath(["remote"]); void cascader.load().catch(error => { events.textContent = error.message })
  cascader.clear()
})
action("disabled", () => { root.disabled = !root.disabled; cascader.refresh() })
action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
action("disconnect", () => {
  cascader.disconnect(); branch.disconnect()
  root.disabled = true; document.querySelector("#branch").disabled = true
  document.querySelector("#tools").hidden = true
  events.textContent = "Disconnected; author options/fields restored and demonstration fields disabled. Static hierarchies remain."
})
for (const target of [form, document.querySelector("#branch-form")]) target.addEventListener("submit", event => {
  if (event.defaultPrevented) return
  event.preventDefault()
  document.querySelector("#submission").textContent = JSON.stringify({ nativeFields: [...new FormData(target)], state: target === form ? cascader.state : branch.state }, null, 2)
})
form.addEventListener("reset", () => setTimeout(inspect, 0))
document.querySelector("#tools").hidden = false
inspect()
window.cascaderDemo = { cascader, branch, fresh, inspect }
