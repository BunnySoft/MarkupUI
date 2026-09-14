export function renderComponentApi(target, elements) {
  if (!target?.ownerDocument || !Array.isArray(elements)) throw new TypeError("API rendering needs a target and source documentation.")
  const document = target.ownerDocument
  const fragment = document.createDocumentFragment()

  function text(tag, value) {
    const node = document.createElement(tag)
    node.textContent = value
    return node
  }

  function table(owner, title, columns, rows) {
    if (!rows.length) return
    const wrapper = document.createElement("div")
    wrapper.className = "component-api-scroll"
    const table = document.createElement("table")
    const caption = text("caption", title)
    caption.id = `api-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    table.append(caption)
    const head = document.createElement("thead")
    const header = document.createElement("tr")
    for (const column of columns) {
      const cell = text("th", column)
      cell.scope = "col"
      header.append(cell)
    }
    head.append(header)
    const body = document.createElement("tbody")
    for (const row of rows) {
      const line = document.createElement("tr")
      for (const value of row) line.append(text("td", String(value)))
      body.append(line)
    }
    table.append(head, body)
    wrapper.append(table)
    owner.append(wrapper)
  }

  function rules(property) {
    const values = []
    if (property.values.length) values.push(property.values.map(value => JSON.stringify(value)).join(", "))
    if (property.integer) values.push("safe integer")
    if (property.min !== null) values.push(`${property.exclusiveMin ? ">" : ">="} ${property.min}`)
    if (property.max !== null) values.push(`<= ${property.max}`)
    if (property.encoding) values.push(`${property.encoding} attribute`)
    return values.join("; ") || "-"
  }

  for (const meta of elements) {
    if (!meta?.type || !meta.properties || !Array.isArray(meta.regions)) throw new TypeError("Element metadata is unavailable.")
    const section = document.createElement("article")
    section.dataset.apiType = meta.type
    const heading = text("h3", `${meta.type} <${meta.web.primary}>`)
    heading.id = `api-${meta.web.primary}`
    section.append(heading)
    table(section, `${meta.type} properties`,
      ["Property", "Type", "Default", "Access", "Attribute", "Rules"],
      Object.values(meta.properties).map(property => [
        property.name, property.type + (property.typeName && property.typeName !== property.type
          ? ` (${property.typeName})` : property.nullable ? " or null" : ""),
        Object.hasOwn(property, "default") ? JSON.stringify(property.default) : property.writable ? "not specified" : "computed",
        property.writable ? "read/write" : "read-only", property.attribute ?? "-", [rules(property), property.description].filter(Boolean).join(" "),
      ]))
    table(section, `${meta.type} content regions`, ["Region", "Content", "Count", "Element"],
      meta.regions.map(region => [region.name, region.accepts.join(", "), `${region.min}..${region.max ?? "unbounded"}`, region.element ?? "authored content"]))
    table(section, `${meta.type} events`, ["Event", "Detail", "Bubbles", "Cancelable", "Composed"],
      meta.events.map(event => [event.web, event.detail ? Object.entries(event.detail).map(([name, type]) => `${name}: ${type}`).join(", ") : "-", event.bubbles, event.cancelable, event.composed]))
    for (const [title, values] of [["Actions", meta.actions], ["States", meta.states], ["Capabilities", meta.capabilities]]) {
      if (values.length) section.append(text("p", `${title}: ${values.join(", ")}.`))
    }
    fragment.append(section)
  }
  target.classList.add("component-api")
  target.replaceChildren(fragment)
}

export async function loadComponentApi(target, url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`API documentation request failed: ${response.status}.`)
    const data = await response.json()
    renderComponentApi(target, data.elements)
  } catch (error) {
    target.textContent = `API documentation unavailable: ${error.message}`
    throw error
  }
}
