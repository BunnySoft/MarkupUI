globalThis.FieldnotesCatalog = (() => {
  const commonFamilies = [
    "layout", "box", "typography", "icon", "button", "card", "avatar", "tag",
    "badge", "menu", "breadcrumb", "page-header", "tooltip", "dropdown", "drawer",
    "message", "notification", "loading-bar", "back-top", "space", "flex", "grid",
    "divider", "global-style", "scrollbar",
  ]

  const pages = [
    {
      id: "overview",
      file: "index.html",
      title: "Overview",
      icon: "home",
      description: "A little space for your next big idea.",
      families: [
        "statistic", "number-animation", "progress", "calendar", "time", "timeline",
        "carousel", "gradient-text", "collapse-transition", "empty", "spin", "skeleton",
      ],
    },
    {
      id: "projects",
      file: "projects.html",
      title: "Projects",
      icon: "projects",
      description: "Good work starts with a clear plan.",
      families: [
        "data-table", "input", "select", "tabs", "steps", "checkbox", "dynamic-tags",
        "date-picker", "popconfirm", "tree", "tree-select", "split", "modal", "form",
      ],
    },
    {
      id: "team",
      file: "team.html",
      title: "Team",
      icon: "team",
      description: "The people who make it happen.",
      families: [
        "list", "thing", "pagination", "auto-complete", "cascader", "transfer",
        "mention", "rate", "input", "empty", "form",
      ],
    },
    {
      id: "insights",
      file: "insights.html",
      title: "Insights",
      icon: "chart",
      description: "A clearer picture of your progress.",
      families: [
        "chart", "heatmap", "countdown", "descriptions", "table", "popover",
        "popselect", "slider", "statistic", "progress",
      ],
    },
    {
      id: "library",
      file: "library.html",
      title: "Library",
      icon: "library",
      description: "Small discoveries. Shared inspiration.",
      families: [
        "image", "watermark", "ellipsis", "code", "highlight", "infinite-scroll",
        "virtual-list", "log", "anchor", "affix", "collapse", "marquee", "float-button", "input",
      ],
    },
    {
      id: "settings",
      file: "settings.html",
      title: "Settings",
      icon: "settings",
      description: "Make this space feel like yours.",
      families: [
        "form", "radio", "switch", "input-number", "time-picker", "dynamic-input",
        "input-otp", "upload", "color-picker", "result", "input", "select", "dialog", "alert",
      ],
    },
  ]

  function familiesFor(page) {
    return [...new Set([...commonFamilies, ...page.families])]
  }

  const allFamilies = [...new Set(pages.flatMap(familiesFor))]
  const styleOnlyFamilies = ["global-style", "scrollbar"]

  const coveredFamilies = allFamilies
    .filter(family => !styleOnlyFamilies.includes(family))
    .sort()

  return { pages, commonFamilies, coveredFamilies }
})()
