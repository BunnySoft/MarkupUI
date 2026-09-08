interface OwnedAttribute {
  node: HTMLElement
  name: string
  before: string | null
  value: string | null
  foreign: boolean
  revision: number
}

/** Pending UI can borrow attributes without undoing later author writes, even identical ones. */
export function createFeedbackAttributes(document: Document) {
  let entries: OwnedAttribute[] = []
  const internal: { node: HTMLElement; name: string }[] = []
  const observer = new document.defaultView!.MutationObserver(mark)
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const own = internal.findIndex(item => item.node === record.target && item.name === record.attributeName)
      if (own >= 0) { internal.splice(own, 1); continue }
      const entry = entries.find(item => item.node === record.target && item.name === record.attributeName)
      if (entry) entry.foreign = true
    }
  }
  function stop() { mark(observer.takeRecords()); observer.disconnect() }
  function observe() {
    observer.disconnect()
    for (const node of new Set(entries.map(entry => entry.node))) observer.observe(node, { attributes: true })
  }
  function write(node: HTMLElement, name: string, value: string | null) {
    observe()
    if (value === null && !node.hasAttribute(name)) return
    const marker = { node, name }
    if (entries.some(entry => entry.node === node)) internal.push(marker)
    try {
      if (value === null) node.removeAttribute(name)
      else node.setAttribute(name, value)
    } finally {
      mark(observer.takeRecords())
      const index = internal.indexOf(marker)
      if (index >= 0) internal.splice(index, 1)
      observe()
    }
  }
  return {
    set(node: HTMLElement, name: string, value: string | null) {
      stop()
      let entry = entries.find(item => item.node === node && item.name === name)
      if (!entry) {
        entry = { node, name, before: node.getAttribute(name), value, foreign: false, revision: 0 }
        entries.push(entry)
      }
      entry.revision++
      if (!entry.foreign) { entry.value = value; write(node, name, value) }
      observe()
    },
    restore() {
      stop()
      const restoring = entries.map(entry => ({ entry, revision: entry.revision })).reverse()
      for (const { entry, revision } of restoring) {
        mark(observer.takeRecords())
        const index = entries.indexOf(entry)
        if (index < 0 || entry.revision !== revision) continue
        entries.splice(index, 1)
        if (!entry.foreign && entry.node.getAttribute(entry.name) === entry.value) write(entry.node, entry.name, entry.before)
      }
      observe()
    },
  }
}
