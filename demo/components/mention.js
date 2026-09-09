const editor = document.querySelector("#message"), form = document.querySelector("#compose-form")
const entry = MarkupUIInput.createInput(document.querySelector("#message-input"))
const validation = MarkupUIForm.createForm(form, { items: [{ key: "message", controls: [editor], feedback: document.querySelector("#message-error") }] })
const people = [{ value: "alice", label: "Alice Example" }, { value: "alex", label: "Alex Example" }, { value: "blocked", label: "Unavailable person", disabled: true }]
const topics = [{ value: "docs", label: "docs" }, { value: "forms", label: "forms" }, { value: "native", label: "native" }]
const mention = MarkupUIMention.createMention(editor, {
  panel: document.querySelector("#message-panel"), prefix: ["@", "#"], maxResults: 8,
  load: ({ query, prefix, signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort)
      if (query === "fail") reject(new Error("Simulated local mention search failure"))
      else if (query === "slow") resolve([{ value: "slow", label: "Delayed example" }])
      else resolve((prefix === "@" ? people : topics).filter(option => option.value.startsWith(query.toLowerCase())))
    }, query === "slow" ? 800 : 180)
    function abort() { clearTimeout(timer); reject(new DOMException("Superseded search", "AbortError")) }
    signal.addEventListener("abort", abort, { once: true })
  }),
})
const subject = MarkupUIMention.createMention(document.querySelector("#subject"), { panel: document.querySelector("#subject-panel"), prefix: "#", options: topics })
let selections = 0, inputs = 0
editor.addEventListener("input", () => { inputs++ })
editor.addEventListener("mui:mention-select", () => { document.querySelector("#events").textContent = `Explicit mention choices: ${++selections}; message input notifications: ${inputs}. No text logged.` })
editor.addEventListener("mui:mention-error", () => { document.querySelector("#events").textContent = "Local search failed; text and selection were not replaced." })
function inspect(event) {
  event.preventDefault()
  const data = new FormData(form, event.submitter)
  document.querySelector("#submission").textContent = `Native fields: ${[...data].length}; message code units: ${String(data.get("message") ?? "").length}. No text sent or displayed.`
}
form.addEventListener("submit", inspect)
document.querySelector("#sample").addEventListener("click", async () => {
  entry.setValue("Hello @al, followed by untouched text.")
  editor.focus(); editor.setSelectionRange(9, 9); mention.refresh(); validation.refresh()
  try { await mention.query() } catch { /* Explicit error event above handles search failures. */ }
})
document.querySelector("#limit").addEventListener("click", async () => {
  entry.setValue(`${"x".repeat(252)} @a`)
  editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length); mention.refresh(); validation.refresh()
  try { await mention.query() } catch { /* Explicit error event above handles search failures. */ }
})
document.querySelector("#readonly").addEventListener("click", () => { editor.readOnly = !editor.readOnly; entry.refresh(); mention.refresh(); validation.refresh() })
document.querySelector("#cancel").addEventListener("click", () => { form.addEventListener("reset", event => event.preventDefault(), { once: true }) })
document.querySelector("#rtl").addEventListener("click", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
const tools = ["sample", "limit", "readonly", "cancel", "disconnect"]
document.querySelector("#disconnect").addEventListener("click", () => {
  mention.disconnect(); subject.disconnect(); entry.disconnect(); validation.disconnect(); form.removeEventListener("submit", inspect)
  tools.forEach(id => { document.getElementById(id).hidden = true })
})
tools.forEach(id => { document.getElementById(id).hidden = false })
