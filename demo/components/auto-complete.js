import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIAutoComplete
  if (!api) throw new Error("AutoComplete runtime did not load.")
  void loadComponentApi(document.getElementById("auto-complete-api"), new URL("../api/auto-complete.json", import.meta.url))

  const basicAc = document.getElementById("basic-auto-complete")
  const basicOutput = document.getElementById("basic-output")
  if (basicAc && basicOutput) {
    basicAc.addEventListener("m:change", event => {
      const detail = event.detail
      basicOutput.textContent = `Current value: ${detail?.value || ""}`
    })
    basicAc.addEventListener("input", () => {
      basicOutput.textContent = `Editing: ${basicAc.value}`
    })
  }

  const clearableAc = document.getElementById("clearable-auto-complete")
  const setClearableBtn = document.getElementById("set-clearable-btn")
  if (clearableAc && setClearableBtn) {
    setClearableBtn.addEventListener("click", () => {
      clearableAc.value = "React"
    })
  }

  const disabledAc = document.getElementById("disabled-auto-complete")
  const toggleDisabledBtn = document.getElementById("toggle-disabled-btn")
  if (disabledAc && toggleDisabledBtn) {
    toggleDisabledBtn.addEventListener("click", () => {
      disabledAc.disabled = !disabledAc.disabled
    })
  }

  const asyncAc = document.getElementById("async-auto-complete")
  const asyncOutput = document.getElementById("async-output")
  const queryBtn = document.getElementById("query-btn")
  if (asyncAc && asyncOutput && queryBtn) {
    asyncAc.options = [{ value: "Paris", label: "France" }, { value: "Tokyo", label: "Japan" }]
    asyncAc.load = async (query, { signal }) => {
      await new Promise((resolve, reject) => {
        const finish = () => { signal.removeEventListener("abort", abort); resolve() }
        const timer = setTimeout(finish, 120)
        const abort = () => { clearTimeout(timer); reject(new DOMException("Query cancelled", "AbortError")) }
        if (signal.aborted) abort()
        else signal.addEventListener("abort", abort, { once: true })
      })
      if (query.toLowerCase() === "error") throw new Error("Demo query failed; free text remains available.")
      return [{ value: query, label: "Queried text" }, { value: `${query} City`, label: "Loaded suggestion" }]
    }
    asyncAc.addEventListener("m:auto-complete-results", event => {
      asyncOutput.textContent = `${event.detail.suggestions.length} suggestions for “${event.detail.query}”; value remains “${asyncAc.value}”.`
    })
    asyncAc.addEventListener("m:auto-complete-error", event => {
      asyncOutput.textContent = `Query error: ${event.detail.error instanceof Error ? event.detail.error.message : String(event.detail.error)}`
    })
    queryBtn.addEventListener("click", async () => {
      try {
        const result = await asyncAc.query()
        if (result.status !== "updated") asyncOutput.textContent = `Query ${result.status}; value remains “${asyncAc.value}”.`
      } catch {
        // The shared owner's error event presents the failure above.
      }
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

