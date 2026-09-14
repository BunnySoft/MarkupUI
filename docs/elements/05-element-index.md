# 5. Complete MarkupUI element directory

This directory documents all elements available in MarkupUI, categorized by their implementation
type (**HTML Direct Map** vs. **Custom Element** vs. **Companion Region**) and platform mapping.

## Overview summary

| Type Flag | Count | Purpose |
| --- | ---: | --- |
| **HTML Direct Map** | 23 | Direct platform-independent replacements for basic HTML tags (`div`, `span`, `label`, etc.) with typed layout attributes. |
| **Custom Element** | 68 | Modernized standalone UI widgets with direct property and event contracts. |
| **Companion Region** | 10 | Structured layout sub-regions (e.g. headers, sidebars, panes) owned by their parent component. |

---

## Complete element directory table

| Element Tag | Type Flag | HTML Equivalent | Native Target (SwiftUI / Flutter / CLI) | Family | Description |
|---|---|---|---|---|---|
| `<m-box>` | **HTML Direct Map** | `div` | VStack / HStack / Box | Box | Generic block/flex/grid container with typed layout attributes |
| `<m-div>` | **HTML Direct Map** | `div` | Box / Container | Box | Direct semantic alias to HTML div |
| `<m-span>` | **HTML Direct Map** | `span` | Text / Span | Box | Generic inline phrasing container |
| `<m-p>` | **HTML Direct Map** | `p` | Text paragraph | Typography | Text paragraph block with normalized spacing |
| `<m-label>` | **HTML Direct Map** | `label` | Label | Box | Form control label with click delegation |
| `<m-strong>` | **HTML Direct Map** | `strong` | Bold text | Box | Importance / bold weight inline phrasing |
| `<m-em>` | **HTML Direct Map** | `em` | Italic text | Box | Emphasis / italicized inline phrasing |
| `<m-small>` | **HTML Direct Map** | `small` | Caption text | Box | Fine print, annotations and side comments |
| `<m-pre>` | **HTML Direct Map** | `pre` | Monospace block | Box | Preformatted text block preserving whitespace |
| `<m-code>` | **HTML Direct Map** | `code` | Monospace text | Code | Inline or block code fragment |
| `<m-details>` | **HTML Direct Map** | `details` | DisclosureGroup | Box | Disclosure container with toggle state sync |
| `<m-summary>` | **HTML Direct Map** | `summary` | Disclosure header | Box | Disclosure trigger and header caption |
| `<m-heading>` | **HTML Direct Map** | `h1-h6` | Heading text | Typography | Semantic heading with configurable level 1-6 |
| `<m-a>` | **HTML Direct Map** | `a` | Link / NavigationLink | Typography | Hyperlink navigation element |
| `<m-link>` | **HTML Direct Map** | `a` | Link / NavigationLink | Typography | Styled inline hyperlink with routing semantics |
| `<m-divider>` | **HTML Direct Map** | `hr` | Divider | Divider | Thematic break / separator rule with optional title |
| `<m-article>` | **HTML Direct Map** | `article` | Container | Box | Self-contained composition container |
| `<m-footer>` | **HTML Direct Map** | `footer` | Container | Box | Footer region for cards or layouts |
| `<m-blockquote>` | **HTML Direct Map** | `blockquote` | Quote block | Typography | Block quotation with border highlight |
| `<m-ul>` | **HTML Direct Map** | `ul` | VStack list | Typography | Unordered list container |
| `<m-ol>` | **HTML Direct Map** | `ol` | Ordered list | Typography | Ordered list container with numbering |
| `<m-option>` | **HTML Direct Map** | `option` | Picker item | Select / AutoComplete | Option item for select, popselect and autocomplete |
| `<m-textarea>` | **HTML Direct Map** | `textarea` | TextEditor | Input | Multiline text editing field |
| `<m-avatar>` | **Custom Element** | `Custom widget` | Image / Avatar | Avatar | Profile image, icon, or letter avatar with fallback |
| `<m-avatar-group>` | **Custom Element** | `Custom widget` | HStack of Avatars | Avatar | Overlapping group container for multiple avatars |
| `<m-button>` | **Custom Element** | `Custom widget` | Button | Button | Interactive button with types, sizes, shapes and loading |
| `<m-button-group>` | **Custom Element** | `Custom widget` | ControlGroup / Row | Button | Segmented button group container |
| `<m-card>` | **Custom Element** | `Custom widget` | Card / Panel | Card | Container panel with title, cover, and structured sections |
| `<m-carousel>` | **Custom Element** | `Custom widget` | TabView(PageTabViewStyle) | Carousel | Paged carousel with indicators and autoplay |
| `<m-collapse>` | **Custom Element** | `Custom widget` | Accordion / List | Collapse | Accordion / collapsible item group |
| `<m-collapse-item>` | **Custom Element** | `Custom widget` | DisclosureGroup | Collapse | Single collapsible panel item |
| `<m-collapse-transition>` | **Custom Element** | `Custom widget` | Animated visibility | Collapse Transition | Smooth height animation wrapper |
| `<m-dropdown>` | **Custom Element** | `Custom widget` | Menu | Dropdown | Dropdown popup menu triggered by an action |
| `<m-ellipsis>` | **Custom Element** | `Custom widget` | Line-clamped Text | Ellipsis | Single or multi-line text truncation with tooltip/expand |
| `<m-gradient-text>` | **Custom Element** | `Custom widget` | Text with LinearGradient | Gradient Text | Text rendered with clipped gradient fill |
| `<m-icon>` | **Custom Element** | `Custom widget` | Image(systemName:) | Icon | Vector SVG or glyph icon wrapper |
| `<m-icon-wrapper>` | **Custom Element** | `Custom widget` | Circle / Rounded background | Icon | Colored circular/square badge background for icons |
| `<m-page-header>` | **Custom Element** | `Custom widget` | NavigationBar / Header | Page Header | Top header with back button, breadcrumb and actions |
| `<m-tag>` | **Custom Element** | `Custom widget` | Chip / Tag | Tag | Compact label tag with checkable and closable modes |
| `<m-typography>` | **Custom Element** | `Custom widget` | Text container | Typography | Typographic wrapper applying design system text styling |
| `<m-watermark>` | **Custom Element** | `Custom widget` | Overlay pattern | Watermark | Background security or status watermark tile pattern |
| `<m-float-button>` | **Custom Element** | `Custom widget` | FloatingActionButton | Float Button | Circular/square floating action button pinned to viewport |
| `<m-float-button-group>` | **Custom Element** | `Custom widget` | FloatingStack | Float Button | Group container for floating action buttons |
| `<m-auto-complete>` | **Custom Element** | `Custom widget` | TextField with suggestions | Auto Complete | Text input with autocomplete suggestion list |
| `<m-cascader>` | **Custom Element** | `Custom widget` | Cascading Picker | Cascader | Multi-level hierarchical selection popup |
| `<m-color-picker>` | **Custom Element** | `Custom widget` | ColorPicker | Color Picker | Color selection with hex, rgb, and alpha support |
| `<m-checkbox>` | **Custom Element** | `Custom widget` | Toggle / Checkbox | Checkbox | Binary checkbox with indeterminate state support |
| `<m-checkbox-group>` | **Custom Element** | `Custom widget` | VStack of Toggles | Checkbox | Multi-select checkbox collection with value binding |
| `<m-date-picker>` | **Custom Element** | `Custom widget` | DatePicker | Date Picker | Calendar date selection dropdown |
| `<m-dynamic-input>` | **Custom Element** | `Custom widget` | Editable list | Dynamic Input | Editable array of inputs with add/remove/reorder |
| `<m-dynamic-tags>` | **Custom Element** | `Custom widget` | Editable chip input | Dynamic Tags | Interactive tag list with input creation and removal |
| `<m-form>` | **Custom Element** | `Custom widget` | Form container | Form | Form layout and constraint validation controller |
| `<m-form-item>` | **Custom Element** | `Custom widget` | FormField row | Form | Form field row binding label, control and feedback |
| `<m-form-item-gi>` | **Custom Element** | `Custom widget` | Grid FormField | Form | Grid-integrated form item cell |
| `<m-input>` | **Custom Element** | `Custom widget` | TextField | Input | Single-line text input with clear, password and count |
| `<m-input-group>` | **Custom Element** | `Custom widget` | HStack field group | Input | Horizontal composite input group |
| `<m-input-group-label>` | **Custom Element** | `Custom widget` | Field label prefix/suffix | Input | Prefix or suffix label in an input group |
| `<m-input-number>` | **Custom Element** | `Custom widget` | Stepper / NumberField | Input Number | Numeric input with step buttons, min/max and precision |
| `<m-input-otp>` | **Custom Element** | `Custom widget` | PinEntryField | Input OTP | One-time password segmented character boxes |
| `<m-mention>` | **Custom Element** | `Custom widget` | MentionEditor | Mention | Textarea with @ or custom prefix trigger popup |
| `<m-radio>` | **Custom Element** | `Custom widget` | RadioButton | Radio | Single exclusive radio option |
| `<m-radio-button>` | **Custom Element** | `Custom widget` | Segmented button | Radio | Button-styled radio option |
| `<m-radio-group>` | **Custom Element** | `Custom widget` | Picker / RadioGroup | Radio | Radio group managing single selection |
| `<m-rate>` | **Custom Element** | `Custom widget` | RatingView (stars) | Rate | Star rating control with half-star increments |
| `<m-select>` | **Custom Element** | `Custom widget` | Picker / Dropdown | Select | Single or multiple item selection dropdown |
| `<m-slider>` | **Custom Element** | `Custom widget` | Slider | Slider | Numeric range track with thumb dragging |
| `<m-switch>` | **Custom Element** | `Custom widget` | Toggle / Switch | Switch | Two-state toggle switch with loading indicator |
| `<m-time-picker>` | **Custom Element** | `Custom widget` | TimePicker | Time Picker | Hours, minutes and seconds selection panel |
| `<m-transfer>` | **Custom Element** | `Custom widget` | Dual list transfer | Transfer | Dual-column transfer list between available and chosen |
| `<m-tree-select>` | **Custom Element** | `Custom widget` | Hierarchical Picker | Tree Select | Tree-structured selection dropdown |
| `<m-upload>` | **Custom Element** | `Custom widget` | FilePicker / Dropzone | Upload | File upload control with drag-and-drop and progress |
| `<m-calendar>` | **Custom Element** | `Custom widget` | CalendarView | Calendar | Full calendar month grid with event markers |
| `<m-countdown>` | **Custom Element** | `Custom widget` | Countdown timer | Countdown | High-precision elapsed/remaining time counter |
| `<m-data-table>` | **Custom Element** | `Custom widget` | TableView / DataGrid | Data Table | Advanced data grid with sorting, filtering, and selection |
| `<m-descriptions>` | **Custom Element** | `Custom widget` | Form / KeyValue grid | Descriptions | Definition list / property inspector layout |
| `<m-description-item>` | **Custom Element** | `Custom widget` | LabeledContent | Descriptions | Single labeled key-value item |
| `<m-empty>` | **Custom Element** | `Custom widget` | ContentUnavailableView | Empty | Placeholder for empty or no-data states |
| `<m-heatmap>` | **Custom Element** | `Custom widget` | Heatmap grid | Heatmap | Calendar/matrix contribution density map |
| `<m-highlight>` | **Custom Element** | `Custom widget` | Highlighted Text | Highlight | Text container highlighting search keyword matches |
| `<m-image>` | **Custom Element** | `Custom widget` | AsyncImage / ImageView | Image | Image element with loading, preview modal and fallback |
| `<m-image-group>` | **Custom Element** | `Custom widget` | Gallery preview | Image | Group container enabling cross-image lightbox navigation |
| `<m-infinite-scroll>` | **Custom Element** | `Custom widget` | LazyVStack with paging | Infinite Scroll | Scroll sentinel triggering progressive page loading |
| `<m-list>` | **Custom Element** | `Custom widget` | List | List | Vertical list container with dividers and headers |
| `<m-list-item>` | **Custom Element** | `Custom widget` | List row | List | Single row item in a list |
| `<m-log>` | **Custom Element** | `Custom widget` | Terminal / LogView | Log | High-performance virtualized stream log viewer |
| `<m-marquee>` | **Custom Element** | `Custom widget` | Ticker / Marquee | Marquee | Continuous looping text or content scroller |
| `<m-number-animation>` | **Custom Element** | `Custom widget` | Animated Text | Number Animation | Smooth animated transition between numbers |
| `<m-statistic>` | **Custom Element** | `Custom widget` | Metric card | Statistic | Dashboard KPI metric value with prefix/suffix |
| `<m-table>` | **Custom Element** | `Custom widget` | Table | Table | Styled semantic tabular container |
| `<m-thing>` | **Custom Element** | `Custom widget` | Card row / Feed item | Thing | Structured entity card with avatar, title, description, actions |
| `<m-time>` | **Custom Element** | `Custom widget` | Relative timestamp | Time | Formatted relative or absolute time display |
| `<m-timeline>` | **Custom Element** | `Custom widget` | Timeline | Timeline | Vertical chronological activity feed |
| `<m-timeline-item>` | **Custom Element** | `Custom widget` | Timeline node | Timeline | Single event node on a timeline |
| `<m-tree>` | **Custom Element** | `Custom widget` | OutlineGroup | Tree | Hierarchical folder/node tree with expand and check |
| `<m-tree-node>` | **Custom Element** | `Custom widget` | TreeNode | Tree | Single expandable branch or leaf in a tree |
| `<m-affix>` | **Custom Element** | `Custom widget` | Sticky container | Affix | Sticky viewport element pinned at top or bottom offsets |
| `<m-anchor>` | **Custom Element** | `Custom widget` | Table of Contents | Anchor | Scroll-spy navigation bar tracking in-page section targets |
| `<m-anchor-link>` | **Custom Element** | `Custom widget` | ToC link | Anchor | Link item inside an anchor navigation bar |
| `<m-back-top>` | **Custom Element** | `Custom widget` | ScrollToTop button | Back Top | Button appearing after scrolling to return to top |
| `<m-breadcrumb>` | **Custom Element** | `Custom widget` | Breadcrumb / Path | Breadcrumb | Breadcrumb trail showing hierarchical location |
| `<m-breadcrumb-item>` | **Custom Element** | `Custom widget` | Breadcrumb node | Breadcrumb | Single step in a breadcrumb trail |
| `<m-loading-bar>` | **Custom Element** | `Custom widget` | Indeterminate bar | Loading Bar | Top-edge linear activity progress bar |
| `<m-menu>` | **Custom Element** | `Custom widget` | Sidebar / Menu | Menu | Vertical or horizontal application navigation menu |
| `<m-menu-item>` | **Custom Element** | `Custom widget` | Menu row | Menu | Single selectable menu item |
| `<m-menu-group>` | **Custom Element** | `Custom widget` | Menu section | Menu | Titled section grouping menu items |
| `<m-menu-divider>` | **Custom Element** | `Custom widget` | Divider | Menu | Separator line between menu groups |
| `<m-pagination>` | **Custom Element** | `Custom widget` | Pager | Pagination | Page number selector and jumper controls |
| `<m-steps>` | **Custom Element** | `Custom widget` | StepProgressBar | Steps | Multi-stage workflow progression indicator |
| `<m-step>` | **Custom Element** | `Custom widget` | Step node | Steps | Single milestone step in a multi-stage flow |
| `<m-tabs>` | **Custom Element** | `Custom widget` | TabView | Tabs | Tabbed container switching active panels |
| `<m-tab-pane>` | **Custom Element** | `Custom widget` | Tab content | Tabs | Single panel of content associated with a tab |
| `<m-alert>` | **Custom Element** | `Custom widget` | Alert banner | Alert | Notice banner for informative, warning or error alerts |
| `<m-badge>` | **Custom Element** | `Custom widget` | Badge overlay | Badge | Numeric count or status dot overlay for targets |
| `<m-dialog>` | **Custom Element** | `Custom widget` | Alert dialog | Dialog | Modal prompt dialog requiring user confirmation |
| `<m-drawer>` | **Custom Element** | `Custom widget` | Sheet / Slideover | Drawer | Sliding side drawer panel from viewport edge |
| `<m-message>` | **Custom Element** | `Custom widget` | Toast notification | Message | Temporary floating toast notice |
| `<m-modal>` | **Custom Element** | `Custom widget` | Modal window | Modal | Full modal overlay dialog window |
| `<m-notification>` | **Custom Element** | `Custom widget` | Notification card | Notification | Desktop/corner floating rich notification card |
| `<m-popconfirm>` | **Custom Element** | `Custom widget` | Confirmation popover | Popconfirm | Action confirmation popover pinned to trigger |
| `<m-popover>` | **Custom Element** | `Custom widget` | Popover | Popover | Rich content popover panel pinned to an anchor |
| `<m-popselect>` | **Custom Element** | `Custom widget` | Picker popover | Popselect | Selection dropdown rendered inside a popover |
| `<m-progress>` | **Custom Element** | `Custom widget` | ProgressView | Progress | Linear or circular percentage progress indicator |
| `<m-result>` | **Custom Element** | `Custom widget` | Result page | Result | Outcome page for success, 404, 500 and error states |
| `<m-skeleton>` | **Custom Element** | `Custom widget` | Shimmer placeholder | Skeleton | Content placeholder simulating data loading |
| `<m-spin>` | **Custom Element** | `Custom widget` | ProgressView(circular) | Spin | Spinning loading indicator wrapper |
| `<m-tooltip>` | **Custom Element** | `Custom widget` | Tooltip / Help tag | Tooltip | Informational text hover tip |
| `<m-flex>` | **Custom Element** | `Custom widget` | VStack / HStack | Flex | Flexbox layout container with alignment and spacing |
| `<m-grid>` | **Custom Element** | `Custom widget` | LazyVGrid / Grid | Grid | 2D CSS grid layout container |
| `<m-grid-item>` | **Custom Element** | `Custom widget` | Grid cell | Grid | Item cell inside a grid with column spanning |
| `<m-layout>` | **Custom Element** | `Custom widget` | NavigationSplitView | Layout | Full-page header/sider/content layout framework |
| `<m-layout-header>` | **Companion Region** | `header` | Header bar | Layout | Top header region of an application layout |
| `<m-layout-sider>` | **Companion Region** | `aside` | Sidebar | Layout | Side navigation panel of an application layout |
| `<m-layout-content>` | **Companion Region** | `main` | Main workspace | Layout | Main content workspace of an application layout |
| `<m-layout-footer>` | **Companion Region** | `footer` | Footer bar | Layout | Bottom footer region of an application layout |
| `<m-space>` | **Custom Element** | `Custom widget` | Stack with spacing | Space | Inline or block flex container distributing space between items |
| `<m-split>` | **Custom Element** | `Custom widget` | HSplitView / VSplitView | Split | Draggable split pane container |
| `<m-split-pane>` | **Companion Region** | `div` | Split pane view | Split | Individual resizable pane in a split container |
| `<m-virtual-list>` | **Custom Element** | `Custom widget` | LazyVStack | Virtual List | High-performance viewport virtualized scroller |
