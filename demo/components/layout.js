import { loadComponentApi } from "../component-api.js"

async function initialize() {
  if (!globalThis.MarkupUILayout) throw new Error("Layout runtime did not load.")
  await loadComponentApi(document.getElementById("layout-api"), new URL("../api/layout.json", import.meta.url))

  const form = document.getElementById("native-form")
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault()
      const status = document.getElementById("form-status")
      if (status) status.textContent = "The native form submitted."
    })
  }

  const scrollBtn = document.getElementById("scroll-bottom")
  if (scrollBtn) {
    scrollBtn.addEventListener("click", () => {
      const activity = document.getElementById("activity")
      if (activity) {
        activity.scrollTo({
          top: activity.scrollHeight,
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        })
      }
    })
  }

  const liveLayout = document.getElementById("live-layout")
  const liveHeader = document.getElementById("live-header")
  const liveContent = document.getElementById("live-content")
  const liveSider = document.getElementById("live-sider")
  const liveStatus = document.getElementById("live-status")

  const updateStatus = () => {
    if (liveStatus && liveSider && liveLayout) {
      liveStatus.textContent = `hasSider: ${liveLayout.hasSider}, sider width: ${liveSider.width ?? "default (272px)"}`
    }
  }

  document.getElementById("toggle-sider")?.addEventListener("click", () => {
    if (liveLayout) { liveLayout.hasSider = !liveLayout.hasSider; updateStatus() }
  })
  document.getElementById("toggle-inverted")?.addEventListener("click", () => {
    if (liveHeader) liveHeader.inverted = !liveHeader.inverted
  })
  document.getElementById("toggle-embedded")?.addEventListener("click", () => {
    if (liveContent) liveContent.embedded = !liveContent.embedded
  })
  document.getElementById("change-sider-width")?.addEventListener("click", () => {
    if (liveSider) { liveSider.width = liveSider.width === 320 ? 180 : 320; updateStatus() }
  })
  document.getElementById("reset-sider-width")?.addEventListener("click", () => {
    if (liveSider) { liveSider.width = null; updateStatus() }
  })
  document.getElementById("reconnect-layout")?.addEventListener("click", () => {
    if (liveLayout && liveLayout.parentElement) {
      const parent = liveLayout.parentElement, next = liveLayout.nextSibling
      liveLayout.remove()
      parent.insertBefore(liveLayout, next)
      updateStatus()
    }
  })

  updateStatus()
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else void initialize()
