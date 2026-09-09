import { createLog } from "../../dist/markup-ui-log.js"
import { localLogFixture } from "./log.fixture.js"

const root = document.querySelector("[data-log]")
const feedback = document.querySelector("#feedback")
const log = createLog(root)
let batch = 0
const show = detail => { feedback.textContent = JSON.stringify({ ...detail, ...log.state, mountedLineSpans: log.output.children.length }, null, 2) }
const actions = {
  large: () => log.setText(localLogFixture()),
  append: () => log.append(Array.from({ length: 25 }, (_, i) => `\nAppended local batch ${batch} record ${i + 1}`).join("")),
  partial: () => log.append(" + partial"),
  cr: () => log.append("\r"),
  flush: () => log.flush(),
  trim: () => log.trimStart(Math.min(100, log.state.lineCount - 1)),
  clear: () => log.clear(),
  top: () => log.scrollTo({ position: "top" }),
  middle: () => log.scrollTo({ top: (log.viewport.scrollHeight - log.viewport.clientHeight) / 2 }),
  bottom: () => log.scrollTo({ position: "bottom" }),
  long: () => log.setText("x".repeat(16384)),
  loading: () => log.setLoading(!log.state.loading),
  disconnect: () => {
    log.disconnect()
    document.querySelector("[data-enhancement]").hidden = true
    document.querySelector("#outside").focus()
  },
}
document.querySelector("[data-enhancement]").hidden = false
for (const [name, action] of Object.entries(actions)) document.querySelector(`[data-action="${name}"]`).addEventListener("click", () => {
  const start = performance.now()
  try { action(); batch++; show({ action: name, elapsedMs: +(performance.now() - start).toFixed(1) }) }
  catch (error) { feedback.textContent = error.message }
})
const controls = {
  follow: input => log.setFollow(input.checked),
  "trim-display": input => log.setTrim(input.checked),
  wrap: input => { log.viewport.toggleAttribute("data-word-wrap", input.checked); log.refresh() },
  rtl: input => { root.dir = input.checked ? "rtl" : "ltr"; log.refresh() },
  size: input => { root.dataset.visibleRows = input.value; log.refresh() },
}
for (const [id, apply] of Object.entries(controls)) document.getElementById(id).addEventListener("change", event => {
  try { apply(event.target); show({ action: id }) }
  catch (error) { feedback.textContent = error.message }
})
root.addEventListener("mui:log-edge", event => show({ edge: event.detail.position }))
root.addEventListener("mui:log-error", event => { feedback.textContent = event.detail.error.message })
globalThis.logDemo = log
