import { createLoadingBar } from "../../dist/markup-ui-loading-bar.js"

// This is one application's wiring, not a config-root helper or published API.
export function mountExample(root) {
  const scope = root.querySelector("#config-scope")
  const nested = root.querySelector("#config-nested")
  const dialog = root.querySelector("#config-modal")
  const controls = root.querySelector("[data-enhanced]")
  const open = root.querySelector("[data-open-modal]")
  const status = root.querySelector("[data-example-status]")
  const listeners = new root.ownerDocument.defaultView.AbortController()
  const owners = new Set()
  let disconnected = false
  const outerRoot = root.querySelector("[data-outer-loading]")
  const outerStatus = outerRoot.querySelector("[data-loading-bar-status]")
  const initialStatusLanguage = outerStatus.getAttribute("lang")
  let labelledInFrench = false
  function loading(host, labels, value) {
    const owner = createLoadingBar(host, { labels, finishDelay: null })
    owners.add(owner)
    owner.start()
    owner.setProgress(value)
    return owner
  }
  function on(selector, event, action) {
    root.querySelector(selector).addEventListener(event, action, { signal: listeners.signal })
  }
  function dispose() {
    if (disconnected) return
    disconnected = true
    listeners.abort()
    if (dialog.open) dialog.close()
    for (const owner of owners) owner.disconnect()
    if (labelledInFrench && outerStatus.getAttribute("lang") === "fr") {
      if (initialStatusLanguage === null) outerStatus.removeAttribute("lang")
      else outerStatus.setAttribute("lang", initialStatusLanguage)
    }
    if (controls.contains(root.ownerDocument.activeElement) || root.ownerDocument.activeElement === open) {
      status.tabIndex = -1
      status.focus()
    }
    controls.hidden = true
    open.hidden = true
    status.textContent = "Demo behavior disconnected; native styling and authored progress remain."
  }
  let outer
  try {
    outer = loading(outerRoot, undefined, 25)
    loading(root.querySelector("[data-modal-loading]"), undefined, 40)
    loading(root.querySelector("[data-sibling-loading]"), undefined, 60)
  } catch (error) {
    dispose()
    throw error
  }
  on("[data-palette-control]", "change", event => { scope.dataset.examplePalette = event.target.value })
  on("[data-nested-control]", "change", event => {
    if (event.target.value === "inherit") delete nested.dataset.examplePalette
    else nested.dataset.examplePalette = event.target.value
  })
  on("[data-language-control]", "change", event => { scope.lang = event.target.value })
  on("[data-direction-control]", "change", event => { scope.dir = event.target.value })
  on("[data-french-labels]", "click", () => {
    outer.disconnect()
    owners.delete(outer)
    outer = loading(outerRoot, { idle: "En attente", loading: "Chargement", success: "Terminé", error: "Échec" }, 25)
    outerStatus.lang = "fr"
    labelledInFrench = true
    status.textContent = "Only the outer helper was explicitly recreated with French labels. lang alone did not translate it."
  })
  on("[data-open-modal]", "click", () => { if (!dialog.open) dialog.showModal() })
  on("[data-dispose]", "click", dispose)
  open.hidden = typeof dialog.showModal !== "function"
  controls.hidden = false
  status.textContent = "Three explicit Loading Bar owners. No provider, automatic locale updates or global style changes."
  return { dispose }
}

const root = document.querySelector("#config-example")
if (root) mountExample(root)
