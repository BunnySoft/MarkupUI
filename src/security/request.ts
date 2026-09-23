import { isSafeUri, type HtmlPolicy } from "./index.js"

/** Fetch bounded markup without ambient credentials, redirects or indefinite requests. */
export async function requestHtml(src: string, document: Document, policy: HtmlPolicy = {}, signal?: AbortSignal): Promise<string> {
  const url = new URL(src, document.baseURI)
  const allowed = { ...policy, allowedOrigins: policy.allowedOrigins ?? [document.location?.origin ?? new URL(document.baseURI).origin] }
  if (!isSafeUri(url.href, allowed)) throw new TypeError(`URL '${src}' is not allowed.`)
  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  else signal?.addEventListener("abort", abort, { once: true })
  const timeout = setTimeout(() => controller.abort(new DOMException("HTML request timed out.", "TimeoutError")), 15_000)
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  const cancel = () => { void reader?.cancel().catch(() => {}) }
  try {
    controller.signal.throwIfAborted()
    const response = await fetch(url.href, { signal: controller.signal, credentials: "omit", redirect: "error" })
    controller.signal.throwIfAborted()
    reader = response.body?.getReader()
    controller.signal.addEventListener("abort", cancel, { once: true })
    if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}.`)
    if (Number(response.headers.get("content-length")) > 1_048_576) throw new RangeError("HTML response exceeds 1048576 bytes.")
    const type = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase()
    if (type && !["text/html", "text/plain"].includes(type)) throw new TypeError("Expected an HTML or plain-text response.")
    if (!reader) return ""
    const decoder = new TextDecoder()
    let bytes = 0, html = ""
    while (true) {
      const { value, done } = await reader.read()
      controller.signal.throwIfAborted()
      if (done) break
      bytes += value.byteLength
      if (bytes > 1_048_576) throw new RangeError("HTML response exceeds 1048576 bytes.")
      html += decoder.decode(value, { stream: true })
    }
    return html + decoder.decode()
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener("abort", abort)
    controller.signal.removeEventListener("abort", cancel)
    await reader?.cancel().catch(() => {})
    reader?.releaseLock()
  }
}
