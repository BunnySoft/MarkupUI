const { createAnchor } = window.MarkupUIAnchor
const node = id => document.getElementById(id)
const controllers = {
  page: createAnchor(node("page-toc"), { offset: 16 }),
  reader: createAnchor(node("reader-toc"), { root: node("reader"), offset: 8 }),
}
for (const nav of [node("page-toc"), node("reader-toc")]) {
  nav.addEventListener("mui:anchor-change", event => {
    node("location-log").value = `${nav.id}: ${event.detail.href ?? "between sections"}`
  })
}
node("scroll-reader-last").addEventListener("click", () => controllers.reader.scrollTo("#reader-last", { behavior: "smooth" }))
node("reader-top").addEventListener("click", () => node("reader").scrollTo({ top: 0, behavior: "instant" }))
window.anchorDemo = controllers
