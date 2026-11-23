Fieldnotes.page("projects",function initialize() {
  const { notify,readLocal,saveLocal,showError }=Fieldnotes

  const initialProjects=[
    {
      key: "horizons",
      name: "New horizons",
      owner: "Alex Lee",
      status: "In progress",
      progress: 72,
      date: "2026-12-04",
    },
    {
      key: "guide",
      name: "Field guide",
      owner: "Morgan Kim",
      status: "In progress",
      progress: 46,
      date: "2026-12-11",
    },
    {
      key: "studio",
      name: "Open studio",
      owner: "Sam Rivera",
      status: "In review",
      progress: 89,
      date: "2026-11-30",
    },
    {
      key: "journal",
      name: "The studio journal",
      owner: "Jamie Davis",
      status: "Planning",
      progress: 12,
      date: "2026-12-18",
    },
    {
      key: "season",
      name: "A new season",
      owner: "Alex Lee",
      status: "Planning",
      progress: 8,
      date: "2027-01-08",
    },
    {
      key: "hello",
      name: "A better hello",
      owner: "Sam Rivera",
      status: "In progress",
      progress: 58,
      date: "2026-12-07",
    },
    {
      key: "patterns",
      name: "Patterns in nature",
      owner: "Morgan Kim",
      status: "In review",
      progress: 94,
      date: "2026-12-02",
    },
  ]

  const projectFiles={
    brief: {
      title: "Creative brief",
      content: "Make a brand that feels as thoughtful as the people behind it. Explore warm colors, generous space, and an optimistic voice.",
    },
    research: {
      title: "Research notes",
      content: "People come for clarity, and stay for a little personality. Keep navigation familiar, use native controls, and leave room to breathe.",
    },
    launch: {
      title: "Launch checklist",
      content: "Check small screens, keyboard navigation, image alternatives, and every destination. Then share the finished work with the team.",
    },
  }

  const projectTable=document.getElementById("project-table")
  const searchInput=document.getElementById("project-search")
  const statusFilter=document.getElementById("project-status")
  const projectSummary=document.getElementById("project-summary")
  const projectModal=document.getElementById("project-modal")
  const projectForm=document.getElementById("project-form")
  const nameInput=document.getElementById("project-name")
  const ownerSelect=document.getElementById("project-owner")
  const dueDatePicker=document.getElementById("project-due")
  const folderPicker=document.getElementById("project-folder")
  const projectLabels=document.getElementById("project-labels")
  const launchSteps=document.getElementById("launch-steps")
  const advanceButton=document.getElementById("advance-launch")
  const reviewCheckboxes=document.querySelectorAll('m-checkbox[name="launch-review"]')

  let projects=readLocal("projects",initialProjects)

  projectTable.options={
    columns: [
      { key: "name",label: "Project",sort: "text" },
      { key: "owner",label: "Lead",sort: "text" },
      { key: "status",label: "Status",sort: "text" },
      { key: "progress",label: "Progress (%)",sort: "number" },
      { key: "date",label: "Target date",sort: "text" },
    ],
    selection: { name: "projects",scope: "page" },
    pageSize: 5,
    pageSizes: [5,10,20],
  }

  function renderProjects() {
    const searchTerm=searchInput.value.trim().toLowerCase()
    const status=statusFilter.value
    const visibleProjects=projects.filter(project => {
      const searchableText=`${project.name} ${project.owner}`.toLowerCase()
      const matchesSearch=searchableText.includes(searchTerm)
      const matchesStatus=!status||project.status===status
      return matchesSearch&&matchesStatus
    })

    projectTable.data=visibleProjects.map(project => ({
      key: project.key,
      values: [
        project.name,
        project.owner,
        project.status,
        project.progress,
        project.date||"Not set",
      ],
    }))
    projectSummary.textContent=
      `${visibleProjects.length} of ${projects.length} projects. Select rows to archive them.`
  }

  function openProjectForm() {
    projectModal.open=true
    nameInput.focus()
  }

  function createProject(event) {
    event.preventDefault()

    try {
      const name=nameInput.value.trim()
      if(!name) {
        nameInput.setCustomValidity("Give this project a name, not only spaces.")
        nameInput.reportValidity()
        return
      }

      const newProject={
        key: crypto.randomUUID(),
        name,
        owner: ownerSelect.value,
        status: "Planning",
        progress: 0,
        date: dueDatePicker.value,
        folder: folderPicker.value,
        labels: [...projectLabels.values],
      }
      const updatedProjects=[...projects,newProject]
      saveLocal("projects",updatedProjects)
      projects=updatedProjects

      searchInput.value=""
      statusFilter.value=""
      renderProjects()
      projectModal.open=false
      projectForm.reset()
      projectLabels.clear()
      notify(`"${name}" is ready to grow. Saved in this browser.`)
    } catch(error) {
      showError(error)
    }
  }

  function archiveSelectedProjects() {
    const selectedKeys=new Set(projectTable.checkedKeys)
    if(selectedKeys.size===0) {
      notify("Select at least one project first.","info")
      return
    }

    try {
      const remainingProjects=projects.filter(project => !selectedKeys.has(project.key))
      saveLocal("projects",remainingProjects)
      projects=remainingProjects
      renderProjects()

      const projectLabel=selectedKeys.size===1? "project":"projects"
      notify(`${selectedKeys.size} ${projectLabel} archived from this browser.`)
    } catch(error) {
      showError(error)
    }
  }

  function completeLaunchStep() {
    if(launchSteps.current<launchSteps.steps.length) {
      launchSteps.current+=1
      notify("Next stop: share it with the world.")
    } else {
      launchSteps.status="finish"
      advanceButton.disabled=true
      notify("All launch steps completed in this preview.")
    }
  }

  function updateChecklist() {
    const checkedCount=[...reviewCheckboxes].filter(checkbox => checkbox.checked).length
    m("#checklist-status").text(
      `${checkedCount} of ${reviewCheckboxes.length} finishing touches complete.`,
    )
  }

  function showProjectFile(event) {
    const file=projectFiles[event.detail.key]
    if(file) {
      m("#file-title").text(file.title)
      m("#file-content").text(file.content)
    }
  }

  m(searchInput)
    .on("input",renderProjects)
    .on("m:input-clear",renderProjects)
  m(statusFilter).on("change",renderProjects)
  m(projectForm).on("submit",createProject)
  m(nameInput).on("input",() => {
    nameInput.setCustomValidity("")
  })
  m("#new-project").on("click",openProjectForm)
  m("#cancel-project").on("click",() => {
    projectModal.open=false
  })
  m("#archive-projects").on("m:positive-click",archiveSelectedProjects)
  m("#project-files").on("m:tree-select",showProjectFile)
  m(advanceButton).on("click",completeLaunchStep)
  m(reviewCheckboxes).on("change",updateChecklist)

  renderProjects()
})
