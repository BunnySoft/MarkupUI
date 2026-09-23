document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement
  root.dataset.mTheme = root.dataset.mTheme === "dark" ? "light" : "dark"
})
document.getElementById("load-components").addEventListener("click", async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try {
    await import("../dist/markup-ui-card.js")
    document.getElementById("status").textContent = "Card loaded; external CSS still controls the page theme."
  } catch (error) {
    button.disabled = false
    document.getElementById("status").textContent = "Card could not be loaded."
    throw error
  }
})
