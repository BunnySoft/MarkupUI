document.getElementById("native-form").addEventListener("submit", (event) => {
  event.preventDefault()
  document.getElementById("form-status").textContent = "The native form submitted."
})
document.getElementById("scroll-bottom").addEventListener("click", () => {
  const activity = document.getElementById("activity")
  activity.scrollTo({
    top: activity.scrollHeight,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  })
})
