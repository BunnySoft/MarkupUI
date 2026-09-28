import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIUpload
  if (!api) throw new Error("Upload runtime did not load.")
  void loadComponentApi(document.getElementById("upload-api"), new URL("../api/upload.json", import.meta.url))

  const transport = (file, { signal, reportProgress }) => new Promise((resolve, reject) => {
    let loaded = 0
    const timer = setInterval(() => {
      loaded = Math.min(file.size, loaded + Math.max(1, Math.ceil(file.size / 4)))
      reportProgress(loaded, file.size)
    }, 200)
    const finish = setTimeout(() => {
      cleanup()
      resolve({ status: "finished", response: { simulated: true } })
    }, 1200)
    const abort = () => { cleanup(); reject(new DOMException("Local simulation cancelled", "AbortError")) }
    const cleanup = () => { clearInterval(timer); clearTimeout(finish); signal.removeEventListener("abort", abort) }
    signal.addEventListener("abort", abort, { once: true })
    if (signal.aborted) abort()
  })
  const basicUpload = document.getElementById("basic-upload")
  basicUpload.options = { transport, maxFiles: 5, concurrency: 2 }
  basicUpload.addEventListener("m:upload-change", event => {
    document.getElementById("upload-status").textContent = event.detail.files.length
      ? event.detail.files.map(file => `${file.name}: ${file.status}`).join("; ")
      : "No files selected."
  })
  document.getElementById("dragger-upload").options = { transport, selection: "append", maxFiles: 5 }
  document.getElementById("upload-form").addEventListener("submit", event => {
    event.preventDefault()
    const names = new FormData(event.target).getAll("attachments").filter(file => file.name).map(file => file.name)
    document.getElementById("form-value").textContent = `Files: ${names.join(", ") || "none"}`
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
