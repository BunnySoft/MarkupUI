const { createImagePreview } = window.MarkupUIImage
const gallery = createImagePreview(document.querySelector("#gallery"))
const nested = createImagePreview(document.querySelector("#nested-gallery"))
const lazy = createImagePreview(document.querySelector("#lazy-gallery"))
window.imageDemo = { gallery, nested, lazy }
document.querySelector("#open-gallery").addEventListener("click", event => gallery.open(0, event.currentTarget))
document.querySelector("#gallery").addEventListener("mui:image-change", event => {
  if (event.target.id !== "gallery") return
  document.querySelector("#gallery-feedback").textContent = `Application observed image index ${event.detail.current}.`
})
