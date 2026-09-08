# MarkupUI migration plan

**Plan state: 🟠 In progress overall — P1 pilots and P2 are Verified for declared retained
native scopes and explicit omissions. All 31 P2-assigned pages now have closed property
dispositions and four accepted tasks, including Image's limited P6 dialog scope. Global
P3/P4/P5/P6 and full framework/viewer parity are not complete.** Existing MarkupUI features are a partial baseline,
not automatically completed migration tasks. This roadmap targets useful Naive UI behaviors with a native,
dependency-free design; it does not promise framework API compatibility.

[Component index and property trackers](index.md) |
[Architecture and API rules](architecture.md)

## Status legend

| Status | Meaning |
| --- | --- |
| ⚪ Not reviewed | The item is identified, but its target scope or existing support still needs review. |
| 🔵 Planned | A proposed task or target mapping is recorded; implementation has not started. |
| 🟠 In progress | An implementation change is underway, with a linked branch or change. |
| 🟣 Implemented | Target code exists with a source reference; acceptance evidence is incomplete. |
| 🟢 Verified | The agreed target scope is complete with linked acceptance evidence. |
| ⏭️ Intentionally omitted | Deliberately excluded, with a reason and a simpler alternative where possible. |

The text label is authoritative; color is only a scanning aid. An unchecked task is not
complete. Do not turn tasks green because the planning document exists. Keep documentation
coverage, implementation status, and upstream feature parity separate.

## Phase dashboard

| Phase | Status | Goal | Prerequisite | Exit gate |
| --- | --- | --- | --- | --- |
| P0 — Architecture and contracts | 🔵 Planned | Establish separated sources, compatible loading, lifecycle, events and native-control conventions. | None | A minimal external-CSS example works without a consumer build step, and existing loading remains supported. |
| P1 — Pilot components | 🟢 Verified | Avatar, Button and Card retained pilot scopes completed. | Relevant P0 contracts | Individual records plus combined ESM/legacy composition evidence below. |
| P2 — Primitives and layout | 🟢 Verified retained scope | All 31 P2-assigned pages reconciled; native Image/fallback/dialog scope accepted with advanced P6 exclusions. | P1 pattern | Full 96-route and P2 reference audit found no retained unresolved P2 rows. This is not global P3/P6 or framework parity. |
| P3 — Interaction foundations | 🟠 In progress | Popover/Tooltip/Popconfirm, declared navigation through Steps, Loading Bar and Dialog/Modal/Drawer accepted; remaining feedback/transition/service scopes are incomplete. | P0 lifecycle; P1 controls | Nested interaction, dismissal and focus behavior are defined and demonstrated per component. |
| P4 — Forms and selection | 🔵 Planned | Make native controls dependable, then add optional richer selection. | P0 form contract; P3 for popup variants | Values, labels, submission, reset, validity and event semantics are consistent. |
| P5 — Collections and scale | 🔵 Planned | Add stable-key, async and virtualized collection behavior. | P3 focus; P4 selection | Selection survives updates, stale async work is handled and large rendering is bounded. |
| P6 — Specialized modules | 🔵 Planned | Deliver independently justified, opt-in advanced features. | Component-specific earlier work | Explicit imports, independent size budgets and no runtime dependencies. |

The [component index](index.md) is the exhaustive catalog-to-phase assignment. The phase
groups below name principal workstreams, not additional promises that every catalog feature
will ship. In particular, a native control can finish its basic scope before an optional
enhanced version is approved.

### P0 — Architecture and contracts

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P0-01 | 🔵 Planned | Extract authored styles from core and plugin TypeScript into CSS files. | One maintained CSS source per component and shared token layer. |
| P0-02 | 🔵 Planned | Design external-CSS classic-script and ES-module entries; preserve the current auto-registering, style-installing entry. | Explicit export/loading map and compatibility example; no speculative path presented as already available. |
| P0-03 | 🔵 Planned | Define adoption of authored native children and generated fallback anatomy. | Rules for child ownership, late children, pre-upgrade properties, reconnection and listener disposal. |
| P0-04 | 🔵 Planned | Specify attribute parsing/reflection, current/default values and event payloads. | Native-style silent property assignment and documented user-change events without duplicate native/custom handling. |
| P0-05 | 🔵 Planned | Define native form integration and validation boundaries. | Named controls, labels, fieldset disabling, reset and validity; no duplicate submission. |
| P0-06 | 🔵 Planned | Separate external theme CSS from optional programmatic token updates. | Scoped theme/direction conventions and explicit CSP limitations for dynamic styles. |
| P0-07 | 🔵 Planned | Record bundle boundaries and combined JS+CSS accounting. | Existing ceilings preserved; new optional entry budgets proposed separately. |
| P0-08 | 🔵 Planned | Reconcile each component's retained, simplified, deferred and omitted API items. | A named disposition for every inventoried public API item, including companion and inherited surfaces. |
| P0-09 | 🔵 Planned | Select native browser primitives and document support/fallback decisions before writing equivalent custom code. | Per-component choices for Custom Elements, templates, native controls, dialog/popover, CSS and observers; no generic template engine or polyfill dependencies. |

Do not build a new framework during P0. Introduce shared helpers only with a concrete pilot
consumer. P0-08 can continue alongside later phases; unresolved optional scope must not be
misrepresented as completed work.

### P1 — Pilot components

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P1-01 — Avatar | 🟢 Verified | Preserve authored image/text fallback; implement size/shape/fit in CSS; define image error/loading behavior and reactive source changes. | [Standalone component and acceptance record](../components/avatar.md); classic/ESM entry plus external CSS; legacy aggregate remains compatible. |
| P1-02 — Avatar group | 🟢 Verified | Define companion group anatomy, ordering and overflow separately from individual avatars. | Native details/summary overflow, stable node identities and documented scope exclusions in the Avatar record. |
| P1-03 — Button | 🟢 Verified | Preserve variants while establishing native button semantics, form type, disabled/loading behavior and icon/label children. | [Native component and acceptance record](../components/button.md); commit `43dd57f`. |
| P1-04 — Card | 🟢 Verified | Preserve existing compound children and free-form content; map header/footer/cover/action areas, sizing and close intent. | [Native component and acceptance record](../components/card.md); commit `cebc6d7`. |
| P1-05 — Pilot sign-off | 🟢 Verified | Resolve retained pilot API rows, examples and evidence plus payload deltas. | All three ESM components composed before the legacy aggregate in Chromium; native button submitted once inside a Card containing Avatar, with three external component stylesheets. |

Start with P0-01/P0-03 applied narrowly to Avatar, then expand the proven pattern. Do not
rewrite all components before demonstrating one useful vertical slice.

### P2 — Primitives and layout

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P2-01 — Typography and content | 🟢 Verified | Typography, Icon, Gradient Text, Ellipsis, literal Highlight and plain Code named retained scopes complete; syntax engines remain excluded. | [Code acceptance](../components/code.md): 528 tests plus Chromium source/CRLF/selection/line geometry/native display evidence. Final retained-scope P2 sign-off is recorded in P2-06 and the Image audit below. |
| P2-02 — Small feedback | 🟢 Verified | Tag `6605d29`, Badge `69c9480`, Alert `2a1eb42`, Empty `27a435b`, Skeleton `05c6546`, and Spin `6c7f35b` complete their retained scopes. | [Tag](../components/tag.md): 118 tests; [Badge](../components/badge.md): 141; [Alert](../components/alert.md): 167; [Empty](../components/empty.md): 190; [Skeleton](../components/skeleton.md): 213; [Spin](../components/spin.md): 241 plus Chromium timing/native-state/motion evidence. |
| P2-03 — Progress and statistics | 🟢 Verified | Progress `8d7757c` and Statistic `1ed3a98` complete retained native scopes; Number Animation remains separate. | [Progress acceptance](../components/progress.md): 270 tests; [Statistic acceptance](../components/statistic.md): 290 plus Chromium native value/region/formatting-string/typography evidence. |
| P2-04 — Layout | 🟢 Verified | Divider, Flex, Space, Grid, Layout and native-sticky Affix retained scopes complete. | [Affix acceptance](../components/affix.md): 504 tests plus Chromium native flow/scroll/ancestor constraints; source fixed/absolute targets/triggers and other upstream algorithms have explicit exclusions. |
| P2-05 — Static compound display | 🟢 Verified | Page Header, List/ListItem, Descriptions/DescriptionItem, Timeline/TimelineItem, Breadcrumb/BreadcrumbItem, Thing and Result named retained scopes complete. | [Result acceptance](../components/result.md): 516 tests and Chromium authored outcome/artwork/actions/forms/no-JS evidence; no compulsory renderer, icon package or router. Final retained-scope P2 sign-off is recorded in P2-06 and the Image audit below. |
| P2-06 — Wave sign-off | 🟢 Verified retained scope | All P2-assigned retained rows are accepted or explicitly omitted; independent payload limits remain intact. | Image acceptance plus audit of all 96 catalog routes/31 P2 reference inventories below; advanced P6 viewer contracts remain omitted. |

Ellipsis's retained native details/summary disclosure needs no custom P3 overlay machinery.
Automatic overflow controls and popup/Tooltip variants remain separate P3 work rather than
smuggling an overlay implementation into the CSS-only native composition.

### P3 — Interaction foundations

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P3-01 — Focus and keyboard | 🟠 In progress | Dropdown and Menu now share a tested primitive with explicit command-roving versus native-navigation Tab policies; other composites remain separate. | [Dropdown](../components/dropdown.md) and [Menu](../components/menu.md): native activation, logical keys/typeahead, ownership and no focus trap. |
| P3-02 — Floating surfaces | 🟠 In progress | Popover now supplies native top-layer/anchor use and a local flip/clamp fallback; later popup consumers remain separate. | [Popover acceptance](../components/popover.md): native dismissal, scroll/resize/RTL/clipping and cleanup without external positioning code. |
| P3-03 — Modal surfaces | 🟢 Verified retained scopes | Dialog, Modal and Drawer/DrawerContent native scopes accepted, with explicit exclusions rather than framework parity. | [Dialog](../components/dialog.md), [Modal](../components/modal.md) and [Drawer](../components/drawer.md): native naming/modes/forms/cancel/focus/nesting, edge layout and explicit lifetime ownership. |
| P3-04 — Tooltip and Popover | 🟢 Verified retained scope | Both native retained scopes are accepted, with explicit differences and omissions. | [Popover](../components/popover.md) and [Tooltip](../components/tooltip.md): native state, pointer/focus retention, descriptive ARIA, cleanup and author-owned content. |
| P3-05 — Navigation | 🟢 Verified retained scope | Dropdown, Menu, Tabs, Collapse, Anchor, Back Top, Pagination and Steps declared native scopes accepted. | Native links/disclosures/scroll locations, bounded paging and explicit progress/intents; no router, wizard or source-parity claim. |
| P3-06 — Managed feedback | 🟠 In progress | Popconfirm and Loading Bar retained local scopes accepted; Message, Notification and Discrete services remain separate. | [Popconfirm](../components/popconfirm.md) and [Loading Bar](../components/loading-bar.md): explicit root ownership, error/lifetime cleanup and no provider or global request store. |
| P3-07 — Interaction sign-off | 🔵 Planned | Resolve keyboard, nested overlays, focus return, cancellation and motion behavior. | Component-specific browser acceptance evidence and API tracker updates. |

### P4 — Forms and selection

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P4-01 — Native entry | 🔵 Planned | Enhance Input/Textarea without replacing authored controls; synchronize documented attributes and defaults. | Composition-friendly editing, labels, reset and native submission. |
| P4-02 — Boolean and exclusive choice | 🔵 Planned | Define Checkbox/Radio/Switch and companion groups, including indeterminate versus submitted values. | Clear group naming, keyboard behavior and state semantics. |
| P4-03 — Native selection | 🔵 Planned | Improve Select and datalist-based Auto Complete as a minimal baseline. | Accessible native fallback and explicit limits relative to rich upstream options. |
| P4-04 — Numeric and bounded entry | 🔵 Planned | Define Input Number, Slider and Rate parsing, clamping, keyboard and readonly/disabled distinctions. | Native value contracts with separately scoped advanced presentations. |
| P4-05 — Form validation | 🔵 Planned | Extend Form/Form Item with native validity and narrowly specified optional async validators. | Pending/error/reset behavior without importing a validation schema framework. |
| P4-06 — Enhanced entry | 🔵 Planned | Scope rich select/autocomplete, OTP, mention, dynamic input and dynamic tags as independent enhancements. | Authored templates and explicit async/event contracts; no JSX or template evaluator. |
| P4-07 — Form sign-off | 🔵 Planned | Exercise changed values/defaults, labels, fieldsets, composition, submission, reset and stale validation work. | Accepted property rows and plain-HTML form examples. |

### P5 — Collections and scale

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P5-01 — Identity and async contracts | 🔵 Planned | Define stable keys, selection persistence, loading, cancellation and error reporting. | Shared concepts without creating a mandatory global store. |
| P5-02 — Tree family | 🔵 Planned | Improve Tree, Tree Select and Cascader from static hierarchy to optional lazy data. | Keyboard hierarchy, explicit selection/checking rules and node identity. |
| P5-03 — Transfer | 🔵 Planned | Add multi-selection, filtering and bulk movement only within accepted scope. | Predictable source/target order and selection with accessible controls. |
| P5-04 — Table family | 🔵 Planned | Keep semantic Table simple; extend optional Data Table sorting/filtering/selection and pagination incrementally. | Static table remains usable; advanced behavior has explicit column/row contracts. |
| P5-05 — Virtual windows | 🔵 Planned | Extract a narrowly scoped virtual-list primitive; define fixed-height support before variable heights. | Bounded DOM, stable keys, scroll/focus semantics and explicit accessibility limitations. |
| P5-06 — Collection sign-off | 🔵 Planned | Resolve row/node replacement, reordering, asynchronous results and large-data behavior. | Retained features proven without forcing virtualization into small datasets. |

### P6 — Specialized modules

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P6-01 — Date/time and calendar | 🔵 Planned | Keep native date/time inputs as baseline; scope ranges/calendar panels and locale behavior separately. | Documented date-only/time-zone semantics using browser facilities, not an imported date engine. |
| P6-02 — Upload | 🔵 Planned | Separate file selection from optional transport, progress, cancellation and retry. | Explicit application transport hooks and surfaced errors; no implicit upload destination. |
| P6-03 — Media and carousel | 🔵 Planned | Scope image preview, carousel controls and autoplay independently. | Focus handling, pause controls and reduced-motion support with separate imports. |
| P6-04 — Other utilities | 🔵 Planned | Review remaining catalog utilities against native HTML/CSS and small optional modules. | A disposition for every remaining component, not blanket core inclusion. |
| P6-05 — Dependency-heavy exclusions | 🔵 Planned | Resolve QR generation, math typesetting, full language highlighting and framework-only provider APIs individually. | Independent feasibility decision or explicit omission; no hidden dependencies. |
| P6-06 — Deprecated surfaces | 🔵 Planned | Record Legacy Transfer and deprecated aliases without reproducing redundant legacy APIs. | A documented replacement and omission decision, not a missing tracker row. |
| P6-07 — Packaging sign-off | 🔵 Planned | Demonstrate explicit optional loading in supported classic/module modes and record combined asset sizes. | Specialized features stay out of the default dependency graph. |

## Per-component migration steps

Each component page linked from the [index](index.md) carries its own ordered steps, task
checkboxes, dependencies and property tracker. Use this execution protocol, specialized by
that page's actual feature list:

1. **Scope the reference.** Read the pinned public API and relevant source; inventory the
   component, companion components, inherited APIs and deprecated aliases. Separate
   documented behavior from implementation observations.
2. **Inspect the baseline.** Link actual MarkupUI code and identify supported slices.
   Missing evidence stays Not reviewed rather than being called unsupported or complete.
3. **Choose each mapping.** Map simple props to attributes, complex values to JS properties,
   notifications to DOM events, rendered slots to authored children/templates, and styling
   to CSS. Record omissions and unsettled decisions explicitly.
4. **Choose native primitives and define HTML anatomy.** Write a native, meaningful static
   example before controller code. Use Custom Elements for behavior, authored `template`
   content for repeated structure, and native controls/disclosure/dialog/popover where they
   remove code. Preserve content, labels, links and form controls; document generated children
   and the capability-dependent fallback. Do not create a template engine.
5. **Implement external CSS.** Add scoped rules, tokens, finite state selectors, responsive
   layout, focus-visible styling, logical properties and reduced-motion behavior.
6. **Implement the minimal controller.** Adopt authored nodes, handle documented live
   changes, update only affected DOM, and clean up resources across reconnects.
7. **Add optional features separately.** Extend only the approved scope using already
   established helpers; keep large data, advanced popup/rendering and service behavior out
   of the basic distribution.
8. **Close acceptance items.** Provide classic HTML/CSS/JS examples and relevant behavior,
   browser and payload evidence. Document remaining limitations rather than hiding them.
9. **Update tracking.** Move individual rows to Implemented/Verified only with evidence;
   update the component summary and index in the same change.

Property-level rows are the source of truth. A phase does not turn green while its retained
required rows remain incomplete. Optional backlog stays visible, and omitted items are
excluded from delivery scope but never counted as implemented.

## Task completion checklist

- [ ] Retained API items have unambiguous names, shapes, defaults and live-update rules.
- [ ] HTML, JS and CSS responsibilities are separately implemented and documented.
- [ ] Native browser features replace custom machinery where practical; templates are used
  where useful without introducing a renderer or reactive framework.
- [ ] Existing supported behavior has a compatibility path.
- [ ] Native semantics, content ownership and lifecycle behavior are preserved.
- [ ] Relevant asynchronous, keyboard, focus, form and failure cases have evidence.
- [ ] Runtime dependencies remain zero, including optional modules.
- [ ] Default imports remain isolated from optional features.
- [ ] Combined JS+CSS sizes and existing bundle ceilings are respected.
- [ ] Component, property and phase records agree on actual progress.

## Current migration position

**Current component: Anchor / AnchorLink (P3), native fragment/location scope accepted.**
**Next: Message (P3), then Notification; separate implementation/acceptance/commit.**
Collapse/CollapseItem completed native disclosure scope in `28fb44c`.
Tabs/Tab/TabPane completed their paired native scope in `8cd7cb1`.
Menu completed its retained native navigation/disclosure scope in `f7ae2b8`.
Dropdown completed its retained command-menu scope in `a0b73fb`.
Popconfirm completed its retained native asynchronous confirmation scope in `989988e`.
Tooltip completed its retained native descriptive scope in `8616b4e`.
Popover completed its retained native nonmodal foundation in `62435fa`.
Image and native group preview (P2/P6) completed retained scope in `e166437`.
Float Button/Group completed retained native action/popover dock scope in `879eeb4`.
Scrollbar completed retained native-only overflow/API scope in `49db31f`.
Code completed retained native plain/physical-line presentation in `d5eb01c`.
Result completed retained authored outcome/status/artwork scope in `b659f48`.
Affix completed retained CSS-sticky positioning/constraint scope in `5c8076d`.
Highlight completed retained bounded literal matching/native mark scope in `cec8bc7`.
Table completed retained native table/border/stripe/scroll scope in `fbeafb9`.
Thing completed retained native compound-content/indentation scope in `6b932e5`.
Breadcrumb/BreadcrumbItem completed retained native navigation/separator scope in `cf74c89`.
Timeline/TimelineItem completed retained native list/time/connector/scroll scope in `4fed2a5`.
Descriptions/DescriptionItem completed retained native term/definition/grid scope in `cda5732`.
List/ListItem completed retained native CSS/list/action scope in `27c5940`.
Layout and companion regions completed retained native CSS/disclosure/scrolling scope in `ebe5ced`.
Grid/GridItem completed its retained native CSS scope in `c659646`.
Space completed its retained native CSS implementation and acceptance in `d495a12`.
Flex completed its retained native CSS implementation and acceptance in `720a92c`.
Divider completed its retained native CSS implementation and acceptance in `2e1a6c0`.
Page Header completed its retained native CSS implementation and acceptance in `5f9faf3`.
Ellipsis completed its retained native CSS/disclosure implementation and acceptance in `5fabe7f`.
Gradient Text completed its retained CSS-only implementation and acceptance in `38dcf6f`.
Icon/IconWrapper completed their retained CSS-only implementation and acceptance in `829970d`.
Typography completed its retained CSS-only implementation and acceptance in `53d3974`.
Statistic completed its retained implementation and acceptance in `1ed3a98`.
Progress completed its retained implementation and acceptance in `8d7757c`.
Spin completed its retained implementation and acceptance in `6c7f35b`.
Skeleton completed its retained implementation and acceptance in `05c6546`.
Empty completed its retained implementation and acceptance in `27a435b`.
Alert completed its retained implementation and acceptance in `2a1eb42`.
Badge completed its retained implementation and acceptance in `69c9480`.
Avatar and its group were committed in `9afc818`; Button and
its group in `43dd57f`; Card in `cebc6d7`; Tag in `6605d29`. These demonstrate the standalone external-CSS
component pattern. Tag's [reference inventory](components/tag.md) preserves all 19 original
rows plus 12 source supplements: 24 Verified ADAPTED native targets and 7 explicit omissions.
Its four retained tasks are closed, with [118-test/Chromium evidence](../components/tag.md).
Badge's [reference inventory](components/badge.md) retains its ten pinned rows and adds four
source supplements: 11 Verified ADAPTED targets and 3 framework omissions. Its four tasks
are closed with [141-test/Chromium evidence](../components/badge.md), including native target
semantics, zero/count/visibility, logical offsets and 200% CSS zoom.
Alert's [reference inventory](components/alert.md) retains all ten pinned rows plus four
source supplements: 9 Verified ADAPTED targets and 5 omissions. Its four tasks are closed
with [167-test/Chromium evidence](../components/alert.md), covering native labelled close
intent, explicit-only live semantics, preserved nodes/actions, HTML/SVG icons and load ordering.
It does not reproduce upstream auto-hide/Boolean-promise or after-leave contracts.
Empty's [reference inventory](components/empty.md) preserves seven pinned rows plus four
source render/theme supplements: 7 Verified ADAPTED targets and 4 omissions. Its four tasks
are closed with [190-test/Chromium evidence](../components/empty.md), including original
SVG namespaces/sizes, authored fallback precedence, native recovery actions/forms/focus,
inert templates/application cloning, reconnect and loading order.
Skeleton's [reference inventory](components/skeleton.md) retains all nine pinned rows plus
three theme supplements: 9 Verified ADAPTED targets and 3 omissions. Its four tasks are
closed with [213-test/Chromium evidence](../components/skeleton.md), covering bounded repeat,
validated numeric/CSS/percentage geometry, inert decorative groups, preserved author content,
application-owned loading, reduced motion and load ordering. The dynamic style/CSP boundary
is explicit rather than hidden in a runtime stylesheet renderer.
Spin's [reference inventory](components/spin.md) retains fourteen pinned rows plus four
deprecated/theme supplements: 13 Verified ADAPTED targets and 5 omissions. Its four tasks
are closed with [241-test/Chromium evidence](../components/spin.md), including real delayed
visibility/cancellation, native content and state preservation, explicit app-owned blocking,
SVG parameters, reduced motion and loading order.
**P2-02 small feedback is Verified for retained scope; final P2 sign-off follows the Image audit below.**
Progress's [reference inventory](components/progress.md) preserves all 21 original rows and
adds six source geometry/alias/theme supplements: 23 Verified ADAPTED targets and 4 omissions.
Its four tasks are closed with [270-test/Chromium evidence](../components/progress.md),
covering native scalar/legacy/indeterminate ranges, named multi-ring owners, true angular
SVG gaps/offsets, unique gradients, safe normalization and original independent budget gates.
Statistic's [reference inventory](components/statistic.md) retains seven pinned rows plus
three theme supplements: 7 Verified ADAPTED targets and 3 omissions. Its four tasks are
closed with [290-test/Chromium evidence](../components/statistic.md), covering literal values,
native regions/ARIA/actions, application Intl strings, tabular CSS, namespace-safe aliases
and quiet updates. Formatting and Number Animation are not hidden dependencies.
**P2-03 Progress/Statistic is Verified for retained scope; final P2 sign-off follows the Image audit below.**
Typography's [reference inventory](components/typography.md) retains fifteen grouped public
rows and adds 25 explicit source owner/deprecated/grouped-theme supplements: 17 Verified
ADAPTED native targets and 23 omitted runtime/framework contracts. Its four tasks are closed
with [300-test/Chromium evidence](../components/typography.md), using scoped native CSS only:
no Custom Element, ESM/classic JS entry, observer, router or highlighting dependency.
P2-01 and P2 final retained-scope sign-off are recorded above and in the Image audit below.
Icon's [reference inventory](components/icon.md) retains nine pinned rows plus eight
source type/companion-slot/theme supplements: 10 Verified ADAPTED targets and 7 omissions.
Its four tasks are closed with [308-test/Chromium evidence](../components/icon.md), preserving
native paints, aspect/viewports, names/actions, forced colors and CSS-only loading with no asset library.
Gradient Text's [reference inventory](components/gradient-text.md) retains seven pinned rows plus
six source alias/type/theme supplements: 10 Verified ADAPTED native targets and 3 omissions.
Its four tasks are closed with [316-test/Chromium evidence](../components/gradient-text.md),
covering native text/links, solid underpaint, guarded clipping, forced colors, print without
background graphics, selection, RTL/wrapping/zoom and CSS-only coexistence. Gradient-object
and theme runtime adapters are not shipped; contrast remains application-owned.
Ellipsis's [reference inventory](components/ellipsis.md) preserves five pinned grouped prop/slot
rows plus five source forwarded-slot/shared-theme supplements: 4 Verified ADAPTED native
targets and 6 omissions. Its four tasks are closed with [327-test/Chromium evidence](../components/ellipsis.md),
covering original text, native details/summary open/toggle, keyboard/pointer/AX names/selection,
defensive native-control unclipping, unsupported/invalid/print fallbacks, font/width/RTL/zoom
and CSS-before/after-legacy composition. No Tooltip, observer or hover-remount runtime exists.
Page Header's [reference inventory](components/page-header.md) preserves twelve original
props/callback/slot rows plus three source theme supplements: 12 Verified ADAPTED native
targets and 3 omissions. Its four tasks close with [340-test/Chromium evidence](../components/page-header.md):
all eight authored regions, native headings/contextual landmarks/back links and clicks/forms,
stable nodes/assets, 280px long-title wrapping, RTL/zoom/print and CSS-only coexistence.
The demo's application handlers are not a library runtime. P2-05's completed retained scope is recorded above.
Divider's [reference inventory](components/divider.md) preserves four public prop/slot rows
plus three source theme supplements: 4 Verified ADAPTED native targets and 3 omissions.
Its four tasks close with [351-test/Chromium evidence](../components/divider.md): native hr/
explicit separator or decoration, one named-caption owner versus a real heading, authoritative
orientation, dashed/placement/size-token geometry, narrow/grid/RTL/zoom/print and unchanged
legacy behavior. P2-04's completed retained scope is recorded above.
Flex's [reference inventory](components/flex.md) preserves seven public prop/slot rows plus
six source reverse/type/theme supplements: 9 Verified ADAPTED native targets and 4 omissions.
Its four tasks close with [362-test/Chromium evidence](../components/flex.md): correct native
preset/tuple axes, vertical nowrap/inline/alignment, original order/list markers/GET forms/focus,
hidden roots/items, narrow grid/RTL/zoom/print and legacy coexistence. Reverse and framework
contracts are omitted; no wrapper/traversal/observer or gap/size runtime is introduced.
Space's [reference inventory](components/space.md) preserves eleven public rows plus seven
source internal/type/alias/theme supplements: 13 Verified ADAPTED native targets and 5 omissions.
Its four tasks close with [373-test/Chromium evidence](../components/space.md): original mixed
content and author-owned item classes/groups, independent Flex conventions, exact gap axes,
explicit separators (no invented API), native lists/forms/focus/hidden, narrow/RTL/zoom/print
and unchanged legacy composition. Runtime wrappers/styles, reverse and gap fallback are not shipped.
Grid's [reference inventory](components/grid.md) preserves thirteen public rows, adds two
public type/overflow-field expansions and six source item-style/private/alias supplements:
10 Verified ADAPTED native targets and 11 explicit omissions. Its four tasks close with
[385-test/Chromium evidence](../components/grid.md): native tracks/spans/gaps, correct descendant
self queries versus media queries, nested/hidden/native control order, explicit disclosure
and legacy coexistence. Relative offsets, automatic row budgets, suffix reservation,
overflow callback signals and framework modes remain omitted, not disguised as native parity.
The index records 3,386 rows and 196 accepted retained tasks out of 384 across 49 component
pages (188 unchecked), not full upstream parity.
Layout's [accepted record](../components/layout.md) closes its native CSS/disclosure/scroll
scope with 396 tests and Chromium evidence. All 42 reference rows remain: 32 adapted targets
and 10 omissions. Layout adds 874 gzip bytes of CSS with no runtime; core remains unchanged.
List's [accepted record](../components/list.md) closes its native CSS list/item/action scope
with 407 tests (11 List cases), build/budget gates and Chromium evidence. Its ten original
public rows remain with four source-only size/theme supplements: 11 adapted native targets
and 3 omissions. Native markers/roles, external headings/footer, independent actions,
keyboard/forms, nested/empty/hidden/template nodes, narrow/RTL/zoom/print/forced-colors,
legacy coexistence and JavaScript-disabled GET forms were exercised. List adds 1,054 gzip
bytes of CSS and zero component JS; core remains 14,611/15,000 gzip bytes.
Descriptions' [accepted record](../components/descriptions.md) closes native term/definition
grouping, column/span constraints and external presentation with 419 tests (12 focused)
plus Chromium acceptance. All 21 original rows remain, with six source alias/type/theme
supplements: 17 adapted targets and 10 omissions. Native headings, term/definition order,
rich/empty/nested content, spans/live columns, actions/forms/focus, narrow/RTL/zoom,
hidden/templates, print/forced colors, legacy coexistence and no-JS GET submission were
exercised. Its CSS is 880 gzip bytes with zero component JS; core remains unchanged.
Table colspan packing, automatic last-item expansion and framework style/theme/type
contracts are not silently treated as implemented.
Timeline's [accepted record](../components/timeline.md) closes native authored chronology,
decorative markers/connectors, placement and horizontal scrolling with 431 tests (12 focused)
plus Chromium evidence. Its 15 original rows remain with four numeric-time/theme source
supplements: 16 adapted targets and 3 omissions. Lists/headings/time/status text, native
actions/forms/focus, dynamic last-visible connectors, nested/hidden/templates, narrow/RTL/
zoom/print/forced-colors, focus-revealed horizontal actions, safe connector fallback and
aggregate/widgets/no-JS coexistence were exercised. CSS adds 1,320 gzip bytes and zero
component JS; core remains 14,611/15,000 and widgets 2,779/4,000 gzip bytes. No date
inference, reverse prop, framework provider, generated heading or automatic announcement.
Breadcrumb's [accepted record](../components/breadcrumb.md) closes native navigation,
current-page markup, passive items and decorative wrapping separators with 443 tests
(12 focused) and Chromium evidence. Eight original rows plus four source click/theme
supplements remain: 9 adapted targets and 3 omissions. Native href/target/rel and click
events, unavailable keyboard exclusion, hidden/custom/nested separator boundaries,
narrow/RTL/zoom/print/forced-colors, aggregate/widgets and no-JS navigation were exercised.
CSS adds 928 gzip bytes and zero component/demo JS; core remains 14,611/15,000 and widgets
2,779/4,000 gzip bytes. No automatic router/current-URL inference or pseudo-link behavior.
Thing's [accepted record](../components/thing.md) closes seven native regions and CSS
indentation with 455 tests (12 focused) plus Chromium evidence. All 16 original rows
remain with three source theme supplements: 14 adapted targets and 5 style/theme omissions.
Authored article/heading/image/SVG names, native form-associated actions, keyboard/focus,
60px live indentation, hidden/template avatars, sparse/nested content, narrow/RTL/zoom/
print/forced-colors, aggregate/widgets and no-JS GET forms were exercised. CSS adds
841 gzip bytes with zero component JS; core remains 14,611/15,000 and widgets 2,779/4,000.
No size/alignment/prefix props, renderer, provider or dependency on Card/List/PageHeader.
Table's [accepted record](../components/table.md) closes native tabular presentation with
467 tests (12 focused) and Chromium evidence. Six original property rows remain with five
public helper/default-content groups and five source-only slot/type/theme entries:
12 adapted targets and 4 omissions across 16 rows. Native table/header/cell structure,
scope/headers/colgroup/span geometry, all 16 border-flag combinations, stripe/size/width/
alignment, nested/hidden, forms/focus, narrow/RTL/zoom/print/forced-colors, native scrolling,
legacy aggregate/plugins and no-JS submission were exercised. CSS adds 1,023 gzip bytes
with zero component JS; core/widgets/advanced outputs and budgets remain unchanged.
Collapsed borders and uniform body-row-header/visible-body-row striping are declared native
adaptations, not claims of source separate-border or Data Table renderer parity.
Highlight's [accepted record](../components/highlight.md) closes bounded literal matching
and native mark rendering with 494 tests (27 focused) and Chromium evidence. All seven
original rows remain: five adapted targets and two fully omitted style/tag rows, plus an
explicit raw-regexp-mode exclusion. No new upstream theme/slot/event rows were invented.
The optional ESM/classic helpers preserve original UTF-16 offsets, define input-order
non-overlap/case semantics and enforce text/pattern/work/output bounds. Rendering owns a
dedicated span's children, not arbitrary rich content; invalid calls leave prior DOM intact.
Helpers have no custom-element lifecycle or global highlight registry. ESM/classic/CSS
measure 1,169/1,401/345 gzip bytes; core/widgets/advanced stay unchanged. Static marks,
no-JS controls, legacy load orders, literal HTML/Unicode, selection, clear/updates,
hidden/RTL/narrow/zoom/forced-colors/print were exercised.
Affix's [accepted record](../components/affix.md) closes native CSS sticking with 504 tests
(10 focused) and Chromium evidence. Six original rows plus four deprecated/default-slot
source supplements remain: 3 adapted targets and 7 explicit target/trigger/position/alias
omissions. Window/nested/end insets, normal-flow width/space, layout shifts, short/transformed/
overflow ancestors, early-bottom counterexample, anchors/forms/focus, narrow/RTL/zoom/
print/forced colors and aggregate/no-JS coexistence were exercised. CSS adds 270 gzip bytes
with zero component JS. No fixed/absolute controller, placeholder, teleport, observer,
selector target or synthetic notification is implied.
Result's [accepted record](../components/result.md) closes authored outcome composition
with 516 tests (12 focused) and Chromium evidence. Seven original rows plus four source
type/theme supplements remain: 7 adapted targets and 4 omissions. Eight status palettes,
four source-sized native presets, explicit headings/messages, original authored artwork,
custom icon names/replacement, forms/focus/home links, hidden/nested/long content, narrow/
RTL/zoom/print/forced-colors and aggregate/no-JS coexistence were exercised. CSS adds
879 gzip bytes and zero component JS. No generated message/action, HTTP processing,
vendor illustration package, runtime provider or automatic announcement is implied.
Code's [accepted record](../components/code.md) closes native plain/inline/block and authored
physical-line presentation with 528 tests (12 focused) and Chromium evidence. Seven original
rows plus seven source private/slot/theme supplements remain: 6 adapted targets and 8
explicit engine/transform/private/theme omissions. Literal HTML, whitespace/tabs/Unicode/
CRLF, trailing blank lines, exact selected source without number text, soft-wrap number
suppression, native focus/scroll/navigation, RTL/zoom/print/forced colors, Typography/legacy
and no-JS rendering were exercised without clipboard access. CSS adds 1,087 gzip bytes and
zero component/demo JS. No lexer, URI/trim pipeline, clipboard action or text renderer.
Scrollbar's [accepted record](../components/scrollbar.md) closes native overflow/APIs/events
and optional standards styling with 540 tests (12 focused) plus Chromium evidence. All 16
original public/inline rows remain with 11 source declaration/internal exclusion groups:
12 adapted targets and 15 omissions/groups. Native wheel/keyboard, absolute/relative APIs,
unchanged RTL coordinates, focus reveal, nested chaining/opt-in containment, forms,
resizing and independent observer cleanup, native styling, narrow/zoom/print/forced colors,
aggregate/plugins and no-JS paths were exercised. CSS adds 468 gzip bytes and zero component
JS; no custom rails, no-op sync, reactive ref adapter, resize event or input interception.
Float Button/Group's [accepted record](../components/float-button.md) closes native actions,
placement and popover disclosure with 552 tests (12 focused) and Chromium evidence.
Twenty original rows plus nine source slot/alias/owner-theme supplements remain:
22 adapted targets and 7 omissions, with additional explicit hover/controlled-state/timing
exclusions. Native form/keyboard/disabled/group semantics, popover dismissal/reopen/focus,
fixed/relative/absolute/RTL/safe-area geometry, narrow/short/zoom, static fallback, print/
forced colors, aggregate/plugins and no-JS interaction were exercised. CSS is 1,340 gzip
bytes with zero component JS; core/plugins remain unchanged. The dock is not a universal
anchor positioning engine or global P3 implementation.
Image's [accepted record](../components/image.md) closes native responsive images, bounded
single-src fallback and an owned-template native-dialog/group path with 583 tests (31 focused)
plus Chromium evidence. All 77 original identities remain, with 13 explicit source groups:
41 adapted targets and 49 omissions across 90 rows. Thumbnail identity/attributes, lazy box,
load/fallback/error/stale request behavior, native modifiers, modal cancel/focus, nested
ownership, disconnect/reconnect and queued close/reopen races were verified. Native previous/
next/close/original links are retained; gesture/zoom/rotation/renderer/provider and automated
permission-bearing tools are excluded. ESM/classic/CSS measure 3,430/3,665/656 gzip bytes
under 4,000/4,000/1,000 ceilings; core/plugins remain unchanged. Local SVG fixtures required
the demo-server MIME addition; validation used attached server 4188 without disturbing 4187.

### Popover retained-scope acceptance

[Popover](../components/popover.md) completes its four retained P3 component tasks with
**91 targeted tests (52 Popover)**, build/declaration/export/budget gates and real Chromium
native click/Tab/Escape/outside/nested behavior. Hover/focus delays and panel retention,
manual mode, native links/forms, ownership restoration/reconnect, clipping/scroll/resize/
RTL/edge flip, native anchors/fallback, 320px constraints and emulated visual-viewport zoom
are evidenced. Unsupported static content, no-JS click disclosure, separate documents,
legacy both-order composition and classic namespace conflict protection are accepted.

The independent helper registers no tags and changes no core positioning semantics.
It rejects portalled nesting and immutable-ID changes; no controlled framework state,
renderer, provider, virtual-anchor x/y, exact arrow tether or fake modal/menu/tooltip
semantics is claimed. Native content remains nonmodal and authored.
ESM/classic/CSS are **3,853/3,922/904 gzip bytes** under **4,000/4,000/1,000** optional limits.
Core/advanced/widgets remain **14,611/2,181/2,779** under unchanged ceilings.
The reference preserves 38 original rows and adds 11 explicit source-only supplements;
28 adapted targets are Verified, 21 omitted. Tooltip was next at that checkpoint and is
now accepted below; P3 remains in progress.

### Tooltip retained-scope acceptance

[Tooltip](../components/tooltip.md) closes four retained tasks with **121 targeted tests
(42 Tooltip, 52 Popover, 27 native/core)**, build/export/CSS-composition/budget gates and
Chromium descriptive behavior. It reuses Popover's timing/placement/lifecycle rather than
duplicating them, but does not inherit expandable-control semantics or interactive slots.
Manual native top-layer content supplies hover/focus descriptions without peer auto-dismiss.
Escape suppression, Tab, native forms/links, owned describedby tokens, interactive/label
rejection, no-ResizeObserver ancestor closure, fallback and legacy composition are evidenced.

All 36 original inherited row identities remain, plus seven source-only supplements:
21 adapted targets are Verified, 22 explicitly omitted. Tooltip ESM/classic/complete CSS
are **4,877/4,949/1,057 gzip bytes**, under new **5,000/5,000/1,250** budgets. Shared changes
leave Popover ESM/classic at **3,923/3,994**, within existing 4,000 ceilings; Popover CSS stays
904. Core/advanced/widgets stay **14,611/2,181/2,779**, with unchanged code/ceilings.
P3-04 is accepted for these retained components; global P3 is not complete. Popconfirm was
next at that checkpoint and is now accepted below.

### Popconfirm retained-scope acceptance

[Popconfirm](../components/popconfirm.md) closes four retained tasks with **161 targeted tests
(40 Popconfirm, 52 Popover, 42 Tooltip, 27 native/core)**, build/export/composed-CSS/budget gates
and Chromium native/async acceptance. The confirmation layer owns safe native decision buttons,
task-deferred cancellation checks, pending/error UI, Promise outcomes and stale-result guards.
It reuses existing Popover visibility/positioning/lifecycle without modifying that shared bundle.
Native nonmodal roles/names/descriptions, form/Tab/Escape/outside/nested behavior, foreign disabled
updates, late results, focus ownership, inline fallback and standalone/legacy loading are covered.

All 44 original local/inherited identities remain, plus eight explicit source-only supplements:
30 Verified adapted targets and 22 omissions. ESM/classic/complete CSS are **6,247/6,320/1,162
gzip bytes**, under new **6,500/6,500/1,250** budgets. Popover/Tooltip and core/advanced/widgets
remain unchanged, including their prior ceilings. No external business operation, provider,
Button/VNode dependency or false promise of Promise cancellation is introduced.
P3/P3-06 remains in progress. Dropdown was next at that checkpoint and is accepted below.

### Dropdown retained-scope acceptance

[Dropdown](../components/dropdown.md) closes four tasks with **210 targeted tests** (48 Dropdown,
53 Popover, 42 Tooltip, 40 Popconfirm, 27 native/core), build/export/composed-CSS/budget gates
and Chromium acceptance. Native authored commands/links/groups/dividers/submenus use string
keys and explicit menu keyboard semantics. The small roving/typeahead helper is a concrete
foundation for the next Menu consumer, not a data/render framework. Reentrant cleanup,
selection cancellation, hover gaps, hidden/disabled refresh and native focus are tested.

All 69 original public/supplement/inherited identities remain, plus six source-only additions:
42 Verified adapted targets and 33 omissions. ESM/classic/complete CSS are **8,726/8,801/1,465
gzip bytes** under **9,000/9,000/1,750** new ceilings. Deep native submenus exposed an outer
DOM clipping error above open top-layer ancestors; the narrow shared correction keeps
Popover **3,927/3,997**, Tooltip **4,882/4,953**, and Popconfirm **6,250/6,323** within existing
ESM/classic ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**, unchanged.
Global P3 is not complete. Menu was next at that checkpoint and is accepted below.

### Menu retained-scope acceptance

[Menu](../components/menu.md) closes four tasks with **113 targeted tests** (37 Menu,
49 Dropdown/shared keyboard, 27 native/core), build/export/budget gates and Chromium native
navigation acceptance. Authored links/buttons/details retain native Tab and route semantics;
no command-menu/menubar roles are imposed. Selection/defaults/expanded keys, root accordion,
showOption, overall collapse and in-flow horizontal/vertical shortcuts are implemented.
Refresh preserves actual native state, focused keyboard position and valid pending selection.

All 48 original identities remain, plus eight source-only groups: 36 Verified adapted targets,
20 omissions. Menu ESM/classic/CSS are **5,815/5,883/993 gzip bytes** under **6,000/6,000/1,250**
new ceilings. Reused keyboard support changes Dropdown to **8,767/8,840** within its existing
9,000 ceilings; no Popover/base/core/plugin code or prior limit changed. Icon-only rails,
popup menubars, renderer/provider and automatic overflow packing remain omitted.
P3 remains in progress. Tabs was next at that checkpoint and is accepted below.

### Tabs / Tab / TabPane retained-scope acceptance

[Tabs](../components/tabs.md) closes four tasks with **69 targeted tests** (42 Tabs,
27 native/legacy), build/export/budget gates and Chromium paired-tab acceptance.
Authored button/pane identities, single ARIA ownership, native hidden, roving focus,
automatic/manual/RTL keys, native Tab/Enter/Space, preserved pane state and add/close intents
are implemented. Async leave guards have explicit false/rejection/supersession contracts,
published reentrant promises, protected queued overrides/close targets and nested focus recovery.

All 44 original companion identities remain plus six source-only groups: 40 Verified adapted
targets and 10 omissions. ESM/classic/CSS are **5,325/5,393/1,338 gzip bytes** under new
**6,000/6,000/1,750** budgets. Core/plugins and all previous optional code/ceilings remain
unchanged. Pane render/unmount directives, label-only Tab, generated overflow controls and
indicator measurement/animation engines remain omitted. Collapse was next at that checkpoint
and is now accepted below; P3 is not complete.

### Collapse / CollapseItem retained-scope acceptance

[Collapse](../components/collapse.md) closes four tasks with **60 targeted tests** (33 Collapse,
27 native/legacy), build/export/budget gates and Chromium native disclosure evidence.
Details/summary remains the CSS-only baseline; the optional helper adds scoped name
exclusivity, actual disabled activation, string-key aggregation and explicit native events.
Nested/independent groups, initial/hidden focus, extra actions/forms, item ownership transfer,
refresh and no-JS/name-support fallback are verified without a renderer or height engine.

All 27 original identities remain plus six source-only groups: 19 Verified adapted targets
and 14 omissions. ESM/classic/CSS are **3,784/3,855/819 gzip bytes** under new **4,000/4,000/1,000**
budgets; previous optional/core/plugin outputs and ceilings are unchanged. Native name
restoration remains document-scoped author responsibility. CollapseTransition is not folded
into this component and remains its own later route. Anchor was next and is accepted below.

### Anchor / AnchorLink retained-scope acceptance

[Anchor](../components/anchor.md) closes four tasks with **62 targeted tests** (35 Anchor,
27 native/legacy), build/export/budget gates and Chromium native fragment/location evidence.
It preserves href/hash/history/focus, adds deterministic geometry/gap/final-section tracking,
explicit native scroll roots/offsets, UTF-8 ID handling, single-current ownership and
reduced-motion native requests. Live scroll-plane/root changes and link transfers are validated.

All 11 original identities remain plus six source-only groups: 12 Verified adapted targets
and 5 omissions. ESM/classic/CSS are **3,991/4,060/672 gzip bytes** under new **4,500/4,500/1,000**
budgets; old optional/core/plugin outputs and ceilings are unchanged. Native sticky/overflow
conventions are reused without dependencies; Back Top is accepted below and shares the
concrete native scroll context. P3 remains incomplete.

### Back Top retained-scope acceptance

[Back Top](../components/back-top.md) closes four tasks with **104 targeted tests** (42 Back Top,
35 Anchor, 27 native/legacy), build/budget gates and Chromium evidence. Native fragments remain
untouched; explicit typed buttons scroll only their configured root. Inclusive thresholds,
silent show overrides, focus-held visibility, root/x preservation and reduced motion use
the unchanged Anchor scroll utility. No provider, teleport or scroll animation engine.

Seven original identities remain plus nine explicit source supplements: **10 Verified adapted
targets and six omissions**. ESM/classic/CSS are **3,212/3,281/682 gzip bytes** under new
**3,500/3,500/1,000** limits; one helper format plus CSS is **3,894/3,963**.
Read-only review fixed cross-platform fixture paths. Native keyboard/cancellation/forms,
focus/Tab, refresh/disposal, fallback, RTL/narrow/zoom and load coexistence passed Chromium.
Previous optional/core/plugin source outputs and ceilings are unchanged. Pagination is accepted below.

### Pagination retained-scope acceptance

[Pagination](../components/pagination.md) closes four tasks with **80 targeted tests** (53 Pagination,
27 native/legacy), build/export/budget gates and Chromium native paging/form/focus evidence.
It uses a safe bounded model, item-count precedence, explicit defaults and silent clamp, keyed
native page/gap buttons, native select and validated jump. No navigation interception, renderer,
range dropdown, provider or data fetching. Author controls/labels and server fallback survive.

All **42 original identities** remain plus thirteen source supplements: **36 Verified adapted
targets and 19 omissions**. ESM/classic/CSS are **5,011/5,080/816 gzip bytes** under new
**5,500/5,500/1,250** ceilings; one format plus CSS is **5,827/5,896**.
Review fixes cover untouched form validity and modified-Enter submission; focused shrink,
disabled ownership, replacement/reconnect, responsive/RTL/zoom and native fallback are accepted.
Previous optional/core/plugin sources, outputs and ceilings remain unchanged. Steps is accepted below.

### Steps / Step retained-scope acceptance

[Steps](../components/steps.md) closes four tasks with **70 targeted tests** (43 Steps,
27 native/legacy), build/export/budget gates and Chromium native summary/intent evidence.
Ordered list semantics, authored headings/status words/icons, one current owner and independent
per-item status are retained without a wizard or implicit completion/validation. Typed native
buttons emit intents; applications explicitly accept. Native links and forms are not hijacked.

All **16 original identities** remain plus seven source supplements: **16 Verified adapted
targets and seven omissions**. ESM/classic/CSS are **3,540/3,611/1,081 gzip bytes** under new
**4,000/4,000/1,250** ceilings; one format plus CSS is **4,621/4,692**.
Hidden/reordered/current identity, cross-root ownership, native focus/keyboard, direction/
connectors/RTL/narrow/zoom/fallback and coexistence are accepted. Review fixed CSS-hidden
ancestor focus recovery. All old optional/core/plugin outputs and ceilings remain unchanged.

P3-05 navigation is now Verified for the eight declared retained native scopes, not full
framework parity or global P3. Loading Bar is accepted below; modal surfaces, remaining managed
feedback, Collapse Transition and Discrete API remain their own inventories.

### Loading Bar retained-scope acceptance

[Loading Bar](../components/loading-bar.md) closes four tasks with **74 targeted tests**
(47 Loading Bar, 27 native/legacy), build/export/budget gates and Chromium evidence.
One authored named progress/status surface has explicit unknown/measured work, start/finish/
error, retained first outcome, guarded terminal holds and UI-only stop. Multiple roots are
independent; no global request interception, provider, cosmetic percent or external cancellation.

All **10 original identities** remain plus eight source supplements: **10 Verified adapted
targets and eight omissions**. ESM/classic/CSS are **2,627/2,700/826 gzip bytes** under new
**3,500/3,500/1,250** limits; one format plus CSS is **3,453/3,526**.
Review fixes preserve the terminal latch after hide, status-marker identity and independent
error text. Timer/removal/author-state cleanup, native semantics/focus, motion/forced colors,
RTL/zoom and fallback/coexistence are accepted. Previous outputs/ceilings remain unchanged.

Dialog, Modal and Drawer are now accepted below; Message is next. P3-05 navigation remains Verified
only for retained scopes; P3 overall and P3-06 managed feedback remain in progress.

### Dialog retained-scope acceptance

[Dialog](../components/dialog.md) closes four tasks with native modal/modeless/inline
lifetime, authored content and optional false/Promise decision controls. Unmarked
method=dialog forms retain native validation and returnValue. Explicit owners clone
trusted templates; no injection/reactive services, global scroll/focus manager or native
top-layer imitation is included. Legacy MuiDialog and prior optional assets are unchanged.

The tracker preserves **105 original identities**, adds **10 source-only supplements and
six inherited options**, and reconciles **121 rows: 80 adapted targets, 41 omissions**.
**157 targeted tests** (59 Dialog, 31 Image, 40 Popconfirm, 27 native/legacy),
build/budget and Chromium gates cover native forms, nested surfaces/Escape/focus,
backdrop/padding/drag policy, false/reject/async duplicate/stale completion, teardown/
reparenting/reentrant handlers, fallback/coexistence and narrow RTL/2x CSS zoom. A read-only
review led to regression fixes for focus/closure/disposal reentrancy and lost ancestry
observation; real browser checks corrected oversized viewport-unit height at CSS zoom.
ESM/classic/CSS measure **4,319/4,442/1,007 gzip bytes** under **5,500/5,500/1,500**
ceilings; one format plus CSS is **5,326/5,449**. Core/advanced/widgets remain
**14,611/2,181/2,779**. Exact acceptance details are in the canonical record.

Reuse `src/components/dialog/native.ts`, `attributes.ts` and `native.css` for Modal,
not Dialog's decision footer. Per-node Symbol.for ownership survives separate bundles.
Modal and Drawer are accepted below with their own original inventories and acceptance.

### Modal retained-scope acceptance

[Modal](../components/modal.md) closes four tasks with strict native modality and explicit
modeless/inline alternatives, authored generic/Card-intent/Dialog-CSS content, native forms,
names/focus/cancel/returnValue and owned template collections. It imports the native lifetime
only, not the Dialog decision footer. No body-scroll lock, provider/render/reactive API,
custom focus trap, global top-layer manager or transition-hook parity is included.

The tracker preserves **121 original identities**, including both Provider tables and all
preset/Options/Reactive rows; **30 source supplements and three inherited fields** make
**154 rows: 74 adapted targets, 80 omissions**. **130 targeted tests** (44 Modal, 59 Dialog,
27 native/legacy), build/budgets and Chromium cover modal/background focus, native forms/
cancel/Escape, independent/nested and reverse-reopened ownership, disposal/removal/backdrop,
body-style noninterference, explicit fallback/coexistence and narrow RTL/zoom/media.
Read-only review found obsolete creation order in bulk teardown; current opening/focus order
now preserves the native return chain, including direct native reopen in Chromium.

ESM/classic/CSS are **3,533/3,661/933 gzip bytes**, under **4,000/4,000/1,250** ceilings;
one format plus CSS is **4,466/4,594**. Shared native sources and Dialog outputs remain
unchanged; core/advanced/widgets remain **14,611/2,181/2,779**. Drawer can reuse the strict
native mode contract and owner-local teardown ordering without importing a decision engine.

### Drawer/DrawerContent retained-scope acceptance

[Drawer](../components/drawer.md) closes four tasks with authored native companion anatomy,
physical four-edge docking plus explicit logical aliases, CSS sizes and native scrolling.
Strict Modal/native lifetime and current-opening-order owner reuse add no decision footer,
page scroll lock, pointer resizer, provider, custom scrollbar or animation dependency.

All **47 original identities** remain plus **20 source supplements**: **67 rows, 30 adapted
targets and 37 omissions**. **197 targeted tests** (36 Drawer, 44 Modal, 59 Dialog, 31 Image,
27 native/legacy), build/budget and Chromium gates cover real forms/implicit Enter, header/
body/footer scrolling, all edges/RTL, modal/Image nesting/focus, cancel/backdrop, owner
reopening/removal, caller-check generation, CSS sizes/zoom/short-height/media and fallback/
coexistence. Review fixed native-base stylesheet order overriding full-edge bounds, and
the demo's first submitter incorrectly bypassing required-field validation.

The canonical record contains measured payloads and browser details. Shared native/Modal/
Dialog sources, previous outputs and all prior ceilings are unchanged. P3-03 modal surfaces
are now Verified **for the retained native scopes**. **Next Message, then Notification**;
P3-06 feedback, Collapse Transition, Discrete API and global P3 remain incomplete.
Drawer ESM/classic/CSS measure **3,956/4,082/1,195 gzip bytes** under
**4,750/4,750/1,500** ceilings; one format plus CSS is **5,151/5,277**.
Core/advanced/widgets remain **14,611/2,181/2,779**.

### Residual P2 inventory after Breadcrumb

Final audit after Image on 2026-09-08 checked **all 96 catalog rows** and the property
inventories of **all 31 P2-assigned pages**. There are **zero Planned P2-assigned routes**
and **zero retained Not reviewed/Planned/In progress/Implemented property rows** in those
P2 inventories. All 31 four-task checklists are accepted. P2/P2-06 is therefore Verified
for the explicitly declared native scopes and omissions, not because the short queue ended.

Image's advanced P6 viewer/gesture/renderer/download/fullscreen contracts remain explicitly
omitted; accepting its useful native dialog path does not complete all P6 media capabilities.
Likewise the native Float Button popover and Image dialog do not automatically close P3.

<a id="remaining-p3-inventory-after-loading-bar"></a>

<a id="remaining-p3-inventory-after-dialog"></a>

<a id="remaining-p3-inventory-after-modal"></a>

### Remaining P3 inventory after Drawer

The Image catalog check left 19 Planned P3-assigned components. Popover, Tooltip,
Popconfirm, Dropdown, Menu, Tabs, Collapse, Anchor, Back Top, Pagination, Steps, Loading Bar, Dialog, Modal and Drawer now close four tasks each; **4 P3-assigned components remain Planned**:

- **P3 disclosure:** Collapse Transition.
- **P3 navigation:** No Planned routes remain in the declared native navigation workstream; P3-05 is accepted for retained scopes.
- **P3 overlays/feedback:** Message, Notification; retained Dialog/Modal/Drawer surfaces are accepted.
- **P3; exclusions:** Discrete API.

**Message is next, then Notification**. Accepted Popover/Tooltip/Popconfirm/Dropdown/Menu/Tabs/Collapse/Anchor/Back Top/Pagination/Steps/Loading Bar/Dialog/Modal/Drawer retained scopes
do not complete those inventories or global P3. Original public/inherited source identities
remain intact, with explicit native adaptations and omissions rather than upstream parity.
P2 remains complete for its 31 accepted adapted scopes, not all source parity.
No Message/Notification, Collapse Transition or Discrete API implementation is added in this Drawer change.
Preserve native semantics and the legacy aggregate. Each component gets its own documentation update, build,
acceptance evidence and commit before advancing. No dates or effort estimates are assigned
until retained feature scope and optional exclusions are settled.
