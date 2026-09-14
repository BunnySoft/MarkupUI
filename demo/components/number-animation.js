import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiElement = document.getElementById("number-animation-api")
  if (apiElement) {
    void loadComponentApi(apiElement, new URL("../api/number-animation.json", import.meta.url))
  }

  const basic = document.getElementById("demo-basic")
  const playBtn = document.getElementById("play-btn")
  playBtn?.addEventListener("click", () => {
    if (basic && typeof basic.play === "function") {
      basic.play()
    }
  })
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true })
} else {
  initialize()
}


