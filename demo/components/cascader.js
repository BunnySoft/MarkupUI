import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICascader
  if (!api) throw new Error("Cascader runtime did not load.")
  void loadComponentApi(document.getElementById("cascader-api"), new URL("../api/cascader.json", import.meta.url))

  const basicCascader = document.getElementById("basic-cascader")
  const basicValue = document.getElementById("basic-value")
  if (basicCascader && basicValue) {
    basicCascader.addEventListener("m:cascader-change", event => {
      const detail = event.detail
      basicValue.textContent = `Selected: ${detail.value || "None"}; path: ${detail.path.join(" / ") || "None"}`
    })
  }

  const disabledCascader = document.getElementById("disabled-cascader")
  const toggleBtn = document.getElementById("toggle-disabled")
  if (disabledCascader && toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      disabledCascader.disabled = !disabledCascader.disabled
    })
  }
  document.getElementById("cascader-form").addEventListener("submit", event => {
    event.preventDefault()
    document.getElementById("form-value").textContent = `Path: ${new FormData(event.target).getAll("place").join(" / ")}`
  })
  document.getElementById("lazy-cascader").load = (_node, { signal }) => new Promise(resolve => {
    const timer = setTimeout(() => resolve({ nodes: [{ value: "remote-city", label: "Remote City" }] }), 150)
    signal.addEventListener("abort", () => { clearTimeout(timer); resolve({ nodes: [] }) }, { once: true })
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

