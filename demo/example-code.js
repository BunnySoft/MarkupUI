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

  function appendToken(parent, type, value) {
    if (!value) return
    const token = document.createElement("span")
    token.className = "mui-code-token"
    token.dataset.codeToken = type
    token.textContent = value
    parent.append(token)
  }

  function appendTag(parent, value) {
    if (value.startsWith("<!--")) {
      appendToken(parent, "comment", value)
      return
    }
    if (/^<!doctype/i.test(value)) {
      appendToken(parent, "keyword", value)
      return
    }
    let offset = 0
    const opening = value.match(/^<\/?/)?.[0] ?? ""
    appendToken(parent, "punctuation", opening)
    offset += opening.length
    const tag = value.slice(offset).match(/^[^\s/>]+/)?.[0] ?? ""
    appendToken(parent, "tag", tag)
    offset += tag.length
    let expectsValue = false
    while (offset < value.length) {
      const rest = value.slice(offset)
      const whitespace = rest.match(/^\s+/)?.[0]
      if (whitespace) {
        parent.append(document.createTextNode(whitespace))
        offset += whitespace.length
        continue
      }
      if (rest.startsWith("/>")) {
        appendToken(parent, "punctuation", "/>")
        offset += 2
        continue
      }
      if (rest.startsWith(">")) {
        appendToken(parent, "punctuation", ">")
        offset++
        continue
      }
      if (rest.startsWith("=")) {
        appendToken(parent, "punctuation", "=")
        offset++
        expectsValue = true
        continue
      }
      const quote = rest[0]
      if (quote === '"' || quote === "'") {
        const end = rest.indexOf(quote, 1)
        const length = end === -1 ? rest.length : end + 1
        appendToken(parent, "string", rest.slice(0, length))
        offset += length
        expectsValue = false
        continue
      }
      const word = rest.match(/^[^\s=/>]+/)?.[0] ?? rest[0]
      appendToken(parent, expectsValue ? "string" : "attribute", word)
      offset += word.length
      expectsValue = false
    }
  }

  function renderHtml(parent, value) {
    parent.replaceChildren()
    const pattern = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/?[A-Za-z][^>]*>/gi
    let offset = 0
    for (const match of value.matchAll(pattern)) {
      const index = match.index ?? 0
      if (index > offset) parent.append(document.createTextNode(value.slice(offset, index)))
      appendTag(parent, match[0])
      offset = index + match[0].length
    }
    if (offset < value.length) parent.append(document.createTextNode(value.slice(offset)))
  }

  function normalizeIndentation(value) {
    const lines = value.replace(/\r\n?/g, "\n").split("\n")
    while (lines.length && lines[0].trim() === "") lines.shift()
    while (lines.length && lines.at(-1).trim() === "") lines.pop()
    if (!lines.length) return ""
    const indentation = Math.min(...lines
      .filter(line => line.trim() !== "")
      .map(line => line.match(/^\s*/)?.[0].length ?? 0))
    return lines.map(line => line.slice(Math.min(indentation, line.length))).join("\n")
  }

  const listeners = examples.map(example => {
    const key = example.dataset.demoExample
    const header = example.querySelector("[data-demo-header]")
    if (!key || !header) throw new Error("Demo example markup is incomplete.")

    const panelId = `demo-code-${key}`
    const toggle = document.createElement("mui-button")
    toggle.setAttribute("size", "tiny")
    toggle.setAttribute("text", "")
    toggle.dataset.demoCodeToggle = ""
    toggle.setAttribute("aria-controls", panelId)
    toggle.setAttribute("aria-expanded", "false")
    toggle.setAttribute("aria-label", "Show code")
    toggle.title = "Show code"
    const control = document.createElement("button")
    control.type = "button"
    control.setAttribute("aria-controls", panelId)
    control.setAttribute("aria-expanded", "false")
    control.setAttribute("aria-label", "Show code")
    control.title = "Show code"
    const icon = document.createElement("span")
    icon.dataset.muiButtonIcon = ""
    icon.setAttribute("aria-hidden", "true")
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", "0 0 512 512")
    svg.setAttribute("focusable", "false")
    for (const pathData of [
      "M160 368L32 256l128-112",
      "M352 368l128-112l-128-112",
    ]) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", pathData)
      svg.append(path)
    }
    icon.append(svg)
    control.append(icon)
    toggle.append(control)

    const container = document.createElement("div")
    container.id = panelId
    container.className = "demo-example-code-container"
    container.hidden = true
    const panel = document.createElement("pre")
    panel.className = "mui-code-block demo-example-code"
    panel.tabIndex = 0
    const code = document.createElement("code")
    code.className = "mui-code"
    panel.append(code)
    container.append(panel)
    example.append(container)
    header.append(toggle)

    const onToggle = async () => {
      if (!container.hidden) {
        container.hidden = true
        toggle.setAttribute("aria-expanded", "false")
        toggle.setAttribute("aria-label", "Show code")
        toggle.title = "Show code"
        control.setAttribute("aria-expanded", "false")
        control.setAttribute("aria-label", "Show code")
        control.title = "Show code"
        return
      }
      container.hidden = false
      toggle.setAttribute("aria-expanded", "true")
      toggle.setAttribute("aria-label", "Hide code")
      toggle.title = "Hide code"
      control.setAttribute("aria-expanded", "true")
      control.setAttribute("aria-label", "Hide code")
      control.title = "Hide code"
      if (code.dataset.loaded === "true") return
      code.textContent = "Loading source..."
      try {
        const sourcePage = await loadSource()
        const sourceExample = [...sourcePage.querySelectorAll("[data-demo-example]")]
          .find(candidate => candidate.dataset.demoExample === key)
        const preview = sourceExample?.querySelector("[data-demo-preview]")
        if (!preview) throw new Error(`Source example '${key}' was not found.`)
        renderHtml(code, normalizeIndentation(preview.innerHTML))
        code.dataset.loaded = "true"
      } catch (error) {
        container.dataset.state = "error"
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
