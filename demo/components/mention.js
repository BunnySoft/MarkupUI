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
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

