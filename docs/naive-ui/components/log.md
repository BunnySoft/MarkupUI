# Log

**Plan: Planned for plain logs; syntax-highlighting engine intentionally omitted. Current baseline: no log viewer.**

## Baseline and target

[B1: advanced.ts](../../../src/plugins/advanced.ts) contains a basic virtual list that may inform optional bounded rendering.

- **HTML:** readable `pre`/`code` or a labelled ordered record list.
- **JS:** optional follow-tail, append limits and scroll control; no language parser.
- **CSS:** monospace wrapping and external viewport presentation.
- **Placement:** proposed `src/optional/log/`.

## Acceptance and gaps

Test high-volume append, user-scrolled position, bounded memory, clear/reconnect and literal untrusted text. Avoid announcing every line; highlighter configuration remains excluded.

## Migration steps

**Delivery phase:** P5 — bounded collections; highlighting remains excluded. **Task state:** 🔵 Planned.
**Prerequisites:** P2 Code and P5 Virtual List only for large logs in the [master plan](../migration-plan.md).
**Next task:** define plain-text log records, retention limits and when follow-tail stops after user scrolling.

1. [ ] **Build a readable fallback.** Use pre/code or an ordered record list with explicit line identity and safe text insertion.
2. [ ] **Specify append/clear behavior.** Bound retained data and preserve user scroll/selection when new records arrive.
3. [ ] **Gate virtual rendering.** Add independent windowing only for approved scale; keep syntax-engine configuration omitted.
4. [ ] **Test streaming conditions.** Cover burst appends, follow-tail toggling, disconnect, clear and literal hostile-looking text without announcement flooding.

### Native primitives and fallback

- **Native path:** native pre/code or an ordered text-record list; append text nodes or explicitly cloned line templates without parsing source as HTML.
- **Small enhancement:** a light-DOM controller owns append/follow-tail and optional windowing. Feature-detect observers and use bounded complete/paginated logs when unavailable; native scrollTop/scrollTo is sufficient for basic scrolling. Release listeners on disconnect. No syntax engine, custom scrollbar polyfill or reactive log renderer is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/log)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **14 local table rows + 7 supplementary declarations + 0 inherited rows = 21 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Log Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`font-size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L60) | Prop | External CSS token/class for `font-size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`hljs`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L61) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`language`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L62) | Prop | Plain text or pre-authored marks only; no syntax-highlighter engine. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`line-height`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L63) | Prop | Candidate `line-height` attribute or JS `lineHeight`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`lines`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L64) | Prop | Candidate JS `lines` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L65) | Prop | Candidate presence attribute `loading`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`log`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L66) | Prop | Candidate `log` attribute or JS `log`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`rows`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L67) | Prop | Candidate `rows` attribute or JS `rows`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L68) | Prop | Candidate explicit native-child configuration for `spin-props`; no unrestricted prop forwarding. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trim`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L69) | Prop | Candidate presence attribute `trim`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-require-more`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L70) | Callback | Candidate DOM `mui:require-more` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-reach-top`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L71) | Callback | Candidate DOM `mui:reach-top` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-reach-bottom`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L72) | Callback | Candidate DOM `mui:reach-bottom` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Log Methods

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L78) | Method | Candidate plain-JS `scrollTo` operation; arguments, return value and lifecycle not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Log Props: spin-props inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`spin-props.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L68) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L68) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L68) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`spin-props.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L68) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Log Methods: scrollTo inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`scrollTo.top?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L78) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.position?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L78) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`scrollTo.silent?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/log/demos/enUS/index.demo-entry.md#L78) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
