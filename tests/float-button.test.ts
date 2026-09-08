import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const css = readFileSync(resolve("src", "components", "float-button", "float-button.css"), "utf8")
const demo = readFileSync(resolve("demo", "components", "float-button.html"), "utf8")
const appCss = readFileSync(resolve("demo", "components", "float-button.css"), "utf8")
const app = readFileSync(resolve("demo", "components", "float-button.js"), "utf8")
const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
let style: HTMLStyleElement | undefined

function fixture(): void {
  document.body.innerHTML = demo.slice(demo.indexOf("<body>") + 6, demo.indexOf("</body>"))
}
function install(): void {
  style = document.createElement("style")
  style.textContent = css
  document.head.append(style)
}
afterEach(() => {
  style?.remove()
  style = undefined
  document.body.replaceChildren()
})

describe("native FloatButton and FloatButtonGroup", () => {
  it("ships only CSS with no component/controller or peer dependency", () => {
    expect(pkg.exports["./float-button/style.css"]).toBe("./dist/markup-ui-float-button.css")
    expect(pkg.exports["./float-button"]).toBeUndefined()
    expect(readdirSync(resolve("src", "components", "float-button"))).toEqual(["float-button.css"])
    expect(pkg.dependencies).toEqual({})
    expect(customElements.get("mui-float-button")).toBeUndefined()
    expect(css).not.toContain("@import")
    expect(demo).not.toContain("markup-ui-button")
    expect(demo).not.toContain("markup-ui-tooltip")
  })

  it("keeps action roots native and explicitly names icon-only controls", () => {
    fixture()
    install()
    expect(document.querySelector("#single-action")!.tagName).toBe("BUTTON")
    expect(document.querySelector("#home-action")!.tagName).toBe("A")
    expect(document.querySelector("#single-action")!.getAttribute("aria-label")).toBe("Record an action")
    expect(document.querySelector("#quick-trigger")!.getAttribute("aria-label")).toBe("Quick actions")
    expect(document.querySelector("#badge-action")!.getAttribute("aria-label")).toBe("Notifications, 3 unread")
    for (const action of document.querySelectorAll(".mui-float-button")) {
      if (action.tagName === "TEMPLATE") continue
      expect(["BUTTON", "A"]).toContain(action.tagName)
      expect(action.querySelector("button, a, input, select")).toBeNull()
    }
    expect(document.querySelectorAll('[role="menu"], [role="menuitem"], .mui-float-group[role="button"]')).toHaveLength(0)
  })

  it("preserves source nodes/listeners/ARIA while presentation attributes change", () => {
    fixture()
    const action = document.querySelector<HTMLButtonElement>("#single-action")!
    const nodes = [...action.childNodes]
    const before = action.innerHTML
    let clicks = 0
    action.addEventListener("click", () => clicks++)
    install()
    action.dataset.shape = "square"
    action.dataset.type = "primary"
    action.remove()
    document.body.append(action)
    action.click()
    expect(clicks).toBe(1)
    expect(action.innerHTML).toBe(before)
    expect([...action.childNodes]).toEqual(nodes)
    expect(action.getAttribute("aria-label")).toBe("Record an action")
  })

  it("supports actual relative/absolute/fixed CSS modes with explicit logical offsets", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#single-action")!).position).toBe("relative")
    expect(getComputedStyle(document.querySelector("#absolute-group")!).position).toBe("absolute")
    expect(getComputedStyle(document.querySelector("#quick-trigger")!).position).toBe("fixed")
    expect(css).toContain("min-block-size: var(--mui-float-height, 2.5rem)")
    expect(css).toContain("inline-size: var(--mui-float-width, 2.5rem)")
    expect(css).toContain("inset-inline-end")
    expect(css).not.toContain("anchor(")
  })

  it("keeps group shape/flow authoritative without provider injection or reordering", () => {
    fixture()
    install()
    const group = document.querySelector("#form-group")!
    expect(group.getAttribute("role")).toBe("group")
    expect(group.getAttribute("aria-label")).toBe("Project form actions")
    expect([...group.querySelectorAll(":scope > button")].map(e => e.id)).toEqual(["native-submit", "native-reset", "native-disabled", "hidden-group-action"])
    expect(getComputedStyle(document.querySelector("#native-submit")!).position).toBe("relative")
    expect(css).not.toContain("row-reverse")
    expect(css).not.toMatch(/(?:^|[;{])\s*order\s*:/m)
  })

  it("uses native popover commands and ordinary action groups instead of an ARIA menu runtime", () => {
    fixture()
    install()
    expect(document.querySelector("#quick-trigger")!.getAttribute("popovertarget")).toBe("quick-panel")
    expect(document.querySelector("#quick-panel")!.getAttribute("popover")).toBe("auto")
    expect(document.querySelector("#record-action")!.getAttribute("popovertargetaction")).toBe("hide")
    expect(document.querySelector("#close-panel")!.getAttribute("popovertargetaction")).toBe("hide")
    expect(document.querySelector("#quick-trigger")!.hasAttribute("aria-expanded")).toBe(false)
    expect(app).toContain('panel.addEventListener("toggle"')
    expect(app).not.toContain('addEventListener("keydown"')
    expect(app).not.toContain("mui:change")
  })

  it("has a guarded static fallback without unconditional closed-popover display overrides", () => {
    expect(css).toContain("@supports selector(:popover-open)")
    expect(css).toMatch(/button\.mui-float-trigger,\s*button\.mui-float-popover-command \{ display: none; \}/)
    expect(css).not.toMatch(/\.mui-float-panel\[popover\]\s*\{[^}]*display:\s*(?:block|flex|grid)/s)
    expect(app).toContain('"showPopover" in HTMLElement.prototype')
    expect(app).not.toContain("showPopover(")
    expect(app).not.toContain("togglePopover(")
  })

  it("preserves native form defaults, validity, reset and disabled semantics", () => {
    fixture()
    install()
    const form = document.querySelector<HTMLFormElement>("#native-form")!
    const input = document.querySelector<HTMLInputElement>("#native-name")!
    const submit = document.querySelector<HTMLButtonElement>("#native-submit")!
    let submits = 0
    let disabledClicks = 0
    form.addEventListener("submit", event => { event.preventDefault(); submits++ })
    document.querySelector("#native-disabled")!.addEventListener("click", () => disabledClicks++)
    expect(submit.type).toBe("submit")
    expect(submit.getAttribute("data-type")).toBe("primary")
    input.value = ""
    submit.click()
    expect(submits).toBe(0)
    input.value = "Updated"
    submit.click()
    expect(submits).toBe(1)
    expect([...new FormData(form).entries()]).toEqual([["project", "Updated"]])
    document.querySelector<HTMLButtonElement>("#native-reset")!.click()
    document.querySelector<HTMLButtonElement>("#native-disabled")!.click()
    expect(input.value).toBe("Original")
    expect(disabledClicks).toBe(0)
  })

  it("keeps badge/help/description as author markup, without generated tooltip assets", () => {
    fixture()
    install()
    expect(document.querySelector("#badge-action .demo-badge")!.getAttribute("aria-hidden")).toBe("true")
    expect(document.querySelector("#badge-action")!.getAttribute("aria-describedby")).toBe("badge-help")
    expect(document.querySelector("#home-action .mui-float-description")!.textContent).toBe("Home")
    expect(document.querySelector("#single-action svg")!.namespaceURI).toBe("http://www.w3.org/2000/svg")
    expect(document.querySelector("#single-action svg")!.getAttribute("focusable")).toBe("false")
    expect(css).not.toContain("badge")
    expect(css).not.toContain("tooltip")
  })

  it("preserves hidden buttons/templates and ignores templates for grouped separators", () => {
    fixture()
    install()
    expect(getComputedStyle(document.querySelector("#hidden-float")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#hidden-group-action")!).display).toBe("none")
    expect(getComputedStyle(document.querySelector("#native-template")!).display).toBe("none")
    expect(document.querySelector<HTMLTemplateElement>("#native-template")!.content.textContent).toBe("Inert authored template")
    expect(css).toContain(':where(button, a[href]).mui-float-button:not([hidden]) ~')
  })

  it("documents geometry through author safe-area/gutter CSS rather than measurements", () => {
    expect(appCss).toContain("safe-area-inset-right")
    expect(appCss).toContain("safe-area-inset-left")
    expect(appCss).toContain("padding-inline: 1rem 6rem")
    expect(appCss).toContain("position: relative")
    expect(css).toContain("var(--mui-float-trigger-size, 2.5rem)")
    expect(css).toContain("var(--mui-float-opposite-clearance, 1rem)")
    expect(css).toContain("safe-area-inset-top")
    expect(app).not.toContain("getBoundingClientRect")
    expect(app).not.toContain("ResizeObserver")
  })

  it("provides print and forced-color treatment with no animation or global overlay state", () => {
    expect(css).toContain("@media print")
    expect(css).toContain("position: static !important")
    expect(css).toContain("@media (forced-colors: active)")
    expect(css).toContain("color: GrayText")
    expect(css).not.toContain("transition:")
    expect(css).not.toContain("animation:")
    expect(app).not.toContain("setTimeout")
    expect(app).not.toContain("history.")
  })
})
