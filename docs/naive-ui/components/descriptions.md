# Descriptions

**Plan: Planned. Current baseline: partial core description layout; not parity-verified.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) creates label/value spans and updates a columns style.

- **HTML:** semantic `dl`/`dt`/`dd`, with labelled groups when table-like layout is unsuitable.
- **JS:** none for basic display; preserve authored values.
- **CSS:** external columns, item spanning, borders and responsive layout.
- **Placement:** proposed `src/components/descriptions/`.

## Acceptance and gaps

Test long labels, spanning items, responsive collapse, reading order and live columns. Existing generated spans do not establish description-list semantics or all companion-item props.

## Migration steps

**Delivery phase:** P2 — compound display. **Task state:** 🔵 Planned.
**Prerequisites:** P0 child preservation and P2 Grid/typography rules in the [master plan](../migration-plan.md).
**Next task:** map label/value spans to semantic dl/dt/dd anatomy without discarding authored values.

1. [ ] **Define DescriptionItem.** Specify label/value regions, empty labels and shared group title semantics.
2. [ ] **Resolve spans and columns.** Distinguish existing columns from upstream column naming and constrain item spans.
3. [ ] **Extract responsive presentation.** Implement borders, label placement and collapsing columns in external CSS.
4. [ ] **Check reading order.** Test long labels, rich values, spanning items and live column changes at narrow widths.

### Native primitives and fallback

- **Native path:** native `dl`/`dt`/`dd` pairs with authored values; optional repeated pairs can clone an application-owned template without expression evaluation.
- **Small enhancement:** CSS grid, logical spacing and container queries provide columns/spans; normal block flow or media queries are the fallback. Static descriptions need no custom-element lifecycle. Any compatibility controller adopts nodes rather than replacing pairs or pretending regions are native slots.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/descriptions)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **21 local table rows + 0 supplementary declarations + 0 inherited rows = 21 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Descriptions Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L24) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`column`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `column` attribute or JS `column`; exact target contract not reviewed. | ⚪ Not reviewed | B1 columns layout; name differs; partial only, verify this row. |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L27) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`label-align`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `label-align` attribute or JS `labelAlign`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate explicit JS `labelPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L30) | Prop | Candidate `label-class` attribute or JS `labelClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L31) | Prop | External CSS class/custom property for `label-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`separator`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate `separator` attribute or JS `separator`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L34) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DescriptionItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate `content-class` attribute or JS `contentClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`content-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L41) | Prop | External CSS class/custom property for `content-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `label` attribute or JS `label`; exact target contract not reviewed. | ⚪ Not reviewed | B1 label span generation; partial only, verify this row. |
| [`label-class`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `label-class` attribute or JS `labelClass`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L44) | Prop | External CSS class/custom property for `label-style`; no inline style-object passthrough. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`span`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L45) | Prop | Candidate `span` attribute or JS `span`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Descriptions Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L51) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L52) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### DescriptionItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L58) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`label`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/descriptions/demos/enUS/index.demo-entry.md#L59) | Slot | Candidate authored `label` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
