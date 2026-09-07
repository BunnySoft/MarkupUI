# Steps

**Plan: Planned. Current baseline: partial current-step list; not parity-verified.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) sets step indices/current/complete markers and emits current changes.

- **HTML:** ordered steps with headings; use links/buttons only if navigation is permitted.
- **JS:** explicit current/status updates without assuming all prior steps succeeded.
- **CSS:** external connectors, orientation and status indicators.
- **Placement:** proposed `src/components/steps/`.

## Acceptance and gaps

Test blocked/error steps, dynamic children, one-based indexing and non-color status. Current completion-by-index is not a workflow validation engine.

## Migration steps

**Delivery phase:** P3 — workflow navigation. **Task state:** 🔵 Planned.
**Prerequisites:** P2 ordered-list/status presentation and P0 event rules in the [master plan](../migration-plan.md).
**Next task:** separate current step, completed state and error/blocked status instead of inferring success from index.

1. [ ] **Define Step anatomy.** Use headings, descriptive text and explicit native links/buttons only when navigation is allowed.
2. [ ] **Resolve state ownership.** Preserve one-based compatibility while documenting programmatic current/status changes.
3. [ ] **Extract orientation styling.** Implement connectors and horizontal/vertical status variants with non-color meaning.
4. [ ] **Verify workflow changes.** Test inserted steps, rejected navigation, incomplete prior steps, errors and keyboard order.

### Native primitives and fallback

- **Native path:** an ordered list with headings, status text and real links/buttons only where navigation is allowed. Repeated steps may clone authored templates without a workflow renderer.
- **Small enhancement:** a small lifecycle-managed controller updates current/status attributes; CSS logical connectors and responsive grid/flex handle orientation. Static step descriptions remain readable without scripting. Optional `:has()` state styling falls back to explicit attributes, and no generic workflow/state framework is introduced.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/steps)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **16 local table rows + 0 supplementary declarations + 0 inherited rows = 16 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Steps Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`content-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L25) | Prop | Candidate explicit JS `contentPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L26) | Prop | Candidate `current` attribute or JS `current`; exact target contract not reviewed. | ⚪ Not reviewed | B1 one-based current markers; partial only, verify this row. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L27) | Prop | External CSS token/class for `size`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L29) | Prop | External CSS token/class for `vertical`; define supported values and responsive behavior. | 🔵 Planned | No row-level baseline established; apply page acceptance cases. |
| [`on-update:current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L30) | Callback | Candidate DOM `mui:change:current` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Step Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L36) | Prop | Candidate `description` attribute or JS `description`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L37) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L38) | Prop | Candidate `status` attribute or JS `status`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L39) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Steps Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L45) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`finish-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L46) | Slot | Candidate authored `finish-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`error-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L47) | Slot | Candidate authored `error-icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Step Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L53) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L54) | Slot | Candidate authored `icon` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L55) | Slot | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
