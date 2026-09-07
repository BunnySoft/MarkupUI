# Naive UI reference and MarkupUI migration plan

This is a **proposal and migration inventory, not a shipped compatibility layer**.
Explicitly Verified retained targets, currently Avatar/Avatar Group in `9afc818`,
Button/ButtonGroup in `43dd57f`, and Card in `cebc6d7`, have
committed implementation evidence; the remaining catalog must not inherit that status.
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
  implementation is `9afc818`, Button's is `43dd57f`, and Card's is `cebc6d7`;
  other unreviewed slices retain the historical baseline.
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
`43dd57f`, and Card's four using `cebc6d7`, each with a standalone acceptance record;
the other **372 tasks remain unchecked**. Tag is in progress. Reconcile later implementation evidence
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
16 Intentionally omitted contracts**. Button and Card are also accepted as recorded below;
**Tag is active**, and the master plan owns
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

The pilot retained scopes are complete; **Tag is in progress**, followed by Badge. Detailed
phase progress and per-component commits belong in the master migration plan.

## Common Components (15)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Avatar](components/avatar.md) | 🟢 Verified retained scope; 16 explicit omissions | Standalone Avatar + Group, `9afc818`; basic aggregate preserved | P1 |
| [Button](components/button.md) | 🟢 Verified retained scope; 9 explicit omissions | Standalone Button + Group, `43dd57f`; basic aggregate preserved | P1 |
| [Card](components/card.md) | 🟢 Verified retained scope; 8 explicit omissions | Standalone native Card, `cebc6d7`; basic aggregate preserved | P1 |
| [Carousel](components/carousel.md) | 🔵 Planned | Partial widgets | P6 |
| [Collapse](components/collapse.md) | 🔵 Planned | Partial core accordion | P3 |
| [Divider](components/divider.md) | 🔵 Planned | Separator role/styles | P2 |
| [Dropdown](components/dropdown.md) | 🔵 Planned | Related menu/popover | P3 |
| [Ellipsis](components/ellipsis.md) | 🔵 Planned | None | P2, P3 |
| [Gradient Text](components/gradient-text.md) | 🔵 Planned | None | P2 |
| [Icon](components/icon.md) | 🔵 Planned | Native assets only | P2 |
| [Page Header](components/page-header.md) | 🔵 Planned | Related structure | P2 |
| [Tag](components/tag.md) | 🟠 In progress | Standalone migration active; historical partial core preserved | P2 |
| [Typography](components/typography.md) | 🔵 Planned | Partial core | P2 |
| [Watermark](components/watermark.md) | 🔵 Planned | None | P6 |
| [Float Button](components/float-button.md) | 🔵 Planned | Related button | P2, P3 |

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
| [Code](components/code.md) | 🔵 Planned; ⏭️ highlighter omitted | Code styling only | P2; exclusions |
| [Data Table](components/data-table.md) | 🔵 Planned | Partial advanced grid | P5 |
| [Descriptions](components/descriptions.md) | 🔵 Planned | Partial core | P2 |
| [Empty](components/empty.md) | 🔵 Planned | Partial core | P2 |
| [Equation](components/equation.md) | ⏭️ Intentionally omitted: TeX renderer | None | Exclusions |
| [Image](components/image.md) | 🔵 Planned | Related avatar | P2, P6 |
| [List](components/list.md) | 🔵 Planned | List/item roles and styles | P2 |
| [Log](components/log.md) | 🔵 Planned; ⏭️ highlighter omitted | Related virtual list | P5; exclusions |
| [Number Animation](components/number-animation.md) | 🔵 Planned | Related statistic | P6 |
| [QR Code](components/qr-code.md) | ⏭️ Intentionally omitted: encoder | None | Exclusions |
| [Statistic](components/statistic.md) | 🔵 Planned | Partial core | P2 |
| [Table](components/table.md) | 🔵 Planned | Related generated table | P2 |
| [Thing](components/thing.md) | 🔵 Planned | Related card/list | P2 |
| [Time](components/time.md) | 🔵 Planned | None | P6 |
| [Timeline](components/timeline.md) | 🔵 Planned | Widgets styles | P2 |
| [Tree](components/tree.md) | 🔵 Planned | Partial core | P5 |
| [Infinite Scroll](components/infinite-scroll.md) | 🔵 Planned | Related virtual list | P5 |
| [Highlight](components/highlight.md) | 🔵 Planned | None | P2 |
| [Heatmap](components/heatmap.md) | 🔵 Planned | None | P6 |

## Navigation Components (9)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Affix](components/affix.md) | 🔵 Planned | Native sticky candidate | P2 |
| [Anchor](components/anchor.md) | 🔵 Planned | Related links | P3 |
| [Back Top](components/back-top.md) | 🔵 Planned | Related buttons/links | P3 |
| [Breadcrumb](components/breadcrumb.md) | 🔵 Planned | Partial widgets | P2 |
| [Loading Bar](components/loading-bar.md) | 🔵 Planned | Related progress | P3 |
| [Menu](components/menu.md) | 🔵 Planned | Partial flat core | P3 |
| [Pagination](components/pagination.md) | 🔵 Planned | Partial core | P3 |
| [Steps](components/steps.md) | 🔵 Planned | Partial core | P3 |
| [Tabs](components/tabs.md) | 🔵 Planned | Partial core | P3 |

## Feedback Components (16)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Alert](components/alert.md) | 🔵 Planned | Core styles/registration | P2 |
| [Badge](components/badge.md) | 🔵 Planned | Core styles | P2 |
| [Dialog](components/dialog.md) | 🔵 Planned | Partial native dialog | P3 |
| [Drawer](components/drawer.md) | 🔵 Planned | Partial dialog-derived | P3 |
| [Marquee](components/marquee.md) | 🔵 Planned | None | P6; automatic-motion exclusions |
| [Message](components/message.md) | 🔵 Planned | Partial service | P3 |
| [Modal](components/modal.md) | 🔵 Planned | Shared controller only | P3 |
| [Notification](components/notification.md) | 🔵 Planned | Partial service | P3 |
| [Popconfirm](components/popconfirm.md) | 🔵 Planned | Related popover/button | P3 |
| [Popover](components/popover.md) | 🔵 Planned | Partial core | P3 |
| [Popselect](components/popselect.md) | 🔵 Planned | Related popover/select | P5 |
| [Progress](components/progress.md) | 🔵 Planned | Partial linear core | P2 |
| [Result](components/result.md) | 🔵 Planned | Related empty/content | P2 |
| [Skeleton](components/skeleton.md) | 🔵 Planned | Partial core | P2 |
| [Spin](components/spin.md) | 🔵 Planned | Status role/label and styles | P2 |
| [Tooltip](components/tooltip.md) | 🔵 Planned | Partial hover/focus core | P3 |

## Layout Components (6)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Flex](components/flex.md) | 🔵 Planned | Core layout styles | P2 |
| [Layout](components/layout.md) | 🔵 Planned | Partial structural wrappers | P2, P3 |
| [Legacy Grid](components/legacy-grid.md) | ⏭️ Intentionally omitted: legacy API | Related modern grid | Exclusions |
| [Grid](components/grid.md) | 🔵 Planned | Partial core | P2 |
| [Space](components/space.md) | 🔵 Planned: CSS gap | Related gap layouts | P2 |
| [Split](components/split.md) | 🔵 Planned | None | P5 |

## Utility Components (4)

| Component | Plan direction | Current baseline | Phase |
| --- | --- | --- | --- |
| [Collapse Transition](components/collapse-transition.md) | 🔵 Planned | Related motion styles | P3 |
| [Discrete API](components/discrete.md) | 🔵 Planned; ⏭️ Vue app omitted | Message/notification functions | P3; exclusions |
| [Scrollbar](components/scrollbar.md) | 🔵 Planned: native | Native overflow | P2; custom-emulation exclusions |
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
| Supplementary named declarations | 548: 366 inline fields, 174 type/helper/exclusion entries and 8 explicit Button/Card source supplements |
| Explicit inherited tracker rows | 264 |
| Total tracker rows | 3,032; an inventory denominator, **not** an implementation-completion count |
| Component execution checklists | 96 checklists with four numbered tasks each: 12 Avatar/Button/Card retained-scope tasks accepted, 372 unchecked |
| Native implementation recipes | 96 explicit native paths, each with a small-enhancement boundary and usable fallback/scope reduction |
| Phase consistency | Every index assignment matches its component's P0–P6 or deferred/exclusion delivery scope |
| Status presentation | All 3,032 rows retain canonical text with emoji color; 19 Avatar, 29 Button and 26 Card Verified rows cite accepted implementation |
| Source agreement | All 2,220 direct source rows remain covered; 93 unchanged inventories match extraction; Avatar/Button/Card preserve named rows with accepted dispositions |
| Local links | Relative file links checked after implementation overlays; the initial 612-link snapshot also checked heading anchors |
| Pinned links | Repository paths and referenced line bounds checked against the local pinned checkout |

Repeatable extraction used the pinned public checkout and MarkupUI's already-installed TypeScript
parser to identify inline record fields. No dependency was installed and no repository tooling
was added. Authored plans and inventory have separate responsibilities: future implementation
changes should update status/evidence deliberately, not blindly regenerate over reviewed rows.
Union alternatives that repeat an inline field share one supplemental field row within that
signature; the linked source preserves the alternatives. Named method/slot/callback parameters
are not interpreted as additional component props, and opaque referenced types are not expanded
from undocumented implementation details.
