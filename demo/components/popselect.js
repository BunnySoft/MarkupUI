import { createPopselect } from "../../dist/markup-ui-popselect.js"
import { createForm } from "../../dist/markup-ui-form.js"

const formElement = document.querySelector("#preferences-form")
const feedback = document.querySelector("#feedback")
const single = createPopselect(document.querySelector("#work-mode"), { placement: "bottom-start" })
const multiple = createPopselect(document.querySelector("#channels"), { placement: "bottom-start" })
const nested = createPopselect(document.querySelector("#nested"), { placement: "right-start" })
const choices = [single, multiple, nested]
const form = createForm(formElement, { items: choices.map(choice => ({ key: choice.control.name, controls: [choice.control] })) })
let changes = 0, additions = 0
const show = detail => { feedback.textContent = JSON.stringify(detail, null, 2) }
const value = choice => choice.connected ? choice.value : choice.control.multiple
  ? [...choice.control.options].filter(option => option.selected).map(option => option.value)
  : choice.control.selectedIndex < 0 ? null : choice.control.value
function handoff(message) {
  form.disconnect()
  choices.slice().reverse().forEach(choice => choice.disconnect())
  document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = true })
  formElement.querySelector('[type="submit"]').disabled = true
  show(message)
}
for (const choice of choices) {
  choice.control.addEventListener("change", event => {
    changes++
    show({ nativeChanges: changes, trusted: event.isTrusted, workMode: value(single), channels: value(multiple), detail: value(nested) })
  })
  choice.trigger.closest("[data-popselect]").addEventListener("mui:popselect-error", event => handoff({
    error: String(event.detail.error), fallback: "Current native choices remain inline. Reload after repairing the unsupported context."
  }))
}
document.querySelectorAll("[data-enhancement],[data-js-only]").forEach(node => { node.hidden = false })
formElement.querySelector('[type="submit"]').disabled = false
formElement.addEventListener("submit", async event => {
  event.preventDefault()
  const result = await form.validate()
  if (!form.connected) return
  if (!result.current) { show({ state: "Validation became stale; retry explicitly." }); return }
  if (result.status !== "valid") {
    const issue = result.issues[0]
    const choice = choices.find(choice => choice.control === issue?.control)
    if (choice) {
      for (const ancestor of choices.filter(candidate => candidate !== choice && candidate.panel.contains(choice.trigger))) {
        ancestor.trigger.scrollIntoView({ block: "nearest", behavior: "instant" })
        if (!ancestor.reveal()) { show({ error: "Ancestor choices cannot be revealed. Enable/open their native context first." }); return }
      }
      choice.trigger.scrollIntoView({ block: "nearest", behavior: "instant" })
      if (!choice.reveal()) { show({ error: "Choices cannot be revealed. Enable the opener or explicitly disconnect to inline choices." }); return }
      choice.control.focus()
      choice.control.reportValidity()
      show({ state: "First invalid native field explicitly revealed.", field: choice.control.name })
    } else show({ state: result.status })
    return
  }
  show({ state: "valid", nativeFormData: [...new FormData(formElement)], nativeChanges: changes })
})
document.querySelector("[data-quiet]").addEventListener("click", async () => {
  const result = await form.validate()
  if (!form.connected) return
  show({ state: result.status, open: choices.map(choice => choice.show), nativeChanges: changes })
})
document.querySelector("[data-program-clear]").addEventListener("click", () => { single.clear(); show({ value: single.value, nativeChanges: changes }) })
document.querySelector("[data-program-set]").addEventListener("click", () => { single.setValue("hybrid"); show({ value: single.value, nativeChanges: changes }) })
document.querySelector("[data-add-option]").addEventListener("click", () => {
  const option = document.createElement("option")
  option.value = `new-${++additions}`; option.textContent = `Added native option ${additions}`
  single.control.append(option); single.refresh()
  show({ value: single.value, options: single.control.options.length, nativeChanges: changes })
})
document.querySelector("[data-native-disabled]").addEventListener("change", event => {
  document.querySelector("#native-channels").disabled = event.target.checked
})
formElement.addEventListener("reset", event => setTimeout(() => {
  if (!event.defaultPrevented) document.querySelector("#native-channels").disabled = document.querySelector("[data-native-disabled]").checked
}, 0))
document.querySelector("[data-rtl]").addEventListener("click", () => {
  document.querySelector("main").dir = document.querySelector("main").dir === "rtl" ? "ltr" : "rtl"
  choices.forEach(choice => choice.syncPosition())
})
document.querySelector("[data-disconnect]").addEventListener("click", () => {
  handoff({ state: "All current native choices are inline. Values/defaults/nodes remain; application validation enhancement has ended." })
  document.querySelector("#outside-field").focus()
})
globalThis.popselectDemo = { single, multiple, nested, form, formElement, get changes() { return changes } }
