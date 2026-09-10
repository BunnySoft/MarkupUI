# MarkupUI migration plan

**Plan state: 🟠 In progress overall — P1 pilots, P2, P3, P4 and P5 are Verified for declared retained
native scopes and explicit omissions. All 31 P2-assigned pages and all 22 P3-assigned pages
have closed property dispositions and four accepted tasks. P3 includes Discrete API's
verified no-new-runtime composition resolution. P4 retained native scopes are now reconciled
across all 17 assigned routes, including Time Picker: 984 rows and 68/68 page tasks, with no
unresolved retained rows or Planned P4 routes. P5's final Split acceptance and all-route audit
close all ten assigned retained scopes: 827 rows, 349 adapted, 478 omitted, zero unresolved
and 40/40 component tasks. Config Provider now closes its retained native composition with
no new runtime: 117 rows, eight adapted, 109 omitted and four accepted tasks.
Element also closes native authoring composition: 15 rows, three adapted, twelve omitted
and four accepted tasks. Global Style closes explicit document CSS: 16 source rows,
seven adapted, nine omitted and four accepted tasks. All three P0 catalog routes and
the separately audited P3 Discrete route are reconciled. P6 retained evidence: Carousel/
CarouselItem completes its native single-slide scope (50 rows, 35 adapted, 15 omitted,
four accepted tasks); Watermark completes its native decorative tile scope (31 rows,
26 adapted, five omitted, four accepted tasks). Upload and native Trigger/Dragger close
their synchronized file/queue scope (101 rows, 57 adapted, 44 omitted, four accepted tasks).
Calendar closes its native Gregorian table scope (23 rows, 20 adapted, three omitted,
four accepted tasks). Time closes native instant/relative formatting (nine rows, seven
adapted, two omitted, four tasks). Countdown closes elapsed native text/unit timing
(14 rows, 12 adapted, two omitted, four tasks). Number Animation closes native finite
interpolation/text (12 rows, 11 adapted, one omitted, four tasks). Heatmap closes its
native calendar-data scope (37 rows, 26 adapted, 11 omitted, four tasks). Marquee closes
single-track controlled traversal (11 rows, five adapted, six omitted, four tasks).
All nine main P6 retained routes are reconciled: 288 rows, 199 adapted, 89 omitted,
zero unresolved and 36/36 tasks. Equation's exclusion/native MathML alternative is
resolved: eight omitted API/type/source rows, four accepted alternative tasks, no
TeX implementation credit or new runtime. QR Code's native link/text alternative
also resolves its lane: 19 omitted API/type/source/inherited rows, four accepted
alternative tasks, no encoder or QR-image verification claim. Broad P0 foundation
tasks remain independent. Legacy Grid now resolves through shipped native Grid/Flex/
Space CSS: 15 rows, six native replacements/nine omissions, four resolution tasks.
Only Legacy Transfer's four catalog tasks remain unchecked; broader P0 foundations
and full framework/viewer parity remain incomplete.** Existing MarkupUI features are a partial baseline,
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
| P0 — Architecture and contracts | 🟠 In progress; all three P0 catalog routes Verified | Establish separated sources, compatible loading, lifecycle, events and native-control conventions. | None | Config Provider/Element/Global Style: 148 rows and 12/12 tasks resolved; broader P0-01–P0-09 architecture/legacy gates remain open. Related Discrete stays P3. |
| P1 — Pilot components | 🟢 Verified | Avatar, Button and Card retained pilot scopes completed. | Relevant P0 contracts | Individual records plus combined ESM/legacy composition evidence below. |
| P2 — Primitives and layout | 🟢 Verified retained scope | All 31 P2-assigned pages reconciled; native Image/fallback/dialog scope accepted with advanced P6 exclusions. | P1 pattern | Full 96-route and P2 reference audit found no retained unresolved P2 rows. This is not global P3/P6 or framework parity. |
| P3 — Interaction foundations | 🟢 Verified retained scope | All 22 P3-assigned pages, 1,086 API rows and 88 page tasks reconciled; Discrete resolves through existing native owners without a new runtime. | Relevant native ownership/focus contracts; P1 controls | Final audit found zero Planned P3 routes and zero unresolved retained rows; no framework parity or P0/P4+ completion implied. |
| P4 — Forms and selection | 🟢 Verified retained scope | All 17 P4-assigned routes, 984 tracker rows and 68 page tasks reconciled. | Relevant native P0/P3 contracts | 478 adapted + 506 omitted, no unresolved rows; 889 P4 tests plus native browser evidence. No P0/P5/P6 or full framework parity implied. |
| P5 — Collections and scale | 🟢 Verified retained scope | All ten P5-assigned routes, 827 rows and 40 page tasks reconciled. | P3 focus; P4 selection | 349 native adaptations + 478 omissions, zero unresolved; 526-test/native browser/asset audit. No full framework or P0/P6 parity implied. |
| P6 — Specialized modules | 🟢 Verified nine main retained scopes; Legacy Transfer resolution open | Carousel, Watermark, Upload, Calendar, Time, Countdown, Number Animation, Heatmap and Marquee accepted; Equation/QR/Legacy Grid resolutions accepted separately. | Component-specific earlier work | Explicit ESM/classic/CSS, 288 main-route rows (199 adapted/89 omitted), 36/36 tasks and native/browser evidence. Three alternative/replacement routes have twelve accepted tasks; Legacy Transfer has four unchecked. Not full advanced parity. |

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
| P0-06 | 🟠 In progress; native configuration/body CSS accepted | Separate external theme CSS from optional programmatic token updates. | [Config Provider](../components/config-provider.md) and [Global Style](../components/global-style.md) verify scoped/document CSS and preserve legacy inline calls; not wholesale palette extraction or all-component theme parity. |
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
| P3-01 — Focus and keyboard | 🟢 Verified retained scope | Declared P3 native navigation, disclosure, feedback and modal focus policies are accepted; future P4+ composites remain separate. | Per-component keyboard/focus evidence plus the Discrete native composition audit; no custom global focus trap. |
| P3-02 — Floating surfaces | 🟢 Verified retained scope | Retained Popover/Tooltip/Popconfirm/Dropdown foundations accepted; later rich selection/virtualized consumers remain P4/P5 work. | [Popover acceptance](../components/popover.md) and consumer records: native dismissal, scroll/resize/RTL/clipping and cleanup without external positioning dependencies. |
| P3-03 — Modal surfaces | 🟢 Verified retained scopes | Dialog, Modal and Drawer/DrawerContent native scopes accepted, with explicit exclusions rather than framework parity. | [Dialog](../components/dialog.md), [Modal](../components/modal.md) and [Drawer](../components/drawer.md): native naming/modes/forms/cancel/focus/nesting, edge layout and explicit lifetime ownership. |
| P3-04 — Tooltip and Popover | 🟢 Verified retained scope | Both native retained scopes are accepted, with explicit differences and omissions. | [Popover](../components/popover.md) and [Tooltip](../components/tooltip.md): native state, pointer/focus retention, descriptive ARIA, cleanup and author-owned content. |
| P3-05 — Navigation | 🟢 Verified retained scope | Dropdown, Menu, Tabs, Collapse, Anchor, Back Top, Pagination and Steps declared native scopes accepted. | Native links/disclosures/scroll locations, bounded paging and explicit progress/intents; no router, wizard or source-parity claim. |
| P3-06 — Managed feedback | 🟢 Verified retained scope | Popconfirm, Loading Bar, Message, Notification and Discrete's explicit composition capability accepted, with framework/app contracts omitted. | [Discrete resolution](../components/discrete.md) plus per-service records: bounded/focus-safe lifetime, guarded close, reported cleanup and no provider/global request store. |
| P3-07 — Interaction sign-off | 🟢 Verified retained scope | Audit all 22 P3-assigned routes, including mixed P2/P3 pages; no unresolved retained rows or unchecked page tasks remain. | 1,086 rows = 631 adapted + 455 omitted; 88/88 tasks. Native composition/keyboard/focus/cancellation/motion evidence, not all-browser/AT parity. |

### P4 — Forms and selection

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P4-01 — Native entry | 🟢 Verified retained scope | Explicit authored Input/textarea helper and group/addon/pair CSS; native controls own attributes/value/defaults. | [Input acceptance](../components/input.md): clear/click-reveal/count, composition/selection, reset/association/submission and independent assets; renderer/veto/hold exclusions explicit. |
| P4-02 — Boolean and exclusive choice | 🟢 Verified retained scope | Checkbox, Radio and Switch declared native scopes and companions accepted; explicit omissions remain. | [Checkbox](../components/checkbox.md), [Radio](../components/radio.md), [Switch](../components/switch.md): native boolean/default/mixed-or-binary/exclusive state, names/forms and focus-safe loading; no extra selection engine or hidden payloads. |
| P4-03 — Native selection | 🟢 Verified retained scope | Native Select and Auto Complete retained scopes accepted. | [Select](../components/select.md) and [Auto Complete](../components/auto-complete.md): real native options/fields/defaults/forms, explicit bounded results/lifetime; rich P5 popup/render/selection inference exclusions remain. |
| P4-04 — Numeric and bounded entry | 🟢 Verified retained scope | Input Number, Slider and Rate declared native scopes accepted, with explicit limitations. | [Input Number](../components/input-number.md), [Slider](../components/slider.md), [Rate](../components/rate.md): native number/range/radio semantics, reset-safe states, no proxy or extra keyboard/gesture engine. |
| P4-05 — Form validation | 🟢 Verified retained scope | Form/FormItem/FormItemGi native fields, explicit feedback/grid anatomy and narrow optional validators accepted. | [Form evidence](../components/form.md): generation/snapshot/abort/error/reset ownership; native custom validity and submission remain application/browser-owned, no schema framework. |
| P4-06 — Enhanced entry | 🟢 Verified retained scope | Input OTP, Dynamic Input, Dynamic Tags and Mention declared native scopes accepted. Rich Select/Auto Complete and source renderer/geometry engines remain explicit exclusions. | [OTP](../components/input-otp.md), [Dynamic Input](../components/dynamic-input.md), [Dynamic Tags](../components/dynamic-tags.md), [Mention](../components/mention.md): native fields, explicit bounded lifetimes and guarded insertion, not full framework parity. |
| P4-07 — Form sign-off | 🟢 Verified retained scope | All 17 assigned native scopes and companions audited; native fields/defaults/forms/IME/ownership/reset/value boundaries are explicit. | 984 rows = 478 adapted + 506 omitted, 68/68 page tasks, all 889 P4 tests, per-component Chromium evidence and preserved budget ceilings. |

### P5 — Collections and scale

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P5-01 — Identity and async contracts | 🟢 Verified retained consumer scopes | All assigned consumers now have explicit native identity/focus/cancellation/ownership boundaries; no shared application model was introduced. | Final ten-route row audit plus native window/hierarchy/table/log/sentinel/selection/separator evidence below. |
| P5-02 — Tree family | 🟢 Verified retained native scopes | Tree, Cascader and Tree Select complete their declared native scopes; source popup/check-renderer parity is explicitly excluded. | [Tree](../components/tree.md), [Cascader](../components/cascader.md), [Tree Select](../components/tree-select.md): actual-node/native-control ownership, defaults and lifetime evidence. |
| P5-03 — Transfer | 🟢 Verified retained native scope | Native staging versus target membership, locked/matched bulk moves, captured defaults and explicit FormData ownership. | [Transfer evidence](../components/transfer.md): stable native options, no hidden proxy, preserved current membership/handoff. |
| P5-04 — Table family | 🟢 Verified retained native scope | Semantic Table stays CSS-only; optional Data Table owns explicit local sort/filter/page/selection scopes on original rows. | [Data Table evidence](../components/data-table.md): 2,000-row bound, native fields and whole-form reveal policy; virtualization/remote/renderers/body spans omitted. |
| P5-05 — Virtual windows | 🟢 Verified retained fixed-height scope | Explicit native Virtual List with safe row factories, required updater and native scroll/resize. Variable heights and horizontal/grid modes intentionally omitted. | [100k DOM/geometry/focus evidence](../components/virtual-list.md); one focused pin, independent budgets, legacy plugin unchanged. |
| P5-06 — Collection sign-off | 🟢 Verified retained scope | All ten P5 inventories are resolved: 827 rows, 40 tasks, zero unresolved. | Full P5 test gate and per-component native browser evidence; omitted rich/virtual/renderer surfaces remain omitted. |

### P6 — Specialized modules

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P6-01 — Date/time and calendar | 🟢 Verified Calendar/Time retained scopes; counters remain separate | Native Gregorian date-only table and explicit instant/relative formatting accepted as distinct domains. | [Calendar](../components/calendar.md) and [Time](../components/time.md): bounded native arithmetic/Intl/text/focus/lifetime; no token/provider/alternate-calendar or floating-to-instant inference. |
| P6-02 — Upload | 🟢 Verified retained native queue scope | Real FileList/FormData, explicit bounded caller transport, progress/cancel/retry/remove and native Trigger/Dragger. | [Upload acceptance](../components/upload.md): 101 reconciled rows/four tasks, honest ignored-abort slots and native reset/disabled/focus/fallback evidence; previews/downloads/vetoes/backend assumptions omitted. |
| P6-03 — Media and carousel | 🟢 Verified Carousel retained scope; advanced viewer/effects excluded | Native scroll-snap Carousel/CarouselItem, original DOM, manual/wrap controls and opt-in gated autoplay. | [Carousel acceptance](../components/carousel.md): settled targets, lifetime, focus/forms, browser/legacy/no-JS and independent budgets; no seamless clone loop or advanced image-viewer parity. |
| P6-04 — Other utilities | 🟢 Verified Watermark/Countdown/Number Animation/Heatmap/Marquee retained scopes | Bounded decoration, elapsed duration, numeric interpolation, calendar data and single-track controlled motion accepted. | Per-component native ownership/generation/timing/data/media evidence, not security/alarm/financial/chart/seamless/renderer parity. |
| P6-05 — Dependency-heavy exclusions | 🟢 Verified Equation/QR native-alternative resolutions | TeX/KaTeX and QR encoding remain omitted; authored MathML and real link/text handoff accepted. Other feature exclusions retain their individual dispositions. | Eight alternative tasks/27 omitted rows and no-new-runtime evidence; no typesetter/encoder/scanner implementation credit or hidden dependencies. |
| P6-06 — Deprecated surfaces | 🟠 In progress; Legacy Grid native replacement resolved | Legacy Grid migrates explicitly to shipped native layout CSS; Legacy Transfer remains next. | Grid: 15 reconciled rows/four resolution tasks, measured layout and no constructor facade; Transfer's four tasks still unchecked. |
| P6-07 — Packaging sign-off | 🟢 Verified nine main retained scopes | Explicit optional ESM/classic/external CSS, combined payloads and unchanged previous ceilings verified per route. | Main specialized features stay out of the default dependency graph; exclusion-route resolutions and broader P0 legacy extraction/auto-install remain separate. |

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

**Current component: Legacy Grid, resolved migration / verified native Grid/Flex/Space replacement; deprecated constructors/syntax remain omitted.**
**P1/P2/P3/P4/P5 declared retained scopes are complete. P4-07 and P5-06 close against their full assigned-route audits.**
**P5 is Verified for retained scopes:** all ten routes are resolved.
**All nine main P6 retained scopes are accepted:** 288 rows and 36/36 tasks.
Equation, QR Code and Legacy Grid add twelve accepted native-alternative/replacement
tasks without a new runtime or typesetter/encoder/deprecated-constructor implementation.
Recommended next: **Legacy Transfer resolution**. Its four tasks remain unchecked;
API omissions alone are not acceptance.
No next component is implemented here. P0 component-route acceptance
does not close broader foundation tasks or imply full upstream/framework compatibility.

The following component records form a historical execution sequence. Earlier “next” or
phase-incomplete checkpoint statements are superseded by the current dashboard and latest
acceptance record below.
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
The current index records 4,045 rows and 380 accepted tasks out of 384 across 95 pages:
368 retained-scope tasks plus twelve Equation/QR/Legacy Grid resolution tasks, with
four Legacy Transfer tasks unchecked. This is not full upstream or legacy-API parity.
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

Dialog, Modal, Drawer, Message, Notification, Collapse Transition and Discrete API are now
accepted below. P3 navigation, managed feedback and the complete P3 phase are Verified
only for retained scopes; P0/P4+ and full framework parity remain separate.

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
are now Verified **for the retained native scopes**. Message/Notification/Collapse Transition
and Discrete API are accepted below; the final P3 audit closes the phase for native scope only.
Drawer ESM/classic/CSS measure **3,956/4,082/1,195 gzip bytes** under
**4,750/4,750/1,500** ceilings; one format plus CSS is **5,151/5,277**.
Core/advanced/widgets remain **14,611/2,181/2,779**.

### Message retained-scope acceptance

[Message](../components/message.md) closes four tasks with explicit owner/type methods,
native safe text/templates, typed updates, scoped destruction and one polite announcer per
root. Visible words avoid color-only meaning; focus always protects expiry, hover is opt-in,
remaining time resumes and capacity rejects without focused eviction or hidden queues.
No modal/Popover, provider/render/animation framework or OS notification API is introduced.

The tracker preserves **47 original identities** and adds **20 source supplements**:
**67 rows, 35 adapted targets and 32 omissions**. **86 targeted tests** (59 Message,
27 native/legacy), build/budgets and Chromium cover native controls/forms/focus, clocks/
updates, persistent loading, capacity and custom-constructor reentrancy, callback failures,
multiple/modal-local roots, removal/teardown, live-tree policy, placement/RTL/zoom/media
and native fallback/legacy coexistence. Review fixes reserve in-flight capacity and suppress
automatic teardown focus jumps; active-document imports and one-shot clocks have regressions.

ESM/classic/CSS are **4,739/4,860/1,136 gzip bytes** under **6,000/6,000/1,750** ceilings;
one format plus CSS is **5,875/5,996**. All legacy/prior source/outputs/ceilings and
core/advanced/widgets **14,611/2,181/2,779** are unchanged.
Notification can reuse `feedback/expiry.ts`, `feedback/lifetime.ts` and `feedback.css`,
not the Message renderer or a generic application provider. P3 remains incomplete.

### Notification retained-scope acceptance

[Notification](../components/notification.md) closes four tasks with native article/heading/
content/avatar/action composition, explicit owners and typed updates. Shared feedback
expiry/root/CSS are reused unchanged; a small reentrant pending-attribute ledger supports
actual false/Promise close veto without importing Message's void-close semantics.

All **39 original identities** remain plus **20 source supplements and two inherited fields**:
**61 rows, 39 adapted targets and 22 omissions**. **143 targeted tests** (57 Notification,
59 Message, 27 native/legacy), build/budgets and Chromium cover native forms/focus, async
pending/veto/rejection, expiry/updates/capacity/removal, modal-local roots, one deliberate
announcement policy, physical placement/RTL/zoom/media and fallback/legacy coexistence.
Review fixes prevent old attribute restoration and superseded painting from corrupting
a newer pending operation; real customized-element reentrancy was exercised in Chromium.

ESM/classic/CSS are **6,291/6,423/1,339 gzip bytes** under **6,500/6,500/2,000** ceilings;
one format plus CSS is **7,630/7,762**. Message remains **4,739/4,860/1,136**, and
core/advanced/widgets stay **14,611/2,181/2,779**. No previous ceiling or source was changed.
Collapse Transition and Discrete API are accepted below. The final P3 audit closes retained native scope.

### Collapse Transition retained-scope acceptance

[Collapse Transition](../components/collapse-transition.md) closes four tasks with a stable
authored block/inner flow-root, native hidden/inert and optional Element.animate height
snapshots. No renderer/unmount directive, ResizeObserver/per-frame engine or new dependency
from existing Collapse is introduced. Reduced/print/unsupported paths settle immediately.

All **four original identities** remain plus **16 source/internal-hook/style supplements**:
**20 rows, eight adapted targets and 12 omissions**. **160 targeted tests** (43 transition,
33 Collapse, 57 Notification/shared ownership, 27 native/legacy), build/budgets and Chromium
verify real geometry, focus/clip safety, rapid reversal/native cancel/finish, content changes,
hook errors/reentrancy, same-task removal, attribute/style restoration, narrow RTL/zoom/media
and native fallback/coexistence. Review fixes preserve start-hook ordering during reentrant
finish and abort safely when clipping ownership is lost.

ESM/classic/CSS are **3,715/3,837/274 gzip bytes** under **4,500/4,500/750** ceilings;
one format plus CSS is **3,989/4,111**. Existing shared/Collapse/core/plugin sources, outputs
and ceilings remain unchanged; core/advanced/widgets stay **14,611/2,181/2,779**.
Discrete API is resolved below through tested native composition rather than a new factory.

### Discrete API native composition acceptance

[Discrete API](../components/discrete.md) closes four tasks by using existing native owners
outside any framework/setup. No src runtime, public factory/export, bundle or budget is
added. Conditional application imports and authored roots/templates retain the useful
capability without a hidden app, provider graph, reactive bridge or eager service bundle.

All **16 original identities** remain plus **12 source supplements**: **28 rows, seven
native-adapted capabilities and 21 omissions**. **307 targeted tests** (14 composition,
293 existing owner/native tests), unchanged build/budgets and Chromium verify selective
imports, all-five owners, modal-local feedback, nested/pending cleanup, native progress/
focus, retryable partial failure reporting, unowned resources and fallback/coexistence.
Read-only review fixed modal-only initial focus and the application disabling its just-
restored opener during teardown. This is application cleanup evidence, not atomic rollback.

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

<a id="remaining-p3-inventory-after-drawer"></a>

<a id="remaining-p3-inventory-after-message"></a>

<a id="remaining-p3-inventory-after-notification"></a>

<a id="remaining-p3-inventory-after-collapse-transition"></a>

### P3 retained-scope sign-off after Discrete API

Final audit on 2026-09-09 checked **all 96 catalog routes**, selected **all 22 P3-assigned
pages**, and inspected every inventory status and four-task checklist on those pages.
This includes the mixed P2/P3 Ellipsis, Float Button and Layout assignments, not just the
nineteen routes in the sequential queue.

| P3 gate | Audited result |
| --- | --- |
| Assigned route pages | 22 |
| Tracker rows | 1,086 |
| Verified native-adapted rows | 631, including qualified Verified ADAPTED statuses |
| Intentionally omitted rows | 455 |
| Unresolved retained rows | **0** Not reviewed/Planned/In progress/Implemented |
| Accepted page tasks | **88/88** |
| Planned P3 routes | **0** |

Therefore **P3/P3-01 through P3-07 are Verified for retained native scopes and explicit
omissions**, not because the short queue ended and not as upstream/Vue/all-browser/AT parity.
The three mixed P2/P3 pages are not counted twice in global task totals: the catalog has
**3,456 rows and 212/384 accepted tasks across 53 pages**. P2's 31 accepted scopes remain
intact. P0/P4/P5/P6 and framework/viewer exclusions remain independent.

Discrete adds no distribution or byte ceiling. Existing inputs/outputs/budgets are unchanged;
core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes** under **15,000/3,000/4,000**.

### Input native-control acceptance and remaining P4

[Input](../components/input.md) completes the first P4 retained contract with authored
Input/textarea, InputGroup/InputGroupLabel, pair/affix markup and optional root-owned
clear/click-reveal/UTF-16 count. CSS field-sizing has a native rows/manual resize fallback.
No controls are replaced, registered or duplicated for submission. Legacy forms.ts stays
unchanged. Current/default values, selection/IME, native constraints, readonly/fieldset,
changed form ownership, cancelled/post-default reset and user-event sequences are explicit.

The reference preserves **52 original identities** plus **19 source supplements**:
**71 rows = 58 Verified adapted targets + 13 explicit omissions**, with four accepted tasks.
At Input sign-off catalog totals were **3,475 rows and 216/384 accepted tasks across 54 pages**. P4 is
**In progress**, not Form validation or full upstream parity.

**189 targeted tests** (52 Input, 137 native/Button/Pagination/Collapse) and build/type/budget
gates passed. Chromium validated editing/CDP composition/paste/undo, count/clear/reveal,
reset/default/form association, fieldset/readonly, native submission, CSS autosizing,
RTL/narrow/CSS zoom/media, no-JS and ESM/classic/legacy coexistence. ESM/classic/CSS are
**3,110/3,180/1,267 gzip bytes** within new **4,000/4,000/1,750** ceilings. All **121 previous
top-level JS/CSS assets** are byte-identical; core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes**. See the canonical record for precise evidence/limitations.

### Checkbox native-selection acceptance and remaining P4

[Checkbox](../components/checkbox.md) accepts CSS-only native single checkboxes and an
optional fieldset/legend group helper. Native checked/defaultChecked/indeterminate, labels,
Space and pointer activation, string names/values, disabled fieldsets and per-control
form/reset/submission remain native. Bounds cancel the native click and let the browser
restore checked/mixed state; only derived ARIA is owned, never disabled submission fields.
Selected-string setters/refresh/reset are silent. Keys, nested groups, external forms,
late children, errors and disposal have explicit contracts. No legacy/Input sources change.

All **29 original identities** plus **13 source supplements** resolve to **42 rows:
28 adapted targets + 14 omissions**. At Checkbox sign-off four tasks brought totals to
**3,488 rows and 220/384 accepted tasks across 55 pages**. Radio is accepted below;
Switch remains independent, and group min/max is not Form validation.

**124 targeted tests** (45 Checkbox, 52 Input, 27 native), build/type/budget checks and
Chromium acceptance passed. Browser evidence includes real label/Space/pointer rollback,
mixed/submitted value separation, reset/default/form ownership, fieldsets, refreshed
groups, native FormData, focus, RTL/narrow/CSS zoom/media, no-JS and both legacy load orders.
ESM/classic/CSS are **2,171/2,246/741 gzip bytes** under **3,500/3,500/1,000** ceilings.
All **124 previous top-level JS/CSS outputs** are byte-identical; core/advanced/widgets
remain **14,611/2,181/2,779**. See the canonical record for exact limitations.

### Radio native-exclusivity acceptance and remaining P4

[Radio](../components/radio.md) accepts native Radio/RadioButton CSS and an optional group
helper that validates a complete native name/form/tree group. Native controls own
checked/default state, Arrow/Space/Tab, repeated clicks, required and submission; there is
no second keyboard/roving engine, renamed field or hidden value. Outside peers are
explicit conflicts, not secretly isolated. Setters are strict string/null and silent;
native state/default/reset/peer effects are never rewritten to mimic a framework.

The reference preserves **20 original identities** plus **14 source supplements**:
**34 rows = 23 adapted targets + 11 omissions**, with four accepted tasks. At Radio sign-off
totals were **3,502 rows and 224/384 tasks across 56 pages**. **165 targeted tests** and build/budgets
passed; Chromium covers native keyboard/label/required/exclusivity/rollback, external forms,
defaults/reset, dynamic peer conflicts, segmented fallback, media/no-JS and coexistence.
Native-only jsdom form-owner/cancelled-radio limitations are recorded in the canonical
evidence; no production patch or duplicate selection engine was added to satisfy jsdom.
ESM/classic/CSS are **1,751/1,819/958 gzip bytes** under **3,000/3,000/1,250** ceilings.
All **127 previous top-level JS/CSS outputs** are byte-identical; core/plugins remain
**14,611/2,181/2,779**.

### Switch native-binary acceptance and remaining P4

[Switch](../components/switch.md) accepts one native checkbox with role switch, stable
name and CSS rail/thumb/state decorations. The optional loading helper cancels native
activation without setting native disabled, hiding the focused control or removing a
checked form value. Boolean checked/defaultChecked are explicitly not value/defaultValue
submission strings. Mixed/readonly and arbitrary payload tokens are not accepted states.
No new key/drag engine, proxy, Spin dependency, async service or Form model is added.

All **23 original identities** plus **eight source supplements** resolve to **31 rows:
17 adapted targets + 14 omissions**. At Switch sign-off four tasks brought totals to **3,510 rows and
228/384 accepted tasks across 57 pages**. **163 targeted tests**, build/type/budget and
Chromium native/AX-tree/RTL/media/no-JS/coexistence acceptance passed. ESM/classic/CSS are
**2,268/2,343/1,119 gzip bytes** within **3,500/3,500/1,250** ceilings. All **130 prior
top-level JS/CSS assets** are byte-identical; core/plugins remain **14,611/2,181/2,779**.
P4-02 is Verified for the declared Checkbox/Radio/Switch retained scopes, not upstream
parity or overall P4 completion.

### Select native-selection acceptance and remaining P4

[Select](../components/select.md) accepts authored native select/options/optgroups,
strict single-string/null and multiple-string-array selection, native defaultSelected/reset,
clear and optional external literal list filtering. Selected options are retained rather
than removed/disabled to filter. Placeholder empty string and no-selection null differ;
native FormData still omits disabled selected options/optgroups. No fake combobox, hidden
value, renderer, popup lifecycle model or virtual/remote/tag engine is introduced.

All **79 original identities** plus **19 source supplements** resolve to **98 rows:
35 adapted targets + 63 omissions**, with zero inherited Select rows. Four tasks close;
at Select sign-off totals were **3,529 rows and 232/384 tasks across 58 pages**. **164 targeted tests**,
build/type/budgets and Chromium native/filter/composition/forms/picker/media/no-JS/coexistence
acceptance passed. ESM/classic/CSS are **3,440/3,515/780 gzip bytes** under
**4,000/4,000/1,000** ceilings. All **133 previous top-level JS/CSS outputs** are unchanged;
core/plugins remain **14,611/2,181/2,779**. jsdom's native disabled-option FormData limitation
is recorded, not patched into production. P4-03 remains In progress for Auto Complete;
Select's rich P5 surfaces remain explicitly unimplemented.

### Input Number native-numeric acceptance and remaining P4

[Input Number](../components/input-number.md) accepts the authored native numeric input
and optional step/clear buttons. Native valueAsNumber, defaultValue, min/max/step, validity,
readonly/fieldset and forms remain authoritative. A strictly local never-inserted native
probe derives step availability; actual actions use native stepUp/stepDown. Empty/badInput
are not zero, typed invalid numbers are not rewritten, and no parser/precision/hold-repeat
engine or hidden value is added.

All **36 original identities** plus **ten source supplements** resolve to **46 rows:
33 adapted targets + 13 omissions**. At Input Number sign-off four tasks brought totals to **3,539 rows and
236/384 accepted tasks across 59 pages**. **116 targeted tests**, build/budgets and
Chromium decimal/grid/draft/bounds/native-key/forms/focus/media/no-JS/core+widgets acceptance
passed. ESM/classic/CSS are **2,859/2,932/770 gzip bytes** under **3,500/3,500/1,000**
ceilings; all **136 previous top-level JS/CSS outputs** are unchanged. Core/plugins remain
**14,611/2,181/2,779**. Slider is accepted below; Rate remains independent.

### Slider native-range acceptance and remaining P4

[Slider](../components/slider.md) accepts native range movement/sanitization/defaults/forms,
non-live output text and optional exactly-two-field pairs. Pair crossing is allowed and
reported; native endpoint min/max never derive from the other value, preventing reset
corruption after narrowing. No shared-track dual-thumb claim, hidden tuple value, gesture
engine, tooltip popup or mark-only snapping is added.

All **19 original identities** plus **nine source supplements** resolve to **28 rows:
13 adapted targets + 15 omissions**. At Slider sign-off four tasks brought totals to **3,548 rows and
240/384 accepted tasks across 60 pages**. **101 targeted tests**, build/budgets and Chromium
native drag/keys/pair/default/reset/FormData/direction/readout/media/no-JS/coexistence passed.
Known jsdom sanitization and Chromium CDP formatted-valuetext limits are explicitly recorded,
not patched with arithmetic or duplicate roles. ESM/classic/CSS are **2,612/2,680/676 gzip
bytes** under **3,500/3,500/1,000** ceilings. All **139 prior top-level JS/CSS assets** are
unchanged; core/plugins remain **14,611/2,181/2,779**. Rate is accepted below.

### Rate native-score acceptance and historical Form handoff

[Rate](../components/rate.md) reuses Radio for native exclusivity/name/form/tree ownership.
Bounded complete integer/half choices, zero versus unselected/null, clear and non-live text
are explicit. Readonly is static markup with no submitted control; disabled interactive
radios remain native. No VNode/star allocation, pointer half zones, extra keyboard engine
or hidden score is introduced.

All **13 original identities** plus **six source supplements** resolve to **19 rows:
13 adapted targets + six omissions**. Four tasks close; totals are **3,554 rows and
244/384 accepted tasks across 61 pages**. **102 targeted tests**, build/budgets and Chromium
integer/half/clear/readonly/forms/keys/reset/focus/RTL/media/no-JS/core+widgets acceptance passed.
ESM/classic/CSS are **3,904/3,976/1,097 gzip bytes** under **4,000/4,000/1,500** ceilings,
including reused Radio code; all **142 prior top-level JS/CSS assets**, including Radio,
are byte-identical. Core/plugins remain **14,611/2,181/2,779**.

At Rate sign-off P4-04 was Verified for declared native scopes; overall P4 was incomplete. The **nine remaining
Planned P4 routes** are **Auto Complete, Color Picker, Date Picker, Dynamic Input, Dynamic
Tags, Form, Input OTP, Mention, Time Picker**. Their historical 499 rows (496 unresolved and
three omissions) remain planning inventory, not implementation credit. Native component
supplements bring the P4 inventory to 868 rows without promoting other components.

**At that checkpoint, next was [Form](components/form.md) native validation**, before remaining Auto Complete/OTP/
dynamic/picker routes. The shared contract is an authored semantic
control owning current/default/checked state, labels/name/form/fieldset/reset/validity,
silent native property writes with explicit refresh for decorations, no duplicate events
or submission fields, and root-owned reversible enhancement state. Apply these conventions
to later controls without importing Input's text-only behavior or inventing a form model.
Continue one component/documentation/build/acceptance/commit at a time.

The Form handoff required actual controls/labels/names/form association and native validity, preserving
default/reset semantics and cancelled resets, respecting disabled fieldsets and silent
programmatic updates, and never synthesizing hidden model fields. Rate's explicit
mui:rate-clear can be observed in capture for validation refresh; it intentionally emits no
fake native radio change. See [Rate's Form prerequisites](../components/rate.md#native-prerequisites-handed-to-form).

### Form/FormItem/FormItemGi acceptance and historical Auto Complete handoff

[Form](../components/form.md) completes the retained native coordination scope. The helper
never creates or replaces controls, sets values/defaults, claims setCustomValidity, disables
native validation or installs a submit handler. Explicit mappings preserve literal/repeated
names, radio/native eligibility and external form associations. Optional per-item validators
use frozen all-field observations, AbortSignal and generations; custom errors invalidate
the explicit result only. Application-owned submission must await/check current results,
preserve submitter semantics and handle unexpected errors. The demo performs local
inspection only, with no requests or requestSubmit/form.submit resume loop.

All **93 original Form identities** remain in order with unchanged section/source/kind;
**18 explicit source supplements** yield **111 rows: 68 adapted targets and 43 omissions**.
Four page tasks close. Exact catalog totals: **3,572 rows, 248/384 accepted tasks across
62 pages, 136 unchecked**. The P4 inventory is now **886 rows**; the eight remaining
Planned routes retain their **406 unresolved rows**, not implementation credit.

Targeted native-control regressions, the existing build/type/budget checks, Chromium
invalid-before-submit/reporting/focus, asynchronous rejection/stale intent, reset/cancel,
literal/repeated/external FormData, no-JS GET, RTL/narrow/200% CSS zoom/media and
ESM/classic/Input/legacy coexistence evidence are recorded in the canonical document.
The read-only review's unmapped Rate-clear and post-reset-generation defects were fixed
with dedicated internal/external/unchanged-value regressions. No production jsdom workarounds
were added. All **143 prior top-level JS/CSS outputs** byte-match the pre-Form HEAD build
recipe. Core/plugins remain **14,611/2,181/2,779 gzip bytes** under unchanged ceilings.

**At Form sign-off, next was Auto Complete**. Remaining Planned P4 routes were **Auto Complete, Color Picker,
Date Picker, Dynamic Input, Dynamic Tags, Input OTP, Mention and Time Picker**.
Reuse actual native fields and Input's explicit setters/refresh/lifetime rather than copying
its editing logic. Invalidate Form after silent programmatic transactions; original names
remain literal and callbacks remain validation, not a business submission engine. Keep the
same one-component → documentation/build/acceptance → separate-commit sequence.

### Auto Complete acceptance and historical Input OTP handoff

[Auto Complete](../components/auto-complete.md) completes retained native datalist/loader
scope. Original fields, values/defaults, labels/form associations, free text, native
constraints and native keyboard remain authoritative. Existing Input clears/sets values;
Form observes the same original events. The small optional writer handles only bounded
typed suggestion results, debounce/minLength, AbortSignal/snapshots, composition/reset
generations and reversible original options/templates/status. Static lists may be shared;
managed writers require explicit exclusive input/list ownership.

All **46 original identities** are preserved exactly in order; **ten explicit source
supplements** yield **56 rows: 27 adapted and 29 omitted**. Four tasks close. Catalog:
**3,582 rows, 252/384 accepted tasks across 63 pages, 132 unchecked**. P4 has **896 rows**,
with **seven Planned routes / 360 unresolved rows** remaining.

**213 targeted tests** (68 Auto Complete, 52 Input, 53 Form, 40 Select), build/type/budgets
and Chromium native association/free-text Enter/forms/required/clear/reset/availability,
asynchronous error/stale/disposal, CDP IME, no-JS, RTL/narrow/200% CSS zoom/media and
ESM/classic/Input/Form/legacy coexistence evidence are recorded in the canonical document.
The reviewer-found same-task external-edit, synchronous abort-transfer and composition-reset
generation defects were fixed and covered by dedicated regressions/browser probes.

Native popup selection was not verified: this automation's ArrowDown/Enter kept “Lo”
and submitted natively. The helper does not fake on-select, append, clear/blur-after-select,
expanded state, popup matching/group/rendering or universal AT announcements.
ESM/classic/CSS: **3,183/3,252/494 gzip bytes** under **4,500/4,500/1,000** ceilings.
All **146 prior top-level JS/CSS outputs** byte-match the pre-Auto Complete HEAD build
recipe. Core/plugins remain **14,611/2,181/2,779** and no earlier ceiling was changed.

**At Auto Complete sign-off, next was Input OTP.** Other remaining Planned P4 routes were **Dynamic Input, Dynamic Tags,
Mention, Color Picker, Date Picker and Time Picker**. Keep native field/value/default/
form/IME semantics, explicit silent-setter refresh and one separate accepted-component
commit at a time. Overall P4/P0/P5/P6 completion is not implied.

### Input OTP acceptance and historical Dynamic Input handoff

[Input OTP](../components/input-otp.md) completes the retained **single native field** scope.
Whole ASCII strings/leading zeroes, native text/password presentation, one-time-code hints,
selection/paste/IME, constraints/defaults/reset and actual form association are preserved.
There is no per-cell rendering/navigation, secret normalization/mirroring, auth submission,
WebOTP/SMS/clipboard client, storage or code-bearing custom event. The completion signal
contains only length/character-policy metadata and fires once per local complete stretch.
Replacing one complete valid code with another is not inferred to be new intent.

All **23 original section/source/kind identities** remain exactly in order; **eleven source
supplements** yield **34 rows: 17 adapted and 17 omitted**. Four tasks close. Catalog:
**3,593 rows, 256/384 accepted tasks across 64 pages, 128 unchecked**. P4 now has **907 rows**,
with **six Planned routes / 337 unresolved rows** remaining.

**178 targeted tests** (73 OTP, 52 Input, 53 Form), build/type/budgets and Chromium leading
zeroes/native masking/selection/required/completion dedupe, reset/cancel/fieldsets/external
form values, synthetic paste-default plus CDP bulk insertion/IME, no-JS local dialog forms,
RTL/narrow/200% CSS zoom/media and ESM/classic/Input/Form/legacy coexistence passed.
Review fixes cover successful/immediate reset baselines, cancelled pending notification,
complete autocomplete-token grammar and inherited live-status ancestry. Actual OS clipboard,
mobile SMS autofill, server authentication and universal AT behavior were not verified.

The demo's method=dialog fallback only closes locally and uses a nonsecret submitter value;
code values never enter a GET URL or status/log output. Input/Form helpers are reused without
changing their source. ESM/classic/CSS are **2,280/2,352/507 gzip bytes** under
**3,000/3,000/1,000** ceilings. All **149 prior top-level JS/CSS outputs** byte-match the
pre-OTP HEAD recipe; core/plugins remain **14,611/2,181/2,779**, with all prior ceilings intact.

**At OTP sign-off, next was Dynamic Input, then Dynamic Tags.** The six Planned P4 routes were
**Dynamic Input, Dynamic Tags, Mention, Color Picker, Date Picker and Time Picker**.
Preserve original repeated native fields/names/defaults/FormData and explicit Form refresh
when adding/removing fields; use authored templates rather than introducing a model/provider
engine. Continue one component/documentation/build/acceptance/separate commit at a time.

### Dynamic Input acceptance and historical Dynamic Tags handoff

[Dynamic Input](../components/dynamic-input.md) completes retained bounded native collection
scope. One authored HTML template creates rows; existing row/input/label identities,
current/default values, literal names and native FormData order are preserved. Stable-key
add/remove/absolute moves use native moveBefore when present, with a guarded same-node
fallback and focus/caret recovery. Native reset resets current fields only; disconnect
keeps edited rows and releases only explicitly registered lifecycle resources.

All **32 original section/source/kind identities** remain in order; **ten source supplements**
yield **42 rows: 28 adapted and 14 omitted**. Four tasks close. Catalog totals:
**3,603 rows, 260/384 accepted tasks across 65 pages, 124 unchecked**. P4 has **917 rows**,
with **five Planned routes / 305 unresolved rows** remaining.

**156 targeted tests** (51 Dynamic Input, 52 Input, 53 Form), build/type/budgets and Chromium
actual-node/caret/action focus, native labels/required/forms/reset, failed-add/resource
cleanup, native no-JS rows and RTL/narrow/200% CSS zoom/media/coexistence passed.
Review fixes cover fallback blur reentrancy, root-level checked-radio protection,
connect-hook action state ownership and detached action lease release; fixed action
identities prevent stale controls. Source presets, controlled arrays, theme/path injection,
generic renderers and callback model overloads are explicitly omitted.

Template contents are ID-free; initialization may explicitly assign validated unique
IDs and resolving internal/external references. Native names are never reindexed.
New checked radios/autofocus are rejected before insertion; choose native selection after
a committed add. Rollback cannot undo arbitrary application side effects, and fallback
iframe/animation/active-IME state is not promised. The helper never fetches or submits.
ESM/classic/CSS measure **5,567/5,634/414 gzip bytes** under **6,500/6,500/1,000** ceilings.
All **152 prior top-level JS/CSS assets** byte-match the pre-component HEAD recipe;
core/plugins remain **14,611/2,181/2,779**, with every earlier ceiling unchanged.

**At Dynamic Input sign-off, next was Dynamic Tags.** Planned P4 routes were **Dynamic Tags, Mention, Color
Picker, Date Picker and Time Picker**. Reuse concrete native row/field/lifetime concepts
where appropriate, not a generic reactive store. Keep the authorized one-component,
documentation/build/acceptance and separate-commit sequence.

### Dynamic Tags acceptance and historical Mention handoff

[Dynamic Tags](../components/dynamic-tags.md) completes retained native string-tag/editor
scope by reusing the accepted Dynamic Input row/template/focus/lifetime owner. Visible
readonly named fields are the canonical committed values; one unnamed native editor owns
the draft. Enter/Add are explicit, IME-safe creation intents; rejected/duplicate/capacity
drafts remain intact. Duplicate strings have independent stable keys and native FormData
entries. No Tag/Input runtime, hidden proxy values, VNode/object renderer or reactive array.

All **32 original identities** remain exactly in order, plus **ten source supplements**:
**42 rows, 25 adapted and 17 omitted**. Four tasks close. Catalog totals are **3,613 rows,
264/384 accepted tasks across 66 pages, 120 unchecked**. P4 now has **927 rows**, with
**four Planned routes / 273 unresolved rows** remaining.

**212 targeted tests** (56 Dynamic Tags, 51 Dynamic Input, 52 Input, 53 Form), build/type/
budgets and Chromium IME/Enter/Escape/limits/duplicates/drafts, callback errors/focus/native
required/FormData/reset, no-JS readonly values, RTL/zoom/media and coexistence passed.
Review fixes prevent stranded base ownership when teardown is refused during cleanup and
preserve reset-restored drafts after lower-level collection notifications. Native setters/
refresh/reset are silent; commit/remove commands and creation errors have explicit events.

Source blur/deactivate auto-commit, separate label/value objects, VNode rendering and
checkable Tag behavior are omitted. No backend submission or clipboard parsing is added.
ESM/classic **including reused Dynamic Input** are **8,985/9,052 gzip bytes**, complete CSS
**685**, within **10,000/10,000/1,500** ceilings. All **155 prior top-level JS/CSS outputs**
byte-match the pre-Tags HEAD recipe; prior helper/core/plugin code and budgets remain
unchanged, with core/plugins **14,611/2,181/2,779**.

**At Dynamic Tags sign-off, next was Mention.** Planned P4 routes were **Mention, Color Picker, Date Picker,
Time Picker**. Continue preserving native text/IME/selection/forms and explicit identity/
lifetime contracts; no full P4/P0/P5/P6 or universal browser/AT claim is implied.

### Mention acceptance and historical native picker handoff

[Mention](../components/mention.md) completes the retained native enhanced-text scope.
Original input/textarea, code-unit caret/prefix snapshots and bounded safe options support
actual native candidate button selection through Tab/Enter/Space or pointer activation.
setRangeText replaces only the active prefix-to-caret fragment, preserving surrounding text,
defaults/forms/selection; maxlength overflow never truncates. Editor keys remain native.
The named field-adjacent region is not a caret popup or fake combobox/listbox.

All **35 original identities** remain exactly in order plus **eleven source supplements**:
**46 rows, 30 adapted and 16 omitted**. Four tasks close. Catalog totals:
**3,624 rows, 268/384 accepted tasks across 67 pages, 116 unchecked**. P4 now has **938 rows**,
with **three Planned routes / 238 unresolved rows** remaining.

**248 targeted tests** (75 Mention, 52 Input, 68 Auto Complete, 53 Form), build/type/budgets
and Chromium actual keyboard/pointer insertion, Unicode/caret/IME/maxlength/async races,
reset/focus/forms, no-JS local dialog fallback and RTL/zoom/media/coexistence passed.
Review fixes protect candidate focus transitions through temporary BODY and reset caret
rebasing after in-reset reentrant queries. Transient snapshots are not text logging/storage;
no built-in HTTP, rich text, mirror, follower/portal or VNode engine is introduced.

ESM/classic/CSS are **5,367/5,435/558 gzip bytes** within **6,500/6,500/1,250** ceilings.
All **158 prior top-level JS/CSS assets** byte-match the pre-Mention HEAD recipe; prior
helper/core/plugin source and budgets remain unchanged (core/plugins **14,611/2,181/2,779**).
P4-06 is Verified only for the declared native enhanced-entry scopes, not full P4/P5/P6.

At Mention sign-off, next was Color Picker, followed by Date Picker and Time Picker. Preserve native
fields/defaults/constraints/forms and existing ownership/refresh contracts; keep the
authorized one-component → docs/build/acceptance → separate-commit sequence.

### Color Picker acceptance and historical Date Picker handoff

[Color Picker](../components/color-picker.md) completes retained classic native RGB scope.
The original labelled color input owns chooser/preview, current/default values, native
fieldset/forms and literal datalist options. A small optional helper validates six-digit
hex before setters can reach native black fallback and coordinates a plain readout/unnamed
validatable hex draft. Dirty drafts survive primary changes; null/clear, alpha/gamut
conversion, HSV planes, popup/toolbar state and VNode rendering are explicit exclusions.

All **25 original section/source/kind identities** remain in order plus **ten supplements**:
**35 rows, 10 adapted and 25 omitted**. Four tasks close. Catalog totals are **3,634 rows,
272/384 accepted tasks across 68 pages, 112 unchecked**. P4 has **948 rows**, with **two
Planned routes / 213 unresolved rows** remaining.

**153 targeted tests** (48 Color Picker, 52 Input, 53 Form), build/type/budgets and Chromium
value grammar/draft/event/FormData/reset/fieldset/caret/CDP IME/no-JS/RTL/zoom/media and
explicit core/widgets coexistence passed. Review fixes reconcile after actual reset clicks,
avoid unrelated DOM cancellation, clear obsolete reset dirty state and process distinct
reentrant input events. Original native custom validity/ARIA/values/defaults remain owned.

Native type/showPicker availability and datalist values were inspected without opening a
real chooser, screen picker or clipboard. No all-browser native-dialog UI/confirmation,
alpha/gamut or AT compatibility is claimed. ESM/classic/CSS are **3,892/3,964/458 gzip
bytes**, within **4,500/4,500/1,000** ceilings. All **161 prior top-level JS/CSS assets**
byte-match the pre-component HEAD recipe; core/plugins remain **14,611/2,181/2,779**
under unchanged ceilings. Legacy widgets color behavior is not silently upgraded.

At Color Picker sign-off, next was Date Picker, then Time Picker. Keep native date/time values, constraints,
selection/default/reset/form ownership and explicit optional lifetime policies; overall
P4/P0/P5/P6 completion is not implied.

### Date Picker acceptance and historical Time Picker handoff

[Date Picker](../components/date-picker.md) completes the retained native date/month/week/
datetime-local and same-mode endpoint-pair scope. A tiny detached native probe verifies
capability/grammar before setters touch real fields. Calendar/month/ISO week/local wall
strings are not implicitly timezone-bearing instants; no Date parsing, epoch conversion,
DST normalization, formatter library or calendar grid is added.

All **179 original mode-specific section/source/kind identities** remain exactly in order;
**twenty source supplements** yield **199 rows: 37 adapted and 162 omitted**. Grouped
MonthRange/QuarterRange/YearRange and slot owners remain intact with explicit retained
branch qualifications, never blanket promotion of year/quarter modes. Four tasks close.
Catalog: **3,654 rows, 276/384 accepted tasks across 69 pages, 108 unchecked**. P4 has
**968 rows**, with **Time Picker's 34 unresolved rows** still Planned.

**179 targeted tests** (74 Date Picker, 53 Form, 52 Input), build/type/budgets and Chromium
grammar/leap/week/year/seconds/range/order/min-max-step/clear/default-reset/FormData/focus,
no-JS and RTL/zoom/media passed. Review fixes preserve clear notifications across cancelled
resets and attribute overrides made during native focus recovery. Bounds never cross-link,
values never swap/clamp and native reset never resurrects a hidden tuple model.

Two isolated timezone contexts preserved date-only and local DST-gap/fold strings unchanged.
The application local-parts Today example produced different correct local days at one
fixed test clock. This proves absence of conversion, not real timezone scheduling validity.
Native picker UI/weekday layout, arbitrary disabled cells, format tokens, year/quarter
grids and universal browser/AT behavior remain excluded/unverified.

ESM/classic/CSS: **3,882/3,953/421 gzip bytes** under **4,500/4,500/1,000** ceilings.
All **164 prior top-level JS/CSS assets** byte-match the pre-Date Picker HEAD recipe;
core/plugins stay **14,611/2,181/2,779** and prior ceilings remain unchanged.
The temporal probe is concrete reusable DOM infrastructure, not a generic date engine.

At Date sign-off, next was Time Picker, the last Planned P4 route. Reuse the native temporal capability/
grammar/default/ownership conventions with an explicit time-only string contract; do not
infer full P4/P0/P5/P6 completion before its acceptance and remaining sign-off.

### Time Picker acceptance and retained P4 closure

[Time Picker](../components/time-picker.md) completes native single-time scope: canonical
HH:mm/seconds/fraction strings, midnight versus empty, periodic min>max bounds, native
step/default/required/readonly/fieldset/FormData, explicit clear and reversible readout.
Detached native probes and integer within-day precision checks do not create a date,
instant, timezone or duration model. Native picker UI/format/confirmation is not inferred.
The installed jsdom short-fraction defect is rejected rather than patched into production;
Chromium verifies the requested .1/.01/.001 precision.

All **34 original Time Picker identities** remain in order, plus **16 source supplements**:
**50 rows, 16 adapted and 34 omitted**. Its four tasks close. **245 targeted tests**
(64 Time, 76 Date, 53 Form, 52 Input) and **all 889 tests across the 17 P4 files** passed.
Existing build/declaration/budget gates and Chromium time/overnight/precision/forms/reset/
clear/readonly/focus/local-clock/no-JS/RTL/zoom/media/coexistence checks passed.

Review found a coupled Date/Time native-blur path while hiding a focused clear action.
The shared `temporal/focus.ts` primitive moves focus before the action is hidden/disabled,
while ownership observation is active, and interrupted disposal stops subsequent writes.
Both helpers have regressions and real browser probes; Date's native four-mode public gate
still rejects time. There is no new range API in Time Picker.

| Output | Gzip bytes | Ceiling / disposition |
| --- | ---: | --- |
| Time ESM | 3,425 | 4,000 |
| Time classic | 3,497 | 4,000 |
| Time external CSS | 388 | 1,000 |
| Date ESM after coupled fix | 3,967 | 4,500 unchanged ceiling; previously 3,882 |
| Date classic after coupled fix | 4,038 | 4,500 unchanged ceiling; previously 3,953 |
| Core / advanced / widgets | 14,611 / 2,181 / 2,779 | 15,000 / 3,000 / 4,000 unchanged |

Comparison against actual pre-Time HEAD source found **165/167 prior top-level JS/CSS
assets byte-identical**. The only changed outputs are Date ESM/classic for the explicit
temporal focus correction. No earlier budget ceiling was relaxed.

### Complete P4 route/row/task audit

Every index-assigned P4 route, including mixed P4/P5/P6 pages, was counted from its actual
pinned inventory and checklist. Green counts apply only to documented native adaptations;
all excluded source branches remain explicit, including grouped Date year/quarter modes.

| P4 route | Rows | Adapted | Omitted | Unresolved | Tasks |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Auto Complete](components/auto-complete.md) | 56 | 27 | 29 | 0 | 4/4 |
| [Checkbox](components/checkbox.md) | 42 | 28 | 14 | 0 | 4/4 |
| [Color Picker](components/color-picker.md) | 35 | 10 | 25 | 0 | 4/4 |
| [Date Picker](components/date-picker.md) | 199 | 37 | 162 | 0 | 4/4 |
| [Dynamic Input](components/dynamic-input.md) | 42 | 28 | 14 | 0 | 4/4 |
| [Dynamic Tags](components/dynamic-tags.md) | 42 | 25 | 17 | 0 | 4/4 |
| [Form](components/form.md) | 111 | 68 | 43 | 0 | 4/4 |
| [Input](components/input.md) | 71 | 58 | 13 | 0 | 4/4 |
| [Input Number](components/input-number.md) | 46 | 33 | 13 | 0 | 4/4 |
| [Input OTP](components/input-otp.md) | 34 | 17 | 17 | 0 | 4/4 |
| [Mention](components/mention.md) | 46 | 30 | 16 | 0 | 4/4 |
| [Radio](components/radio.md) | 34 | 23 | 11 | 0 | 4/4 |
| [Rate](components/rate.md) | 19 | 13 | 6 | 0 | 4/4 |
| [Select](components/select.md) | 98 | 35 | 63 | 0 | 4/4 |
| [Slider](components/slider.md) | 28 | 13 | 15 | 0 | 4/4 |
| [Switch](components/switch.md) | 31 | 17 | 14 | 0 | 4/4 |
| [Time Picker](components/time-picker.md) | 50 | 16 | 34 | 0 | 4/4 |
| **Total: 17 routes** | **984** | **478** | **506** | **0** | **68/68** |

**P4 is Verified for retained native scopes.** There are no Planned P4 routes or unresolved
P4 rows. This is not calendar/format/renderer parity, all-browser/AT certification, or
automatic completion of P0/P5/P6. The historical defaults, cancelled reset, partial/invalid
draft, async stale-result, native-input/form/ARIA ownership and no-JS boundaries remain
those documented per component.

Full catalog totals: **96 routes, 3,670 tracker rows, 280/384 accepted tasks across
70 retained-scope pages, 104 unchecked**. The remaining **26 route pages** comprise
**22 Planned pages and four explicit exclusions**, grouped below. Their **946 rows**
contain **819 unresolved** and **127 already explicit omitted** rows; they receive no
P4 implementation credit.

### Remaining catalog after P4

| Group | Routes | Rows / unresolved | Scope boundary |
| --- | --- | ---: | --- |
| P0 / configuration (3) | [Config Provider](components/config-provider.md), [Element](components/element.md), [Global Style](components/global-style.md) | 97 / 8 | Native configuration/composition/external-CSS work remains; framework provider exclusions stay excluded. Global Style has zero API rows but four unaccepted page tasks. |
| P5 collections (10) | [Cascader](components/cascader.md), [Transfer](components/transfer.md), [Tree Select](components/tree-select.md), [Data Table](components/data-table.md), [Log](components/log.md), [Tree](components/tree.md), [Infinite Scroll](components/infinite-scroll.md), [Popselect](components/popselect.md), [Split](components/split.md), [Virtual List](components/virtual-list.md) | 582 / 579 | Existing partial implementations/shared-helper research are not acceptance. Log highlighter and selected dependency surfaces remain explicit omissions. |
| P6 specialized (9) | [Carousel](components/carousel.md), [Watermark](components/watermark.md), [Upload](components/upload.md), [Calendar](components/calendar.md), [Countdown](components/countdown.md), [Number Animation](components/number-animation.md), [Time](components/time.md), [Heatmap](components/heatmap.md), [Marquee](components/marquee.md) | 232 / 232 | Native baselines/optional transport/media/time/graphics scopes require individual review; automatic-motion/advanced feature limits remain explicit. |
| Explicit exclusions (4) | [Equation](components/equation.md), [QR Code](components/qr-code.md), [Legacy Grid](components/legacy-grid.md), [Legacy Transfer](components/legacy-transfer.md) | 35 / 0 | TeX/QR engines and redundant legacy APIs are not silently implemented. Omitted routes are not counted as accepted component tasks. |

**Recommended dependency-ready next foundation: Virtual List (P5-01 + P5-05), fixed-height
scope first.** Relevant P3 native scrolling/focus and P4 stable-row/template/lifetime
patterns are available. Establish its own stable keys, bounded window and focused-item
policy with a static/paginated fallback; do not assume the small upstream vueuc wrapper
is a ready algorithm. This unlocks Log/Infinite Scroll/Data Table work. Variable-height/grid
and generic renderer APIs stay separate. Tree is another viable native hierarchy foundation,
but **neither it nor Virtual List was started** in this Time/P4 sign-off commit.

## Virtual List — first main P5 collection accepted

[Canonical implementation/acceptance](../components/virtual-list.md) and
[reference dispositions](components/virtual-list.md) close this component only. An explicit
native fixed-height helper owns a constrained viewport's ul/ol spacer and bounded keyed
li rows. Callers supply safe native factories, a mandatory same-key updater and optional
synchronous cleanup. Native scroll/resize, start/center/end/nearest navigation, one focused
pin, removal focus and fail-closed lifecycle are implemented without a renderer, provider,
scrollbar package, automatic child helpers or data fetch.

The basic advanced-plugin `MuiVirtualList` remains unchanged. The new helper registers
no custom element, so there is no silent redefinition or artificial loading-order rule.
ESM/classic namespace/legacy coexistence were measured. Dynamic heights, horizontal/tree/
grid modes, source framework types and smooth/debounce behavior are explicit omissions.

**41 tracker rows = 29 preserved original identities + twelve supplements = 26 adapted
+ 15 omitted; four accepted tasks.** **71 targeted tests** pass (44 Virtual List plus
27 existing native/legacy tests); declarations, build and all unchanged budgets pass.
Optional ESM/classic/CSS are **4,149/4,289/376 gzip bytes** under **5,000/5,000/1,000**
ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**, with their original
**15,000/3,000/4,000** ceilings and no runtime dependencies.

Chromium **151.0.7922.174** measured the **100,000 × 32px, 320px viewport** fixture:
**13/16/13 mounted rows** at start/middle/end; maximum **17** across 101 offsets; native
height **3,200,000px**, end offset **3,199,680**, last-row bottom error **0px**. A focused
100k row stayed connected as one pin. The **8,000,000px** supported ceiling also reached
its last row and correctly rejected larger datasets. Native keyboard, hidden/resize,
CSS/visual zoom, RTL, keyed updates/reverse/remove, mounted-only FormData, no-JS fallback,
failure cleanup and legacy coexistence have actual browser evidence. Browser review fixed
large-height CSS exponent-serialization cleanup and narrow demo metrics wrapping.

At Virtual List sign-off: **96 routes, 3,682 rows, 284/384 accepted tasks across 71 pages,
100 unchecked**. **P5 is active, not complete:** one route accepted; all ten P5 routes
contain **594 rows = 26 adapted + 18 omitted + 550 unresolved**. The nine remaining P5
routes contain **553 rows / 550 unresolved**:

**Cascader, Transfer, Tree Select, Data Table, Log, Tree, Infinite Scroll, Popselect, Split.**

P4 remains unchanged at **17 routes / 984 rows / 68 tasks**, no unresolved retained rows.
Other remaining routes: P0 Config Provider/Element/Global Style (97 rows, eight unresolved);
P6 Carousel/Watermark/Upload/Calendar/Countdown/Number Animation/Time/Heatmap/Marquee
(232 rows, all unresolved); Equation/QR Code/Legacy Grid/Legacy Transfer remain the four
explicit exclusions (35 rows, zero unresolved). There are **25 unaccepted routes:
21 Planned plus four exclusions**.

**Recommended next: Tree**, to establish native hierarchy/key/focus rules before
Tree Select/Cascader. This commit does not start Tree or any other component; the authorized
sequential migration continues only after this component's separate completed commit.

## Tree — native hierarchy foundation accepted

[Canonical Tree acceptance](../components/tree.md) and [reference tracker](components/tree.md)
close Tree alone. Authored DOM is authoritative: nested lists, native disclosures,
separate selection buttons and native checkboxes, plus an iterative key/parent/child
index over those actual nodes. No ARIA-tree/roving claim, VNode renderer, provider,
treemate, implicit HTTP, drag engine or forced Virtual List composition.

The retained scope includes initial/current expansion and selection, native check/default/
reset state, cascade/mixed/disabled barriers, all/parent/child reports, native label
shortcuts/focus recovery and bounded caller-supplied lazy native nodes. AbortSignal,
generation and actual-node identity protect collapse/removal/refresh/reused-key/dispose
races. Safe batch validation precedes insertion; accepted arrays/disposal are snapshotted.

**119 original section/member/kind/API-line identities + 28 explicit supplements =
147 rows: 60 adapted, 87 omitted; four accepted tasks.** **117 targeted tests** pass
(45 Tree, 45 native Checkbox, 27 existing native/legacy), plus declarations/build/budgets.
Legacy Tree constructors and core/plugins remain unchanged.

Chromium **151.0.7922.174** verified hierarchy/keyboard/native forms, distinct selection
and checks, mixed/disabled/cascade reporting, duplicate/stale/cancelled results, nested
ancestor-cancellation, refreshed labels/focus, RTL/zoom/media/no-JS and ESM/classic/legacy
coexistence. A 500-node native fixture bound in **70.2ms** locally; End reached the last
node in **0.4ms** with **seven computed-style reads**, not a per-row keypress layout scan.
These are observations, not timing guarantees. Final sizes/evidence live in the canonical record.
Tree ESM/classic/CSS are **7,710/7,860/606 gzip bytes**, under independent
**9,000/9,000/1,250** ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**
under the original **15,000/3,000/4,000** ceilings; Virtual List ESM remains **4,149**.

At Tree sign-off: **96 routes / 3,710 rows / 288 of 384 tasks across 72 accepted pages /
96 unchecked tasks**. **P5 remains In progress:** two of ten routes accepted; **622 rows =
86 adapted + 105 omitted + 431 unresolved**. Remaining P5 routes contain **434 rows /
431 unresolved**:

**Cascader, Transfer, Tree Select, Data Table, Log, Infinite Scroll, Popselect, Split.**

P4 is unchanged: **17 routes / 984 rows / 68 tasks**, no unresolved retained rows. P0
Config Provider/Element/Global Style remain (97 rows/eight unresolved); P6's nine
specialized routes remain (232/all unresolved); Equation/QR Code/Legacy Grid/Legacy
Transfer remain four exclusions (35/zero unresolved). **24 unaccepted routes = 20 Planned
+ four exclusions**.

**Next: Cascader, then Tree Select.** Use the actual-node hierarchy/index/loading
contracts where anatomy matches, not a second renderer or competing checkbox owner.
Each chooser still requires its own path/value/popup/keyboard/reset acceptance.
This commit contains Tree and its scoped integration only; the parent continues the
authorized one-component/one-commit sequence afterward.

## Cascader — native dependent paths accepted

[Canonical acceptance](../components/cascader.md) and [reference dispositions](components/cascader.md)
close Cascader alone. It projects a dedicated passive authored Tree hierarchy into stable
native selects, reusing the unchanged real-node index. No Tree/Select owner is stolen,
source form fields are forbidden, and no hidden terminal field or renderer/provider is added.

The retained scope has strict native string keys, one terminal value plus explicit prefix,
leaf/any policy, disabled ancestors, native forms, clear/readout and guarded caller-supplied
lazy nodes. Captured default paths survive switched option families. Native reset is gated
until default descendants are reconstructed; missing defaults never select another branch.
Stale requests also compare actual native select values, not only a cached path.

**69 original section/member/kind/API-line identities + 26 source supplements = 95 rows:
40 adapted + 55 omitted; four accepted tasks.** **212 targeted tests** pass (47 Cascader,
45 Tree, 40 Select, 53 Form, 27 existing native/legacy), together with build/declarations/
budgets and Chromium native path/reset/validation/focus/loading/coexistence evidence.
Original scope/source identities and exact catalog totals were audited.
Optional ESM/classic/CSS are **8,832/8,970/452 gzip bytes** under independent
**10,000/10,000/1,250** ceilings. All **178 prior top-level JS/CSS assets byte-match**
the pre-Cascader build. Core/advanced/widgets remain **14,611/2,181/2,779** under
the original **15,000/3,000/4,000** ceilings; no earlier helper source or budget changed.

At Cascader sign-off: **96 routes / 3,736 rows / 292 of 384 accepted tasks across 73 pages /
92 unchecked**. **P5 remains In progress:** three of ten routes accepted, **648 rows =
126 adapted + 160 omitted + 362 unresolved**. The seven remaining P5 routes contain
**365 rows / 362 unresolved**:

**Transfer, Tree Select, Data Table, Log, Infinite Scroll, Popselect, Split.**

P4 remains unchanged at **17 routes / 984 rows / 68 tasks**, no unresolved retained rows.
P0's three routes remain (97 rows/eight unresolved), P6's nine routes remain (232/all
unresolved), and Equation/QR Code/Legacy Grid/Legacy Transfer remain four exclusions
(35/zero unresolved). **23 unaccepted routes = 19 Planned + four explicit exclusions**.

**Next: Tree Select.** Reuse native key/path indexing and the explicit default, validation
and cancellation contracts where the new chooser's anatomy fits. Do not compose two
owners over the same source or native fields. No Tree Select implementation is included
in this separate Cascader completion commit.

## Tree Select — native single/multiple hierarchy selection accepted

[Canonical acceptance](../components/tree-select.md) and [reference dispositions](components/tree-select.md)
complete Tree Select only. A passive source uses the unchanged Tree index; one Native
Select owner supplies native fields and literal selected-preserving filtering. Full-path
labels, strict leaf/any policy, disabled-path pruning, native defaults/reset and FormData
are explicit. No checkbox cascade/mixed state, popup, provider, tag renderer or virtual list.
Application source loading remains explicit, not fabricated on-load parity.

Teardown reconciles and hands off the **current** native options, selections and surviving
defaults. It does not roll back user choice or resurrect removed data. **87 original
section/member/kind/API-line identities + 33 source supplements = 120 rows: 39 adapted +
81 omitted; four accepted tasks.** **248 targeted tests** pass (36 Tree Select, 45 Tree,
47 Cascader, 40 Select, 53 Form, 27 existing native/legacy), plus declarations/build/budgets.
All **181 prior top-level JS/CSS assets byte-match** the pre-Tree-Select build.
Tree Select ESM/classic/CSS are **8,844/8,977/379 gzip bytes** under independent
**9,000/9,000/1,250** ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**
under the original **15,000/3,000/4,000** ceilings.

Chromium verified native keyboard/labels, multiple FormData, selected-preserving filters,
default/reset/source mutation, disabled-path clearing, focus handoff, narrow/RTL/zoom,
media/no-JS and classic/ESM/core Tree/Select coexistence. Source-renderer and all-browser/
assistive-technology parity are not inferred.

At Tree Select sign-off: **96 routes / 3,769 rows / 296 of 384 tasks across 74 accepted pages /
88 unchecked tasks**. **P5 remains In progress:** four routes accepted; **681 rows =
165 adapted + 241 omitted + 275 unresolved**. Tree-family retained native scopes are
reconciled, while the remaining six P5 routes contain **278 rows / 275 unresolved**:

**Transfer, Data Table, Log, Infinite Scroll, Popselect, Split.**

P4 remains unchanged at **17 routes / 984 rows / 68 tasks**, no unresolved retained rows.
P0's three routes remain (97/eight unresolved); P6's nine routes remain (232/all unresolved);
Equation/QR Code/Legacy Grid/Legacy Transfer remain the four exclusions (35/zero unresolved).
**22 unaccepted routes = 18 Planned + four explicit exclusions.**

**Next: Transfer.** Reuse narrow native option/value/filter ownership where appropriate,
but source/target order and movement must be accepted independently. No Transfer code
is included in this completed Tree Select component commit.

## Transfer — native membership and staging accepted

[Canonical Transfer acceptance](../components/transfer.md) and [reference tracker](components/transfer.md)
close this component alone. Original option nodes move between two unnamed native
multi-selects. Target location is membership, option.selected is staging, option.disabled
locks membership, and filtered bulk scope is explicit. No renderer/drag/virtualization
framework, mandatory Select runtime or hidden form proxy is added.

An exclusive formdata name serializes all target members, including locked/unhighlighted/
filtered members. Native names and staging required flags are rejected rather than
misrepresented or silently removed. Native membership validity, captured membership
defaults, native defaultSelected staging, cancellation and focus/handoff are verified.

**32 original identities + 20 source supplements = 52 rows: 28 adapted + 24 omitted;
four accepted tasks.** **161 tests** pass (41 Transfer, 40 Select, 53 Form, 27 native/legacy),
plus declarations/build/budgets and real Chromium membership/FormData/keyboard/bulk/filter/
locked/reset/focus/name-collision/nesting/RTL/zoom/no-JS/coexistence acceptance.
All **184 prior top-level JS/CSS assets byte-match** the pre-Transfer build.
Transfer ESM/classic/CSS are **5,986/6,125/493 gzip bytes** under independent
**8,000/8,000/1,250** ceilings. Core/advanced/widgets remain **14,611/2,181/2,779**
under the original **15,000/3,000/4,000** ceilings.

Current catalog: **96 routes / 3,789 rows / 300 of 384 tasks across 75 accepted pages /
84 unchecked**. **P5 remains In progress:** five of ten routes accepted; **701 rows =
193 adapted + 265 omitted + 243 unresolved**. Remaining five P5 routes contain
**246 rows / 243 unresolved**:

**Data Table, Log, Infinite Scroll, Popselect, Split.**

P4 remains 17 routes/984 rows/68 tasks, no unresolved retained rows. P0's three routes
remain (97/eight unresolved), P6's nine remain (232/all unresolved), and Equation/QR Code/
Legacy Grid/Legacy Transfer remain four exclusions (35/zero unresolved).
**21 unaccepted routes = 17 Planned + four explicit exclusions.**

**Next: Data Table.** Reuse native membership/selection ownership concepts only where
the row/column/form contract fits; no Data Table implementation is included in this
separate Transfer completion commit.

## Data Table — original native rows and local operations accepted

[Canonical Data Table acceptance](../components/data-table.md) and the
[complete reference tracker](components/data-table.md) close this component alone.
Original native table/caption/headers/rows/cells/forms/footer spans remain. Stable string
keys and explicit finite-number comparators/boolean predicates stage single sort, local
filters/page controls and scoped native checkbox selection before committing owned changes.
No renderer, treegrid, virtual tbody, fetch engine, silent field disabling or hidden proxy.

Hidden native fields still submit and validate. The demo gates its submit handler by
clearing sort/filter/page hiding before native reportValidity; incomplete numeric edits
can therefore be revealed/focused. DefaultChecked/reset, disabled selection, original-node
focus/edits/listeners, natural source-order refresh, errors and non-resurrecting handoff
have targeted regression coverage. Body spans/grouped enhanced headers, remote/virtual/
drag/resize/CSV/renderer APIs are explicitly omitted, not silently advertised.

**147 original identities + 64 source-only supplements = 211 rows: 76 adapted +
135 omitted; four accepted tasks.** **252 targeted tests** including 62 Data Table cases,
declarations/build/budgets and Chromium real keyboard/aria-sort/FormData/reveal/reset/
focus/scroll/RTL/zoom/print/no-JS/coexistence acceptance.
The measured maximum 2,000-row native fixture retained all original mounted rows,
20 visible rows, 100 local pages, two pager buttons and 2,000 native selected FormData
entries. This is bounded local paging, not virtualization or a throughput guarantee.

Data Table ESM/classic/composed CSS are **7,305/7,441/1,496 gzip bytes**, under independent
**9,000/9,000/2,000** ceilings. All **187 prior JS/CSS assets byte-match**. Existing
core/advanced/widgets remain **14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings.
No existing asset, budget, runtime dependency or legacy constructor changed.

Current catalog: **96 routes / 3,853 rows / 304 of 384 tasks across 76 accepted pages /
80 unchecked**. **P5 remains In progress:** six of ten routes accepted; **765 rows =
269 adapted + 400 omitted + 96 unresolved**. Four remaining P5 routes have **99 rows /
96 unresolved**: **Log, Infinite Scroll, Popselect, Split**.

P4 stays 17 routes/984 rows/68 tasks with no unresolved retained rows. P0's three routes
remain (97/eight unresolved), P6's nine remain (232/all unresolved), and four exclusions
remain (35/zero unresolved). **20 unaccepted routes = 16 Planned + four explicit exclusions.**

**Next: Log.** Preserve native text/scroll/lifecycle ownership and perform its own
acceptance; no Log or later collection implementation is included in this commit.

## Log — bounded native retained text accepted

[Canonical Log acceptance](../components/log.md) and [complete reference tracker](components/log.md)
close this component only. Native pre/code and actual line/Text nodes preserve full retained
selection/find/printing. LF/CRLF/lone-CR normalization and split-CR settlement, partial append,
stable keys, whole-head retention, display trim, explicit clear/replace generations, loading,
native scroll context and selection-safe conditional follow have separate contracts.

No highlighter/terminal/ANSI execution, autolinks, producer/fetch/socket/file/clipboard/download
effects or duplicate virtual-window engine is added. Code CSS is reused unchanged. All
retained records stay mounted, capped at 10,000 lines/1,000,000 UTF-16 units with a 16,384-unit
line bound. Native selection guards reject affected updates for explicit application retry
rather than silently dropping data. Passive edge observations do not request network work.

**21 original identities + 25 source-only supplements = 46 rows: 19 adapted + 27 omitted;
four accepted tasks.** **98 tests** pass (59 Log, 12 Code, 27 native/legacy), plus
declarations/build/budgets and real Chromium large-fixture/selection/find/append/retention/
follow/scroll/resize/long-line/RTL/zoom/print/no-JS/coexistence acceptance.

The 10,000-record fixture had **10,000 line spans, 10,000 source Text nodes, 377,055 units
and 175,016px native extent**. Twenty 25-record batches retained the exact line cap;
measured p50/p95/max batch times were **192.7/292.4/354.7ms**. These full-DOM costs are
documented, not disguised as a virtual-window or high-throughput guarantee.

Log ESM/classic/composed CSS: **4,774/4,920/1,319 gzip bytes**, under new independent
**6,000/6,000/1,750** ceilings. **All 190 previous JS/CSS assets byte-match**.
Core/advanced/widgets remain **14,611/2,181/2,779** under their original ceilings.
No previous helper source/budget, dependency or constructor changed.

Current catalog: **96 routes / 3,878 rows / 308 of 384 tasks across 77 accepted pages /
76 unchecked**. **P5 remains In progress:** seven of ten routes accepted; **790 rows =
288 adapted + 425 omitted + 77 unresolved**. Remaining P5: **Infinite Scroll, Popselect,
Split**, with **78 rows / 77 unresolved**.

P4 remains 17 routes/984 rows/68 tasks, no unresolved retained rows. P0's three routes
remain (97/eight unresolved), P6's nine remain (232/all unresolved), and four exclusions
remain (35/zero unresolved). **19 unaccepted routes = 15 Planned + four explicit exclusions.**

**Next: Infinite Scroll**, with its own native sentinel/request/backpressure lifecycle,
then Popselect and Split. No Infinite Scroll implementation is included in this separate
Log component commit.

## Infinite Scroll — native sentinel and serialized loading accepted

[Canonical Infinite Scroll acceptance](../components/infinite-scroll.md) and
[reference tracker](components/infinite-scroll.md) close this component alone. Authored
content/items/forms remain application-owned. Native IntersectionObserver page/element
roots and bottom distance complement a real manual button, six authored status messages
and a reachable footer/static fallback. No HTTP, renderer or mandatory virtualization.

Explicit added/hasMore/guarded synchronous commit replaces void/silent-error completion.
One pending loader includes unacknowledged cancellation; settings/reset/root/native-disable/
dispose generations block stale commits/errors. No-progress and failures pause automatic
loading. One load per visible entry and a default three/max twenty automatic requests per
reset prevent unbounded underfill; manual loading does not renew the budget.

**Three original identities + four source-only supplements = seven rows: four adapted +
three omitted; four accepted tasks.** **139 tests** pass (59 Infinite Scroll, 53 existing
native-attribute/Popover and 27 native/legacy), plus declarations/build/budgets and Chromium
actual intersections/threshold/manual/underfill/no-growth/error/ignored-abort/root/nesting/
fieldset/focus/footer/RTL/zoom/print/fallback/coexistence evidence.
The 40px-outside-root fixture did not load at distance 0 and loaded once at distance 64;
maximum observed active load count stayed **one**, including cancellation races.

ESM/classic/CSS are **4,627/4,761/462 gzip bytes** under new **7,000/7,000/1,000** ceilings.
All **193 prior top-level JS/CSS assets byte-match**. Core/advanced/widgets remain
**14,611/2,181/2,779** under original ceilings; no prior component/helper source or budget
changed. The existing owned-attribute lease was reused without a mandatory Popover runtime.

Current catalog: **96 routes / 3,882 rows / 312 of 384 tasks across 78 accepted pages /
72 unchecked**. **P5 remains In progress:** eight of ten routes accepted; **794 rows =
292 adapted + 428 omitted + 74 unresolved**. Remaining **Popselect and Split** contain
**75 rows / 74 unresolved**.

P4 stays 17 routes/984 rows/68 tasks, no unresolved retained rows. P0's three routes remain
(97/eight unresolved), P6's nine remain (232/all unresolved), and four exclusions remain
(35/zero unresolved). **18 unaccepted routes = 14 Planned + four explicit exclusions.**

**Next: Popselect, then Split.** No later collection implementation is included in this
separate Infinite Scroll component commit.

## Popselect — composed native selection disclosure accepted

[Canonical Popselect acceptance](../components/popselect.md) and [full inherited tracker](components/popselect.md)
close this component only. Existing Popover/Select helpers retain original native select/
option/optgroup/name/defaultSelected/required/fieldset semantics. The popup is a labelled
region containing a native listbox, not a fake combobox/menu or option renderer.

Selection is immediate in single/multiple modes. Arrow/typeahead/change does not close;
Done/Escape/outside close without a rollback model. Silent setters/reset/readout, native
clear notifications, nested focus recovery and explicit first-invalid-field reveal are
accepted. Quiet validation does not open or focus a peer. No-JS/unsupported/disconnected
controls stay inline and usable; CSS zoom outside the reused positioner's contract is
rejected with a safe inline handoff instead of modifying the near-full Popover base.

**56 original identities (13 local + 43 inherited) + 23 source-only supplements = 79 rows:
38 adapted + 41 omitted; four accepted tasks.** **181 tests** pass (35 Popselect,
53 Popover, 40 Select, 53 Form), plus declarations/build/budgets and Chromium native
keys/Done/single/multi/clear/disabled/defaults/forms/quiet-reveal/nesting/focus/placement/
fallback/RTL/media/coexistence acceptance. All 2,000 original options survived the bounded
fixture. Visual-viewport scale 2 stayed bounded; CSS zoom 2 deliberately exposed inline choices.

Popselect ESM/classic/composed CSS: **9,380/9,507/1,674 gzip bytes**, under independent
**10,000/10,000/2,500** ceilings. All **196 prior JS/CSS assets byte-match**. Core/advanced/
widgets remain **14,611/2,181/2,779** under their original ceilings. No existing Popover,
Select, Form or other component source/budget changed.

Current catalog: **96 routes / 3,905 rows / 316 of 384 tasks across 79 accepted pages /
68 unchecked**. **P5 remains In progress:** nine of ten routes accepted; **817 rows =
330 adapted + 468 omitted + 19 unresolved**. Remaining **Split: 19 rows / 19 unresolved**.

P4 stays 17 routes/984 rows/68 tasks with no unresolved retained rows. P0's three routes
remain (97/eight unresolved), P6's nine remain (232/all unresolved), and four exclusions
remain (35/zero unresolved). **17 unaccepted routes = 13 Planned + four explicit exclusions.**

**Next: Split.** Resolve its own native layout/resize/keyboard/focus contract and acceptance;
no Split implementation is included in this separate Popselect completion.

## Split accepted — retained P5 phase audit closed

[Canonical Split acceptance](../components/split.md) and [reference tracker](components/split.md)
complete the final Planned P5 route. Two original named pane regions and an owned separator
use native grid, explicit ratio/decimal-pixel current/default/bounds, correct physical
keyboard/RTL orientation, scoped pointer capture and final pointerup processing.
Collapsed fields are hidden/inert rather than disabled; explicit reveal gates native
validation. Infeasible layouts stack readable content, and print suspends/resumes rather
than invalidating an otherwise healthy grid.

**19 original identities + ten source-only supplements = 29 rows: 19 adapted + ten omitted;
four accepted tasks.** Split/layout coverage includes 98 tests. The complete retained
P5 gate passed **526 tests across 13 files**: 476 tests for all ten P5 components plus
50 Grid/Layout/native tests. Build/declarations/budgets and actual Chromium pointer/keys/
capture/cancellation/RTL/zoom/scale/hidden/forms/print/fallback/coexistence were accepted.

Split ESM/classic/CSS: **6,169/6,311/773 gzip bytes** under new **8,000/8,000/1,500** limits.
All **199 prior JS/CSS assets byte-match**. Core/advanced/widgets remain
**14,611/2,181/2,779** under **15,000/3,000/4,000** ceilings. No prior component/helper
source, budget or dependency changed.

### All P5-assigned rows and tasks

The audit read each of the ten canonical/reference pairs and counted every inventoried
row by resolved disposition, rather than promoting the phase from a single working demo.
All 79 P5 canonical/reference relative file links resolve.

| Route | Rows | Adapted | Omitted | Unresolved | Accepted tasks |
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
| **Total** | **827** | **349** | **478** | **0** | **40** |

**P5 is 🟢 Verified for its retained native scopes and explicit omissions.** There are no
Planned P5 routes or unresolved P5 rows. This does not implement the omitted framework,
renderer, terminal, arbitrary geometry, remote or rich virtual-grid APIs.

Current catalog: **96 routes / 3,915 rows / 320 of 384 tasks across 80 accepted pages /
64 unchecked**. P4 remains 17 routes/984 rows/68 tasks with no unresolved retained rows.
**16 unaccepted routes = 12 Planned + four explicit exclusions**:

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0/configuration | Config Provider, Element, Global Style | 97 / 8 |
| P6 | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommended next:** resolve Config Provider, Element and Global Style before P6 where
shared native CSS custom-property/theme context and element/style lifetime will reduce
repetition. Keep this narrow and native: no new provider framework, global reset or
automatic application layout model. No next component is implemented in this commit.

## Config Provider acceptance — native scoped composition, no new runtime

[Canonical contract/evidence](../components/config-provider.md) and
[reference tracker](components/config-provider.md) resolve this P0 catalog scope through
actual native ancestors, external author tokens/media queries, lang/dir and explicit
existing service options. This follows Discrete's composition precedent, not a provider
facsimile. No src module, registration, new export, dependency, distribution asset or budget
is added. The demo has separate HTML/CSS/JS and uses existing Button/Card CSS, Loading Bar
owners and a native dialog; it does not import the aggregate in the normal/CSP path.

**95 original identities + 22 explicit source supplements = 117 rows: eight adapted,
109 omitted, zero unresolved; four page tasks accepted.** Source-only default slot,
bordered/rtl/hljs/icons/deprecated-as, theme/RTL/type boundaries and mounting/injection
limitations are explicit. Locale dictionaries, date-format engines, KaTeX, VNode callbacks,
component defaults, class-prefix rewriting and renderer/SSR/hydration machinery are not
replaced by a hidden native configuration framework.

Acceptance: **86 tests** (12 composition + 47 Loading Bar + 27 native/legacy),
declarations/build and all budgets pass. **All 1,142 pre-existing distribution files
byte-match**. Chromium verified actual consumer appearances, inherited/nested/independent
scopes, token removal/reparenting, class/inline precedence, four palette policies/system
media, lang metadata versus explicit helper labels, native modal ancestry/hosts/focus/
Escape/close, separate documents, 320px/2x zoom, forced colors, strict external-CSS CSP,
no-JS controls and separate legacy apply/register coexistence. Disconnect leaves no owned
loading states, restores native progress 25/40/60, retains author settings and hands off
focus before hiding controls. No native-picker-language, blanket theme/JS reactivity,
all-browser/AT or framework parity is claimed.

Existing consumer JS+CSS is **6,802 gzip bytes**, excluding application demo HTML/CSS/JS;
no artificial config bundle disguises those costs. Core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes** under **15,000/3,000/4,000**. Other helpers and their
budgets are unchanged. Legacy theme.apply/register remain compatible and inline;
legacy theme.set persistence is unchanged and is never used by the demo.

Current catalog: **96 routes / 3,937 rows / 324 of 384 tasks across 81 accepted pages /
60 unchecked**. Retained P5 remains **827 rows / 349 adapted / 478 omitted / 40 tasks**,
with zero unresolved. **15 unaccepted routes = 11 Planned + four explicit exclusions**:

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0/configuration | Element, Global Style | 2 / 1 |
| P6 | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

All three P0 catalog routes contain **119 rows: eight adapted, 110 omitted, one unresolved**;
**four of twelve page tasks** are accepted. Global Style has no API table rows but still
has four outstanding tasks. Broader architectural P0 gates are not automatically closed.
**Next: Element, then Global Style, before P6**, with their own acceptance and commits.

## Element acceptance — native tags, children and explicit tokens

[Canonical Element evidence](../components/element.md) and
[reference tracker](components/element.md) close this P0 catalog scope without a native
tag factory, custom-element wrapper, provider or new runtime. Real HTML owns semantics,
children, attributes and native actions/forms; author CSS consumes explicit supported
tokens. The demo reuses Config Provider's unchanged application palette stylesheet instead
of copying a second palette. Existing MuiElement is an abstract controller base, not a
new wrapper/theme-vars equivalent.

**Two original identities + ten explicit source supplements + three source-inherited
theme props = 15 rows: three adapted, twelve omitted, zero unresolved; four tasks accepted.**
Source automatic role none, generated class prefixes/theme mounting, renderer aliases,
theme object props and common-theme interfaces/variable generation are omitted. There
is no automatic upstream --primary-color/--n-* to --mui-* aliasing or theme parity.

**51 tests passed** (12 Element, 12 Config Provider and 27 native/legacy). Declarations,
build and all budgets pass; **all 1,142 existing distribution files byte-match**.
Chromium verifies actual native heading/link/button/group semantics, fragment focus,
Space/Enter activation, labelled/disabled native fields, validation focus and literal
local FormData preview/reset. Authored children/listeners/values remain stable across
scope changes/disconnect. Actual inside/outside/nested appearances, explicit light/
removal, local/inline overrides, media/RTL, hidden/disclosure, 320px/2x zoom,
forced colors/print, strict external-CSS CSP (including form-action none), no-JS native
editing/Enter/reset/disclosure and separate legacy coexistence all pass.

No source/runtime/registration/export/distributed CSS/JS/budget was added. The normal
demo imports no library JS; its three new application files plus the unchanged reused
configuration CSS cost **11,942 raw / 4,184 gzip bytes**. Core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes** under **15,000/3,000/4,000**. No dependencies,
storage, backend submission, clipboard or OS effects were added.

Current catalog: **96 routes / 3,950 rows / 328 of 384 tasks across 82 accepted pages /
56 unchecked**. Retained P5 remains **827 rows / 349 adapted / 478 omitted / 40 tasks**.
**14 unaccepted routes = ten Planned + four explicit exclusions**:

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P0/configuration | Global Style — four outstanding tasks despite zero API rows | 0 / 0 |
| P6 | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

P0's three catalog pages now have **132 rows: eleven adapted, 121 omitted, zero unresolved**,
but only **eight of twelve page tasks** are accepted. Zero unresolved property rows does
not close Global Style's four tasks or the broader architecture gates. **Next: Global
Style**, separately before P6; this commit does not implement that document-wide policy.

## Global Style acceptance — explicit document CSS and route audit

[Canonical Global Style contract/evidence](../components/global-style.md) and
[source-only reference tracker](components/global-style.md) close this scope through one
explicitly linked CSS asset. Zero-specificity html/body rules consume existing typography/
color tokens with native system-color fallbacks, intentionally default body margin to zero,
and support forced-colors/print without introducing global motion or a universal reset.
Author rules/inline styles retain normal cascade precedence; disable/removal exposes
remaining styles without a runtime owner or overwrite-based restoration.

The English page still has **zero public API table rows**. **16 explicit source
effect/lifecycle/export supplements: seven adaptations, nine omissions, zero unresolved**
and four accepted tasks record the real boundary. Provider injection/watchers, first-owner
body markers, timed transition, padding/text-adjust/tap-highlight resets, rendering/SSR
adapters and runtime component exports are omitted.

Delivery is CSS only: `@dataengine/markup-ui/global-style/style.css` →
`dist/markup-ui-global-style.css`, **661 raw/310 gzip bytes**, ceiling **500**.
No component/core/plugin automatically imports it. No new JS/global/registration bundle,
dependency, second full palette or source CSS-in-JS string is added.
The full six-file local example is **20,267 raw/5,953 gzip bytes**, including application
controls and the selected existing Card/configuration CSS; no library JS is normally loaded.

**77 tests passed** across Global Style (12), Config Provider (12), Element (12),
Discrete (14) and native/legacy (27). Build/declarations and all budgets pass.
**All 1,141 previous non-manifest distribution files byte-match**; every old manifest
entry is unchanged. One CSS file and its manifest/export entry are added.
Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes** under **15,000/3,000/4,000**.
No existing helper budget is relaxed.

Chromium confirms linked/disabled/removed/reinserted/duplicate-link cascade, body author/
inline overrides, native asynchronous stylesheet readiness, actual body fonts/colors
versus scoped Card/native controls, system/light/dark/native schemes, native semantics/
FormData/constraints/reset/disclosure/hidden, 320px/2x zoom, forced colors/print and no
body animation/scroll locks. Strict external CSS/script CSP passes with no inline style
nodes/attributes; no-JS native UI and document styling remain usable. Separate legacy
import/apply coexistence leaves body unstyled until this link is enabled and consumes
existing root tokens only through explicit CSS. No all-browser/AT, printer/device or
framework/theme-variable parity is claimed.

### Requested component-route audit, not global P0 completion

| Route | Actual phase | Rows | Adapted | Omitted | Unresolved | Accepted tasks |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Config Provider | P0 | 117 | 8 | 109 | 0 | 4/4 |
| Element | P0 | 15 | 3 | 12 | 0 | 4/4 |
| Global Style | P0 | 16 | 7 | 9 | 0 | 4/4 |
| **Strict P0 catalog subtotal** | P0 | **148** | **18** | **130** | **0** | **12/12** |
| Discrete API | P3, related audit | 28 | 7 | 21 | 0 | 4/4 |
| **Four-route total** | P0 + related P3 | **176** | **25** | **151** | **0** | **16/16** |

Discrete retains its existing P3 assignment; its four tasks are not counted twice.
All four route inventories have exact dispositions and linked evidence. This is scoped
native acceptance, not injected locale/theme/provider or rendering compatibility.
All **550 scoped documentation file links** and **125 four-route canonical/reference
file links** resolve; the three previously accepted reference inventories are unchanged.

### Outstanding foundation task IDs and compatibility exceptions

The P0 task table above remains authoritative and **none of its broad task IDs is
promoted to Verified by this component audit**:

| IDs | Remaining broader work / exception |
| --- | --- |
| P0-01 | Legacy core/plugin authored CSS still resides in TypeScript; one new body stylesheet is not extraction of `styles.ts`, advanced.ts or widgets.ts. |
| P0-02 | Default aggregate still automatically registers elements and installs styles; full separated aggregate/classic/ESM packaging is distinct from existing optional external-CSS entries. |
| P0-03, P0-04, P0-05 | Retained scopes establish concrete native adoption/events/forms evidence, but remaining catalog/legacy baseline conventions and exceptions are not globally signed off. |
| P0-06 | Native scoped/document CSS is accepted; full shared named-theme/palette extraction and all-consumer coverage remain incomplete. Legacy theme.apply writes inline tokens; theme.set retains storage/global subscriber behavior. |
| P0-07 | Existing and new CSS budgets are enforced; full catalog loading/accounting including future P6 assets is still a broader gate. |
| P0-08 | All retained implemented routes are reconciled, but nine P6 routes still contain 232 unresolved rows. |
| P0-09 | P6 browser primitive/support/ownership choices and acceptance remain component-specific work. |

Legacy [core styles](../../src/components/styles.ts), [advanced](../../src/plugins/advanced.ts)
and [widgets](../../src/plugins/widgets.ts) retain style-string installation for compatibility.
The [default entry](../../src/index.ts) still installs styles; the
[theme API](../../src/theme/index.ts) retains inline and optional persistence semantics.
These unchanged paths are **not** represented as the strict-CSP external stylesheet path.
The new CSS does not remove legacy defaults, force global form styles or make P6 ready
without its own scoped design and testing.

Current catalog: **96 routes / 3,966 rows / 332 of 384 tasks across 83 accepted pages /
52 unchecked**. Retained P5 is unchanged: **827 rows / 349 adapted / 478 omitted /
zero unresolved / 40 accepted tasks**. Remaining **13 routes = nine Planned P6 +
four explicit exclusions**:

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 | Carousel, Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 232 / 232 |
| Explicit exclusions | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommend Carousel next (P6-03).** Its retained prerequisites—native buttons, focus/motion
contracts and optional budgets—are available. Begin with a readable authored slide list,
native scrolling/scroll snap and manual previous/next controls, preserving slide/focus
identity; make autoplay optional with explicit pause policies and bound drag/effects
separately. Existing widgets behavior is only a legacy baseline.
**No P6 implementation is included in this Global Style commit.**

## Carousel acceptance — first main P6 specialized route

[Canonical Carousel/CarouselItem](../components/carousel.md) and its
[complete reference](components/carousel.md) close the retained native scope with
original authored slides, single-slide layout, native touch/wheel/snap, real labelled
controls, actual/default/pending-target indices, direction/RTL, wrap commands and
bounded completion. Autoplay is opt-in with explicit pause/play and persistent user
pause, plus focus/hover/visibility/motion/layout/lifetime gates. No cloned infinite
track, VDOM/provider, gesture/animation package or default-graph dependency is added.

**41 original rows + six source additions + three source-inherited theme props =
50 rows: 35 adapted + 15 omitted, zero unresolved; 4/4 tasks accepted.**
Source CarouselItem content/context is explicitly represented by original native
children and current/previous/next/index markers. Multi-slide/variable-width/
centered/spacing/drag/effects and transition/theme framework bags are scoped out.
Inactive slides remain focusable/readable/form-participating; native validation
and focus can reveal them. Commands wrap between native extents, not seamless swipe.

**73 tests pass** (46 Carousel + 27 native/legacy), declarations/build and every
existing/new budget pass. New level-nine gzip assets: **5,367 ESM / 5,509 classic /
656 CSS**, combined **6,023 / 6,165** JS+CSS; ceilings **7,000 / 7,000 / 1,500**.
Core/advanced/widgets stay **14,611 / 2,181 / 2,779**, with unchanged
**15,000 / 3,000 / 4,000** ceilings and zero runtime dependencies.

Dedicated Chromium evidence covers native wheel/touch snap, keyboard/button activation,
rapid command completion, focused disabled boundaries, nested ownership, native
validation reveal/FormData/listeners, resize/closed-details/RTL/vertical/CSS zoom,
autoplay user/focus/hover pause, reduced motion, no-JS scrolling/hidden enhancement
controls and ESM/classic/unchanged legacy widgets coexistence. Numeric observations
and browser/AT/geometry limitations are recorded in the canonical acceptance.

**Current catalog: 96 routes / 3,975 rows / 336 of 384 accepted tasks across 84 pages /
48 unchecked. P6: 241 rows = 35 adapted + 15 omitted + 191 unresolved; one of nine
routes accepted.** P2–P5 and the three P0 component-route resolutions are unchanged.
P0-01–P0-09 retain their statuses; legacy CSS extraction, aggregate auto-install and
inline-theme compatibility exceptions are not globally fixed by this component.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (8 Planned) | Watermark, Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 191 / 191 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Recommend Watermark next (P6-04):** existing optional external-CSS/loading and native
ownership conventions are ready for a separately bounded decoration/accessibility
scope. Time/Number Animation/Countdown may later justify shared temporal primitives,
but none is started in this Carousel commit.

## Watermark acceptance — bounded native decoration

[Canonical Watermark](../components/watermark.md) and its
[complete reference](components/watermark.md) close the second retained P6 route:
one bounded native Canvas PNG and one authored decorative/pointer-transparent overlay,
literal text or caller-owned images, useful font/rotation/gap/phase/cross/opacity/debug
and constrained local/viewport-fixed placement. No per-tile DOM renderer, automatic
containing-block rewrite, image/credential transport, anti-tamper observer, global
storage, clipboard/screen capture or security/DRM promise is introduced.

**27 original rows + one source fontStretch supplement + three source-inherited theme
props = 31 rows: 26 adapted + five omitted, zero unresolved; 4/4 tasks accepted.**
Global layer rotation, selection suppression and provider/theme bags are explicit
omissions. Native pixels require explicit colors/fonts, proper image/CORS permissions
and a separately readable classification when meaningful.

**88 tests pass** (61 Watermark + 27 native/legacy), declarations/build and every old/new
budget pass. Level-nine gzip: **5,755 ESM / 5,889 classic / 319 CSS**, combined
**6,074 / 6,208** JS+CSS, under **7,000 / 7,000 / 1,000** ceilings. The complete local
example including HTML/CSS/JS/original SVG is **10,498** gzip bytes. Prior exports and
budgets are unchanged. Core/advanced/widgets stay **14,611 / 2,181 / 2,779** under
**15,000 / 3,000 / 4,000**; prior Carousel stays **5,367 / 5,509 / 656**.

Dedicated native Chromium checks inspected actual generated text/image pixels,
rotation/repetition/cross/debug, DPR2/fonts, original text selection/controls/forms/
listeners, loader/serialized-PNG races, actual decode/tainted-Canvas errors, prior-tile
retention and owned URL release. Resize/RTL/CSS zoom and inner versus self-scroller/
fixed coverage limits were observed. Print/forced-colors omit decoration; strict
external-script/style CSP with blob images, no-JS fallback, classic generation and
unchanged legacy coexistence passed. No all-browser/AT, universal top-layer/print,
font/theme or screen-protection parity is claimed.

**Current catalog: 96 routes / 3,979 rows / 340 of 384 accepted tasks across 85 pages /
44 unchecked. P6: 245 rows = 61 adapted + 20 omitted + 164 unresolved; two of nine
specialized routes accepted.** P2–P5 and the three P0 catalog-route resolutions are
unchanged. Broad P0-01–P0-09 task states stay open/partial: legacy stylesheet extraction,
aggregate auto-install and inline-theme compatibility exceptions are not closed here.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (7 Planned) | Upload, Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 164 / 164 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Upload (P6-02).** Native file selection and an explicit bounded application
transport/cancellation contract are dependency-ready. No Upload code is included;
this commit completes only Watermark and its owned integration/status records.

## Upload acceptance — native files and an honest transport pool

[Canonical Upload/Trigger/Dragger](../components/upload.md) and its
[complete reference](components/upload.md) close the third retained P6 route. Original
native chooser/form/disabled/reset ownership, real synchronized FileList membership,
atomic append/replacement/rejection, stable authored template rows and bounded explicit
caller transport are implemented. Start/cancel/retry/remove/clear, byte/indeterminate
progress, native focus and flat drop remain small local capabilities, not a provider/
renderer/HTTP framework or directory crawler.

**95 original identities + three source/type supplements + three inherited theme
props = 101 rows: 57 adapted + 44 omitted, zero unresolved; 4/4 tasks.** Endpoints,
methods/headers/credentials/data forwarding, preloaded remote file metadata, preview/
download/object URLs, async veto pipelines and theme graphs are explicitly omitted.
Accept/metadata limits are UX, not server/content security.

**85 tests pass** (58 Upload + 27 native/legacy), declarations/build and all prior/new
budgets pass. Level-nine gzip: **7,727 ESM / 7,855 classic / 560 CSS**, combined
**8,287 / 8,415** under **9,000 / 9,000 / 1,250** ceilings. Full local ESM example
including two tiny acceptance fixtures: **12,398** gzip bytes. Prior exports/budgets
are unchanged; core/advanced/widgets remain **14,611 / 2,181 / 2,779**, with
**15,000 / 3,000 / 4,000** ceilings unchanged.

Dedicated Chromium selection used only committed local text fixtures or new in-memory
Files; no OS chooser, user files, actual network upload or download. Native FileList/
FormData, duplicate/limit/removal/clear, failed first attempt/retry, cancellation slots,
focused action disabling/removal, native reset/cancelled reset, external form/modal,
drop, RTL/zoom/narrow/media, no-JS/missing-DataTransfer fallback, strict CSP with
connect-src:none and classic/advanced coexistence were verified. Native reset-button
testing found and fixed a microtask-before-default-action bug; a single task now reads
post-reset native membership and holds completions without polling.

Abort does not free actual concurrency or undo server effects. Removed/disconnected
ignored-abort transports retain slots/ownership until real settlement, with no stale
progress/completion into reused rows. Reentrant callback/result mutations are guarded;
unknown response data is never markup, navigation or native File content.

**Current catalog: 96 routes / 3,985 rows / 344 of 384 accepted tasks across 86 pages /
40 unchecked. P6: 251 rows = 118 adapted + 64 omitted + 69 unresolved; three of nine
specialized routes accepted.** Broad P0-01–P0-09 task states and legacy CSS extraction/
auto-install/inline-theme exceptions remain independently open or partial. Previous
P2–P5 and P0 component-route acceptance remains unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (6 Planned) | Calendar, Countdown, Number Animation, Time, Heatmap, Marquee | 69 / 69 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Calendar (P6-01).** Existing native date/control contracts support a separately
bounded authored calendar/date grid. No Calendar code is included in this Upload commit.

## Calendar acceptance — native Gregorian dates and table focus

[Canonical Calendar](../components/calendar.md) and the [complete reference](components/calendar.md)
close the fourth retained P6 route: a native captioned six-week table with type=button
dates and month/year controls, canonical date-only selection/defaults, independent
roving focus, explicit Today/first weekday/locale and safe synchronous annotations.
Only Date Picker's canonical native validator is reused; private Gregorian arithmetic
and explicit Gregorian/UTC label carriers avoid local DST and Date.UTC's year 0–99 trap.

**14 original identities + three explicit missing slot inline fields + three source
alias/behavior supplements + three inherited theme rows = 23 rows: 20 adapted +
three omitted, zero unresolved, 4/4 tasks.** No timestamp ABI, date-fns/formatter-token
or provider/VNode parity is implied. Today is supplied by the application; no global
clock timer/polling, date-picker UI, grid-role assertion or hidden form field is added.

**157 tests pass** (54 Calendar + 76 shared Date Picker + 27 native/legacy), declarations/
build and all budgets pass. Level-nine gzip: **7,438 ESM / 7,570 classic / 640 CSS**;
combined **8,078 / 8,210** under **8,000 / 8,000 / 1,250** ceilings. Full three-file
local ESM example: **12,015** gzip bytes. Existing Date Picker remains **3,967**;
core/advanced/widgets remain **14,611 / 2,181 / 2,779** under unchanged
**15,000 / 3,000 / 4,000** ceilings. Prior exports/budgets/sources are preserved.

Real Chromium verified native table/caption/columnheader/button AX, one date tab stop,
arrows/Home/End/Page/Shift-Page, Enter/Space exactly once, selection versus focus,
adjacent/leap/century/year1/9999 transitions, all-disabled/one-day policies, atomic
annotation failure, original heading/ARIA/fallback, external focus/forms, RTL/zoom/
narrow/media/no-JS and strict CSP. A Buddhist locale preference still yielded Gregorian
2024; explicit app-local Today differed correctly between +08:00 and America/New_York,
without changing the Gregorian grid. Classic/native Date Picker and unchanged advanced
plugin coexistence passed. No all-browser/AT, native OS picker, print or timezone-parity
claim is inferred from that evidence.

**Current catalog: 96 routes / 3,994 rows / 348 of 384 accepted tasks across 87 pages /
36 unchecked. P6: 260 rows = 138 adapted + 67 omitted + 55 unresolved; four of nine
specialized routes accepted.** Previous P2–P5/P0 component-route resolutions remain
unchanged. Broad P0-01–P0-09 and legacy stylesheet extraction/auto-install/inline-theme
exceptions stay open or partial, not completed by this component.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (5 Planned) | Time, Countdown, Number Animation, Heatmap, Marquee | 55 / 55 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Time**, to establish explicit native formatting policy, then Countdown/
Number Animation as their real shared temporal needs justify. Calendar date-only
strings are not silently promoted to instants. Heatmap and Marquee remain separate;
no next route is implemented in this Calendar commit.

## Time acceptance — explicit instants and native text

[Canonical Time](../components/time.md) and the [complete reference](components/time.md)
close the fifth retained P6 route: pure Intl.DateTimeFormat/RelativeTimeFormat plus
an optional existing native time/Text-node owner. Date or integer epoch inputs are
explicit, zero/negative/units/year/locale/timezone/options validated, and machine
datetime/visible text are paired. Calendar/date-picker floating values are not
silently parsed as instants. No token/date dependency, provider, VNode renderer,
global clock service, storage/network or injected role/live region exists.

**Six original identities + three explicit source supplements = nine rows:
seven adapted + two omitted, zero unresolved; 4/4 tasks.** Native Intl options replace
format tokens; locale/dateLocale provider graphs remain omitted. Static references,
opt-in live clock references and fixed elapsed relative units have explicit contracts.

**93 tests pass** (66 Time + 27 native/legacy); declarations/build and all budgets pass.
Level-nine gzip: **4,767 ESM / 4,892 classic / 139 CSS**, combined **4,906 / 5,031**;
ceilings **6,000 / 6,000 / 500**. Full three-file local ESM example: **8,670** gzip bytes.
Prior exports/budgets stay unchanged; core/advanced/widgets remain
**14,611 / 2,181 / 2,779** under **15,000 / 3,000 / 4,000**.

Native Chromium verified zero/negative/year1, DST fold zone/instant agreement,
Gregorian locale override, static/live text, selection/focus pause and paired deferral,
original Text/prefix identity, no redundant writes, hidden-element reveal, RTL/zoom/
media/no-JS, strict CSP and classic/unchanged Time Picker coexistence. Deterministic
tests cover document-hidden resumption, boundary timers, errors and reentrancy. The
headless tab experiment did not expose document.hidden and is not promoted to browser
evidence. No all-browser/AT/token or timezone-calendar relative arithmetic claim.

**Current catalog: 96 routes / 3,997 rows / 352 of 384 accepted tasks across 88 pages /
32 unchecked. P6: 263 rows = 145 adapted + 69 omitted + 49 unresolved; five of nine
specialized routes accepted.** Broad P0-01–P0-09 and legacy extraction/auto-install/
inline-theme exceptions remain open/partial; prior P2–P5/P0 component routes are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (4 Planned) | Countdown, Number Animation, Heatmap, Marquee | 49 / 49 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Countdown**, then Number Animation. Share concrete owned text/timing behavior
only when their actual contracts need it; do not create an application clock framework.
Heatmap/Marquee remain separate. No next component is implemented in this Time commit.

## Countdown acceptance — elapsed duration and finish-once delivery

[Canonical Countdown](../components/countdown.md) and its [reference](components/countdown.md)
close the sixth retained P6 route: native existing text or explicit unit targets,
monotonic timestamp-derived remaining duration, active pause/resume, separate future
duration/current value, reset/run generations, bounded display rounding/cadence and
finish once. Hidden/selected painting pauses do not freeze elapsed time. No epoch
deadline, alarm action, renderer/provider, date/animation package or form proxy is added.

**Ten original identities + two source type supplements + two source behavior
supplements = 14 rows: 12 adapted + two omitted, zero unresolved; 4/4 tasks.**
VNode rendering and source duration watchEffect rewrites are explicitly omitted;
native literal/unit formatting and explicit set/reset rules replace them.

**92 tests pass** (65 Countdown + 27 native/legacy), declarations/build and all budgets
pass. Level-nine gzip: **4,588 ESM / 4,717 classic / 208 CSS**, combined
**4,796 / 4,925**, under **6,000 / 6,000 / 750** ceilings. Full three-file local ESM
example: **8,479** gzip bytes. Prior exports/budgets remain intact; Time stays **4,767**,
and core/advanced/widgets **14,611 / 2,181 / 2,779**, with **15,000 / 3,000 / 4,000**
ceilings unchanged.

Native Chromium verified elapsed pause/resume, rounded duration text/metadata, original
Text/prefix/unit nodes, hidden/selected completion, callback errors/recovery, reentrant
reset, late-clock observation, native focus/forms, RTL/zoom/media/no-JS, strict CSP and
classic/Time/legacy coexistence. Every owned timeout has a 50ms floor; normal paint
boundaries and suppressed-view completion checks replace short-remainder loops.
No alarm/sleep/browser/AT timing guarantee follows from those results.

**Current catalog: 96 routes / 4,001 rows / 356 of 384 accepted tasks across 89 pages /
28 unchecked. P6: 267 rows = 157 adapted + 71 omitted + 39 unresolved; six of nine
specialized routes accepted.** Prior retained P2–P5/P0 component routes are unchanged.
Broad P0-01–P0-09 and legacy stylesheet/auto-install/inline-theme exceptions remain
open or partial, not completed by these scoped native components.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (3 Planned) | Number Animation, Heatmap, Marquee | 39 / 39 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Number Animation**, sharing only actual native clock/text behavior if needed.
Heatmap and Marquee remain separate. No next component is implemented in this Countdown commit.

## Number Animation acceptance — finite interpolation and owned native text

[Canonical Number Animation](../components/number-animation.md) and its
[reference](components/number-animation.md) close the seventh retained P6 route:
one native RAF/monotonic owner, overflow-safe finite interpolation and exact endpoints,
cached Intl precision/grouping/locale, explicit pause/replay/retarget/cancel/reset and
selection/reduced-motion-safe text/data. The common owned-attribute helper and proven
Time/Countdown Text-node lease approach are reused without importing unrelated date
formatting, altering prior bundles or creating an application scheduler framework.

**Nine original identities + one source type + two source behavior supplements =
12 rows: 11 adapted + one omitted, zero unresolved; 4/4 tasks.** Source/Markdown
duration and target-default differences, native rounding/localized digits and omitted
locale-provider/financial/renderer semantics are explicit.

**89 tests pass** (62 Number Animation + 27 native/legacy), declarations/build and
all budgets pass. Level-nine gzip: **5,224 ESM / 5,359 classic / 147 CSS**, combined
**5,371 / 5,506**, under **6,000 / 6,000 / 500**. Full local ESM example: **8,995**
gzip bytes. Prior exports/budgets stay unchanged; Time/Countdown remain **4,767 /
4,588**, core/advanced/widgets **14,611 / 2,181 / 2,779** under existing ceilings.

Native Chromium verified sampled/paused/retargeted values, exact fractional/opposite
extreme endpoints, selected/hidden deferred finish, same/zero/reduced final values,
formatter errors, original text/prefix/data/forms/focus, locale grouping/digits, RTL/
zoom/media/no-JS, strict CSP and classic/Time/Countdown/legacy coexistence. Tests enforce
no per-frame layout reads and safe stale frame ID/media/reentrant finish handling.
Current reduced-motion preference is sampled before delayed change events can start
wrong motion. No all-browser/AT, decimal-finance or generic tween-service claim.

**Current catalog: 96 routes / 4,004 rows / 360 of 384 accepted tasks across 90 pages /
24 unchecked. P6: 270 rows = 168 adapted + 72 omitted + 30 unresolved; seven of nine
specialized routes accepted.** Previous retained P2–P5/P0 component routes remain
unchanged. Broad P0-01–P0-09 and legacy extraction/auto-install/inline-theme exceptions
stay separately open or partial.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (2 Planned) | Heatmap, Marquee | 30 / 30 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Heatmap**, then Marquee. Neither is implemented in this Number Animation commit.

## Heatmap acceptance — bounded calendar data, not a chart renderer

[Canonical Heatmap](../components/heatmap.md) and its [complete reference](components/heatmap.md)
close the eighth retained P6 route using the actual reference calendar-by-week model.
Existing Gregorian/date-only primitives support bounded records/ranges; native table/
headers/buttons/value text, deterministic domain/threshold bands, external CSS palette
and persistent nonlive detail preserve non-color meaning and keyboard/touch access.
No chart library, timestamp inference, zero-fill/duplicate coercion, fake loading data,
title-only Tooltip, opaque renderer, provider or external data fetch is introduced.

**27 original identities + four grouped/type supplements + three source behaviors +
three inherited theme props = 37 rows: 26 adapted + 11 omitted, zero unresolved;
4/4 tasks.** Source gap/color/loading algorithms, Tooltip/loading-data/mock/theme
surfaces remain explicit omissions rather than native parity claims.

**133 tests pass** (52 Heatmap + 54 shared Calendar + 27 native/legacy), declarations/
build and all budgets pass. Level-nine gzip: **7,822 ESM / 7,956 classic / 1,126 CSS**;
combined **8,948 / 9,082** under **8,000 / 8,000 / 2,000** ceilings. Full local ESM
example: **13,029** gzip bytes. Existing Calendar stays **7,438**; prior exports/budgets
and core/advanced/widgets **14,611 / 2,181 / 2,779** remain unchanged.

Native Chromium verified actual data/color/legend, missing versus zero, signed/
constant/clamped domains, persistent details, native table AX and scoped keys, update/
focus/identity, empty/leap/year1/9999/range limits, native forms/author controls,
RTL/zoom/forced-colors/print/no-JS, strict CSP and classic/native-date/legacy coexistence.
The supported full-year case measured **54 columns, 378 slots, 372 real date buttons
and one date tab stop**; 3010px content used a 1086px native scrollport. No unlimited
chart, Tooltip/renderer, print-width or all-browser/AT guarantee is implied.

**Current catalog: 96 routes / 4,014 rows / 364 of 384 accepted tasks across 91 pages /
20 unchecked. P6: 280 rows = 194 adapted + 83 omitted + three unresolved; eight of
nine specialized routes accepted.** Broad P0-01–P0-09 and legacy CSS extraction/
auto-install/inline-theme exceptions stay open/partial; prior retained P2–P5/P0 routes
are unchanged.

| Remaining group | Routes | Rows / unresolved |
| --- | --- | ---: |
| P6 (1 Planned) | Marquee | 3 / 3 |
| Explicit exclusions (4) | Equation, QR Code, Legacy Grid, Legacy Transfer | 35 / 0 |

**Next: Marquee.** No Marquee implementation is included in this Heatmap commit.

## Marquee acceptance — one original track and main P6 sign-off

[Canonical Marquee](../components/marquee.md) and [complete reference](components/marquee.md)
close the ninth main P6 route with bounded noninteractive original native content,
optional Web Animations and external scroll/layout/media CSS. Every pause cancels
translation into a reachable native static view. Sticky user intent, available real
pause controls, focus/hover/selection/visibility/media reasons, physical left/right,
finite/infinite alternating passes and event-driven resize/content restart are explicit.
No obsolete tag, clone/mirror, duplicated seamless track, per-frame layout polling,
renderer, animation dependency or application scheduler is introduced.

**3 original identities + five source behaviors + three inherited theme identities =
11 rows: five native adaptations + six omissions, zero unresolved; 4/4 tasks.**
Original auto-fill/slot/speed identities remain visible; source duplication,
forced-reflow iteration restart and theme surfaces remain explicit omissions.

**69 targeted tests pass** (42 Marquee + 27 native/legacy), declarations/build and all
budgets pass. Gzip level nine: **4,920 ESM / 5,062 classic / 552 CSS**, combined
**5,472 / 5,614**, under **6,000 / 6,000 / 1,000** individual ceilings. Full local
ESM HTML/CSS/JS/SVG example: **9,281** gzip bytes. Prior optional sources/exports/
budgets remain unchanged; core/advanced/widgets remain **14,611 / 2,181 / 2,779**
under **15,000 / 3,000 / 4,000**, with runtime dependencies `{}`.

Chromium verified actual computed motion and finite finish once, real mouse/Enter/
Space controls, native scrolling/selection/focus/forms, no clones, resize/content/
hidden/fitting/static states, RTL/zoom, reduced/forced/print, narrow/no-JS, strict CSP
and classic/native ESM/legacy coexistence. The 1854px original track in a 672px viewport
traversed 1182px at 48px/s (24625ms/pass). Review found and fixed continued motion
after disabling the pause control; disabled/hidden/fieldset state now stops motion
without being overwritten. Deterministic tests guard stale native callbacks, reentrant
finish/disconnect and errors, including falsy thrown values. No all-browser/AT,
essential automatic-content or advanced source parity is claimed.

### Final audit of the nine main P6-assigned routes

| Route | Rows | Native adaptations | Intentional omissions | Accepted tasks |
| --- | ---: | ---: | ---: | ---: |
| Carousel/CarouselItem | 50 | 35 | 15 | 4/4 |
| Watermark | 31 | 26 | 5 | 4/4 |
| Upload/Trigger/Dragger | 101 | 57 | 44 | 4/4 |
| Calendar | 23 | 20 | 3 | 4/4 |
| Time | 9 | 7 | 2 | 4/4 |
| Countdown | 14 | 12 | 2 | 4/4 |
| Number Animation | 12 | 11 | 1 | 4/4 |
| Heatmap | 37 | 26 | 11 | 4/4 |
| Marquee | 11 | 5 | 6 | 4/4 |
| **Nine main retained scopes: zero unresolved rows** | **288** | **199** | **89** | **36/36** |

This signs off retained native functionality and its packaging, not cloned seamless/
custom effects, Watermark security, automatic backend/preview/renderer, arbitrary
date-token/provider, financial-decimal or full chart parity. The source omissions are
not counted as implementations and remain visible in each reference.

**Current catalog: 96 routes / 4,022 tracker rows / 368 of 384 accepted tasks across
92 pages / 16 unchecked.** API status totals: **2,090 native adaptations + 1,932
intentional omissions; zero Not reviewed/Planned rows.** Earlier component sign-off
counts above are historical snapshots, not conflicting current totals.

| Separate unresolved work | Status |
| --- | --- |
| Equation, QR Code, Legacy Grid, Legacy Transfer | 35 API rows intentionally omitted, but 16 alternative-guidance/acceptance tasks remain unchecked; P6-05/P6-06 are not completed by this main-route audit |
| Broad P0-01–P0-09 foundation work | Open/partial independently: legacy CSS extraction, aggregate style/auto-install compatibility, inline-theme exceptions and cross-component contract follow-through remain |

P0's Config Provider/Element/Global Style route resolutions and P1–P5 retained scopes
stay accepted without broad foundation or framework parity being inferred.
**Recommend Equation resolution next**, using authored native MathML as a possible
no-parser alternative. No Equation or other next component is implemented in this commit.

## Equation resolution — exclusion retained, native MathML recipe accepted

[Canonical Equation](../components/equation.md) and its
[complete reference](components/equation.md) resolve the alternative-guidance lane,
not a TeX/KaTeX runtime. Original inline powers, block fractions, subscript/root and
two-by-two matrix use native MathML, semantic labels and plain explanations. Only
local scoped HTML/CSS is needed; raw TeX remains literal text. No parser, provider,
renderer, font bundle, script, export, new distribution or dependency is introduced.

**Three original identities + two grouped type/export supplements + three source
behaviors = eight API rows, all intentionally omitted. Four alternative-resolution
tasks are accepted; zero TeX/KaTeX features receive implementation credit.**
Native display=inline/block is an authoring alternative, not a KaTeX options adapter.
The provider/renderToString/throwOnError/missing-output/HTML wrapper contracts remain
explicit omissions. Native known-node/text authoring is not an untrusted markup sanitizer.

**39 tests passed** (12 Equation recipe + 27 native/legacy); declarations/build and
every previous budget passed. All **1,316 existing distribution files byte-matched**.
Local HTML/CSS measure **1,729 / 548 gzip bytes**, **2,277 combined**, with no library
asset. No package, build, legacy source or P0 foundation row changed.

Dedicated Chromium evidence covers real MathML namespace and stacked numerator/
denominator, superscripts above identifiers, square root/subscript and aligned matrix
rows. Native AX exposes MathMLMath/Fraction/Sup/Sub/SquareRoot/Table/Row/Cell plus
authored names. Selection, original identities, native forms/disclosure/reset and
local-only requests remain intact. At 360px/200% zoom the page fits; a 320px/200% RTL
matrix scrollport responds natively to ArrowLeft without losing focus. Forced-colors/
print and a fresh JavaScript-disabled strict-CSP context retain native math rendering.
Only local HTML/CSS load; no all-browser/AT pronunciation, duplicate-free speech,
arbitrary-formula fitting, image-generation or TeX parity is claimed.

**Current catalog: 96 routes / 4,027 rows / 372 of 384 accepted tasks across 93 pages /
12 unchecked.** Accepted work is **368 retained-scope tasks on 92 pages plus four
Equation alternative tasks**. API status totals: **2,090 native adaptations + 1,937
intentional omissions, zero unresolved**. Main P6 remains nine accepted retained
routes, 288 rows (199 adapted/89 omitted), 36/36 tasks; Equation is not a tenth main route.

| Exclusion route | API rows | Alternative-guidance acceptance |
| --- | ---: | --- |
| Equation | 8 omitted | Resolved native alternative; 4/4 tasks, no TeX implementation |
| QR Code | 11 omitted | Next; 0/4 tasks, not started here |
| Legacy Grid | 5 omitted | Pending; 0/4 tasks |
| Legacy Transfer | 16 omitted | Pending; 0/4 tasks |
| **Total** | **40 omitted** | **4/16 tasks accepted; 12 unchecked** |

**Recommend QR Code resolution next.** No QR Code or other next-route implementation
is included. Broad P0-01–P0-09 work, legacy CSS extraction, aggregate auto-install and
inline-theme compatibility remain separately pending/partial and parent-owned;
this recipe does not modify or complete those foundation rows.

## QR Code resolution — encoding excluded, native destination handoff accepted

[Canonical QR Code](../components/qr-code.md) and the
[complete reference](components/qr-code.md) resolve the native-alternative lane,
not QR generation. A real fixed local link and exact original multiline text remain
usable without scanning or JavaScript. No verified QR fixture is supplied for this
scope, so there is no img/canvas/SVG, fake pattern, broken asset, scan claim, encoder,
upload/scanner, service, helper/export, font or distribution. BarcodeDetector is a
decoder, not a native encoder, and is not used.

**Eleven original identities + one grouped type/export + four source behaviors +
three inherited themes = 19 rows, all intentionally omitted; four alternative
tasks accepted.** No generation/value/correction/color/logo/size/type/padding API
receives implementation credit. The source bundled encoder, reactive canvas/logo
drawing, SVG string renderer and inherited theme pipeline stay omitted. Conditional
trusted-image handoff preserves application responsibility for payload agreement,
quiet zone, dimensions/contrast, decoding and actual target scanner/print evidence.

**36 tests passed** (nine QR alternative + 27 native/legacy), declarations/build and
all existing budgets. **1,316 pre-existing distribution files byte-matched**. No
package/build/source or P0 foundation row changed. The local HTML/CSS recipe costs
**1,272 / 471 gzip bytes**, **1,743 combined**, with no JS or library asset.

Chromium verified the real named link following to the existing local Equation page
via Enter, native Space disclosure, exact reference/newlines/ampersand and unchanged
selection/Text-node identity. Native AX exposes heading/region/link/code, not a QR
image. RTL text policy, 360px/200% zoom without horizontal page overflow, forced
colors and print preserve readable text/destination. A fresh JavaScript-disabled
strict-CSP context loaded only local HTML/CSS before native link activation, with no
errors. This verifies alternative usability, not QR encoding, actual-image rendering/
contrast/quiet zones, scan compatibility or all-browser/AT behavior.

**Current catalog: 96 routes / 4,035 tracker rows / 376 of 384 accepted tasks across
94 pages / eight unchecked.** Accepted work is **368 retained-scope tasks on 92
pages plus eight Equation/QR alternative tasks**. API statuses: **2,090 native
adaptations + 1,945 intentional omissions; zero unresolved**. Main P6 remains nine
retained routes/288 rows (199 adapted/89 omitted)/36 tasks, unchanged.

| Exclusion route | API rows | Alternative acceptance |
| --- | ---: | --- |
| Equation | 8 omitted | Resolved native MathML alternative; 4/4 |
| QR Code | 19 omitted | Resolved plain-link/text handoff; 4/4 |
| Legacy Grid | 5 omitted | Next; 0/4, not started here |
| Legacy Transfer | 16 omitted | Pending; 0/4 |
| **Total** | **48 omitted** | **8/16 accepted; eight unchecked** |

**Recommend Legacy Grid resolution next**, then Legacy Transfer separately.
No next route is implemented here. Broad P0-01–P0-09 foundation work, legacy CSS
extraction, aggregate auto-install and inline-theme exceptions remain parent-owned
and separately pending/partial; no foundation task is altered by this resolution.

## Legacy Grid resolution — native replacement without deprecated constructors

[Canonical Legacy Grid](../components/legacy-grid.md) and the
[complete Row/Col reference](components/legacy-grid.md) resolve this lane using
the actual shipped Grid/Flex/Space CSS. Original semantic containers, controls,
forms and child nodes replace framework wrappers/slots. Native gaps/spans and Flex
alignment are explicit capabilities; relative offset/push/pull, half-gutter
compensation, required Row injection and deprecated constructor/prop syntax remain
omitted. Absolute grid start is not relative offset, and visual shifts must not
contradict DOM/tab order.

**Five original identities + three type/export groups + seven source supplements
= 15 rows: six verified native replacements + nine omissions; four resolution
tasks accepted.** Source Row/Col default slots and alignItems/justifyContent are
explicitly sourced. Fixed Span 1..24 number/string variants are recorded; no named
breakpoint props or inherited theme rows exist to invent. The 48rem viewport and
30rem container rules are application CSS, not a recreated responsive grammar.

**51 tests passed** (12 replacement + 12 unchanged modern Grid + 27 native/legacy),
declarations/build and all existing ceilings. All **1,316 distribution files
byte-matched**. No core/plugin/build/package or P0 foundation row changed.
Modern Grid's source/reference/acceptance stays intact.

Real Chromium geometry: 992px container with 8/16-of-24 spans about 322.66/657.34px,
12px x gap and 8px y gap; nested grid remained two tracks/4px. Viewport 767→768px
changed one→24 tracks, query wrapper 479→480px changed one→three tracks, and the
compact 320px wrapper stayed single-column. The spacer consumed a real empty track;
absolute start line 3 was instead adjacent after a two-track item.

Native Tab order, RTL right-to-left layout without DOM reversal, reset/FormData,
hidden versus disabled behavior, original identities, 360px/200% zoom, print/forced
colors, native AX, no-JS/strict-CSP and legacy-wrapper coexistence were verified.
The source physical positioning/wrapping algorithms are not claimed as reproduced.
The complete example is **4,583 gzip bytes**, including existing Grid/Flex/Space
CSS at **527/390/423**; new demo-only HTML/CSS is **3,243**, no runtime.

**Current catalog: 96 routes / 4,045 rows / 380 of 384 accepted tasks across 95 pages /
four unchecked.** Accepted work: **368 retained-scope tasks plus twelve native
alternative/replacement tasks**. API statuses: **2,096 verified native capabilities +
1,949 omissions; zero unresolved**. Main P6 remains nine routes/288 rows/36 accepted
tasks; no modern Grid count or acceptance is replaced.

| Alternative/deprecated route | Tracker disposition | Resolution tasks |
| --- | --- | ---: |
| Equation | 8 omitted; native MathML alternative | 4/4 |
| QR Code | 19 omitted; native link/text handoff | 4/4 |
| Legacy Grid | 6 native replacements + 9 omissions | 4/4 |
| Legacy Transfer | 16 omitted; replacement pending | 0/4 |
| **Total** | **58 rows: 6 native replacements + 52 omissions** | **12/16 accepted** |

**Recommend Legacy Transfer resolution next.** It is not started here. Broad
P0-01–P0-09 foundation follow-through remains parent-owned and pending/partial;
legacy CSS extraction, aggregate auto-install and inline-theme exceptions are not
altered or completed by this native layout recipe.
