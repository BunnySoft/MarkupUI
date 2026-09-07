const upload = document.querySelector("#upload")
const legacy = document.querySelector("#legacy")
document.querySelector("#gradient-line").color = { stops: ["#2080f0", "#18a058"] }
document.querySelector("#gradient-circle").color = { stops: ["#7040a0", "#2080f0"] }
document.querySelector("#multiple").color = ["#2080f0", { stops: ["#18a058", "#d03050"] }, "#7040a0"]
document.querySelector("#multiple").railColor = ["#dde8f6", "#dfeee5", "#ece3f4"]
document.querySelector("#advance").addEventListener("click", () => {
  upload.percentage = Math.min(100, Number(upload.percentage) + 10)
  document.querySelector("#value-status").textContent = `Upload is ${upload.percentage}%.`
})
document.querySelector("#toggle-unknown").addEventListener("click", () => { upload.indeterminate = !upload.indeterminate })
document.querySelector("#toggle-indicator").addEventListener("click", () => { upload.showIndicator = !upload.showIndicator })
document.querySelector("#invalid-max").addEventListener("click", () => {
  legacy.setAttribute("max", "0")
  document.querySelector("#validation-status").textContent = `Invalid fields: ${legacy.validationErrors.join(", ")}.`
})
document.querySelector("#restore-max").addEventListener("click", () => {
  legacy.max = 50
  document.querySelector("#validation-status").textContent = "Legacy range is valid."
})
document.querySelector("#reconnect").addEventListener("click", () => {
  const parent = upload.parentElement
  const next = upload.nextSibling
  upload.remove()
  parent.insertBefore(upload, next)
})
