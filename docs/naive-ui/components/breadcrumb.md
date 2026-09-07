# Breadcrumb

**Plan: Planned. Current baseline: widgets registration/styles with host label.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) labels the breadcrumb and styles separators.

- **HTML:** labelled navigation containing an ordered list of native links; current page uses `aria-current`.
- **JS:** none for ordinary navigation.
- **CSS:** external separator and wrapping treatment.
- **Placement:** proposed `src/components/breadcrumb/`; no router integration.

## Acceptance and gaps

Test current-page announcement, decorative separators, long paths, keyboard and RTL. Existing custom tags/labels are not sufficient proof of complete navigation semantics.

## Migration steps

**Delivery phase:** P2 — static navigation composition. **Task state:** 🔵 Planned.
**Prerequisites:** P2 native links/list anatomy and external CSS in the [master plan](../migration-plan.md).
**Next task:** define labelled nav/ol/li markup and identify the current page independently of its visual position.

1. [ ] **Preserve real navigation.** Map item href/target behavior to anchors and leave router integration in application code.
2. [ ] **Define item regions.** Resolve icon/default/separator content while hiding decorative duplicate separators.
3. [ ] **Extract wrapping rules.** Support long paths and logical-direction separators without JavaScript layout measurement.
4. [ ] **Verify path semantics.** Test current-page announcements, keyboard links, RTL and responsive wrapping with no runtime controller.

### Native primitives and fallback

- **Native path:** `nav` containing an ordered list of real anchors and an aria-current item; optional repeated items can clone a native template explicitly.
- **Small enhancement:** none is needed for navigation. CSS flex/wrap, logical gaps and decorative separators supply appearance; ordinary list flow is the fallback. Optional `:has()` styling must have class equivalents. A breadcrumb does not need router injection, custom-element lifecycle or Shadow DOM slot projection.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/breadcrumb)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **8 local table rows + 0 supplementary declarations + 0 inherited rows = 8 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Breadcrumb Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate `separator` attribute or JS `separator`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### BreadcrumbItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`clickable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `clickable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`href`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L27) | Prop | Authored native link `href`; preserve browser navigation and security semantics. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `separator` attribute or JS `separator`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate live JS `showSeparator` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Breadcrumb Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L35) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Breadcrumb Item Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L41) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/breadcrumb/demos/enUS/index.demo-entry.md#L42) | Slot | Candidate authored `separator` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
