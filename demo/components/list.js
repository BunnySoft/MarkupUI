import { loadComponentApi } from "../component-api.js"

function initialize() {
  if (!globalThis.MarkupUIList) throw new Error("List runtime did not load.")
  void loadComponentApi(document.getElementById("list-api"), new URL("../api/list.json", import.meta.url)).catch(() => {})

  const workspace = document.getElementById("task-workspace")
  if (workspace) {
    const { createStore, bind } = globalThis.MarkupUIState
    const store = createStore({ tasks: [
      { id: "a", title: "Report", name: "Quarterly report", fieldId: "task-field-a", helpId: "task-help-a" },
      { id: "b", title: "Review", name: "Review release notes", fieldId: "task-field-b", helpId: "task-help-b" },
    ] })
    let binding = bind(workspace, store)
    let sequence = 2
    const announce = () => {
      document.getElementById("task-status").textContent = `${store.get("tasks").length} tasks`
    }
    globalThis.m.actions.register("task.remove", ({ store, arguments: args }) => {
      store.set("tasks", store.get("tasks").filter(task => task.id !== args.key))
      announce()
    })
    let stopActions = globalThis.m.actions.install(workspace, binding)
    workspace.addEventListener("m:error", event => {
      document.getElementById("task-status").textContent = event.detail instanceof Error
        ? event.detail.message : "Task action failed."
    })
    document.getElementById("task-add").addEventListener("click", () => {
      const id = String(++sequence)
      store.set("tasks", [...store.get("tasks"), {
        id, title: `Task ${id}`, name: "", fieldId: `task-field-${id}`, helpId: `task-help-${id}`,
      }])
      announce()
    })
    document.getElementById("task-reverse").addEventListener("click", () => {
      store.set("tasks", [...store.get("tasks")].reverse())
    })
    document.getElementById("task-remove").addEventListener("click", () => {
      store.set("tasks", store.get("tasks").slice(1))
      announce()
    })
    announce()
    window.addEventListener("pagehide", () => { stopActions(); binding() })
    window.addEventListener("pageshow", event => {
      if (event.persisted) {
        binding = bind(workspace, store)
        stopActions = globalThis.m.actions.install(workspace, binding)
      }
    })
  }

  const sourceWorkspace = document.getElementById("source-workspace")
  if (sourceWorkspace) {
    const { createStore, bind } = globalThis.MarkupUIState
    const store = createStore({ tasks: [{ id: "a", name: "Review release notes" }] })
    let binding = bind(sourceWorkspace, store)
    window.addEventListener("pagehide", () => binding())
    window.addEventListener("pageshow", event => { if (event.persisted) binding = bind(sourceWorkspace, store) })
  }

  const status = document.getElementById("action-status")
  const archiveBtn = document.getElementById("archive-alpha")
  if (archiveBtn && status) {
    archiveBtn.addEventListener("click", () => {
      status.textContent = "Archive Alpha requested; the application owns any list changes."
    })
  }

  const openBtn = document.getElementById("open-report")
  if (openBtn && status) {
    openBtn.addEventListener("click", () => {
      status.textContent = "Report preview requested."
    })
  }

  const form = document.getElementById("native-form")
  const formStatus = document.getElementById("form-status")
  if (form && formStatus) {
    form.addEventListener("submit", event => {
      event.preventDefault()
      const data = new FormData(form)
      formStatus.textContent = `Saved report: ${data.get("name")}`
    })
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
