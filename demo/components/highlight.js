const { highlightText } = window.MarkupUIHighlight
document.querySelector("#matching-controls").disabled = false
const form = document.querySelector("#highlight-form")
const source = document.querySelector("#text-input")
const patterns = document.querySelector("#pattern-input")
const sensitive = document.querySelector("#case-sensitive")
const palette = document.querySelector("#palette")
const preview = document.querySelector("#preview")
const errorMessage = document.querySelector("#error-message")

function update() {
  try {
    const ranges = highlightText(preview, source.value, patterns.value.split(/\r?\n/), {
      caseSensitive: sensitive.checked,
      highlightClass: palette.value,
    })
    document.querySelector("#feedback").textContent = `${ranges.length} literal matches. Offsets use the original UTF-16 text.`
    errorMessage.textContent = ""
  } catch (error) {
    if (!(error instanceof TypeError || error instanceof RangeError)) throw error
    errorMessage.textContent = `Preview not updated: ${error.message}`
  }
}
form.addEventListener("submit", event => {
  event.preventDefault()
  update()
})
form.addEventListener("input", update)
document.querySelector("#clear-patterns").addEventListener("click", () => {
  patterns.value = ""
  update()
})
update()
highlightText(document.querySelector("#link-surface"), "Atlas notes", ["Atlas"])
highlightText(document.querySelector("#rtl-surface"), "بحث Atlas بحث", ["بحث"])
