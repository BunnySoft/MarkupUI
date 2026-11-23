Fieldnotes.page("library",function initialize() {
  const { pages,coveredFamilies,commonFamilies }=FieldnotesCatalog
  const { createVirtualList }=MarkupUIAll.virtualList
  const { createLog }=MarkupUIAll.log

  const notes=[
    "Alex added a warm new palette to New horizons.",
    "Morgan shared a keyboard navigation checklist.",
    "Sam sketched a gentler welcome screen.",
    "Jamie made room for an afternoon of focused work.",
    "A new reference found its way onto the inspiration shelf.",
    "The team wrapped up another thoughtful little review.",
  ]

  function formatNotebookEntry(item) {
    const entryNumber=String(item.id+1).padStart(4,"0")
    return `${entryNumber} / ${item.text}`
  }

  function renderCoverageMap() {
    const coverageGrid=document.getElementById("coverage-grid")
    m("#coverage-count").text(`${coveredFamilies.length} / 89 families`)

    for(const page of pages) {
      const card=document.createElement("m-box")
      card.className="coverage-card"

      const link=document.createElement("m-link")
      link.href=`./${page.file}`
      link.textContent=page.title

      const list=document.createElement("m-p")
      list.textContent=page.families.join(", ")

      card.append(link,list)
      coverageGrid.append(card)
    }

    m("#shared-coverage").text(`Throughout the site: ${commonFamilies.join(", ")}.`)
  }

  const marquee=document.getElementById("library-marquee")
  const pauseButton=document.getElementById("pause-marquee")
  const searchInput=document.getElementById("note-search")
  const mantra=document.getElementById("studio-mantra")
  const feed=document.getElementById("studio-feed")
  const feedItems=document.getElementById("feed-items")
  const feedStatus=document.getElementById("feed-status")
  const moreNotesButton=document.getElementById("more-notes")
  const feedLimit=30
  const feedBatchSize=6
  let loadedNotes=0
  let logEntryCount=0
  let isMarqueePaused=matchMedia("(prefers-reduced-motion: reduce)").matches

  if(isMarqueePaused) {
    marquee.pause()
  }
  pauseButton.textContent=isMarqueePaused? "Play announcement":"Pause announcement"

  function toggleAnnouncement() {
    isMarqueePaused=!isMarqueePaused

    if(isMarqueePaused) {
      marquee.pause()
    } else {
      marquee.play()
    }

    pauseButton.textContent=isMarqueePaused? "Play announcement":"Pause announcement"
  }

  function highlightSearch() {
    const searchTerm=searchInput.value.trim()
    mantra.keywords=searchTerm? [searchTerm]:[]
  }

  function loadMoreNotes() {
    const endIndex=Math.min(loadedNotes+feedBatchSize,feedLimit)
    while(loadedNotes<endIndex) {
      const row=document.createElement("m-box")
      row.className="feed-row"
      const noteNumber=String(loadedNotes+1).padStart(2,"0")
      row.textContent=`${noteNumber} / ${notes[loadedNotes%notes.length]}`
      feedItems.append(row)
      loadedNotes++
    }

    feedStatus.textContent=`${loadedNotes} of ${feedLimit} sample notes`
    moreNotesButton.disabled=loadedNotes===feedLimit
    feed.disabled=loadedNotes===feedLimit
  }

  const notebookEntries=Array.from({ length: 1000 },(_,id) => ({
    id,
    text: notes[id%notes.length],
  }))
  const notebook=createVirtualList(document.getElementById("notebook"),{
    items: notebookEntries,
    rowSize: 40,
    overscan: 3,
    key: item => item.id,
    render(item) {
      const row=document.createElement("li")
      row.textContent=formatNotebookEntry(item)
      return row
    },
    update(row,item) {
      row.textContent=formatNotebookEntry(item)
    },
  })
  const log=createLog(document.getElementById("activity-log"))

  function appendLogEntry() {
    logEntryCount++
    log.append(`\n[note ${logEntryCount}] A small, thoughtful interaction. Stored in this page only.`)
    log.flush()
    log.scrollTo({ position: "bottom" })
  }

  function scrollToCoverage() {
    const prefersReducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById("coverage").scrollIntoView({
      behavior: prefersReducedMotion? "instant":"smooth",
    })
  }

  m(pauseButton).on("click",toggleAnnouncement)
  m(searchInput).on("input",highlightSearch)
  m(feed).on("m:load",loadMoreNotes)
  m(moreNotesButton).on("click",loadMoreNotes)
  m("#first-entry").on("click",() => {
    notebook.scrollTo({ position: "top" })
  })
  m("#last-entry").on("click",() => {
    notebook.scrollTo({ position: "bottom" })
  })
  m("#log-entry").on("click",appendLogEntry)
  m("#coverage-shortcut").on("click",scrollToCoverage)
  loadMoreNotes()
  renderCoverageMap()
  return () => {
    notebook.disconnect()
    log.disconnect()
  }
})
