import { loadComponentApi } from "../component-api.js"
import { registerSplit } from "../../src/components/split/index.js"

registerSplit()

function initialize() {
  const apiElement = document.getElementById("split-api")
  if (apiElement) {
    void loadComponentApi(apiElement, new URL("../api/split.json", import.meta.url))
  }

  const basicSplit = document.getElementById("basic-split")
  if (basicSplit) {
    basicSplit.addEventListener("m:change", event => {
      console.log(`Split changed: ${event.detail.size}`)
    })
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true })
} else {
  initialize()
}

