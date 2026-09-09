const form = document.querySelector("#members-form"), root = document.querySelector("#transfer")
const output = document.querySelector("#events")
let transfer
try { transfer = MarkupUITransfer.createTransfer(root) }
catch (error) { output.textContent = `Enhancement unavailable: ${error.message}. Static lists remain; no membership submission is implied.` }
if (transfer) {
  function inspect() {
    document.querySelector("#state").textContent = JSON.stringify(transfer.connected ? transfer.state : {
      handedOffMembership: [...transfer.target.options].map(option => option.value),
      stagedTarget: [...transfer.target.options].filter(option => option.selected).map(option => option.value),
      serialization: "Automatic formdata ownership has been released.",
    }, null, 2)
  }
  root.addEventListener("mui:transfer-change", event => { output.textContent = `Moved ${event.detail.moved.join(", ")} to ${event.detail.to}. Membership: ${event.detail.value.join(", ")}.`; inspect() })
  root.addEventListener("mui:transfer-stage", () => { output.textContent = "Native highlights changed. Membership did not."; inspect() })
  root.addEventListener("mui:transfer-error", event => { output.textContent = event.detail.error.message; inspect() })
  function action(id, callback) { document.getElementById(id).addEventListener("click", () => { try { callback(); inspect() } catch (error) { output.textContent = error.message } }) }
  action("program", () => transfer.setValue(["core", "bravo"]))
  action("defaults", () => transfer.setDefaultValue(["core", "charlie"]))
  action("cancel-reset", () => form.addEventListener("reset", event => event.preventDefault(), { once: true }))
  action("remove-data", () => { [...transfer.source.options, ...transfer.target.options].find(option => option.value === "reader")?.remove(); transfer.refresh() })
  action("append", () => {
    if ([...transfer.source.options, ...transfer.target.options].some(option => option.value === "delta")) return
    const option = document.createElement("option"); option.value = "delta"; option.textContent = "Delta access"
    transfer.source.append(option); transfer.refresh()
  })
  action("disable", () => { root.disabled = !root.disabled; transfer.refresh() })
  action("rtl", () => { document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl" })
  action("disconnect", () => {
    transfer.disconnect()
    document.querySelector("#tools").hidden = true; document.querySelector("#submit-transfer").hidden = true; document.querySelector("#reset-transfer").hidden = true
    output.textContent = "Current membership and highlights remain in the native lists. Movement/reset-membership/formdata enhancement is now disconnected."
  })
  form.addEventListener("submit", event => {
    if (event.defaultPrevented) return
    event.preventDefault()
    if (!transfer.connected) { output.textContent = "Transfer membership serialization is disconnected."; return }
    document.querySelector("#submission").textContent = JSON.stringify({
      nativeStagingNames: [transfer.source.name, transfer.target.name],
      targetMembership: transfer.value,
      targetHighlights: [...transfer.target.options].filter(option => option.selected).map(option => option.value),
      actualFormData: [...new FormData(form)],
    }, null, 2)
  })
  form.addEventListener("reset", () => setTimeout(inspect, 10))
  document.querySelector("#tools").hidden = false; document.querySelector("#submit-transfer").hidden = false; document.querySelector("#reset-transfer").hidden = false
  inspect()
  window.transferDemo = { transfer, inspect }
}
