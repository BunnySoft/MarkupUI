interface OwnedAttribute {
  element: HTMLElement
  name: string
  previous: string | null
  value: string | null
  group: string
  foreign: boolean
}

/** Attribute writes after our write, even identical disabled=true writes, belong to the author. */
export function createActionState(document: Document, checkRemoval: () => void) {
  let entries: OwnedAttribute[] = []
  function mark(records: MutationRecord[]) {
    for (const record of records) {
      const entry = entries.find(item => item.element === record.target && item.name === record.attributeName)
      if (entry) entry.foreign = true
    }
  }
  const observer = new document.defaultView!.MutationObserver(records => {
    mark(records)
    checkRemoval()
  })
  function pause() {
    mark(observer.takeRecords())
    observer.disconnect()
  }
  function observe() {
    if (!entries.length) return
    for (const element of new Set(entries.map(entry => entry.element))) observer.observe(element, { attributes: true })
    observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "inert", "disabled"] })
  }
  function write(element: HTMLElement, name: string, value: string | null) {
    if (value === null) element.removeAttribute(name)
    else element.setAttribute(name, value)
  }
  return {
    set(element: HTMLElement, name: string, value: string | null, group = "session") {
      pause()
      let entry = entries.find(item => item.element === element && item.name === name)
      if (!entry) {
        entry = { element, name, previous: element.getAttribute(name), value, group, foreign: false }
        entries.push(entry)
      }
      if (!entry.foreign) {
        entry.value = value
        write(element, name, value)
      }
      observe()
    },
    restore(group?: string) {
      pause()
      const restoring = entries.filter(entry => group === undefined || entry.group === group)
      entries = entries.filter(entry => !restoring.includes(entry))
      for (const entry of restoring.reverse()) {
        if (!entry.foreign && entry.element.getAttribute(entry.name) === entry.value) {
          write(entry.element, entry.name, entry.previous)
        }
      }
      observe()
    },
  }
}
