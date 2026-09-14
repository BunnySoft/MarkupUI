import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUICountdown
  if (!api) throw new Error("Countdown runtime did not load.")
  void loadComponentApi(document.getElementById("countdown-api"), new URL("../api/countdown.json", import.meta.url))

  const basic = document.querySelector("#basic-countdown")
  document.querySelector("#basic-start")?.addEventListener("click", () => basic?.start())
  document.querySelector("#basic-pause")?.addEventListener("click", () => basic?.pause())
  document.querySelector("#basic-reset")?.addEventListener("click", () => basic?.reset())
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

