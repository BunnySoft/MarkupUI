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
**P3 is Verified for retained native scopes:** all 22 P3-assigned pages and their 1,086 rows
are reconciled. **P4 is In progress**, with Input, Checkbox, Radio, Switch, native Select, Input Number, Slider, Rate, Form, Auto Complete, Input OTP, Dynamic Input, Dynamic Tags, Mention, Color Picker and Date Picker accepted; Time Picker is the one remaining Planned P4 route.
P0/P5/P6 and full framework parity remain independent. **Next: Time Picker**.
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
Popover, Tooltip, Popconfirm, Dropdown, Menu, Tabs, Collapse, Anchor, Back Top, Pagination, Steps, Loading Bar, Dialog, Modal, Drawer, Message, Notification, Collapse Transition, Discrete API, Input, Checkbox, Radio, Switch, Select, Input Number, Slider and Rate add four accepted tasks each; the other **140 tasks remain unchecked**.
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
**All retained P3 scopes and P4's native Input/Checkbox/Radio/Switch/Select/Input Number/Slider/Rate contracts are accepted; Form native validation is next**, and the master plan owns
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
Catalog totals: **3,654 rows, 276/384 accepted tasks across 69 pages**, **108 unchecked**.
P4 has **968 rows**, with **Time Picker's 34 unresolved rows** still Planned.

**179 targeted tests**, build/budgets and Chromium grammar/leap/week/seconds/range/
constraints/clear/reset/FormData/focus, no-JS and RTL/zoom/media passed. Review fixes preserve
all clear notifications across cancelled resets and action-attribute overrides made by focus
handlers. Two timezone contexts retained date/local-wall-clock strings unchanged; a fixed-clock
local-Today recipe produced different correct local calendar days without UTC slicing.
That proves no implicit conversion, not validity of real zoned DST instants.

ESM/classic/CSS are **3,882/3,953/421 gzip bytes**, under **4,500/4,500/1,000** ceilings.
All **164 prior top-level JS/CSS assets** byte-match the pre-Date Picker HEAD recipe;
core/plugins remain **14,611/2,181/2,779** under unchanged budgets. No native popup UI,
year/quarter grid, arbitrary blackout cells, format engine or universal AT parity is claimed.

**Next: Time Picker.** Overall P4 remains In progress until its remaining native scope and
sign-off are complete; P0/P5/P6 do not inherit completion.

## Common Components (15)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Avatar](components/avatar.md) | 🟢 Verified retained scope; 16 explicit omissions | Standalone Avatar + Group, `9afc818`; basic aggregate preserved | P1 |
| [Button](components/button.md) | 🟢 Verified retained scope; 9 explicit omissions | Standalone Button + Group, `43dd57f`; basic aggregate preserved | P1 |
| [Card](components/card.md) | 🟢 Verified retained scope; 8 explicit omissions | Standalone native Card, `cebc6d7`; basic aggregate preserved | P1 |
| [Carousel](components/carousel.md) | 🔵 Planned | Partial widgets | P6 |
| [Collapse](components/collapse.md) | 🟢 Verified native disclosure scope; 14 explicit omissions | Native Collapse/CollapseItem; [accepted evidence](../components/collapse.md) | P3 |
| [Divider](components/divider.md) | 🟢 Verified CSS-only native scope; 3 explicit omissions | Native hr/separator/caption CSS; [accepted evidence](../components/divider.md), legacy preserved | P2 |
| [Dropdown](components/dropdown.md) | 🟢 Verified command-menu scope; 33 explicit omissions | Native hierarchy/keyboard/shared Popover; [accepted evidence](../components/dropdown.md) | P3 |
| [Ellipsis](components/ellipsis.md) | 🟢 Verified native CSS/disclosure scope; 6 explicit omissions | Native text/summary CSS; [accepted evidence](../components/ellipsis.md), no Tooltip/runtime | P2, P3 |
| [Gradient Text](components/gradient-text.md) | 🟢 Verified CSS-only scope; 3 explicit omissions | Native text CSS with readable fallbacks; [accepted evidence](../components/gradient-text.md), no runtime | P2 |
| [Icon](components/icon.md) | 🟢 Verified CSS-only scope; 7 explicit omissions | Native Icon/IconWrapper CSS; [accepted evidence](../components/icon.md), no asset/runtime dependency | P2 |
| [Page Header](components/page-header.md) | 🟢 Verified CSS-only native scope; 3 explicit omissions | Authored region/action CSS; [accepted evidence](../components/page-header.md), no runtime | P2 |
| [Tag](components/tag.md) | 🟢 Verified retained scope; 7 explicit omissions | Standalone native Tag, `6605d29`; basic aggregate preserved | P2 |
| [Typography](components/typography.md) | 🟢 Verified CSS-only scope; 23 explicit omissions | Scoped native CSS; [accepted evidence](../components/typography.md), no new runtime | P2 |
| [Watermark](components/watermark.md) | 🔵 Planned | None | P6 |
| [Float Button](components/float-button.md) | 🟢 Verified native scope; 7 explicit omissions | Native actions/groups/popover dock; [accepted evidence](../components/float-button.md) | P2, P3 |

## Data Input Components (21)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Auto Complete](components/auto-complete.md) | 🟢 Verified native datalist/loader scope; 29 explicit omissions | Native field/suggestions with guarded bounded optional loader; [accepted evidence](../components/auto-complete.md) | P4; P5 rich exclusions |
| [Cascader](components/cascader.md) | 🔵 Planned | Partial widgets | P5 |
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
| [Time Picker](components/time-picker.md) | 🔵 Planned | Native advanced input | P4, P6 |
| [Transfer](components/transfer.md) | 🔵 Planned | Partial widgets | P5 |
| [Tree Select](components/tree-select.md) | 🔵 Planned | Related tree/select | P5 |
| [Upload](components/upload.md) | 🔵 Planned | File selection only | P6 |

## Data Display Components (21)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Calendar](components/calendar.md) | 🔵 Planned | None | P6 |
| [Countdown](components/countdown.md) | 🔵 Planned | None | P6 |
| [Code](components/code.md) | 🟢 Verified native plain scope; 8 explicit omissions | Native pre/code, authored lines/tokens; [accepted evidence](../components/code.md) | P2; exclusions |
| [Data Table](components/data-table.md) | 🔵 Planned | Partial advanced grid | P5 |
| [Descriptions](components/descriptions.md) | 🟢 Verified retained native scope; 10 explicit omissions | Native terms/definitions and grid spans; [accepted evidence](../components/descriptions.md) | P2 |
| [Empty](components/empty.md) | 🟢 Verified retained scope; 4 explicit omissions | Standalone native Empty; [accepted evidence](../components/empty.md), basic aggregate preserved | P2 |
| [Equation](components/equation.md) | ⏭️ Intentionally omitted: TeX renderer | None | Exclusions |
| [Image](components/image.md) | 🟢 Verified native/dialog scope; 49 explicit omissions | Native responsive images, bounded fallback/group preview; [accepted evidence](../components/image.md) | P2, P6 |
| [List](components/list.md) | 🟢 Verified retained native scope; 3 explicit omissions | Native CSS lists/items/actions; [accepted evidence](../components/list.md) | P2 |
| [Log](components/log.md) | 🔵 Planned; ⏭️ highlighter omitted | Related virtual list | P5; exclusions |
| [Number Animation](components/number-animation.md) | 🔵 Planned | Related statistic | P6 |
| [QR Code](components/qr-code.md) | ⏭️ Intentionally omitted: encoder | None | Exclusions |
| [Statistic](components/statistic.md) | 🟢 Verified retained scope; 3 explicit omissions | Standalone native Statistic; [accepted evidence](../components/statistic.md), legacy core preserved | P2 |
| [Table](components/table.md) | 🟢 Verified retained native scope; 4 explicit omissions | Native table/border/stripe/scroll semantics; [accepted evidence](../components/table.md) | P2 |
| [Thing](components/thing.md) | 🟢 Verified retained native scope; 5 explicit omissions | Native seven-region composition/indentation; [accepted evidence](../components/thing.md) | P2 |
| [Time](components/time.md) | 🔵 Planned | None | P6 |
| [Timeline](components/timeline.md) | 🟢 Verified retained native scope; 3 explicit omissions | Native list/time/markers and scrolling; [accepted evidence](../components/timeline.md) | P2 |
| [Tree](components/tree.md) | 🔵 Planned | Partial core | P5 |
| [Infinite Scroll](components/infinite-scroll.md) | 🔵 Planned | Related virtual list | P5 |
| [Highlight](components/highlight.md) | 🟢 Verified literal scope; 2 omitted rows and raw-regexp exclusion | Bounded ESM/classic matching + native mark CSS; [accepted evidence](../components/highlight.md) | P2 |
| [Heatmap](components/heatmap.md) | 🔵 Planned | None | P6 |

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
| [Marquee](components/marquee.md) | 🔵 Planned | None | P6; automatic-motion exclusions |
| [Message](components/message.md) | 🟢 Verified root-owned native scope; 32 explicit omissions | Bounded safe-text/template service, focus-safe expiry and explicit handles; [accepted evidence](../components/message.md) | P3 |
| [Modal](components/modal.md) | 🟢 Verified generic native scope; 80 explicit omissions | Strict native top layer/forms, authored composition and explicit owners; [accepted evidence](../components/modal.md) | P3 |
| [Notification](components/notification.md) | 🟢 Verified native card/close scope; 22 explicit omissions | Root-owned native articles, typed updates and guarded close; [accepted evidence](../components/notification.md) | P3 |
| [Popconfirm](components/popconfirm.md) | 🟢 Verified native action scope; 22 explicit omissions | Native async decisions/shared Popover; [accepted evidence](../components/popconfirm.md) | P3 |
| [Popover](components/popover.md) | 🟢 Verified native scope; 21 explicit omissions | Native triggers/top layer/anchor fallback; [accepted evidence](../components/popover.md) | P3 |
| [Popselect](components/popselect.md) | 🔵 Planned | Related popover/select | P5 |
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
| [Split](components/split.md) | 🔵 Planned | None | P5 |

## Utility Components (4)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Collapse Transition](components/collapse-transition.md) | 🟢 Verified optional native-motion scope; 12 explicit omissions | Authored wrapper, native height animation/hidden/inert and guarded ownership; [accepted evidence](../components/collapse-transition.md) | P3 |
| [Discrete API](components/discrete.md) | 🟢 Verified native composition; 21 explicit omissions | Existing selected native owners; no new factory/bundle; [accepted evidence](../components/discrete.md) | P3; exclusions |
| [Scrollbar](components/scrollbar.md) | 🟢 Verified native-only scope; 15 explicit exclusion groups | Native APIs/events/overflow and standards hints; [accepted evidence](../components/scrollbar.md) | P2; custom-emulation exclusions |
| [Virtual List](components/virtual-list.md) | 🔵 Planned | Partial fixed-height advanced | P5 |

## Config Components (3)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Config Provider](components/config-provider.md) | 🔵 Planned; ⏭️ framework surfaces omitted | Theme API only | P0; exclusions |
| [Element](components/element.md) | 🔵 Planned: native composition | Custom-element base | P0 |
| [Global Style](components/global-style.md) | 🔵 Planned: external CSS | Injected core CSS | P0 |

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
| Supplementary named declarations | 1,159: 367 inline fields, 180 type/helper/exclusion entries (including five Table public helper groups) and 612 explicit component/grouped Typography/Icon/Gradient Text/Ellipsis/Page Header/Divider/Flex/Space/Grid/List/Descriptions/Timeline/Breadcrumb/Thing/Table/Affix/Result/Code/Scrollbar/Float Button/Image/Popover/Tooltip/Popconfirm/Dropdown/Menu/Tabs/Collapse/Anchor/Back Top/Pagination/Steps/Loading Bar/Dialog/Modal/Drawer/Message/Notification/Collapse Transition/Discrete/Input/Checkbox/Radio/Switch/Select/Input Number/Slider/Rate/Form/Auto Complete/Input OTP/Dynamic Input/Dynamic Tags/Mention/Color Picker/Date Picker source supplements |
| Explicit inherited tracker rows | 275, including six source-inherited DialogReactive options, three ModalReactive fields and two NotificationReactive fields |
| Total tracker rows | 3,654; an inventory denominator, **not** an implementation-completion count |
| Component execution checklists | 96 checklists with four numbered tasks each: 276 retained-scope tasks accepted across 69 component pages, 108 unchecked |
| Native implementation recipes | 96 explicit native paths, each with a small-enhancement boundary and usable fallback/scope reduction |
| Phase consistency | Every index assignment matches its component's P0–P6 or deferred/exclusion delivery scope |
| Status presentation | All 3,654 rows retain canonical text with emoji color; 19 Avatar, 29 Button, 26 Card, 24 Tag, 11 Badge, 9 Alert, 7 Empty, 9 Skeleton, 13 Spin, 23 Progress, 7 Statistic, 17 Typography, 10 Icon, 10 Gradient Text, 4 Ellipsis, 12 Page Header, 4 Divider, 9 Flex, 13 Space, 10 Grid, 32 Layout, 11 List, 17 Descriptions, 16 Timeline, 9 Breadcrumb, 14 Thing, 12 Table, 5 Highlight, 3 Affix, 7 Result, 6 Code, 12 Scrollbar, 22 Float Button, 41 Image, 28 Popover, 21 Tooltip, 30 Popconfirm, 42 Dropdown, 36 Menu, 40 Tabs, 19 Collapse, 12 Anchor, 10 Back Top, 36 Pagination, 16 Steps, 10 Loading Bar, 80 Dialog, 74 Modal, 30 Drawer, 35 Message, 39 Notification, 8 Collapse Transition, 7 Discrete, 58 Input, 28 Checkbox, 23 Radio, 17 Switch, 35 Select, 33 Input Number, 13 Slider, 13 Rate, 68 Form, 27 Auto Complete, 17 Input OTP, 28 Dynamic Input, 25 Dynamic Tags, 30 Mention, 10 Color Picker and 37 Date Picker native capabilities cite acceptance |
| Source agreement | All 2,220 direct source rows and 275 inherited rows remain covered; 27 unchanged inventories match extraction; the 69 accepted pages preserve named/grouped identities with explicit dispositions; Date Picker's 179 original section/source/kind identities match pre-migration HEAD exactly and in order |
| Local links | Relative file links in the four edited Date Picker/index/master documents checked at sign-off; Color Picker/Mention/Dynamic Tags/Dynamic Input/OTP/Auto Complete/Form/Rate/Slider/Input Number/Select/Switch/Radio/Checkbox/Input/Discrete/P3 and historical link snapshots remain historical evidence |
| Pinned links | Repository paths and referenced line bounds checked against the local pinned checkout |

Repeatable extraction used the pinned public checkout and MarkupUI's already-installed TypeScript
parser to identify inline record fields. No dependency was installed and no repository tooling
was added. Authored plans and inventory have separate responsibilities: future implementation
changes should update status/evidence deliberately, not blindly regenerate over reviewed rows.
Union alternatives that repeat an inline field share one supplemental field row within that
signature; the linked source preserves the alternatives. Named method/slot/callback parameters
are not interpreted as additional component props, and opaque referenced types are not expanded
from undocumented implementation details.
