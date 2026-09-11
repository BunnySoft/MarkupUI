import { readFileSync } from "node:fs"
import { afterEach, expect, it } from "vitest"
import type { MButton } from "../src/components/button/index.js"

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute("data-m-theme")
})

it("preserves parity-demo listeners through m-button upgrade", async () => {
  const html = readFileSync("demo/components/button.html", "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.innerHTML = parsed.body.innerHTML
  const action = document.querySelector<HTMLElement>("#event-button")!
  expect(customElements.get("m-button")).toBeUndefined()

  await import("../demo/components/button.js")
  action.click()
  expect(document.querySelector("#event-message")?.textContent).toBe("Button Clicked")

  await import("../src/components/button/index.js")
  const upgraded = action as MButton
  expect(upgraded.control).not.toBeNull()
  upgraded.control!.click()
  expect(document.querySelector("#event-message")?.textContent).toBe("Button Clicked")
  const loading = document.querySelector<MButton>("[data-loading-button]")!
  loading.click()
  expect(loading.loading).toBe(true)
})
