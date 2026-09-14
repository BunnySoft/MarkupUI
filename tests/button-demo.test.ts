import { readFileSync } from "node:fs"
import { afterEach, expect, it, vi } from "vitest"
import type { Button } from "../src/components/button/index.js"

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute("data-m-theme")
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it("preserves parity-demo listeners through m-button upgrade", async () => {
  const html = readFileSync("demo/components/button.html", "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.innerHTML = parsed.body.innerHTML
  const action = document.querySelector<HTMLElement>("#event-button")!
  expect(customElements.get("m-button")).toBeUndefined()
  const authoredListener = vi.fn()
  action.addEventListener("click", authoredListener)
  action.click()
  expect(authoredListener).toHaveBeenCalledOnce()

  const api = await import("../src/components/button/index.js")
  vi.stubGlobal("MarkupUIButton", api)
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => JSON.parse(readFileSync("demo/api/button.json", "utf8")),
  })))
  await import("../demo/components/button.js")
  if (document.readyState === "loading") document.dispatchEvent(new Event("DOMContentLoaded"))
  const upgraded = action as Button
  expect(upgraded.control).not.toBeNull()
  upgraded.control!.click()
  expect(document.querySelector("#event-message")?.textContent).toBe("Button Clicked")
  expect(authoredListener).toHaveBeenCalledTimes(2)
  await vi.waitFor(() => expect([...document.querySelectorAll("[data-api-type]")].map(node => node.getAttribute("data-api-type")))
    .toEqual(["Button", "ButtonGroup"]))
  expect(document.querySelector("#button-api")?.textContent).toContain("appearance")
  const form = document.querySelector<HTMLFormElement>("#button-form")!
  ;(form.querySelector("m-button") as Button).click()
  expect(document.querySelector("#form-message")?.textContent).toBe("Submitted Draft (save)")
  form.reset()
  expect(document.querySelector("#form-message")?.textContent).toBe("Form reset")
  vi.useFakeTimers()
  const loading = document.querySelector<Button>("[data-loading-button]")!
  const control = loading.control
  const icon = loading.querySelector("[data-part=icon]")
  loading.click()
  expect(loading.loading).toBe(true)
  vi.advanceTimersByTime(2000)
  expect(loading.loading).toBe(false)
  expect(loading.control).toBe(control)
  expect(loading.querySelector("[data-part=icon]")).toBe(icon)
})
