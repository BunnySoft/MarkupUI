document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement
  root.dataset.muiTheme = root.dataset.muiTheme === "dark" ? "light" : "dark"
})
document.getElementById("load-legacy").addEventListener("click", async (event) => {
  const button = event.currentTarget
  button.disabled = true
  try {
    await import("../dist/markup-ui.js")
    document.getElementById("status").textContent = "Legacy behavior loaded; preset CSS still controls the page theme."
  } catch (error) {
    button.disabled = false
    document.getElementById("status").textContent = "Legacy entry could not be loaded."
    throw error
  }
})
