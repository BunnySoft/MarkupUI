# Naive UI reference and MarkupUI migration plan

This is a **proposal and migration inventory, not a shipped compatibility layer**.
Explicitly Verified retained targets, currently Avatar/Avatar Group in `9afc818`,
Button/ButtonGroup in `43dd57f`, Card in `cebc6d7`, Tag in `6605d29`, Badge in
`69c9480`, Alert in `2a1eb42`, Empty in `27a435b`, Skeleton in `05c6546`, Spin in `6c7f35b`, Progress in `8d7757c`, Statistic in `1ed3a98`, Typography in `53d3974`, Icon in `829970d`, Gradient Text in `38dcf6f`, Ellipsis in `5fabe7f`, Page Header in `5f9faf3`, Divider in `2e1a6c0`, Flex in `720a92c`, Space in `d495a12`, and Grid's, Layout's, List's, Descriptions', Timeline's, Breadcrumb's, Thing's, Table's, Highlight's, Affix's, Result's, Code's, Scrollbar's, Float Button's and Image's linked retained records have implementation and acceptance evidence; the remaining
catalog must not inherit that status.
Popover now also has a [Verified retained native foundation](../components/popover.md);
Tooltip now also has an [accepted descriptive scope](../components/tooltip.md).
Popconfirm now also has an [accepted native action scope](../components/popconfirm.md).
Dropdown now also has an [accepted native command-menu scope](../components/dropdown.md).
Menu now also has an [accepted native navigation/disclosure scope](../components/menu.md).
Tabs and its paired Tab/TabPane scope now have [accepted evidence](../components/tabs.md).
Collapse/CollapseItem now also have [accepted native disclosure evidence](../components/collapse.md).
Anchor/AnchorLink now also have [accepted native scrollspy evidence](../components/anchor.md).
Back Top now also has [accepted native return/threshold evidence](../components/back-top.md).
Pagination now also has [accepted bounded native paging evidence](../components/pagination.md).
Steps/Step now also have [accepted native progress/intent evidence](../components/steps.md).
Loading Bar now also has [accepted root-owned native lifecycle evidence](../components/loading-bar.md).
Dialog now also has [accepted native lifetime/decision evidence](../components/dialog.md).
Modal now also has [accepted generic native top-layer evidence](../components/modal.md).
Drawer/DrawerContent now also have [accepted native edge-panel evidence](../components/drawer.md).
Message now also has [accepted bounded root-owned feedback evidence](../components/message.md).
Notification now also has [accepted native card/guarded-close evidence](../components/notification.md).
Collapse Transition now also has [accepted optional native-motion evidence](../components/collapse-transition.md).
Discrete API now has an [accepted explicit composition resolution](../components/discrete.md), with no new runtime.
Input/textarea/InputGroup/InputGroupLabel now have an [accepted native control contract](../components/input.md).
Checkbox/CheckboxGroup now have [accepted native selection and limit evidence](../components/checkbox.md).
Radio/RadioGroup/RadioButton now have [accepted native exclusivity and peer-boundary evidence](../components/radio.md).
Switch now has [accepted native binary/focus-safe-loading evidence](../components/switch.md).
Select now has [accepted native selection/clear/literal-list-filter evidence](../components/select.md), with rich P5 exclusions.
Input Number now has [accepted native numeric/stepping/nullable-draft evidence](../components/input-number.md).
Slider now has [accepted native range/two-track-pair/readout evidence](../components/slider.md).
Rate now has [accepted native integer/half/clear/static-readonly evidence](../components/rate.md), reusing Radio.
Form/FormItem/FormItemGi now have [accepted native validation/feedback/grid evidence](../components/form.md), without owning native custom validity or submission.
Auto Complete now has [accepted native datalist/bounded-loader evidence](../components/auto-complete.md), with honest native keyboard/selection limitations.
Input OTP now has [accepted native single-field/completion evidence](../components/input-otp.md), without code payloads, per-cell editing or authentication effects.
Dynamic Input now has [accepted bounded native-row/template evidence](../components/dynamic-input.md), with explicit resources and focus-safe actual-node moves.
Dynamic Tags now has [accepted native string-tag/editor evidence](../components/dynamic-tags.md), reusing that collection without Tag/Input runtimes or hidden proxies.
Mention now has [accepted native caret-snapshot/insertion evidence](../components/mention.md), with adjacent native choice buttons rather than a caret mirror or fake combobox.
Color Picker now has [accepted classic native RGB/draft evidence](../components/color-picker.md), without null/alpha/gamut flattening or owned dialog state.
Date Picker now has [accepted native calendar/wall-clock/range evidence](../components/date-picker.md), without implicit timestamps, timezone shifts or linked-bound mutation.
Time Picker now has [accepted native time-only/overnight-bound evidence](../components/time-picker.md), with no hidden date anchor or timezone conversion.
Virtual List now has [accepted fixed-height/native-window evidence](../components/virtual-list.md), with stable keys, one focused pin and bounded native DOM.
Tree now has [accepted native-outline/hierarchy evidence](../components/tree.md), with distinct native selection/checking, disabled cascade barriers and guarded lazy nodes.
Cascader now has [accepted native dependent-select/path evidence](../components/cascader.md), with captured-default reconstruction, real form gates and guarded passive-source loading.
Tree Select now has [accepted native path-aware single/multiple evidence](../components/tree-select.md), composing the hierarchy index and one Select owner with selection-preserving handoff.
Transfer now has [accepted native membership/staging evidence](../components/transfer.md), with locked/bulk movement, explicit formdata ownership and non-resurrecting handoff.
Data Table now has [accepted native stable-row/table evidence](../components/data-table.md), with explicit sort/filter/page/selection scopes and whole-form reveal before validation.
Log now has [accepted bounded native retained-text evidence](../components/log.md), with literal append/retention, stable line nodes, selection protection and conditional follow.
Infinite Scroll now has [accepted native sentinel/request-permission evidence](../components/infinite-scroll.md), with bounded automatic loading, guarded commits and serialized cancellation.
Popselect now has [accepted native selection-disclosure evidence](../components/popselect.md), composing Popover/Select without a second value or option-rendering model.
Split now has [accepted native pane/separator evidence](../components/split.md), with pointer/keyboard parity, explicit ratio/pixel bounds and safe native collapse/print behavior.
Config Provider now has an [accepted native scoped composition resolution](../components/config-provider.md):
external CSS/native lang/dir/explicit options, without a new provider runtime or bundle.
Element now has an [accepted native authoring resolution](../components/element.md):
real semantic tags/children and explicit token consumption, with no wrapper/runtime.
Global Style now has an [accepted explicit document stylesheet](../components/global-style.md):
661 raw/310 gzip bytes of opt-in low-specificity CSS, with no runtime or automatic import.
Carousel/CarouselItem now have [accepted native scroll-snap evidence](../components/carousel.md):
original slides, settled/current targets, wrap commands and explicitly gated autoplay,
with no cloned infinite track or custom gesture/effect engine.
Watermark now has [accepted native Canvas/overlay evidence](../components/watermark.md):
one bounded decorative tile, caller-owned images, guarded generation and untouched
native content, with no anti-tamper or security claim.
Upload/UploadTrigger/UploadDragger now have [accepted native queue evidence](../components/upload.md):
real FileList/FormData, bounded caller transport, honest cancellation slots and native
template rows, without implicit backend, preview/download or async-veto machinery.
Calendar now has [accepted native Gregorian table evidence](../components/calendar.md):
canonical date-only values, bounded month/year arithmetic, roving native buttons,
explicit Today/week-start policy and atomic literal annotations, without a grid-role/
timestamp/provider claim.
Time now has [accepted native instant-formatting evidence](../components/time.md):
pure Intl formatting, explicit Date/epoch units and paired native time/text ownership,
with opt-in bounded relative refresh rather than a token/provider/clock framework.
Countdown now has [accepted native elapsed-duration evidence](../components/countdown.md):
timestamp-derived remaining time, explicit pause/reset/current value, native text/unit
targets and finish-once delivery, without wall-clock alarm or VNode-renderer claims.
Number Animation now has [accepted native finite-number evidence](../components/number-animation.md):
overflow-safe monotonic interpolation, exact endpoints, native Intl text, reduced-motion
settlement and explicit interruption/ownership without an animation/provider framework.
Heatmap now has [accepted native calendar-data evidence](../components/heatmap.md):
bounded date-only week cells, missing-versus-zero/domain/band rules, native value/legend
text and one-tab-stop inspection, without a chart/Tooltip/provider renderer.
Marquee now has [accepted single-track native-motion evidence](../components/marquee.md):
one original bounded track, opt-in controlled alternating traversal and full native
static reading, without clones, seamless loops or an animation/renderer dependency.
**P3 is Verified for retained native scopes:** all 22 P3-assigned pages and their 1,086 rows
are reconciled. **P4 is Verified for retained native scopes:** all 17 assigned routes,
984 tracker rows and 68 page tasks are resolved, with no Planned P4 routes or unresolved
retained rows. **P5 is Verified for retained native scopes:** all ten assigned routes,
827 rows and 40 page tasks are resolved: 349 adapted, 478 omitted, zero unresolved.
P0 architecture, exclusion-route acceptance and full framework parity remain independent.
The three P0 catalog routes are resolved, and the related Discrete audit remains accepted
under P3; broader foundation task IDs are not automatically completed.
**All nine main P6 retained routes are accepted:** Carousel, Watermark, Upload,
Calendar, Time, Countdown, Number Animation, Heatmap and Marquee. Their **288 rows
= 199 native adaptations + 89 omissions**, with **36/36 tasks**, are reconciled;
omitted advanced behavior is not implemented parity. Equation, QR Code, Legacy Grid
and Legacy Transfer still have **16 unchecked alternative-guidance tasks** despite
their 35 explicitly omitted API rows. **Recommend Equation resolution next**, using
authored native MathML as a possible no-parser alternative; it is not started here.
Component acceptance sections below retain their sign-off snapshots; earlier counts and
“next”/“In progress” statements are historical, not the current phase dashboard.
Read the [architecture and status definitions](architecture.md) before implementing a tracker row.
Use the [master migration plan](migration-plan.md) for phase dependencies and current execution
evidence. Every component page now includes its own numbered task checklist, prerequisites and next task.
The target remains a minimal classic HTML/JavaScript/CSS library: **zero runtime dependencies,
native semantic HTML, light DOM, external presentation, no Vue/JSX/VDOM/CSS-in-JS or
framework-prop passthrough**. No component implementation is added by these documents.

## Provenance and scope

- Reference: Naive UI **2.45.3**, commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2), reviewed 2026-09-07.
- Catalog authority: pinned [official menu source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/demo/store/menu-options.js).
  It defines **96 routes in nine categories**. One document represents one route;
  companion APIs remain sections within that document. The pinned
  [route definitions](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/demo/routes/routes.js)
  provide a second catalog cross-check.
- Public API authority: each route's pinned `src/<route>/demos/enUS/index.demo-entry.md`,
  with line-linked rows and explicitly expanded inheritance. The live
  [official website](https://www.naiveui.com/en-US/os-theme/components/button) is a convenience
  reference and may change after this snapshot. Research rendered the live SPA despite an
  HTTP 404 response; immutable repository Markdown remains the API authority.
- Original MarkupUI comparison baseline: `5dcb190`, package 0.11.0. Avatar's later retained
  implementation is `9afc818`, Button's is `43dd57f`, Card's is `cebc6d7`, and Tag's is `6605d29`;
  Badge's, Alert's, Empty's, Skeleton's, Spin's, Progress's, Statistic's, Typography's, Icon's, Gradient Text's, Ellipsis's, Page Header's, Divider's, Flex's, Space's, Grid's, Layout's, List's, Descriptions', Timeline's, Breadcrumb's, Thing's, Table's, Highlight's, Affix's, Result's, Code's, Scrollbar's, Float Button's and Image's retained implementation/evidence are linked below; other unreviewed slices
  retain the historical baseline.
  Evidence links point to
  [core registry](../../src/components/elements.ts),
  [controllers](../../src/components/),
  [advanced plugin](../../src/plugins/advanced.ts), and
  [widgets plugin](../../src/plugins/widgets.ts).
- Original planning summaries are written for MarkupUI. Upstream identifiers are retained for
  traceability; upstream explanatory prose and implementation code are not reproduced.

## How to read the trackers

Each page separates current source evidence, proposed placement, HTML/JS/CSS responsibilities,
gaps, acceptance cases, and an item-by-item API inventory. **Partial** means an inspected
existing slice, never full component or property parity. **Related** means a composition
candidate, not an implemented equivalent. **None** means no dedicated implementation was
identified in the inspected registry/modules; it is not proof that native HTML cannot solve it.

The implementation vocabulary is **⚪ Not reviewed**, **🔵 Planned**, **🟠 In progress**,
**🟣 Implemented**, **🟢 Verified**, and **⏭️ Intentionally omitted**. Text is authoritative;
emoji colors are only a scanning aid. A page may have a Planned
direction while many detailed rows remain Not reviewed. Nothing in this documentation-only
change implements component code; Verified statuses are recorded only when committed
implementation and acceptance evidence exist. Existing-source evidence is kept in a separate column.

The numbered component checklists distinguish proposed work from accepted implementation.
Avatar's four retained-scope tasks are checked using `9afc818`, Button's four using
`43dd57f`, Card's four using `cebc6d7`, Tag's four using `6605d29`, and Badge's four using
its linked acceptance record, plus Alert's, Empty's, Skeleton's, Spin's, Progress's, Statistic's, Typography's, Icon's, Gradient Text's, Ellipsis's, Page Header's, Divider's, Flex's, Space's, Grid's, Layout's, List's, Descriptions', Timeline's, Breadcrumb's, Thing's, Table's, Highlight's, Affix's, Result's, Code's, Scrollbar's, Float Button's and Image's four each with retained acceptance records;
Popover through Rate, the subsequent Form/Auto Complete/Input OTP/Dynamic Input/Dynamic
Tags/Mention/Color Picker/Date Picker/Time Picker records, and now Virtual List each add
four accepted tasks; Tree, Cascader, Tree Select, Transfer, Data Table, Log, Infinite Scroll, Popselect, Split, Config Provider, Element, Global Style, Carousel, Watermark, Upload, Calendar, Time, Countdown, Number Animation, Heatmap and Marquee each add four more. The current total is **368/384 accepted across 92 pages, 16 unchecked**.
P2 retained scopes remain reconciled; the nineteen sequential P3 scopes plus three mixed P2/P3 pages pass the complete P3 audit. Reconcile later implementation evidence
with individual retained rows before promoting the historical reference inventory.

Earlier component acceptance sections retain checkpoint-specific queue/progress statements.
The final P3 audit and current master dashboard supersede those historical “next/P3 incomplete”
remarks; no later P4/P5/P6 component inherits P3 acceptance.

### Native browser capabilities reduce implementation scope

Follow P0-09 in the [master migration plan](migration-plan.md): choose browser primitives
before writing equivalent custom machinery. Every component page names its native path and
fallback. A CSS-only composition does not need a new custom element.

- **Web Components:** where behavior is necessary, use `customElements` and a small
  light-DOM controller that adopts authored nodes. `connectedCallback` must be idempotent;
  `disconnectedCallback` releases listeners, observers, timers and pending work. Preserve
  pre-upgrade properties and reconnect behavior rather than rerendering whole subtrees.
- **Native templates:** use `HTMLTemplateElement.content.cloneNode(true)` for optional
  repeated/authored structure, then bind explicit references and text/property values.
  Preserve stable keyed nodes when updating data. Do not add expressions, directives,
  reactivity, interpolation syntax or a generic template renderer.
- **Native controls and surfaces:** prefer input/select/textarea, details/summary, progress,
  dialog and the Popover API. Native form submission, validation, focus and keyboard behavior
  replace controller code when they fit the retained scope.
- **CSS:** use grid/flex/gap, logical properties, scroll snapping and reduced-motion media
  queries. Container queries, `:has()` and anchor positioning are optional enhancements,
  guarded with `@supports`/`CSS.supports`; plain flow, media queries or explicit state
  attributes remain useful fallbacks. Do not use JavaScript measurement for ordinary layout.
- **Browser services:** prefer Intl, IntersectionObserver, ResizeObserver, AbortController,
  requestAnimationFrame and native scrolling where appropriate. Feature-detect against
  the supported-browser matrix; built-in availability is not assumed from a component name.
- **Fallback policy:** unsupported enhancement means a usable native/static/manual path or
  a smaller declared scope, not a custom polyfill stack or new dependency. All optional
  modules remain dependency-free.
- **DOM boundary:** light DOM is the default. Upstream “slots” in the API inventory map
  to explicitly named authored-child/template conventions, **not native slot projection**.
  Native `<slot>` projection requires Shadow DOM. Shadow DOM is neither required nor
  introduced by these plans; an optional use needs a separate, justified trade-off review.

Public docs have been inventoried deterministically, including callbacks in prop tables,
slots, methods, option/handle records, fenced type declarations, directly named helpers,
inline object members in documented signatures, and documented inherited surfaces. This is **documentation inventory review**, not a
claim that every upstream implementation body, default, edge case, or browser behavior
has received detailed source review. Complex candidate mappings explicitly remain Not reviewed.
Per-row type/default details remain at the pinned source link rather than being
reinterpreted as already agreed MarkupUI contracts.

Common acceptance requirements apply to every retained row: plain HTML/CSS/JS example,
native semantics, no-JS fallback where practical, keyboard/focus, live updates/defaults,
reconnect/disposal, safe text handling, relevant browser tests, and measured payload.
Page-specific cases supplement the [architecture acceptance checklist](architecture.md).

### Upstream source-review coverage

The initial targeted source research is recorded as original summaries with pinned source-range
citations on relevant pages. This historical research snapshot is separate from the exhaustive
public-document inventory and later per-component implementation reviews:

- **11 direct targeted reviews:** Carousel, Select, Slider, Data Table virtualization,
  Tree, Tabs, Modal, Drawer, Popover, Virtual List, and Config Provider/RTL.
- **8 shared-internal-only reviews:** Auto Complete, Cascader, Tree Select, Dropdown,
  Dialog, Popconfirm, Popselect, and Tooltip. Related helpers inform acceptance cases;
  these are not direct audits of each component's complete implementation.
- **77 remaining components:** public contract inventory complete within the declared
  documentation boundaries; internal implementation behavior not source-verified.

Even the direct reviews cover selected behavior, not every property or all accessibility
paths. Upstream limitations are not migration requirements: use native controls, avoid
default wheel interception, provide keyboard resizing, and require a separate accessible
grid design before horizontal table virtualization.

## Delivery phases and payload limits

| Phase | Priority and exit |
| --- | --- |
| P0 — Foundations | Agree native-child/event/form contracts, CSS extraction and compatible loading. |
| P1 — Avatar/Button/Card pilot | Demonstrate the separated component pattern on individual retained pilot features. |
| P2 — Primitives/layout | Deliver semantic content, small feedback and CSS-first layouts without unnecessary controllers. |
| P3 — Interactions/overlays/navigation | Resolve focus, nesting, dismissal, scrolling and native action behavior. |
| P4 — Forms | Establish values/defaults, labels, submission, reset, validity and native selection. |
| P5 — Collections | Add explicit stable-key, async, rich-selection and independently imported virtual-window behavior. |
| P6 — Specialized | Justify optional date/time panels, upload, media, visualization and motion with individual budgets. |
| Deferred / exclusions | Keep legacy/framework/dependency-heavy contracts visible outside delivery phases; no parity credit. |

Current gzip ceilings are **15,000 bytes core**, **3,000 advanced**, **4,000 widgets**.
They are existing ceilings, not free capacity for 96 components. Prefer native/CSS-only
compositions and narrow optional imports. Track CSS and total loaded assets after extraction.
KaTeX, language highlighters, chart engines and QR packages must not appear as hidden dependencies.
The catalog is a prioritization tool, not a promise to add every route to core.

The component delivery sections below retain historical checkpoints; earlier statements
that P2 was in progress describe those checkpoints, not the current dashboard. P2's
31 retained adapted scopes are now accepted, and P3 is in progress after Popover and Tooltip.

### Avatar pilot: standalone delivery and registration order

The accepted Avatar record reports a core measurement of **14,611 bytes gzip** against the
**15,000-byte ceiling**, leaving only **389 bytes**. This is a later implementation
measurement, separate from the original reference baseline. Full enhanced Avatar and group
behavior must not be added to the aggregate merely by relaxing its budget.

Commit **`9afc818`** delivers enhanced Avatar and Avatar Group through explicit standalone
**ES-module and classic-script entries with separate CSS**, with zero runtime dependencies.
Exports are `@dataengine/markup-ui/avatar` and `@dataengine/markup-ui/avatar/style.css`.
The aggregate's basic Avatar stays compatible; enhanced loading is an application choice.

Custom-element definitions cannot be silently replaced:

1. Load/register the enhanced component entry **before** the legacy auto-registering aggregate.
   The aggregate's existing skip-already-defined behavior then preserves the enhanced definition.
2. If the legacy definition is already registered, enhanced registration must **surface a clear
   conflict**. A successful no-op must not claim the element was upgraded.
3. Verify both load orders, explicit conflict reporting, independent CSS loading, classic/module
   delivery and core/standalone payloads. Account for total loaded JS+CSS rather than presenting
   the 389-byte core margin as enough capacity for the enhanced component.

The [implementation and acceptance record](../components/avatar.md) reports a successful
build and **43 tests** (16 Avatar-focused plus 27 existing), along with **Chromium**
acceptance. Separate ESM/classic JavaScript ceilings are 4,000 gzip bytes each; CSS has a
1,500-byte ceiling. Browser coverage is not all-browser certification or pixel parity.
The reference Avatar page reconciles all **35 rows: 19 Verified adapted targets and
16 Intentionally omitted contracts**. Button, Card, Tag, Badge, Alert, Empty, Skeleton, Spin, Progress, Statistic, Typography, Icon, Gradient Text, Ellipsis, Page Header, Divider, Flex, Space, Grid, Layout, List, Descriptions, Timeline, Breadcrumb, Thing, Table, Highlight, Affix, Result, Code, Scrollbar, Float Button and Image are also verified as recorded below;
**All retained P3 and P4 scopes are accepted; Virtual List/Tree/Cascader/Tree Select/Transfer are accepted, with Data Table next**, and the master plan owns
the sequential implementation/build/commit workflow.

### Button pilot: accepted native scope

Commit **`43dd57f`** delivers standalone Button and ButtonGroup through
`@dataengine/markup-ui/button` and `@dataengine/markup-ui/button/style.css`, with classic
and ES-module distributions and external CSS. The
[implementation record](../components/button.md) reports a successful build and **67 tests**
(24 Button, 16 Avatar, 27 legacy/native), plus Chromium acceptance. Core remains
**14,611 / 15,000 gzip bytes**; standalone JavaScript ceilings are 4,000 bytes per mode
and the CSS ceiling is 2,500 bytes.

The native child—not the wrapper—owns focus, keyboard and form semantics. Generated buttons
default to `button`; authored untyped buttons retain native submit behavior. Explicit
`bordered="false"` and `focusable="false"` are component-specific opt-out exceptions.
Native/CSS replacements have narrower documented scope; arbitrary tag/render/theme APIs,
keyboard suppression and custom focus workarounds are excluded.

The reference page retains its **34 public-doc/inline rows**, adding **four explicitly
source-declared click/theme entries**, for **38 rows: 29 Verified adapted targets and
9 Intentionally omitted contracts**. This does not imply every source-only API in the
remaining planning pages has been discovered. Load Button before the legacy aggregate;
legacy-first registration reports a conflict.

### Card pilot: accepted native scope

Commit **`cebc6d7`** delivers standalone Card with six authored native regions, plain-text
title fallback, optional native close intent, external appearance/segmentation/scrolling CSS,
and preserved node identities. See the [implementation record](../components/card.md) for
its successful build, **92 passing tests**, Chromium acceptance and deliberate defaults/
omissions. The original aggregate and 14,611/15,000-byte core measurement remain unchanged.

The Card reference page retains all **30 public-document rows** and adds four explicit
source-only supplements: **34 rows, 26 Verified adapted targets and 8 Intentionally omitted**.
Card never removes itself in response to close intent or infers a heading/landmark. Native
close focusability defaults true. The three pilot ESM entries also composed together before
the legacy aggregate with one native form submission and separate CSS in Chromium.

The pilot and **all 31 P2-assigned pages** have accepted retained scopes and explicit exclusions, including Image's advanced P6 limits. **No P2-assigned row remains Planned or unresolved.** P2 retained-scope sign-off is complete; global P3/P6 and framework parity are not.
This closes Tag/Badge/Alert/Empty/Skeleton/Spin, not all P2 typography/layout/content work. Detailed
phase progress and per-component commits belong in the master migration plan.

### Tag: accepted P2 native scope

Commit **`6605d29`** delivers `@dataengine/markup-ui/tag` and
`@dataengine/markup-ui/tag/style.css`: passive text/span content, native checking and close
intent, preserved authored nodes, silent checked assignment and external CSS. The
[accepted contract](../components/tag.md) records **118 passing tests**, Chromium
keyboard/focus/form-safety/lifecycle and load-order evidence, and explicit framework/native
scope differences. Checkable suppresses closable, close never removes content, and Boolean
`mui:change` is emitted only for activation, not programmatic assignment.

The reference page preserves **19 original rows** and adds **12 explicitly source-declared
supplements**: **31 rows, 24 Verified ADAPTED native targets and 7 Intentionally omitted**.
Verified native event/CSS/DOM equivalents are not claims of upstream object-shape parity.
Core remains 14,611/15,000 gzip bytes; Tag ESM/classic/CSS are 2,246/2,455/1,386 gzip bytes.
Four retained Tag tasks are accepted. Badge's subsequent retained acceptance is recorded below.

### Badge: verified P2 native scope

The [Badge implementation and acceptance record](../components/badge.md) closes its retained
scope in `69c9480`: standalone ESM/classic and external CSS, controller-free
static spans, safe dynamic counts/text/caps, zero/show/dot/processing and authored target/value
content. Native target names, focus, forms and disabled state remain application-owned;
decorative hiding affects only the indicator, with no implicit live region or keyboard handler.

The reference page preserves all **10 public-document rows** and adds **four source-only
value-slot/theme supplements**: **14 rows, 11 Verified ADAPTED targets and 3 Intentionally
omitted contracts**. CSS sizing/placement/decorative extensions do not invent upstream rows.
Four retained tasks are accepted against **141 passing tests** and Chromium native-target,
visibility, accessible-name, logical-position/offset, 200% CSS zoom and load-order evidence.
Core remains 14,611/15,000 gzip bytes; Badge ESM/classic/CSS are 1,452/1,661/963 gzip bytes.
Exports are `@dataengine/markup-ui/badge` and `@dataengine/markup-ui/badge/style.css`.
Alert's subsequent retained acceptance is recorded below.

### Alert: verified P2 native scope

The [Alert implementation and acceptance record](../components/alert.md) closes the retained
scope in `2a1eb42`: optional ESM/classic and external CSS, native header/content/
HTML-or-SVG icon regions, native actions, safe title fallback and labelled close intent.
Default notices have no forced assertive role. Author-supplied live-region semantics are
preserved without nested announcers or redundant ARIA writes during text updates.

Close never hides/removes the notice, awaits callback results or invents a leave lifecycle.
The reference retains all **10 pinned rows** and adds **four source-only deprecated/theme
supplements**: **14 rows, 9 Verified ADAPTED native targets and 5 Intentionally omitted**.
Four retained tasks are accepted against **167 passing tests**, build/budget gates and
Chromium native keyboard/focus/forms, roles/DOM stability, SVG/CSS/RTL and load-order evidence.
Actual screen-reader speech timing is not certified. Core stays 14,611/15,000 gzip bytes;
Alert ESM/classic/CSS are 1,770/1,981/1,233 gzip bytes. Exports are
`@dataengine/markup-ui/alert` and `@dataengine/markup-ui/alert/style.css`.
Empty's subsequent retained acceptance is recorded below; Skeleton/Spin follow afterward.

### Empty: verified P2 native scope

The [Empty implementation and acceptance record](../components/empty.md) closes its retained
scope in `27a435b`: optional ESM/classic and external CSS, safe localizable
description fallback, original decorative SVG, native description/icon/extra content and
five CSS sizes. Authored content wins without losing native headings, action listeners,
input state, form types or explicit ARIA. Templates remain inert; applications may clone
them with native DOM APIs. Static `.mui-empty` sections require no controller.

The reference retains all **seven pinned rows** and adds **four explicit source render/theme
supplements**: **11 rows, 7 Verified ADAPTED native targets and 4 Intentionally omitted**.
Four retained tasks are accepted against **190 passing tests**, build/budget gates and
Chromium SVG namespace/size, localization, native form/keyboard/focus, region visibility,
template/reconnect and load-order evidence. No role, action or live announcer is generated.
Core stays 14,611/15,000 gzip bytes; Empty ESM/classic/CSS are 1,596/1,805/759 gzip bytes.
Exports are `@dataengine/markup-ui/empty` and `@dataengine/markup-ui/empty/style.css`.
Skeleton's subsequent retained acceptance is recorded below; Spin follows.

### Skeleton: verified P2 native/CSS scope

The [Skeleton implementation and acceptance record](../components/skeleton.md) closes its
retained scope in `05c6546`: optional ESM/classic and external CSS, native
decorative/inert placeholder spans, shapes/text/presets, bounded 0–100 repeat and explicit
dimension validation. Original author nodes remain outside the decorative group; actual
busy/status/content state remains with the application. Static spans need no controller.

The reference preserves all **nine pinned rows** and adds **three explicit source theme
supplements**: **12 rows, 9 Verified ADAPTED native targets and 3 Intentionally omitted**.
Four tasks are accepted against **213 passing tests**, build/budget gates and Chromium
native geometry, percentage/variable heights, circle precedence, validation, inert focus
blocking, author ownership, reduced motion and load-order evidence.
Attribute-driven dimensions use isolated validated custom properties with an explicit CSP
boundary; external CSS/presets are preferred. Invalid configuration is diagnosed, not
silently converted into valid-looking output or a completed-loading state.
Core stays 14,611/15,000 gzip bytes; Skeleton ESM/classic/CSS are 1,802/2,007/786 gzip bytes.
Exports are `@dataengine/markup-ui/skeleton` and `@dataengine/markup-ui/skeleton/style.css`.
Spin's subsequent retained acceptance is recorded below.

### Spin: verified P2-02 native scope and workstream close

The [Spin implementation and acceptance record](../components/spin.md) closes its retained
scope in `6c7f35b`: standalone ESM/classic and external CSS, native SVG size/
stroke/radius/scale, preserved icon/description/target content and one cancellable wrapped
display-delay timer. Standalone show behavior matches the documented distinction. Wrapped
controls stay usable; actual busy state, optional inert blocking and announcements remain
application-owned and are never overwritten by the component.

All **14 pinned rows** remain, plus **four explicit deprecated/theme source supplements**:
**18 rows, 13 Verified ADAPTED native targets and 5 Intentionally omitted**.
Four tasks are accepted against **241 passing tests**, build/budget gates and Chromium
real-delay/cancellation, native controls/focus/state restoration, SVG/motion/role, nested CSS
and load-order evidence. Core stays 14,611/15,000 gzip bytes. Spin ESM/classic/CSS are
3,077/3,284/966 gzip bytes. Exports are `@dataengine/markup-ui/spin` and
`@dataengine/markup-ui/spin/style.css`.

**P2-02 Tag/Badge/Alert/Empty/Skeleton/Spin is Verified for retained scope. Whole P2 remains
In progress.** Progress is now verified individually; Statistic (P2-03) and remaining typography/layout/
content tasks from this index follow only through coordinator selection.

### Progress: verified individual P2-03 native scope

The [Progress implementation and acceptance record](../components/progress.md) closes its
retained scope in `8d7757c`: native linear range semantics and decorative native
SVG circle/dashboard/multiple-ring visuals, bounded percentage arrays, legacy value/max
ratios, explicit indeterminate/error/clamping contracts and safe indicator/label ownership.
Gradients, rails, gaps, offsets and statuses use native CSS/SVG without charting or animation
dependencies. There is one native semantic owner per measure, not duplicated wrapper/SVG roles.

All **21 original rows** remain, plus **six explicit source geometry/alias/theme supplements**:
**27 rows, 23 Verified ADAPTED targets and 4 Intentionally omitted**. The public
`offset-degress` typo is preserved and mapped to the source's `offsetDegree`.
Four tasks are accepted against **270 passing tests**, native browser geometry/semantics/
gradient/naming/reduced-motion/load-order evidence and unchanged budget gates. Core stays
14,611/15,000 gzip bytes; exact optional sizes are in the linked acceptance record/manifest.
Both ESM and a lean classic entry fit their original independent ceilings without relaxing
budgets. Exports are `@dataengine/markup-ui/progress` and
`@dataengine/markup-ui/progress/style.css`.
Statistic's subsequent acceptance closes retained P2-03 below. P2 overall remains In progress;
unimplemented typography/layout/content work is not promoted by these completions.

### Statistic: verified passive P2-03 scope and workstream close

The [Statistic implementation and acceptance record](../components/statistic.md) closes the
retained scope in `1ed3a98`: passive native label/value/prefix/suffix regions,
literal finite-number/string semantics, tabular numeric CSS and reversible authored-content
precedence. It does not parse formatted strings, generate output/live/progress roles, infer
units or import Number Animation. Native Intl formatting is an application example, not a
new library formatter API.

All **seven pinned rows** remain, plus **three explicit source theme supplements**:
**10 rows, 7 Verified ADAPTED native targets and 3 Intentionally omitted**.
Four tasks are accepted against **290 passing tests**, build/budget gates and Chromium
literal/blank/zero values, native actions/forms/headings/names, Intl-string preservation,
tabular styling, quiet updates, reconnect and load-order evidence.
Legacy affix attributes remain; `.valuePrefix`/`.valueSuffix` deliberately avoid shadowing
native readonly `Element.prefix`. Core stays 14,611/15,000 gzip bytes; Statistic ESM/classic/CSS
are 1,540/1,745/577 gzip bytes. Exports are `@dataengine/markup-ui/statistic` and
`@dataengine/markup-ui/statistic/style.css`.

**P2-03 Progress + Statistic is Verified for retained scope; whole P2 is not complete.**
Typography's subsequent CSS-only acceptance is recorded below; Icon and remaining content/layout follow.

### Typography: verified CSS-only P2-01 scope

The [Typography implementation and acceptance record](../components/typography.md) closes
its retained scope in `53d3974` through scoped native HTML/CSS only. There is **no** Typography Custom
Element, observer, JS entry/global, registration contract or fake JS budget. The export is
`@dataengine/markup-ui/typography/style.css`, linked natively in browsers. CSS may load
before or after the unchanged legacy aggregate/aliases.

All **15 grouped public rows** remain. **25 explicit source supplements** cover A/Li/Hr,
deprecated Text `as`, and three theme contracts for each of seven grouped source owners.
The page records **40 rows: 17 Verified ADAPTED native targets and 23 Intentionally omitted
runtime/framework contracts**. H1–H6 and Ul/Ol stay grouped, not inflated into new routes.
Native a/li/hr, headings, text/decorations, P, lists, quotations and inline code preserve
actual semantics and attributes without routing or highlighting dependencies.

Four tasks are accepted against **300 passing tests**, CSS-only build/export checks and
Chromium native hierarchy/links/focus/selection, RTL/alignment, wrapping, 200% CSS zoom and
legacy-coexistence evidence. Core stays 14,611/15,000 gzip bytes; the only new distribution
is **1,423 gzip bytes of CSS**, under a 2,500-byte CSS ceiling.
Icon's subsequent CSS-only acceptance is recorded below. P2-01 and P2 overall remain In progress.

### Icon/IconWrapper: verified CSS-only native scope

The [Icon/IconWrapper implementation and acceptance record](../components/icon.md) closes
the retained scope in `829970d` through native authored SVG/img/glyph composition and one external
stylesheet. There is no asset fetch, icon package, renderer constructor, automatic role,
Custom Element, ESM/classic runtime/global or fake JS budget.
The CSS export is `@dataengine/markup-ui/icon/style.css` for both owners.

All **nine pinned rows** remain, plus **eight explicit source Depth/companion-slot/theme
supplements**: **17 rows, 10 Verified ADAPTED targets and 7 Intentionally omitted**.
Native viewBox/preserveAspectRatio/title/desc, fixed multicolor fills, explicit strokes,
nested SVG viewports and actual button/link names/behavior are preserved rather than reset.
Four retained tasks are accepted against **308 passing tests**, build/export gates and
Chromium paint/sizing/ARIA/focus/RTL/forced-colors/200%-zoom/coexistence evidence.
Core remains 14,611/15,000 gzip bytes; Icon/IconWrapper adds only **609 gzip bytes of CSS**
under a 1,000-byte ceiling. Gradient Text's subsequent acceptance is recorded below; P2 remains incomplete.

### Gradient Text: verified CSS-only native scope

The [Gradient Text implementation and acceptance record](../components/gradient-text.md) closes
the retained scope in `38dcf6f` through original native text and one external stylesheet exported as
`@dataengine/markup-ui/gradient-text/style.css`. No Custom Element, ESM/classic runtime,
gradient object adapter, image loader, renderer or theme/Houdini dependency is introduced.

All **seven pinned rows** remain, plus **six explicit source alias/type/theme supplements**:
**13 rows, 10 Verified ADAPTED native targets and 3 Intentionally omitted theme contracts**.
Native size/weight/type/image/from/to/angle declarations keep semantics, selection and links.
Solid foreground/underpaint, feature detection, forced-color and print overrides preserve words;
contrast remains application-owned rather than automatically certified.
Four tasks are accepted against **316 passing tests**, build/export gates and Chromium
fallback/print/forced-colors/nested-text/RTL/zoom/native-action/coexistence evidence. Unsupported
clipping was simulated by removing its feature rule; print checks included in-memory PDF output
with backgrounds disabled, not physical printer certification.
Core remains 14,611/15,000 gzip bytes; Gradient Text is **596 gzip bytes of CSS / 1,500 ceiling**.
Ellipsis's subsequent native CSS/disclosure acceptance is recorded below; P2 remains incomplete.

### Ellipsis: verified CSS-only native truncation/disclosure

The [Ellipsis implementation and acceptance record](../components/ellipsis.md) in `5fabe7f` closes retained
single/multiline truncation and optional native details/summary expansion. The stylesheet export
is `@dataengine/markup-ui/ellipsis/style.css`; no Custom Element, ESM/classic JS/global,
observer, Tooltip or PerformantEllipsis hover-remount wrapper is shipped.

All **five pinned public rows** remain, plus **five explicit source forwarded-slot/shared-theme
supplements**: **10 rows, 4 Verified ADAPTED targets and 6 Intentionally omitted contracts**.
Full native text/name/selection remain intact. A visible summary/hint supplies the keyboard/
pointer full-content route; defensive CSS stops clipping when native controls are encountered.
Invalid/unsupported clamp or safety-selector support reduces decoration rather than hiding text.
Native details is not TooltipProps/overlay parity or a dependency on an unfinished overlay engine.

Four tasks are accepted against **327 passing tests**, build/export gates and Chromium
geometry/native keyboard/pointer/AX name/selection/late-control/RTL/zoom/print/coexistence checks.
Print restores full summary text; unsupported CSS features were simulated in Chromium.
Core remains 14,611/15,000 gzip bytes; Ellipsis adds **676 gzip bytes of CSS / 1,500 ceiling**.
Page Header's subsequent native composition acceptance is recorded below. Broader P2/P3 remain incomplete.

### Page Header: verified CSS-only native compound content

The [Page Header implementation and acceptance record](../components/page-header.md) in `5f9faf3` closes
all eight retained native region conventions, authored title/subtitle/extra text and explicit
native back action. The export is `@dataengine/markup-ui/page-header/style.css` only; there is
no Custom Element, ESM/classic runtime/global, renderer, router/history helper or mandatory
Button/Avatar/Breadcrumb dependency. The demo JS is application-owned form/back behavior.

All **twelve original public rows** remain, plus **three explicit source theme supplements**:
**15 rows, 12 Verified ADAPTED native targets and 3 Intentionally omitted framework contracts**.
Author-selected native header/nav/headings own landmarks, names and hierarchy. Native links,
button types/disabled state, forms, assets and original content/listeners remain intact.
The source/document extra precedence discrepancy is documented, not disguised as runtime parity.

Four tasks are accepted against **340 passing tests**, build/export gates and Chromium
landmark/heading/action-name/back/keyboard/forms/280px-wrapping/RTL/zoom/print/coexistence evidence.
A narrow long-back-label/title collapse was fixed without measurement or a controller.
Core remains 14,611/15,000 gzip bytes; Page Header is **778 gzip bytes of CSS / 1,500 ceiling**.
Divider's subsequent acceptance is recorded below. Remaining content/layout and cross-phase
components still prevent P2 completion.

### Divider: verified CSS-only native separator/layout scope

The [Divider implementation and acceptance record](../components/divider.md) in `2e1a6c0` closes retained
horizontal/vertical/dashed/caption/placement presentation with explicit semantic or decorative
native markup. The export is `@dataengine/markup-ui/divider/style.css`; no new registration,
ESM/classic runtime, observer, theme renderer or focus/keyboard behavior is added.

All **four original public rows** remain, plus **three explicit source theme supplements**:
**7 rows, 4 Verified ADAPTED native targets and 3 Intentionally omitted contracts**.
Native hr remains void, named captions have one explicit accessible owner, and real headings
stay in neutral decorative wrappers rather than separator descendants. Visual orientation
follows authored ARIA; decorative-only orientation cannot override it.
Vertical caption preservation/dashed borders are deliberate native composition differences.

Four tasks are accepted against **351 passing tests**, build/export gates and Chromium
rule/caption/grid geometry, semantic naming, narrow/RTL/zoom/forced-colors/print and legacy
coexistence. The legacy mui-divider registry/styles remain unchanged.
Core stays 14,611/15,000 gzip bytes; Divider adds **765 gzip bytes of CSS / 1,500 ceiling**.
Flex's subsequent native layout acceptance is recorded below. P2-04 and P2 overall remain incomplete.

### Flex: verified CSS-only native layout

The [Flex implementation and acceptance record](../components/flex.md) in `720a92c` closes retained
flex/gap/wrap/vertical/inline/alignment/justification presentation on original native elements.
The export is `@dataengine/markup-ui/flex/style.css`; no Custom Element, ESM/classic runtime,
child wrapper/traversal, observer, size parser, gap detector or role mutation is introduced.

All **seven public rows** remain, plus **six explicit source reverse/type/theme supplements**:
**13 rows, 9 Verified ADAPTED native targets and 4 Intentionally omitted contracts**.
Source-only reverse is omitted so visual order is not detached from DOM/reading/focus order.
Pinned presets are 4/8, 8/12 and 12/16px row/column; a tuple [H,V] maps column=H,row=V,
including source-compatible nowrap columns. CSS grammar, not a runtime, owns custom values.

Four tasks are accepted against **362 passing tests**, build/export gates and Chromium
gap/tuple/wrap/inline/alignment, native list markers/GET forms/focus/hidden, narrow grid,
RTL/zoom/print and unchanged legacy-row/stack/wrap coexistence evidence.
Core stays 14,611/15,000 gzip bytes; Flex adds **390 gzip bytes of CSS / 1,000 ceiling**.
Space's subsequent authored-item acceptance is recorded below. P2 remains incomplete.

### Space: verified CSS-only authored-item composition

The [Space implementation and acceptance record](../components/space.md) in `d495a12` closes native
spacing, optional authored item groups/classes and direct-child composition. It reuses
Flex's native flag/preset conventions without importing Flex or generating wrappers.
The only export is `@dataengine/markup-ui/space/style.css`; no renderer, observer, gap
detector/polyfill, size parser or synthetic registration is added.

All **eleven public rows** remain, plus **seven explicit source internal/type/alias/theme
supplements**: **18 rows, 13 Verified ADAPTED targets and 5 Intentionally omitted contracts**.
Wrap-item/item-class/item-style map to actual native markup/classes/external CSS, not automatic
runtime adapters. Reverse, internal gap machinery and themes are omitted. There is no pinned
separator API: example separators are explicit native items/groups with author-owned semantics.

Four tasks are accepted against **373 passing tests**, build/export gates and Chromium
groups/styles/tuple gaps/wrapping/separators, native lists/GET forms/focus/hidden, narrow grid,
RTL/zoom/print and independent Flex/legacy coexistence evidence.
Space CSS is **423 gzip bytes / 1,000 ceiling**; Flex stays **390** and core **14,611/15,000**.
Grid's subsequent native CSS acceptance and algorithm omissions are recorded below. P2 is not complete.

### Grid/GridItem: verified native CSS scope with explicit algorithm omissions

The [Grid/GridItem implementation and acceptance record](../components/grid.md) closes
fixed/native tracks, spans, gaps, absolute placement, independent nested grids, correct
self-wrapper/screen/item CSS queries and explicit native disclosure composition.
The export is `@dataengine/markup-ui/grid/style.css`; no responsive parser, observer,
provider, constructor filtering, packing engine or new registration is introduced.

All **thirteen original public rows** remain, plus **two public type/slot-field expansions**
and **six source item-style/private/alias supplements**: **21 rows, 10 Verified ADAPTED
native targets and 11 Intentionally omitted contracts**. Automatic row budgets, relative
offset packing, reserved suffixes, overflow callbacks and SSR/layout-shift flags are not
claimed as native CSS parity. Absolute starts, authored spacers and preview/details/trailing
actions are explicitly different alternatives.

Four tasks are accepted against **385 passing tests**, build/export gates and Chromium
column/span/gap/placement, self-versus-screen queries, nested/hidden/native focus/forms,
RTL/zoom/print and unchanged legacy-columns coexistence evidence.
Grid CSS is **527 gzip bytes / 1,500 ceiling**; core stays **14,611/15,000**.
Layout's accepted native composition is recorded below. P2 is still In progress.

### Layout: verified native CSS/disclosure/scrolling scope

The [Layout and companion-region acceptance record](../components/layout.md) completes
the retained P2-04 layout workstream through native header/content/footer/aside structure,
details/summary disclosure and Element scrolling. No component runtime, observer, provider,
custom scrollbar or registration is added. The export is
`@dataengine/markup-ui/layout/style.css`.

All **42 original owner-specific rows** remain: **32 Verified adapted native targets and
10 Intentionally omitted contracts**. Closed native disclosure hides content rather than
translating/clipping focusable navigation. Native toggle timing, logical DOM-order side
placement, normal/absolute positioning and author-specified scroll constraints are explicit;
runtime style objects and transition callbacks are not emulated.

Four tasks are accepted against **396 tests**, build/budget gates and Chromium nested-shell,
scroll/sticky/absolute geometry, keyboard disclosure and hidden focus safety, native forms,
RTL/320px/200%-zoom, print, forced-colors and legacy-coexistence evidence.
Layout CSS is **874 gzip bytes / 1,500 ceiling**; core remains **14,611/15,000**.
P2-04 is complete for retained scope; List's accepted native scope is recorded below.

### List and ListItem: verified native CSS scope

The [List/ListItem acceptance record](../components/list.md) closes four retained tasks
with **407 passing tests**, including 11 List cases, build/budget gates and Chromium
acceptance. Native `ul`/`ol`/`li` remain intact, with external header/footer regions,
authored prefix/content/suffix and safe independent or single-root native actions.
Dividers, border/hover, logical wrapping and source-declared size adaptation need no
component JavaScript. Markers remain by default; explicit markerless lists document
the author-controlled Safari role workaround, without claiming Safari certification.

All **10 original public rows** remain, plus **four explicit source size/theme supplements**:
**14 rows, 11 Verified ADAPTED native targets and 3 Intentionally omitted theme contracts**.
No `extra`/`action` slot, row-selection API, renderer, virtualization or provider is invented.
Chromium exercised list/heading/control accessibility trees, native keyboard/focus/forms,
hidden/templates, nested/empty lists, 280/320px widths, RTL, 200% CSS zoom, print,
forced colors, legacy coexistence and JavaScript-disabled native GET submission.

List CSS is **1,054 gzip bytes / 1,500 ceiling**, with **zero component JS**; core remains
**14,611/15,000**. Demo application handlers are not a library runtime.
Descriptions' accepted native scope is recorded below; full P2 remains In progress.

### Descriptions and DescriptionItem: verified native CSS scope

The [Descriptions acceptance record](../components/descriptions.md) closes four retained
tasks with **419 passing tests**, including 12 Descriptions cases, build/budget gates and
Chromium acceptance. Actual `dl`/`dt`/`dd` groups preserve terms, definitions, authored
values, native controls and order. Titles/header content stay outside `dl`. Native CSS
owns grid columns/spans, density, independent borders, placement and alignment; it does
not reproduce table colspan packing, automatic final-item fill or runtime style forwarding.

All **21 original public rows** remain, plus **six explicit source alias/type/theme
supplements**: **27 rows, 17 Verified ADAPTED native targets and 10 Intentionally omitted
contracts**. Positive column/span constraints and responsive span resets are author-owned.
Chromium exercised term/definition accessibility trees, rich/empty/nested content, native
keyboard/focus/forms, live column changes, span geometry, long terms/values at 280/320px,
RTL, 200% CSS zoom, hidden/templates, print/forced colors, legacy coexistence and a
JavaScript-disabled native GET form.

Descriptions CSS is **880 gzip bytes / 1,500 ceiling**, with **zero component JS**; core
remains **14,611/15,000**. Timeline's accepted native scope is recorded below.
These are not framework/table/pixel parity claims.

### Timeline and TimelineItem: verified native CSS scope

The [Timeline acceptance record](../components/timeline.md) closes four retained tasks
with **431 passing tests**, including 12 Timeline cases, build/budget gates and Chromium
acceptance. Actual lists/items preserve author chronology, headings, time text/attributes,
native controls and nested content. CSS handles decorative markers, five status colors
with visible status words, line types, size, logical placement and horizontal scrolling.
Guarded visible-sibling connectors stop before hidden/trailing/template boundaries;
the fallback is a readable marker-only list rather than a misleading last-event line.

All **15 original public rows** remain, plus **four explicit source numeric-time/theme
supplements**: **19 rows, 16 Verified ADAPTED native targets and 3 Intentionally omitted
theme contracts**. No reverse prop, date parser, automatic headings/announcements,
widget/Icon runtime or chronology renderer is invented.
Chromium exercised list/time/heading accessibility trees, authored dates/status text,
native keyboard/forms/focus, dynamic last-visible connectors, nested/hidden/templates,
280/320px layouts, RTL, 200% CSS zoom, focus-driven horizontal scrolling, print/forced
colors, marker-only fallback, aggregate/widgets coexistence and JavaScript-disabled GET forms.

Timeline CSS is **1,320 gzip bytes / 1,500 ceiling**, with **zero component JS**.
Core remains **14,611/15,000** and widgets **2,779/4,000** gzip bytes.
Breadcrumb's accepted native scope and the completed residual-index review are recorded below.

### Breadcrumb and BreadcrumbItem: verified native CSS scope

The [Breadcrumb acceptance record](../components/breadcrumb.md) closes four retained tasks
with **443 passing tests**, including 12 Breadcrumb cases, build/budget gates and Chromium
acceptance. Native named navigation, lists/items and anchors retain href/target/rel,
explicit current-page state, non-clickable text, author nodes/listeners and keyboard order.
Decorative separators stay inside valid list items, stop at the last visible sibling and
wrap without truncation or an overflow-menu runtime. The demo loads no scripts.

All **eight original public rows** remain, plus **four explicit source click/theme
supplements**: **12 rows, 9 Verified ADAPTED native targets and 3 Intentionally omitted
theme contracts**. Source URL-derived `aria-current="location"` and last-child visual
current inference are replaced by author-owned `aria-current="page"`, not a new router.
Chromium exercised nav/list/link accessibility structure, current attributes, unavailable
keyboard exclusion, default native navigation/click events, new-tab noopener, custom/hidden/
nested separators, 280/320px wrapping, RTL, 200% CSS zoom, print/forced colors, separator-free
fallback, aggregate/widgets coexistence and JavaScript-disabled keyboard navigation.

Breadcrumb CSS is **928 gzip bytes / 1,500 ceiling**; component/demo JS is **zero**.
Core remains **14,611/15,000** and widgets **2,779/4,000** gzip bytes.
Thing's accepted native scope follows below. The master plan retains the current residual
inventory; the short queue ending with Breadcrumb did **not** complete P2.

### Thing: verified native CSS compound-content scope

The [Thing acceptance record](../components/thing.md) closes four retained tasks with
**455 passing tests**, including 12 Thing cases, build/budget gates and Chromium acceptance.
Seven authored regions preserve native articles/headings, images/SVG names, description,
rich content, footer and independent actions. CSS changes full-width versus indented
content/footer/actions without moving the avatar or replacing any nodes. Sparse and nested
Things remain independent; there is no Card/List/PageHeader runtime or stylesheet dependency.

All **16 original public rows** remain, plus **three explicit source theme supplements**:
**19 rows, 14 Verified ADAPTED native targets and 5 Intentionally omitted style/theme
contracts**. No size/alignment/prefix prop, render callback, provider or component constructor
is invented. Those visual customizations use ordinary external CSS.
Chromium exercised native anatomy/names, 60px indentation changes, hidden/template avatars,
nested/sparse regions, forms with externally associated submit/reset controls, keyboard/focus,
280/320px layouts, RTL, 200% CSS zoom, print/forced colors, aggregate/widgets coexistence and
JavaScript-disabled native GET forms.

Thing CSS is **841 gzip bytes / 1,000 ceiling**, with **zero component JS**.
Core remains **14,611/15,000** and widgets **2,779/4,000** gzip bytes.
Table's accepted native scope follows below. The master retains the current residual
inventory; full P2 still requires individual retained/omitted decisions and sign-off.

### Table: verified native CSS tabular scope

The [Table acceptance record](../components/table.md) closes four retained tasks with
**467 passing tests**, including 12 Table cases, build/budget gates and Chromium acceptance.
This is native Table, **not Data Table**: actual caption/rowgroups/headers/cells/colgroups,
scope/headers associations, spans and controls remain unchanged. CSS handles independent
border axes, bottom-edge combinations, density and striping without changing table display,
adding a renderer or manufacturing an interactive grid.

All **six original property rows** remain. **Five publicly named helper/default-content
groups** are now explicitly expanded from the public Components paragraph, separately from
**five source-only default-slot/type/theme entries**: **16 rows, 12 Verified ADAPTED native
targets and 4 Intentionally omitted contracts**. Native collapsed borders, body-row-header
treatment and visible-body-row striping deliberately differ from source separate-border/
td-only details; the canonical record describes those boundaries precisely.
Chromium checked all 16 border-flag combinations, native table/header/cell accessibility
structure, explicit associations, span geometry, width/alignment hints, stripes/sizes,
nested/hidden tables, keyboard/forms, LTR/RTL focus-revealed horizontal scrolling, 280/320px
and 200% CSS zoom, print/forced colors, legacy aggregate/plugins and no-JS GET submission.

Table CSS is **1,023 gzip bytes / 1,500 ceiling**, with **zero component JS**. Core stays
**14,611/15,000**, widgets **2,779/4,000**, advanced **2,181/3,000** gzip bytes.
Highlight's accepted literal-text scope follows below; it is distinct from Code syntax
highlighting. The master retains the current residual inventory.

### Highlight: verified bounded literal helpers and native marks

The [Highlight acceptance record](../components/highlight.md) closes four retained tasks
with **494 passing tests**, including 27 Highlight cases, build/budget gates and Chromium
acceptance. Automatic literal matching is provided through optional stateless ESM/classic
helpers and external mark CSS, not omitted in favor of static styling. A dedicated span's
explicit text argument owns/replaces its children; the host and surrounding controls remain
native. There is no custom-element lifecycle, global highlight registry or syntax engine.

All **seven original rows** remain with no added upstream rows: **five Verified ADAPTED
targets and two fully omitted style/tag rows**. Raw-regexp false mode is additionally
excluded within the always-literal auto-escape mapping. Source exposes no extra public
slot/event/theme surface. Matching has explicit empty/duplicate/input-order/non-overlap rules,
Unicode simple folding with original UTF-16 offsets, and text/pattern/work/match/class bounds.
Invalid/over-limit calls fail before DOM mutation; there is no broad fallback catch.

Chromium exercised literal HTML/metacharacters, Unicode offsets, case and class updates,
clear/error/selection behavior, hidden/RTL/narrow/zoom/print/forced-color paths, ESM/classic
equivalence, both legacy loading orders and a matching seven-mark no-JS fallback.
ESM/classic/CSS are **1,169/1,401/345 gzip bytes**, under **2,000/2,000/750** ceilings.
One helper mode plus CSS costs **1,514 (ESM)** or **1,746 (classic)** gzip bytes.
Core/widgets/advanced stay **14,611/2,779/2,181** within unchanged ceilings.
Affix's accepted native-sticky scope follows below; full P2 remains In progress.

### Affix: verified native CSS-sticky scope

The [Affix acceptance record](../components/affix.md) closes four retained tasks with
**504 passing tests**, including 10 Affix cases, build/budget gates and Chromium acceptance.
This is deliberately native sticky, not the source fixed/absolute trigger controller:
original content, normal-flow space/width, native controls and containing-block limits
remain. CSS owns logical start/end insets and local layers; no observer, polling, clone,
teleport or synthetic affixed-state notification is added.

All **six original property rows** remain plus **four explicit source deprecated/default-slot
supplements**: **10 rows, 3 Verified ADAPTED native targets and 7 Intentionally omitted
target/trigger/position/alias contracts**. Bottom-only normal-flow preconditions and
simultaneous-inset limitations are explicit, not disguised as viewport docking.
Chromium exercised window 8px/nested 12px/bottom 10px constraints, preserved width/flow,
native disclosure layout changes, short/transformed/overflow ancestors, early-bottom
counterexample, anchors/forms/focus, 280/320px widths, RTL/zoom, print/forced colors,
aggregate/plugins and no-JS sticking/navigation/forms.

Affix CSS is **270 gzip bytes / 500 ceiling**, with **zero component JS**. Core/widgets/
advanced remain **14,611/2,779/2,181** gzip bytes within unchanged ceilings.
Result's accepted native outcome scope follows below; full P2 remains incomplete.

### Result: verified native CSS outcome composition

The [Result acceptance record](../components/result.md) closes four retained tasks with
**516 passing tests**, including 12 Result cases, build/budget gates and Chromium acceptance.
Authored headings/messages, original simple artwork, content and native footer actions
retain their semantics and order. CSS provides eight status palettes and four sizes without
an HTTP handler, message/illustration generator, router, live region or component runtime.

All **seven original rows** remain plus **four explicit source type/theme supplements**:
**11 rows, 7 Verified ADAPTED native targets and 4 Intentionally omitted contracts**.
Upstream built-in/vendor illustration selection is deliberately replaced by authored SVG/
image/code-symbol content, not claimed as asset parity. Upstream also has no default title/
description message generator; native text and actions remain author-owned.
Chromium exercised headings/status words, all palette/size dimensions, custom SVG/image
names/replacement, native retry/reset/home/form/focus behavior, hidden/absent/nested regions,
280/320px/RTL/200% CSS zoom, print/forced colors, legacy coexistence and no-JS recovery paths.

Result CSS is **879 gzip bytes / 1,000 ceiling**, with **zero component JS**. Core/widgets/
advanced stay **14,611/2,779/2,181** gzip bytes within unchanged ceilings.
Code's accepted plain/native scope follows below; the master retains the current residual
queue before the deeper Float Button/Image work.

### Code: verified native plain/physical-line presentation

The [Code acceptance record](../components/code.md) closes four retained tasks with
**528 passing tests**, including 12 Code cases, build/budget gates and Chromium acceptance.
Native pre/code and inline code retain literal source/whitespace and author content.
Optional author/server-supplied physical-line spans use empty aria-hidden counter nodes,
preserving selected source without numeric text. No runtime is added merely to wrap
textContent, and no syntax engine, URI decoder, trim pipeline or clipboard action is shipped.

All **seven original rows** remain plus **seven explicit source private/default-slot/theme
supplements**: **14 rows, 6 Verified ADAPTED native targets and 8 Intentionally omitted
contracts**. The external hljs interface and language engine remain opaque exclusions.
Numbers are suppressed for inline or word-wrapped code. A final empty physical-line span
preserves trailing newline geometry, explicitly differing from the source's terminal-LF
numbering behavior. Reviewed token spans/colors are application-owned, not generated grammar output.
Chromium checked literal HTML/Unicode/tabs/CRLF, exact numbered Range/Selection text,
line geometry/wrap/inline/fonts, native scrolling/focus/navigation, RTL/zoom/print/forced
colors, Typography/legacy coexistence and no-JS rendering without touching the clipboard.

Code CSS is **1,087 gzip bytes / 1,500 ceiling**, with **zero component/demo JS**.
Core/widgets/advanced remain **14,611/2,779/2,181** gzip bytes within unchanged ceilings.
Scrollbar's accepted native-only record follows below. Whole P2 and deeper interaction
scopes remain open.

### Scrollbar: verified native-only scrolling

The [Scrollbar acceptance record](../components/scrollbar.md) closes four retained tasks
with **540 passing tests**, including 12 Scrollbar cases, build/budget gates and Chromium
acceptance. Real overflow elements keep native APIs/events, keyboard/wheel input, content,
form/focus behavior and platform scrollbars. Optional standards width/color/gutter hints
do not create rails or override OS overlay visibility policy. There is no runtime.

All **16 original public/inline rows** remain plus **11 explicit source declaration/internal
exclusion groups**: **27 rows, 12 Verified ADAPTED native targets and 15 Intentionally
omitted contracts/groups**. The public wrapper and internal implementation are distinguished;
no fake sync, reactive refs, resize callback, custom placement or advanced overload adapter
is implied. Native RTL coordinates and omitted-axis scrollTo behavior remain unnormalized.
Chromium exercised wheel/keyboard, numeric/options APIs/events, focus reveal, nested
chaining and explicit containment, native resizing, forms/disabled/reset, standards styling,
280/320px/RTL/zoom, print/forced-colors, legacy coexistence and no-JS paths.

Scrollbar CSS is **468 gzip bytes / 750 ceiling**, with **zero component JS**.
Core/widgets/advanced remain **14,611/2,779/2,181** gzip bytes within unchanged ceilings.
Float Button's native P2/P3 composition is accepted below; Image remains separate.

### Float Button and Group: verified native actions/popover scope

The [FloatButton/FloatButtonGroup acceptance record](../components/float-button.md) closes
four tasks with **552 passing tests**, including 12 focused cases, build/budget gates and
Chromium acceptance. Real buttons/links/groups retain native names, disabled/form/keyboard
semantics and order. Browser popover commands provide disclosure, dismissal and Tab behavior
without a menu runtime, hover-only access or synthetic ARIA menu.

All **20 original rows** remain plus **nine explicit source default-slot/callback-alias/
owner-theme supplements**: **29 rows, 22 Verified ADAPTED targets and 7 omitted entries**.
Hover-only opening and framework controlled/boolean-callback timing are explicit additional
exclusions in adapted disclosure rows. Native toggle is asynchronous/coalescing. The source
actually defaults width/min-height to 40 with no bottom default; public-table discrepancies
are recorded rather than copied into a false target contract.

Chromium exercised click/Enter/Space, form validity/reset/disabled state, native popover
open/close/Escape/outside dismissal/reopen, focus return and Tab order, 40px sizing, group
shape/position, fixed scrolling, RTL, narrow/short viewports, 200% CSS zoom, safe-area
clearance bounds, static fallback, print/forced colors, legacy coexistence and no-JS interaction.
CSS is **1,340 gzip bytes / 1,500 ceiling**, component JS **zero**; core/plugins are unchanged.
This is an authored fixed-corner popover dock, not universal anchor/flip geometry or all-P3 parity.
Image's accepted native/P6 boundary and P2 sign-off follow below. The broader P3 backlog
does not inherit this native component's acceptance.

### Image: verified native images, bounded fallback and owned dialog preview

The [Image/ImageGroup/ImagePreview acceptance record](../components/image.md) closes four
tasks with **583 passing tests**, including 31 Image cases, build/budget gates and Chromium
acceptance. Native img/picture/srcset/sizes/loading/alt/link attributes and listeners remain
authored. A small optional ESM/classic helper owns only loading/fallback state and its cloned
trusted native-dialog template; it does not regenerate thumbnails or hide lazy image boxes.

All **77 original property/slot/method/inline rows** retain owner/name/pinned identities.
**13 explicit source declaration groups** give **90 rows, 41 Verified ADAPTED targets and
49 omissions**. Reference-style links reduce repetition without changing source identities.
Circular group navigation, current/show, native close/cancel/focus, live URLs/membership,
bounded single-src fallback and stale-load/disconnect/reopen races are covered. Responsive
fallback mutation, drag/pinch, zoom/rotation/original-size transforms, default-show/src-list
renderers, VNode toolbars, tooltips, programmatic download/fullscreen and provider contracts
are explicitly outside the retained scope—not blanket viewer parity.

Chromium exercised local SVG loading (demo-server MIME corrected), responsive/native lazy
boxes, fallback/errors, unchanged thumbnails, dialog/group/nested ownership, cancel/focus/
removed-root cleanup, modifiers/targets/download non-interception, narrow/RTL/zoom, print/
forced colors, ESM/classic/core/plugin coexistence and ordinary no-JS full-image navigation.
ESM/classic/CSS are **3,430/3,665/656 gzip bytes**, under **4,000/4,000/1,000** ceilings.
One mode plus CSS costs **4,086 (ESM)** or **4,321 (classic)** gzip bytes. Core/plugins remain
**14,611/2,779/2,181** within unchanged limits and zero runtime dependencies.

The final catalog audit checked **all 96 routes and all 31 P2-assigned reference inventories**:
no retained Planned/Not reviewed/In progress/Implemented rows remain on those pages.
P2 is **Verified for its declared native scopes and omissions**, not full Naive UI or P6
viewer parity. At Image sign-off 19 P3-assigned routes remained Planned; **none remain after
Discrete API**, verified in the [complete P3 audit](migration-plan.md#p3-retained-scope-sign-off-after-discrete-api).
The Image sign-off recommended **Popover foundation before Tooltip/Popconfirm/Dropdown**; no next component was
implemented in this Image change.
P2 remains complete for its declared retained native scopes, not full upstream parity.

### Popover: verified native nonmodal foundation

[Popover's accepted record](../components/popover.md) adds a standalone native controller,
local anchor/fallback placement and external CSS; core and plugins are unchanged. Native
click commands own activation, auto popovers own light-dismiss/Escape/nesting, and the helper
adds hover/focus retention and delays plus explicit manual control. Authored nodes, native
forms/links and ARIA/style ownership survive teardown. Portalled nesting is rejected.

The [reference tracker](components/popover.md) preserves all 38 original owner/name/source
identities and adds 11 source-only supplements: **28 Verified adapted targets, 21 omissions**.
No controlled Vue props/default-show, renderer/provider/teleport, x/y virtual anchor, exact
arrow-center/wrapper, outside-reason callback or top-layer z-index management is claimed.
At Popover sign-off, four accepted tasks brought the index to **140/384**, across **35 pages**,
with **3,233 API tracker rows**. Tooltip's subsequent acceptance is recorded below; P3 remains incomplete.

**91 targeted integration tests** (52 Popover) and Chromium cover native click/keyboard/
Tab/dismissal/nesting, hover/focus/manual timing, forms/links, scroll/resize/clipping/RTL,
anchors and measured fallback, 320px boundaries, emulated 2x visual viewport, motion/print/
forced colors, state ownership/reconnect, unsupported static fallback, no-JS native click,
separate documents and both legacy load orders. No all-browser/AT certification is claimed.
ESM/classic/CSS measure **3,853/3,922/904 gzip bytes** against independent **4,000/4,000/1,000**
ceilings. One JS format plus CSS costs **4,757 (ESM)** or **4,826 (classic)** gzip bytes.
Core/advanced/widgets stay **14,611/2,181/2,779**, with unchanged ceilings and zero dependencies.

### Tooltip: verified native descriptive scope

[Tooltip acceptance](../components/tooltip.md) reuses the Popover controller/positioner while
separating descriptive ARIA, native source/invoker behavior, content validation and Escape.
Native manual popovers do not close unrelated auto peers. Hover and focus, pointer travel,
suppression/reentry, meaningful native actions, original describedby tokens and lifecycle
cleanup are accepted; there is no expanded/haspopup state, fake tab stop or focus transfer.
Interactive controls, forwarding labels, custom widgets and scrollable/long Tooltip content
are excluded. Essential help stays visible; rich actions belong in Popover.

The [tracker](components/tooltip.md) preserves all **36 original inherited owner/name/source
identities**, then adds **seven explicit source-only supplements**: **21 Verified adapted
targets and 22 omissions**. It does not copy Popover's header/footer/scrollable/click semantics.
At Tooltip sign-off the index recorded **3,240 rows**, **144/384 accepted tasks across 36 pages**.
P3-04 is Verified for these two retained scopes; overall P3 and later components remain
in progress/Planned. Popconfirm's subsequent acceptance follows below.

**121 targeted tests** (42 Tooltip, 52 Popover, 27 native/core), build/budgets and Chromium
cover description ownership, noninteractive policy, hover/focus/Escape/Tab/native actions,
nesting/peers, anchor/fallback/RTL/scroll/resize/320px/visual-viewport zoom, motion/print,
fallback/no-JS help, separate documents and both legacy load orders. Accessible-tree checks
confirm no implicit expanded/haspopup on the described trigger, not screen-reader certification.
Review fixes reject label activation and close descendants on native ancestor toggle even
without ResizeObserver.

Tooltip ESM/classic/complete composed CSS are **4,877/4,949/1,057 gzip bytes** within new
**5,000/5,000/1,250** ceilings; one JS format plus CSS costs **5,934/6,006**. The shared update
makes Popover ESM/classic **3,923/3,994**, still within unchanged 4,000 ceilings; its CSS stays
904. Core/advanced/widgets remain **14,611/2,181/2,779**, with no source/ceiling/dependency changes.

### Popconfirm: verified native asynchronous confirmation scope

[Popconfirm acceptance](../components/popconfirm.md) composes existing Popover visibility,
placement and CSS with local confirmation state. Named/described nonmodal role=dialog and
authored type=button decisions keep native form/keyboard/label behavior. Exactly false keeps
open; other fulfillment closes a current native panel; failure stays open with authored error
text, an explicit error event and rejected lastAction. Queued/pending locks and opening/action
identity protect new sessions, author-disabled state and detached UI. UI dismissal does not
cancel external side effects. Unsupported native popovers retain usable inline callbacks.

The [tracker](components/popconfirm.md) preserves **44 original identities** (10 local,
34 inherited), adds eight source-only supplements, and resolves **30 adapted targets plus
22 omissions**. No Button/VNode/theme/locale/provider forwarding, transient hover confirmation,
portal, virtual anchor or fake modal/trap is claimed. At Popconfirm sign-off the index had
**3,248 rows** and **148/384 accepted tasks across 37 pages**. Dropdown is accepted below.

**161 targeted tests** (40 Popconfirm, 52 Popover, 42 Tooltip, 27 native/core), build/budgets
and Chromium cover callbacks/false/rejection/duplicate/stale results, native forms/Tab/
Escape/outside/nesting, state ownership, fallback/realms/legacy orders and shared placement/
RTL/scroll/resize/zoom/motion/print. Review fixed real-native late preventDefault admission
and authored closing-listener focus. No all-browser/AT certification is claimed.
Standalone ESM/classic/complete CSS measure **6,247/6,320/1,162 gzip bytes**, within new
**6,500/6,500/1,250** budgets; one JS format plus CSS costs **7,409/7,482**.
Popover, Tooltip, core and plugins remain byte-for-byte source/size unchanged; prior ceilings
were not relaxed and runtime dependencies remain zero.

### Dropdown: verified native command-menu scope

[Dropdown acceptance](../components/dropdown.md) adds authored native action/link menus,
groups/dividers, string keys and nested submenus, not an option/VNode renderer. A small
scoped roving/typeahead primitive is ready for Menu as its next consumer. Native trigger
activation, first/last entry, directional/Home/End/typeahead, button/anchor activation,
logical RTL submenu arrows, deepest-child Escape, untrapped Tab and pointer-gap retention
are accepted. Native href/target/modifier/defaultPrevented behavior remains authoritative.

The [tracker](components/dropdown.md) preserves **69 original identities**, adds six explicit
source-only supplements, and resolves **42 adapted targets plus 33 omissions**. Numeric/raw
option callbacks, render widgets, root hover, check/radio roles, portals, raw and provider/
router forwarding are not claimed. At Dropdown sign-off the index had **3,254 rows** and
**152/384 accepted tasks across 38 pages**. Menu's acceptance follows below; P3 is incomplete.

**210 targeted tests** (48 Dropdown, 53 Popover, 42 Tooltip, 40 Popconfirm, 27 native/core),
build/budgets and Chromium cover deep nesting, native keyboard/forms/links, selection,
refresh/hidden/disabled ownership, reentrant disposal, hover gaps, RTL/scroll/resize/zoom,
fallback and legacy/standalone loading. Review fixed stale post-native operations after
disposal. Real deep menus required the narrow shared fix to stop clipping above an open
top-layer popover; no positioning engine was copied and prior ceilings still pass.

ESM/classic/complete CSS measure **8,726/8,801/1,465 gzip bytes** within new
**9,000/9,000/1,750** ceilings; one format plus CSS costs **10,191/10,266**.
The shared correction makes Popover **3,927/3,997**, Tooltip **4,882/4,953**, and Popconfirm
**6,250/6,323** ESM/classic gzip bytes, within unchanged limits. Core/advanced/widgets remain
**14,611/2,181/2,779**, unchanged. No all-browser/AT certification is claimed.

### Menu: verified native navigation/disclosure scope

[Menu acceptance](../components/menu.md) retains authored nav/lists/href/type=button/
details/summary rather than imposing ARIA command-menu roles. Native Tab/activation,
selection/current-choice, expanded/default keys, root accordion, overall disclosure
collapse, showOption and vertical/horizontal shortcuts are accepted. Normal links keep
aria-current/router ownership; CSS wrapping does not pretend to be overflow packing.
The existing keyboard primitive is reused in nonroving mode, preserving Dropdown behavior.

All **48 original public identities** remain in the [tracker](components/menu.md), plus
eight source-only groups: **36 adapted targets, 20 omissions**. No icon-only rail, popup
menubar/Dropdown forwarding, option renderer, provider or responsive overflow engine is
claimed. At Menu sign-off the catalog recorded **3,262 rows** and **156/384 accepted tasks
across 39 pages**. Tabs is accepted below; P3 remains incomplete.

**113 targeted tests** (37 Menu, 49 Dropdown/shared keyboard, 27 native/core), build/budgets
and Chromium cover native navigation/Tab/keys, disclosure state/focus, selection/native
actions, groups/disabled/refresh, modifiers/current-route preservation, RTL/narrow/zoom,
fallback, print and legacy/standalone loading. Review fixes preserve still-focused keyboard
position and accepted selections across routine refresh.
Menu ESM/classic/CSS measure **5,815/5,883/993 gzip bytes**, within **6,000/6,000/1,250**
new ceilings; one format plus CSS is **6,808/6,876**. Dropdown becomes **8,767/8,840** within
unchanged 9,000 ceilings; core/plugins and Popover-family assets remain unchanged.

### Tabs / Tab / TabPane: verified paired native scope

[Tabs acceptance](../components/tabs.md) establishes real authored tablist/tab/tabpanel
relationships, single roving focus, automatic/manual activation, orientation/RTL and native
hidden panes without destroying content. Paired Tab/TabPane label/disabled/close/content
contracts, external add/close intents and native scrolling/styles are accepted. Boolean
leave guards preserve old panes on false/rejection, expose errors and prevent stale/reentrant
requests from selecting wrong nodes or stealing focus. Direct value overrides remain silent.

The [tracker](components/tabs.md) preserves **44 original identities** across every companion,
plus six source-only groups: **40 adapted targets, 10 omissions**. Renderer/lazy directives,
label-only Tab, numeric/VNode/prop forwarding, hover, generated scroll controls and measured
indicator synchronization are excluded. At Tabs sign-off the catalog had **3,268 rows** and
**160/384 accepted tasks across 40 pages**. Collapse is accepted below; P3 remains incomplete.

**69 targeted tests** (42 Tabs, 27 native/legacy), build/budgets and Chromium cover real
roles/keyboard/Tab/forms, pane-state preservation, nested isolation, guard races/reentrant
requests, explicit override priority, captured close targets, add-template/removal focus,
all placements/RTL, narrow/zoom/motion/print, fallback and legacy/standalone composition.
ESM/classic/CSS measure **5,325/5,393/1,338 gzip bytes** under new **6,000/6,000/1,750** limits;
one format plus CSS is **6,663/6,731**. Core/plugins and previous optional sources/ceilings
are unchanged. No all-browser or AT certification is claimed.

### Collapse / CollapseItem: verified native disclosure scope

[Collapse acceptance](../components/collapse.md) keeps details/summary and external CSS as
the baseline. The small optional helper aggregates string open keys, scopes exclusive names,
blocks disabled summary activation without hiding its label, and reports native toggle/
header events with explicit asynchronous/programmatic timing. Header extras are safe siblings;
no duplicate expanded roles, renderer, height measurement or CollapseTransition dependency.

The [tracker](components/collapse.md) preserves **27 original identities** and adds six
source-only groups: **19 adapted targets, 14 omissions**. Trigger-area/slot-prop render
objects, lazy mounting, random/numeric names and provider/transition machinery are excluded.
At Collapse sign-off the catalog had **3,274 rows** and **164/384 accepted tasks across
41 pages**. Anchor is accepted below; P3 remains incomplete and CollapseTransition stays separate.

**60 targeted tests** (33 Collapse, 27 native/legacy), build/budgets and Chromium cover native
pointer/Enter/Space/Tab, exclusive nested/independent names, readable disabled activation,
safe extra actions/forms, focus/refresh/transferred ownership, no-JS/native fallback,
RTL/narrow/zoom/motion/print and standalone/legacy composition. Review fixes cover nested
extras, moved disabled items, initial focus and explicit direct-button types.
ESM/classic/CSS are **3,784/3,855/819 gzip bytes** under new **4,000/4,000/1,000** ceilings;
one format plus CSS is **4,603/4,674**. All prior bundles/limits and core/plugins remain unchanged.

### Anchor / AnchorLink: verified native fragment and location scope

[Anchor acceptance](../components/anchor.md) retains native nested links/hash/history/focus
and adds deterministic location tracking, explicit roots/offsets, gap/short-final rules,
safe decoded IDs and native reduced-motion scrolling. No click hijack, router, generated
TOC, measured rail animation, Affix/Scrollbar dependency or polling loop is introduced.
Per-link ownership and live root/scroll-plane validation protect nested/moved content.

The [tracker](components/anchor.md) preserves **11 original identities**, adds six source-only
supplements, and resolves **12 adapted targets plus 5 omissions**. At Anchor sign-off the catalog had
**3,280 rows**, **168/384 accepted tasks across 42 pages**. Back Top is accepted below;
P3 remains in progress.

**62 targeted tests** (35 Anchor, 27 native/legacy), build/budgets and Chromium cover native
Unicode/hash/Back/focus, nested-root gaps/end boundaries, ownership transfers, root changes,
RTL/zoom/motion/print, no-JS/modifiers and standalone/legacy composition. Review fixes prevent
cross-controller marker restoration and stale scroll-plane/root validity.
ESM/classic/CSS are **3,991/4,060/672 gzip bytes** under new **4,500/4,500/1,000** limits;
one format plus CSS is **4,663/4,732**. All prior bundles and ceilings remain unchanged.

### Back Top: verified native return and threshold scope

[Back Top acceptance](../components/back-top.md) retains fully native fragment links and typed
explicit-root buttons, inclusive threshold/show state, focus-held visibility and native scrolling.
It reuses Anchor's native root context unchanged, preserves horizontal position and respects
reduced motion. External CSS supplies logical placement, safe areas, size/shape and hidden/focus
states. No portal, mutation observer, provider, animation engine or mandatory Float Button asset.

The [tracker](components/back-top.md) preserves **seven original identities** and adds nine
explicit source supplements: **10 adapted targets, six omissions**. At Back Top sign-off the catalog had
**3,289 rows**, **172/384 accepted tasks across 43 pages**. Pagination is accepted below;
P3 remains incomplete.

**104 targeted tests** (42 Back Top, 35 Anchor, 27 native/legacy), build/budgets and Chromium
cover native keyboard/links/forms/cancellation, threshold/focus/Tab, scroll-root isolation and
x preservation, refresh/disposal, RTL/narrow/zoom/motion/print, fallback and loading coexistence.
Read-only review fixed portable test paths. ESM/classic/CSS are **3,212/3,281/682 gzip bytes**
under new **3,500/3,500/1,000** limits; one format plus CSS is **3,894/3,963**.
All previous optional/core/plugin sources, outputs and ceilings remain unchanged.

### Pagination: verified bounded native paging scope

[Pagination acceptance](../components/pagination.md) retains item/page-count precedence,
safe numeric state, defaults and silent clamp, a bounded keyed page/gap-button window,
native size/jump controls and combined cancelable request/accepted-change events.
Authored nav/labels/controls/templates and server-link fallback remain native; no router,
data fetch, VNode renderer, hover range dropdown or mandatory Select/InputNumber dependency.

The [tracker](components/pagination.md) preserves **42 original identities** and adds thirteen
source supplements: **36 adapted targets, 19 omissions**. At Pagination sign-off the catalog had **3,302 rows**,
**176/384 accepted tasks across 44 pages**. Steps is accepted below, and P3 remains incomplete.
**80 targeted tests** (53 Pagination, 27 native/legacy), build/budgets and Chromium cover
huge/zero/shrinking totals, native keyboard/forms/validity, size/cancellation, current/focus,
ownership/replacements/disposal and responsive/RTL/zoom/fallback/loading behavior.
Review fixes prevent untouched jump inputs blocking unrelated forms and modified Enter submitting.
ESM/classic/CSS are **5,011/5,080/816 gzip bytes** under new **5,500/5,500/1,250** ceilings;
one format plus CSS is **5,827/5,896**. Previous optional/core/plugin outputs and ceilings are unchanged.

### Steps / Step: verified native progress and intent scope

[Steps acceptance](../components/steps.md) keeps an ordered native summary, chosen heading
levels, explicit status words/icons and optional typed selection-intent buttons. Current
identity survives refresh; per-item states override current defaults, and earlier positions
never imply completed business work. Links, forms and native Tab/Enter/Space remain native.
No wizard, tabpanel, provider, renderer, layout polling or automatic advancement.

The [tracker](components/steps.md) preserves **16 original identities** and adds seven explicit
source supplements: **16 adapted targets, seven omissions**. At Steps sign-off the catalog had **3,309 rows**,
**180/384 accepted tasks across 45 pages**, with **eight Planned P3 routes**.
The declared **P3 navigation workstream is Verified for retained scopes**, not global P3.
Loading Bar, Dialog, Modal, Drawer, Message, Notification and Collapse Transition are accepted
below; Discrete API remains separate.

**70 targeted tests** (43 Steps, 27 native/legacy), build/budgets and Chromium cover native
list/status/current semantics, intents/cancellation/forms, disabled/hidden/nested items,
identity/ownership/focus, orientation/RTL/narrow/zoom and native fallback/coexistence.
Review fixed CSS-hidden ancestor focus recovery. ESM/classic/CSS are **3,540/3,611/1,081 gzip
bytes** under new **4,000/4,000/1,250** ceilings; one format plus CSS is **4,621/4,692**.
All previous optional/core/plugin sources, outputs and ceilings are unchanged.

### Loading Bar: verified root-owned native lifecycle

[Loading Bar acceptance](../components/loading-bar.md) retains explicit start/finish/error on
an authored named progress/status surface, with indeterminate unknown work, caller-supplied
measurements, first-outcome retention, guarded terminal holds and UI-only stop/reset.
Independent roots, passive semantics and conditional attribute/text restoration replace a
provider, global request singleton or cosmetic percentage simulation.

The [tracker](components/loading-bar.md) preserves **10 original identities** and adds eight
explicit source supplements: **10 adapted targets, eight omissions**. At Loading Bar sign-off the catalog had
**3,317 rows**, **184/384 accepted tasks across 46 pages**, with **seven Planned P3 routes**.
Dialog, Modal, Drawer, Message, Notification, Collapse Transition and Discrete API are now accepted below. Navigation remains accepted for
its declared retained scopes; global P3 and managed feedback are not complete.

**74 targeted tests** (47 Loading Bar, 27 native/legacy), build/budgets and Chromium cover
native naming/values/error words, terminal/restart races, separate roots, ownership/removal,
focus/form noninterference and reduced-motion/forced-color/RTL/zoom/fallback/coexistence.
Review fixes preserve terminal acceptance after hide, validate status-marker identity and
require error text outside progress. ESM/classic/CSS are **2,627/2,700/826 gzip bytes** under new
**3,500/3,500/1,250** ceilings; one format plus CSS is **3,453/3,526**.
All prior optional/core/plugin sources, outputs and ceilings remain unchanged.

### Dialog: verified native content, lifetime and decisions

[Dialog acceptance](../components/dialog.md) separates CSS-only authored content from
native dialog lifetime and optional false/Promise decisions. Native modal/modeless modes,
Escape/cancel/returnValue, validated method=dialog forms, guarded pending/error outcomes
and explicit template ownership replace framework injection, not browser top-layer behavior.
Legacy MuiDialog remains unchanged. Modal can reuse the isolated native lifetime/CSS.

The [tracker](components/dialog.md) preserves **105 original owner/name/source identities**,
adds **10 source-only supplements and six explicit inherited options**, and closes
**121 rows: 80 Verified adapted targets, 41 omissions**. At Dialog sign-off the catalog had **3,333 rows**,
**188/384 accepted tasks across 47 pages**, with **six Planned P3 routes**.
Modal, Drawer, Message, Notification, Collapse Transition and Discrete API are now accepted below, each with separate acceptance evidence.

**157 targeted tests** (59 Dialog, 31 Image, 40 Popconfirm, 27 native/legacy),
build/declarations/budgets and Chromium acceptance cover real native forms,
modal/modeless focus, nested top layers, cancellation, backdrop pointer guards, false/reject/
async duplicate and stale/reentrant/removal cases, 320px RTL/2x CSS zoom, motion/forced colors/
print, script-blocked native fallback and ESM/classic/legacy coexistence. Review fixes protect
focus/close/disposal reentrancy and reparented removal observation; browser acceptance fixed
viewport-relative height overflowing at CSS zoom. Exact counts/measurements are in the
canonical record. ESM/classic/CSS are **4,319/4,442/1,007 gzip bytes** under
**5,500/5,500/1,500** ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**.
No body-scroll lock, provider/reactivity, drag/positioning engine, render
callbacks, theme forwarding or all-browser/AT certification is claimed.

### Modal: verified generic native top layer

[Modal acceptance](../components/modal.md) retains a strict real showModal path and an
explicit modeless/inline alternative, native names/focus/forms/cancel/returnValue and
owner-local template collections. It reuses only the native lifetime, not Dialog's decision
footer. Card-intent and Dialog-CSS presets are authored content, not forwarded prop/render
objects or a confirmation service. No page scroll lock or global focus manager is added.

The [tracker](components/modal.md) retains **121 original identities**, including the
duplicated Provider table and all preset/Options/Reactive inheritance, and adds **30 source
supplements plus three inherited fields**. **154 rows: 74 adapted targets, 80 omissions.**
At Modal sign-off catalog totals were **3,366 rows**, **192/384 accepted tasks across 48 pages**, with
**five Planned P3 routes** at that checkpoint. The remaining retained P3 scopes are accepted below; the final audit closes P3 without claiming framework parity.

**130 targeted tests** (44 Modal, 59 Dialog, 27 native/legacy), build/declarations/budgets
and Chromium cover real modal/background focus, native forms/returnValue/cancel/nesting,
backdrop pointer guards, direct native and reordered reopen lifetimes, scoped disposal,
body-style noninterference, explicit fallback/coexistence and narrow RTL/2x zoom/media.
Review corrected bulk destruction to follow current opening/focus order rather than stale
creation order. ESM/classic/CSS are **3,533/3,661/933 gzip bytes**, under
**4,000/4,000/1,250** ceilings; one format plus CSS is **4,466/4,594**.
Shared sources and Dialog outputs remain unchanged, as do core/advanced/widgets
**14,611/2,181/2,779**. No all-browser/AT or framework transition/preset certification.

### Drawer/DrawerContent: verified native edge panels

[Drawer acceptance](../components/drawer.md) retains physical edge docking, explicit
LTR/RTL logical aliases, external CSS extents, native modal/modeless lifetime, authored
header/body/footer/close anatomy and native body/form behavior. A short-height whole-panel
scroll fallback keeps controls reachable. No pointer resizer, page lock, provider, custom
scrollbar, animation engine or inferred heading level is added.

The [tracker](components/drawer.md) preserves **47 original identities** and adds **20
source supplements**: **67 rows, 30 adapted targets and 37 omissions**. At Drawer sign-off catalog totals were
**3,386 rows**, **196/384 accepted tasks across 49 pages**, with **four Planned P3 routes**.
P3-03 modal surfaces are accepted for declared native scopes, not framework parity.
Message, Notification and Collapse Transition are now accepted below; **Discrete API remains pending.**

**197 targeted tests** (36 Drawer, 44 Modal, 59 Dialog, 31 Image, 27 native/legacy),
build/budget gates and Chromium cover all physical/logical edges and RTL, native forms
including implicit Enter/default submitter, nested Modal/Image focus, native cancellation/
backdrop, current-opening-order teardown, removal/local-check races, external CSS sizes,
320px/2x zoom/short-height scrolling, media, explicit fallback and legacy coexistence.
Review fixed shared-base CSS load-order interference and the demo's first submitter
accidentally bypassing required-field validation. Exact measurements are in the canonical
record; all shared sources and previous optional/core/plugin ceilings remain unchanged.
Drawer ESM/classic/CSS are **3,956/4,082/1,195 gzip bytes** under
**4,750/4,750/1,500** ceilings; one format plus CSS is **5,151/5,277**.
Core/advanced/widgets remain **14,611/2,181/2,779**.

### Message: verified bounded native feedback

[Message acceptance](../components/message.md) retains explicit create/type methods, safe
native text/templates, typed updates, persistent/loading states and scoped destroy methods.
One polite announcer per owner avoids duplicate item live regions; visible kind/error words
do not rely on color. Remaining-time hover/keyboard focus holds protect reading/editing.
Capacity rejects instead of evicting focused items or adding hidden queues.

The [tracker](components/message.md) preserves **47 original identities** and adds **20
source supplements**: **67 rows, 35 adapted targets and 32 omissions**. At Message sign-off catalog totals were
**3,406 rows**, **200/384 accepted tasks across 50 pages**, with **three Planned P3 routes**.
Notification, Collapse Transition and Discrete API are now accepted below.

**86 targeted tests** (59 Message, 27 native/legacy), build/budgets and Chromium cover
native close/form/focus behavior, actual hover/focus expiry protection, updates/restarts,
capacity and reentrant construction, close errors, ownership/removal, modal-local roots,
live-tree policy, physical placement/RTL/zoom/media and fallback/legacy coexistence.
Review fixes reserve capacity during template import and suppress fallback focus on
automatic anatomy teardown; clocks are one-shot, and templates use the active document.
ESM/classic/CSS are **4,739/4,860/1,136 gzip bytes** under **6,000/6,000/1,750** ceilings;
one format plus CSS is **5,875/5,996**. Legacy output, prior source/assets/ceilings and
core/advanced/widgets **14,611/2,181/2,779** are unchanged. No all-browser/AT certification,
renderer/provider, animation framework or OS notification side effects are claimed.

### Notification: verified native cards and guarded close

[Notification acceptance](../components/notification.md) retains explicit owner/type methods,
native article/heading/avatar/content/meta/action anatomy, typed updates and persistent
focus/hover-protected lifetimes. Unlike Message's void callback, Notification retains actual
false/Promise/rejection close veto with pending state, surfaced errors and stale protection.
One authored polite/assertive/off policy belongs to the owner, never every card implicitly.

The [tracker](components/notification.md) preserves **39 original identities** and adds
**20 source supplements plus two inherited fields**: **61 rows, 39 adapted targets and
22 omissions**. At Notification sign-off totals were **3,428 rows**, **204/384 accepted tasks across 51 pages**,
with **two Planned P3 routes**. Collapse Transition is accepted below; **next Discrete API**.

**143 targeted tests** (57 Notification, 59 Message, 27 native/legacy), build/budgets and
Chromium verify native forms/actions/focus, async close/pending/false/rejection, updates/
capacity/expiry/ownership, modal-local roots, policy/ARIA tree, physical placement/RTL/zoom/
media and fallback/legacy coexistence. Review fixes protect new pending attributes from old
restoration callbacks and prevent superseded painting from restarting expiry.
ESM/classic/CSS are **6,291/6,423/1,339 gzip bytes** under **6,500/6,500/2,000** ceilings;
one format plus CSS is **7,630/7,762**. Message outputs stay **4,739/4,860/1,136**;
core/advanced/widgets stay **14,611/2,181/2,779**. No prior ceiling changed, no OS notification
side effects, and no all-browser/AT/framework-transition certification.

### Collapse Transition: verified optional native motion

[Collapse Transition acceptance](../components/collapse-transition.md) adopts stable native
outer/inner content with WAAPI height snapshots, inert while clipped and native hidden at
settled close. It preserves content/forms/author styles and does not modify or make existing
Collapse depend on motion. Reduced/print/unsupported paths are immediate; no rendering/
ResizeObserver/animation framework is added.

The [tracker](components/collapse-transition.md) preserves **four original identities** and
adds **16 explicit source/internal-hook/style supplements**: **20 rows, eight adapted
targets and 12 omissions**. At Collapse Transition sign-off totals were **3,444 rows**, **208/384 accepted tasks
across 52 pages**, with **one Planned P3 route: Discrete API**.

**160 targeted tests** (43 transition, 33 Collapse, 57 Notification/shared ownership,
27 native/legacy), build/budgets and Chromium verify real geometry/inert/focus, same-target/
reversal/cancel/finish, current intrinsic content release, hook/reentrant errors, removal,
author attributes/styles, 320px RTL/2x zoom, motion/print/fallback and coexistence.
Review fixes preserve start/after-hook order during reentrant finish and abort on lost
clipping; same-task removal is disposal, not a spurious animation failure.
ESM/classic/CSS are **3,715/3,837/274 gzip bytes** under **4,500/4,500/750** ceilings;
one format plus CSS is **3,989/4,111**. All prior sources/outputs/ceilings remain unchanged,
including core/advanced/widgets **14,611/2,181/2,779**. No arbitrary geometry or all-browser/
AT/framework-transition parity is claimed. Discrete API is resolved below and the final P3 audit is complete.

### Discrete API: verified composition, no new runtime

[Discrete acceptance](../components/discrete.md) resolves the useful outside-framework
capability through existing selected native Message/Notification/Loading Bar/Dialog/Modal
owners. The real demo uses conditional imports, authored roots/templates and explicit,
ordered, reported/retryable application cleanup. No library createDiscreteApi, hidden app,
provider graph, reactive context bridge, new distribution/export or budget is added.

The [tracker](components/discrete.md) preserves **16 original identities** and adds **12
source supplements**: **28 rows, seven adapted capabilities and 21 omissions**. At Discrete
sign-off catalog totals were **3,456 rows**, **212/384 accepted tasks across 53 pages**.
**307 targeted tests** (14 composition plus 293 existing owner/native tests), unchanged
build/budgets and Chromium validate selected imports, all-five composition, modal-local
feedback, nested pending cleanup, focus, partial setup/disposal error reporting/retry,
unowned-resource preservation and native fallback.

**Complete P3 audit:** all **22 P3-assigned pages** (including mixed Ellipsis/Float Button/
Layout assignments), **1,086 tracker rows = 631 Verified adapted + 455 omitted**, and
**88/88 page tasks** are resolved. There are **zero Planned P3 routes and zero unresolved
retained rows**. P0 and P4+ do not inherit this status. Existing assets and all byte ceilings
remain unchanged; core/advanced/widgets are **14,611/2,181/2,779 gzip bytes**.

No P4 implementation began in the Discrete commit. Input's subsequent acceptance follows.

### Input: first accepted P4 native control

[Input acceptance](../components/input.md) retains authored native Input/textarea,
InputGroup/InputGroupLabel and pair/affix structure, optional clear, click-password reveal,
UTF-16 text count and CSS field-sizing. Native fields retain identity, value/default,
selection/composition, constraints, fieldset/readonly, form association/reset/submission.
There is no new Custom Element, hidden proxy value, model, provider or schema validator.

All **52 original identities** plus **19 explicit source-only supplements** are reconciled:
**71 rows = 58 Verified adapted targets + 13 Intentionally omitted**. At Input sign-off totals were
**3,475 rows**, **216/384 accepted tasks across 54 pages**, with **16 Planned P4 routes**.
Checkbox is accepted below; Radio/Switch/Select and other native controls precede Form enhancements.
The canonical record links
targeted tests, Chromium acceptance, independent assets and unchanged previous outputs.
**189 targeted tests** passed, including 52 Input cases. ESM/classic/CSS are
**3,110/3,180/1,267 gzip bytes** under new **4,000/4,000/1,750** limits; all 121 previous
top-level JS/CSS outputs are byte-identical. Chromium covers native editing/IME/paste,
forms/reset, clear/reveal/count, CSS sizing/media/no-JS and both legacy loading orders.

### Checkbox: native checkedness and bounded groups

[Checkbox acceptance](../components/checkbox.md) retains CSS-only native labelled checkboxes
and explicit fieldset/legend groups, selected native-string operations, min/max interaction
limits and one aggregate user-change snapshot. Native checked/default/mixed state, Space,
label activation, disabled fieldsets, form ownership/reset and submission remain browser-owned.
Click cancellation uses native pre-activation rollback; derived ARIA never disables checked
controls for submission. There is no unchecked proxy value, options renderer or Form validator.

All **29 original identities** plus **13 source supplements** are reconciled:
**42 rows = 28 Verified adapted targets + 14 Intentionally omitted**. At Checkbox sign-off totals were
**3,488 rows and 220/384 accepted tasks across 55 pages**, with **15 Planned P4 routes**.
Radio is accepted below; Switch/Select/native controls precede Form enhancements.
The canonical record contains targeted tests, real Chromium acceptance and independent
ESM/classic/CSS accounting; previous outputs and ceilings are preserved.
**124 targeted tests** (45 Checkbox, 52 Input, 27 native), build/budgets and Chromium
passed. ESM/classic/CSS are **2,171/2,246/741 gzip bytes** within new
**3,500/3,500/1,000** ceilings. All **124 previous top-level JS/CSS assets** remain
byte-identical; standalone Checkbox needs no JS.

### Radio: native exclusivity, group boundaries and segmented labels

[Radio acceptance](../components/radio.md) retains CSS-only native Radio/RadioButton and
an optional complete-native-group helper: common nonempty names, actual form/tree scope,
strict string keys, silent selection, native defaults/reset and one user-change snapshot.
No second arrow/roving/click engine, renamed controls, hidden values or radiogroup role.
Outside peers invalidate enhancement without falsifying native exclusivity/submission.

All **20 original identities** plus **14 source supplements** resolve to **34 rows:
23 Verified adapted targets + 11 Intentionally omitted**. At Radio sign-off totals were
**3,502 rows and 224/384 accepted tasks across 56 pages**, with **14 Planned P4 routes**.
Switch is accepted below; Select/native controls precede Form enhancements.
**165 targeted tests**, build/budgets and real Chromium acceptance passed; jsdom native
form-owner/cancellation limitations are explicitly recorded rather than patched in production.
ESM/classic/CSS are **1,751/1,819/958 gzip bytes** under **3,000/3,000/1,250** ceilings.
All **127 previous top-level JS/CSS outputs** are byte-identical.

### Switch: native binary state and focus-safe loading

[Switch acceptance](../components/switch.md) retains one native checkbox with switch
semantics, stable label, CSS rail/thumb/shape/size/state decorations and optional reversible
loading. Native checked/defaultChecked are not value/defaultValue submission strings.
Loading cancels native activation without hiding/disabling the focused control or removing
checked form values. No mixed state, unchecked proxy, async service or duplicate toggle engine.

All **23 original identities** plus **eight source supplements** resolve to **31 rows:
17 Verified adapted targets + 14 Intentionally omitted**. At Switch sign-off totals were
**3,510 rows and 228/384 accepted tasks across 57 pages**, with **13 Planned P4 routes**.
P4-02 Checkbox/Radio/Switch retained scope is Verified; Select is accepted below.
**163 targeted tests**, build/budgets and Chromium native/AX-tree/media/
no-JS/coexistence acceptance passed. ESM/classic/CSS are **2,268/2,343/1,119 gzip bytes**
under **3,500/3,500/1,250** ceilings; all **130 prior top-level JS/CSS assets** are unchanged.

### Select: native values, clear and external literal filtering

[Select acceptance](../components/select.md) retains authored select/options/optgroups,
single/multiple native values/defaultSelected/reset, strict string keys, clear and optional
literal filtering of native lists. Selected nonmatches stay selected/visible and are never
removed for filtering; disabled native submission rules stay browser-owned. Native popup
keyboard/painting remains native, with no hidden combobox proxy or rich renderer.

All **79 original identities** plus **19 source supplements** resolve to **98 rows:
35 adapted targets + 63 explicit omissions**, with **zero inherited Select rows**.
At Select sign-off totals were **3,529 rows and 232/384 accepted tasks across 58 pages**,
with **12 Planned P4 routes**; rich P5 surfaces are not shipped.
Input Number is accepted below; Slider/Rate/native controls precede Form.
**164 targeted tests**, build/budgets and Chromium single/multiple/forms/filter/composition/
picker/media/no-JS/coexistence acceptance passed. ESM/classic/CSS are **3,440/3,515/780 gzip
bytes** under **4,000/4,000/1,000** ceilings. All **133 prior top-level JS/CSS assets** remain
byte-identical. Native-only jsdom disabled-option FormData limitations are documented,
not patched into production.

### Input Number: native numeric editing and stepping

[Input Number acceptance](../components/input-number.md) retains the original number input,
native valueAsNumber/defaultValue/validity/form state and optional named step/clear actions.
Native stepUp/stepDown, including a strictly local never-inserted probe, handles decimal/
grid/bound rules. Empty/badInput are not zero; typed invalid numbers are not clamped.
There is no parser/formatter/precision library, duplicate key/wheel engine or hidden value.

All **36 original identities** plus **ten source supplements** resolve to **46 rows:
33 adapted targets + 13 omissions**. At Input Number sign-off totals were **3,539 rows and 236/384 accepted
tasks across 59 pages**, with **11 Planned P4 routes**.
Slider is accepted below; Rate/native controls precede Form. **116 targeted tests**, build/budgets
and Chromium numeric/keyboard/draft/forms/focus/media/no-JS/core+widgets coexistence passed.
ESM/classic/CSS are **2,859/2,932/770 gzip bytes** within **3,500/3,500/1,000** ceilings.
All **136 prior top-level JS/CSS outputs** are byte-identical.

### Slider: native ranges and reset-safe independent pairs

[Slider acceptance](../components/slider.md) retains the real range input, native dragging/
keys/sanitization/defaults/forms, datalist ticks and non-live output formatting. Optional
pairs are two labelled tracks with crossing allowed, not a fake dual-thumb track: endpoint
bounds never derive from each other, so native reset restores authored defaults immediately.
No hidden tuple value, gesture engine or Tooltip dependency.

All **19 original identities** plus **nine source supplements** resolve to **28 rows:
13 adapted targets + 15 omissions**. At Slider sign-off totals were **3,548 rows and 240/384 accepted
tasks across 60 pages**, with **10 Planned P4 routes**. Rate is accepted below.
**101 targeted tests**, build/budgets and Chromium native/pair/reset/output/direction/media/
no-JS/coexistence acceptance passed. jsdom sanitization and Chromium CDP formatted-valuetext
limits are explicitly recorded; no proxy/role workaround is claimed.
ESM/classic/CSS are **2,612/2,680/676 gzip bytes** under **3,500/3,500/1,000** ceilings;
all **139 previous top-level JS/CSS assets** are unchanged.

### Rate: bounded native scoring and explicit clear

[Rate acceptance](../components/rate.md) reuses Radio's native name/form/tree/keyboard
contract with bounded authored integer/half choices, explicit zero versus no selected
field, clear and non-live readout. Readonly is static score text, not a hidden form value;
disabled interactive radios retain native form behavior. No star/VNode/gesture renderer.

All **13 original identities** plus **six source supplements** resolve to **19 rows:
13 adapted targets + six omissions**. At Rate sign-off catalog totals were **3,554 rows and 244/384 accepted
tasks across 61 pages**, with **nine Planned P4 routes**. P4-04's retained native numeric/
bounded workstream is Verified; overall P4 is not. Form is accepted below.
**102 targeted tests**, build/budgets and Chromium score/half/clear/readonly/native-key/
form/reset/focus/media/no-JS/core+widgets coexistence passed. ESM/classic/CSS are
**3,904/3,976/1,097 gzip bytes** within **4,000/4,000/1,500** ceilings, including reused
Radio code. All **142 previous top-level JS/CSS outputs**, including Radio, are unchanged.

### Form / FormItem / FormItemGi: native coordination, not a schema or submit engine

[Form acceptance](../components/form.md) coordinates actual fields, literal/repeated names,
external associations, native constraints, explicit feedback and native item/grid CSS.
One optional callback per item uses frozen all-field snapshots and AbortSignal; newer
edits/Rate clears/resets/refresh/removal/disposal invalidate stale work. No control values,
defaults, setCustomValidity messages, noValidate or submit handlers are taken over.
The application-owned local submit recipe preserves submitter and latest-intent semantics;
custom results do not silently block native submission or bypass native invalid timing.

All **93 original identities** plus **18 explicit source supplements** resolve to **111 rows:
68 adapted targets + 43 omissions**. Four tasks close. At Form sign-off the catalog had **3,572 rows,
248/384 accepted tasks across 62 pages**, with **136 unchecked tasks**. Native field/grid
and async/error/feedback/reset tests, Chromium forms/focus/no-JS/RTL/zoom/media/coexistence
and the independent build/budget gates are recorded in the canonical acceptance.
A read-only review found unmapped Rate-clear cancellation and deferred-reset generation
defects; both were fixed and regression-tested. **143 prior top-level JS/CSS assets** were
byte-compared against the pre-Form HEAD build recipe; all match. Core/advanced/widgets
remain **14,611/2,181/2,779 gzip bytes**, under unchanged **15,000/3,000/4,000** ceilings.

**P4-05 is Verified for this retained native scope, not all P4.** At that checkpoint, Planned routes were:
**Auto Complete, Color Picker, Date Picker, Dynamic Input, Dynamic Tags, Input OTP, Mention,
Time Picker**. Auto Complete is accepted below, reusing Input/native datalist rather
than importing a rich selection schema or model store.

### Auto Complete: native datalist and bounded suggestion loading

[Auto Complete acceptance](../components/auto-complete.md) retains original native fields,
authored/shareable static datalists, free text, defaults/reset and native keyboard/form
behavior. Optional exclusive writers support bounded strict results, debounce/minLength,
AbortSignal, composition/reset generations, native value snapshots and reversible option/
template ownership. Existing Input clear/setters and Form feedback coexist without ARIA
rewrites, hidden values, a second editing engine or an HTTP client.

All **46 original identities + ten source supplements = 56 rows: 27 adapted targets and
29 omissions**. Four tasks close; at Auto Complete sign-off catalog totals were **3,582 rows, 252/384 accepted
tasks across 63 pages**, with **132 unchecked tasks**. **213 targeted tests**, build/budgets
and Chromium native association/Enter/free-text forms, clear/reset/availability, asynchronous
error/stale/disposal, CDP IME, no-JS, RTL/narrow/zoom/media and coexistence passed.
Read-only review found same-task external-option edits, reentrant abort transfer and
reset/composition bookkeeping defects; fixes have dedicated tests and browser probes.

Native popup selection was **not verified**: ArrowDown/Enter in this automation kept “Lo”
and submitted natively. No on-select, clear/blur-after-select, append, fake aria-expanded,
custom popup matching/group/rendering or AT speech parity is claimed.
ESM/classic/CSS are **3,183/3,252/494 gzip bytes** under **4,500/4,500/1,000** ceilings.
All **146 previous top-level JS/CSS assets** byte-match the pre-Auto Complete build recipe;
core/plugins remain **14,611/2,181/2,779**, with all previous ceilings unchanged.

**P4-03 is Verified for retained native Select/Auto Complete scope; P4 remains In progress.**
Input OTP is accepted below. At that checkpoint Planned routes were **Input OTP, Dynamic Input, Dynamic Tags,
Mention, Color Picker, Date Picker and Time Picker**.

### Input OTP: one native field and metadata-only completion

[Input OTP acceptance](../components/input-otp.md) preserves one original text/password
field, ASCII string/leading-zero semantics, one-time-code hints, native editing/selection/
constraints, defaults/reset and one named form value. Bounded local completion is
deduplicated per complete stretch, suppressed during IME/unavailability/native errors and
never treated as authentication or submit intent. There is no per-cell editor, code mirror,
normalization, WebOTP/SMS/clipboard client or code-bearing event/status/log/storage.

All **23 original identities + eleven source supplements = 34 rows: 17 adapted and
17 omitted**. Four tasks close; at OTP sign-off catalog totals were **3,593 rows, 256/384 accepted tasks
across 64 pages**, with **128 unchecked tasks**. **178 targeted tests**, build/budgets and
Chromium leading-zero/masking/selection/completion/reset/fieldsets/external forms, synthetic
paste-default plus native bulk insertion, CDP IME, no-JS local dialog forms and RTL/zoom/
media/coexistence passed. Review fixes cover successful/immediate reset boundaries,
cancelled pending completion, invalid autocomplete lists and inherited live status ancestry.

The demo's native method=dialog fallback never sends a code in a URL/request; it only
closes locally, and enhanced output reports counts rather than codes. Actual OS clipboard
paste, mobile SMS autofill, authentication and universal AT behavior are not claimed.
ESM/classic/CSS: **2,280/2,352/507 gzip bytes** under **3,000/3,000/1,000** ceilings.
All **149 previous top-level JS/CSS outputs** byte-match the pre-OTP HEAD recipe;
core/plugins remain **14,611/2,181/2,779**, and previous ceilings are unchanged.

At that checkpoint, next was Dynamic Input, then Dynamic Tags. Planned P4 routes were **Dynamic
Input, Dynamic Tags, Mention, Color Picker, Date Picker and Time Picker**. P4-06 remains
In progress; P4/P0/P5/P6 completion is not implied.

### Dynamic Input: authored rows, bounded edits and explicit resources

[Dynamic Input acceptance](../components/dynamic-input.md) retains native templates,
original rows/fields/labels/current/default values, literal names and DOM FormData order.
An optional bounded helper manages stable row keys, add/remove/up/down, native moveBefore
or focus/caret-preserving fallback and explicit initialize/connect/onCleanup ownership.
Native reset affects current fields only; disconnect keeps edited rows and hides owned
custom actions. No preset/VNode/model/path/drag/provider engine is introduced.

All **32 original identities + ten source supplements = 42 rows: 28 adapted and
14 omitted**. Four tasks close; at Dynamic Input sign-off catalog totals were **3,603 rows, 260/384 accepted tasks
across 65 pages**, with **124 unchecked tasks**. **156 targeted tests**, build/budgets and
Chromium actual-node/caret/action focus, labels/required/forms/reset, failed-add cleanup,
native no-JS rows, RTL/narrow/200% CSS zoom/media and Input/Form/legacy coexistence passed.
Review fixes cover fallback blur reentrancy, checked radio row roots, connect-hook action
attribute ownership and detached cleanup leases. Fixed action identities prevent stale controls.

Template IDs are forbidden; explicit initialized IDs/references are validated without
renaming field names or remapping unrelated external references. New checked radios and
autofocus are rejected before insertion to protect native peers/focus on failed adds.
Arbitrary application side effects and iframe/animation/active-IME fallback state are not
fully reversible or universally certified. Native field editing has no new keyboard layer.
ESM/classic/CSS: **5,567/5,634/414 gzip bytes** under **6,500/6,500/1,000** ceilings.
All **152 previous top-level JS/CSS assets** byte-match the pre-component HEAD recipe;
core/plugins remain **14,611/2,181/2,779** and previous budgets are unchanged.

Dynamic Tags is accepted below. Other Planned P4 routes were **Mention, Color Picker, Date Picker
and Time Picker**. P4-06 and overall P4 remain In progress.

### Dynamic Tags: committed native fields and explicit draft intent

[Dynamic Tags acceptance](../components/dynamic-tags.md) reuses Dynamic Input's bounded
row/template/focus/resource owner. Committed strings live in visible readonly named text
fields; one unnamed native editor owns the draft. Explicit Enter/Add, exact duplicate
policy, scalar creation callbacks, draft-safe rejection/reset and key-based removal avoid
a hidden array model or extra Tag/Input/renderer runtime.

All **32 original identities + ten source supplements = 42 rows: 25 adapted and
17 omitted**. Four tasks close; at Dynamic Tags sign-off totals were **3,613 rows, 264/384 accepted tasks across
66 pages**, with **120 unchecked tasks**. **212 targeted tests**, build/budgets and Chromium
IME/Enter/Escape/limits/duplicates/drafts, callbacks/focus/required/FormData/reset, native
no-JS values and RTL/zoom/media/coexistence passed. Review fixes preserve wrapper/base
ownership after refused reentrant teardown and protect reset-restored drafts during commit.

Blur/deactivate auto-commit, object label/value mode, VNode rendering and checkable Tag
behavior are explicitly omitted. Native setters/refresh/reset remain silent; commit/remove
are documented eventful commands. ESM/classic **including the reused collection** measure
**8,985/9,052 gzip bytes**, complete CSS **685**, under **10,000/10,000/1,500** ceilings.
All **155 prior top-level JS/CSS assets** byte-match the pre-Tags HEAD recipe; prior
helper/core/plugin code and ceilings remain unchanged (**14,611/2,181/2,779** core/plugins).

Mention is accepted below. At that checkpoint Planned P4 routes were **Mention, Color Picker, Date Picker
and Time Picker**. This is retained native scope, not full P4/P0/P5/P6 or framework parity.

### Mention: native editor, caret snapshots and real choice buttons

[Mention acceptance](../components/mention.md) retains original input/textarea state,
code-unit caret/prefix snapshots, bounded static/async suggestions and explicit insertion
through native setRangeText. Native Tab + Enter/Space or pointer choice works; ordinary
editor Enter/newline/Tab/arrows remain native. Only the prefix-to-caret fragment changes,
with surrounding text/defaults/forms retained and maxlength checked before mutation.
The named panel is field-adjacent document flow, not caret-anchored or a fake listbox.

All **35 original identities + eleven source supplements = 46 rows: 30 adapted and
16 omitted**. Four tasks close; at Mention sign-off totals were **3,624 rows, 268/384 accepted tasks across
67 pages**, with **116 unchecked tasks**. **248 targeted tests**, build/budgets and Chromium
real keyboard/pointer insertion, Unicode/caret/IME/maxlength/async/reset/focus, native forms,
no-JS and RTL/zoom/media/coexistence passed. Review fixes address the native focusout/BODY
transition race and reset rebasing after reentrant abort queries.

No caret mirror, portal/follower/tree/menu renderer, rich text, HTTP client or user-text
logging/storage is introduced. ESM/classic/CSS are **5,367/5,435/558 gzip bytes**, under
**6,500/6,500/1,250** ceilings. All **158 prior top-level JS/CSS assets** byte-match the
pre-Mention HEAD recipe; prior helper/core/plugin code and budgets remain unchanged
(core/plugins **14,611/2,181/2,779**).

**P4-06 is Verified for the declared native OTP/Dynamic Input/Dynamic Tags/Mention scopes.**
Overall P4 remains In progress. Color Picker is accepted below; Date Picker and Time Picker remain.

### Color Picker: strict native RGB and optional hex drafts

[Color Picker acceptance](../components/color-picker.md) retains the original labelled
native input, preview, literal datalist palette, defaults/reset/fieldset/FormData and
validated six-digit RGB setters. Optional unnamed native hex editing preserves incomplete
drafts until Apply/Revert/reset. Native validity owns feedback; no custom validity message,
hidden duplicate value, color parser, HSV plane, popup or alpha/gamut conversion is added.

All **25 original identities + ten source supplements = 35 rows: 10 adapted and
25 omitted**. Four tasks close; at Color Picker sign-off totals were **3,634 rows, 272/384 accepted tasks across
68 pages**, with **112 unchecked tasks**. **153 targeted tests**, build/budgets and Chromium
grammar/null policy, dirty synchronization, actual reset-button timing, reentrant events,
native form/caret/IME/fieldset/no-JS and RTL/zoom/media/coexistence passed. Review fixes
addressed stale reset UI, unrelated-update cancellation, reset dirty state and nested input.

Black is a real color, not clear. Unsupported alpha/colorspace markup is rejected unchanged.
Native type/showPicker availability and palette data were inspected, but **no actual native
chooser, screen picker or clipboard operation was invoked**, and no dialog UI/confirm timing
or universal gamut support is claimed. ESM/classic/CSS: **3,892/3,964/458 gzip bytes** under
**4,500/4,500/1,000** ceilings. All **161 prior top-level JS/CSS assets** byte-match the
pre-component HEAD recipe; core/plugins stay **14,611/2,181/2,779**, with old budgets intact.

Date Picker is accepted below; Time Picker remains. Overall P4/P0/P5/P6 and full source
format/UI parity remain independent.

### Date Picker: native calendar strings and explicit endpoint pairs

[Date Picker acceptance](../components/date-picker.md) retains native date/month/week/
datetime-local fields and same-mode pairs. A tiny shared temporal capability probe validates
grammar before real setters; numeric coordinates are used only for same-mode ordering,
not as a claim of local-midnight/instant equivalence. Empty/partial/reversed values remain
explicit. Native bounds/defaults/labels/FormData are never reindexed or cross-linked.

All **179 original mode-specific identities + twenty source supplements = 199 rows:
37 adapted and 162 omitted**. Grouped MonthRange/YearRange/QuarterRange and clear-slot
owners remain intact; only named native branches receive adapted credit. Four tasks close.
At Date sign-off catalog totals were **3,654 rows, 276/384 accepted tasks across 69 pages**,
**108 unchecked**. P4 then had **968 rows**, with Time Picker still Planned; it is accepted below.

**179 targeted tests**, build/budgets and Chromium grammar/leap/week/seconds/range/
constraints/clear/reset/FormData/focus, no-JS and RTL/zoom/media passed. Review fixes preserve
all clear notifications across cancelled resets and action-attribute overrides made by focus
handlers. Two timezone contexts retained date/local-wall-clock strings unchanged; a fixed-clock
local-Today recipe produced different correct local calendar days without UTC slicing.
That proves no implicit conversion, not validity of real zoned DST instants.

At Date sign-off ESM/classic/CSS were **3,882/3,953/421 gzip bytes**, under **4,500/4,500/1,000** ceilings.
All **164 prior top-level JS/CSS assets** byte-match the pre-Date Picker HEAD recipe;
core/plugins remain **14,611/2,181/2,779** under unchanged budgets. No native popup UI,
year/quarter grid, arbitrary blackout cells, format engine or universal AT parity is claimed.

Time Picker's shared focus fix and retained P4 sign-off follow below; P0/P5/P6 do not inherit completion.

### Time Picker and final retained P4 sign-off

[Time Picker acceptance](../components/time-picker.md) retains one native time input, exact
HH:mm/seconds/fraction strings, midnight versus empty, native periodic min>max bounds,
step/default/required/readonly/fieldset/FormData and explicit clear. Native probes reject
invalid or misrepresented precision before real mutation. No date/instant/timezone anchor,
format/column renderer, range API, popup/open/confirm model or dependency is added.

All **34 original identities + sixteen supplements = 50 rows: 16 adapted and 34 omitted**.
Four tasks close. **245 targeted tests** and **all 889 tests across the 17 P4 files** pass,
along with build/declarations/budgets and Chromium time/fraction/overnight/reset/clear/forms/
focus/RTL/zoom/media/no-JS/coexistence evidence. The native chooser UI was not opened.
The installed jsdom short-fraction numeric defect is rejected explicitly, not patched into
production; Chromium verified .1/.01/.001 correctly.

Review fixed the coupled Date/Time native-blur ownership path through a small shared focus
primitive. Time ESM/classic/CSS are **3,425/3,497/388 gzip bytes** under **4,000/4,000/1,000**.
Date ESM/classic are now **3,967/4,038**, within unchanged **4,500** ceilings; its public four
modes remain unchanged. **165 of 167 prior top-level JS/CSS assets** byte-match actual HEAD
source; the only changes are those two Date bundles. Core/plugins remain **14,611/2,181/2,779**.

**All retained P4 is reconciled:** **17 routes, 984 rows = 478 adapted + 506 omitted,
68/68 tasks**, zero unresolved rows and zero Planned P4 routes. Full catalog totals:
**3,670 rows, 280/384 accepted tasks across 70 pages, 104 unchecked**.
The remaining **26 routes** are **22 Planned** plus **four explicit exclusions**, not hidden
implementation credit:

| Group | Remaining routes | Rows / unresolved |
| --- | --- | ---: |
| P0 / configuration (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 collections (10) | Cascader, Transfer, Tree Select, Data Table, Log, Tree, Infinite Scroll, Popselect, Split, Virtual List | 582 / 579 |
| P6 specialized (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

Global Style has zero API rows but remains an unaccepted native/external-CSS page; a zero
row count is not completion. Log/Popselect and Config Provider also contain explicit
exclusions within their remaining scoped work. P0 and full P5/P6 remain independent.

**Recommended next: Virtual List**, fixed-height/native-scroller/authored-item scope,
with P5-01 stable identity and focused-item policy established as part of that foundation.
P3 focus/scrolling and P4 native row/lifetime conventions are available; this enables
later Log/Infinite Scroll/Data Table work. Variable heights/grid/source-renderer contracts
stay separate. Tree is another viable foundation, but neither route was started here.

## Virtual List: accepted first P5 collection foundation

[Canonical acceptance](../components/virtual-list.md) delivers an explicit native helper,
authored ul/ol/li/template rows, complete key validation, required same-key updater,
bounded focus pin and fail-closed cleanup. The legacy advanced custom element is unchanged.
All **29 original identities plus twelve explicit supplements = 41 rows: 26 adapted,
15 omitted**, with four accepted tasks. Dynamic height, horizontal/tree/grid modes,
scrollbar/renderer/framework types and smooth/debounce surfaces are explicitly excluded.

**71 targeted tests** (44 Virtual List + 27 existing native/legacy tests), declarations,
build and unchanged-budget gates pass. Chromium's 100,000 × 32px / 320px fixture mounted
**13/16/13 rows** at start/middle/end, maximum **17** over 101 offsets; one focused row
remains pinned without losing its real control. Last offset **3,199,680**, native extent
**3,200,000px**, last-row bottom error **0px**. Resize/hidden/125–200% CSS zoom/RTL,
native keyboard, updates, removal focus, cleanup and legacy coexistence were exercised.
The **8,000,000px** ceiling was also reached, with the last item visible.

At Virtual List sign-off: **3,682 tracker rows, 284/384 accepted tasks across 71 pages,
100 unchecked**. P5 is **In progress**, not complete: one of ten routes accepted,
**594 P5 rows = 26 adapted + 18 omitted + 550 unresolved**. P4 remains unchanged at
17 routes/984 rows/68 accepted tasks/no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (9) | Cascader, Transfer, Tree Select, Data Table, Log, Tree, Infinite Scroll, Popselect, Split | 553 / 550 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommended next: Tree**, to establish native hierarchy/key/focus contracts before
Tree Select/Cascader consumers. No Tree or other component implementation is included here.

## Tree: accepted native hierarchy foundation

[Canonical Tree acceptance](../components/tree.md) delivers an authored native outline,
not an ARIA tree or VNode/data renderer. Native lists/disclosures, separate selection
buttons, real checkbox cascade/mixed state, disabled barriers and bounded safe-node
loading retain node/listener/form identity. Source virtual/drag/filter/renderer/provider
and exclusive-accordion surfaces have explicit omissions. The legacy core tree is unchanged.

All **119 original section/member/kind/API-line identities** remain in order, with compact
pinned source locators. **28 explicit supplements** produce **147 rows = 60 adapted +
87 omitted**. Four tasks close. **117 tests** cover Tree, native CheckboxGroup ownership
and the existing native/legacy suite; declarations/build/budgets pass.

Chromium verified native arrows/Home/End/typeahead/Tab/Enter/Space, distinct selection and
checking, all/parent/child reports, mixed/disabled fields and FormData, collapse/removal
focus, duplicate/stale/cancelled loads, nested instance cancellation, refreshed labels,
RTL/zoom/media/no-JS and legacy coexistence. A **500-node** native outline kept 500 real
rows (not virtualized); End reached the last node with **seven computed-style reads**,
not a layout scan over every row. Detailed timings and payloads are in the canonical record.

At Tree sign-off: **3,710 rows, 288/384 accepted tasks across 72 pages, 96 unchecked**.
P5 remains **In progress**: two of ten routes accepted; **622 rows = 86 adapted +
105 omitted + 431 unresolved**. P4 remains 17 routes / 984 rows / 68 tasks, no unresolved
retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (8) | Cascader, Transfer, Tree Select, Data Table, Log, Infinite Scroll, Popselect, Split | 434 / 431 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommended next: Cascader**, followed by Tree Select. Reuse real-node hierarchy/index
and cancellation concepts where anatomy truly matches; each chooser still needs its own
path/value/keyboard/popup/reset contract. No next component is implemented here.

## Cascader: accepted native dependent paths

[Canonical Cascader acceptance](../components/cascader.md) delivers stable native selects
projected from a separate passive authored Tree hierarchy. Strict string value/path/leaf
semantics, disabled ancestors, clear/readout, captured default paths and native validation
are explicit. The reset-settlement gap is gated; missing defaults never select an unrelated
sibling. Async native batches use AbortSignal, branch/key/generation and actual-select-value
guards. No hidden terminal field, competing Tree/Select owner, renderer, provider or popup.

**69 original section/member/kind/API-line identities + 26 source supplements = 95 rows:
40 adapted and 55 omitted.** Four tasks close. **212 targeted tests** and build/declarations/
budgets pass. Chromium verified dependent path changes, native keyboard/labels/forms,
pending/reset/missing-default validation, cancellation/stale values, focus/refresh,
RTL/zoom/no-JS and classic/ESM/legacy coexistence; detailed evidence is canonical.

At Cascader sign-off: **3,736 tracker rows / 292 of 384 tasks across 73 accepted pages /
92 unchecked tasks**. **P5 remains In progress:** three of ten routes accepted, **648 rows =
126 adapted + 160 omitted + 362 unresolved**. P4 remains unchanged: 17 routes, 984 rows,
68 accepted tasks and no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (7) | Transfer, Tree Select, Data Table, Log, Infinite Scroll, Popselect, Split | 365 / 362 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Tree Select.** Reuse real-node key/path indexing and reset/validation/lifetime
contracts where appropriate, not a second renderer or two owners for the same Tree/Select.
No Tree Select implementation is included here.

## Tree Select: accepted native path-aware selection

[Canonical acceptance](../components/tree-select.md) combines the unchanged hierarchy
index with one Native Select owner. Full-path native options, strict single/multiple
string keys, leaf/disabled-path policy, literal filtering, defaults and native forms are
retained. Flat native multiple selection is not checkbox cascade, indeterminate parents,
an expandable popup or virtualized tree. Async source loading remains application-owned.

Normal teardown **hands off current native options, values and surviving defaults**,
not the original snapshot. Removed source data is not resurrected and user selection is
not undone. **87 original identities + 33 source supplements = 120 rows: 39 adapted,
81 omitted**, with four accepted tasks. **248 targeted tests**, declarations/build/budgets
and real Chromium key/path/filter/reset/handoff/form/focus/RTL/zoom/no-JS/coexistence checks pass.
All **181 prior top-level JS/CSS assets byte-match** the pre-Tree-Select build.

At Tree Select sign-off: **3,769 rows / 296 of 384 tasks across 74 accepted pages / 88 unchecked**.
**P5 is In progress:** four of ten routes accepted; **681 rows = 165 adapted + 241 omitted
+ 275 unresolved**. Tree/Tree Select/Cascader's declared native hierarchy wave is reconciled,
not full checkbox-popup/framework parity. P4 remains 17 routes/984 rows/68 tasks, no unresolved
retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (6) | Transfer, Data Table, Log, Infinite Scroll, Popselect, Split | 278 / 275 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Transfer.** Reuse native single-owner/value/filter concepts only where appropriate;
source/target ordering and movement require their own acceptance. No Transfer code is included.

## Transfer: accepted native membership and staging

[Canonical acceptance](../components/transfer.md) moves original options between two
unnamed native multi-selects. Target contents are membership; highlights are staging.
Locked items, matched filtering/bulk scope, origin-order append, captured membership
defaults and native staging defaults are distinct. An explicit owned formdata name
serializes **all target members**, including unhighlighted/locked/filtered members.
No hidden proxy, duplicate named staging fields, renderer, drag or virtualization is added.

**32 original identities + 20 source supplements = 52 rows: 28 adapted + 24 omitted**;
four tasks close. **161 targeted tests** pass, plus build/declarations/budgets and Chromium
native keyboard/membership/FormData/filter/lock/reset/focus/collision/nesting/no-JS/coexistence.
All **184 previous top-level JS/CSS assets byte-match** the pre-Transfer build.

Current catalog: **3,789 rows / 300 of 384 tasks across 75 accepted pages / 84 unchecked**.
**P5 remains In progress:** five of ten routes accepted; **701 rows = 193 adapted +
265 omitted + 243 unresolved**. P4 remains unchanged at 17 routes/984 rows/68 tasks,
with no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (5) | Data Table, Log, Infinite Scroll, Popselect, Split | 246 / 243 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Data Table.** Table selection/order/serialization and scale need their own
declared native contracts; no later collection code is included in this Transfer commit.

## Data Table: accepted native local operations and whole-form policy

[Canonical acceptance](../components/data-table.md) preserves original native table rows,
headers, associations, footer spans and cell controls. Explicit string keys, synchronous
comparators/predicates, stable ties, local filtering/paging, scoped native checkbox selection
and footer text summaries operate without a renderer, remote data model or virtual tbody.
Hidden named fields still submit and validate: the demo explicitly reveals all rows before
native validation, rather than silently disabling fields or inventing hidden proxies.

**147 original identities + 64 source-only supplements = 211 rows: 76 adapted +
135 omitted**; four tasks close. **252 targeted tests**, declarations/build/budget gates
and Chromium real keyboard/aria-sort/native fields/reset/identity/focus/scroll/RTL/zoom/
print/no-JS/coexistence acceptance. The measured 2,000-row fixture kept 2,000 original
nodes mounted, 20 visible, 100 local pages and exactly two pager buttons; it is not virtualization.
All **187 prior JS/CSS assets byte-match**; core/advanced/widgets stay 14,611/2,181/2,779 gzip.

Current catalog: **3,853 rows / 304 of 384 tasks across 76 accepted pages / 80 unchecked**.
**P5 remains In progress:** six of ten routes accepted; **765 rows = 269 adapted +
400 omitted + 96 unresolved**. P4 stays 17 routes/984 rows/68 tasks, no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (4) | Log, Infinite Scroll, Popselect, Split | 99 / 96 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Log.** Reuse native text/overflow/lifecycle contracts where appropriate; no later
collection source is included in this separate Data Table completion.

## Log: accepted bounded native retained text

[Canonical acceptance](../components/log.md) reuses native Code CSS and preserves real
pre/code line/Text nodes for full retained-text selection/find/printing. Explicit CRLF/LF/
partial-CR normalization, append, display trim, whole-head retention, generations, loading
and selection-safe conditional follow require no highlighter, terminal, transport or
duplicate Virtual List window. All retained records stay mounted; no virtualization claim.

**21 original identities + 25 explicit source supplements = 46 rows: 19 adapted +
27 omitted**; four tasks close. **98 targeted tests** (59 Log, 12 Code, 27 native/legacy),
declarations/build/budgets and Chromium native scroll/selection/long-line/CRLF/follow/
retention/resize/RTL/zoom/print/no-JS/coexistence acceptance. The 10,000-record fixture
really mounted **10,000 line spans and 10,000 Text nodes**, retained 377,055 units and
selected/found offscreen text natively. Twenty 25-record bursts remained at the 10,000
record cap; the documented p95 batch time is 292.4ms, not a high-throughput/window SLA.
All **190 previous JS/CSS assets byte-match**, including Data Table and native Code.

Current catalog: **3,878 rows / 308 of 384 tasks across 77 accepted pages / 76 unchecked**.
**P5 remains In progress:** seven of ten routes accepted; **790 rows = 288 adapted +
425 omitted + 77 unresolved**. P4 remains 17 routes/984 rows/68 tasks, no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (3) | Infinite Scroll, Popselect, Split | 78 / 77 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Infinite Scroll**, with its own native request/observer/backpressure lifetime;
Log edge notifications are not an automatic data loader. Popselect and Split follow.

## Infinite Scroll: accepted native sentinel and serialized load permission

[Canonical acceptance](../components/infinite-scroll.md) keeps application items, fields,
transport and commits explicit. Native page/element IntersectionObserver roots use a bounded
bottom distance; manual loading works without an observer. One current pending load includes
unacknowledged cancellation. Stale commits/errors cannot overwrite a reset/root/disposed
generation, and no-growth/error results require deliberate retry.

One automatic load per sentinel entry, default three per reset (maximum twenty), prevents
unbounded underfill loops and keeps a real footer/manual/static route reachable. No HTTP,
item renderer, virtualization, hidden value proxy, scrolling/focus engine or new dependency.
The existing native owned-attribute utility is reused without changing its source.

**Three original identities + four source-only supplements = seven rows: four adapted +
three omitted; four tasks close.** **139 targeted tests** (59 Infinite Scroll, 53 native
attribute/Popover, 27 native/legacy), declarations/build/budgets and Chromium actual
intersection/40px-to-64px threshold/manual/error/no-growth/cancellation/root/nesting/native
fieldset/footer/RTL/zoom/print/fallback/coexistence acceptance. Maximum observed active
loader count remained **one**, including abort-ignoring cases.
All **193 prior JS/CSS assets byte-match**; core/plugins/previous optional ceilings stay unchanged.

Current catalog: **3,882 rows / 312 of 384 tasks across 78 accepted pages / 72 unchecked**.
**P5 remains In progress:** eight of ten routes accepted; **794 rows = 292 adapted +
428 omitted + 74 unresolved**. P4 remains 17 routes/984 rows/68 tasks, no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (2) | Popselect, Split | 75 / 74 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Popselect, then Split.** Neither later component is implemented by this completion.

## Popselect: accepted native selection disclosure

[Canonical acceptance](../components/popselect.md) composes existing Popover and Select
helpers around original labelled native lists/options/optgroups. Immediate single/multiple
values, native defaults/disabled/FormData, silent setters and bounded literal readout remain
distinct from visibility. Arrows/typeahead/change do not close; Done/Escape/outside close
without rollback. Quiet validation does not open peers; explicit first-error reveal is an
application gate. Inline/no-JS/unsupported/disconnected choices remain usable.

**56 original identities (13 local + 43 inherited) + 23 explicit source supplements =
79 rows: 38 adapted + 41 omitted**; four tasks close. **181 targeted tests** (35 Popselect,
53 Popover, 40 Select, 53 Form), declarations/build/budgets and Chromium single/multiple/
nested focus/native keys/clear/reset/required reveal/fields/placement/fallback/coexistence.
The 2,000-option fixture retained all original nodes; visual-viewport zoom 2 remained
bounded. Unsupported CSS zoom explicitly hands off to inline controls rather than
mispositioning a popup or changing the near-full Popover base.
All **196 previous JS/CSS assets byte-match**; base/helper/plugin ceilings are unchanged.

Current catalog: **3,905 rows / 316 of 384 tasks across 79 accepted pages / 68 unchecked**.
**P5 remains In progress:** nine of ten routes accepted; **817 rows = 330 adapted +
468 omitted + 19 unresolved**. P4 stays 17 routes/984 rows/68 tasks, no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P5 (1) | Split | 19 / 19 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Split.** P5 is not complete until that independent native layout/resize scope is resolved.

## Split accepted; all retained P5 scopes reconciled

[Canonical Split acceptance](../components/split.md) preserves two native pane subtrees,
with an owned named separator, physical keyboard/RTL semantics, pointer capture and final
pointerup processing. Ratio/pixel preferences are distinct from effective layout; infeasible
bounds expose readable stacked panes. Hidden/inert collapsed fields retain native FormData/
validation, with explicit reveal. No body interaction hack, renderer or drag framework.

**19 original identities + ten explicit source supplements = 29 rows: 19 adapted +
ten omitted**, with four accepted tasks. Split/native-layout coverage is **98 tests**;
the full retained P5 gate passed **526 tests across 13 files** (476 P5 + 50 layout/native).
Declarations/build/budgets and real Chromium drag/keys/cancel/RTL/zoom/scale/forms/print/
fallback/coexistence passed. All **199 prior JS/CSS assets byte-match**.

The final audit checked **every row** of all ten P5-assigned inventories:

| P5 route | Rows | Adapted | Omitted | Unresolved | Accepted tasks |
| --- | ---: | ---: | ---: | ---: | ---: |
| Virtual List | 41 | 26 | 15 | 0 | 4 |
| Tree | 147 | 60 | 87 | 0 | 4 |
| Cascader | 95 | 40 | 55 | 0 | 4 |
| Tree Select | 120 | 39 | 81 | 0 | 4 |
| Transfer | 52 | 28 | 24 | 0 | 4 |
| Data Table | 211 | 76 | 135 | 0 | 4 |
| Log | 46 | 19 | 27 | 0 | 4 |
| Infinite Scroll | 7 | 4 | 3 | 0 | 4 |
| Popselect | 79 | 38 | 41 | 0 | 4 |
| Split | 29 | 19 | 10 | 0 | 4 |
| **P5 total** | **827** | **349** | **478** | **0** | **40** |

**P5 is Verified for the declared retained scope**, not upstream/framework parity.
All **79 P5 canonical/reference relative file links** resolve. Prior component evidence
and its narrower exclusions remain authoritative; no omitted feature becomes implemented.

Current catalog: **3,915 rows / 320 of 384 tasks across 80 accepted pages / 64 unchecked**.
P4 remains unchanged at 17 routes/984 rows/68 tasks with no unresolved retained rows.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (3) | Config Provider, Element, Global Style | 97 / 8 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommended next:** resolve Config Provider, Element and Global Style as narrow native
CSS/context/element contracts before P6, not as a new provider or global-reset framework.
No next component is started here.

## Config Provider accepted as native composition

[Canonical configuration acceptance](../components/config-provider.md) closes this scope
without a provider/context framework: actual DOM ancestry, original external author token
subsets, light/dark/system/native color decisions, inherited native lang/dir, explicit
per-helper labels and independent modal/page hosts. No runtime/factory/export/bundle or
new budget is added. Global Style's document-wide opt-in is **not** implemented here.

All **95 original identities + 22 source supplements = 117 rows** are reconciled:
**eight adapted native capabilities + 109 omissions, zero unresolved**, with four tasks
accepted. Source-only `rtl` is recorded as a style-descriptor array, not falsely presented
as an English-table boolean API. Typed theme/locale/component/VNode/injection graphs,
mounting machinery and adapter contracts remain omitted.

**86 tests passed** (12 composition, 47 Loading Bar, 27 native/legacy), declarations/build
and all budgets pass; **all 1,142 prior distribution files byte-match**. Chromium verifies
actual Card/Button/Loading Bar appearances, nested inheritance/removal/author overrides,
native modal ancestry/hosts/focus, explicit label snapshots/recreation, system media,
native colors, RTL, 320px/2x zoom, independent documents, strict external-CSS CSP,
no-JS controls/progress and separate legacy theme.apply/register coexistence.
Language metadata is not translation, CSS inheritance is not service injection, and no
all-component theme/keyboard/picker-locale or all-browser/AT parity is implied.

Current catalog: **3,937 rows / 324 of 384 tasks across 81 accepted pages / 60 unchecked**.
Retained P5 remains **10 routes / 827 rows / 349 adapted / 478 omitted / 40 tasks**.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (2) | Element, Global Style | 2 / 1 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

P0's three catalog routes now contain **119 rows: eight adapted, 110 omitted, one unresolved**;
only Config Provider's four of twelve page tasks are accepted. Global Style has zero
inventoried API rows but four outstanding tasks. Broader architectural P0 work is not
automatically complete. **Next: Element, then Global Style, before P6**, each separately.

## Element accepted as native authoring composition

[Canonical Element acceptance](../components/element.md) verifies actual native tags,
real authored children/attributes/listeners, labelled controls, native link/button/form
behavior and explicit inherited/local CSS custom properties. No tag factory, wrapper,
provider, global reset, new runtime/export/asset budget or second palette is added.
The existing MuiElement controller base is **not** represented as an NElement equivalent.

**Two original identities + ten source supplements + three source-inherited theme props
= 15 rows: three adapted native capabilities + twelve omissions, zero unresolved**.
All four tasks are accepted. Source automatic role none, generated prefixes/theme classes,
renderer aliases, inherited theme objects and common-theme variable/type graphs remain
omitted. The source's unprefixed kebab-case variables are not silently promised as --mui-*
or --n-* aliases.

**51 tests passed** (12 Element, 12 Config Provider, 27 native/legacy), declarations/build
and all budgets pass; **all 1,142 previous distribution files byte-match**. Chromium
verified real heading/link/button/group semantics, fragment focus, native Space/Enter,
validation focus, literal local FormData preview/disabled exclusions/reset, stable
children/listeners, nested/outside/local tokens, system media/RTL, hidden/disclosure,
320px/2x zoom, forced colors/print, strict CSP/no-JS and separate legacy coexistence.
The full four-file application example is **4,184 gzip bytes**; normal use imports no
library JS. Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**.

Current catalog: **3,950 rows / 328 of 384 tasks across 82 accepted pages / 56 unchecked**.
All P0 catalog property rows now have dispositions: **132 rows / eleven adapted /
121 omitted / zero unresolved**. This does **not** finish P0: only **eight of twelve**
page tasks are accepted, and broader architectural gates remain independent.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0 (1) | Global Style — four outstanding tasks despite zero API rows | 0 / 0 |
| P6 (9) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Global Style**, separately, before P6. No Global Style implementation is included
in this Element scope; no all-browser/AT or complete framework/theme-variable parity is implied.

## Global Style accepted; P0 component-route audit reconciled

[Canonical Global Style acceptance](../components/global-style.md) supplies an **explicitly
linked standalone stylesheet**, not a provider, runtime installer or universal reset.
Zero-specificity html/body defaults consume existing tokens/system colors, preserve author
overrides and native UI, and unwind through native stylesheet disable/removal.
No component/core/plugin automatically imports it; no second palette or JS bundle exists.

The public API table remains empty. **16 explicit source effect/lifecycle/export
supplements = seven native adaptations + nine omissions**, zero unresolved, four tasks
accepted. Provider watchers, singleton markers, timed transitions, padding/text-adjust/
tap-highlight resets, render/SSR machinery and runtime exports remain omitted.

**77 targeted tests passed** (Global Style/Config Provider/Element/Discrete/native),
declarations/build and all budgets pass. The new CSS is **661 raw/310 gzip bytes** under
**500**. All **1,141 previous non-manifest distribution files byte-match**; old manifest
entries and exports are unchanged. Only the new stylesheet/export/manifest entry is added.
Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**. The full local example,
including its selected existing CSS and application files, is **5,953 gzip bytes**.

Chromium verifies real linked/disabled/removed/duplicate-link cascade and asynchronous
reloading, author/inline precedence, actual body typography/colors versus native controls/
scoped Card, system/light/dark/native schemes, native semantic/form behavior, 320px/2x zoom,
forced colors/print/reduced-motion, strict external-CSS CSP, no-JS and separate legacy
coexistence. This is not all-browser/AT, printer/device or complete theme-variable parity.

| Audited component route | Phase | Rows | Adapted | Omitted | Unresolved | Tasks |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Config Provider | P0 | 117 | 8 | 109 | 0 | 4/4 |
| Element | P0 | 15 | 3 | 12 | 0 | 4/4 |
| Global Style | P0 | 16 | 7 | 9 | 0 | 4/4 |
| **Strict P0 catalog subtotal** | P0 | **148** | **18** | **130** | **0** | **12/12** |
| Discrete API | P3, related audit only | 28 | 7 | 21 | 0 | 4/4 |
| **Requested four-route audit** | P0 + related P3 | **176** | **25** | **151** | **0** | **16/16** |

Discrete is not reassigned to P0 or double-counted in catalog tasks.
**Broad P0 is not declared complete:** P0-01 legacy authored CSS extraction and P0-02
aggregate separation remain; P0-03/04/05 contracts and legacy exceptions need their broader
sign-off; P0-06 remains a partial native-versus-inline theme separation; P0-07 full-catalog
accounting and P0-08/09 remaining P6 dispositions/native acceptance continue.
See the [master foundation notes](migration-plan.md#global-style-acceptance--explicit-document-css-and-route-audit).

Current catalog: **3,966 rows / 332 of 384 tasks across 83 accepted pages / 52 unchecked**.
Retained P5 remains **827 rows / 349 adapted / 478 omitted / zero unresolved / 40 tasks**.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (9 Planned) | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommend Carousel next (P6-03):** existing native button/focus/motion and optional
packaging foundations support manual slide navigation. Preserve slide/focus identity,
prefer native scrolling/scroll snap and bound autoplay/effects separately.
No P6 component is implemented in this commit.

## Carousel and CarouselItem accepted

[Canonical acceptance](../components/carousel.md) completes the first main P6
specialized route: original single-slide-per-view native scrolling, real controls,
settled/current/default/target indices, previous/next/to, command wrap, vertical/RTL,
bounded native completion, identity-preserving refresh and opt-in accessible autoplay.
Inactive slides stay in native reading/focus/form order. No slide clones, renderer,
wheel/key hijacking, runtime dependency, automatic CSS installer or fake registration.

**41 original identities + six source supplements + three source-inherited theme props
= 50 rows: 35 adapted, 15 omitted, zero unresolved; four accepted tasks.** CarouselItem
default-slot fields map to original content/read-only markers, not hidden option VNodes.
Multislide/variable-width/centered/gap/custom effects/drag/intercepted wheel/transition
frameworks are explicitly omitted. Native command wrap is not seamless infinite swipe.

**73 targeted tests pass** (46 Carousel + 27 native/legacy); declarations/build and all
old/new budgets pass. Level-nine gzip assets are **5,367 ESM / 5,509 classic / 656 CSS**
bytes (raw **14,557 / 14,843 / 2,053**), under independent **7,000 / 7,000 / 1,500**
ceilings. Combined ESM+CSS **6,023**, classic+CSS **6,165** gzip bytes.
Including the three local application demo files, the ESM example totals **9,486** gzip bytes.
Core/advanced/widgets remain **14,611 / 2,181 / 2,779**, under **15,000 / 3,000 / 4,000**.
No previous export, budget, core/plugin source or runtime dependency changed.

Dedicated local Chromium acceptance verified native wheel/touch snapping, button and
viewport keyboard commands, rapid successive targets with one completion, disabled
focused boundaries, preserved fields/validation reveal/identity, independent nested
owners, closed details and resize, negative RTL coordinates, vertical layout, CSS zoom
and reduced motion. Real autoplay paused for focus/hover/user choice; unit tests cover
document-hidden/lifetime/reentrant reasons. No-JS kept scrolling and field edits with
enhancement controls hidden. ESM/classic and unchanged widgets coexist on separate roots.
See the canonical record for actual dimensions and explicit browser/AT limitations.

**Current catalog: 96 routes / 3,975 rows / 336 of 384 tasks across 84 accepted pages /
48 unchecked.** P6 now has **241 rows: 35 adapted + 15 omitted + 191 unresolved**.
Broader P0-01–P0-09 foundation tasks remain unchanged/open or partial. P2–P5 retained
scope acceptance and the prior three P0 catalog-route resolutions remain valid.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (8 Planned) | Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 191 / 191 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommended next: Watermark (P6-04).** The optional external-CSS/loading and native
ownership prerequisites are available; define a bounded decoration/accessibility
contract before implementation. No next route is started here.

## Watermark accepted

[Canonical acceptance](../components/watermark.md) completes the second retained P6
route: one native Canvas PNG repeated by external CSS on an authored decorative
overlay. Literal multiline text, caller-owned native images, font/rotation/size/gap/
phase/cross/opacity/debug options and bounded local/fixed placement are implemented.
Content, form membership, pointer selection, focus, author ARIA and listeners remain
native. No per-stamp DOM grid, automatic containing-block rewrite, remote rendering,
selection blocker, anti-tamper observer, CSS-in-JS framework or security/DRM claim.

**27 original identities + one source fontStretch supplement + three source-inherited
theme props = 31 rows: 26 adapted, five omitted, zero unresolved; four accepted tasks.**
Whole-layer globalRotate, selection suppression and three theme/provider props are
explicitly omitted. Image URLs/credentials remain caller-owned; font/color grammar,
dimensions/area/DPR and rotated fit are bounded, with explicit retained subsets.

**88 targeted tests pass** (61 Watermark + 27 native/legacy), declarations/build and
all old/new budgets pass. Level-nine gzip assets: **5,755 ESM / 5,889 classic / 319 CSS**
(raw **14,495 / 14,784 / 850**), under independent **7,000 / 7,000 / 1,000** ceilings.
Combined ESM+CSS **6,074**, classic+CSS **6,208**; the complete four-file local ESM
example totals **10,498** gzip bytes. Prior export/budget entries are unchanged.
Core/advanced/widgets remain **14,611 / 2,181 / 2,779** under the unchanged
**15,000 / 3,000 / 4,000** ceilings. Carousel assets remain **5,367 / 5,509 / 656**.

Dedicated Chromium acceptance inspected actual PNG pixels/rotation/cross/debug and
decoded local image output; native decode and cross-origin Canvas SecurityError kept
the previous valid tile. Loader/PNG generation races, serialized encoder work,
teardown/owned URL release, native pointer/text selection/forms, original node identity,
resize/RTL/CSS zoom, DPR2, fixed versus scroll-wrapper coverage, print/forced-colors
omission, strict external-script/style CSP with blob images, no-JS and classic/legacy
coexistence were verified. Generated pixels are not automatically themed, guaranteed
print graphics or security controls; native top-layer and self-scroller limits remain.

**Current catalog: 96 routes / 3,979 rows / 340 of 384 tasks across 85 accepted pages /
44 unchecked. P6: 245 rows = 61 adapted + 20 omitted + 164 unresolved; two of nine
specialized routes accepted.** Broader P0-01–P0-09 statuses/exceptions are unchanged;
P2–P5 and prior P0 component-route acceptance remain intact.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (7 Planned) | Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 164 / 164 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Upload (P6-02).** Native file selection and a separately bounded application
transport/cancellation contract are dependency-ready. No Upload code is started here.

## Upload accepted

[Canonical Upload acceptance](../components/upload.md) completes the third retained P6
route and its native Trigger/Dragger companions: labelled native file input, actual
FileList/FormData synchronization, atomic append/replace/rejection, bounded template
rows and a caller-supplied promise transport. Manual start/cancel/retry/remove/clear,
indeterminate/byte progress, native disabled/reset/form/focus and flat-file drop are
retained. No endpoint/credentials/HTTP adapter, hidden membership fields, remote fake
Files, directory crawler, previews/downloads, async veto hooks or renderer is added.

**95 original identities + three explicit source/type supplements + three inherited
theme props = 101 rows: 57 adapted, 44 omitted, zero unresolved; four accepted tasks.**
Source callback/renderer/protocol/visibility variants remain individually bounded.
Aborted transports occupy their real slots until settlement; removed/disconnected
attempts cannot mutate new rows, and ownership cannot silently hand off to a new pool.

**85 targeted tests pass** (58 Upload + 27 native/legacy), declarations/build and all
old/new budgets pass. Level-nine gzip: **7,727 ESM / 7,855 classic / 560 CSS**
(raw **20,448 / 20,728 / 1,586**), under **9,000 / 9,000 / 1,250** ceilings.
Combined JS+CSS **8,287 / 8,415**; including the three demo files and two tiny local
acceptance fixtures, the ESM example totals **12,398** gzip bytes.
Previous exports/budgets remain unchanged. Core/advanced/widgets stay
**14,611 / 2,181 / 2,779** under **15,000 / 3,000 / 4,000**.

Dedicated Chromium acceptance used only local fixtures/in-memory Files and fake
transports—no OS chooser, network uploads/downloads or user files. Real FileList and
FormData agreed through removal/clear/duplicates/native reset; cancelled reset retained
selection. Native reset-button testing caught and fixed the pre-default microtask
checkpoint issue. Two ignored-abort occupied slots blocked a third request until
actual settlement, including after immediate native membership removal. Retry,
focus-safe controls, literal filenames, flat drop, fieldset/form association, native
dialog hosts, RTL/zoom/narrow/print/forced-colors, no-JS/missing-DataTransfer fallback,
strict CSP with connect-src:none, classic and unchanged advanced-plugin coexistence
passed. This is not server validation, cancellation rollback or all-browser/AT parity.

**Current catalog: 96 routes / 3,985 rows / 344 of 384 tasks across 86 accepted pages /
40 unchecked. P6: 251 rows = 118 adapted + 64 omitted + 69 unresolved; three of nine
specialized routes accepted.** Broad P0-01–P0-09 statuses/exceptions and prior P2–P5/P0
component-route acceptances are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (6 Planned) | Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 69 / 69 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Calendar (P6-01).** Earlier native date/locale/control contracts are available;
scope an authored native calendar/date-grid separately. No Calendar code is started here.

## Calendar accepted

[Canonical Calendar acceptance](../components/calendar.md) closes the fourth retained
P6 route: one native captioned six-week table, real day/month/year buttons, canonical
Gregorian date-only selection, separate roving focus and bounded leap/month/year
arithmetic. Explicit today/week-start/locale/disabled/annotation contracts replace
timestamp/date-fns/provider/VNode assumptions. There is no grid-role or hidden form
value. Original heading/ARIA/fallback nodes and independent native fields are preserved.

**14 original identities + three missing default-slot inline fields + three explicit
source alias/behavior supplements + three inherited theme props = 23 rows:
20 adapted, three omitted, zero unresolved; four accepted tasks.** Source timestamp,
formatter-token, rendering/provider and callback-array variants are explicitly out of
scope, not falsely presented as compatible props.

**157 targeted tests pass** (54 Calendar + 76 shared Date Picker + 27 native/legacy);
declarations/build and all prior/new budgets pass. Level-nine gzip:
**7,438 ESM / 7,570 classic / 640 CSS** (raw **19,521 / 19,807 / 1,842**), under
**8,000 / 8,000 / 1,250** ceilings. Combined **8,078 / 8,210** JS+CSS; the complete
three-file local ESM example totals **12,015** gzip bytes. Prior exports/budgets and
core/advanced/widgets remain unchanged at **14,611 / 2,181 / 2,779** under
**15,000 / 3,000 / 4,000**. Existing Date Picker remains **3,967** gzip bytes.

Dedicated Chromium verified table/caption/columnheader/cell/button AX semantics,
one roving tab stop, native Enter/Space exactly once, arrows/Home/End/Page/Shift-Page,
focus-vs-selection, adjacent dates, Jan31/leap/year1/9999, all-disabled/one-day bounds,
atomic annotation failure, native form/outside focus, RTL/zoom/narrow/media and no-JS
fallback. Explicit Gregorian/UTC labels overrode a Buddhist locale; app-local Today
correctly differed between +08:00 and America/New_York without shifting grid dates.
Strict external-CSS/script CSP, exact fallback restoration, classic Calendar/shared
Date Picker and unchanged advanced-plugin coexistence passed. No all-browser/AT or
instant/alternate-calendar/renderer parity is claimed.

**Current catalog: 96 routes / 3,994 rows / 348 of 384 tasks across 87 accepted pages /
36 unchecked. P6: 260 rows = 138 adapted + 67 omitted + 55 unresolved; four of nine
specialized routes accepted.** Broad P0-01–P0-09 task states and legacy compatibility
exceptions remain open/partial; prior retained P2–P5/P0 component routes are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (5 Planned) | Time, Countdown, Number Animation, Heatmap, Marquee | 55 / 55 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Time**, for explicit native formatting, then Countdown/Number Animation as
their actual shared temporal requirements justify. Calendar date-only values are not
implicitly instants. Heatmap and Marquee remain separately scoped; none is started here.

## Time accepted

[Canonical Time acceptance](../components/time.md) closes the fifth retained P6 route:
pure native Intl absolute/relative formatting and one optional native time/Text-node
binding. Explicit Date or integer epoch units preserve zero/negative values, validate
year/locale/timezone/options, and pair canonical datetime with readable text. Calendar/
Date Picker floating strings are rejected rather than implicitly promoted to instants.
No token parser, VNode renderer, provider, role/live-region injection, clock framework,
storage/network effect or default-entry dependency is added.

**Six original identities + three explicit source supplements = nine rows:
seven adapted, two omitted, zero unresolved; four accepted tasks.** There are no
invented inherited theme props. Native date/time projections and fixed elapsed relative
units are distinct from date-fns tokens, timezone calendar arithmetic or framework ABI.

**93 targeted tests pass** (66 Time + 27 native/legacy), declarations/build and all
prior/new budgets pass. Level-nine gzip: **4,767 ESM / 4,892 classic / 139 CSS**
(raw **11,690 / 11,965 / 159**), under **6,000 / 6,000 / 500** ceilings. Combined
JS+CSS **4,906 / 5,031**; the complete three-file local ESM example totals **8,670**
gzip bytes. Previous exports/budgets remain unchanged; core/advanced/widgets stay
**14,611 / 2,181 / 2,779** under **15,000 / 3,000 / 4,000**.

Dedicated Chromium verified epoch zero/negative/year1 and DST fold datetime/text
consistency, Gregorian locale override, static versus live references, native
selection/focus pauses, deferred paired updates, unchanged Text/prefix identity,
zero redundant static writes, hidden-element reveal, RTL/zoom/media, no-JS markup,
strict self-hosted CSP, classic and unchanged native Time Picker coexistence.
Deterministic tests cover document-hidden catch-up/error/timer boundaries; the headless
tab switch did not expose document.hidden and is not claimed as that browser evidence.
No universal AT/browser/token/locale-provider or calendar-day-relative parity is implied.

**Current catalog: 96 routes / 3,997 rows / 352 of 384 tasks across 88 accepted pages /
32 unchecked. P6: 263 rows = 145 adapted + 69 omitted + 49 unresolved; five of nine
specialized routes accepted.** Previous retained P2–P5/P0 component routes and broader
P0-01–P0-09 open/partial compatibility exceptions remain unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (4 Planned) | Countdown, Number Animation, Heatmap, Marquee | 49 / 49 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Countdown**, then Number Animation. Reuse concrete proven text/timing behavior
only if their actual contracts justify it, not a speculative application clock.
Heatmap/Marquee remain separate; no next component is started here.

## Countdown accepted

[Canonical Countdown acceptance](../components/countdown.md) closes the sixth retained
P6 route: native text or explicit unit Text nodes, monotonic elapsed duration rather
than interval subtraction, separate future duration/current value, active pause/resume,
reset/new-run generations, bounded rounded display and finish once per current run.
Rendering suppression does not freeze elapsed time. No absolute wall-clock deadline,
alarm service, date/animation library, provider, VNode renderer, hidden form value or
completion sound/network/navigation/focus behavior is added.

**Ten original identities + two source type supplements + two source behavior
supplements = 14 rows: 12 adapted, two omitted, zero unresolved; four accepted tasks.**
The VNode renderer and source duration watcher rewrite remain explicitly omitted.
Native literal formatting/unit targets and explicit reset/current-value rules replace them.

**92 targeted tests pass** (65 Countdown + 27 native/legacy), declarations/build and
all prior/new budgets pass. Level-nine gzip: **4,588 ESM / 4,717 classic / 208 CSS**
(raw **11,167 / 11,458 / 322**) under **6,000 / 6,000 / 750** ceilings. Combined
JS+CSS **4,796 / 4,925**; complete three-file local ESM example **8,479** gzip bytes.
Previous exports/budgets are unchanged; Time remains **4,767** gzip bytes and
core/advanced/widgets remain **14,611 / 2,181 / 2,779** under **15,000 / 3,000 / 4,000**.

Dedicated Chromium verified actual elapsed pause/resume, rounded text/duration metadata,
independent unit nodes, hidden/selected completion without extra finish, error/recovery,
reentrant reset, late-clock observation, original text/markup/focus/form preservation,
RTL/zoom/media, no-JS, strict CSP, classic and unchanged Time/legacy coexistence.
The helper's hard 50ms timeout floor and boundary/completion scheduling avoid source-like
short-remainder loops. Clock/browser sleep/throttling limits remain explicit; this is not
an alarm or universal timing/AT guarantee.

**Current catalog: 96 routes / 4,001 rows / 356 of 384 tasks across 89 accepted pages /
28 unchecked. P6: 267 rows = 157 adapted + 71 omitted + 39 unresolved; six of nine
specialized routes accepted.** Broad P0-01–P0-09 and legacy stylesheet/auto-install/
inline-theme exceptions remain open/partial; prior retained P2–P5/P0 routes are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (3 Planned) | Number Animation, Heatmap, Marquee | 39 / 39 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Number Animation**, reusing only concrete native timing/text behavior where
its actual contract warrants it. Heatmap/Marquee remain separate; no next component
is started in this Countdown commit.

## Number Animation accepted

[Canonical Number Animation acceptance](../components/number-animation.md) closes the
seventh retained P6 route: finite monotonic/RAF interpolation, exact requested targets,
native Intl precision/grouping/locale text, explicit pause/play/replay/retarget/cancel/
reset and reduced-motion final values. Existing text/data ownership follows the proven
Time/Countdown lease approach and common owned-attribute primitive without importing
date/duration formatting or changing prior assets. No animation/provider/renderer,
global scheduler, financial-decimal or completion side-effect claim is added.

**Nine original identities + one source type + two source behavior supplements =
12 rows: 11 adapted, one omitted, zero unresolved; four accepted tasks.** Source versus
Markdown duration/to default differences are explicit, as are native localized-digit/
rounding differences and omitted locale-provider behavior.

**89 targeted tests pass** (62 Number Animation + 27 native/legacy), declarations/build
and all prior/new budgets pass. Level-nine gzip: **5,224 ESM / 5,359 classic / 147 CSS**
(raw **13,639 / 13,949 / 183**), under **6,000 / 6,000 / 500** ceilings. Combined
JS+CSS **5,371 / 5,506**; complete three-file local ESM example **8,995** gzip bytes.
Prior exports/budgets stay unchanged; Time/Countdown remain **4,767 / 4,588**,
core/advanced/widgets **14,611 / 2,181 / 2,779**, with unchanged ceilings.

Dedicated Chromium verified actual intermediate/paused/retargeted values and exact
fractional/extreme endpoints, selected/hidden deferred completion, same/zero/reduced
settlement, formatter failure, native localized grouping/digits, original nodes/forms/
focus, RTL/zoom/media, no-JS, strict CSP and classic/Time/Countdown/legacy coexistence.
Tests also enforce zero per-frame layout reads, RAF-ID-zero cancellation and stale
frame/media/reentrant finish guards. Reduced-motion preference is sampled before delayed
media events can wrongly start animation. No all-browser/AT or decimal-finance parity.

**Current catalog: 96 routes / 4,004 rows / 360 of 384 tasks across 90 accepted pages /
24 unchecked. P6: 270 rows = 168 adapted + 72 omitted + 30 unresolved; seven of nine
specialized routes accepted.** Broad P0-01–P0-09 and legacy extraction/auto-install/
inline-theme exceptions stay open/partial; prior retained P2–P5/P0 routes are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (2 Planned) | Heatmap, Marquee | 30 / 30 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Heatmap**, then Marquee. Each remains an independently bounded native scope;
no next component is started in this Number Animation commit.

## Heatmap accepted

[Canonical Heatmap acceptance](../components/heatmap.md) closes the eighth retained P6
route using the reference's actual calendar-by-week model. Native Gregorian date/value
records, bounded range, missing/zero distinction, rejected duplicates, signed numeric
domain/threshold bands, native legend/detail and one roving date-button tab stop replace
timestamp/zero-fill/hover-only chart assumptions. Existing Calendar arithmetic is reused
without changing its assets; external CSS owns palette/geometry/focus/media.

**27 original identities + four grouped/type supplements + three source-behavior
supplements + three inherited theme props = 37 rows: 26 adapted, 11 omitted, zero
unresolved; four accepted tasks.** Loading matrices/data, TooltipProps/VNode injection,
random mock generation, source gap/color algorithms and theme graphs are explicit
omissions, not partial success or fake data.

**133 targeted tests pass** (52 Heatmap + 54 shared Calendar + 27 native/legacy),
declarations/build and all prior/new budgets pass. Level-nine gzip:
**7,822 ESM / 7,956 classic / 1,126 CSS** (raw **20,395 / 20,680 / 4,106**), under
**8,000 / 8,000 / 2,000** ceilings. Combined **8,948 / 9,082** JS+CSS; full three-file
local ESM example **13,029** gzip bytes. Prior exports/budgets stay unchanged; Calendar
remains **7,438**, core/advanced/widgets **14,611 / 2,181 / 2,779** under existing ceilings.

Dedicated Chromium verified actual numeric/missing cell colors, normalized legend/
constant/clamped domains, persistent native detail, table/row/column AX, scoped keys/
native activation/focus/identity, empty/leap/year1/9999/oversized/rejected cases,
native forms/author controls, RTL/zoom/forced-colors/print, no-JS, strict CSP and
classic/Calendar-date/legacy coexistence. The 366-day test produced **54 weeks /
378 padded slots / 372 real date buttons / one tab stop**, with actual 3010px content
in a 1086px scrollport. No unlimited chart, hover-tooltip, print-width or AT parity claim.

**Current catalog: 96 routes / 4,014 rows / 364 of 384 tasks across 91 accepted pages /
20 unchecked. P6: 280 rows = 194 adapted + 83 omitted + three unresolved; eight of
nine specialized routes accepted.** Prior retained P2–P5/P0 routes and broader P0-01–09
legacy CSS/auto-install/inline-theme exceptions remain independently unchanged/open.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (1 Planned) | Marquee | 3 / 3 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Marquee.** It remains separately scoped; no implementation is started here.

## Marquee accepted and main P6 route audit

[Canonical Marquee acceptance](../components/marquee.md) closes the ninth main P6
route with one original bounded noninteractive track. Native Web Animations provide
optional linear overflow traversal; every pause cancels the transform into native
full-content scrolling. Physical direction, finite/infinite alternating passes,
initial delay, resize/content restart, sticky manual pause and media/lifetime/error
contracts are explicit. There are no clones, mirror groups or seamless-loop promises.

**3 original identities + five source behaviors + three inherited theme rows =
11 tracker rows: five native adaptations + six omissions, zero unresolved; 4/4 tasks.**
**69 tests pass** (42 Marquee + 27 native/legacy), declarations/build/budgets and
Chromium actual motion/control/selection/form/RTL/zoom/resize/media/no-JS/CSP/classic/
legacy acceptance. Review fixed continued motion after the pause button was disabled;
native disabled/hidden/fieldset state now stops motion without being overwritten.

Gzip level nine: **4,920 ESM / 5,062 classic / 552 CSS**, combined **5,472 / 5,614**
under **6,000 / 6,000 / 1,000** individual ceilings. Full local ESM example **9,281**.
Core/advanced/widgets remain **14,611 / 2,181 / 2,779**; prior optional assets and
ceilings stay unchanged, runtime dependencies `{}`. Full measurements/limits are canonical.

**Current catalog: 96 routes / 4,022 rows / 368 of 384 accepted tasks across 92 pages /
16 unchecked. No Not reviewed or Planned API row status remains.** Earlier dated/
component sign-off counts above are historical inventory snapshots.

| Main P6-assigned route | Rows | Adapted | Omitted | Accepted tasks |
| --- | ---: | ---: | ---: | ---: |
| [Carousel/CarouselItem](components/carousel.md) | 50 | 35 | 15 | 4/4 |
| [Watermark](components/watermark.md) | 31 | 26 | 5 | 4/4 |
| [Upload/Trigger/Dragger](components/upload.md) | 101 | 57 | 44 | 4/4 |
| [Calendar](components/calendar.md) | 23 | 20 | 3 | 4/4 |
| [Time](components/time.md) | 9 | 7 | 2 | 4/4 |
| [Countdown](components/countdown.md) | 14 | 12 | 2 | 4/4 |
| [Number Animation](components/number-animation.md) | 12 | 11 | 1 | 4/4 |
| [Heatmap](components/heatmap.md) | 37 | 26 | 11 | 4/4 |
| [Marquee](components/marquee.md) | 11 | 5 | 6 | 4/4 |
| **Total: nine retained scopes, zero unresolved rows** | **288** | **199** | **89** | **36/36** |

The audit closes declared native scopes, not seamless Carousel/Marquee effects,
security Watermark, implicit Upload backend/preview, token/provider date-time,
financial interpolation or full chart/renderer parity. Each omitted row remains visible.

| Separate unresolved work | API rows | Task state |
| --- | ---: | --- |
| Equation, QR Code, Legacy Grid, Legacy Transfer | 35 intentionally omitted | 16 alternative-guidance/acceptance tasks still unchecked |
| Broad P0-01–P0-09 foundations | Separate architecture work, not extra catalog rows | Open/partial: legacy CSS extraction, aggregate auto-install and inline-theme compatibility exceptions remain |

**Next recommendation: Equation resolution**, considering native authored MathML
without a parser/typesetting dependency. No Equation or other next scope is implemented.

## Common Components (15)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Avatar](components/avatar.md) | 🟢 Verified retained scope; 16 explicit omissions | Standalone Avatar + Group, `9afc818`; basic aggregate preserved | P1 |
| [Button](components/button.md) | 🟢 Verified retained scope; 9 explicit omissions | Standalone Button + Group, `43dd57f`; basic aggregate preserved | P1 |
| [Card](components/card.md) | 🟢 Verified retained scope; 8 explicit omissions | Standalone native Card, `cebc6d7`; basic aggregate preserved | P1 |
| [Carousel](components/carousel.md) | 🟢 Verified native Carousel/CarouselItem scope; 15 explicit omissions | Optional native scroll-snap/helper; [accepted evidence](../components/carousel.md), legacy widgets preserved | P6 |
| [Collapse](components/collapse.md) | 🟢 Verified native disclosure scope; 14 explicit omissions | Native Collapse/CollapseItem; [accepted evidence](../components/collapse.md) | P3 |
| [Divider](components/divider.md) | 🟢 Verified CSS-only native scope; 3 explicit omissions | Native hr/separator/caption CSS; [accepted evidence](../components/divider.md), legacy preserved | P2 |
| [Dropdown](components/dropdown.md) | 🟢 Verified command-menu scope; 33 explicit omissions | Native hierarchy/keyboard/shared Popover; [accepted evidence](../components/dropdown.md) | P3 |
| [Ellipsis](components/ellipsis.md) | 🟢 Verified native CSS/disclosure scope; 6 explicit omissions | Native text/summary CSS; [accepted evidence](../components/ellipsis.md), no Tooltip/runtime | P2, P3 |
| [Gradient Text](components/gradient-text.md) | 🟢 Verified CSS-only scope; 3 explicit omissions | Native text CSS with readable fallbacks; [accepted evidence](../components/gradient-text.md), no runtime | P2 |
| [Icon](components/icon.md) | 🟢 Verified CSS-only scope; 7 explicit omissions | Native Icon/IconWrapper CSS; [accepted evidence](../components/icon.md), no asset/runtime dependency | P2 |
| [Page Header](components/page-header.md) | 🟢 Verified CSS-only native scope; 3 explicit omissions | Authored region/action CSS; [accepted evidence](../components/page-header.md), no runtime | P2 |
| [Tag](components/tag.md) | 🟢 Verified retained scope; 7 explicit omissions | Standalone native Tag, `6605d29`; basic aggregate preserved | P2 |
| [Typography](components/typography.md) | 🟢 Verified CSS-only scope; 23 explicit omissions | Scoped native CSS; [accepted evidence](../components/typography.md), no new runtime | P2 |
| [Watermark](components/watermark.md) | 🟢 Verified native decorative tile scope; five explicit omissions | Optional Canvas/one-overlay helper; [accepted evidence](../components/watermark.md), no security/anti-tamper claim | P6 |
| [Float Button](components/float-button.md) | 🟢 Verified native scope; 7 explicit omissions | Native actions/groups/popover dock; [accepted evidence](../components/float-button.md) | P2, P3 |

## Data Input Components (21)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Auto Complete](components/auto-complete.md) | 🟢 Verified native datalist/loader scope; 29 explicit omissions | Native field/suggestions with guarded bounded optional loader; [accepted evidence](../components/auto-complete.md) | P4; P5 rich exclusions |
| [Cascader](components/cascader.md) | 🟢 Verified retained native paths; 55 explicit omissions | Native dependent selects; legacy widgets preserved | P5 |
| [Color Picker](components/color-picker.md) | 🟢 Verified classic native RGB scope; 25 explicit omissions | Original color control/readout and draft-safe optional hex editing; [accepted evidence](../components/color-picker.md) | P4; P6 advanced color exclusions |
| [Checkbox](components/checkbox.md) | 🟢 Verified retained native scope; 14 explicit omissions | CSS-only native checkbox and bounded fieldset group helper; [accepted evidence](../components/checkbox.md) | P4 |
| [Date Picker](components/date-picker.md) | 🟢 Verified native calendar/wall-clock/range scope; 162 explicit omissions | Detached native grammar checks, real endpoint fields, safe clear/default/order contracts; [accepted evidence](../components/date-picker.md) | P4; P6 calendar/format exclusions |
| [Dynamic Input](components/dynamic-input.md) | 🟢 Verified bounded native-row scope; 14 explicit omissions | Authored templates, stable fields/keys, actual-node moves and explicit cleanup; [accepted evidence](../components/dynamic-input.md) | P4; P5 renderer/model exclusions |
| [Dynamic Tags](components/dynamic-tags.md) | 🟢 Verified native string-tag/editor scope; 17 explicit omissions | Real readonly values, draft-safe commits and reused native collection; [accepted evidence](../components/dynamic-tags.md) | P4; P5 renderer/object exclusions |
| [Form](components/form.md) | 🟢 Verified native Form/FormItem/FormItemGi scope; 43 explicit omissions | Native fields/constraints, explicit guarded callbacks and owned feedback/grid CSS; [accepted evidence](../components/form.md) | P4 |
| [Input](components/input.md) | 🟢 Verified retained native scope; 13 explicit omissions | Authored Input/textarea, group/addon/pair CSS and optional clear/reveal/count; [accepted evidence](../components/input.md) | P4 |
| [Input Number](components/input-number.md) | 🟢 Verified retained native scope; 13 explicit omissions | Native number input, decimal/grid stepping and clear; [accepted evidence](../components/input-number.md) | P4 |
| [Input OTP](components/input-otp.md) | 🟢 Verified native single-field scope; 17 explicit omissions | Original code field, metadata-only guarded completion and native defaults/forms; [accepted evidence](../components/input-otp.md) | P4 |
| [Mention](components/mention.md) | 🟢 Verified native caret/insertion scope; 16 explicit omissions | Original editor, guarded token search and adjacent native choice buttons; [accepted evidence](../components/mention.md) | P4; P5 renderer/geometry exclusions |
| [Radio](components/radio.md) | 🟢 Verified retained native scope; 11 explicit omissions | Native Radio/RadioButton CSS and complete-group helper; [accepted evidence](../components/radio.md) | P4 |
| [Rate](components/rate.md) | 🟢 Verified retained native scope; six explicit omissions | Bounded native radio scores/halves, clear and static readonly; [accepted evidence](../components/rate.md) | P4 |
| [Select](components/select.md) | 🟢 Verified retained native scope; 63 explicit omissions | Original native select/options/groups, clear and external literal-list filter; [accepted evidence](../components/select.md) | P4; P5 rich exclusions |
| [Slider](components/slider.md) | 🟢 Verified retained native scope; 15 explicit omissions | Native range, non-live output and independent two-track pair; [accepted evidence](../components/slider.md) | P4 |
| [Switch](components/switch.md) | 🟢 Verified retained native scope; 14 explicit omissions | Native binary switch CSS plus focus-safe loading helper; [accepted evidence](../components/switch.md) | P4 |
| [Time Picker](components/time-picker.md) | 🟢 Verified native time-only scope; 34 explicit omissions | Native grammar/precision/overnight constraints and safe clear/default/form lifetime; [accepted evidence](../components/time-picker.md) | P4; P6 panel/format/zone exclusions |
| [Transfer](components/transfer.md) | 🟢 Verified retained membership scope; 24 explicit omissions | Native option movement/formdata; legacy widgets preserved | P5 |
| [Tree Select](components/tree-select.md) | 🟢 Verified retained native select; 81 explicit omissions | Full-path native single/multiple select; existing primitives preserved | P5 |
| [Upload](components/upload.md) | 🟢 Verified native queue/Trigger/Dragger scope; 44 explicit omissions | Optional FileList/caller-transport helper; [accepted evidence](../components/upload.md), legacy selection preserved | P6 |

## Data Display Components (21)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Calendar](components/calendar.md) | 🟢 Verified native Gregorian table scope; three explicit theme omissions | Optional date-only table/roving buttons; [accepted evidence](../components/calendar.md), no timestamp/grid-role/provider claim | P6 |
| [Countdown](components/countdown.md) | 🟢 Verified native elapsed-duration scope; two explicit omissions | Optional monotonic text/unit helper; [accepted evidence](../components/countdown.md), no alarm/renderer parity | P6 |
| [Code](components/code.md) | 🟢 Verified native plain scope; 8 explicit omissions | Native pre/code, authored lines/tokens; [accepted evidence](../components/code.md) | P2; exclusions |
| [Data Table](components/data-table.md) | 🟢 Verified retained native scope; 135 explicit omissions | Original native rows, sort/filter/page/selection and form reveal; [accepted evidence](../components/data-table.md) | P5 |
| [Descriptions](components/descriptions.md) | 🟢 Verified retained native scope; 10 explicit omissions | Native terms/definitions and grid spans; [accepted evidence](../components/descriptions.md) | P2 |
| [Empty](components/empty.md) | 🟢 Verified retained scope; 4 explicit omissions | Standalone native Empty; [accepted evidence](../components/empty.md), basic aggregate preserved | P2 |
| [Equation](components/equation.md) | ⏭️ Intentionally omitted: TeX renderer | None | Exclusions |
| [Image](components/image.md) | 🟢 Verified native/dialog scope; 49 explicit omissions | Native responsive images, bounded fallback/group preview; [accepted evidence](../components/image.md) | P2, P6 |
| [List](components/list.md) | 🟢 Verified retained native scope; 3 explicit omissions | Native CSS lists/items/actions; [accepted evidence](../components/list.md) | P2 |
| [Log](components/log.md) | 🟢 Verified native retained-text scope; 27 explicit omissions | Native Code/line records, bounded append/retention and conditional follow; [accepted evidence](../components/log.md) | P5; exclusions |
| [Number Animation](components/number-animation.md) | 🟢 Verified native number/text scope; one provider omission | Optional finite interpolation/Intl/RAF owner; [accepted evidence](../components/number-animation.md), no financial/renderer claim | P6 |
| [QR Code](components/qr-code.md) | ⏭️ Intentionally omitted: encoder | None | Exclusions |
| [Statistic](components/statistic.md) | 🟢 Verified retained scope; 3 explicit omissions | Standalone native Statistic; [accepted evidence](../components/statistic.md), legacy core preserved | P2 |
| [Table](components/table.md) | 🟢 Verified retained native scope; 4 explicit omissions | Native table/border/stripe/scroll semantics; [accepted evidence](../components/table.md) | P2 |
| [Thing](components/thing.md) | 🟢 Verified retained native scope; 5 explicit omissions | Native seven-region composition/indentation; [accepted evidence](../components/thing.md) | P2 |
| [Time](components/time.md) | 🟢 Verified native instant/relative text scope; two explicit omissions | Pure Intl plus paired native time binding; [accepted evidence](../components/time.md), no token/provider model | P6 |
| [Timeline](components/timeline.md) | 🟢 Verified retained native scope; 3 explicit omissions | Native list/time/markers and scrolling; [accepted evidence](../components/timeline.md) | P2 |
| [Tree](components/tree.md) | 🟢 Verified retained native outline; 87 explicit omissions | Native hierarchy/check/load helper; legacy core preserved | P5 |
| [Infinite Scroll](components/infinite-scroll.md) | 🟢 Verified native load-permission scope; three explicit omissions | Native sentinel/manual loading, guarded completion and serialized cancellation; [accepted evidence](../components/infinite-scroll.md) | P5 |
| [Highlight](components/highlight.md) | 🟢 Verified literal scope; 2 omitted rows and raw-regexp exclusion | Bounded ESM/classic matching + native mark CSS; [accepted evidence](../components/highlight.md) | P2 |
| [Heatmap](components/heatmap.md) | 🟢 Verified native calendar-data scope; 11 explicit omissions | Bounded Gregorian table/bands/detail; [accepted evidence](../components/heatmap.md), no chart/Tooltip renderer | P6 |

## Navigation Components (9)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Affix](components/affix.md) | 🟢 Verified native sticky scope; 7 explicit omissions | Native flow/scroll constraints; [accepted evidence](../components/affix.md) | P2 |
| [Anchor](components/anchor.md) | 🟢 Verified native location scope; 5 explicit omissions | Native fragments/scrollspy/roots; [accepted evidence](../components/anchor.md) | P3 |
| [Back Top](components/back-top.md) | 🟢 Verified retained scope; 6 explicit omissions | Native links/buttons, threshold and shared native scroll context | P3 |
| [Breadcrumb](components/breadcrumb.md) | 🟢 Verified retained native scope; 3 explicit omissions | Native navigation/current/separator semantics; [accepted evidence](../components/breadcrumb.md) | P2 |
| [Loading Bar](components/loading-bar.md) | 🟢 Verified retained scope; 8 explicit omissions | Root-owned native progress/status lifecycle and guarded holds | P3 |
| [Menu](components/menu.md) | 🟢 Verified navigation/disclosure scope; 20 explicit omissions | Native hierarchy/state/shortcuts; [accepted evidence](../components/menu.md) | P3 |
| [Pagination](components/pagination.md) | 🟢 Verified retained scope; 19 explicit omissions | Bounded native paging/model/templates, select and validated jump | P3 |
| [Steps](components/steps.md) | 🟢 Verified retained scope; 7 explicit omissions | Native Steps/Step summary, explicit state and selection intents | P3 |
| [Tabs](components/tabs.md) | 🟢 Verified paired native scope; 10 explicit omissions | Authored guarded Tabs/Tab/TabPane; [accepted evidence](../components/tabs.md) | P3 |

## Feedback Components (16)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Alert](components/alert.md) | 🟢 Verified retained scope; 5 explicit omissions | Standalone native Alert; [accepted evidence](../components/alert.md), basic aggregate preserved | P2 |
| [Badge](components/badge.md) | 🟢 Verified retained scope; 3 explicit omissions | Standalone native Badge; [accepted evidence](../components/badge.md), basic aggregate preserved | P2 |
| [Dialog](components/dialog.md) | 🟢 Verified native lifetime/decision scope; 41 explicit omissions | Authored native dialog/forms, explicit template owner; [accepted evidence](../components/dialog.md) | P3 |
| [Drawer](components/drawer.md) | 🟢 Verified native Drawer/DrawerContent scope; 37 explicit omissions | Native edge docking, authored body/form anatomy and explicit owners; [accepted evidence](../components/drawer.md) | P3 |
| [Marquee](components/marquee.md) | 🟢 Verified single-track native motion; six explicit omissions | Original track, opt-in alternating traversal and full static reading; [accepted evidence](../components/marquee.md) | P6; seamless/automatic-motion exclusions |
| [Message](components/message.md) | 🟢 Verified root-owned native scope; 32 explicit omissions | Bounded safe-text/template service, focus-safe expiry and explicit handles; [accepted evidence](../components/message.md) | P3 |
| [Modal](components/modal.md) | 🟢 Verified generic native scope; 80 explicit omissions | Strict native top layer/forms, authored composition and explicit owners; [accepted evidence](../components/modal.md) | P3 |
| [Notification](components/notification.md) | 🟢 Verified native card/close scope; 22 explicit omissions | Root-owned native articles, typed updates and guarded close; [accepted evidence](../components/notification.md) | P3 |
| [Popconfirm](components/popconfirm.md) | 🟢 Verified native action scope; 22 explicit omissions | Native async decisions/shared Popover; [accepted evidence](../components/popconfirm.md) | P3 |
| [Popover](components/popover.md) | 🟢 Verified native scope; 21 explicit omissions | Native triggers/top layer/anchor fallback; [accepted evidence](../components/popover.md) | P3 |
| [Popselect](components/popselect.md) | 🟢 Verified native selection-disclosure scope; 41 explicit omissions | Composed Popover/Select, immediate values and explicit native form reveal; [accepted evidence](../components/popselect.md) | P5 |
| [Progress](components/progress.md) | 🟢 Verified retained scope; 4 explicit omissions | Standalone native Progress; [accepted evidence](../components/progress.md), legacy core preserved | P2 |
| [Result](components/result.md) | 🟢 Verified retained native scope; 4 explicit omissions | Authored outcome/artwork/actions with CSS palettes; [accepted evidence](../components/result.md) | P2 |
| [Skeleton](components/skeleton.md) | 🟢 Verified retained scope; 3 explicit omissions | Standalone native Skeleton; [accepted evidence](../components/skeleton.md), basic aggregate preserved | P2 |
| [Spin](components/spin.md) | 🟢 Verified retained scope; 5 explicit omissions | Standalone native Spin; [accepted evidence](../components/spin.md), basic aggregate preserved | P2 |
| [Tooltip](components/tooltip.md) | 🟢 Verified descriptive scope; 22 explicit omissions | Native manual tooltip/shared positioning; [accepted evidence](../components/tooltip.md) | P3 |

## Layout Components (6)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Flex](components/flex.md) | 🟢 Verified CSS-only native scope; 4 explicit omissions | Native flex/gap layout; [accepted evidence](../components/flex.md), no child/runtime mutation | P2 |
| [Layout](components/layout.md) | 🟢 Verified retained native scope; 10 explicit omissions | Native CSS/disclosure/scrolling; [accepted evidence](../components/layout.md) | P2, P3 |
| [Legacy Grid](components/legacy-grid.md) | ⏭️ Intentionally omitted: legacy API | Related modern grid | Exclusions |
| [Grid](components/grid.md) | 🟢 Verified retained CSS scope; 11 explicit omissions | Native Grid/GridItem CSS; [accepted evidence](../components/grid.md), packing algorithms omitted | P2 |
| [Space](components/space.md) | 🟢 Verified CSS-only native scope; 5 explicit omissions | Authored item/group CSS; [accepted evidence](../components/space.md), no wrapper/gap runtime | P2 |
| [Split](components/split.md) | 🟢 Verified native two-pane/separator scope; ten explicit omissions | Native grid, ratio/px bounds, pointer+keyboard and safe collapse; [accepted evidence](../components/split.md) | P5 |

## Utility Components (4)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Collapse Transition](components/collapse-transition.md) | 🟢 Verified optional native-motion scope; 12 explicit omissions | Authored wrapper, native height animation/hidden/inert and guarded ownership; [accepted evidence](../components/collapse-transition.md) | P3 |
| [Discrete API](components/discrete.md) | 🟢 Verified native composition; 21 explicit omissions | Existing selected native owners; no new factory/bundle; [accepted evidence](../components/discrete.md) | P3; exclusions |
| [Scrollbar](components/scrollbar.md) | 🟢 Verified native-only scope; 15 explicit exclusion groups | Native APIs/events/overflow and standards hints; [accepted evidence](../components/scrollbar.md) | P2; custom-emulation exclusions |
| [Virtual List](components/virtual-list.md) | 🟢 Verified retained scope; 15 explicit omissions | Native fixed-height helper; legacy advanced preserved | P5 |

## Config Components (3)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Config Provider](components/config-provider.md) | 🟢 Verified native composition; 109 explicit omissions | External CSS/native attributes/explicit owners; [accepted evidence](../components/config-provider.md), no new runtime | P0; exclusions |
| [Element](components/element.md) | 🟢 Verified native composition; twelve explicit omissions | Authored semantic HTML/children/tokens; [accepted evidence](../components/element.md), no new wrapper/runtime | P0 |
| [Global Style](components/global-style.md) | 🟢 Verified opt-in document CSS; nine source omissions | Standalone external body defaults; [accepted evidence](../components/global-style.md), no runtime or automatic import | P0 |

## Deprecated Components (1)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Legacy Transfer](components/legacy-transfer.md) | ⏭️ Intentionally omitted | Related modern transfer | Exclusions |

## Explicit inventory boundaries

The source tree also contains a Config Consumer demo page, but it is not one of the 96 official
menu routes and is not silently added as a 97th component. Global Style has no local API table.
Tooltip delegates its entire documented props/slots to Popover; Discrete API declares a function
signature rather than a prop table. Those cases receive explicit inventories, not empty templates.

Shared owner headings (for example Radio/RadioButton or six heading levels) preserve the upstream
owner grouping. Mode-specific Date Picker tables stay separate, even when property names repeat.
The repeated ModalProvider table is recorded twice with different source locations.
Type aliases and object/index fields written in public API code blocks are tracked independently.
Demonstration-only helper code, undocumented internals and transitive third-party APIs are not
represented as public MarkupUI promises. Form's external validator rules/options/messages are
explicitly excluded; this is not an exhaustive audit of that external package.

Referenced prop types are linked to the appropriate component tracker when there is an official
route. Opaque types without locally documented members remain opaque/unreviewed; this inventory
does not invent missing field definitions. Review pinned implementation source before promoting
such rows or adopting exact callback return/default semantics.

## Inventory validation snapshot

| Check | Result |
| --- | --- |
| Official route documents | 96 of 96, across the nine categories above |
| Direct public API table rows | 2,220; retained one-for-one, including repeated/mode-specific rows |
| Supplementary named declarations | 1,506: 370 inline fields, 191 type/helper/exclusion entries (including five Table public helper groups, Virtual List/Tree named ScrollTo types, UploadInst/UploadSettledFileInfo, CountdownTimeInfo/CountdownInst, NumberAnimationInst and four Heatmap public type groups) and 945 explicit component/grouped Typography/Icon/Gradient Text/Ellipsis/Page Header/Divider/Flex/Space/Grid/List/Descriptions/Timeline/Breadcrumb/Thing/Table/Affix/Result/Code/Scrollbar/Float Button/Image/Popover/Tooltip/Popconfirm/Dropdown/Menu/Tabs/Collapse/Anchor/Back Top/Pagination/Steps/Loading Bar/Dialog/Modal/Drawer/Message/Notification/Collapse Transition/Discrete/Input/Checkbox/Radio/Switch/Select/Input Number/Slider/Rate/Form/Auto Complete/Input OTP/Dynamic Input/Dynamic Tags/Mention/Color Picker/Date Picker/Time Picker/Virtual List/Tree/Cascader/Tree Select/Transfer/Data Table/Log/Infinite Scroll/Popselect/Split/Config Provider/Element/Global Style/Carousel/Watermark/Upload/Calendar/Time/Countdown/Number Animation/Heatmap/Marquee source supplements |
| Explicit inherited tracker rows | 296, including six source-inherited DialogReactive options, three ModalReactive fields, two NotificationReactive fields and three each Element/Carousel/Watermark/Upload/Calendar/Heatmap/Marquee theme props |
| Total tracker rows | 4,022; an inventory denominator, **not** an implementation-completion count |
| Component execution checklists | 96 checklists with four numbered tasks each: 368 retained-scope tasks accepted across 92 component pages, 16 unchecked exclusion-route tasks |
| Native implementation recipes | 96 explicit native paths, each with a small-enhancement boundary and usable fallback/scope reduction |
| Phase consistency | Every index assignment matches its component's P0–P6 or deferred/exclusion delivery scope |
| Status presentation | All 4,022 rows retain canonical text with emoji color: 2,090 Verified native adaptations and 1,932 intentional omissions; no Not reviewed or Planned row remains. Marquee contributes five adaptations/six omissions; other retained counts and linked acceptance records are unchanged. |
| Source agreement | All 2,220 direct source rows and 296 inherited rows remain covered; four unchanged exclusion inventories retain their omission dispositions; the 92 accepted pages preserve named/grouped identities; Marquee preserves all three original identities/links and adds five source-behavior plus three inherited identities; foundation-related route inventories remain reconciled |
| Local links | All 602 scoped Marquee/reference/index/master file links resolve; earlier Heatmap/Number Animation/Countdown/Time/Calendar/Upload/Watermark/Carousel/Global Style/four-route/component link snapshots remain historical evidence |
| Pinned links | Repository paths and referenced line bounds checked against the local pinned checkout |

Repeatable extraction used the pinned public checkout and MarkupUI's already-installed TypeScript
parser to identify inline record fields. No dependency was installed and no repository tooling
was added. Authored plans and inventory have separate responsibilities: future implementation
changes should update status/evidence deliberately, not blindly regenerate over reviewed rows.
Union alternatives that repeat an inline field share one supplemental field row within that
signature; the linked source preserves the alternatives. Named method/slot/callback parameters
are not interpreted as additional component props, and opaque referenced types are not expanded
from undocumented implementation details.
