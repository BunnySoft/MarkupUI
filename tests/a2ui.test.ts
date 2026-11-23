import { afterEach, describe, expect, it, vi } from "vitest"
import { A2UI_CATALOG_ID, createA2UIRenderer } from "../src/plugins/a2ui.js"
import { Button } from "../src/components/button/index.js"

afterEach(() => document.body.replaceChildren())

const label = { id: "label", component: "Text", text: { "@path": "/label" } }
const action = {
  id: "save", component: "Button", child: "label", variant: "primary",
  action: { event: { name: "save", context: { item: { "@path": "/item" } }, userMessage: { "@path": "/label" } } },
}
const root = { id: "root", component: "Column", children: ["save"] }
function setup(surfaceId = "main") {
  const onAction = vi.fn()
  const renderer = createA2UIRenderer(document.body, { onAction })
  renderer.receive({
    version: "1.0", createSurface: {
      surfaceId, catalogId: A2UI_CATALOG_ID,
      components: [root, action, label], dataModel: { label: "Save", item: { id: 1 } },
    },
  })
  return { renderer, onAction, host: renderer.getSurface(surfaceId)!, button: document.querySelector<Button>("m-button")! }
}
function data(surfaceId: string, value: unknown, path?: string) {
  return { version: "1.0", updateDataModel: { surfaceId, value, ...(path === undefined ? {} : { path }) } }
}
function definitions(surfaceId: string, components: unknown[]) {
  return { version: "1.0", updateComponents: { surfaceId, components } }
}

describe("standalone A2UI minimal renderer", () => {
  it("uses native MarkupUI controls, live bindings and v1.0 action envelopes", () => {
    const { renderer, onAction, host, button } = setup()
    const native = button.control!
    native.focus()
    renderer.receive(data("main", { label: "<img src=x>", item: { id: 2 } }))
    expect(button.control).toBe(native)
    expect(document.activeElement).toBe(native)
    expect(native.textContent).toBe("<img src=x>")
    expect(host.querySelector("img")).toBeNull()
    button.click()
    expect(onAction).toHaveBeenCalledOnce()
    const output = onAction.mock.calls[0]![0]
    expect(output).toMatchObject({
      version: "1.0",
      action: { name: "save", surfaceId: "main", sourceComponentId: "save", context: { item: { id: 2 } }, userMessage: "<img src=x>" },
    })
    expect(Number.isFinite(Date.parse(output.action.timestamp))).toBe(true)
    output.action.context.item.id = 99
    button.click()
    expect(onAction.mock.lastCall![0].action.context.item.id).toBe(2)
    renderer.dispose()
  })

  it("supports streamed forward references and rejects invalid candidates atomically", () => {
    const renderer = createA2UIRenderer(document.body, { onAction: vi.fn() })
    renderer.receive({ version: "1.0", createSurface: { surfaceId: "stream", components: [root] } })
    const host = renderer.getSurface("stream")!
    expect(host.childNodes).toHaveLength(0)
    expect(host.getAttribute("aria-busy")).toBe("true")
    renderer.receive(definitions("stream", [action, label]))
    renderer.receive(data("stream", { label: "Ready", item: 1 }))
    const native = host.querySelector("button")!
    expect(native.textContent).toBe("Ready")
    expect(host.getAttribute("aria-busy")).toBe("false")
    expect(() => renderer.receive(data("stream", 42, "/label"))).toThrow("text binding")
    expect(native.textContent).toBe("Ready")
    expect(() => renderer.receive(definitions("stream", [{ ...action, child: "root" }]))).toThrow("root cannot be a child")
    expect(host.querySelector("button")).toBe(native)
    expect(() => renderer.receive(definitions("stream", [{ ...root, children: ["save", "save"] }]))).toThrow("one parent")
    expect(() => renderer.receive(definitions("stream", [{ id: "orphan", component: "Column", children: ["orphan"] }]))).toThrow("cyclic")
    expect(() => renderer.receive(definitions("stream", [{ id: "label", component: "Column", children: [] }]))).toThrow("must be Text")
    renderer.dispose()
  })

  it("reconciles component updates without replacing focused native owners", () => {
    const { renderer, onAction, button, host } = setup()
    const native = button.control!
    native.focus()
    renderer.receive(definitions("main", [{ ...action, variant: "borderless" }, { id: "extra", component: "Text", text: "Extra" }, { ...root, children: ["extra", "save"] }]))
    expect(host.querySelector("button")).toBe(native)
    expect(document.activeElement).toBe(native)
    expect(button.appearance).toBe("text")
    renderer.receive(definitions("main", [{ ...root, children: ["pending", "save"] }]))
    button.click()
    expect(onAction).not.toHaveBeenCalled()
    renderer.receive(definitions("main", [{ id: "pending", component: "Text", text: "Loaded" }]))
    button.click()
    expect(onAction).toHaveBeenCalledOnce()
    renderer.receive(definitions("main", [{ ...root, children: ["pending"] }]))
    expect(host.contains(button)).toBe(false)
    document.body.append(button)
    button.click()
    expect(onAction).toHaveBeenCalledOnce()
    renderer.dispose()
  })

  it("isolates surfaces, snapshots input and handles pointers, deletion and arrays", () => {
    const { renderer, onAction, button } = setup()
    const host = renderer.getSurface("main")!
    host.remove()
    button.click()
    expect(onAction).not.toHaveBeenCalled()
    document.body.append(host)
    renderer.receive({ version: "1.0", createSurface: { surfaceId: "other", components: [{ id: "root", component: "Text", text: { "@path": "/a~1b/~0key/0" } }] } })
    renderer.receive(data("other", { "a/b": { "~key": ["Hello", "World"] } }))
    expect(renderer.getSurface("other")!.textContent).toBe("Hello")
    renderer.receive(data("other", null, "/a~1b/~0key/0"))
    expect(renderer.getSurface("other")!.textContent).toBe("World")
    expect(() => renderer.receive(data("other", "Sparse", "/a~1b/~0key/100"))).toThrow("array path")
    const input = { label: "Next", item: { id: 4 } }
    renderer.receive(data("main", input))
    input.item.id = 5
    button.click()
    expect(onAction.mock.lastCall![0].action.context.item.id).toBe(4)
    renderer.receive(data("other", null, "/"))
    expect(renderer.getSurface("other")!.textContent).toBe("")
    renderer.receive(data("other", { nullable: null, items: [null] }))
    expect(() => renderer.receive(data("other", "x", "/nullable/child"))).toThrow("crosses a scalar")
    expect(() => renderer.receive(data("other", "x", "/items/0/child"))).toThrow("crosses a scalar")
    renderer.receive(data("other", "Created", "/a~1b/~0key/0"))
    expect(renderer.getSurface("other")!.textContent).toBe("Created")
    expect(button.control!.textContent).toBe("Next")
    renderer.receive({ version: "1.0", deleteSurface: { surfaceId: "main" } })
    expect(renderer.getSurface("main")).toBeUndefined()
    document.body.append(button)
    button.click()
    expect(onAction).toHaveBeenCalledOnce()
    expect(() => renderer.receive({ version: "1.0", createSurface: { surfaceId: "main" } })).toThrow("cannot be reused")
    renderer.dispose()
    renderer.dispose()
    expect(() => renderer.receive(data("other", {}))).toThrow("disposed")
  })

  it("rejects unsupported protocol features, unsafe data and unbounded graphs before mutation", () => {
    const { renderer, host } = setup()
    const before = host.innerHTML
    for (const invalid of [
      { version: "0.8", updateComponents: { surfaceId: "main", components: [] } },
      { version: "1.0", createSurface: { surfaceId: "bad", catalogId: "basic" } },
      { version: "1.0", createSurface: { surfaceId: "bad", sendDataModel: true } },
      { version: "1.0", callRendererFunction: { surfaceId: "main" } },
      definitions("main", [{ ...label, text: { "@call": { name: "openUrl" } } }]),
      definitions("main", [{ ...label, text: { "@path": "/constructor/name" } }]),
      definitions("main", [{ ...label, text: { "@path": "/bad~2path" } }]),
      definitions("main", [{ ...root, children: { componentId: "label", path: "/items" } }]),
      definitions("main", [label, label]),
      definitions("main", [{ id: "x", component: "Input" }]),
      data("main", Infinity),
      data("main", { label: undefined }),
      data("main", JSON.parse('{"__proto__":{"polluted":true}}')),
      data("main", "x", "/__proto__/polluted"),
      data("main", "x".repeat(65_537)),
      definitions("main", Array.from({ length: 34 }, (_, index) => ({ id: `c${index}`, component: "Column", children: index ? [`c${index - 1}`] : [] }))),
    ]) expect(() => renderer.receive(invalid)).toThrow("A2UI:")
    const getter = vi.fn()
    expect(() => renderer.receive(Object.defineProperty({}, "version", { get: getter }))).toThrow("JSON data properties")
    expect(getter).not.toHaveBeenCalled()
    const sparse = new Array(2)
    sparse[0] = "one"
    Object.defineProperty(sparse, "4294967295", { enumerable: true, value: "not an array index" })
    expect(() => renderer.receive(data("main", sparse))).toThrow("JSON array indices")
    expect(host.innerHTML).toBe(before)
    renderer.dispose()
  })
})
