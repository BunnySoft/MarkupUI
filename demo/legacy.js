import { m } from "../dist/markup-ui.js?v=11.1"
import { advancedPlugin } from "../dist/markup-ui-advanced.js?v=11.1"
import { widgetsPlugin } from "../dist/markup-ui-widgets.js?v=11.1"

m.use(advancedPlugin)
m.use(widgetsPlugin)

m.theme.register("ocean", {
  "color-primary": "#0284c7",
  "color-primary-hover": "#0369a1",
  "bg-page": "#f0f9ff",
  "bg-surface": "#ffffff",
  "bg-muted": "#e0f2fe",
  "text-primary": "#0c4a6e",
  "text-secondary": "#47677a",
  "border": "#bae6fd",
})

const savedTheme = localStorage.getItem("m-theme")
m.theme.set(["light", "dark", "ocean"].includes(savedTheme) ? savedTheme : "light")

const app = document.querySelector("#demo-app")
const store = app?.store
const panelNames = [
  "layout",
  "content",
  "forms",
  "navigation",
  "advanced",
  "widgets",
  "themes",
  "overlays",
  "runtime",
  "distribution",
]

store?.set("form.name", "Ada")
store?.set("form.role", "developer")
store?.set("form.city", "London")
store?.set("form.plan", "professional")
store?.set("form.confidence", 70)
store?.set("form.notes", "Building a browser-native UI.")
store?.set("form.newsletter", true)
store?.set("form.notifications", false)
store?.set("form.busy", false)
store?.set("form.saved", false)
store?.set("form.valid", false)
store?.set("form.invalid", false)
store?.set("metrics.clicks", 0)
store?.set("events.latest", "Waiting for interaction")
store?.set("navigation.selection", "reports")

const advancedGrid = document.querySelector("#advanced-grid")
advancedGrid.rows = [
  { name: "Ada", role: "Engineer", score: 98 },
  { name: "Grace", role: "Reviewer", score: 94 },
  { name: "Linus", role: "Maintainer", score: 91 },
  { name: "Margaret", role: "Architect", score: 99 },
]

const advancedVirtualList = document.querySelector("#advanced-virtual-list")
advancedVirtualList.items = Array.from({ length: 10000 }, (_, index) => `Virtual row ${index + 1}`)

const widgetTransfer = document.querySelector("#widget-transfer")
widgetTransfer.options = [
  { label: "Reports", value: "reports" },
  { label: "Metrics", value: "metrics" },
  { label: "Dashboards", value: "dashboards" },
  { label: "Stories", value: "stories" },
]
widgetTransfer.value = ["reports"]

const widgetCascader = document.querySelector("#widget-cascader")
widgetCascader.options = [
  {
    label: "Analytics",
    value: "analytics",
    children: [
      { label: "Reports", value: "reports" },
      { label: "Metrics", value: "metrics" },
    ],
  },
  {
    label: "Data",
    value: "data",
    children: [
      { label: "Datasets", value: "datasets" },
      { label: "Connections", value: "connections" },
    ],
  },
]

function selectPanel(name, scroll = false) {
  if (!panelNames.includes(name)) return
  const workspace = document.querySelector(".showcase-workspace")
  let workspaceTop
  if (scroll && workspace) {
    workspaceTop = Math.max(0, window.scrollY + workspace.getBoundingClientRect().top - 76)
    window.scrollTo({ top: workspaceTop, behavior: "auto" })
  }
  panelNames.forEach((panel) => store?.set(`panels.${panel}`, panel === name))
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    const active = item.getAttribute("m-param-panel") === name
    item.classList.toggle("active", active)
    if (active) item.setAttribute("aria-current", "page")
    else item.removeAttribute("aria-current")
  })
  history.replaceState(null, "", `#${name}`)
  if (workspaceTop !== undefined) {
    window.scrollTo({ top: workspaceTop, behavior: "auto" })
    requestAnimationFrame(() => window.scrollTo({ top: workspaceTop, behavior: "auto" }))
  }
  requestAnimationFrame(updateOutline)
}

const requestedPanel = location.hash.slice(1)
selectPanel(panelNames.includes(requestedPanel) ? requestedPanel : "layout")

function record(message) {
  store?.set("events.latest", message)
}

m.actions.register("demo.theme", ({ parameters }) => {
  const name = parameters.name ?? "light"
  m.theme.set(name)
  record(`theme changed to ${name}`)
})

m.actions.register("demo.panel", ({ event, parameters }) => {
  event.preventDefault()
  const name = parameters.panel ?? "layout"
  selectPanel(name, true)
  record(`showing ${name} panel`)
})

m.actions.register("demo.increment", ({ store: actionStore }) => {
  const current = Number(actionStore?.get("metrics.clicks") ?? 0)
  actionStore?.set("metrics.clicks", current + 1)
  record("demo.increment action")
})

m.actions.register("demo.progress", () => {
  const progress = document.querySelector("#demo-progress")
  if (!progress) return
  const current = Number(progress.getAttribute("value") ?? 0)
  progress.setAttribute("value", String(current >= 100 ? 0 : current + 10))
  record("progress value updated")
})

m.actions.register("demo.message", () => {
  m.message.show("Profile saved successfully.", {
    duration: 2500,
    type: "success",
  })
  record("message service invoked")
})

m.actions.register("demo.notification", () => {
  m.notification.show({
    title: "Build complete",
    content: "MarkupUI generated all browser distributions.",
    duration: 4000,
    type: "default",
  })
  record("notification service invoked")
})

m.actions.register("demo.next-step", () => {
  const steps = document.querySelector("#demo-steps")
  if (!steps) return
  steps.current = steps.current >= 3 ? 1 : steps.current + 1
  record(`advanced to step ${steps.current}`)
})

m.actions.register("demo.outline", ({ event, parameters }) => {
  event.preventDefault()
  const target = parameters.target
  if (!target) return
  document.querySelector(target)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
})

m.actions.register("demo.toggle-source", ({ element, parameters }) => {
  const target = parameters.target
  if (!target) return
  const source = document.querySelector(target)
  if (!source) return
  source.hidden = !source.hidden
  element.textContent = source.hidden ? "View code" : "Hide code"
})

m.actions.register("demo.copy-source", async ({ parameters }) => {
  const target = parameters.target
  if (!target) return
  const source = document.querySelector(target)
  if (!source) return
  await navigator.clipboard.writeText(source.textContent ?? "")
  m.message.show("Example copied.", { duration: 1800, type: "success" })
})

m.actions.register("demo.save", async ({ store: actionStore }) => {
  const form = document.querySelector("#profile-form")
  if (typeof form?.validate === "function" && !form.validate()) return
  actionStore?.set("form.busy", true)
  actionStore?.set("form.saved", false)
  record("saving profile")
  await new Promise((resolve) => setTimeout(resolve, 500))
  actionStore?.set("form.busy", false)
  actionStore?.set("form.saved", true)
  record("profile saved")
})

m.actions.register("demo.reset", ({ store: actionStore }) => {
  actionStore?.set("form.name", "Ada")
  actionStore?.set("form.role", "developer")
  actionStore?.set("form.city", "London")
  actionStore?.set("form.plan", "professional")
  actionStore?.set("form.confidence", 70)
  actionStore?.set("form.notes", "Building a browser-native UI.")
  actionStore?.set("form.newsletter", true)
  actionStore?.set("form.notifications", false)
  actionStore?.set("form.saved", false)
  actionStore?.set("form.valid", false)
  actionStore?.set("form.invalid", false)
  actionStore?.set("metrics.clicks", 0)
  const newsletter = document.querySelector("#newsletter")
  const notifications = document.querySelector("#notifications")
  if (newsletter) newsletter.checked = true
  if (notifications) notifications.checked = false
  record("state reset")
})

m.actions.register("demo.reload", async () => {
  const include = document.querySelector("#activity")
  if (typeof include?.load === "function") {
    record("reloading dynamic fragment")
    await include.load()
  }
})

m.actions.register("demo.sanitize", () => {
  const target = document.querySelector("#sanitized-output")
  if (!target) return
  m.html.set(
    target,
    `<m-alert onclick="alert('blocked')">
      Unsafe handler and script removed.
      <script>window.demoUnsafe = true</script>
      <m-link href="javascript:alert('blocked')">Unsafe URL removed</m-link>
    </m-alert>`,
  )
  record("unsafe HTML sanitized")
})

m.use({
  name: "demo.highlight",
  install(api) {
    api.queryExtensions.register("highlight", function () {
      return this.addClass("plugin-highlight")
    })
  },
})

m.actions.register("demo.plugin", () => {
  const target = m("#plugin-target")
  target.highlight()
  record("plugin query extension executed")
  setTimeout(() => target.removeClass("plugin-highlight"), 900)
})

const profileForm = document.querySelector("#profile-form")
profileForm?.addEventListener("m:valid", () => {
  store?.set("form.valid", true)
  store?.set("form.invalid", false)
  record("form validation passed")
})
profileForm?.addEventListener("m:invalid", () => {
  store?.set("form.valid", false)
  store?.set("form.invalid", true)
  record("form validation failed")
})

document.querySelector("#demo-tag")?.addEventListener("m:close", (event) => {
  event.currentTarget?.remove()
  record("closable tag emitted m:close")
})

document.querySelector("#demo-menu")?.addEventListener("m:change", (event) => {
  store?.set("navigation.selection", event.detail)
})

document.querySelector("#demo-pagination")?.addEventListener("m:change", (event) => {
  store?.set("navigation.selection", `page ${event.detail}`)
})

document.querySelector("#demo-tree")?.addEventListener("m:change", (event) => {
  store?.set("navigation.selection", event.detail)
})

widgetTransfer?.addEventListener("m:change", (event) => {
  const target = document.querySelector("#transfer-value")
  if (target) target.textContent = event.detail.join(", ") || "None"
})

widgetCascader?.addEventListener("m:change", (event) => {
  const target = document.querySelector("#cascader-value")
  if (target) target.textContent = event.detail.join(" / ")
})

document.querySelector("#component-search")?.addEventListener("m:input", (event) => {
  const query = String(event.detail ?? "").trim().toLowerCase()
  const items = [...document.querySelectorAll(".sidebar-item")]
  let visible = 0
  items.forEach((item) => {
    const match = !query || item.textContent?.toLowerCase().includes(query)
    item.hidden = !match
    if (match) visible += 1
  })
  const empty = document.querySelector("#search-empty")
  if (empty) empty.hidden = visible !== 0
})

function updateOutline() {
  const panel = document.querySelector(".showcase-section:not([hidden])")
  const outline = document.querySelector("#page-outline")
  if (!panel || !outline) return
  const headings = [...panel.querySelectorAll("m-heading > h2,m-heading > h3")]
  const items = headings.map((heading, index) => {
    heading.id ||= `outline-${panel.id}-${index + 1}`
    const item = document.createElement("m-button")
    item.className = "outline-item"
    item.setAttribute("appearance", "quaternary")
    item.setAttribute("m-action", "demo.outline")
    item.setAttribute("m-param-target", `#${heading.id}`)
    item.dataset.level = heading.localName.slice(1)
    item.textContent = heading.textContent
    return item
  })
  outline.replaceChildren(...items)
}

function topLevelCards(root) {
  return [...root.querySelectorAll("m-card")]
    .filter((card) => card.parentElement?.closest("m-card") === null)
}

async function installDemoCards() {
  const response = await fetch("./legacy.html")
  if (!response.ok) throw new Error(`Unable to load demo source: HTTP ${response.status}.`)
  const sourceDocument = new DOMParser().parseFromString(await response.text(), "text/html")
  panelNames.forEach((panelName) => {
    const livePanel = document.querySelector(`#${panelName}`)
    const sourcePanel = sourceDocument.querySelector(`#${panelName}`)
    if (!livePanel || !sourcePanel) return
    const liveCards = topLevelCards(livePanel)
    const sourceCards = topLevelCards(sourcePanel)
    liveCards.forEach((card, index) => {
      if (card.querySelector(".demo-card-tools")) return
      card.classList.add("demo-card")
      const source = document.createElement("pre")
      source.id = `demo-source-${panelName}-${index + 1}`
      source.className = "demo-source"
      source.hidden = true
      const code = document.createElement("code")
      code.textContent = sourceCards[index]?.outerHTML.trim() ?? card.outerHTML.trim()
      source.append(code)
      const tools = document.createElement("m-row")
      tools.className = "demo-card-tools"
      tools.setAttribute("align", "center")
      tools.setAttribute("gap", "xs")
      const spacer = document.createElement("m-spacer")
      const toggle = document.createElement("m-button")
      toggle.setAttribute("appearance", "quaternary")
      toggle.setAttribute("size", "small")
      toggle.setAttribute("m-action", "demo.toggle-source")
      toggle.setAttribute("m-param-target", `#${source.id}`)
      toggle.textContent = "View code"
      const copy = document.createElement("m-button")
      copy.setAttribute("appearance", "quaternary")
      copy.setAttribute("size", "small")
      copy.setAttribute("m-action", "demo.copy-source")
      copy.setAttribute("m-param-target", `#${source.id}`)
      copy.textContent = "Copy"
      tools.append(spacer, toggle, copy)
      const content = card.querySelector(":scope > m-card-content, :scope > [data-part=content]") ?? card
      content.append(tools, source)
    })
  })
  updateOutline()
}

void installDemoCards().catch((error) => {
  console.error("Unable to install demo documentation tools.", error)
  m.message.show("Demo source tools failed to load.", { type: "error" })
})

app?.addEventListener("m:input", (event) => {
  record(`${event.target.localName} emitted m:input`)
})

app?.addEventListener("m:change", (event) => {
  record(`${event.target.localName} emitted m:change`)
})

const include = document.querySelector("#activity")
const includeStatus = document.querySelector("#include-status")

include?.addEventListener("m:load", () => {
  if (includeStatus) includeStatus.textContent = "Loaded"
  record("dynamic fragment loaded")
})

include?.addEventListener("m:error", (event) => {
  if (includeStatus) includeStatus.textContent = "Failed"
  console.error("Dynamic content failed to load.", event.detail)
})
