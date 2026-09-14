import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIInfiniteScroll
  if (!api) throw new Error("InfiniteScroll runtime did not load.")
  void loadComponentApi(document.getElementById("infinite-scroll-api"), new URL("../api/infinite-scroll.json", import.meta.url))

  const basicScroll = document.getElementById("basic-scroll")
  const basicList = document.getElementById("basic-list")
  let basicCount = 6
  basicScroll?.addEventListener("m:load", () => {
    if (basicCount >= 20) return
    for (let i = 0; i < 3; i++) {
      basicCount++
      const li = document.createElement("li")
      li.textContent = `Item ${basicCount}`
      basicList?.appendChild(li)
    }
  })

  const distanceScroll = document.getElementById("distance-scroll")
  const distanceList = document.getElementById("distance-list")
  let distanceCount = 6
  distanceScroll?.addEventListener("m:load", () => {
    if (distanceCount >= 20) return
    for (let i = 0; i < 3; i++) {
      distanceCount++
      const li = document.createElement("li")
      li.textContent = `Feed Item ${distanceCount}`
      distanceList?.appendChild(li)
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()

