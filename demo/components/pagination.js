import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIPagination
  if (!api) throw new Error("Pagination runtime did not load.")
  void loadComponentApi(document.getElementById("pagination-api"), new URL("../api/pagination.json", import.meta.url))

  const declarativePager = document.querySelector("#declarative-pager")
  const pagerStatus = document.querySelector("#pager-status")
  declarativePager?.addEventListener("m:change", (event) => {
    if (pagerStatus) {
      pagerStatus.textContent = `Current page: ${event.detail.page}`
    }
  })

  const nav = document.querySelector("#pager")
  const state = document.querySelector("#state")
  if (nav && api.createPagination) {
    const pager = api.createPagination(nav, { itemCount: 237 })
    const enhancement = nav.querySelector("[data-pagination-enhancement]")
    if (enhancement) enhancement.hidden = false
    const report = () => { if (state) state.textContent = JSON.stringify(pager.state) }
    nav.addEventListener("m:pagination-change", report)
    nav.addEventListener("m:pagination-error", event => { if (state) state.textContent = event.detail.error.message })
    document.querySelector("#shrink")?.addEventListener("click", () => { pager.set({ itemCount: 12 }); report() })
    document.querySelector("#empty")?.addEventListener("click", () => { pager.set({ itemCount: 0 }); report() })
    document.querySelector("#huge")?.addEventListener("click", () => { pager.set({ itemCount: null, pageCount: 1_000_000_000_000, page: 500_000_000_000 }); report() })
    document.querySelector("#reset")?.addEventListener("click", () => { pager.set({ itemCount: 237, page: 1, pageSize: 10, simple: false, disabled: false }); report() })
    document.querySelector("#simple")?.addEventListener("click", () => { pager.set({ simple: !pager.state.simple }); report() })
    document.querySelector("#disabled")?.addEventListener("click", () => { pager.set({ disabled: !pager.state.disabled }); report() })
    document.querySelector("#cancel")?.addEventListener("click", () => {
      nav.addEventListener("m:pagination-request", event => { event.preventDefault(); if (state) state.textContent = "Author cancelled the local paging request." }, { once: true })
    })
    document.querySelector("#native-form")?.addEventListener("submit", event => { event.preventDefault(); if (state) state.textContent = "Unexpected form submission" })
    report()
    window.paginationDemo = pager
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
