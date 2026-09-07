# Page Header

**Plan: Planned. Current baseline: composable structure only.**

## Baseline and target

[B1: foundation.ts](../../../src/components/foundation.ts) supplies headings/links; no page-header controller exists.

- **HTML:** `header`, heading, breadcrumb navigation and native back/action buttons.
- **JS:** optional back event; application code decides navigation rather than assuming browser history.
- **CSS:** external responsive title, avatar, subtitle and action regions.
- **Placement:** proposed `src/components/page-header/`; favor a documented composition.

## Acceptance and gaps

Check heading order, long titles, action overflow and explicit back behavior. Each upstream content region needs a named light-DOM convention.

## Migration steps

**Delivery phase:** P2 — compound content. **Task state:** 🔵 Planned.
**Prerequisites:** P1 Button/Card anatomy and P2 Typography in the [master plan](../migration-plan.md).
**Next task:** write native header markup for title, subtitle, breadcrumb and action regions.

1. [ ] **Resolve content regions.** Map avatar, title, subtitle, extra, default and footer areas to authored children rather than render callbacks.
2. [ ] **Separate back navigation.** Use an explicit link/action; do not assume browser history always has a safe previous destination.
3. [ ] **Implement responsive CSS.** Keep long titles readable and action order stable when regions wrap.
4. [ ] **Review heading/navigation semantics.** Test empty regions, keyboard order and application-controlled back behavior before closing slot rows.

### Native primitives and fallback

- **Native path:** `header`, real headings, breadcrumb links and native action/back buttons form authored light-DOM regions. A page header does not require its own component controller.
- **Small enhancement:** CSS grid/flex, logical gaps and optional container queries manage wrapping; plain flow/media queries remain the fallback. Only explicit application back behavior needs a listener, disposed with its owner; no native slots or router framework are implied.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/page-header)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **12 local table rows + 0 supplementary declarations + 0 inherited rows = 12 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.


### PageHeader Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L19) | Prop | Candidate `extra` attribute or JS `extra`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`subtitle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L20) | Prop | Candidate `subtitle` attribute or JS `subtitle`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L21) | Prop | Candidate `title` attribute or JS `title`; exact target contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`on-back`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L22) | Callback | Candidate DOM `mui:back` notification; detail/timing must be reviewed, preserving existing events. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

### PageHeader Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L28) | Slot | Candidate authored `avatar` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L29) | Slot | Candidate authored `header` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L30) | Slot | Candidate authored `default` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L31) | Slot | Candidate authored `extra` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L32) | Slot | Candidate authored `footer` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`subtitle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L33) | Slot | Candidate authored `subtitle` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L34) | Slot | Candidate authored `title` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |
| [`back`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L35) | Slot | Candidate authored `back` child region/template; exact DOM/ownership contract not reviewed. | ⚪ Not reviewed | No row-level baseline established; apply page acceptance cases. |

<!-- END PINNED API INVENTORY -->
