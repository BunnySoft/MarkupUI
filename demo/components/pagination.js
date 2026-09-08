const nav = document.querySelector("#pager")
const state = document.querySelector("#state")
const pager = window.MarkupUIPagination.createPagination(nav, { itemCount: 237 })
nav.querySelector("[data-pagination-enhancement]").hidden = false
const report = () => { state.textContent = JSON.stringify(pager.state) }
nav.addEventListener("mui:pagination-change", report)
nav.addEventListener("mui:pagination-error", event => { state.textContent = event.detail.error.message })
document.querySelector("#shrink").addEventListener("click", () => { pager.set({ itemCount: 12 }); report() })
document.querySelector("#empty").addEventListener("click", () => { pager.set({ itemCount: 0 }); report() })
document.querySelector("#huge").addEventListener("click", () => { pager.set({ itemCount: null, pageCount: 1_000_000_000_000, page: 500_000_000_000 }); report() })
document.querySelector("#reset").addEventListener("click", () => { pager.set({ itemCount: 237, page: 1, pageSize: 10, simple: false, disabled: false }); report() })
document.querySelector("#simple").addEventListener("click", () => { pager.set({ simple: !pager.state.simple }); report() })
document.querySelector("#disabled").addEventListener("click", () => { pager.set({ disabled: !pager.state.disabled }); report() })
document.querySelector("#cancel").addEventListener("click", () => {
  nav.addEventListener("mui:pagination-request", event => { event.preventDefault(); state.textContent = "Author cancelled the local paging request." }, { once: true })
})
document.querySelector("#native-form").addEventListener("submit", event => { event.preventDefault(); state.textContent = "Unexpected form submission" })
report()
window.paginationDemo = pager
