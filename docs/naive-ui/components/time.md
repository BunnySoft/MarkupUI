# Time

**Plan: Planned. Current baseline: no time-formatting component identified.**

## Baseline and target

[B1: registry](../../../src/components/elements.ts) has no display-time controller.

- **HTML:** `time` with a machine-readable datetime and readable fallback.
- **JS:** optional absolute/relative formatting via native `Intl.DateTimeFormat`/`Intl.RelativeTimeFormat`.
- **CSS:** inherited typography; no inline style engine.
- **Placement:** proposed `src/optional/time/`.

## Acceptance and gaps

Test invalid dates, explicit timezone, locale changes, relative boundary updates and timer cleanup. Do not recreate an upstream date-library token language implicitly.

## Migration steps

**Delivery phase:** P6 — date display. **Task state:** 🔵 Planned.
**Prerequisites:** P0 locale/timezone decisions and timer disposal in the [master plan](../migration-plan.md).
**Next task:** specify machine-readable datetime values independently from localized visible text.

1. [ ] **Author native time markup.** Keep a readable static value and valid datetime attribute before enhancement.
2. [ ] **Resolve formatting modes.** Use Intl for absolute/relative display with explicit locale, timezone and invalid-value behavior.
3. [ ] **Bound relative updates.** Schedule only meaningful boundary changes and release timers on disconnect.
4. [ ] **Test temporal display.** Cover timezone differences, invalid dates, relative thresholds and locale changes without an upstream token parser.

### Native primitives and fallback

- **Native path:** native `time` with datetime and a readable authored string. Optional display enhancement uses Intl.DateTimeFormat/RelativeTimeFormat inside a small light-DOM controller.
- **Small enhancement:** feature-detect the retained Intl options and fall back to supplied absolute text when unavailable. Schedule only meaningful relative-time changes and cancel timers on disconnect. Native typography/CSS is sufficient; no locale pack, date-format polyfill or template engine is required.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/time)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **6 local table rows + 0 supplementary declarations + 0 inherited rows = 6 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Time Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`format`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L22) | Prop | Candidate explicit JS `format` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`time`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate `time` attribute or JS `time`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`time-zone`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate `time-zone` attribute or JS `timeZone`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`to`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `to` attribute or JS `to`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`unix`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/time/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `unix`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
