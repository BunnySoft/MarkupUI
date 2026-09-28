import { afterEach, describe, expect, it, vi } from "vitest"
import { Tree, TreeNode } from "../src/components/tree/index.js"
import type { TreeLoadResult } from "../src/components/tree/index.js"

const wait = () => new Promise(resolve => setTimeout(resolve, 20))
function fixture(attributes = "selectable checkable", nodes = '<m-tree-node value="a" title="A" expanded><m-tree-node value="b" title="B"></m-tree-node></m-tree-node><m-tree-node value="c" title="C"></m-tree-node>') {
  const form = document.createElement("form")
  form.innerHTML = `<m-tree ${attributes}>${nodes}</m-tree>`
  document.body.append(form)
  const tree = form.querySelector<Tree>("m-tree")!
  return { form, tree, host: (key: string) => [...tree.querySelectorAll<TreeNode>(`m-tree-node[value="${key}"]`)].find(node => node.closest("m-tree") === tree)!,
    node: (key: string) => tree.nodes.find(node => node.key === key)! }
}
afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks() })

describe("portable Tree lifecycle and controller integration", () => {
  it("retains native controls and pending work across scalar writes", async () => {
    const { tree, host, node } = fixture("selectable checkable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    let resolve!: (result: TreeLoadResult) => void, signal!: AbortSignal
    tree.load = (_, context) => { signal = context.signal; return new Promise(done => { resolve = done }) }
    const pending = tree.expand("a")
    const label = node("a").label
    tree.multiple = true; tree.blockLine = true; tree.cancelable = false; host("a").title = "Renamed"
    tree.selectedKeys = ["a"]
    await wait()
    expect(signal.aborted).toBe(false)
    expect(tree.loadingKeys).toEqual(["a"])
    expect(node("a").label).toBe(label)
    resolve({ nodes: [{ value: "child", title: "Child", name: "files", checked: true }] })
    expect(await pending).toBe(true)
    expect(tree.nodes.map(node => node.key)).toEqual(["a", "child"])
    tree.disabled = true
    expect(node("child").checkbox?.disabled).toBe(true)
    tree.disabled = false; tree.selectable = false; tree.checkable = false
    expect(node("child").label.localName).toBe("span")
    expect(node("child").checkbox).toBeNull()
  })

  it("keeps authored identity and phrasing through updates, additions, removal and reconnect", async () => {
    const { tree, host, node } = fixture("selectable", '<m-tree-node value="a"><m-span id="authored">Original</m-span></m-tree-node>')
    const original = tree.querySelector("#authored")!, clicked = vi.fn()
    original.addEventListener("click", clicked)
    const a = host("a"), label = node("a").label
    const child = new TreeNode(); child.value = "b"; child.title = "B"
    a.append(child)
    await wait()
    expect(tree.connected).toBe(true)
    expect(node("b").parent?.key).toBe("a")
    expect(node("a").label).toBe(label)
    expect(tree.querySelector("#authored")).toBe(original)
    tree.blockLine = true
    original.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    await wait()
    expect(clicked).toHaveBeenCalledOnce()
    expect(tree.selectedKeys).toEqual(["a"])
    child.remove()
    await wait()
    expect(tree.connected).toBe(true)
    expect(tree.nodes.map(node => node.key)).toEqual(["a"])
    tree.remove(); document.body.append(tree)
    expect(tree.nodes[0]?.label).toBe(label)
    expect(tree.selectedKeys).toEqual(["a"])
  })

  it("keeps native dirty checks, literal names and reset defaults on reconnect", async () => {
    const { form, tree, host, node } = fixture("selectable checkable", '<m-tree-node value="a" title="A" checked name="files"></m-tree-node><m-tree-node value="b" title="B" name="files"></m-tree-node>')
    const check = node("a").checkbox
    tree.checkedKeys = ["b"]
    expect(new FormData(form).getAll("files")).toEqual(["b"])
    tree.remove(); form.append(tree)
    expect(node("a").checkbox).toBe(check)
    expect(tree.checkedKeys).toEqual(["b"])
    form.reset(); await wait()
    expect(tree.checkedKeys).toEqual(["a"])
    host("b").checked = true
    form.addEventListener("reset", event => event.preventDefault(), { once: true })
    form.reset(); await wait()
    expect(tree.checkedKeys).toEqual(["a", "b"])
  })

  it("replays pre-upgrade keys without replacing subsequent live checks on reconnect", () => {
    const tree = new Tree()
    tree.checkable = true; tree.selectable = true
    tree.innerHTML = '<m-tree-node value="a" title="A"></m-tree-node><m-tree-node value="b" title="B"></m-tree-node>'
    tree.checkedKeys = ["a"]; tree.selectedKeys = ["b"]
    document.body.append(tree)
    tree.checkedKeys = ["b"]
    tree.remove(); document.body.append(tree)
    expect(tree.checkedKeys).toEqual(["b"])
    expect(tree.selectedKeys).toEqual(["b"])
  })

  it("does not consume a nested Tree or remove nodes transferred between trees", async () => {
    const outer = fixture()
    const inner = fixture()
    outer.host("a").append(inner.tree)
    await wait()
    inner.tree.selectedKeys = ["b"]
    expect(outer.tree.selectedKeys).toEqual([])
    const transferred = outer.host("c")
    transferred.value = "moved"
    inner.tree.append(transferred)
    await wait()
    expect(inner.tree.connected).toBe(true)
    expect(outer.tree.connected).toBe(true)
    expect(inner.tree.nodes.map(node => node.key)).toContain("moved")
    expect(outer.tree.nodes.map(node => node.key)).not.toContain("moved")
    expect(transferred.isConnected).toBe(true)
  })

  it("retains canceled clicks and superseding programmatic selection semantics", async () => {
    const { form, tree, node } = fixture("selectable multiple")
    form.addEventListener("click", event => event.preventDefault(), { once: true })
    node("b").label.click(); await wait()
    expect(tree.selectedKeys).toEqual([])
    node("a").label.click(); tree.selectedKeys = ["c"]; await wait()
    expect(tree.selectedKeys).toEqual(["c"])
    node("b").label.click(); node("a").label.click(); await wait()
    expect(tree.selectedKeys).toEqual(["a", "b", "c"])
    expect(() => { tree.multiple = false }).toThrow()
    expect(tree.multiple).toBe(true)
  })

  it("aborts, disposes late data once, and reloads after reconnect", async () => {
    const { tree } = fixture("selectable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    let resolve!: (result: TreeLoadResult) => void, signal!: AbortSignal
    const dispose = vi.fn()
    tree.load = (_, context) => { signal = context.signal; return new Promise(done => { resolve = done }) }
    const pending = tree.expand("a")
    tree.remove()
    expect(await pending).toBe(false); expect(signal.aborted).toBe(true)
    resolve({ nodes: [{ value: "old", title: "Old" }], dispose }); await wait()
    expect(dispose).toHaveBeenCalledOnce()
    document.body.append(tree)
    tree.load = () => ({ nodes: [{ value: "new", title: "New" }], dispose })
    expect(await tree.expand("a")).toBe(true)
    tree.selectedKeys = ["new"]
    tree.remove(); document.body.append(tree)
    expect(tree.connected).toBe(true)
    expect(tree.selectedKeys).toEqual([])
    expect(dispose).toHaveBeenCalledTimes(2)
  })

  it("rejects duplicate loaded keys and disposes rejected data without partial insertion", async () => {
    const { tree } = fixture("selectable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    const dispose = vi.fn()
    tree.load = () => ({ nodes: [{ value: "a", title: "Duplicate" }], dispose })
    await expect(tree.expand("a")).rejects.toThrow()
    expect(dispose).toHaveBeenCalledOnce()
    expect(tree.connected).toBe(true)
    expect(tree.nodes).toHaveLength(1)
  })

  it("keeps dirty native checks and authored text when flags change", async () => {
    const { tree, host, node } = fixture("selectable checkable", '<m-tree-node value="a">Authored text</m-tree-node>')
    const input = node("a").checkbox
    host("a").checked = true
    tree.checkable = false; tree.checkable = true; tree.blockLine = true
    expect(node("a").checkbox).toBe(input)
    expect(host("a").checked).toBe(true)
    expect(node("a").label.textContent).toBe("Authored text")
    host("a").defaultChecked = true
    host("a").checked = false
    host("a").defaultChecked = false
    host("a").defaultChecked = true
    await wait()
    expect(host("a").checked).toBe(false)
    expect(input?.defaultChecked).toBe(true)
    input!.defaultChecked = false
    expect(host("a").defaultChecked).toBe(false)
    host("a").defaultChecked = true
    expect(input?.defaultChecked).toBe(true)
  })

  it("maps links, passive groups and defaultExpandAll without extra focus owners", () => {
    const { tree, host, node } = fixture("selectable default-expand-all", '<m-tree-node value="a" title="Group" group><m-tree-node value="b" title="Guide" href="#guide"></m-tree-node></m-tree-node><m-tree-node value="c" title="Lazy" lazy></m-tree-node>')
    expect(host("a").expanded).toBe(true)
    expect(host("c").expanded).toBe(false)
    expect(node("a").label.localName).toBe("span")
    expect(node("b").label.localName).toBe("a")
    expect(node("b").label.getAttribute("href")).toBe("#guide")
    expect(() => { tree.selectedKeys = ["a"] }).toThrow()
    expect(() => { tree.selectedKeys = ["b"] }).toThrow()
    host("b").focus()
    expect(document.activeElement).toBe(node("b").label)
    const focus = vi.spyOn(node("a").summary!, "focus")
    tree.focus({ preventScroll: false })
    expect(focus).toHaveBeenCalledWith({ preventScroll: false })
  })

  it.each([
    [{ value: "b", title: "B", checked: "false" }],
    [{ value: "b", title: "B", href: "javascript:alert(1)" }],
    [{ value: "b", title: "B", name: 123 }],
    Array(1),
    Array.from({ length: 201 }, (_, index) => ({ value: String(index), title: "Item" })),
  ])("rejects malformed portable load data without changing live nodes: %j", async nodes => {
    const { tree } = fixture("selectable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    const dispose = vi.fn()
    tree.load = () => ({ nodes, dispose }) as never
    await expect(tree.expand("a")).rejects.toThrow()
    expect(dispose).toHaveBeenCalledOnce()
    expect(tree.nodes.map(node => node.key)).toEqual(["a"])
    expect(tree.connected).toBe(true)
  })

  it("settles failed-load cleanup with the original rejection ordering", async () => {
    const { tree } = fixture("selectable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    let reject!: (reason: Error) => void
    tree.load = () => new Promise((_, fail) => { reject = fail })
    const settled = tree.expand("a").then(value => value, error => error)
    await wait()
    reject(new Error("Loader failed"))
    tree.querySelector("[data-tree]")!.setAttribute("role", "tree")
    const result = await settled
    expect(result).toBeInstanceOf(AggregateError)
    expect(result.errors[0].message).toBe("Loader failed")
    expect(tree.connected).toBe(false)
  })

  it("cancels a pending node load immediately when its key changes", async () => {
    const { tree, host } = fixture("selectable", '<m-tree-node value="a" title="A" lazy></m-tree-node>')
    let signal!: AbortSignal
    tree.load = (_, context) => { signal = context.signal; return new Promise(() => {}) }
    const pending = tree.expand("a")
    host("a").value = "renamed"
    expect(signal.aborted).toBe(true)
    expect(await pending).toBe(false)
    expect(tree.connected).toBe(true)
  })

  it("reconnects after selected or expanded nodes were removed while detached", () => {
    const { form, tree, host } = fixture()
    tree.selectedKeys = ["b"]; tree.expandedKeys = ["a"]
    tree.remove(); host("a").remove()
    const errors: unknown[] = []
    const failure = (event: ErrorEvent) => { errors.push(event.error); event.preventDefault() }
    window.addEventListener("error", failure)
    try { form.append(tree) } finally { window.removeEventListener("error", failure) }
    expect(errors).toEqual([])
    expect(tree.connected).toBe(true)
    expect(tree.nodes.map(node => node.key)).toEqual(["c"])
    expect(tree.selectedKeys).toEqual([])
    expect(tree.expandedKeys).toEqual([])
  })

  it("applies detached disclosure/selection attributes and cancels a removed lazy marker", async () => {
    const { form, tree, host } = fixture("selectable")
    tree.remove()
    host("a").removeAttribute("expanded")
    host("c").setAttribute("selected", "")
    form.append(tree)
    expect(tree.expandedKeys).toEqual([])
    expect(tree.selectedKeys).toEqual(["c"])
    const lazy = new TreeNode(); lazy.value = "lazy"; lazy.title = "Lazy"; lazy.lazy = true
    tree.append(lazy)
    let signal!: AbortSignal
    tree.load = (_, context) => { signal = context.signal; return new Promise(() => {}) }
    const pending = tree.expand("lazy")
    lazy.lazy = false
    expect(await pending).toBe(false)
    expect(signal.aborted).toBe(true)
    expect(tree.connected).toBe(true)
  })
})
