import { createTransfer } from "../../dist/markup-ui-transfer.js"

export function connectExample(scope) {
  const root = scope.querySelector("#membership"), form = scope.querySelector("#migration-form")
  const events = scope.querySelector("#demo-events"), state = scope.querySelector("#membership-state")
  const preview = scope.querySelector("#formdata-preview"), note = scope.querySelector("#handoff-note")
  const enhanced = [...scope.querySelectorAll("[data-demo-enhanced]")]
  const transfer = createTransfer(root)
  const controller = new AbortController(), { signal } = controller
  let connected = true, resetTimer
  function inspect() {
    state.textContent = JSON.stringify(transfer.connected ? transfer.state : {
      membership: [...transfer.target.options].map(option => option.value),
      staging: [...transfer.target.selectedOptions].map(option => option.value),
      serialization: "Released; the application must own any future serialization.",
    }, null, 2)
  }
  function run(callback) {
    try { callback(); inspect() }
    catch (error) { events.textContent = `Action failed: ${String(error)}` }
  }
  function listen(selector, callback) {
    scope.querySelector(selector).addEventListener("click", () => run(callback), { signal })
  }
  function disconnect() {
    if (!connected) return
    connected = false
    const active = scope.ownerDocument.activeElement
    if ([...enhanced, ...root.querySelectorAll("[data-transfer-action]")].some(node => node.contains(active))) {
      scope.querySelector("#project-name").focus()
    }
    clearTimeout(resetTimer)
    controller.abort()
    transfer.disconnect()
    enhanced.forEach(node => { node.hidden = true })
    note.textContent = "Disconnected: current native lists/highlights remain. Movement, filtering, membership reset and automatic formdata ownership are released."
    events.textContent = "No deprecated controller was created; no data is resurrected."
    preview.textContent = "Previous preview cleared. Membership is not automatically serialized after disconnect."
    inspect()
  }
  root.addEventListener("mui:transfer-change", event => {
    events.textContent = `User move to ${event.detail.to}: ${event.detail.moved.join(", ")}. Target membership: ${event.detail.value.join(", ")}.`
    inspect()
  }, { signal })
  root.addEventListener("mui:transfer-stage", () => {
    events.textContent = "Native highlights changed; target membership did not."
    inspect()
  }, { signal })
  root.addEventListener("mui:transfer-error", event => { events.textContent = `Transfer error: ${String(event.detail.error)}`; inspect() }, { signal })
  root.addEventListener("input", () => queueMicrotask(() => { if (connected) inspect() }), { signal })
  form.addEventListener("reset", () => {
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => { if (connected) inspect() }, 0)
  }, { signal })
  listen("#preview", () => {
    if (!form.reportValidity()) throw new Error("Resolve native form validity before preview.")
    const data = new FormData(form)
    const expected = transfer.state.disabled ? [] : [...transfer.value]
    if (JSON.stringify(data.getAll("reviewers[]")) !== JSON.stringify(expected)) {
      throw new Error("Native FormData membership did not match the current target.")
    }
    preview.textContent = JSON.stringify({
      targetMembership: transfer.value,
      targetHighlights: [...transfer.target.selectedOptions].map(option => option.value),
      actualFormData: [...data],
    }, null, 2)
  })
  listen("#set-value", () => {
    transfer.setValue(["core", "beta", "alpha"])
    events.textContent = "Programmatic exact order changed; no user movement event was emitted."
  })
  listen("#set-defaults", () => {
    transfer.setDefaultValue(["core", "gamma"])
    events.textContent = "Future reset membership is Core, Gamma. Current membership is unchanged."
  })
  listen("#disable-membership", () => { root.disabled = !root.disabled; transfer.refresh() })
  listen("#disconnect", disconnect)
  enhanced.forEach(node => { node.hidden = false })
  note.textContent = "Enhanced: the existing native Transfer helper owns reviewers[] FormData entries. Highlighted options remain staging, not membership."
  inspect()
  return { transfer, inspect, disconnect }
}

const scope = document.querySelector("#legacy-transfer-example")
if (scope) {
  try { window.legacyTransferDemo = connectExample(scope) }
  catch (error) {
    scope.querySelector("#demo-events").textContent = `Enhancement unavailable: ${String(error)}. Original static lists remain; no membership serialization is implied.`
  }
}
