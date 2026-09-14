import { loadComponentApi } from "../component-api.js"

function initialize() {
  const api = globalThis.MarkupUIDrawer
  if (!api) throw new Error("Drawer runtime did not load.")
  void loadComponentApi(document.getElementById("drawer-api"), new URL("../api/drawer.json", import.meta.url))

  // Basic drawer
  const basicDrawer = document.querySelector("#basic-drawer")
  document.querySelector("#open-basic")?.addEventListener("click", () => {
    basicDrawer?.show()
  })

  // Placements
  const drawerTop = document.querySelector("#drawer-top")
  const drawerRight = document.querySelector("#drawer-right")
  const drawerBottom = document.querySelector("#drawer-bottom")
  const drawerLeft = document.querySelector("#drawer-left")

  document.querySelector("#open-top")?.addEventListener("click", () => drawerTop?.show())
  document.querySelector("#open-right")?.addEventListener("click", () => drawerRight?.show())
  document.querySelector("#open-bottom")?.addEventListener("click", () => drawerBottom?.show())
  document.querySelector("#open-left")?.addEventListener("click", () => drawerLeft?.show())

  // Custom size
  const customDrawer = document.querySelector("#custom-size-drawer")
  document.querySelector("#open-custom-size")?.addEventListener("click", () => customDrawer?.show())

  // Form drawer
  const formDrawer = document.querySelector("#form-drawer")
  document.querySelector("#open-form-drawer")?.addEventListener("click", () => formDrawer?.show())
  document.querySelector("#close")?.addEventListener("click", () => formDrawer?.close("closed"))
  document.querySelector("#save")?.addEventListener("click", (event) => {
    const form = document.querySelector("#native-form")
    if (form && form.checkValidity()) {
      formDrawer?.close("saved")
    }
  })
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true })
else initialize()
