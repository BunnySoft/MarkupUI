const field = document.querySelector("#otp"), form = document.querySelector("#verification")
const input = MarkupUIInput.createInput(document.querySelector("#otp-input"))
const otp = MarkupUIInputOtp.createInputOtp(field, { status: document.querySelector("#otp-status") })
const coordinator = MarkupUIForm.createForm(form, { items: [{
  key: "code", controls: [field], element: document.querySelector("#otp-item"), feedback: document.querySelector("#otp-error"),
}] })
let completions = 0
field.addEventListener("mui:input-otp-complete", () => {
  document.querySelector("#completion").textContent = `Completion signals: ${++completions}. Format only; no authentication or submission.`
})
function inspect(event) {
  event.preventDefault()
  const fields = new FormData(form, event.submitter)
  document.querySelector("#submission").textContent = `Local submission prevented. Named code fields: ${fields.getAll("code").length}. No code sent, logged or displayed.`
}
form.addEventListener("submit", inspect)
function refresh() { input.refresh(); otp.refresh(); coordinator.refresh() }
document.querySelector("#dummy").addEventListener("click", () => { input.setValue("001234"); refresh() })
document.querySelector("#clear").addEventListener("click", () => { input.setValue(""); refresh() })
document.querySelector("#mask").addEventListener("click", () => {
  field.type = field.type === "password" ? "text" : "password"; refresh()
})
document.querySelector("#readonly").addEventListener("click", () => { field.readOnly = !field.readOnly; refresh() })
document.querySelector("#disable").addEventListener("click", () => { field.disabled = !field.disabled; refresh() })
document.querySelector("#cancel").addEventListener("click", () => { form.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.querySelector("#validate").addEventListener("click", () => coordinator.reportValidity())
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
const tools = ["dummy", "clear", "mask", "readonly", "disable", "cancel", "validate", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  otp.disconnect(); input.disconnect(); coordinator.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
})
tools.forEach(id => { document.getElementById(id).hidden = false })
