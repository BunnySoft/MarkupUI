import { afterEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createLog, MAX_LOG_LINES, MAX_LOG_CHARACTERS, MAX_LOG_LINE_LENGTH } from "../src/components/log/index.js"
import type { LogController, LogOptions } from "../src/components/log/index.js"

const helpers: LogController[] = []
const sample = (count = 10) => Array.from({ length: count }, (_, index) => `Line ${index}`).join("\n")
function fixture(options: LogOptions = {}, text = "one\ntwo\nthree") {
  const root = document.createElement("section")
  root.className = "mui-log"; root.dataset.log = ""
  root.innerHTML = '<label>Unrelated<input name="outside" value="native"></label><pre class="mui-code-block" data-log-viewport role="region" tabindex="0" aria-label="Local log"><code class="mui-code" data-log-output></code></pre><p data-log-loading hidden>Loading locally</p><button type="button">Outside action</button>'
  const pre = root.querySelector("pre")!, code = root.querySelector("code")!
  code.textContent = text
  document.body.append(root)
  let height = 60, width = 300, scroll = 0
  Object.defineProperties(pre, {
    clientHeight: { configurable: true, get: () => height },
    clientWidth: { configurable: true, get: () => width },
    scrollHeight: { configurable: true, get: () => Math.max(height, code.children.length * 20) },
    scrollTop: { configurable: true, get: () => scroll, set: (value: number) => { scroll = Math.max(0, Math.min(value, Math.max(0, pre.scrollHeight - height))) } },
  })
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    return this.classList.contains("mui-code-line") ? [...this.parentElement!.children].indexOf(this) * 20 : 0
  })
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) { return this.classList.contains("mui-code-line") ? 20 : 60 })
  const helper = createLog(root, options); helpers.push(helper)
  function resize(nextHeight: number, nextWidth = width) { height = nextHeight; width = nextWidth; helper.refresh() }
  function select(index: number, start = 0, end = 3) {
    const text = code.children[index]!.lastChild!
    const range = document.createRange(); range.setStart(text, start); range.setEnd(text, end)
    const selection = window.getSelection()!; selection.removeAllRanges(); selection.addRange(range)
    return { selection, range, text }
  }
  return { helper, root, pre, code, resize, select }
}
afterEach(() => { helpers.splice(0).forEach(helper => helper.disconnect()); window.getSelection()?.removeAllRanges(); document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe("literal Log records", () => {
  it("uses passive native pre/code, preserving original labels/actions and no form value", () => {
    const { helper, root, pre, code } = fixture()
    const button = root.querySelector("button")!, listener = vi.fn(); button.addEventListener("click", listener)
    helper.append("\nfour"); button.click()
    expect(listener).toHaveBeenCalledOnce(); expect(helper.viewport).toBe(pre); expect(helper.output).toBe(code)
    expect(pre.getAttribute("role")).toBe("region"); expect(pre.hasAttribute("aria-live")).toBe(false)
    expect(root.querySelector("input")!.value).toBe("native"); expect(code.querySelector("input,textarea")).toBeNull()
  })
  it("does not serialize or reset the log as a native form field", () => {
    const { helper, root } = fixture(), form = document.createElement("form")
    document.body.append(form); form.append(root)
    helper.append("\nretained"); root.querySelector("input")!.value = "edited"
    expect([...new FormData(form)]).toEqual([["outside", "edited"]])
    form.reset(); expect(root.querySelector("input")!.value).toBe("native"); expect(helper.text).toContain("retained")
  })
  it("treats HTML, ANSI-looking controls, URLs and unicode as literal data", () => {
    const text = '<img src=x onerror=alert(1)>\n\u001b[31mhttps://example.invalid/?a=1&b=2\n😀'
    const { helper, code } = fixture({ text })
    expect(helper.text).toBe(text); expect(code.textContent).toBe(text)
    expect(code.querySelector("img,a,script")).toBeNull()
  })
  it("normalizes complete CRLF and lone CR to LF, preserving blanks/trailing empty line", () => {
    const { helper, code } = fixture({ text: "\r\n a \r\n\rZ\r" })
    expect(helper.text).toBe("\n a \n\nZ\n")
    expect(helper.lines.map(line => line.text)).toEqual(["", " a ", "", "Z", ""])
    expect(code.children.length).toBe(5); expect(code.textContent).toBe(helper.text)
  })
  it("holds split CR until next chunk, merging split CRLF as one delimiter", () => {
    const { helper } = fixture({ text: "a" })
    helper.append("\r"); expect(helper.text).toBe("a"); expect(helper.state.pendingCR).toBe(true)
    helper.append("\nb"); expect(helper.text).toBe("a\nb"); expect(helper.state.pendingCR).toBe(false)
    helper.append("\rc"); expect(helper.text).toBe("a\nb\nc")
  })
  it("flush declares a final CR delimiter, while a later LF starts another blank line", () => {
    const { helper } = fixture({ text: "" })
    helper.append("a\r"); helper.flush(); expect(helper.text).toBe("a\n")
    helper.append("\n"); expect(helper.text).toBe("a\n\n"); expect(helper.state.lineCount).toBe(3)
  })
  it("defines empty text/empty array as one empty appendable line", () => {
    const { helper, code } = fixture({ text: "" })
    expect(helper.lines).toHaveLength(1); expect(helper.state.characters).toBe(0); expect(code.children).toHaveLength(1)
    helper.setLines([]); expect(helper.lines.map(line => line.text)).toEqual([""])
    helper.setLines(["a", ""]); expect(helper.text).toBe("a\n")
  })
  it("does not insert implicit delimiters between partial append chunks", () => {
    const { helper } = fixture({ text: "par" })
    helper.append("tial"); helper.append(" tail\nnext")
    expect(helper.text).toBe("partial tail\nnext")
  })
  it("rejects mixed sources and embedded line-array delimiters without replacing data", () => {
    expect(() => fixture({ text: "", lines: [] })).toThrow("not both")
    const { helper } = fixture(), before = helper.text
    for (const lines of [["a\nb"], ["a\rb"], [1], null]) expect(() => helper.setLines(lines as never)).toThrow()
    expect(helper.text).toBe(before)
  })
  it("trim is display-only per-line whitespace, not retention or raw-data destruction", () => {
    const { helper, code } = fixture({ text: "  a  \n \t\n b ", trim: true })
    expect(helper.text).toBe("  a  \n \t\n b "); expect(code.textContent).toBe("a\n\nb")
    helper.setTrim(false); expect(code.textContent).toBe(helper.text)
    helper.setTrim(true); helper.append("  "); expect(code.textContent).toBe("a\n\nb")
  })
  it("keeps decorative number markers empty and source selection free of digits", () => {
    const { helper, code } = fixture()
    for (const node of code.querySelectorAll(".mui-code-number")) { expect(node.textContent).toBe(""); expect(node.getAttribute("aria-hidden")).toBe("true") }
    const range = document.createRange(); range.selectNodeContents(code)
    expect(range.toString()).toBe(helper.text)
  })
})

describe("incremental identity and retention bounds", () => {
  it("retains line/Text nodes/listeners on append, including the current partial tail", () => {
    const { helper, code } = fixture(), nodes = [...code.children], text = nodes[2]!.lastChild!, listener = vi.fn()
    nodes[0]!.addEventListener("example", listener)
    const keys = helper.lines.map(line => line.key)
    helper.append(" continued\nfour")
    expect([...code.children].slice(0, 3)).toEqual(nodes); expect(code.children[2]!.lastChild).toBe(text)
    expect(helper.lines.slice(0, 3).map(line => line.key)).toEqual(keys)
    nodes[0]!.dispatchEvent(new Event("example")); expect(listener).toHaveBeenCalledOnce()
  })
  it("uses fresh monotonically increasing identities for explicit replace/clear generations", () => {
    const { helper } = fixture(), old = helper.lines.at(-1)!.key, generation = helper.state.generation
    helper.setText("replacement")
    expect(helper.lines[0]!.key).toBeGreaterThan(old); expect(helper.state.generation).toBe(generation + 1)
    const key = helper.lines[0]!.key; helper.clear()
    expect(helper.lines[0]!.key).toBeGreaterThan(key); expect(helper.state.characters).toBe(0); expect(helper.state.generation).toBe(generation + 2)
  })
  it("retains newest whole lines at maxLines, with the trailing empty line counting", () => {
    const { helper, code } = fixture({ maxLines: 3 })
    const second = code.children[1]!
    const update = helper.append("\n")
    expect(helper.text).toBe("two\nthree\n"); expect(update.droppedLines).toBe(1)
    expect(code.children[0]).toBe(second); expect(helper.state.lineCount).toBe(3)
  })
  it("applies character retention to raw text including LF, not trimmed display", () => {
    const { helper } = fixture({ maxCharacters: 8, trim: true, text: " a \n b \nc" })
    expect(helper.text).toBe(" b \nc"); expect(helper.state.characters).toBe(5); expect(helper.state.totalDroppedLines).toBe(1)
  })
  it("rejects a too-long new or concatenated line before trimming/mutating current data", () => {
    const { helper, code } = fixture({ text: "abc\npartial", maxLineLength: 8 }), nodes = [...code.children]
    expect(() => helper.append(" extension\nshort")).toThrow("maxLineLength")
    expect(helper.text).toBe("abc\npartial"); expect([...code.children]).toEqual(nodes)
    expect(() => helper.setText("x".repeat(9))).toThrow()
  })
  it("supports exact maximum line length, rejecting the next code unit", () => {
    const { helper } = fixture({ text: "x".repeat(MAX_LOG_LINE_LENGTH) })
    expect(helper.state.characters).toBe(MAX_LOG_LINE_LENGTH)
    expect(() => helper.append("x")).toThrow("maxLineLength")
  })
  it("rejects per-call line and character excess before allocating native line spans", () => {
    const { helper, code } = fixture(), before = [...code.children]
    expect(() => helper.setText("\n".repeat(MAX_LOG_LINES))).toThrow("10000")
    expect(() => helper.append("x".repeat(MAX_LOG_CHARACTERS + 1))).toThrow("1000000")
    expect([...code.children]).toEqual(before)
  })
  it.each([{ maxLines: 0 }, { maxLines: 10001 }, { maxCharacters: 1000001 }, { maxLineLength: 16385 }, { maxCharacters: 2, maxLineLength: 3 }, { follow: null }, { trim: "true" }, { nearBottom: -1 }, { loading: 1 }, { virtual: true }])("rejects invalid configuration %j", options => {
    expect(() => fixture(options as never)).toThrow()
  })
  it("manual head trimming keeps surviving nodes/keys and never silently trims the whole tail", () => {
    const { helper, code } = fixture(), last = code.children[2]!
    helper.trimStart(2); expect(helper.text).toBe("three"); expect(code.firstElementChild).toBe(last)
    expect(helper.state.droppedLines).toBe(2); expect(() => helper.trimStart(1)).toThrow("clear")
    helper.clear(); expect(helper.state.totalDroppedLines).toBe(0)
  })
  it("exposes frozen retained-line snapshots, not a mutable global log store", () => {
    const { helper } = fixture(), before = helper.lines
    expect(Object.isFrozen(before)).toBe(true); expect(Object.isFrozen(before[0])).toBe(true)
    helper.append("more"); expect(before.at(-1)!.text).toBe("three")
  })
})

describe("selection and scroll context", () => {
  it("preserves native selection in earlier unchanged records during append", () => {
    const { helper, select, code } = fixture(), selected = select(0, 0, 3), node = code.firstElementChild
    helper.append("\nfour")
    expect(selected.selection.toString()).toBe("one"); expect(code.firstElementChild).toBe(node)
    expect(selected.range.startContainer).toBe(selected.text)
  })
  it("rejects changing a selected tail or deleting selected records atomically", () => {
    const { helper, select } = fixture({ maxLines: 3 }), current = helper.text
    select(2)
    expect(() => helper.append("more")).toThrow("selected")
    expect(() => helper.setText("new")).toThrow("selected"); expect(() => helper.clear()).toThrow("selected")
    expect(helper.text).toBe(current)
    window.getSelection()!.removeAllRanges(); select(0)
    expect(() => helper.append("\nfour")).toThrow("selected"); expect(helper.text).toBe(current)
  })
  it("retains pending CR on a rejected selected-tail append for explicit retry", () => {
    const { helper, select } = fixture()
    helper.append("\r"); select(2)
    expect(() => helper.append("\nfour")).toThrow("selected"); expect(helper.state.pendingCR).toBe(true)
    window.getSelection()!.removeAllRanges(); helper.append("\nfour")
    expect(helper.text).toBe("one\ntwo\nthree\nfour")
  })
  it("allows retention before a surviving selected line without losing its text/range", () => {
    const { helper, select, code } = fixture({ maxLines: 3 }), selected = select(1), node = code.children[1]!
    helper.append("\nfour")
    expect(selected.selection.toString()).toBe("two"); expect(code.firstElementChild).toBe(node)
  })
  it("does not change selected text when toggling display trim", () => {
    const { helper, select, code } = fixture({ text: "  a  \nb" })
    select(0, 2, 3); expect(() => helper.setTrim(true)).toThrow("selected")
    expect(code.textContent).toBe("  a  \nb"); expect(helper.state.trim).toBe(false)
  })
  it("follows only when enabled and previously near the tail", () => {
    const { helper, pre } = fixture({ text: sample(), follow: true })
    expect(pre.scrollTop).toBe(0)
    helper.append("\naway"); expect(pre.scrollTop).toBe(0)
    helper.scrollTo({ position: "bottom", silent: true }); const old = pre.scrollTop
    helper.append("\nnew"); expect(pre.scrollTop).toBe(old + 20)
    pre.scrollTop = 20; pre.dispatchEvent(new Event("scroll")); helper.append("\nreading")
    expect(pre.scrollTop).toBe(20)
  })
  it("turning follow on does not jump, and disabled follow never moves to appended tail", () => {
    const { helper, pre } = fixture({ text: sample() })
    helper.setFollow(true); expect(pre.scrollTop).toBe(0)
    helper.scrollTo({ position: "bottom" }); helper.setFollow(false); const top = pre.scrollTop
    helper.append("\nnew"); expect(pre.scrollTop).toBe(top)
  })
  it("suppresses automatic follow while any native text selection is active", () => {
    const { helper, pre, select } = fixture({ text: sample(), follow: true })
    helper.scrollTo({ position: "bottom", silent: true }); const top = pre.scrollTop
    select(2); helper.append("\nnew")
    expect(pre.scrollTop).toBe(top); expect(window.getSelection()!.toString()).toBe("Lin")
  })
  it("preserves surviving top record/pixel offset when head retention trims", () => {
    const { helper, pre, code } = fixture({ text: sample(), maxLines: 10 })
    pre.scrollTop = 65; pre.dispatchEvent(new Event("scroll")); const anchor = code.children[3]!
    helper.append("\nnew")
    expect(pre.scrollTop).toBe(45); expect(code.children[2]).toBe(anchor)
  })
  it("clamps to the first retained record and reports when the reading anchor was evicted", () => {
    const { helper, pre } = fixture({ text: sample(), maxLines: 10 })
    const result = helper.append("\nnew")
    expect(result.anchorRemoved).toBe(true); expect(pre.scrollTop).toBe(0)
  })
  it("preserves bottom through resize only if the previous position was near it", () => {
    const { helper, pre, resize } = fixture({ text: sample(), follow: true })
    helper.scrollTo({ position: "bottom", silent: true }); resize(40)
    expect(pre.scrollTop).toBe(160)
    pre.scrollTop = 20; pre.dispatchEvent(new Event("scroll")); resize(80)
    expect(pre.scrollTop).toBe(20)
  })
  it("does not move focus or horizontal scroll on data changes or scrollTo", () => {
    const { helper, root, pre } = fixture({ text: sample(), follow: true })
    const input = root.querySelector("input")!; input.focus(); pre.scrollLeft = 20
    helper.scrollTo({ position: "bottom" }); helper.append("\nnew"); helper.clear()
    expect(document.activeElement).toBe(input); expect(pre.scrollLeft).toBe(20)
  })
})

describe("edge notifications and lifecycle", () => {
  it("reports edge transitions only, without wheel interception or repeated scroll spam", () => {
    const { root, pre } = fixture({ text: sample() }), edges: string[] = []
    root.addEventListener("mui:log-edge", event => edges.push((event as CustomEvent).detail.position))
    pre.scrollTop = 40; pre.dispatchEvent(new Event("scroll"))
    pre.scrollTop = 140; pre.dispatchEvent(new Event("scroll")); pre.dispatchEvent(new Event("scroll"))
    pre.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }))
    pre.scrollTop = 0; pre.dispatchEvent(new Event("scroll"))
    expect(edges).toEqual(["bottom", "top"])
  })
  it("supports silent helper scrolling and suppresses follow-generated edge events", () => {
    const { helper, pre, root } = fixture({ text: sample(), follow: true }), listener = vi.fn()
    root.addEventListener("mui:log-edge", listener)
    helper.scrollTo({ position: "bottom", silent: true }); pre.dispatchEvent(new Event("scroll"))
    helper.append("\nnew"); pre.dispatchEvent(new Event("scroll"))
    expect(listener).not.toHaveBeenCalled()
    helper.scrollTo({ top: 0 }); pre.dispatchEvent(new Event("scroll"))
    expect(listener).toHaveBeenCalledOnce()
  })
  it("does not suppress a different native scroll position behind a pending silent target", () => {
    const { helper, pre, root } = fixture({ text: sample() }), listener = vi.fn()
    root.addEventListener("mui:log-edge", listener)
    helper.scrollTo({ position: "bottom", silent: true }); pre.scrollTop = 0; pre.dispatchEvent(new Event("scroll"))
    expect(listener).toHaveBeenCalledOnce()
  })
  it.each(["append", "clear", "disconnect"] as const)("interrupts stale edge notifications when a listener calls %s", action => {
    const { helper, pre, root } = fixture({ text: sample() }), positions: string[] = []
    pre.scrollTop = 40; pre.dispatchEvent(new Event("scroll"))
    Object.defineProperty(pre, "clientHeight", { configurable: true, get: () => 300 })
    Object.defineProperty(pre, "scrollHeight", { configurable: true, get: () => 300 })
    root.addEventListener("mui:log-edge", event => {
      positions.push((event as CustomEvent).detail.position)
      if (action === "append") helper.append("\nupdated")
      else helper[action]()
    })
    pre.scrollTop = 0; pre.dispatchEvent(new Event("scroll"))
    expect(positions).toEqual(["top"])
  })
  it("rejects ambiguous/non-finite scroll input without moving", () => {
    const { helper, pre } = fixture({ text: sample() })
    for (const value of [{}, { top: NaN }, { top: 1, position: "top" }, { position: "middle" }, { top: 3, silent: "yes" }, { top: 3, behavior: "smooth" }]) expect(() => helper.scrollTo(value as never)).toThrow()
    expect(pre.scrollTop).toBe(0); helper.scrollTo({ top: -5 }); expect(pre.scrollTop).toBe(0)
  })
  it("loading only changes owned busy/status attributes, not contents or focus", () => {
    const { helper, pre, code, root } = fixture(), nodes = [...code.children]
    helper.setLoading(true); expect(pre.getAttribute("aria-busy")).toBe("true")
    expect(root.querySelector<HTMLElement>("[data-log-loading]")!.hidden).toBe(false)
    helper.setLoading(false); expect(pre.hasAttribute("aria-busy")).toBe(false); expect([...code.children]).toEqual(nodes)
  })
  it("rejects foreign markup/ownership and preserves external mutations on failure/disconnect", () => {
    const { helper, root, code, pre } = fixture()
    expect(() => createLog(root)).toThrow("unowned")
    code.firstElementChild!.append(document.createElement("b"))
    expect(() => helper.append("data")).toThrow("owned log line")
    pre.setAttribute("aria-busy", "true"); helper.disconnect()
    expect(code.querySelector("b")).not.toBeNull(); expect(pre.getAttribute("aria-busy")).toBe("true")
  })
  it("rejects live-log roles or an active initial selection without changing fallback text", () => {
    const { helper, root, pre, code } = fixture()
    helper.disconnect(); code.textContent = "literal fallback"
    pre.setAttribute("role", "log"); expect(() => createLog(root)).toThrow("passive")
    pre.setAttribute("role", "region"); pre.setAttribute("aria-live", "polite"); expect(() => createLog(root)).toThrow("passive")
    pre.removeAttribute("aria-live")
    const range = document.createRange(); range.selectNodeContents(code); window.getSelection()!.addRange(range)
    expect(() => createLog(root)).toThrow("selection"); expect(code.textContent).toBe("literal fallback")
  })
  it("does not destroy author-replaced loading content on a rejected update", () => {
    const { helper, root } = fixture(), status = root.querySelector("[data-log-loading]")!
    status.innerHTML = "<strong>Application content</strong>"
    expect(() => helper.setLoading(true)).toThrow("passive")
    expect(status.querySelector("strong")!.textContent).toBe("Application content")
  })
  it("rejects interactive changes to generated passive rows/empty number markers", () => {
    const { helper, code } = fixture(), first = code.firstElementChild!
    first.setAttribute("tabindex", "0"); expect(() => helper.append("data")).toThrow("owned log line")
    first.removeAttribute("tabindex"); const input = document.createElement("input")
    first.firstElementChild!.append(input); expect(() => helper.append("data")).toThrow("owned log line")
    helper.disconnect(); expect(first.firstElementChild!.firstElementChild).toBe(input)
  })
  it("disconnect keeps current native nodes/text/selection and blocks further updates", () => {
    const { helper, code, select } = fixture(), before = [...code.children], selection = select(0).selection
    helper.disconnect()
    expect([...code.children]).toEqual(before); expect(selection.toString()).toBe("one")
    expect(helper.text).toBe("one\ntwo\nthree"); expect(() => helper.append("later")).toThrow("disconnected")
  })
  it("can establish a new owner after an explicit plain-text handoff, not automatic rich-node adoption", () => {
    const { helper, root, code } = fixture({ trim: true, text: " a \n b " }), raw = helper.text
    helper.disconnect(); expect(() => createLog(root)).toThrow("literal text")
    code.textContent = raw
    const next = createLog(root); helpers.push(next)
    expect(next.text).toBe(raw); expect(code.textContent).toBe(raw)
  })
  it("keeps nested/separate owners isolated", () => {
    const first = fixture(), second = fixture()
    first.root.append(second.root); second.helper.append("\nsecond")
    first.helper.append("\nfirst"); expect(first.helper.text).not.toContain("second")
    second.helper.disconnect(); expect(first.helper.connected).toBe(true)
  })
  it("cancels ResizeObserver work on disconnect and reports invalid observed anatomy", () => {
    let callback: ResizeObserverCallback | undefined
    const disconnect = vi.fn()
    vi.stubGlobal("ResizeObserver", class {
      constructor(value: ResizeObserverCallback) { callback = value }
      observe() {}
      disconnect = disconnect
    })
    const { helper, root, code } = fixture(), errors = vi.fn()
    root.addEventListener("mui:log-error", errors)
    code.append(document.createTextNode("foreign")); callback!([], {} as ResizeObserver)
    expect(errors).toHaveBeenCalledOnce(); expect(helper.error).toBeInstanceOf(Error)
    helper.disconnect(); expect(disconnect).toHaveBeenCalledOnce()
    callback!([], {} as ResizeObserver); expect(errors).toHaveBeenCalledOnce()
  })
  it("keeps optional styles/build isolated, reusing native Code without a Virtual List engine", () => {
    const css = readFileSync(resolve("src", "components", "log", "log.css"), "utf8")
    const source = readFileSync(resolve("src", "components", "log", "log.ts"), "utf8")
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf8"))
    expect(pkg.exports["./log/style.css"]).toBe("./dist/markup-ui-log.css"); expect(pkg.dependencies).toEqual({})
    expect(css).toContain("overflow-anchor: none"); expect(css).toContain("--mui-log-rows")
    expect(source).not.toContain("requestAnimationFrame"); expect(source).not.toContain("setInterval"); expect(source).not.toContain("innerHTML")
    expect(source).not.toContain("virtual-list")
  })
})
