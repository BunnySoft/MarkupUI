# MarkupUI migration plan

**Plan state: 🟠 In progress — P1 pilots and the P2-02 Tag/Badge/Alert/Empty/Skeleton/Spin workstream
and P2-03 Progress/Statistic are Verified for retained scope. Whole P2 is not complete;
CSS-only Typography/Icon are individually Verified; Gradient Text is next, not started.** Existing MarkupUI features are a partial baseline,
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
| P2 — Primitives and layout | 🟠 In progress | P2-02/P2-03 and individual Typography/Icon scopes complete; Gradient Text next, then remaining content/layout. | P1 pattern | Retained features have evidence; styling-only features do not acquire unnecessary controllers. |
| P3 — Interaction foundations | 🔵 Planned | Implement predictable focus, keyboard, overlays and navigation. | P0 lifecycle; P1 controls | Nested interaction, dismissal and focus behavior are defined and demonstrated. |
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
| P2-01 — Typography and content | 🟠 In progress | Typography `53d3974` and Icon/IconWrapper in this change Verified as CSS only; Gradient Text next. | [Typography acceptance](../components/typography.md): 300 tests; [Icon acceptance](../components/icon.md): 308 plus Chromium native paint/sizing/names/focus/forced-color/zoom evidence. |
| P2-02 — Small feedback | 🟢 Verified | Tag `6605d29`, Badge `69c9480`, Alert `2a1eb42`, Empty `27a435b`, Skeleton `05c6546`, and Spin `6c7f35b` complete their retained scopes. | [Tag](../components/tag.md): 118 tests; [Badge](../components/badge.md): 141; [Alert](../components/alert.md): 167; [Empty](../components/empty.md): 190; [Skeleton](../components/skeleton.md): 213; [Spin](../components/spin.md): 241 plus Chromium timing/native-state/motion evidence. |
| P2-03 — Progress and statistics | 🟢 Verified | Progress `8d7757c` and Statistic `1ed3a98` complete retained native scopes; Number Animation remains separate. | [Progress acceptance](../components/progress.md): 270 tests; [Statistic acceptance](../components/statistic.md): 290 plus Chromium native value/region/formatting-string/typography evidence. |
| P2-04 — Layout | 🔵 Planned | Express Space, Flex, Grid, Layout, Divider and simple alignment through CSS. | Responsive, logical-direction layout without JS measurement unless demonstrably necessary. |
| P2-05 — Static compound display | 🔵 Planned | Define List, Descriptions, Timeline, Breadcrumb and similar content anatomy. | Reusable markup conventions with no compulsory data renderer or router. |
| P2-06 — Wave sign-off | 🔵 Planned | Close retained feature gaps and document any intentionally simplified visual variations. | Updated per-component trackers and isolated payload accounting. |

Interactive ellipsis expansion, overflow controls, or popup variants depend on P3 rather
than smuggling separate overlay implementations into otherwise CSS-only components.

### P3 — Interaction foundations

| Task | Status | Action | Deliverable |
| --- | --- | --- | --- |
| P3-01 — Focus and keyboard | 🔵 Planned | Establish native focus first, then scoped roving focus/typeahead where required. | Shared behavior with defined ownership, reconnection and direction handling. |
| P3-02 — Floating surfaces | 🔵 Planned | Harden the local positioning path; define native Popover/anchor use and feature-detected fallback. | Resize/scroll/clipping updates, outside-click and Escape behavior without external positioning code. |
| P3-03 — Modal surfaces | 🔵 Planned | Define native dialog/top-layer behavior, accessible names, cancellation and focus restoration. | Dialog/Drawer/Modal foundations that support nested ownership. |
| P3-04 — Tooltip and Popover | 🔵 Planned | Add explicit trigger/content anatomy and keyboard/pointer behavior over P3-02. | Clear open/close state, cleanup and author-owned content. |
| P3-05 — Navigation | 🔵 Planned | Improve Tabs, Collapse, Menu, Dropdown, Pagination, Steps and related controls. | Native links or documented selection events; no framework router dependency. |
| P3-06 — Managed feedback | 🔵 Planned | Refine Message, Notification and confirmation/loading services. | Explicit document/root ownership, lifetimes and disposal, not a hidden app provider. |
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

## First implementation slice

**Next component: Gradient Text (P2-01), not started; coordinator selection pending.**
Icon/IconWrapper completed their retained CSS-only implementation and acceptance in this change.
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
**P2-02 small feedback is now Verified for retained scope; P2 overall remains In progress.**
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
**P2-03 Progress/Statistic is now Verified for retained scope; P2 overall remains In progress.**
Typography's [reference inventory](components/typography.md) retains fifteen grouped public
rows and adds 25 explicit source owner/deprecated/grouped-theme supplements: 17 Verified
ADAPTED native targets and 23 omitted runtime/framework contracts. Its four tasks are closed
with [300-test/Chromium evidence](../components/typography.md), using scoped native CSS only:
no Custom Element, ESM/classic JS entry, observer, router or highlighting dependency.
P2-01 and P2 overall remain In progress.
Icon's [reference inventory](components/icon.md) retains nine pinned rows plus eight
source type/companion-slot/theme supplements: 10 Verified ADAPTED targets and 7 omissions.
Its four tasks are closed with [308-test/Chromium evidence](../components/icon.md), preserving
native paints, aspect/viewports, names/actions, forced colors and CSS-only loading with no asset library.
The index records 3,105 rows and 52 accepted retained tasks out of 384, not full upstream parity.
Await coordinator selection of Gradient Text and remaining content/layout
work from the index, while preserving native
semantics and the legacy aggregate. Each component gets its own documentation update, build,
acceptance evidence and commit before advancing. No dates or effort estimates are assigned
until retained feature scope and optional exclusions are settled.
