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
P3 as a whole remains in progress, with Pagination next, then Steps.
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
Popover, Tooltip, Popconfirm, Dropdown, Menu, Tabs, Collapse, Anchor and Back Top add four accepted tasks each; the other **212 tasks remain unchecked**.
P2 retained scopes remain reconciled; these nine retained P3 scopes are accepted and Pagination is next. Reconcile later implementation evidence
with individual retained rows before promoting the historical reference inventory.

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
**Popover/Tooltip/Popconfirm/Dropdown/Menu/Tabs/Collapse/Anchor/Back Top retained scopes are accepted; Pagination is next**, and the master plan owns
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
viewer parity. At Image sign-off 19 P3-assigned routes remained Planned; **11 remain after
Anchor**, listed in the [master next-phase inventory](migration-plan.md#remaining-p3-inventory-after-anchor).
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
explicit source supplements: **10 adapted targets, six omissions**. The catalog now has
**3,289 rows**, **172/384 accepted tasks across 43 pages**; P3 remains incomplete.
**Pagination is next, then Steps.**

**104 targeted tests** (42 Back Top, 35 Anchor, 27 native/legacy), build/budgets and Chromium
cover native keyboard/links/forms/cancellation, threshold/focus/Tab, scroll-root isolation and
x preservation, refresh/disposal, RTL/narrow/zoom/motion/print, fallback and loading coexistence.
Read-only review fixed portable test paths. ESM/classic/CSS are **3,212/3,281/682 gzip bytes**
under new **3,500/3,500/1,000** limits; one format plus CSS is **3,894/3,963**.
All previous optional/core/plugin sources, outputs and ceilings remain unchanged.

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
| [Auto Complete](components/auto-complete.md) | 🔵 Planned | Partial datalist | P4, P5 |
| [Cascader](components/cascader.md) | 🔵 Planned | Partial widgets | P5 |
| [Color Picker](components/color-picker.md) | 🔵 Planned | Native widgets input | P4, P6 |
| [Checkbox](components/checkbox.md) | 🔵 Planned | Partial core | P4 |
| [Date Picker](components/date-picker.md) | 🔵 Planned | Native advanced input | P4, P6 |
| [Dynamic Input](components/dynamic-input.md) | 🔵 Planned | Related inputs | P4, P5 |
| [Dynamic Tags](components/dynamic-tags.md) | 🔵 Planned | Related tag/input | P4, P5 |
| [Form](components/form.md) | 🔵 Planned | Partial validation | P4 |
| [Input](components/input.md) | 🔵 Planned | Partial core | P4 |
| [Input Number](components/input-number.md) | 🔵 Planned | Partial widgets | P4 |
| [Input OTP](components/input-otp.md) | 🔵 Planned | Related input | P4 |
| [Mention](components/mention.md) | 🔵 Planned | Related input | P4, P5 |
| [Radio](components/radio.md) | 🔵 Planned | Partial core | P4 |
| [Rate](components/rate.md) | 🔵 Planned | Partial widgets rating | P4 |
| [Select](components/select.md) | 🔵 Planned | Partial native select | P4, P5 |
| [Slider](components/slider.md) | 🔵 Planned | Partial native range | P4 |
| [Switch](components/switch.md) | 🔵 Planned | Partial checkbox subclass | P4 |
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
| [Loading Bar](components/loading-bar.md) | 🔵 Planned | Related progress | P3 |
| [Menu](components/menu.md) | 🟢 Verified navigation/disclosure scope; 20 explicit omissions | Native hierarchy/state/shortcuts; [accepted evidence](../components/menu.md) | P3 |
| [Pagination](components/pagination.md) | 🔵 Planned | Partial core | P3 |
| [Steps](components/steps.md) | 🔵 Planned | Partial core | P3 |
| [Tabs](components/tabs.md) | 🟢 Verified paired native scope; 10 explicit omissions | Authored guarded Tabs/Tab/TabPane; [accepted evidence](../components/tabs.md) | P3 |

## Feedback Components (16)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Alert](components/alert.md) | 🟢 Verified retained scope; 5 explicit omissions | Standalone native Alert; [accepted evidence](../components/alert.md), basic aggregate preserved | P2 |
| [Badge](components/badge.md) | 🟢 Verified retained scope; 3 explicit omissions | Standalone native Badge; [accepted evidence](../components/badge.md), basic aggregate preserved | P2 |
| [Dialog](components/dialog.md) | 🔵 Planned | Partial native dialog | P3 |
| [Drawer](components/drawer.md) | 🔵 Planned | Partial dialog-derived | P3 |
| [Marquee](components/marquee.md) | 🔵 Planned | None | P6; automatic-motion exclusions |
| [Message](components/message.md) | 🔵 Planned | Partial service | P3 |
| [Modal](components/modal.md) | 🔵 Planned | Shared controller only | P3 |
| [Notification](components/notification.md) | 🔵 Planned | Partial service | P3 |
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
| [Collapse Transition](components/collapse-transition.md) | 🔵 Planned | Related motion styles | P3 |
| [Discrete API](components/discrete.md) | 🔵 Planned; ⏭️ Vue app omitted | Message/notification functions | P3; exclusions |
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
| Supplementary named declarations | 805: 367 inline fields, 180 type/helper/exclusion entries (including five Table public helper groups) and 258 explicit component/grouped Typography/Icon/Gradient Text/Ellipsis/Page Header/Divider/Flex/Space/Grid/List/Descriptions/Timeline/Breadcrumb/Thing/Table/Affix/Result/Code/Scrollbar/Float Button/Image/Popover/Tooltip/Popconfirm/Dropdown/Menu/Tabs/Collapse/Anchor/Back Top source supplements |
| Explicit inherited tracker rows | 264 |
| Total tracker rows | 3,289; an inventory denominator, **not** an implementation-completion count |
| Component execution checklists | 96 checklists with four numbered tasks each: 172 retained-scope tasks accepted across 43 component pages, 212 unchecked |
| Native implementation recipes | 96 explicit native paths, each with a small-enhancement boundary and usable fallback/scope reduction |
| Phase consistency | Every index assignment matches its component's P0–P6 or deferred/exclusion delivery scope |
| Status presentation | All 3,289 rows retain canonical text with emoji color; 19 Avatar, 29 Button, 26 Card, 24 Tag, 11 Badge, 9 Alert, 7 Empty, 9 Skeleton, 13 Spin, 23 Progress, 7 Statistic, 17 Typography, 10 Icon, 10 Gradient Text, 4 Ellipsis, 12 Page Header, 4 Divider, 9 Flex, 13 Space, 10 Grid, 32 Layout, 11 List, 17 Descriptions, 16 Timeline, 9 Breadcrumb, 14 Thing, 12 Table, 5 Highlight, 3 Affix, 7 Result, 6 Code, 12 Scrollbar, 22 Float Button, 41 Image, 28 Popover, 21 Tooltip, 30 Popconfirm, 42 Dropdown, 36 Menu, 40 Tabs, 19 Collapse, 12 Anchor and 10 Back Top Verified adapted targets cite acceptance |
| Source agreement | All 2,220 direct source rows and 264 inherited rows remain covered; 53 unchanged inventories match extraction; the 43 accepted pages preserve named/grouped identities with explicit dispositions |
| Local links | Relative file links validated after Back Top reconciliation; the historical 612-link snapshot also checked heading anchors |
| Pinned links | Repository paths and referenced line bounds checked against the local pinned checkout |

Repeatable extraction used the pinned public checkout and MarkupUI's already-installed TypeScript
parser to identify inline record fields. No dependency was installed and no repository tooling
was added. Authored plans and inventory have separate responsibilities: future implementation
changes should update status/evidence deliberately, not blindly regenerate over reviewed rows.
Union alternatives that repeat an inline field share one supplemental field row within that
signature; the linked source preserves the alternatives. Named method/slot/callback parameters
are not interpreted as additional component props, and opaque referenced types are not expanded
from undocumented implementation details.
