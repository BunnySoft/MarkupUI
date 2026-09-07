# Typography

**Plan: Planned. Current baseline: partial semantic wrappers/styles; not parity-verified.**

## Baseline and target

[B1: foundation.ts](../../../src/components/foundation.ts) supplies heading roles and generated anchors; [B2: styles.ts](../../../src/components/styles.ts) styles content wrappers.

- **HTML:** native headings, paragraphs, lists, quotations, emphasis, code and links.
- **JS:** unnecessary for normal typography; retain compatibility wrappers.
- **CSS:** external type scale, semantic color and code/quotation treatments.
- **Placement:** proposed `src/components/typography/typography.css`.

## Acceptance and gaps

Check heading hierarchy, list semantics, nested emphasis, link behavior and text zoom. Shared upstream heading/list props are tracked once per documented owner group, not mistaken for separate routes.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P0 native semantics and theme stylesheet rules in the [master plan](../migration-plan.md).
**Next task:** map existing heading/text/link wrappers to native headings, paragraphs, emphasis and anchors.

1. [ ] **List semantic equivalents.** Resolve Text, P, heading levels, lists and Blockquote owners without creating one controller per tag.
2. [ ] **Extract typography rules.** Establish size, weight, depth, quotations and code styles in scoped CSS.
3. [ ] **Preserve native navigation.** Keep link href/target/rel and browser behavior; leave application routing outside the library.
4. [ ] **Check document structure.** Exercise heading hierarchy, nested lists, zoom, link focus and no-JS output for every retained owner group.

### Native primitives and fallback

- **Native path:** native headings, paragraphs, lists, blockquotes, emphasis, code and anchors are the implementation, not a generated component tree.
- **Small enhancement:** external CSS custom properties, logical spacing and media/container queries supply presentation; simple inherited typography is the fallback. No custom-element lifecycle, template engine, Shadow DOM or runtime style injection is needed for the native path.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/typography)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **15 local table rows + 0 supplementary declarations + 0 inherited rows = 15 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Text Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`strong`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L23) | Prop | External CSS token/class for `strong`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`italic`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate presence attribute `italic`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`underline`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate presence attribute `underline`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`delete`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate presence attribute `delete`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`code`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `code`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `depth` attribute or JS `depth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate `tag` attribute or JS `tag`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### P Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`depth`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate `depth` attribute or JS `depth`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### H1, H2, H3, H4, H5, H6 Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L41) | Prop | Candidate presence attribute `align-text`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`prefix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `prefix` attribute or JS `prefix`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Ul, Ol Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L49) | Prop | Candidate presence attribute `align-text`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Blockquote Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`align-text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L55) | Prop | Candidate presence attribute `align-text`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### All Typography Components Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/typography/demos/enUS/index.demo-entry.md#L61) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
