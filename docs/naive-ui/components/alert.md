# Alert

**Plan: Planned. Current baseline: registered/styled core alert only.**

## Baseline and target

[B1: elements.ts](../../../src/components/elements.ts) registers alerts; [B2: styles.ts](../../../src/components/styles.ts) provides presentation.

- **HTML:** heading/body and optional close button; alert/status role selected for actual urgency.
- **JS:** optional cancelable close action and focus recovery.
- **CSS:** external semantic variants, icons and borders.
- **Placement:** proposed `src/components/alert/`.

## Acceptance and gaps

Test static versus dynamically announced content, close keyboard access and focus. Avoid treating every informational notice as an assertive interruption.

## Migration steps

**Delivery phase:** P2 — feedback primitives. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button and P0 announcement/child-ownership rules in the [master plan](../migration-plan.md).
**Next task:** decide which alerts are static notices, polite status updates or urgent live alerts.

1. [ ] **Define authored regions.** Preserve heading, body, icon and optional native close button with clear labels.
2. [ ] **Specify close ownership.** Resolve cancellation/removal and focus recovery without automatically discarding important content.
3. [ ] **Extract alert variants.** Put semantic color, borders and spacing into external CSS with text-based severity.
4. [ ] **Test announcement timing.** Cover initial versus inserted alerts, repeated text changes, keyboard dismissal and non-color understanding.

### Native primitives and fallback

- **Native path:** authored heading/body, appropriate live-region semantics and a native close button; static alerts require no custom-element controller.
- **Small enhancement:** a closeable wrapper owns only close/cancellation listeners and cleans them on disconnect. CSS grid/flex/logical properties styles regions; explicit classes replace unsupported `:has()` selectors. Without scripting, retain readable notice content rather than simulating a close action or adding a notification framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/alert)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **10 local table rows + 0 supplementary declarations + 0 inherited rows = 10 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Alert Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L22) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L23) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`show-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L24) | Prop | Candidate live JS `showIcon` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-after-leave`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L27) | Callback | Candidate DOM `mui:after-leave` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L28) | Callback | Explicit `on-close` function/before-event contract needed; preserve return/cancellation semantics. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Alert Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L34) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L35) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md#L36) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
