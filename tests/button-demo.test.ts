import { readFileSync } from "node:fs"
import { afterEach, expect, it } from "vitest"
import type { MuiButton } from "../src/components/button/button.js"

afterEach(() => {
  document.body.replaceChildren()
  document.documentElement.removeAttribute("data-mui-theme")
})

it("binds the authored control before enhancement and preserves demo listeners through upgrade", async () => {
  const html = readFileSync("demo/components/button.html", "utf8")
  const parsed = new DOMParser().parseFromString(html, "text/html")
  document.body.innerHTML = parsed.body.innerHTML
  const action = document.querySelector<MuiButton>("#count-action")!
  const control = action.querySelector<HTMLButtonElement>(":scope > button")!
  expect(customElements.get("mui-button")).toBeUndefined()
  expect(action.control).toBeUndefined()

  await import("../demo/components/button.js")
  control.click()
  expect(document.querySelector("#click-status")?.textContent).toBe("1 activations.")
  document.querySelector<HTMLButtonElement>("#toggle-loading")!.click()
  expect(action.loading).toBe(true)

  await import("../src/components/button/index.js")
  expect(action.control).toBe(control)
  expect(control.disabled).toBe(true)
  document.querySelector<HTMLButtonElement>("#toggle-loading")!.click()
  expect(control.disabled).toBe(false)
  control.click()
  expect(document.querySelector("#click-status")?.textContent).toBe("2 activations.")

  const theme = document.querySelector<HTMLSelectElement>("#button-theme")!
  theme.value = "dark"
  theme.dispatchEvent(new Event("change"))
  expect(document.documentElement.dataset.muiTheme).toBe("dark")
})
