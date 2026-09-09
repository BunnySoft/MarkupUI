const { createTreeSelect } = MarkupUITreeSelect
const form = document.querySelector("#files-form"), singleRoot = document.querySelector("#single"), multipleRoot = document.querySelector("#multiple")
const single = createTreeSelect(singleRoot), multiple = createTreeSelect(multipleRoot, { selection: "leaf" })
const nativeValue = control => [...control.options].filter(option => option.selected).map(option => option.value)
function inspect() {
  document.querySelector("#state").textContent = JSON.stringify({
    single: single.connected ? single.state : { handedOff: nativeValue(single.control) },
    multiple: multiple.connected ? multiple.state : { handedOff: nativeValue(multiple.control) },
    nativeFields: [...new FormData(form)],
  }, null, 2)
}
for (const root of [singleRoot, multipleRoot]) {
  root.addEventListener("mui:tree-select-change", event => {
    document.querySelector("#events").textContent = `${root.id}: ${event.detail.action}, ${JSON.stringify(event.detail.value)}`
    inspect()
  })
  root.addEventListener("mui:tree-select-error", event => { document.querySelector("#events").textContent = event.detail.error.message; inspect() })
}
function action(id, callback) {
  document.getElementById(id).addEventListener("click", () => {
    try { callback(); inspect() } catch (error) { document.querySelector("#events").textContent = error.message }
  })
}
action("select", () => single.setValue("media-guide"))
action("defaults", () => single.setDefaultValue("notes"))
action("remove", () => { singleRoot.querySelector('[data-tree-key="docs-guide"]')?.remove(); single.refresh() })
action("rename", () => {
  for (const root of [singleRoot, multipleRoot]) root.querySelector('[data-tree-key="docs"] [data-tree-label]').textContent = "Manuals"
  single.refresh(); multiple.refresh()
})
action("disable-path", () => {
  singleRoot.querySelector('[data-tree-key="docs"]').toggleAttribute("data-tree-disabled")
  single.refresh()
})
action("cancel-reset", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
action("fieldset", () => { multipleRoot.disabled = !multipleRoot.disabled; multiple.refresh() })
action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
action("disconnect", () => {
  single.disconnect(); multiple.disconnect(); document.querySelector("#tools").hidden = true
  document.querySelector("#events").textContent = "Handed off: current native options, values and surviving defaults remain usable. Removed data was not restored."
})
form.addEventListener("submit", event => {
  if (event.defaultPrevented) return
  event.preventDefault(); document.querySelector("#submission").textContent = JSON.stringify([...new FormData(form)], null, 2)
})
form.addEventListener("reset", () => setTimeout(inspect, 10))
document.querySelector("#tools").hidden = false
inspect()
window.treeSelectDemo = { single, multiple, inspect }
