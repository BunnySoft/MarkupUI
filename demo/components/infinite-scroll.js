import { createInfiniteScroll } from "../../dist/markup-ui-infinite-scroll.js"
import { localItem, waitForLocalLoad } from "./infinite-scroll.fixture.js"

const element = document.querySelector("[data-infinite-scroll]")
const viewport = element.querySelector("[data-feed-viewport]")
const content = element.querySelector("[data-infinite-content]")
const template = document.querySelector("#item-template")
const form = document.querySelector("#sample-form")
const diagnostics = document.querySelector("#diagnostics")
const mode = document.querySelector("[data-demo-mode]")
const delay = document.querySelector("[data-demo-delay]")
const stats = { calls: 0, active: 0, maxActive: 0, commits: 0, aborts: 0, lastReason: "", lastCommitGeneration: 0 }
let nextItem = 3
let controller
function show(extra = {}) {
  diagnostics.textContent = JSON.stringify({ ...extra, ...stats, items: content.children.length, ...(controller ? controller.state : {}) }, null, 2)
}
controller = createInfiniteScroll(element, {
  scrollRoot: viewport,
  load: async context => {
    const scenario = mode.value, wait = Number(delay.value), start = nextItem
    stats.calls++; stats.active++; stats.maxActive = Math.max(stats.maxActive, stats.active); stats.lastReason = context.reason
    const aborted = () => { stats.aborts++; if (controller?.connected) show() }
    context.signal.addEventListener("abort", aborted, { once: true })
    show()
    try {
      await waitForLocalLoad(context.signal, wait, scenario === "ignore-abort" || scenario === "late-error")
      if (scenario === "error" || scenario === "late-error") throw new Error("Controlled local loader failure.")
      if (scenario === "no-growth") return { added: 0, hasMore: true }
      if (scenario === "end" || start > 12) return { added: 0, hasMore: false }
      const count = Math.min(3, 13 - start)
      const fragment = document.createDocumentFragment()
      for (let index = start; index < start + count; index++) fragment.append(localItem(template, index))
      return {
        added: count,
        hasMore: start + count <= 12,
        commit: () => {
          content.append(fragment); nextItem = start + count
          stats.commits++; stats.lastCommitGeneration = context.generation
        },
      }
    } finally {
      stats.active--; context.signal.removeEventListener("abort", aborted)
      if (controller?.connected) show()
    }
  },
})
document.querySelectorAll("[data-enhancement],[data-js-only]").forEach(node => { node.hidden = false })
element.addEventListener("mui:infinite-state", () => show())
element.addEventListener("mui:infinite-error", event => show({ error: String(event.detail.error) }))
content.addEventListener("click", event => {
  if (event.target instanceof HTMLButtonElement && event.target.matches("[data-item-action]")) {
    event.target.closest("li").querySelector("input").value = "Reviewed without replacing this item"
  }
})
function restart() {
  const fragment = document.createDocumentFragment()
  fragment.append(localItem(template, 1), localItem(template, 2))
  content.replaceChildren(fragment); nextItem = 3
  controller.reset()
}
const settings = {
  root: input => {
    element.dataset.scrollMode = input.value
    controller.set({ scrollRoot: input.value === "page" ? null : viewport })
  },
  distance: input => controller.set({ distance: Number(input.value) }),
  automatic: input => controller.set({ automatic: input.checked }),
  disabled: input => controller.set({ disabled: input.checked }),
  "native-disabled": input => { document.querySelector("#native-gate").disabled = input.checked },
}
for (const [name, apply] of Object.entries(settings)) document.querySelector(`[data-demo-${name}]`).addEventListener("change", event => {
  try { apply(event.target); show() } catch (error) { show({ error: String(error) }) }
})
document.querySelector("[data-demo-restart]").addEventListener("click", restart)
document.querySelector("[data-demo-reset]").addEventListener("click", () => controller.reset())
document.querySelector("[data-demo-rtl]").addEventListener("click", () => { element.dir = element.dir === "rtl" ? "ltr" : "rtl" })
document.querySelector("[data-demo-dispose]").addEventListener("click", () => {
  controller.disconnect()
  document.querySelectorAll("[data-enhancement]").forEach(node => { node.hidden = true })
  document.querySelector("#footer-action").focus()
  show({ handoff: "Current native items/fields remain; use the static fallback link." })
})
document.querySelector("[data-demo-values]").addEventListener("click", () => show({ nativeFormData: [...new FormData(form)] }))
form.addEventListener("submit", event => event.preventDefault())
show()
globalThis.infiniteScrollDemo = { controller, stats, restart }
