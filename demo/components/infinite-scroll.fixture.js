export function waitForLocalLoad(signal, milliseconds, ignoreAbort = false) {
  return new Promise((resolve, reject) => {
    if (signal.aborted && !ignoreAbort) { reject(signal.reason); return }
    const finish = () => { signal.removeEventListener("abort", cancel); resolve() }
    const timer = setTimeout(finish, milliseconds)
    function cancel() { clearTimeout(timer); signal.removeEventListener("abort", cancel); reject(signal.reason) }
    if (!ignoreAbort) signal.addEventListener("abort", cancel, { once: true })
  })
}

export function localItem(template, index) {
  const item = template.ownerDocument.importNode(template.content.firstElementChild, true)
  item.querySelector("[data-item-title]").textContent = `Local item ${index}`
  const input = item.querySelector("input")
  input.name = `note-${index}`
  input.defaultValue = `Editable note ${index}`
  input.disabled = index === 3
  return item
}
