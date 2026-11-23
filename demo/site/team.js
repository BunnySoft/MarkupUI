Fieldnotes.page("team",function initialize() {
  const { notify }=Fieldnotes

  const members=[
    { name: "Alex Lee",role: "Brand designer",team: "Creative",city: "Portland" },
    { name: "Morgan Kim",role: "Design engineer",team: "Engineering",city: "London" },
    { name: "Sam Rivera",role: "Product designer",team: "Creative",city: "Copenhagen" },
    { name: "Jamie Davis",role: "Studio lead",team: "Strategy",city: "Portland" },
    { name: "Jordan Ellis",role: "Frontend developer",team: "Engineering",city: "London" },
    { name: "Riley Park",role: "Content designer",team: "Creative",city: "Copenhagen" },
    { name: "Casey Reed",role: "Project manager",team: "Delivery",city: "London" },
    { name: "Taylor Brooks",role: "Researcher",team: "Strategy",city: "Portland" },
    { name: "Avery Quinn",role: "Illustrator",team: "Creative",city: "Copenhagen" },
    { name: "Drew Hayes",role: "Accessibility specialist",team: "Engineering",city: "Portland" },
    { name: "Robin Bell",role: "Creative producer",team: "Delivery",city: "London" },
    { name: "Skyler Lane",role: "Motion designer",team: "Creative",city: "Copenhagen" },
  ]

  function createMemberCard(member,index) {
    const card=document.createElement("m-box")
    card.className="person"

    const avatar=document.createElement("m-avatar")
    const initials=member.name.split(" ").map(part => part[0]).join("")
    const avatarColors=["#e8e4ef","#f2e7d9","#e7edde"]
    avatar.textContent=initials
    avatar.style.setProperty("--avatar-bg",avatarColors[index%avatarColors.length])
    avatar.setAttribute("label",member.name)

    const name=document.createElement("m-strong")
    name.textContent=member.name

    const role=document.createElement("m-small")
    role.textContent=`${member.role} / ${member.city}`

    const team=document.createElement("m-tag")
    team.size="small"
    team.textContent=member.team

    card.append(avatar,name,role,team)
    return card
  }

  const searchInput=document.getElementById("people-search")
  const cityInput=document.getElementById("team-city")
  const pagination=document.getElementById("people-pages")
  const peopleGrid=document.getElementById("people-grid")
  const emptyState=document.getElementById("people-empty")
  const peopleCount=document.getElementById("people-count")
  const reviewTeam=document.getElementById("review-team")
  const messageInput=document.getElementById("team-message")
  const rating=document.getElementById("team-rating")
  const pageSize=6
  let currentPage=1

  function renderPeople() {
    const searchTerm=searchInput.value.trim().toLowerCase()
    const city=cityInput.value.trim().toLowerCase()
    const filteredMembers=members.filter(member => {
      const searchableText=`${member.name} ${member.role} ${member.team} ${member.city}`
      const matchesSearch=searchableText.toLowerCase().includes(searchTerm)
      const matchesCity=member.city.toLowerCase().includes(city)
      return matchesSearch&&matchesCity
    })

    const pageCount=Math.max(1,Math.ceil(filteredMembers.length/pageSize))
    currentPage=Math.min(currentPage,pageCount)
    pagination.pageCount=pageCount
    pagination.page=currentPage
    pagination.hidden=filteredMembers.length<=pageSize

    const startIndex=(currentPage-1)*pageSize
    const visibleMembers=filteredMembers.slice(startIndex,startIndex+pageSize)
    const cards=visibleMembers.map(createMemberCard)
    peopleGrid.replaceChildren(...cards)
    emptyState.hidden=filteredMembers.length!==0

    let summary=`${filteredMembers.length} teammates found`
    if(filteredMembers.length>0) {
      summary+=` / page ${currentPage} of ${pageCount}`
    }
    peopleCount.textContent=`${summary}.`
  }

  function filterPeople() {
    currentPage=1
    renderPeople()
  }

  function changePage() {
    currentPage=pagination.page
    renderPeople()
  }

  function updateReviewSummary() {
    m("#review-team-status").text(
      `${reviewTeam.value.length} people in your review circle. Selection is a local preview.`,
    )
  }

  function previewKudos(event) {
    event.preventDefault()

    const message=messageInput.value.trim()
    if(!message) {
      notify("Write a little note first.","info")
      messageInput.focus()
      return
    }

    m("#message-copy").text(`${message} (${rating.value} / 5 collaboration rating)`)
    document.getElementById("message-preview").hidden=false
    notify("Note previewed here. Nothing was sent.")
  }

  function describeDiscipline(event) {
    const selectedPath=event.detail.path
    document.getElementById("discipline-description").description=selectedPath.length
      ? `Your chosen path: ${selectedPath.join(" / ")}. Meet collaborators in the directory above.`
      :"Designers, builders, and thoughtful problem-solvers."
  }

  reviewTeam.options=members.slice(0,6).map((member,index) => ({
    value: String(index),
    label: member.name,
  }))
  reviewTeam.defaultValue=["0","1"]
  reviewTeam.value=["0","1"]

  m([searchInput,cityInput]).on("input",filterPeople)
  m(cityInput).on("m:select",filterPeople)
  m(pagination).on("m:change",changePage)
  m(reviewTeam).on("m:change",updateReviewSummary)
  m("#kudos-form").on("submit",previewKudos)
  m("#studio-discipline").on("m:cascader-change",describeDiscipline)

  renderPeople()
  updateReviewSummary()
})
