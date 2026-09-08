// Application-specific composition example, not a published MarkupUI factory.
export async function mountExample(root, includes) {
  const names = ["message", "notification", "loadingBar", "dialog", "modal"]
  if (!root?.isConnected || !Array.isArray(includes) || new Set(includes).size !== includes.length || includes.some(name => !names.includes(name))) {
    throw new TypeError("Choose unique known services and a connected example root.")
  }
  const selected = new Set(includes)
  const services = {}
  const cleaned = new Set()
  const pending = new Set()
  let disposed = false
  let cleanupComplete = false
  let messageFactory
  let notificationFactory
  let insideMessage
  let insideNotification
  let workspace
  let confirmation
  function requireNode(selector) {
    const node = root.querySelector(selector)
    if (!node) throw new Error(`Missing authored example node: ${selector}`)
    return node
  }
  function ready(name) {
    if (disposed || !root.isConnected) throw new Error("This example scope is disposed or detached.")
    if (!services[name]) throw new Error(`The example did not select ${name}.`)
  }
  function localDecision() {
    return new Promise(resolve => { pending.add(resolve) })
  }
  function resolveDecisions(accepted = false) {
    for (const resolve of pending) resolve(accepted)
    pending.clear()
  }
  const scope = {
    services,
    get disposed() { return disposed },
    get cleanupComplete() { return cleanupComplete },
    get pendingCount() { return pending.size },
    get workspace() { return workspace },
    get confirmation() { return confirmation },
    get insideMessage() { return insideMessage },
    get insideNotification() { return insideNotification },
    resolveDecisions,
    postMessage() {
      ready("message")
      return services.message.success("Explicitly selected Message owner; no injected app.")
    },
    postNotification() {
      ready("notification")
      return services.notification.info({ title: "Explicit Notification owner", content: "Close starts a local pending decision; complete or dispose it explicitly.", onClose: localDecision })
    },
    openDialog() {
      ready("dialog")
      if (confirmation?.connected) {
        confirmation.showModal()
        return confirmation
      }
      confirmation = services.dialog.create(requireNode("[data-example-dialog-template]"), { onPositiveClick: localDecision })
      confirmation.dialog.querySelector("[data-resolve-decision]").addEventListener("click", () => resolveDecisions(true))
      confirmation.dialog.querySelector("[data-dispose-confirmation-scope]").addEventListener("click", () => {
        try { scope.dispose(); root.dispatchEvent(new CustomEvent("example:disposed")) }
        catch (error) { root.querySelector("[data-example-status]").textContent = error.message }
      })
      return confirmation
    },
    openModal() {
      ready("modal")
      if (workspace?.connected) {
        workspace.showModal()
        return workspace
      }
      workspace = services.modal.create(requireNode("[data-example-modal-template]"))
      try {
        if (messageFactory) {
          insideMessage = messageFactory(workspace.dialog.querySelector("[data-inside-message]"), { max: 2, closable: true, focusFallback: workspace.dialog.querySelector("[data-inside-message-button]") })
          workspace.dialog.querySelector("[data-inside-message-button]").addEventListener("click", () => {
            try { insideMessage.info("Native modal-local Message root.") }
            catch (error) { workspace.dialog.querySelector("[data-inside-error]").textContent = error.message }
          })
        }
        if (notificationFactory) {
          insideNotification = notificationFactory(workspace.dialog.querySelector("[data-inside-notification]"), { max: 2, focusFallback: workspace.dialog.querySelector("[data-inside-notification-button]") })
          workspace.dialog.querySelector("[data-inside-notification-button]").addEventListener("click", () => {
            try { insideNotification.success({ title: "Inside the modal", content: "This native host does not need a portal." }) }
            catch (error) { workspace.dialog.querySelector("[data-inside-error]").textContent = error.message }
          })
        }
        workspace.dialog.querySelector("[data-inside-message-button]").hidden = !messageFactory
        workspace.dialog.querySelector("[data-inside-notification-button]").hidden = !notificationFactory
        workspace.dialog.querySelector("[data-inside-dialog-button]").hidden = !services.dialog
        workspace.dialog.querySelector("[data-inside-dialog-button]").addEventListener("click", () => {
          try { scope.openDialog() } catch (error) { workspace.dialog.querySelector("[data-inside-error]").textContent = error.message }
        })
        workspace.dialog.querySelector("[data-dispose-scope]").addEventListener("click", () => {
          try { scope.dispose(); root.dispatchEvent(new CustomEvent("example:disposed")) }
          catch (error) { root.querySelector("[data-example-status]").textContent = error.message }
        })
      } catch (error) {
        // These are only the explicitly created workspace resources, not arbitrary user factories.
        const errors = [error]
        for (const cleanup of [() => insideNotification?.dispose(), () => insideMessage?.dispose(), () => workspace?.dispose()]) {
          try { cleanup() } catch (failure) { errors.push(failure) }
        }
        throw new AggregateError(errors, "Workspace setup failed; inspect all reported cleanup errors.")
      }
      return workspace
    },
    dispose() {
      disposed = true
      const failures = []
      // The confirmation can be above the workspace. Close it before its focus-return target.
      const operations = [
        ["dialog", () => services.dialog?.dispose()],
        ["inside-notification", () => insideNotification?.dispose()],
        ["inside-message", () => insideMessage?.dispose()],
        ["modal", () => services.modal?.dispose()],
        ["notification", () => services.notification?.dispose()],
        ["message", () => services.message?.dispose()],
        ["loadingBar", () => services.loadingBar?.disconnect()],
      ]
      for (const [name, cleanup] of operations) {
        if (cleaned.has(name)) continue
        try { cleanup(); cleaned.add(name) }
        catch (error) { failures.push(new Error(`${name} cleanup failed`, { cause: error })) }
      }
      // Only this demo's deferred local decisions are completed. External work is not cancelled.
      resolveDecisions(false)
      cleanupComplete = failures.length === 0
      if (failures.length) throw new AggregateError(failures, "Some example cleanup failed; retry dispose() after correcting the reported causes.")
    },
  }
  try {
    if (selected.has("modal")) {
      const { createModalOwner } = await import("../../dist/markup-ui-modal.js")
      services.modal = createModalOwner(requireNode("[data-example-modal-owner]"))
    }
    if (selected.has("dialog")) {
      const { createDialogOwner } = await import("../../dist/markup-ui-dialog.js")
      services.dialog = createDialogOwner(requireNode("[data-example-dialog-owner]"))
    }
    if (selected.has("loadingBar")) {
      const { createLoadingBar } = await import("../../dist/markup-ui-loading-bar.js")
      services.loadingBar = createLoadingBar(requireNode("[data-example-loading-bar]"), { finishDelay: 600 })
    }
    if (selected.has("message")) {
      const { createMessageOwner } = await import("../../dist/markup-ui-message.js")
      messageFactory = createMessageOwner
      services.message = createMessageOwner(requireNode("[data-example-message]"), { max: 3, closable: true, keepAliveOnHover: true, focusFallback: requireNode('[data-operation="message"]') })
    }
    if (selected.has("notification")) {
      const { createNotificationOwner } = await import("../../dist/markup-ui-notification.js")
      notificationFactory = createNotificationOwner
      services.notification = createNotificationOwner(requireNode("[data-example-notification]"), { max: 3, keepAliveOnHover: true, focusFallback: requireNode('[data-operation="notification"]') })
    }
  } catch (error) {
    const failures = [error]
    try { scope.dispose() } catch (cleanupError) { failures.push(cleanupError) }
    // The application retains scope even on failure so failed cleanups remain retryable.
    throw Object.assign(new AggregateError(failures, "Selected example setup failed; completed owners were cleaned up where possible."), { scope })
  }
  return scope
}

const root = document.querySelector("#discrete-example")
if (root) {
  const status = root.querySelector("[data-example-status]")
  const mount = root.querySelector("[data-mount]")
  const release = root.querySelector("[data-release]")
  let scope
  let mounting = false
  function updateControls() {
    for (const checkbox of root.querySelectorAll("[data-include]")) checkbox.disabled = mounting || !!scope && !scope.cleanupComplete
    mount.disabled = mounting || !!scope && !scope.cleanupComplete
    release.disabled = mounting || !scope
    const buttons = [...root.querySelectorAll("[data-operation]")]
    const states = buttons.map(button => {
      const name = button.dataset.operation
      const service = name.startsWith("loading") ? "loadingBar" : name
      const selected = name === "resolve" ? scope?.services.dialog || scope?.services.notification : scope?.services[service]
      return { button, disabled: !scope || scope.disposed || !selected }
    })
    if (states.some(({ button, disabled }) => disabled && button === document.activeElement)) {
      const target = !mount.disabled ? mount : !release.disabled ? release : null
      target?.focus({ preventScroll: true })
    }
    for (const { button, disabled } of states) button.disabled = disabled
  }
  function run(action) {
    try { action(); updateControls() }
    catch (error) { status.textContent = error.message; updateControls() }
  }
  mount.addEventListener("click", async () => {
    if (mounting || scope && !scope.cleanupComplete) return
    mounting = true; updateControls()
    try {
      const selected = [...root.querySelectorAll("[data-include]:checked")].map(node => node.dataset.include)
      scope = await mountExample(root, selected)
      status.textContent = `Mounted only: ${selected.join(", ") || "(none)"}.`
    } catch (error) { scope = error.scope; status.textContent = error.message }
    finally { mounting = false; updateControls() }
  })
  release.addEventListener("click", () => run(() => { scope.dispose(); status.textContent = "Selected scope disposed; native roots and unrelated owners remain." }))
  root.addEventListener("example:disposed", () => { status.textContent = "Scope disposed from inside the modal."; updateControls() })
  root.querySelector('[data-operation="message"]').addEventListener("click", () => run(() => scope.postMessage()))
  root.querySelector('[data-operation="notification"]').addEventListener("click", () => run(() => scope.postNotification()))
  root.querySelector('[data-operation="dialog"]').addEventListener("click", () => run(() => scope.openDialog()))
  root.querySelector('[data-operation="modal"]').addEventListener("click", () => run(() => scope.openModal()))
  root.querySelector('[data-operation="loading-start"]').addEventListener("click", () => run(() => scope.services.loadingBar.start()))
  root.querySelector('[data-operation="loading-finish"]').addEventListener("click", () => run(() => scope.services.loadingBar.finish()))
  root.querySelector('[data-operation="loading-error"]').addEventListener("click", () => run(() => { scope.services.loadingBar.stop(); scope.services.loadingBar.error() }))
  root.querySelector('[data-operation="resolve"]').addEventListener("click", () => run(() => scope.resolveDecisions(true)))
  for (const name of ["mui:message-error", "mui:notification-error", "mui:dialog-error", "mui:loading-bar-fault"]) {
    root.addEventListener(name, event => { event.preventDefault(); status.textContent = event.detail.error.message }, true)
  }
  updateControls()
  root.querySelector("[data-enhanced-controls]").hidden = false
  window.discreteDemo = { get scope() { return scope } }
}
