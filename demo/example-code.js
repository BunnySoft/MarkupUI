export function createExampleCodeViewers(
  document = globalThis.document,
  view = globalThis.window,
) {
  const examples = [...document.querySelectorAll("[data-demo-example]")]
  let sourceDocument
  let sourceRequest

  async function loadSource() {
    if (sourceDocument) return sourceDocument
    if (!sourceRequest) {
      sourceRequest = (async () => {
        if (typeof view.fetch !== "function") throw new Error("Source loading is unavailable.")
        const response = await view.fetch(new URL(view.location.href))
        if (!response.ok) throw new Error(`Source request failed with ${response.status}.`)
        const text = await response.text()
        sourceDocument = new view.DOMParser().parseFromString(text, "text/html")
        return sourceDocument
      })()
    }
    return sourceRequest
  }

  const listeners = examples.map(example => {
    const key = example.dataset.demoExample
    const header = example.querySelector("[data-demo-header]")
    if (!key || !header) throw new Error("Demo example markup is incomplete.")

    const panelId = `demo-code-${key}`
    const toggle = document.createElement("mui-button")
    toggle.setAttribute("size", "small")
    toggle.setAttribute("secondary", "")
    toggle.dataset.demoCodeToggle = ""
    toggle.setAttribute("aria-controls", panelId)
    toggle.setAttribute("aria-expanded", "false")
    const control = document.createElement("button")
    control.type = "button"
    const icon = document.createElement("span")
    icon.dataset.muiButtonIcon = ""
    icon.setAttribute("aria-hidden", "true")
    icon.textContent = "</>"
    const label = document.createElement("span")
    label.textContent = "Show code"
    control.append(icon, label)
    toggle.append(control)

    const panel = document.createElement("pre")
    panel.id = panelId
    panel.className = "mui-code-block demo-example-code"
    panel.tabIndex = 0
    panel.hidden = true
    const code = document.createElement("code")
    code.className = "mui-code"
    panel.append(code)
    example.append(panel)
    header.append(toggle)

    const onToggle = async () => {
      if (!panel.hidden) {
        panel.hidden = true
        toggle.setAttribute("aria-expanded", "false")
        label.textContent = "Show code"
        return
      }
      panel.hidden = false
      toggle.setAttribute("aria-expanded", "true")
      label.textContent = "Hide code"
      if (code.dataset.loaded === "true") return
      code.textContent = "Loading source..."
      try {
        const sourcePage = await loadSource()
        const sourceExample = [...sourcePage.querySelectorAll("[data-demo-example]")]
          .find(candidate => candidate.dataset.demoExample === key)
        const preview = sourceExample?.querySelector("[data-demo-preview]")
        if (!preview) throw new Error(`Source example '${key}' was not found.`)
        code.textContent = preview.innerHTML.trim()
        code.dataset.loaded = "true"
      } catch (error) {
        panel.dataset.state = "error"
        code.textContent = error instanceof Error
          ? `Unable to load source: ${error.message}`
          : "Unable to load source."
      }
    }
    toggle.addEventListener("click", onToggle)
    return { toggle, onToggle }
  })

  return {
    disconnect() {
      for (const { toggle, onToggle } of listeners) {
        toggle.removeEventListener("click", onToggle)
      }
    },
  }
}

if (document.querySelector("[data-demo-example]")) {
  createExampleCodeViewers()
}
