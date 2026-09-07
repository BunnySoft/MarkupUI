# Collapse

**Plan: Planned. Current baseline: partial core accordion; not parity-verified.**

## Baseline and target

[B1: dynamic.ts](../../../src/components/dynamic.ts) creates a native header button and toggles authored content visibility from initial `open` state. [B2: styles.ts](../../../src/components/styles.ts) supplies presentation. Group-level exclusive expansion is absent.

- **HTML:** native `details`/`summary` inside retained accordion naming conventions.
- **JS:** optional exclusive-open coordination and change notification.
- **CSS:** spacing, separators, indicator state and reduced-motion treatment.
- **Placement:** proposed `src/components/collapse/`; native-only use requires no controller.

## Acceptance and gaps

Verify independent and exclusive disclosure, disabled policy, nested panels, dynamic children and no-JS operation. Expanded-key and companion item contracts require new design.

## Migration steps

**Delivery phase:** P3 — interactions. **Task state:** 🔵 Planned.
**Prerequisites:** P0 content ownership and P3 disclosure/focus rules in the [master plan](../migration-plan.md).
**Next task:** map current accordion headers/open state onto native `details`/`summary` without losing compatibility.

1. [ ] **Adopt disclosure markup.** Preserve panel children and meaningful summaries; define generated fallback anatomy for legacy items.
2. [ ] **Specify group state.** Resolve item keys, controlled/default expansion and exclusive-open behavior independently from individual disclosure.
3. [ ] **Extract panel presentation.** Move indicators, separators and optional expansion motion to CSS with reduced-motion handling.
4. [ ] **Exercise nested panels.** Test disabled policy, dynamic children, independent/exclusive opening and keyboard access with JavaScript disabled.

### Native primitives and fallback

- **Native path:** `details`/`summary` implement disclosure and keyboard activation without custom focus code. A light-DOM wrapper only coordinates approved exclusive-open behavior and events.
- **Small enhancement:** preserve native `toggle` behavior and release coordination listeners on disconnect. CSS `[open]`, logical borders and reduced-motion rules style panels. Detect any optional exclusive-details capability; independent disclosures are the fallback rather than a replicated disclosure framework.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/collapse)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **19 local table rows + 8 supplementary declarations + 0 inherited rows = 27 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### Collapse Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`accordion`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L27) | Prop | Candidate presence attribute `accordion`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`arrow-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L28) | Prop | Candidate explicit JS `arrowPlacement` contract; behavior and lifetime not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default-expanded-names`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L29) | Prop | Candidate native default/reset state for `default-expanded-names`; distinguish live state and defaults. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L30) | Prop | No framework if/show directive; document native hidden/open state and node preservation instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`expanded-names`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L31) | Prop | Candidate JS `expandedNames` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`trigger-areas`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L32) | Prop | Candidate JS `triggerAreas` data property or authored children; shape and identity not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-item-header-click`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L33) | Callback | Candidate DOM `mui:item-header-click` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-update:expanded-names`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L34) | Callback | Candidate DOM `mui:change:expanded-names` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseItem Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L40) | Prop | Candidate presence attribute `disabled`; semantics/interaction not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`display-directive`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L41) | Prop | No framework if/show directive; document native hidden/open state and node preservation instead. | ⏭️ Intentionally omitted | No implementation credit; retain documented alternative. |
| [`name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L42) | Prop | Candidate `name` attribute or JS `name`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L43) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Collapse Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L49) | Slot | Candidate authored `arrow` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L50) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L51) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseItem Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`arrow`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L57) | Slot | Candidate authored `arrow` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L58) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L59) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header-extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L60) | Slot | Candidate authored `header-extra` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Collapse Props: on-item-header-click inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`on-item-header-click.name`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L33) | Inline record field | Candidate DOM `mui:item-header-click.name` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-item-header-click.expanded`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L33) | Inline record field | Candidate DOM `mui:item-header-click.expanded` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-item-header-click.event`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L33) | Inline record field | Candidate DOM `mui:item-header-click.event` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Collapse Slots: arrow inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`arrow.collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L49) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### Collapse Slots: header inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`header.collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L51) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseItem Slots: arrow inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`arrow.collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L57) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseItem Slots: header inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`header.collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L59) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### CollapseItem Slots: header-extra inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`header-extra.collapsed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/collapse/demos/enUS/index.demo-entry.md#L60) | Inline record field | Documented inline member; candidate plain-JS record/DOM context field. Exact shape and semantics not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
