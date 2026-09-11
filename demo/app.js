import { componentGroups, components } from "./catalog.js"

export function createComponentBrowser(document = globalThis.document, view = globalThis.window) {
  const navigation = document.getElementById("component-navigation")
  const sidebar = document.getElementById("component-sidebar")
  const toggle = document.getElementById("navigation-toggle")
  const search = document.getElementById("component-search")
  const empty = document.getElementById("no-results")
  const count = document.getElementById("component-count")
  const title = document.getElementById("component-title")
  const category = document.getElementById("component-category")
  const standalone = document.getElementById("standalone-link")
  const note = document.getElementById("component-note")
  const status = document.getElementById("page-status")
  let frame = document.getElementById("component-frame")
  if ([navigation, sidebar, toggle, search, empty, count, title, category, standalone,
    note, status, frame].some(node => !node)) {
    throw new Error("Component browser markup is incomplete.")
  }

  const entries = new Map(components.map(component => [component.slug, component]))
  const links = new Map()
  const groups = []
  const media = view.matchMedia("(max-width: 760px)")
  const alternatives = new Set(["equation", "qr-code", "legacy-grid", "legacy-transfer"])
  let menuOpen = false
  let current = null
  const fragment = document.createDocumentFragment()

  function focusControl(element) {
    const control = element.querySelector("[data-mui-button-control], button, a")
    if (control) control.focus()
    else element.focus()
  }

  for (const [index, group] of componentGroups.entries()) {
    const section = document.createElement("section")
    section.className = "nav-group"
    const heading = document.createElement("h2")
    heading.id = `component-group-${index}`
    heading.textContent = group.name
    section.setAttribute("aria-labelledby", heading.id)
    const list = document.createElement("ul")
    list.setAttribute("role", "list")
    const items = []
    for (const [slug, name] of group.items) {
      const item = document.createElement("li")
      const link = document.createElement("a")
      const url = new URL(view.location.href)
      url.search = ""
      url.searchParams.set("component", slug)
      url.hash = ""
      link.href = url.href
      link.className = "component-link"
      link.dataset.component = slug
      link.textContent = name
      item.append(link)
      list.append(item)
      links.set(slug, link)
      items.push({ item, name, slug })
    }
    section.append(heading, list)
    fragment.append(section)
    groups.push({ section, items })
  }
  navigation.replaceChildren(fragment)

  function updateNavigation() {
    const hidden = media.matches && !menuOpen
    if (hidden && sidebar.contains(document.activeElement)) focusControl(toggle)
    sidebar.hidden = hidden
    toggle.hidden = !media.matches
    toggle.setAttribute("aria-expanded", String(!hidden))
  }

  function filter() {
    const query = search.value.trim().toLowerCase()
    let visible = 0
    for (const group of groups) {
      let groupVisible = 0
      for (const { item, name, slug } of group.items) {
        item.hidden = !`${name} ${slug}`.toLowerCase().includes(query)
        if (!item.hidden) groupVisible++
      }
      group.section.hidden = groupVisible === 0
      visible += groupVisible
    }
    empty.hidden = visible !== 0
    count.textContent = `${visible} of ${components.length} components`
  }

  function requestedComponent() {
    const url = new URL(view.location.href)
    return url.searchParams.get("component")
      ?? (entries.has(url.hash.slice(1)) ? url.hash.slice(1) : "avatar")
  }

  function navigateFrame(url, hidden = false) {
    // A fresh context avoids adding iframe-only entries to browser Back/Forward history.
    const next = frame.cloneNode(false)
    next.src = url
    next.hidden = hidden
    frame.removeEventListener("load", onLoad)
    frame.removeEventListener("error", onError)
    frame.replaceWith(next)
    frame = next
    frame.addEventListener("load", onLoad)
    frame.addEventListener("error", onError)
  }

  function select(slug, historyMode = null, focus = false) {
    const component = entries.get(slug)
    for (const [key, link] of links) {
      if (component && key === slug) link.setAttribute("aria-current", "page")
      else link.removeAttribute("aria-current")
    }
    if (!component) {
      current = null
      title.textContent = "Component not found"
      category.textContent = "Components"
      note.textContent = "Choose a component from the navigation."
      standalone.hidden = true
      frame.removeAttribute("aria-busy")
      navigateFrame("about:blank", true)
      status.hidden = false
      status.textContent = "The requested component is not in this catalog."
      document.title = "Component not found - MarkupUI"
      return
    }
    if (historyMode) {
      const url = new URL(view.location.href)
      url.searchParams.set("component", slug)
      url.hash = ""
      view.history[historyMode === "push" ? "pushState" : "replaceState"](null, "", url)
    }
    const url = new URL(`./components/${slug}.html`, document.baseURI)
    title.textContent = component.name
    category.textContent = component.category
    standalone.href = url.href
    standalone.hidden = false
    note.textContent = alternatives.has(slug)
      ? "This page documents a native alternative or explicit API exclusion, not full upstream compatibility."
      : "Current standalone examples. This page loads its own component styles and scripts."
    document.title = `${component.name} - MarkupUI`
    if (current !== slug) {
      current = slug
      frame.title = `${component.name} examples`
      frame.setAttribute("aria-busy", "true")
      status.hidden = false
      status.textContent = `Loading ${component.name} examples...`
      navigateFrame(url.href)
    }
    menuOpen = false
    updateNavigation()
    if (focus) title.focus({ preventScroll: true })
  }

  function onClick(event) {
    const link = event.target.closest?.("a[data-component]")
    if (!link || !navigation.contains(link) || event.defaultPrevented || event.button !== 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    const slug = link.dataset.component
    select(slug, current === slug ? null : "push", true)
  }
  function onPopState() { select(requestedComponent()) }
  function onToggle() { menuOpen = !menuOpen; updateNavigation() }
  function onMediaChange() { menuOpen = false; updateNavigation() }
  function onKeyDown(event) {
    if (event.key === "Escape" && media.matches && menuOpen) {
      menuOpen = false
      updateNavigation()
      focusControl(toggle)
    }
  }
  function onLoad() {
    frame.removeAttribute("aria-busy")
    if (current) status.hidden = true
  }
  function onError() {
    frame.removeAttribute("aria-busy")
    status.hidden = false
    status.textContent = "The example could not be loaded. Try the standalone link."
  }

  navigation.addEventListener("click", onClick)
  search.addEventListener("input", filter)
  toggle.addEventListener("click", onToggle)
  sidebar.addEventListener("keydown", onKeyDown)
  frame.addEventListener("load", onLoad)
  frame.addEventListener("error", onError)
  view.addEventListener("popstate", onPopState)
  media.addEventListener("change", onMediaChange)
  filter()
  updateNavigation()
  select(requestedComponent(), "replace")

  return {
    get current() { return current },
    disconnect() {
      navigation.removeEventListener("click", onClick)
      search.removeEventListener("input", filter)
      toggle.removeEventListener("click", onToggle)
      sidebar.removeEventListener("keydown", onKeyDown)
      frame.removeEventListener("load", onLoad)
      frame.removeEventListener("error", onError)
      view.removeEventListener("popstate", onPopState)
      media.removeEventListener("change", onMediaChange)
    },
  }
}

if (document.getElementById("component-app")) {
  createComponentBrowser()
}
