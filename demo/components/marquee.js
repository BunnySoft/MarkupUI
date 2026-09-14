import { loadComponentApi } from "../component-api.js"

function initialize() {
  const marqueeApiEl = document.getElementById("marquee-api")
  if (marqueeApiEl) {
    void loadComponentApi(marqueeApiEl, new URL("../api/marquee.json", import.meta.url))
  }

  const demoMarquee = document.getElementById("demo-marquee")
  if (demoMarquee) {
    document.getElementById("marquee-play")?.addEventListener("click", () => {
      demoMarquee.play?.()
    })
    document.getElementById("marquee-pause")?.addEventListener("click", () => {
      demoMarquee.pause?.()
    })
    document.getElementById("marquee-speed-up")?.addEventListener("click", () => {
      demoMarquee.speed = Math.min(200, demoMarquee.speed + 25)
    })
    document.getElementById("marquee-speed-down")?.addEventListener("click", () => {
      demoMarquee.speed = Math.max(10, demoMarquee.speed - 25)
    })
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true })
} else {
  initialize()
}
