const form = document.querySelector("#profile")
const field = id => document.getElementById(id)
const status = field("status"), submission = field("submission")
const input = MarkupUIInput.createInput(field("name-input"))
const item = (key, controls, validator) => ({
  key, controls, element: field(`${key}-item`), feedback: field(`${key}-error`),
  ...(validator ? { validator } : {}),
})
const helper = MarkupUIForm.createForm(form, { items: [
  item("name", [field("name")], ({ fields, signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort)
      resolve(fields.find(entry => entry.control === field("name")).value === "reserved"
        ? { message: "This example name is reserved. Choose another name." } : null)
    }, 250)
    function abort() { clearTimeout(timer); reject(new DOMException("Superseded local check", "AbortError")) }
    signal.addEventListener("abort", abort, { once: true })
  })),
  item("email", [field("email")]),
  item("confirm", [field("confirm")], ({ fields }) => {
    const value = id => fields.find(entry => entry.control === field(id)).value
    return value("email") === value("confirm") ? null : { message: "Email confirmation must match." }
  }),
  item("topics", [...form.querySelectorAll('input[name="topics[]"]')], ({ fields, controls }) =>
    fields.some(entry => controls.includes(entry.control) && entry.eligible && entry.checked)
      ? null : { message: "Choose at least one enabled topic." }),
] })
let intent = 0, submissions = 0
function announce(result) {
  status.textContent = result.status === "aborted" || !result.current ? "Validation cancelled; check the current values."
    : result.status === "invalid" ? `Validation failed: ${result.issues.filter(issue => issue.source !== "warning").length} issue(s). Review the field feedback.`
      : "Validation passed. No data sent."
}
form.addEventListener("mui:form-error", event => {
  status.textContent = `Local validator failed unexpectedly: ${event.detail.error instanceof Error ? event.detail.error.message : String(event.detail.error)}`
})
function inspect(submitter) {
  const entries = [...new FormData(form, submitter).entries()]
  submission.textContent = JSON.stringify({ submissions: ++submissions, entries }, null, 2)
}
async function onSubmit(event) {
  event.preventDefault()
  const ticket = ++intent, submitter = event.submitter
  helper.restoreValidation()
  if (form.noValidate || submitter?.formNoValidate) {
    inspect(submitter); status.textContent = "Draft inspected locally; native and custom checks explicitly skipped."; return
  }
  try {
    const result = await helper.validate({ reason: "submit" })
    if (ticket !== intent) return
    announce(result)
    if (result.status === "valid" && result.current && (!submitter || submitter.isConnected && submitter.form === form && !submitter.matches(":disabled"))) inspect(submitter)
  } catch { /* mui:form-error above reports unexpected validator failures; never submit on failure. */ }
}
form.addEventListener("submit", onSubmit)
field("validate").addEventListener("click", async () => {
  try { announce(await helper.validate()) } catch { /* Reported by mui:form-error. */ }
})
field("report").addEventListener("click", () => helper.reportValidity())
field("restore").addEventListener("click", () => { ++intent; helper.restoreValidation(); status.textContent = "Owned feedback restored; values and external custom validity unchanged." })
field("cancel").addEventListener("click", () => {
  form.addEventListener("reset", event => event.preventDefault(), { once: true }); status.textContent = "Next reset will be cancelled."
})
field("rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
field("disconnect").addEventListener("click", () => {
  ++intent; helper.disconnect(); input.disconnect()
  form.removeEventListener("submit", onSubmit)
  status.textContent = "Helpers disconnected. Native controls, values, defaults and validation remain."
  for (const id of ["validate", "report", "restore", "cancel", "disconnect"]) field(id).hidden = true
})
for (const id of ["validate", "report", "restore", "cancel", "disconnect"]) field(id).hidden = false
