const key = Symbol.for("markupui.feedback.owner")

export function claimFeedbackRoot(root: HTMLElement): () => void {
  const target = root as HTMLElement & { [key]?: object }
  if (target[key]) throw new Error("This feedback root already has an owner.")
  const token = {}
  target[key] = token
  return () => { if (target[key] === token) delete target[key] }
}

/** Local content mutations plus actual ancestor removals, never a document-subtree observer. */
export function observeFeedbackRoot(root: HTMLElement, changed: () => void): () => void {
  let stopped = false
  const observer = new root.ownerDocument.defaultView!.MutationObserver(() => {
    if (stopped) return
    changed()
    observe()
  })
  function observe() {
    observer.disconnect()
    if (stopped) return
    observer.observe(root, { childList: true, subtree: true })
    for (let node = root.parentNode; node; node = node.parentNode) observer.observe(node, { childList: true })
  }
  observe()
  return () => { stopped = true; observer.disconnect() }
}
