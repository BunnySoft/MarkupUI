import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createUpload } from "../src/components/upload/index.js"
import type { UploadContext, UploadController, UploadOptions, UploadResponse } from "../src/components/upload/index.js"

// jsdom lacks DataTransfer. Preserve its real FileList implementation so native
// input assignment, reset and FormData are still exercised, not hidden-field mocks.
function impl(value: object): unknown[] {
  const symbol = Object.getOwnPropertySymbols(value).find(key => key.description === "impl")!
  return (value as Record<symbol, unknown[]>)[symbol]!
}
class Transfer {
  readonly files: FileList
  readonly items: { add: (file: File) => void; length: number; [Symbol.iterator]: () => IterableIterator<{ webkitGetAsEntry: () => null }> }
  readonly types = ["Files"]
  dropEffect = "none"
  constructor() {
    const input = document.createElement("input"); input.type = "file"; this.files = input.files!
    const entries: { webkitGetAsEntry: () => null }[] = []
    this.items = { length: 0, add: file => { impl(this.files).push(impl(file)); this.items.length++; entries.push({ webkitGetAsEntry: () => null }) },
      [Symbol.iterator]: () => entries.values() }
  }
}
let controllers: UploadController[] = [], cleanup: (() => void)[] = []
const file = (name = "draft.txt", content = "local", type = "text/plain") => new File([content], name, { type, lastModified: 123 })
const flush = async () => { for (let i = 0; i < 12; ++i) await Promise.resolve(); await new Promise(resolve => setTimeout(resolve, 0)) }
function transport() {
  const jobs: { file: File; context: UploadContext; resolve: (value: UploadResponse) => void; reject: (error: unknown) => void }[] = []
  const send = vi.fn((file: File, context: UploadContext) => new Promise<UploadResponse>((resolve, reject) => {
    jobs.push({ file, context, resolve, reject }); cleanup.push(() => resolve({ status: "finished" }))
  }))
  return { send, jobs }
}
function fixture(options: UploadOptions = {}, bind = true) {
  const form = document.createElement("form")
  form.innerHTML = `<fieldset><legend>Native upload fields</legend><section class="mui-upload" data-upload tabindex="-1" aria-label="Local files">
    <label>Files<input type="file" name="attachments" multiple data-upload-input></label>
    <div data-upload-actions hidden><button type="button" data-upload-action="start">Start all</button><button type="button" data-upload-action="cancel">Cancel all</button><button type="button" data-upload-action="clear">Clear all</button></div>
    <div data-upload-drop hidden>Drop Files or use the chooser.</div>
    <ul data-upload-list hidden></ul>
    <template data-upload-row><li><span data-upload-name></span><span data-upload-size></span><span data-upload-status></span><progress data-upload-progress></progress><div data-upload-row-actions><button type="button" data-upload-action="start">Start</button><button type="button" data-upload-action="cancel">Cancel</button><button type="button" data-upload-action="retry">Retry</button><button type="button" data-upload-action="remove">Remove</button></div></li></template>
    <p data-upload-status>Original native selection fallback.</p>
    </section></fieldset><label>Other field<input name="title" value="kept"></label><button type="button" data-outside>Outside</button>`
  document.body.append(form)
  const root = form.querySelector<HTMLElement>("[data-upload]")!, input = root.querySelector<HTMLInputElement>("input")!
  // jsdom 26's _formReset clears _value but omits its file list. Model that missing
  // browser default action after dispatch, preserving cancellation and native FileList.
  const nativeReset = form.reset.bind(form)
  let resetEvent: Event | null = null
  form.addEventListener("reset", event => { resetEvent = event })
  form.reset = () => {
    resetEvent = null; nativeReset()
    if (resetEvent && !(resetEvent as Event).defaultPrevented) input.value = ""
  }
  const helper = bind ? createUpload(root, options) : null
  if (helper) controllers.push(helper)
  function choose(files: File[]) {
    const transfer = new Transfer(); files.forEach(f => transfer.items.add(f)); input.files = transfer.files
    input.dispatchEvent(new Event("change", { bubbles: true }))
  }
  const names = () => new FormData(form).getAll("attachments").filter(value => value instanceof File && value.name).map(value => (value as File).name)
  return { root, input, form, helper: helper!, choose, names,
    list: root.querySelector<HTMLElement>("[data-upload-list]")!,
    readout: root.querySelector<HTMLElement>(":scope > [data-upload-status]")!,
    fieldset: form.querySelector("fieldset")!, outside: form.querySelector<HTMLButtonElement>("[data-outside]")! }
}
beforeEach(() => { vi.stubGlobal("DataTransfer", Transfer) })
afterEach(async () => {
  controllers.forEach(controller => controller.disconnect()); controllers = []
  cleanup.splice(0).forEach(finish => finish()); await flush()
  document.body.replaceChildren(); vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe("Upload native FileList and queue selection", () => {
  it("adopts real file input/label/form state and uses original template children", () => {
    const { helper, choose, input, form, names, list } = fixture()
    const a = file(), b = file("second.txt")
    choose([a, b])
    expect(helper.files.map(entry => entry.file)).toEqual([a, b])
    expect(input.files![0]).toBe(a); expect(names()).toEqual(["draft.txt", "second.txt"])
    expect(new FormData(form).get("title")).toBe("kept")
    expect(list.children).toHaveLength(2); expect(input.name).toBe("attachments"); expect(input.multiple).toBe(true)
  })
  it("preserves native FileList membership after removal, clear and finished transport", async () => {
    const fake = transport(), { helper, choose, names, input } = fixture({ transport: fake.send })
    choose([file("one"), file("two")]); const first = helper.files[0]!.id
    helper.remove(first); expect(names()).toEqual(["two"]); expect(input.files).toHaveLength(1)
    helper.start(); fake.jobs[0]!.resolve({ status: "finished", response: { url: "javascript:unsafe" } }); await flush()
    expect(helper.files[0]!.status).toBe("finished"); expect(names()).toEqual(["two"])
    expect(helper.list.querySelector("a,img,iframe")).toBeNull()
    helper.clear(); expect(names()).toEqual([]); expect(input.files).toHaveLength(0)
  })
  it("uses replace by default and explicit append with distinct per-selection IDs", () => {
    const { helper, choose, names } = fixture(), same = file("same.txt")
    choose([same]); const original = helper.files[0]!
    helper.add([same], "append")
    expect(names()).toEqual(["same.txt", "same.txt"])
    expect(helper.files[0]!.id).toBe(original.id); expect(helper.files[1]!.id).not.toBe(original.id)
    expect(helper.files[1]!.batchId).not.toBe(original.batchId)
    choose([same]); expect(helper.files).toHaveLength(1); expect(helper.files[0]!.id).not.toBe(original.id)
  })
  it("appends native chooser changes without secretly clearing selected submission files", () => {
    const { helper, choose, names } = fixture({ selection: "append" })
    choose([file("one")]); choose([file("two")])
    expect(helper.files).toHaveLength(2); expect(names()).toEqual(["one", "two"])
  })
  it("treats an empty native change as authoritative clear even in append mode", () => {
    const { helper, choose, input, names } = fixture({ selection: "append" })
    choose([file("old")]); input.value = ""; input.dispatchEvent(new Event("change", { bubbles: true }))
    expect(names()).toEqual([]); expect(helper.files).toHaveLength(0)
  })
  it("validates a batch before mutation and reports all-or-nothing rejection", () => {
    const { helper, names } = fixture({ maxFiles: 2, maxFileBytes: 5 })
    helper.add([file("kept")])
    const result = helper.add([file("good", "x"), file("bad", "too large")], "append")
    expect(result.accepted).toBe(false); expect(result.rejected).toHaveLength(2)
    expect(result.rejectedCount).toBe(2); expect(names()).toEqual(["kept"])
  })
  it("clears an invalid native replacement instead of resurrecting old user files", () => {
    const { helper, choose, names, readout } = fixture({ maxFiles: 1 })
    choose([file("old")]); choose([file("new1"), file("new2")])
    expect(helper.files).toHaveLength(0); expect(names()).toEqual([])
    expect(readout.textContent).toContain("exceeds")
  })
  it("keeps old files only for the explicit append rejection contract", () => {
    const { helper, choose, names } = fixture({ maxFiles: 1, selection: "append" })
    choose([file("old")]); choose([file("new")])
    expect(helper.files).toHaveLength(1); expect(names()).toEqual(["old"])
  })
  it("bounds queue and rejection metadata without traversing unbounded file inputs", () => {
    const { helper } = fixture({ maxFiles: 100 })
    const result = helper.add(Array.from({ length: 150 }, (_, i) => file(String(i))))
    expect(result.rejectedCount).toBe(150); expect(result.rejected).toHaveLength(100)
    expect(helper.files).toHaveLength(0)
  })
  it("keeps accept as a native chooser hint, not a security/type validator", () => {
    const { helper, input } = fixture()
    input.accept = "image/png"
    expect(helper.add([file("report.txt", "text", "text/plain")]).accepted).toBe(true)
    expect(input.accept).toBe("image/png")
  })
  it("enforces native multiple and refuses URL metadata pretending to be File", () => {
    const { helper, input } = fixture()
    input.multiple = false
    expect(helper.add([file("one"), file("two")]).accepted).toBe(false)
    expect(() => helper.add([{ name: "remote", url: "/remote" }] as unknown as File[])).toThrow(/real File/)
  })
  it("keeps filenames literal, including HTML-like names, and never creates preview URLs", () => {
    const spy = vi.fn(); Object.defineProperty(URL, "createObjectURL", { configurable: true, value: spy })
    const { helper, list } = fixture(); helper.add([file('<img src=x onerror="boom">.txt')])
    expect(list.querySelector("[data-upload-name]")!.textContent).toBe('<img src=x onerror="boom">.txt')
    expect(list.querySelector("img,script")).toBeNull(); expect(spy).not.toHaveBeenCalled()
    delete (URL as Partial<typeof URL>).createObjectURL
  })
  it("supports scoped flat File drops without handling text or crawling directories", () => {
    const { helper, root, names } = fixture(), zone = root.querySelector<HTMLElement>("[data-upload-drop]")!
    const transfer = new Transfer(); transfer.items.add(file("dropped.txt"))
    const dispatch = (data: unknown) => { const event = new Event("drop", { bubbles: true, cancelable: true }); Object.defineProperty(event, "dataTransfer", { value: data }); zone.dispatchEvent(event); return event }
    expect(dispatch(transfer).defaultPrevented).toBe(true); expect(names()).toEqual(["dropped.txt"])
    expect(dispatch({ types: ["text/plain"] }).defaultPrevented).toBe(false)
    expect(dispatch({ types: ["Files"], items: [{ webkitGetAsEntry: () => ({ isDirectory: true }) }], files: transfer.files }).defaultPrevented).toBe(true)
    expect(helper.files).toHaveLength(1); expect(helper.state.lastError).toBeInstanceOf(Error)
  })
  it("does not interpret an empty Files drop as permission to clear the current selection", () => {
    const { helper, root, names } = fixture(); helper.add([file("kept")])
    const event = new Event("drop", { bubbles: true, cancelable: true })
    Object.defineProperty(event, "dataTransfer", { value: new Transfer() })
    root.querySelector("[data-upload-drop]")!.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true); expect(names()).toEqual(["kept"])
  })
})

describe("Upload bounded transport and cancellation", () => {
  it("requires explicit transport and never starts by default", async () => {
    const { helper } = fixture(); helper.add([file()])
    expect(() => helper.start()).toThrow(/explicit transport/)
    expect(helper.files[0]!.status).toBe("pending")
    const fake = transport(), second = fixture({ transport: fake.send }); second.choose([file()])
    await flush(); expect(fake.send).not.toHaveBeenCalled()
  })
  it("runs one bounded pool and pumps only when actual promises settle", async () => {
    const fake = transport(), { helper } = fixture({ transport: fake.send, concurrency: 2 })
    helper.add([file("1"), file("2"), file("3")]); helper.start()
    expect(fake.send).toHaveBeenCalledTimes(2); expect(helper.state.active).toBe(2); expect(helper.state.queued).toBe(1)
    fake.jobs[0]!.resolve({ status: "finished" }); await flush()
    expect(fake.send).toHaveBeenCalledTimes(3); expect(helper.files[0]!.status).toBe("finished")
    fake.jobs[1]!.resolve({ status: "finished" }); fake.jobs[2]!.resolve({ status: "finished" })
    await helper.whenIdle(); expect(helper.state.active).toBe(0)
  })
  it("does not release a cancelled ignored-abort slot or permit premature retry", async () => {
    const fake = transport(), { helper } = fixture({ transport: fake.send, concurrency: 1 })
    helper.add([file("1"), file("2")]); helper.start()
    const id = helper.files[0]!.id, old = fake.jobs[0]!
    helper.cancel(id)
    expect(old.context.signal.aborted).toBe(true); expect(helper.files[0]!.status).toBe("cancelling")
    expect(helper.state.active).toBe(1); expect(helper.state.cancelling).toBe(1)
    helper.retry(id); expect(fake.send).toHaveBeenCalledTimes(1)
    expect(old.context.reportProgress(5, 5)).toBe(false)
    old.resolve({ status: "finished" }); await flush()
    expect(helper.files[0]!.status).toBe("cancelled"); expect(fake.send).toHaveBeenCalledTimes(2)
  })
  it("removes native membership immediately but retains a removed transport slot", async () => {
    const fake = transport(), { helper, names } = fixture({ transport: fake.send, concurrency: 1 })
    helper.add([file("1"), file("2")]); helper.start(); const id = helper.files[0]!.id
    helper.remove(id); expect(names()).toEqual(["2"]); expect(helper.state.active).toBe(1)
    expect(fake.send).toHaveBeenCalledTimes(1); expect(() => helper.retry(id)).toThrow(/Unknown/)
    fake.jobs[0]!.resolve({ status: "finished" }); await flush(); expect(fake.send).toHaveBeenCalledTimes(2)
  })
  it("keeps failed/retried attempts distinct and ignores old progress/completions", async () => {
    const fake = transport(), { helper } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); const first = fake.jobs[0]!
    first.reject(new Error("No server success")); await flush()
    expect(helper.files[0]!.status).toBe("error")
    helper.retry(helper.files[0]!.id); const second = fake.jobs[1]!
    expect(second.context.attempt).toBe(2); expect(first.context.reportProgress(5, 5)).toBe(false)
    second.resolve({ status: "finished", response: { opaque: true } }); await flush()
    expect(helper.files[0]!.status).toBe("finished"); expect(helper.files[0]!.file.name).toBe("draft.txt")
  })
  it.each([undefined, null, false, 0, "error"])("never treats rejection %s as finished", async reason => {
    const { helper } = fixture({ transport: () => Promise.reject(reason) })
    helper.add([file()]); helper.start(); await helper.whenIdle()
    expect(helper.files[0]!.status).toBe("error"); expect(helper.files[0]!.error).toBe(reason)
  })
  it("reports malformed results and throwing response getters as errors", async () => {
    let getter = false
    const { helper } = fixture({ transport: () => getter
      ? { status: "finished", get response() { throw new Error("response callback") } }
      : undefined as unknown as UploadResponse })
    helper.add([file()]); helper.start(); await helper.whenIdle()
    expect(helper.files[0]!.status).toBe("error")
    getter = true; helper.retry(helper.files[0]!.id); await helper.whenIdle()
    expect(helper.files[0]!.status).toBe("error"); expect(helper.files[0]!.result).toBeNull()
  })
  it("guards result getter mutations and rechecks native reset before reporting finished", async () => {
    let action: () => void = () => {}
    const { helper, form } = fixture({ transport: () => ({ status: "finished", get response() { action(); return "opaque" } }) })
    action = () => helper.clear()
    helper.add([file()]); helper.start(); await helper.whenIdle()
    expect(helper.files[0]!.status).toBe("error")
    expect((helper.files[0]!.error as Error).message).toContain("reenter")
    action = () => form.reset()
    helper.retry(helper.files[0]!.id); await helper.whenIdle()
    expect(helper.files).toHaveLength(0); expect(helper.state.synchronized).toBe(true)
  })
  it("retains honest indeterminate progress and never equates bytes sent to success", () => {
    const fake = transport(), { helper, list, readout } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); const job = fake.jobs[0]!, before = readout.textContent
    expect(job.context.reportProgress(2)).toBe(true)
    expect(list.querySelector("progress")!.hasAttribute("value")).toBe(false)
    expect(job.context.reportProgress(5, 5)).toBe(true)
    expect(list.querySelector("progress")!.value).toBe(100)
    expect(helper.files[0]!.status).toBe("uploading"); expect(readout.textContent).toBe(before)
  })
  it.each([[NaN, 5], [-1, 5], [6, 5], [3, -1], [1.5, 5]])("rejects invalid progress %j without freeing the slot", async (loaded, total) => {
    const fake = transport(), { helper } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start()
    expect(fake.jobs[0]!.context.reportProgress(loaded, total)).toBe(false)
    expect(helper.files[0]!.status).toBe("cancelling"); expect(helper.state.active).toBe(1)
    fake.jobs[0]!.resolve({ status: "finished" }); await flush()
    expect(helper.files[0]!.status).toBe("error")
  })
  it("supports explicit automatic start only with supplied transport", async () => {
    const fake = transport(), { helper, choose } = fixture({ transport: fake.send, autoUpload: true })
    choose([file()]); await flush(); expect(fake.send).toHaveBeenCalledOnce(); expect(helper.state.active).toBe(1)
    const empty = fixture({}, false)
    expect(() => createUpload(empty.root, { autoUpload: true })).toThrow()
  })
})

describe("Upload native reset, refresh, disabled and focus", () => {
  it("does not resurrect files after native reset, including ignored-abort work", async () => {
    const fake = transport(), { helper, form, input, names } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); const id = helper.files[0]!.id
    form.reset(); expect(input.files).toHaveLength(0); await flush()
    expect(helper.files).toHaveLength(0); expect(names()).toEqual([]); expect(fake.jobs[0]!.context.signal.aborted).toBe(true)
    fake.jobs[0]!.resolve({ status: "finished" }); await flush()
    expect(helper.files).toHaveLength(0); expect(() => helper.retry(id)).toThrow()
  })
  it("preserves selection and a completion across cancelled reset ordering", async () => {
    const fake = transport(), { helper, form, names } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start()
    form.addEventListener("reset", event => event.preventDefault())
    fake.jobs[0]!.resolve({ status: "finished" }); form.reset(); await flush()
    expect(names()).toEqual(["draft.txt"]); expect(helper.files[0]!.status).toBe("finished")
    expect(fake.jobs[0]!.context.signal.aborted).toBe(false)
  })
  it("waits past the native reset-button microtask checkpoint before reading FileList", async () => {
    const { helper, form, input } = fixture()
    helper.add([file()])
    form.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }))
    await Promise.resolve()
    expect(helper.state.resetPending).toBe(true)
    input.value = "" // Browser default action after the listener microtask checkpoint.
    await flush(); expect(helper.files).toHaveLength(0); expect(helper.state.synchronized).toBe(true)
  })
  it("refreshes external FileList ordering by identity and external clear authoritatively", () => {
    const { helper, input, list, names } = fixture(), a = file("a"), b = file("b")
    helper.add([a, b]); const [first, second] = helper.files, row = list.children[1]
    const transfer = new Transfer(); transfer.items.add(b); transfer.items.add(a); input.files = transfer.files
    expect(() => helper.start()).toThrow(/refresh/)
    helper.refresh()
    expect(helper.files.map(f => f.id)).toEqual([second!.id, first!.id]); expect(list.children[0]).toBe(row)
    input.value = ""; helper.refresh(); expect(helper.files).toHaveLength(0); expect(names()).toEqual([])
  })
  it("refreshes a changed multiple constraint by rejecting/clearing, never truncating silently", () => {
    const { helper, input, names } = fixture(); helper.add([file("a"), file("b")])
    input.multiple = false
    expect(helper.refresh()?.accepted).toBe(false); expect(names()).toEqual([])
  })
  it("honors native fieldset disabling, cancels active work and preserves native attributes", async () => {
    const fake = transport(), { helper, fieldset, input, names } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); fieldset.disabled = true; await flush()
    expect(helper.state.disabled).toBe(true); expect(fake.jobs[0]!.context.signal.aborted).toBe(true)
    expect(names()).toEqual([]); expect(input.disabled).toBe(false)
    expect(() => helper.add([file()])).toThrow(/disabled/)
    fieldset.disabled = false; await flush(); expect(names()).toEqual(["draft.txt"])
  })
  it("does not steal focus on adding/progress and preserves a focused row through append/reorder", () => {
    const fake = transport(), { helper, input, list } = fixture({ transport: fake.send })
    input.focus(); helper.add([file("a")]); expect(document.activeElement).toBe(input)
    const button = list.querySelector<HTMLButtonElement>('[data-upload-action="cancel"]')!
    helper.start(); button.focus(); fake.jobs[0]!.context.reportProgress(1, 5)
    expect(document.activeElement).toBe(button)
    helper.add([file("b")], "append"); expect(document.activeElement).toBe(button)
  })
  it("keeps disabled focused actions usable and moves focus safely before actual row removal", async () => {
    const fake = transport(), { helper, list, input } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start()
    const cancel = list.querySelector<HTMLButtonElement>('[data-upload-action="cancel"]')!
    cancel.focus(); cancel.click()
    expect(document.activeElement).toBe(cancel); expect(cancel.disabled).toBe(false); expect(cancel.getAttribute("aria-disabled")).toBe("true")
    cancel.click(); expect(helper.state.active).toBe(1)
    const remove = list.querySelector<HTMLButtonElement>('[data-upload-action="remove"]')!
    remove.focus(); remove.click(); expect(document.activeElement).toBe(input)
    await flush(); expect(list.children).toHaveLength(0)
  })
  it("keeps native form association outside the DOM ancestor and observes its reset", async () => {
    const { helper, input, form } = fixture(), external = document.createElement("form")
    external.id = "external-upload-form"; document.body.append(external); input.setAttribute("form", external.id)
    helper.add([file()]); expect(new FormData(form).has("attachments")).toBe(false)
    expect((new FormData(external).get("attachments") as File).name).toBe("draft.txt")
    // Supply jsdom's missing native file-reset default only for this external form.
    const event = new Event("reset", { bubbles: true, cancelable: true }); external.dispatchEvent(event); input.value = ""
    await flush(); expect(helper.files).toHaveLength(0)
  })
  it("prevents work in closed native dialog scopes and can resume after explicit refresh", async () => {
    const fake = transport(), { helper, root } = fixture({ transport: fake.send }), dialog = document.createElement("dialog")
    document.body.append(dialog); dialog.append(root)
    expect(() => helper.add([file()])).toThrow(/disabled/)
    dialog.open = true; helper.refresh(); helper.add([file()]); helper.start()
    expect(fake.send).toHaveBeenCalledOnce()
    dialog.open = false; await flush(); expect(fake.jobs[0]!.context.signal.aborted).toBe(true)
  })
})

describe("Upload disposal, callback guards and native fallback", () => {
  it("retains the ownership lock until disconnected ignored-abort transports settle", async () => {
    const fake = transport(), { helper, root, names } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); helper.disconnect()
    expect(names()).toEqual(["draft.txt"]); expect(helper.state.active).toBe(1)
    expect(() => createUpload(root)).toThrow(/unowned/)
    fake.jobs[0]!.resolve({ status: "finished" }); await helper.whenIdle()
    const next = createUpload(root); controllers.push(next); expect(next.files).toHaveLength(1)
  })
  it("reports synchronous and unsupported async callback failures without undoing file membership", async () => {
    const failing = vi.fn(() => { throw new Error("callback failed") })
    const { helper, names } = fixture({ onChange: failing })
    helper.add([file()]); expect(helper.state.lastError).toBeInstanceOf(Error); expect(names()).toEqual(["draft.txt"])
    const other = fixture({ onChange: (() => Promise.reject(new Error("async not supported"))) as UploadOptions["onChange"] })
    other.helper.add([file()]); await flush()
    expect((other.helper.state.lastError as Error).message).toContain("synchronous")
  })
  it("guards reentrant mutations but permits disconnect before transport invocation", () => {
    let helper!: UploadController
    const onChange = vi.fn(() => helper.clear()), first = fixture({ onChange }); helper = first.helper
    helper.add([file()]); expect(helper.files).toHaveLength(1); expect((helper.state.lastError as Error).message).toContain("reenter")
    const fake = transport(), second = fixture({ transport: fake.send })
    second.helper.add([file()])
    second.root.addEventListener("mui:upload-change", event => {
      if ((event as CustomEvent).detail.reason === "start") second.helper.disconnect()
    })
    second.helper.start(); expect(fake.send).not.toHaveBeenCalled(); expect(second.helper.state.active).toBe(0)
  })
  it("auto-disconnects removed roots without restoring stale user files or accepting late results", async () => {
    const fake = transport(), { helper, root, input } = fixture({ transport: fake.send })
    helper.add([file()]); helper.start(); root.remove(); await flush()
    expect(helper.connected).toBe(false); expect(input.files).toHaveLength(1)
    expect(fake.jobs[0]!.context.reportProgress(5, 5)).toBe(false)
    fake.jobs[0]!.resolve({ status: "finished" }); await helper.whenIdle(); expect(helper.state.active).toBe(0)
  })
  it("fails closed and clears native selection if synchronization unexpectedly fails", () => {
    const { helper, input } = fixture(); helper.add([file()])
    vi.stubGlobal("DataTransfer", class { constructor() { throw new Error("lost support") } })
    expect(() => helper.add([file("new")], "append")).toThrow()
    expect(input.files).toHaveLength(0); expect(helper.connected).toBe(false)
  })
  it("leaves unsupported browsers with the untouched native chooser and hidden controls", () => {
    const { root, input } = fixture({}, false), transfer = new Transfer(); transfer.items.add(file()); input.files = transfer.files
    vi.stubGlobal("DataTransfer", undefined)
    expect(() => createUpload(root)).toThrow(/DataTransfer/)
    expect(input.files).toHaveLength(1); expect(root.querySelector("[data-upload-actions]")!.hasAttribute("hidden")).toBe(true)
  })
  it("restores only owned attributes/readout and leaves native input values as the user selected them", () => {
    const { helper, input, root, readout } = fixture()
    helper.add([file()]); readout.setAttribute("aria-live", "off"); helper.disconnect(); helper.disconnect()
    expect(readout.getAttribute("aria-live")).toBe("off")
    expect(readout.textContent).toBe("Original native selection fallback.")
    expect(root.querySelector("[data-upload-list]")!.hasAttribute("hidden")).toBe(true)
    expect(input.files).toHaveLength(1)
  })
  it("preserves authored disabled actions and adopts valid initial FileList data", () => {
    const setup = fixture({}, false), transfer = new Transfer(); transfer.items.add(file())
    setup.input.files = transfer.files
    const top = setup.root.querySelector<HTMLButtonElement>('[data-upload-actions] [data-upload-action="start"]')!
    top.disabled = true
    const helper = createUpload(setup.root, { transport: () => ({ status: "finished" }) }); controllers.push(helper)
    expect(helper.files).toHaveLength(1); expect(top.disabled).toBe(true)
    helper.disconnect(); expect(top.disabled).toBe(true)
  })
  it.each([{ maxFiles: 0 }, { maxFiles: 101 }, { maxFileBytes: -1 }, { concurrency: 0 }, { concurrency: 5 }, { selection: "merge" }, { beforeUpload: () => false }])("rejects unsupported configuration %j", options => {
    const { root } = fixture({}, false)
    expect(() => createUpload(root, options as UploadOptions)).toThrow()
  })
})
