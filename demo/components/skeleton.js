const repeated = document.querySelector("#repeated")
document.querySelector("#apply-repeat").addEventListener("click", () => {
  repeated.setAttribute("repeat", document.querySelector("#repeat-input").value)
  document.querySelector("#validation-status").textContent = repeated.valid
    ? `Valid repeat: ${repeated.repeat}.`
    : `Invalid placeholder configuration: ${repeated.validationErrors.join(", ")}.`
})
document.querySelector("#toggle-animation").addEventListener("click", () => { repeated.animated = !repeated.animated })
let loading = true
document.querySelector("#toggle-loading").addEventListener("click", () => {
  loading = !loading
  document.querySelector("#content-owner").setAttribute("aria-busy", String(loading))
  document.querySelector("#loading-placeholder").hidden = !loading
  document.querySelector("#loaded-content").hidden = loading
  document.querySelector("#loading-status").textContent = loading ? "Loading the profile." : "Profile loaded."
})
const authored = document.querySelector("#authored")
let actions = 0
document.querySelector("#authored-action").addEventListener("click", () => {
  document.querySelector("#action-status").textContent = `${++actions} authored actions.`
})
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = authored.parentElement
  authored.remove()
  parent.append(authored)
})
