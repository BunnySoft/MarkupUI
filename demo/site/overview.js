Fieldnotes.page("overview", function initialize() {
  const { notify } = Fieldnotes
  let refreshTimer
  const calendar = document.getElementById("workspace-calendar")
  const meetingDate = document.getElementById("meeting-date")
  const refreshButton = document.getElementById("refresh-overview")
  const loadingPreview = document.getElementById("overview-loading")
  const statistics = document.getElementById("overview-stats")
  const loadingBar = document.getElementById("site-loading")
  const dailyNote = document.getElementById("daily-note")
  const noteButton = document.getElementById("toggle-note")
  const reviewButton = document.getElementById("complete-review")

  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const today = `${year}-${month}-${day}`

  document.getElementById("today-label").time = now.getTime()
  calendar.today = today
  calendar.value = today
  meetingDate.textContent = `Selected day: ${today}`

  function updateMeetingDate() {
    meetingDate.textContent = `Selected day: ${calendar.value}`
  }

  function refreshOverview() {
    refreshButton.disabled = true
    loadingPreview.hidden = false
    statistics.hidden = true
    loadingBar.start()

    refreshTimer = setTimeout(() => {
      loadingPreview.hidden = true
      statistics.hidden = false
      refreshButton.disabled = false
      loadingBar.finish()
      notify("Sample overview refreshed. No network sync was needed.")
    }, 700)
  }

  function toggleDailyNote() {
    const isVisible = !dailyNote.show
    dailyNote.show = isVisible
    noteButton.textContent = isVisible ? "Hide" : "Show"
    noteButton.setAttribute("aria-expanded", String(isVisible))
  }

  function completeReview() {
    document.getElementById("review-pending").hidden = true
    document.getElementById("review-empty").hidden = false
    reviewButton.hidden = true
    notify("Creative direction reviewed in this preview.")
  }

  m(calendar).on("m:change", updateMeetingDate)
  m(refreshButton).on("click", refreshOverview)
  m(noteButton).on("click", toggleDailyNote)
  m(reviewButton).on("click", completeReview)
  m("#explore-projects").on("click", () => {
    Fieldnotes.navigate("./projects.html")
  })
  return () => {
    clearTimeout(refreshTimer)
    loadingBar.finish()
  }
})
