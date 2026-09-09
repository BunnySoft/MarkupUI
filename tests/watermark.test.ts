import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createWatermark } from "../src/components/watermark/index.js"
import type { WatermarkController, WatermarkSettings } from "../src/components/watermark/index.js"

let controllers: WatermarkController[] = [], contexts: ReturnType<typeof context>[] = []
let blobs: BlobCallback[] = [], deferBlob = false, urlSequence = 0, encodeError: Error | null = null
let urls: Map<string, Blob>, revoke: ReturnType<typeof vi.fn>, media: EventTarget
function context() {
  return {
    font: "10px sans-serif", fontStretch: "normal", fillStyle: "#000000", strokeStyle: "#000000",
    globalAlpha: 1, lineWidth: 1, textAlign: "left", textBaseline: "alphabetic",
    scale: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(),
    fillText: vi.fn(), drawImage: vi.fn(), strokeRect: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8, actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.trim() ? text.length * 8 : 0, actualBoundingBoxAscent: text.trim() ? 10 : 0,
      actualBoundingBoxDescent: text.trim() ? 3 : 0 })),
  }
}
function image(width = 100, height = 60, complete = true) {
  const node = document.createElement("img"); node.src = "http://localhost/local-mark.png"
  Object.defineProperties(node, {
    naturalWidth: { configurable: true, value: width }, naturalHeight: { configurable: true, value: height },
    complete: { configurable: true, value: complete },
  })
  node.decode = vi.fn(async () => {})
  return node
}
function fixture(options: WatermarkSettings = { content: "LOCAL DRAFT" }, bind = true) {
  const root = document.createElement("section")
  root.className = "mui-watermark"; root.dataset.watermark = ""; root.style.position = "relative"
  root.innerHTML = `<h2>Original content</h2><form><label>Draft<input name="draft" value="kept" required></label><button type="button">Native action</button></form>
    <p data-text>Original selectable text with <strong>markup</strong>.</p><div data-watermark-overlay hidden aria-hidden="true"></div>`
  document.body.append(root)
  const overlay = root.querySelector<HTMLDivElement>("[data-watermark-overlay]")!
  const helper = bind ? createWatermark(root, options) : null
  if (helper) controllers.push(helper)
  return { root, overlay, helper: helper!, form: root.querySelector("form")!, input: root.querySelector("input")! }
}
const flush = async () => { for (let i = 0; i < 10; ++i) await Promise.resolve() }
beforeEach(() => {
  urls = new Map(); contexts = []; blobs = []; deferBlob = false; encodeError = null
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
    const ctx = context(); contexts.push(ctx); return ctx as unknown as CanvasRenderingContext2D
  })
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => {
    if (encodeError) throw encodeError
    if (deferBlob) blobs.push(callback)
    else callback(new Blob(["local png"], { type: "image/png" }))
  })
  vi.stubGlobal("devicePixelRatio", 2)
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn((blob: Blob) => {
    const url = `blob:http://localhost/${++urlSequence}`; urls.set(url, blob); return url
  }) })
  revoke = vi.fn((url: string) => { urls.delete(url) })
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revoke })
  media = new EventTarget(); vi.stubGlobal("matchMedia", () => media)
})
afterEach(() => {
  controllers.forEach(controller => controller.disconnect()); controllers = []; document.body.replaceChildren()
  delete (URL as Partial<typeof URL>).createObjectURL; delete (URL as Partial<typeof URL>).revokeObjectURL
  vi.restoreAllMocks(); vi.unstubAllGlobals()
})

describe("Watermark native tile and decorative ownership", () => {
  it("generates one bounded HiDPI tile without adding a tile DOM grid", async () => {
    const { helper, overlay, root } = fixture()
    const nodes = [...root.childNodes], result = await helper.ready
    expect(result).toMatchObject({ status: "ready", width: 200, height: 120, pixelWidth: 400, pixelHeight: 240, pixelRatio: 2 })
    expect(overlay.hidden).toBe(false); expect(overlay.getAttribute("aria-hidden")).toBe("true")
    expect(overlay.childNodes.length).toBe(0); expect([...root.childNodes]).toEqual(nodes)
    expect(contexts[0]!.scale).toHaveBeenCalledWith(2, 2)
    expect(urls.size).toBe(1); expect(helper.state.hasTile).toBe(true)
  })
  it("renders literal multiline text with alignment, native font and rotation", async () => {
    const { helper, overlay } = fixture({ content: "<tag>\n& literal", width: 220, height: 150, rotate: -30,
      fontSize: 20, lineHeight: 28, fontFamily: "monospace", fontStyle: "italic", fontVariant: "small-caps",
      fontWeight: 600, fontStretch: "condensed", fontColor: "#345678", textAlign: "right",
      xGap: 10, yGap: 20, xOffset: -15, yOffset: 23, opacity: .5, zIndex: 7 })
    expect((await helper.ready).status).toBe("ready")
    const ctx = contexts[0]!
    expect(ctx.font).toBe("italic small-caps 600 20px monospace"); expect(ctx.fontStretch).toBe("condensed")
    expect(ctx.fillText.mock.calls.some(call => call[0] === "<tag>")).toBe(true)
    expect(ctx.rotate).toHaveBeenCalledWith(-Math.PI / 6)
    expect(overlay.style.getPropertyValue("--mui-watermark-x")).toBe("-15px")
    expect(overlay.style.getPropertyValue("--mui-watermark-opacity")).toBe("0.5")
  })
  it("draws bounded cross stamps and debug grid in the same single tile", async () => {
    const { helper, overlay } = fixture({ content: "DRAFT", cross: true, debug: true })
    await helper.ready
    expect(contexts[0]!.fillText).toHaveBeenCalledTimes(18)
    expect(contexts[0]!.strokeRect).toHaveBeenCalledTimes(2)
    expect(overlay.childNodes.length).toBe(0)
  })
  it("keeps original controls, focus, form values, listeners and author ARIA", async () => {
    const { helper, root, input, form } = fixture(), action = vi.fn()
    root.setAttribute("aria-label", "Author region"); input.addEventListener("input", action)
    input.value = "edited"; input.focus(); await helper.ready
    await helper.update({ content: "Updated" })
    input.dispatchEvent(new Event("input"))
    expect(action).toHaveBeenCalledOnce(); expect(document.activeElement).toBe(input)
    expect(new FormData(form).get("draft")).toBe("edited")
    expect(root.getAttribute("aria-label")).toBe("Author region")
    expect(input.closest("[inert],[aria-hidden],[hidden]")).toBeNull()
  })
  it("uses empty as an explicit clear operation, not a blank success", async () => {
    const { helper, overlay } = fixture()
    await helper.ready; expect(urls.size).toBe(1)
    const result = await helper.update({ content: "" })
    expect(result.status).toBe("empty"); expect(overlay.hidden).toBe(true); expect(urls.size).toBe(0)
    expect(helper.state.hasTile).toBe(false)
  })
  it("does not allocate a Canvas for initially empty/whitespace content", async () => {
    const { helper } = fixture({ content: " \n " })
    expect((await helper.ready).status).toBe("empty")
    expect(contexts).toHaveLength(0)
  })
  it("accepts a valid font whose native serialization matches a validation sentinel", async () => {
    const ctx = context(); let value = ctx.font
    Object.defineProperty(ctx, "font", {
      get: () => value,
      set: (font: string) => { value = font.includes("1px serif") ? "1px serif" : font },
    })
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(ctx as unknown as CanvasRenderingContext2D)
    const { helper } = fixture({ content: "DRAFT", fontFamily: "serif", fontSize: 1 })
    expect((await helper.ready).status).toBe("ready")
  })
  it("does not silently establish a new containing block", () => {
    const { root, overlay } = fixture({}, false); root.style.position = "static"
    expect(() => createWatermark(root, { content: "DRAFT" })).toThrow(/positioned wrapper/)
    expect(root.style.position).toBe("static"); expect(overlay.hidden).toBe(true)
  })
  it("allows explicit viewport-fixed mode only with a safe direct-body wrapper", async () => {
    const { helper, root, overlay } = fixture({ content: "DRAFT", fullscreen: true })
    await helper.ready; expect(overlay.hasAttribute("data-watermark-fullscreen")).toBe(true)
    root.style.transform = "translateX(0px)"
    expect(() => helper.update({ fullscreen: true })).toThrow(/transformed/)
    root.style.transform = ""; const wrapper = document.createElement("main"); document.body.append(wrapper); wrapper.append(root)
    expect(() => helper.update({ fullscreen: true })).toThrow(/directly under body/)
  })
})

describe("Watermark validation and failure contract", () => {
  it.each([
    { width: NaN }, { height: 0 }, { width: 1025 }, { xGap: -1 }, { yOffset: Infinity }, { rotate: 361 },
    { fontSize: 0 }, { opacity: 1.1 }, { imageOpacity: -1 }, { pixelRatio: 0 }, { pixelRatio: 5 },
    { zIndex: .5 }, { fontWeight: 450 }, { content: "x".repeat(2049) }, { content: "\n".repeat(16) },
    { content: "tab\tvalue" }, { fontFamily: "url(evil)" }, { fontStyle: "oblique 30deg" },
    { fontColor: "currentColor" }, { fontColor: "rgb(256, 0, 0)" }, { fontColor: "rgba(0,0,0,2)" },
    { fontColor: "black; background:red" }, { debug: "yes" }, { image: "https://example.com/image.png" },
    { imageWidth: -1 }, { globalRotate: 30 }, { toString: () => "" },
  ])("rejects invalid configuration %j before changing a valid tile", async input => {
    const { helper, overlay } = fixture(); await helper.ready
    const before = overlay.getAttribute("style"), state = helper.state
    expect(() => helper.update(input as WatermarkSettings)).toThrow()
    expect(overlay.getAttribute("style")).toBe(before); expect(helper.state).toEqual(state)
  })
  it.each(["#abc", "#abcd", "#112233", "#11223344", "rgba(128, 128, 128, .3)", "rgb(0, 255, 12.5)", "transparent", "navy"])("accepts declared color grammar %s", async fontColor => {
    const { helper } = fixture({ content: "DRAFT", fontColor })
    expect((await helper.ready).status).toBe("ready")
  })
  it("fails before allocating an oversized pixel-area tile", async () => {
    const { helper } = fixture({ content: "DRAFT", width: 1024, height: 1024, xGap: 1024, yGap: 1024, pixelRatio: 4 })
    const result = await helper.ready
    expect(result.status).toBe("error"); expect(contexts).toHaveLength(0); expect(helper.state.hasTile).toBe(false)
  })
  it("reports rotated clipping rather than encoding cropped/blank text", async () => {
    const { helper, overlay } = fixture(); await helper.ready
    const before = overlay.style.getPropertyValue("--mui-watermark-image")
    const result = await helper.update({ width: 50, height: 20, rotate: 45 })
    expect(result.status).toBe("error"); expect(helper.state.phase).toBe("error")
    expect(overlay.style.getPropertyValue("--mui-watermark-image")).toBe(before)
    expect(helper.state.hasTile).toBe(true); expect(urls.size).toBe(1)
  })
  it("surfaces Canvas unavailable, null PNG and native security errors", async () => {
    const { helper, overlay } = fixture(); await helper.ready
    const before = overlay.style.getPropertyValue("--mui-watermark-image")
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null)
    expect((await helper.refresh()).status).toBe("error")
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(callback => callback(null))
    expect((await helper.refresh()).status).toBe("error")
    encodeError = new DOMException("Tainted canvas", "SecurityError")
    const result = await helper.refresh()
    expect(result).toMatchObject({ status: "error", error: encodeError })
    expect(overlay.style.getPropertyValue("--mui-watermark-image")).toBe(before); expect(urls.size).toBe(1)
  })
  it("keeps the old valid tile through loading/error and replaces it only on success", async () => {
    const { helper, overlay } = fixture(); await helper.ready
    const before = overlay.style.getPropertyValue("--mui-watermark-image")
    deferBlob = true; const pending = helper.update({ content: "Second" }); await flush()
    expect(helper.state.phase).toBe("loading"); expect(overlay.style.getPropertyValue("--mui-watermark-image")).toBe(before)
    blobs.shift()!(new Blob(["new"], { type: "image/png" })); expect((await pending).status).toBe("ready")
    expect(overlay.style.getPropertyValue("--mui-watermark-image")).not.toBe(before); expect(urls.size).toBe(1)
    expect(revoke).toHaveBeenCalledOnce()
  })
})

describe("Watermark caller-owned images and generation races", () => {
  it("draws a decoded caller image without setting its src, credentials or ownership", async () => {
    const img = image(), { helper } = fixture({ image: img, imageWidth: 80, imageOpacity: .4 })
    const before = img.outerHTML
    expect((await helper.ready).status).toBe("ready"); expect(img.decode).not.toHaveBeenCalled()
    expect(contexts[0]!.drawImage).toHaveBeenCalledWith(img, -40, -24, 80, 48)
    expect(img.outerHTML).toBe(before); helper.disconnect(); expect(img.src).toBe("http://localhost/local-mark.png")
  })
  it("waits for native decoding and reports decode errors, never a success-shaped tile", async () => {
    const img = image(0, 0, false); vi.mocked(img.decode).mockRejectedValue(new Error("Decode failed"))
    const { helper, overlay } = fixture({ image: img })
    expect((await helper.ready).status).toBe("error"); expect(overlay.hidden).toBe(true); expect(urls.size).toBe(0)
  })
  it("rejects changed image sources and invalid loader values", async () => {
    const img = image(), { helper } = fixture({ image: img })
    deferBlob = true; await flush(); img.src = "http://localhost/changed.png"
    blobs.shift()!(new Blob(["png"], { type: "image/png" }))
    expect((await helper.ready).status).toBe("error")
    expect((await helper.update({ image: null, loadImage: () => null as unknown as HTMLImageElement })).status).toBe("error")
  })
  it("aborts previous loaders and protects the latest tile against out-of-order images", async () => {
    let finish!: (image: HTMLImageElement) => void, signal!: AbortSignal
    const { helper } = fixture({ loadImage: context => { signal = context.signal; return new Promise(resolve => { finish = resolve }) } })
    const first = helper.ready; await flush()
    const second = helper.update({ loadImage: null, content: "Latest text" })
    expect((await first).status).toBe("aborted"); expect(signal.aborted).toBe(true)
    expect((await second).status).toBe("ready")
    const generation = helper.state.generation; finish(image()); await flush()
    expect(helper.state.generation).toBe(generation); expect(contexts).toHaveLength(1); expect(urls.size).toBe(1)
  })
  it("serializes native PNG work and ignores stale callbacks without leaking URLs", async () => {
    deferBlob = true
    const { helper } = fixture(), first = helper.ready; await flush()
    const second = helper.update({ content: "Latest" }); await flush()
    expect((await first).status).toBe("aborted")
    expect(blobs).toHaveLength(1)
    blobs[0]!(new Blob(["old"], { type: "image/png" })); await flush()
    expect(urls.size).toBe(0); expect(blobs).toHaveLength(2)
    blobs[1]!(new Blob(["new"], { type: "image/png" })); expect((await second).status).toBe("ready")
    expect(urls.size).toBe(1); expect(URL.createObjectURL).toHaveBeenCalledOnce()
  })
  it("handles reentrant abort callbacks and loading events without stale application", async () => {
    const { helper, root } = fixture(); await helper.ready
    let contextSignal!: AbortSignal
    const first = helper.update({ loadImage: context => { contextSignal = context.signal; return new Promise(() => {}) } })
    await flush()
    contextSignal.addEventListener("abort", () => { void helper.update({ loadImage: null, content: "Reentrant" }) }, { once: true })
    const second = helper.update({ loadImage: null, content: "Overtaken" })
    expect((await first).status).toBe("aborted"); expect((await second).status).toBe("aborted")
    await helper.ready; expect(helper.settings.content).toBe("Reentrant")
    root.addEventListener("mui:watermark-state", () => helper.disconnect(), { once: true })
    expect((await helper.update({ content: "Never committed" })).status).toBe("aborted")
    expect(urls.size).toBe(0)
  })
  it("does not invoke a caller loader superseded before its queued invocation", async () => {
    const loader = vi.fn(() => image()), { helper } = fixture({ loadImage: loader })
    const first = helper.ready; await Promise.resolve()
    const latest = helper.update({ loadImage: null, content: "New request" })
    expect((await first).status).toBe("aborted"); expect((await latest).status).toBe("ready")
    expect(loader).not.toHaveBeenCalled()
  })
})

describe("Watermark lifetime, native resize and restoration", () => {
  it("does not regenerate tiles on ordinary container/window resize; updates automatic DPR", async () => {
    const { helper, root } = fixture(); await helper.ready; const first = helper.state.generation
    root.style.width = "600px"; window.dispatchEvent(new Event("resize"))
    expect(helper.state.generation).toBe(first)
    vi.stubGlobal("devicePixelRatio", 3); window.dispatchEvent(new Event("resize")); await helper.ready
    expect(helper.state.rendered?.pixelRatio).toBe(3); expect(helper.state.generation).toBe(first + 1)
    vi.stubGlobal("devicePixelRatio", 8); media.dispatchEvent(new Event("change")); await helper.ready
    expect(helper.state.rendered?.pixelRatio).toBe(4)
  })
  it("does not change explicit pixelRatio when device ratio changes", async () => {
    const { helper } = fixture({ content: "DRAFT", pixelRatio: 1 }); await helper.ready
    vi.stubGlobal("devicePixelRatio", 3); window.dispatchEvent(new Event("resize"))
    expect(helper.state.rendered?.pixelRatio).toBe(1)
  })
  it("clears pending decode/blob work and revokes only owned URLs on disconnect", async () => {
    const { helper, overlay } = fixture(); await helper.ready
    const external = URL.createObjectURL(new Blob(["caller"]))
    deferBlob = true; const pending = helper.refresh(); await flush(); helper.disconnect(); helper.disconnect()
    expect((await pending).status).toBe("aborted"); expect(overlay.hidden).toBe(true)
    blobs[0]!(new Blob(["late"], { type: "image/png" })); await flush()
    expect([...urls.keys()]).toEqual([external]); expect(helper.state.phase).toBe("disconnected")
  })
  it("restores only still-owned properties and supports explicit rebinding", async () => {
    const { helper, root, overlay } = fixture(); await helper.ready
    overlay.style.setProperty("--mui-watermark-opacity", ".7"); root.setAttribute("aria-label", "Kept")
    helper.disconnect()
    expect(overlay.style.getPropertyValue("--mui-watermark-opacity")).toBe(".7")
    expect(overlay.style.getPropertyValue("--mui-watermark-image")).toBe("")
    expect(root.getAttribute("aria-label")).toBe("Kept")
    const second = createWatermark(root, { content: "New owner" }); controllers.push(second)
    expect((await second.ready).status).toBe("ready")
  })
  it("disconnects when the root or overlay is removed, not by rebuilding authored content", async () => {
    const { helper, overlay } = fixture(); await helper.ready
    overlay.remove(); await flush()
    expect(helper.connected).toBe(false); expect(urls.size).toBe(0)
  })
  it("rejects duplicate owners and non-decorative overlay anatomy", () => {
    const { root } = fixture(); expect(() => createWatermark(root)).toThrow(/unowned/)
    const bad = fixture({}, false); bad.overlay.innerHTML = "<button>Not decorative</button>"
    expect(() => createWatermark(bad.root)).toThrow(/empty direct/)
  })
})
