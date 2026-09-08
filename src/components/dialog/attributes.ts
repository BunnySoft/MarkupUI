interface Entry {
  node: HTMLElement
  name: string
  before: string | null
  value: string | null
  foreign: boolean
}

/** Restore only our writes, including respecting identical subsequent author writes. */
export function ownedAttributes(document: Document) {
  let entries: Entry[] = []
  const observer = new document.defaultView!.MutationObserver(mark)
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const entry = entries.find(item => item.node === record.target && item.name === record.attributeName)
      if (entry) entry.foreign = true
    }
  }
  function pause() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    for (const node of new Set(entries.map(entry => entry.node))) observer.observe(node, { attributes: true })
  }
  function write(node: HTMLElement, name: string, value: string | null) {
    if (value === null) node.removeAttribute(name)
    else node.setAttribute(name, value)
  }
  return {
    set(node: HTMLElement, name: string, value: string | null) {
      pause()
      let entry = entries.find(item => item.node === node && item.name === name)
      if (!entry) {
        entry = { node, name, before: node.getAttribute(name), value, foreign: false }
        entries.push(entry)
      }
      if (!entry.foreign) { entry.value = value; write(node, name, value) }
      observe()
    },
    restore() {
      pause()
      for (const entry of entries.reverse()) {
        if (!entry.foreign && entry.node.getAttribute(entry.name) === entry.value) write(entry.node, entry.name, entry.before)
      }
      entries = []
    },
  }
}
