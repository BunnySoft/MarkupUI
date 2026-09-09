const form = document.querySelector("#places"), city = document.querySelector("#city")
const events = document.querySelector("#events"), submission = document.querySelector("#submission")
const input = MarkupUIInput.createInput(document.querySelector("#city-input"))
const coordinator = MarkupUIForm.createForm(form, { items: [{
  key: "city", controls: [city], element: document.querySelector("#city-item"), feedback: document.querySelector("#city-error"),
}] })
const choices = [
  { value: "London", label: "United Kingdom" }, { value: "Lisbon", label: "Portugal" },
  { value: "Lyon", label: "France" }, { value: "Paris", label: "France" }, { value: "Tokyo", label: "Japan" },
]
const suggestions = MarkupUIAutoComplete.createAutoComplete(city, {
  debounce: 120, minLength: 1, maxResults: 8, status: document.querySelector("#suggestion-status"),
  load: (query, { signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort)
      if (query === "error") reject(new Error("Simulated local suggestion failure"))
      else if (query === "slow") resolve([{ value: "Slow example" }])
      else resolve(choices.filter(choice => choice.value.toLowerCase().includes(query.toLowerCase())))
    }, query === "slow" ? 800 : 200)
    function abort() { clearTimeout(timer); reject(new DOMException("Suggestion query cancelled", "AbortError")) }
    signal.addEventListener("abort", abort, { once: true })
  }),
})
let count = 0
city.addEventListener("mui:auto-complete-results", event => {
  events.textContent = `Result ${++count}: ${event.detail.suggestions.length} suggestions supplied for “${event.detail.query}”. This is not a selection event.`
})
city.addEventListener("mui:auto-complete-error", event => {
  events.textContent = `Loader error: ${event.detail.error instanceof Error ? event.detail.error.message : String(event.detail.error)}`
})
document.querySelector("#query").addEventListener("click", async () => {
  try { await suggestions.query() } catch { /* The explicit error event above presents the failure. */ }
})
document.querySelector("#validate").addEventListener("click", async () => {
  const result = await coordinator.validate()
  events.textContent = `Native form validation: ${result.status}. Free text need not match a suggestion.`
})
function inspect(event) {
  event.preventDefault()
  submission.textContent = JSON.stringify([...new FormData(form, event.submitter)], null, 2)
}
form.addEventListener("submit", inspect)
document.querySelector("#silent").addEventListener("click", () => {
  input.setValue("Unlisted town"); suggestions.refresh(); coordinator.refresh()
  events.textContent = "Native value changed silently; both optional coordinators explicitly refreshed."
})
document.querySelector("#disable").addEventListener("click", () => { city.disabled = !city.disabled; input.refresh(); suggestions.refresh(); coordinator.refresh() })
document.querySelector("#readonly").addEventListener("click", () => { city.readOnly = !city.readOnly; input.refresh(); suggestions.refresh(); coordinator.refresh() })
document.querySelector("#cancel").addEventListener("click", () => {
  form.addEventListener("reset", event => event.preventDefault(), { once: true }); events.textContent = "Next reset will be cancelled."
})
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
const tools = ["query", "validate", "silent", "disable", "readonly", "cancel", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  suggestions.disconnect(); input.disconnect(); coordinator.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
  events.textContent = "Helpers disconnected; original options and native controls/defaults/forms remain."
})
tools.forEach(id => { document.getElementById(id).hidden = false })
