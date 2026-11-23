import * as ui from "../dist/markup-ui-ui.js"
import { A2UI_CATALOG_ID, createA2UIRenderer } from "../dist/markup-ui-a2ui.js"

window.addEventListener("error", event => {
  const error = document.getElementById("demo-error")
  error.hidden = false
  error.textContent = event.message
})

const counterText = document.createTextNode("No clicks yet.")
let clicks = 0

function countClick() {
  clicks += 1
  counterText.data = `Clicked ${clicks} time${clicks === 1 ? "" : "s"}.`
}

ui.box(
  ui.heading("Built with JavaScript").level(2),
  ui.span("These are the same MarkupUI elements you can author in HTML."),
  ui.flex(
    ui.button("Count a click").type("primary").on("click", countClick),
    ui.span(counterText).id("builder-count"),
  ).wrap().gap(12),
  ui.link("Explore the component reference").href("./index.html"),
).display("flex").direction("column").gap(16).mount("#builder-example")

let surfaceNumber = 1
let count = 0
const surfaceId = () => `example-${surfaceNumber}`
const output = document.getElementById("action-output")
const renderer = createA2UIRenderer(document.getElementById("agent-example"), {
  onAction: handleAction,
})

function createSurface() {
  renderer.receive({
    version: "1.0",
    createSurface: {
      surfaceId: surfaceId(),
      catalogId: A2UI_CATALOG_ID,
      dataModel: { title: "Hello from A2UI", count: 0 },
      components: [
        { id: "root", component: "Column", children: ["title", "row"] },
        { id: "title", component: "Text", text: { "@path": "/title" } },
        { id: "row", component: "Row", children: ["increment"], align: "center" },
        {
          id: "increment", component: "Button", variant: "primary", child: "label",
          action: { event: { name: "increment", context: { count: { "@path": "/count" } } } },
        },
        { id: "label", component: "Text", text: "Send an action" },
      ],
    },
  })
}

function handleAction(message) {
  if (message.action.name !== "increment") throw new Error("Unknown demo action.")
  output.textContent = JSON.stringify(message, null, 2)
  count += 1
  renderer.receive({
    version: "1.0",
    updateDataModel: {
      surfaceId: surfaceId(),
      value: { title: `The host handled ${count} action${count === 1 ? "" : "s"}.`, count },
    },
  })
}

function updateFromHost() {
  renderer.receive({
    version: "1.0",
    updateDataModel: { surfaceId: surfaceId(), path: "/title", value: "Updated by the host, without refreshing the page." },
  })
}

function resetSurface() {
  renderer.receive({ version: "1.0", deleteSurface: { surfaceId: surfaceId() } })
  surfaceNumber += 1
  count = 0
  output.textContent = "No actions yet."
  createSurface()
}

ui.flex(
  ui.button("Update from host").on("click", updateFromHost),
  ui.button("Reset surface").on("click", resetSurface),
).wrap().gap(8).mount("#host-controls")

createSurface()
window.addEventListener("pagehide", event => {
  if (!event.persisted) renderer.dispose()
})
document.body.dataset.ready = "true"
