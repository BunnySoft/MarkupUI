import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiElement = document.getElementById("mention-api")
  if (apiElement) {
    void loadComponentApi(apiElement, new URL("../api/mention.json", import.meta.url))
  }

  const basicMention = document.getElementById("basic-mention")
  const basicOutput = document.getElementById("basic-output")
  if (basicMention && basicOutput) {
    basicMention.addEventListener("m:select", event => {
      const detail = event.detail
      basicOutput.textContent = `Selected: ${detail?.value ?? ""}`
    })
  }

  const tagMention = document.getElementById("tag-mention")
  const tagOutput = document.getElementById("tag-output")
  if (tagMention && tagOutput) {
    tagMention.addEventListener("m:select", event => {
      const detail = event.detail
      tagOutput.textContent = `Selected: ${detail?.value ?? ""}`
    })
  }

  const disabledMention = document.getElementById("disabled-mention")
  const toggleDisabledBtn = document.getElementById("toggle-disabled-btn")
  if (disabledMention && toggleDisabledBtn) {
    toggleDisabledBtn.addEventListener("click", () => {
      disabledMention.disabled = !disabledMention.disabled
    })
  }

  document.getElementById("toggle-readonly-btn")?.addEventListener("click", () => {
    if (disabledMention) disabledMention.readOnly = !disabledMention.readOnly
  })

  const asyncMention = document.getElementById("async-mention")
  const asyncOutput = document.getElementById("async-output")
  if (asyncMention && asyncOutput) {
    asyncMention.configure({
      prefix: ["@", "#"],
      debounce: 120,
      load: ({ prefix, query, signal }) => new Promise((resolve, reject) => {
        const options = prefix === "@"
          ? [{ value: "alice", label: "alice (design)" }, { value: "alex", label: "alex (engineering)" }]
          : [{ value: "general" }, { value: "announcements" }, { value: "random" }]
        const timer = setTimeout(() => {
          signal.removeEventListener("abort", cancel)
          resolve(options.filter(option => (option.label ?? option.value).startsWith(query)))
        }, 350)
        const cancel = () => {
          clearTimeout(timer)
          asyncOutput.textContent = "Previous request cancelled; native editing is unchanged."
          reject(new DOMException("Mention lookup cancelled", "AbortError"))
        }
        signal.addEventListener("abort", cancel, { once: true })
      }),
    })
    asyncMention.addEventListener("m:mention-search", event => {
      asyncOutput.textContent = `Loading ${event.detail.prefix}${event.detail.query}…`
    })
    asyncMention.addEventListener("m:mention-results", event => {
      asyncOutput.textContent = `${event.detail.options.length} current choices.`
    })
    asyncMention.addEventListener("m:mention-error", event => {
      asyncOutput.textContent = `Search failed: ${event.detail.error}`
    })
    asyncMention.addEventListener("m:select", event => {
      asyncOutput.textContent = `Inserted ${event.detail.prefix}${event.detail.value}.`
    })
    document.getElementById("close-search-btn")?.addEventListener("click", () => asyncMention.close())
  }

  const form = document.getElementById("mention-form")
  const formMention = document.getElementById("form-mention")
  const formOutput = document.getElementById("form-output")
  if (form && formMention && formOutput) {
    form.addEventListener("submit", event => {
      event.preventDefault()
      formOutput.textContent = `FormData body: ${JSON.stringify(new FormData(form).get("body"))}; default: ${JSON.stringify(formMention.defaultValue)}`
    })
    form.addEventListener("reset", () => {
      queueMicrotask(() => {
        formOutput.textContent = `Reset live text: ${JSON.stringify(formMention.value)}`
      })
    })
    document.getElementById("clear-live-btn")?.addEventListener("click", () => {
      formMention.value = ""
      formOutput.textContent = `Live text is empty; reset default remains ${JSON.stringify(formMention.defaultValue)}.`
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
