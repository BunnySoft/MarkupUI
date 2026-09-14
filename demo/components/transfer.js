import { loadComponentApi } from "../component-api.js"

function initialize() {
  const apiElement = document.getElementById("transfer-api")
  if (apiElement) {
    void loadComponentApi(apiElement, new URL("../api/transfer.json", import.meta.url))
  }

  const basicTransfer = document.getElementById("basic-transfer")
  const basicStatus = document.getElementById("basic-status")
  basicTransfer?.addEventListener("m:change", event => {
    if (basicStatus) {
      const keys = event.detail.value
      basicStatus.textContent = `Target members: ${keys.length > 0 ? keys.join(", ") : "none"}`
    }
  })

  // Controller / native fieldset demo
  const form = document.querySelector("#members-form")
  const root = document.querySelector("#transfer")
  const output = document.querySelector("#events")
  let transfer
  if (root && globalThis.MarkupUITransfer?.createTransfer) {
    try { transfer = globalThis.MarkupUITransfer.createTransfer(root) }
    catch (error) { if (output) output.textContent = `Enhancement unavailable: ${error.message}. Static lists remain; no membership submission is implied.` }
    if (transfer) {
      function inspect() {
        const stateEl = document.querySelector("#state")
        if (stateEl) {
          stateEl.textContent = JSON.stringify(transfer.connected ? transfer.state : {
            handedOffMembership: [...transfer.target.options].map(option => option.value),
            stagedTarget: [...transfer.target.options].filter(option => option.selected).map(option => option.value),
            serialization: "Automatic formdata ownership has been released.",
          }, null, 2)
        }
      }
      root.addEventListener("m:transfer-change", event => {
        if (output) output.textContent = `Moved ${event.detail.moved.join(", ")} to ${event.detail.to}. Membership: ${event.detail.value.join(", ")}.`
        inspect()
      })
      root.addEventListener("m:transfer-stage", () => {
        if (output) output.textContent = "Native highlights changed. Membership did not."
        inspect()
      })
      root.addEventListener("m:transfer-error", event => {
        if (output) output.textContent = event.detail.error.message
        inspect()
      })
      function action(id, callback) {
        document.getElementById(id)?.addEventListener("click", () => {
          try { callback(); inspect() }
          catch (error) { if (output) output.textContent = error.message }
        })
      }
      action("program", () => transfer.setValue(["core", "bravo"]))
      action("defaults", () => transfer.setDefaultValue(["core", "charlie"]))
      action("cancel-reset", () => form?.addEventListener("reset", event => event.preventDefault(), { once: true }))
      action("remove-data", () => {
        [...transfer.source.options, ...transfer.target.options].find(option => option.value === "reader")?.remove()
        transfer.refresh()
      })
      action("append", () => {
        if ([...transfer.source.options, ...transfer.target.options].some(option => option.value === "delta")) return
        const option = document.createElement("option"); option.value = "delta"; option.textContent = "Delta access"
        transfer.source.append(option)
        transfer.refresh()
      })
      action("disable", () => { root.disabled = !root.disabled; transfer.refresh() })
      action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
      action("disconnect", () => {
        transfer.disconnect()
        const tools = document.querySelector("#tools")
        if (tools) tools.hidden = true
        const submitBtn = document.querySelector("#submit-transfer")
        if (submitBtn) submitBtn.hidden = true
        const resetBtn = document.querySelector("#reset-transfer")
        if (resetBtn) resetBtn.hidden = true
        if (output) output.textContent = "Current membership and highlights remain in the native lists. Movement/reset-membership/formdata enhancement is now disconnected."
      })
      form?.addEventListener("submit", event => {
        if (event.defaultPrevented) return
        event.preventDefault()
        if (!transfer.connected) {
          if (output) output.textContent = "Transfer membership serialization is disconnected."
          return
        }
        const submission = document.querySelector("#submission")
        if (submission) {
          submission.textContent = JSON.stringify({
            nativeStagingNames: [transfer.source.name, transfer.target.name],
            targetMembership: transfer.value,
            targetHighlights: [...transfer.target.options].filter(option => option.selected).map(option => option.value),
            actualFormData: [...new FormData(form)],
          }, null, 2)
        }
      })
      form?.addEventListener("reset", () => setTimeout(inspect, 10))
      const tools = document.querySelector("#tools")
      if (tools) tools.hidden = false
      const submitBtn = document.querySelector("#submit-transfer")
      if (submitBtn) submitBtn.hidden = false
      const resetBtn = document.querySelector("#reset-transfer")
      if (resetBtn) resetBtn.hidden = false
      inspect()
      window.transferDemo = { transfer, inspect }
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize, { once: true })
} else {
  initialize()
}

