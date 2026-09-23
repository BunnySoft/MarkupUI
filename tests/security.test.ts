import { afterEach, describe, expect, it, vi } from "vitest"
import { sanitizeHtml, isSafeUri } from "../src/security/index.js"
import { requestHtml } from "../src/security/request.js"
import { Include } from "../src/components/dynamic.js"
import { ViewElement } from "../src/core/index.js"
import { query } from "../src/query/index.js"

ViewElement.register([Include])
afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("restricted HTML policy", () => {
  it("filters every nested template before the application can instantiate it", () => {
    const result = sanitizeHtml('<template><img src="/ok" onerror="run()"><template><script>run()</script><a href="javascript:run()">Text</a></template></template>')
    const outer = result.querySelector("template")!.content
    expect(outer.querySelector("img")!.hasAttribute("onerror")).toBe(false)
    expect(outer.querySelector("img")!.getAttribute("src")).toBe("/ok")
    const inner = outer.querySelector("template")!.content
    expect(inner.querySelector("script")).toBeNull()
    expect(inner.querySelector("a")!.hasAttribute("href")).toBe(false)
  })

  it.each([
    '<svg><a xlink:href="javascript:run()">Link</a></svg>',
    '<svg><foreignObject><p onclick="run()">Content</p></foreignObject></svg>',
    '<math><mtext><img src="/image" onerror="run()"></mtext></math>',
    '<button is="executable-button">Run</button>',
    '<x-executable></x-executable>',
  ])("rejects foreign namespaces and executable custom-element surfaces: %s", html => {
    expect(sanitizeHtml(html).childElementCount).toBe(0)
  })

  it("requires explicit trust for portable component markup", () => {
    expect(sanitizeHtml("<m-card>Content</m-card>").childElementCount).toBe(0)
    expect(sanitizeHtml("<m-card onclick='run()'>Content</m-card>", document, { allowMarkupUI: true })
      .querySelector("m-card")!.hasAttribute("onclick")).toBe(false)
    expect(sanitizeHtml("<x-widget>Content</x-widget>", document, { allowMarkupUI: true }).childElementCount).toBe(0)
  })

  it("removes URL-list, namespace, shadow-root and clobbering attributes", () => {
    const result = sanitizeHtml('<a id="location" name="attributes" ping="/track" href="/ok" xlink:href="javascript:run()">Link</a><img srcset="/one 1x, https://evil.test/two 2x"><template shadowrootmode="open"></template>')
    const link = result.querySelector("a")!
    expect([...link.attributes].map(attr => attr.name)).toEqual(["href"])
    expect(result.querySelector("img")!.hasAttribute("srcset")).toBe(false)
    expect(result.querySelector("template")!.hasAttribute("shadowrootmode")).toBe(false)
  })

  it("uses the destination document URL rather than an unrelated global document", () => {
    const target = document.implementation.createHTMLDocument()
    const base = target.createElement("base")
    base.href = "https://target.example/app/"
    target.head.append(base)
    const result = sanitizeHtml('<img src="image.png"><a href="https://other.example/">Other</a>', target)
    expect(result.querySelector("img")!.getAttribute("src")).toBe("image.png")
    expect(result.querySelector("a")!.hasAttribute("href")).toBe(false)
  })

  it("bounds synchronous input and rejects credentials and script URLs", () => {
    expect(() => sanitizeHtml("x".repeat(1_048_577))).toThrow("1048576")
    for (const url of ["javascript:run()", "java\nscript:run()", "data:text/html,test", "https://user:pass@trusted.test/"]) {
      expect(isSafeUri(url, { allowedOrigins: ["https://trusted.test"] })).toBe(false)
    }
    expect(isSafeUri("/ok", {}, "https://trusted.test/app/")).toBe(true)
    expect(isSafeUri("https://other.test/", {}, "https://trusted.test/app/")).toBe(false)
  })
})

describe("bounded HTML transport", () => {
  it("omits credentials and rejects redirects while decoding split UTF-8 chunks", async () => {
    const encoded = new TextEncoder().encode("a\u20ac")
    const fetch = vi.fn(async () => new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(encoded.slice(0, 2))
        controller.enqueue(encoded.slice(2))
        controller.close()
      },
    }), { headers: { "Content-Type": "text/html; charset=utf-8" } }))
    vi.stubGlobal("fetch", fetch)
    expect(await requestHtml("/fragment", document)).toBe("a\u20ac")
    expect(fetch.mock.calls[0]).toEqual([new URL("/fragment", document.baseURI).href,
      expect.objectContaining({ credentials: "omit", redirect: "error", signal: expect.any(AbortSignal) })])
  })

  it("rejects cross-origin URLs before making a request", async () => {
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    await expect(requestHtml("https://untrusted.example/", document)).rejects.toThrow("not allowed")
    expect(fetch).not.toHaveBeenCalled()
  })

  it("rejects an oversized declared response and a non-HTML MIME type", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response("x", { headers: { "Content-Length": "1048577" } }))
      .mockResolvedValueOnce(new Response("{}", { headers: { "Content-Type": "application/json" } })))
    await expect(requestHtml("/large", document)).rejects.toThrow("1048576")
    await expect(requestHtml("/json", document)).rejects.toThrow("HTML or plain-text")
  })

  it("enforces the streaming limit and releases the reader", async () => {
    const cancel = vi.fn()
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(1_048_577)) },
      cancel,
    }))))
    await expect(requestHtml("/stream", document)).rejects.toThrow("1048576")
    expect(cancel).toHaveBeenCalledOnce()
  })

  it("cancels stalled body reads at the deadline", async () => {
    vi.useFakeTimers()
    const cancel = vi.fn()
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new ReadableStream({ cancel }))))
    const result = expect(requestHtml("/slow", document)).rejects.toMatchObject({ name: "TimeoutError" })
    await vi.advanceTimersByTimeAsync(15_000)
    await result
    expect(cancel).toHaveBeenCalledOnce()
  })
})

describe("HTML loader ownership", () => {
  it("does not let an aborted Include overwrite a newer response or clear its loading state", async () => {
    const requests: { resolve(response: Response): void; signal: AbortSignal }[] = []
    vi.stubGlobal("fetch", vi.fn((_url, init) => new Promise<Response>(resolve => {
      requests.push({ resolve, signal: init.signal })
    })))
    const include = document.createElement("m-include") as Include
    include.src = "/first"
    document.body.append(include)
    include.src = "/second"
    expect(requests[0]!.signal.aborted).toBe(true)
    requests[0]!.resolve(new Response("<p>Old</p>"))
    await Promise.resolve()
    await Promise.resolve()
    expect(include.hasAttribute("loading")).toBe(true)
    expect(include.textContent).toBe("")
    requests[1]!.resolve(new Response("<m-span>Current</m-span>"))
    await vi.waitFor(() => expect(include.textContent).toBe("Current"))
    expect(include.hasAttribute("loading")).toBe(false)
  })

  it.each(["remove", "clear", "invalid"])("aborts Include when its source becomes %s", async action => {
    let resolve!: (response: Response) => void
    let signal!: AbortSignal
    vi.stubGlobal("fetch", vi.fn((_url, init) => {
      signal = init.signal
      return new Promise<Response>(done => { resolve = done })
    }))
    const include = document.createElement("m-include") as Include
    include.textContent = "Retained"
    include.src = "/pending"
    document.body.append(include)
    if (action === "remove") include.remove()
    else include.src = action === "clear" ? null : "javascript:run()"
    expect(signal.aborted).toBe(true)
    resolve(new Response("<p>Stale</p>"))
    await vi.waitFor(() => expect(include.hasAttribute("loading")).toBe(false))
    expect(include.textContent).toBe("Retained")
  })

  it("cancels explicit Query loads without replacing authored content", async () => {
    let resolve!: (response: Response) => void
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>(done => { resolve = done })))
    const target = document.createElement("section")
    target.textContent = "Retained"
    const selection = query(target)
    const result = expect(selection.load("/pending")).rejects.toMatchObject({ name: "AbortError" })
    selection.cancelLoad()
    resolve(new Response("<p>Stale</p>"))
    await result
    expect(target.textContent).toBe("Retained")
  })
})
