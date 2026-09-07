# Rate

**Plan: Planned. Current baseline: partial `mui-rating` widgets control.**

## Baseline and target

[B1: widgets.ts](../../../src/plugins/widgets.ts) renders integer star buttons, clamps value to max and emits change.

- **HTML:** labelled native radio choices or an accessible readonly score.
- **JS:** keyboard selection, clear policy and half-step behavior only if explicitly retained.
- **CSS:** icon, color and hover states; no icon package dependency.
- **Placement:** proposed `src/optional/rate/`; preserve `mui-rating` name.

## Acceptance and gaps

Test zero/readonly scores, keyboard traversal, names for each choice and fractional scope. Current radiogroup/pressed-button mixing requires review before accessibility verification.

## Migration steps

**Delivery phase:** P4 — bounded selection. **Task state:** 🔵 Planned.
**Prerequisites:** P4 Radio/Slider semantics and P2 authored icons in the [master plan](../migration-plan.md).
**Next task:** replace ambiguous pressed-button/radiogroup behavior with one documented native choice model.

1. [ ] **Specify scoring.** Resolve count/max naming, zero/clear behavior and readonly versus disabled state.
2. [ ] **Implement labelled choices.** Provide keyboard-selectable score options and readable score text; keep integer support first.
3. [ ] **Scope fractional ratings.** Decide half-step input and custom icons independently, without importing icon or gesture libraries.
4. [ ] **Validate score changes.** Test arrows/tab stops, empty score, reset, readonly display and accessible labels before extending beyond integers.

### Native primitives and fallback

- **Native path:** labelled native radio choices represent scores, with static text for readonly values. A native template can produce repeated choices/icons while retaining meaningful input labels.
- **Small enhancement:** a small custom element coordinates clear/default policy and releases listeners; CSS checked/hover states and logical spacing provide the stars. Unsupported fractional interactions reduce to integer choices rather than a pointer polyfill. Native form/radio behavior stays the keyboard fallback.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/rate)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **12 local table rows + 1 supplementary declarations + 0 inherited rows = 13 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Rate Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`allow-half`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate presence attribute `allow-half`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`clearable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate presence attribute `clearable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`count`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate `count` attribute or JS `count`; exact target contract not reviewed. | ⚪ Not reviewed | B1 max attribute; name differs; partial only, verify this row. |
| [`default-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate native default/reset state for `default-value`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`readonly`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate presence attribute `readonly`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate live JS `value` state; native value/default/event contract needs review. | ⚪ Not reviewed | B1 integer mui-rating value; partial only, verify this row. |
| [`on-clear`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L32) | Callback | Candidate DOM `mui:clear` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:hover-value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L33) | Callback | Candidate DOM `mui:change:hover-value` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:value`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L34) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Rate Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L40) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Rate Slots: default inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default.index`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/rate/demos/enUS/index.demo-entry.md#L40) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
