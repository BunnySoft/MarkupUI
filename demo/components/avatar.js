const contentName = document.getElementById("content-name")
const debugName = document.getElementById("debug-name")
const debugShow = document.getElementById("debug-show")
const debugAnchor = document.getElementById("debug-if-anchor")
const debugTemplate = document.getElementById("debug-if-template")
let debugVisible = false
let debugConditional

function updateContent(selector, value) {
  for (const node of document.querySelectorAll(selector)) {
    node.textContent = value
  }
}

contentName.addEventListener("input", () => {
  updateContent("[data-content-name]", contentName.value)
})

debugName.addEventListener("input", () => {
  updateContent("[data-debug-name]", debugName.value)
})

document.getElementById("debug-toggle").addEventListener("click", () => {
  debugVisible = !debugVisible
  debugShow.hidden = !debugVisible
  if (debugVisible) {
    debugConditional = document.importNode(debugTemplate.content.firstElementChild, true)
    debugConditional.querySelector("[data-debug-name]").textContent = debugName.value
    debugAnchor.after(debugConditional)
  } else {
    debugConditional?.remove()
    debugConditional = undefined
  }
})
