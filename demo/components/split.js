import { createSplit } from "../../dist/markup-ui-split.js"

const outer = createSplit(document.querySelector("#editor-split"), { defaultSize: .5 })
const inner = createSplit(document.querySelector("#detail-split"), { defaultSize: .45 })
const owners = [outer, inner]
const form = document.querySelector("#split-form"), feedback = document.querySelector("#feedback")
const title = document.querySelector("#title-field")
const counts = { change: 0, start: 0, move: 0, end: 0 }
function show(extra = {}) { feedback.textContent = JSON.stringify({ ...extra, ...counts, outer: outer.state, inner: inner.state }, null, 2) }
for (const owner of owners) {
  for (const [event, key] of [["mui:split-change", "change"], ["mui:split-drag-start", "start"], ["mui:split-drag-move", "move"], ["mui:split-drag-end", "end"]]) {
    owner.element.addEventListener(event, e => {
      if (e.target !== owner.element) return
      counts[key]++; show({ event, source: e.detail.source, reason: e.detail.reason, cancelled: e.detail.cancelled })
    })
  }
  owner.element.addEventListener("mui:split-layout", event => { if (event.target === owner.element) show({ layout: true }) })
  owner.element.addEventListener("mui:split-error", event => {
    if (event.target !== owner.element) return
    owners.slice().reverse().forEach(split => split.disconnect())
    document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = true })
    form.querySelector('[type="submit"]').disabled = true
    show({ error: String(event.detail.error), fallback: "Native panes remain in static layout. Repair the unsupported context and rebind." })
  })
}
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
form.querySelector('[type="submit"]').disabled = false
const actions = {
  quarter: () => outer.set({ size: .25 }),
  pixels: () => outer.set({ size: "240px" }),
  reset: () => outer.reset(),
  default: () => outer.setDefaultSize("180px"),
  "collapse-first": () => outer.set({ min: 0, max: 1, size: 0 }),
  "collapse-second": () => outer.set({ min: 0, max: 1, size: 1 }),
  reveal: () => { outer.revealPane(1); outer.revealPane(2); inner.revealPane(1); inner.revealPane(2) },
  infeasible: () => { outer.element.setAttribute("data-narrow", ""); outer.set({ min: "300px", max: .4 }); outer.refresh() },
  normal: () => { outer.element.removeAttribute("data-narrow"); outer.set({ min: 0, max: 1 }); outer.refresh() },
  invalid: () => { title.value = ""; outer.set({ min: 0, max: 1, size: 0 }) },
  quiet: () => { show({ nativeValid: form.checkValidity() }); return false },
  disconnect: () => {
    owners.slice().reverse().forEach(owner => owner.disconnect())
    document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = true })
    form.querySelector('[type="submit"]').disabled = true
    document.querySelector("#outside-field").focus()
  },
}
for (const [name, action] of Object.entries(actions)) document.querySelector(`[data-action="${name}"]`).addEventListener("click", () => {
  try { if (action() !== false) show({ action: name }) } catch (error) { show({ error: String(error) }) }
})
document.querySelector("[data-direction]").addEventListener("change", event => { outer.set({ direction: event.target.value }); show() })
document.querySelector("[data-disabled]").addEventListener("change", event => { outer.set({ disabled: event.target.checked }); show() })
document.querySelector("[data-rtl]").addEventListener("change", event => { outer.element.dir = event.target.checked ? "rtl" : "ltr"; outer.refresh(); inner.refresh(); show() })
document.querySelector("[data-zoom]").addEventListener("change", event => { document.querySelector("#stage").dataset.zoom = event.target.value; outer.refresh(); inner.refresh(); show() })
document.querySelector("[data-note-action]").addEventListener("click", () => { title.value = "Updated native field without replacing its node" })
form.addEventListener("submit", event => {
  event.preventDefault()
  const invalid = [...form.elements].find(control => control.willValidate && !control.validity.valid)
  if (invalid) {
    for (const owner of owners) {
      const pane = owner.pane1.contains(invalid) ? 1 : owner.pane2.contains(invalid) ? 2 : null
      if (pane && owner.connected && !owner.revealPane(pane)) { show({ error: "Current bounds/visibility cannot reveal this field. Adjust layout or disconnect to static panes." }); return }
    }
    invalid.focus(); invalid.reportValidity()
    show({ error: "First invalid native field explicitly revealed.", field: invalid.name })
    return
  }
  show({ nativeFormData: [...new FormData(form)] })
})
show()
globalThis.splitDemo = { outer, inner, form, counts }
