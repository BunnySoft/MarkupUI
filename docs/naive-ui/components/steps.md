# Steps

**Plan: 🟢 Verified retained Steps/Step native summary and selection-intent scope; seven explicit omissions.**

## Baseline and target

[B1: navigation.ts](../../../src/components/navigation.ts) remains the historical current/
complete-marker implementation. The new [optional controller](../../../src/components/steps/steps.ts)
keeps native ol/li, authored headings/descriptions/status text and typed actions; it never
assumes previous business steps succeeded. [External CSS](../../../src/components/steps/steps.css)
owns markers/connectors/layout. See the [canonical contract and acceptance](../../components/steps.md).

## Acceptance and gaps

70 targeted tests, build/budgets and Chromium cover indexing/status precedence, native
activation/forms/disabled controls, hidden/reordered/nested items, focus and conditional
restoration. This is progress/navigation presentation, not a wizard or controlled Vue
compatibility layer. No router, implicit validation/advancement, renderer or Icon dependency.

## Migration steps

**Delivery phase:** P3 — native progress/navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** P2 ordered-list/status presentation and P0 event rules in the [master plan](../migration-plan.md).
**Next task:** Loading Bar; the navigation workstream is accepted for declared retained scopes,
not all P3 overlays/feedback/transition/service inventories.

1. [x] **Define Step anatomy.** Authored ol/li, chosen heading levels, status words, icons and native controls.
2. [x] **Resolve state ownership.** One-based current/default adaptation, explicit completion and silent programmatic updates.
3. [x] **Extract orientation styling.** Logical markers/connectors, horizontal/vertical/content placement and non-color status.
4. [x] **Verify workflow changes.** Selection intents, application rejection, native keyboard, hidden/reordered/current identity and cleanup.

### Native primitives and fallback

- **Native path:** ordered progress summary, authored status words and real links; JS-only buttons
  can remain hidden until setup. Native templates stay inert until the application chooses to clone them.
- **Small enhancement:** an explicit controller adopts existing nodes, changes one status Text
  node and owned state attributes, and reports native button intents. CSS/explicit refresh replaces
  layout polling and generated workflow DOM. No-JS summaries and destinations remain usable.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/steps)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps)
- [Catalog and provenance](../index.md) · [Architecture and statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **16 original local table rows + seven explicit source supplements + zero inherited
rows = 23 tracker rows**. All original owner/name/source identities remain.
**16 Verified adapted targets; seven intentionally omitted targets.**

Pinned Steps.tsx, Step.tsx, public index and Markdown were reviewed. The source injects parent
state and indexes flattened children, treats undefined current as all-process, derives earlier
finish by index and only invokes current callbacks on item clicks. The target instead uses
direct native li identity, null/unset and explicit completion. Per-item status override
precedence is retained. These differences are intentional, not source-parity claims.
There is no upstream defaultCurrent prop; that optional target-only seed is documented separately.

### Steps Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`content-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L25) | Prop | Native icon/body right/bottom flow via external class. | 🟢 Verified | Horizontal only; vertical overrides placement without moving nodes. |
| [`current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L26) | Prop | Silent nullable one-based current, zero before-first and count+1 after-last. | 🟢 Verified | Visible-item indexing, identity-preserving refresh and explicit bounds; no implicit completion. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L27) | Prop | External small/medium CSS. | 🟢 Verified | Native text wrapping and marker scaling, no measured geometry. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L28) | Prop | Current item's default process/wait/finish/error state. | 🟢 Verified | Explicit per-item status wins; noncurrent defaults wait. Literal readable labels. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L29) | Prop | External vertical class, logical connectors. | 🟢 Verified | Responsive stacking is presentation, not a controlled callback. |
| [`on-update:current`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L30) | Callback | mui:steps-request with ordinal, previous position and actual li/button. | 🟢 Verified | Intent only; application explicitly accepts/declines. No synthesized programmatic events. |

### Step Props

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`description`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L36) | Prop | Authored description HTML/text. | 🟢 Verified | Original nodes and native links preserved. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L37) | Prop | Native action button disabled/fieldset; native non-link text for unavailable destinations. | 🟢 Verified | No aria-disabled-only fake disabling, changed hrefs or disabled-state overwrite. |
| [`status`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L38) | Prop | Authored data-step-status with four validated values. | 🟢 Verified | Overrides current status; wait/error may coexist with current position. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L39) | Prop | Authored data-step-title with chosen heading level. | 🟢 Verified | No title renderer or heading replacement. |

### Steps Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L45) | Slot | Direct authored li children; optional inert templates. | 🟢 Verified | No flattening/VDOM/provider; nested lists independent. |
| [`finish-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L46) | Slot | Authored decorative completed-state icon per item. | 🟢 Verified | No shared slot projection or automatic icon renderer; words carry status. |
| [`error-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L47) | Slot | Authored decorative error icon per item. | 🟢 Verified | No mandatory Icon or switch transition. |

### Step Slots

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L53) | Slot | Authored descriptive content. | 🟢 Verified | Not a generated/hidden tabpanel or form step. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L54) | Slot | Optional native decorative icon child. | 🟢 Verified | Authored identity/markup and accessible status text retained. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/demos/enUS/index.demo-entry.md#L55) | Slot | Authored title/heading region. | 🟢 Verified | Buttons/links remain native separate actions, not whole-item clickable spans. |

### Steps / Step explicit source-only supplements

These source additions are distinct from the sixteen original public Markdown rows.

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`onUpdateCurrent`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Steps.tsx#L51-L53) | Source callback alias | One native request notification. | ⏭️ Intentionally omitted | No alias arrays/duplicate callbacks. |
| [`useTheme.props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Steps.tsx#L33) | Source theme group | External CSS/author styles. | ⏭️ Intentionally omitted | No theme objects/provider/CSS-in-JS. |
| [`StepsProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Steps.tsx#L63) | Public source type | Native StepsOptions/StepsController. | ⏭️ Intentionally omitted | No Vue prop extraction compatibility. |
| [`StepsSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Steps.tsx#L65-L69) | Public source type | Native authored children. | ⏭️ Intentionally omitted | No VNode callback record. |
| [`StepProps`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Step.tsx#L31) | Public source type | Native li/attributes and StepState snapshot. | ⏭️ Intentionally omitted | No prop constructor. |
| [`StepSlots`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Step.tsx#L33-L37) | Public source type | Native title/content/icon regions. | ⏭️ Intentionally omitted | No slot function signatures. |
| [`internalIndex`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/steps/src/Step.tsx#L24-L28) | Explicit internal boundary | Native visible DOM ordinal. | ⏭️ Intentionally omitted | Source says parent-only, not a public user-settable Step prop. |

<!-- END PINNED API INVENTORY -->
