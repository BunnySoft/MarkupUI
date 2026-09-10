export const componentGroups = [
  { name: "Common Components", items: [
    ["avatar", "Avatar"], ["button", "Button"], ["card", "Card"], ["carousel", "Carousel"],
    ["collapse", "Collapse"], ["divider", "Divider"], ["dropdown", "Dropdown"], ["ellipsis", "Ellipsis"],
    ["gradient-text", "Gradient Text"], ["icon", "Icon"], ["page-header", "Page Header"], ["tag", "Tag"],
    ["typography", "Typography"], ["watermark", "Watermark"], ["float-button", "Float Button"],
  ] },
  { name: "Data Input Components", items: [
    ["auto-complete", "Auto Complete"], ["cascader", "Cascader"], ["color-picker", "Color Picker"],
    ["checkbox", "Checkbox"], ["date-picker", "Date Picker"], ["dynamic-input", "Dynamic Input"],
    ["dynamic-tags", "Dynamic Tags"], ["form", "Form"], ["input", "Input"], ["input-number", "Input Number"],
    ["input-otp", "Input OTP"], ["mention", "Mention"], ["radio", "Radio"], ["rate", "Rate"],
    ["select", "Select"], ["slider", "Slider"], ["switch", "Switch"], ["time-picker", "Time Picker"],
    ["transfer", "Transfer"], ["tree-select", "Tree Select"], ["upload", "Upload"],
  ] },
  { name: "Data Display Components", items: [
    ["calendar", "Calendar"], ["countdown", "Countdown"], ["code", "Code"], ["data-table", "Data Table"],
    ["descriptions", "Descriptions"], ["empty", "Empty"], ["equation", "Equation"], ["image", "Image"],
    ["list", "List"], ["log", "Log"], ["number-animation", "Number Animation"], ["qr-code", "QR Code"],
    ["statistic", "Statistic"], ["table", "Table"], ["thing", "Thing"], ["time", "Time"],
    ["timeline", "Timeline"], ["tree", "Tree"], ["infinite-scroll", "Infinite Scroll"],
    ["highlight", "Highlight"], ["heatmap", "Heatmap"],
  ] },
  { name: "Navigation Components", items: [
    ["affix", "Affix"], ["anchor", "Anchor"], ["back-top", "Back Top"], ["breadcrumb", "Breadcrumb"],
    ["loading-bar", "Loading Bar"], ["menu", "Menu"], ["pagination", "Pagination"],
    ["steps", "Steps"], ["tabs", "Tabs"],
  ] },
  { name: "Feedback Components", items: [
    ["alert", "Alert"], ["badge", "Badge"], ["dialog", "Dialog"], ["drawer", "Drawer"],
    ["marquee", "Marquee"], ["message", "Message"], ["modal", "Modal"], ["notification", "Notification"],
    ["popconfirm", "Popconfirm"], ["popover", "Popover"], ["popselect", "Popselect"],
    ["progress", "Progress"], ["result", "Result"], ["skeleton", "Skeleton"], ["spin", "Spin"],
    ["tooltip", "Tooltip"],
  ] },
  { name: "Layout Components", items: [
    ["flex", "Flex"], ["layout", "Layout"], ["legacy-grid", "Legacy Grid"], ["grid", "Grid"],
    ["space", "Space"], ["split", "Split"],
  ] },
  { name: "Utility Components", items: [
    ["collapse-transition", "Collapse Transition"], ["discrete", "Discrete API"],
    ["scrollbar", "Scrollbar"], ["virtual-list", "Virtual List"],
  ] },
  { name: "Config Components", items: [
    ["config-provider", "Config Provider"], ["element", "Element"], ["global-style", "Global Style"],
  ] },
  { name: "Deprecated Components", items: [["legacy-transfer", "Legacy Transfer"]] },
]

export const components = componentGroups.flatMap(group =>
  group.items.map(([slug, name]) => ({ slug, name, category: group.name })),
)
