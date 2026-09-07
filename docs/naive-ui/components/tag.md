# Tag

**Migration status: 🟠 In progress.** A standalone native Tag implementation is underway.
The per-row proposals below are not yet accepted; no feature is promoted merely because
implementation has started. The historical baseline remains a partial core component.

## Baseline and target

[B1: content.ts](../../../src/components/content.ts) adds an accessible close button for `closable` and emits `mui:close`; it does not remove the tag automatically.

- **HTML:** text/icon content and native remove button.
- **JS:** preserve existing close notification; specify cancel/removal ownership and focus movement.
- **CSS:** external color, size, shape, checked and disabled states.
- **Placement:** proposed `src/components/tag/`.

## Acceptance and gaps

Test close versus tag click, keyboard removal, repeated connection and selected tags. Preserve authored children; checkable behavior is not established by current close support.

## Migration steps

**Delivery phase:** P2 — primitives. **Task state:** 🟠 In progress.
**Prerequisites:** P1 Button behavior and P0 child/event contracts in the [master plan](../migration-plan.md).
**Next task:** preserve the existing close notification while specifying who removes a tag and restores focus.

1. [ ] **Adopt content and close control.** Retain text/icon nodes and use a named native remove button.
2. [ ] **Define optional checking.** Keep selected/checked state distinct from removal and disabled presentation; resolve callback return semantics.
3. [ ] **Extract visual variants.** Move colors, size, shape and focus styling into Tag CSS, without prop-object forwarding.
4. [ ] **Verify event boundaries.** Test close versus tag click, keyboard deletion, reconnect and focus when a list removes its active tag.

### Native primitives and fallback

- **Native path:** authored label/icon nodes and a real remove button; a small light-DOM custom element coordinates close/check intent. Repeated data tags may clone a native template without regenerating the full list.
- **Small enhancement:** lifecycle-owned listeners and external inline-flex/gap/state styles are sufficient. Optional `:has()` styling needs a checked/disabled class or attribute fallback. When scripting is unavailable, labels remain readable and removal stays an explicitly nonfunctional enhancement rather than fake native slot behavior.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/tag)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **16 local table rows + 3 supplementary declarations + 0 inherited rows = 19 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Tag Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L26) | Prop | External CSS token/class for `bordered`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`checkable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `checkable`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate live JS `checked` state; native value/default/event contract needs review. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`closable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate presence attribute `closable`; semantics/interaction not reviewed. | ⚪ Not reviewed | B1 adds a close button; partial only, verify this row. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Prop | External CSS token/class for `color`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L32) | Prop | External CSS token/class for `round`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L33) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`strong`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L34) | Prop | External CSS token/class for `strong`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`trigger-click-on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L35) | Prop | Candidate presence attribute `trigger-click-on-close`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `type` attribute or JS `type`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-close`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L37) | Callback | Candidate DOM `mui:close` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | B1 emits mui:close; partial only, verify this row. |
| [`on-update:checked`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L38) | Callback | Candidate DOM `mui:change` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Tag Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L44) | Slot | Candidate authored `avatar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L45) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L46) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Tag Props: color inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`color.color?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color.borderColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`color.textColor?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md#L30) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
