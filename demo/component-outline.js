export function createComponentOutline(document = globalThis.document, view = globalThis.window) {
  const main = document.querySelector("main.component-docs")
  const api = main?.querySelector('[id$="-api"]')
  if (!main || !api) throw new Error("Component documentation needs a page and API container.")

  const outline = document.createElement("aside")
  outline.className = "component-outline"
  const panel = document.createElement("details")
  const summary = document.createElement("summary")
  summary.textContent = "On this page"
  const navigation = document.createElement("nav")
  navigation.setAttribute("aria-label", "On this page")
  panel.append(summary, navigation)
  outline.append(panel)
  main.insertBefore(outline, main.querySelector(".component-docs-nav"))
  main.classList.add("has-outline")

  const media = view.matchMedia("(max-width: 1000px)")
  let entries = []
  let activeLink = null
  let animationFrame = 0

  function updateActive() {
    let active = entries[0]
    for (const entry of entries) {
      const rect = entry.target.getBoundingClientRect()
      if (rect.height > 0 && rect.top <= 48) active = entry
    }
    if (view.scrollY > 0 && view.scrollY + view.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = entries.at(-1)
    }
    if (!active || active.link === activeLink) return
    activeLink?.removeAttribute("aria-current")
    activeLink = active.link
    activeLink.setAttribute("aria-current", "location")
    if (panel.open && !media.matches) {
      const linkRect = activeLink.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      if (linkRect.top < panelRect.top + summary.offsetHeight || linkRect.bottom > panelRect.bottom) {
        panel.scrollTop += linkRect.top - panelRect.top - panel.clientHeight / 2
      }
    }
  }

  function onScroll() {
    if (!animationFrame) {
      animationFrame = view.requestAnimationFrame(() => {
        animationFrame = 0
        updateActive()
      })
    }
  }

  function renderLinks() {
    const list = document.createElement("ol")
    entries = [...main.querySelectorAll(
      ":scope > [data-demo-example] [data-demo-header] h2, "
      + ":scope > section > h2, .component-api article > h3, .component-api caption",
    )].map(target => {
      if (!target.id) throw new Error("An outlined documentation heading needs an ID.")
      const item = document.createElement("li")
      const link = document.createElement("a")
      const owner = target.closest("[data-api-type]")
      link.href = `#${target.id}`
      link.title = target.textContent
      link.textContent = target.textContent
      if (owner) {
        item.className = target.tagName === "CAPTION" ? "outline-table" : "outline-type"
        link.textContent = target.tagName === "CAPTION"
          ? target.textContent.slice(owner.dataset.apiType.length + 1)
          : owner.dataset.apiType
      }
      item.append(link)
      list.append(item)
      return { target, link }
    })
    activeLink = null
    navigation.replaceChildren(list)
    updateActive()
  }

  function onNavigate(event) {
    const link = event.target.closest("a")
    if (!link || !navigation.contains(link) || event.defaultPrevented || event.button !== 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const entry = entries.find(entry => entry.link === link)
    if (media.matches) {
      panel.open = false
      if (!entry.target.hasAttribute("tabindex")) {
        entry.target.tabIndex = -1
      }
      entry.target.focus({ preventScroll: true })
    }
  }

  function onMediaChange() {
    panel.open = !media.matches
    onScroll()
  }

  const observer = new view.MutationObserver(renderLinks)
  observer.observe(api, { childList: true })
  navigation.addEventListener("click", onNavigate)
  view.addEventListener("scroll", onScroll, { passive: true })
  view.addEventListener("resize", onScroll)
  media.addEventListener("change", onMediaChange)
  panel.open = !media.matches
  renderLinks()

  return {
    disconnect() {
      observer.disconnect()
      navigation.removeEventListener("click", onNavigate)
      view.removeEventListener("scroll", onScroll)
      view.removeEventListener("resize", onScroll)
      media.removeEventListener("change", onMediaChange)
      if (animationFrame) view.cancelAnimationFrame(animationFrame)
      outline.remove()
      main.classList.remove("has-outline")
    },
  }
}

if (document.querySelector("main.component-docs")) {
  createComponentOutline()
}
