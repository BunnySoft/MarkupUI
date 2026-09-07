# Page Header

**Migration status: 🟢 Verified retained CSS-only native Page Header scope.**
No Custom Element, router/history helper, renderer or mandatory Button/Avatar/Breadcrumb import.

## Baseline and target

[A1: retained contract and acceptance](../../components/page-header.md) and
[S1: native Page Header CSS](../../../src/components/page-header/page-header.css) implement the slice.
[B1: foundation.ts](../../../src/components/foundation.ts) remains unchanged.

- **HTML:** `header`, heading, breadcrumb navigation and native back/action buttons.
- **JS:** none in the library; explicit native click/application handler or href owns navigation.
- **CSS:** external responsive title, avatar, subtitle and action regions.
- **Placement:** `src/components/page-header/page-header.css`; stylesheet-only package export `@dataengine/markup-ui/page-header/style.css`.

## Acceptance and gaps

A1 records **340 passing tests** (13 focused), build/export gates and Chromium native
heading/landmark/action names, keyboard/back/forms, 280px wrapping, RTL/zoom, print and
CSS/legacy coexistence. All eight native region conventions are explicit; there is no
generated content or runtime prop/slot precedence. CSS is **778 gzip bytes / 1,500 ceiling**;
core remains 14,611/15,000. Arbitrary asset/control sizing and semantic ownership stay authored.

## Migration steps

**Delivery phase:** P2 — compound content. **Task state:** 🟢 Verified retained CSS-only scope.
**Prerequisites:** P1 native-control and P2 external-CSS conventions in the [master plan](../migration-plan.md); no runtime component imports required.
**Next task:** coordinator selection of Divider, then the documented layout/content sequence; P2 remains incomplete.

1. [x] **Resolve content regions.** A1/S1 cover all eight slots as original native regions; string/title-attribute ambiguity and source/doc extra precedence differences are explicit.
2. [x] **Separate back navigation.** Native href or named type=button/application click; no mui:back, history guess, implicit router or generated back icon.
3. [x] **Implement responsive CSS.** Grid/flex/logical spacing and wrapped title groups preserve source order; 280px long-back-label regression fixed and verified.
4. [x] **Review heading/navigation semantics.** A1 verifies contextual landmarks, h1/h2, named actions/nav, native forms/focus, empty/hidden/templates, RTL/zoom and CSS-only coexistence.

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
Inventory: **12 original public rows + 3 explicit source theme supplements = 15 rows**:
**12 Verified ADAPTED native targets and 3 Intentionally omitted framework contracts**.
A1/S1 establish retained native evidence, not Vue prop/slot, provider or pixel parity.
The public extra prop description and actual source disagree on slot/string precedence;
one authoritative authored DOM region avoids claiming that either runtime precedence is implemented.
Breadcrumb content maps to the documented header region, not an invented extra API.


### PageHeader Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L19) | Prop | ADAPTED authored extra-region text/content. | 🟢 Verified | One DOM source; no ambiguous prop/slot precedence adapter. |
| [`subtitle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L20) | Prop | ADAPTED authored native subtitle. | 🟢 Verified | No attribute coercion or generated fallback. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L21) | Prop | ADAPTED author-chosen heading/text node. | 🟢 Verified | Native title attribute remains advisory; no synthesized heading level. |
| [`on-back`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L22) | Callback | ADAPTED ordinary native click/application handler, or href navigation. | 🟢 Verified | No mui:back event, automatic history/router or callback-generated control; native form type remains authored. |

### PageHeader Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L28) | Slot | ADAPTED native asset region. | 🟢 Verified | Original paint/viewBox/sizing/accessible ownership; no Avatar/icon import or asset loader. |
| [`header`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L29) | Slot | ADAPTED native top region, optionally named breadcrumb/navigation. | 🟢 Verified | Authored links/current item; no generated route or mandatory Breadcrumb module. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L30) | Slot | ADAPTED native content region. | 🟢 Verified | Original nodes/listeners/controls and optional application templates. |
| [`extra`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L31) | Slot | ADAPTED extra text/actions region. | 🟢 Verified | Native links/button types/disabled/forms; no renderer. |
| [`footer`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L32) | Slot | ADAPTED native footer-content region. | 🟢 Verified | No automatic contentinfo/live role or content generation. |
| [`subtitle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L33) | Slot | ADAPTED native subtitle node. | 🟢 Verified | Original content, wrapping and semantics remain authored. |
| [`title`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L34) | Slot | ADAPTED native heading/text node. | 🟢 Verified | Real h1/h2 hierarchy and explicit ARIA preserved; no automatic heading synthesis. |
| [`back`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md#L35) | Slot | ADAPTED original native action icon/text. | 🟢 Verified | One explicit action name; no unlabeled clickable div, copied icon or mandatory asset. |

### Explicit source-only supplements

| Upstream item · source | Kind | MarkupUI mapping | Status | Evidence / scope |
| --- | --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/src/PageHeader.tsx) | Source theme prop | External scoped CSS/tokens. | ⏭️ Intentionally omitted | No theme provider/object or generated inline CSS variables. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/src/PageHeader.tsx) | Source theme prop | Native CSS cascade. | ⏭️ Intentionally omitted | No runtime object adapter or style renderer. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/src/PageHeader.tsx) | Source theme prop | Maintained external CSS. | ⏭️ Intentionally omitted | No framework internal theme plumbing. |

<!-- END PINNED API INVENTORY -->
