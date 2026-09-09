// Local application listeners, not an Element constructor, enhancer or published API.
export function connectExample(root) {
  const document = root.ownerDocument
  const listeners = new document.defaultView.AbortController()
  const controls = [...root.querySelectorAll("[data-element-enhanced]")]
  const scope = root.querySelector("#element-scope")
  const nested = root.querySelector("#element-nested")
  const form = root.querySelector("form")
  const status = root.querySelector("[data-example-status]")
  let count = 0
  let disconnected = false
  function on(selector, event, listener) {
    root.querySelector(selector).addEventListener(event, listener, { signal: listeners.signal })
  }
  on("[data-palette]", "change", event => { scope.dataset.examplePalette = event.target.value })
  on("[data-nested-palette]", "change", event => {
    if (event.target.value === "inherit") delete nested.dataset.examplePalette
    else nested.dataset.examplePalette = event.target.value
  })
  on("[data-direction]", "change", event => { scope.dir = event.target.value })
  on("[data-action]", "click", () => { root.querySelector("[data-count]").textContent = String(++count) })
  on("[data-preview]", "click", () => { form.requestSubmit() })
  on("form", "submit", event => {
    event.preventDefault()
    const entries = [...new document.defaultView.FormData(form).entries()]
    root.querySelector("[data-preview-output]").textContent = JSON.stringify(entries)
  })
  function disconnect() {
    if (disconnected) return
    disconnected = true
    listeners.abort()
    if (controls.some(control => control.contains(document.activeElement))) {
      status.tabIndex = -1
      status.focus()
    }
    for (const control of controls) control.hidden = true
    status.textContent = "Example listeners disconnected. Native nodes, values, listeners owned by others and chosen styles remain."
  }
  on("[data-disconnect]", "click", disconnect)
  for (const control of controls) control.hidden = false
  status.textContent = "Native click and submit listeners are connected; nothing renders or replaces these elements."
  return { disconnect }
}

const root = document.querySelector("[data-element-example]")
if (root) connectExample(root)
