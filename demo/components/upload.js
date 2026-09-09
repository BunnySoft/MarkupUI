import { createUpload } from "../../dist/markup-ui-upload.js"

const root = document.querySelector("#upload"), feedback = document.querySelector("#feedback")
const calls = []
function fakeTransport(file, context) {
  const ignore = document.querySelector("#ignore-abort").checked
  const call = { name: file.name, id: context.id, attempt: context.attempt, ignoredAbort: ignore, settled: false }
  calls.push(call)
  return new Promise((resolve, reject) => {
    let step = 0
    function finish(error) {
      clearInterval(timer); context.signal.removeEventListener("abort", abort); call.settled = true
      if (error) reject(error)
      else resolve({ status: "finished", response: { localSimulationOnly: true, name: file.name } })
    }
    function abort() { if (!ignore) finish(new DOMException("Local fake request cancelled", "AbortError")) }
    const timer = setInterval(() => {
      ++step
      context.reportProgress(Math.min(file.size, Math.ceil(file.size * step / 5)), file.size)
      if (step < (ignore ? 10 : 5)) return
      finish(file.name.includes("fail-once") && context.attempt === 1 ? new Error("Intentional first-attempt local failure") : null)
    }, 180)
    context.signal.addEventListener("abort", abort, { once: true })
    if (context.signal.aborted) abort()
  })
}
let upload
try {
  upload = createUpload(root, { transport: fakeTransport, selection: "append", maxFiles: 5, maxFileBytes: 16 * 1024, concurrency: 2 })
} catch (error) {
  feedback.textContent = `Enhancement unavailable: ${error.message}\nUse the original native chooser and form; no transport was installed.`
}
if (upload) {
window.uploadDemo = { upload, calls }
const summarize = () => { feedback.textContent = JSON.stringify({ state: upload.state, files: upload.files.map(({ id, name, size, status, attempt, loaded, total }) => ({ id, name, size, status, attempt, loaded, total })), calls }, null, 2) }
root.addEventListener("mui:upload-change", summarize)
root.addEventListener("mui:upload-error", event => { feedback.textContent = `${event.detail.phase}: ${String(event.detail.error)}` })
document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = false })
document.querySelector("#fixtures").addEventListener("click", () => {
  try { upload.add([new File(["Local draft text."], "draft.txt", { type: "text/plain" }),
    new File(["Local retry example."], "fail-once.txt", { type: "text/plain" })], document.querySelector("#mode").value) }
  catch (error) { feedback.textContent = error.message }
})
document.querySelector("#disabled").addEventListener("change", event => { document.querySelector("#upload-fields").disabled = event.target.checked })
document.querySelector("#rtl").addEventListener("change", event => { root.dir = event.target.checked ? "rtl" : "ltr" })
for (const [id, name] of [["narrow", "narrow"], ["zoom", "zoomed"]]) {
  document.querySelector(`#${id}`).addEventListener("change", event => root.classList.toggle(name, event.target.checked))
}
document.querySelector("#external-clear").addEventListener("click", () => { upload.input.value = ""; upload.refresh(); summarize() })
document.querySelector("#disconnect").addEventListener("click", () => {
  upload.disconnect(); document.querySelector(".demo-controls").hidden = true
  feedback.textContent = "Disconnected. Latest native file selection remains. Ignored-abort fake calls may still hold ownership until they actually settle; no requests were transmitted."
})
document.querySelector("#upload-form").addEventListener("reset", event => {
  if (document.querySelector("#prevent-reset").checked) event.preventDefault()
})
document.querySelector("#upload-form").addEventListener("submit", event => {
  event.preventDefault()
  feedback.textContent = JSON.stringify([...new FormData(event.currentTarget)].map(([name, value]) => ({
    name, value: value instanceof File ? { name: value.name, size: value.size, type: value.type } : value,
  })), null, 2)
})
summarize()
}
