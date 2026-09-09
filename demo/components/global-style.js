// Application controls for one authored link, not a GlobalStyle runtime or installer.
export function connectExample(root) {
  const document = root.ownerDocument
  const link = document.querySelector("#global-style-link")
  const controls = root.querySelector("[data-demo-controls]")
  const status = root.querySelector("[data-demo-status]")
  const enabled = root.querySelector("[data-enabled]")
  const attach = root.querySelector("[data-attach]")
  const listeners = new document.defaultView.AbortController()
  let disconnected = false
  function on(selector, type, listener) {
    root.querySelector(selector).addEventListener(type, listener, { signal: listeners.signal })
  }
  function report() {
    enabled.disabled = !link.isConnected
    enabled.checked = !link.disabled
    attach.textContent = link.isConnected ? "Remove stylesheet link" : "Reinsert stylesheet link"
    status.textContent = link.isConnected
      ? `Authored link attached; ${link.disabled ? "disabled" : "enabled"}. Author rules still follow the cascade.`
      : "Authored link removed; no package document rules are applied by this link."
  }
  on("[data-enabled]", "change", () => { link.disabled = !enabled.checked; report() })
  on("[data-attach]", "click", () => {
    if (link.isConnected) link.remove()
    else document.head.append(link)
    report()
  })
  on("[data-scheme]", "change", event => {
    if (event.target.value === "system") document.documentElement.removeAttribute("data-global-style-scheme")
    else document.documentElement.dataset.globalStyleScheme = event.target.value
  })
  on("[data-document-type]", "change", event => { document.documentElement.toggleAttribute("data-global-style-type", event.target.checked) })
  on("[data-document-colors]", "change", event => { document.documentElement.toggleAttribute("data-global-style-colors", event.target.checked) })
  on("[data-author-body]", "change", event => { document.body.toggleAttribute("data-global-style-author", event.target.checked) })
  function disconnect() {
    if (disconnected) return
    disconnected = true
    listeners.abort()
    if (controls.contains(document.activeElement)) { status.tabIndex = -1; status.focus() }
    controls.hidden = true
    status.textContent = "Demo listeners disconnected. Chosen link state and authored document settings remain."
  }
  on("[data-disconnect]", "click", disconnect)
  controls.hidden = false
  report()
  return { disconnect }
}

const root = document.querySelector("#global-style-example")
if (root) connectExample(root)
