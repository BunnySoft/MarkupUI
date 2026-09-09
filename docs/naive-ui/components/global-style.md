# Global Style

**🟢 Verified retained document stylesheet; explicitly opt-in, CSS only.**

## Baseline and target

[Canonical contract and acceptance](../../components/global-style.md) documents the
standalone [source stylesheet](../../../src/components/global-style/global-style.css).
`@dataengine/markup-ui/global-style/style.css` resolves to
`dist/markup-ui-global-style.css`: **661 raw / 310 gzip bytes**, ceiling **500**.
No runtime/registration/JS export or automatic component import is added.

- **HTML:** explicitly link/enable the document stylesheet.
- **JS:** no required global style installer in the separated path; preserve compatibility entry.
- **CSS:** zero-specificity html/body rules, supported tokens/system colors and a body-margin default; no universal/control/padding reset.
- **Placement:** one maintained `src/components/global-style/global-style.css`, existing CSS-only build path; separate [demo](../../../demo/components/global-style.html) and [tests](../../../tests/global-style.test.ts).

## Acceptance and gaps

77 targeted tests, declarations/build/budgets and Chromium linked/disabled/removed/
duplicate-link cascade, author/inline overrides, native scheme/media/forms, no-JS/CSP and
legacy coexistence pass. All 1,141 previous non-manifest distribution files byte-match;
old manifest entries are unchanged. No all-browser/AT/print-device or full theme parity.
The English page's **zero local API rows** remain explicit.

## Upstream source evidence

Pinned GlobalStyle.ts reads provider common themes, writes body inline font/color/
spacing/text-adjust/tap-highlight/transition values, guards with n-styled, removes the
marker on unmount, and renders no node. The document-less branch returns without style
application; its server test only verifies non-throwing rendering. These source behaviors
are individually reconciled below, not advertised as new public properties.
Native CSS replaces useful document presentation and cascade lifetime, not Vue injection/
watching, shared body markers, inline mutation or a runtime SSR adapter.

## Migration steps

**Delivery phase:** P0 — bounded opt-in document CSS. **Task state:** 🟢 Verified.
**Prerequisites:** compatibility and total-asset budgeting decisions in the [master plan](../migration-plan.md).
**Next task:** recommend Carousel (P6-03) separately; broad P0 foundation gates remain open.

1. [x] **Create maintained opt-in CSS.** One bounded body/default source; no duplicate palette or component reset. Wholesale legacy extraction remains P0-01, not completed here.
2. [x] **Preserve loading compatibility.** Add CSS-only export/build/budget; leave existing auto-installing legacy entries unchanged.
3. [x] **Define scope and themes.** Explicit document opt-in, actual token ancestry, native color-scheme and ordinary author cascade.
4. [x] **Verify delivery paths.** Native no-JS/CSP/media/legacy acceptance and four related component-route audit; preserve zero public API table rows.

### Native primitives and fallback

- **Native path:** external link, html/body :where selectors, existing custom properties and native system/print/forced colors. Unsupported styling leaves readable UA HTML; no polyfill runtime.
- **Small enhancement:** demo controls only toggle their authored link and explicit document attributes. No package JS, global event handler, font fetch or style registry. No motion is added, so no universal reduced-motion override is necessary.

The three P0 catalog routes have 148 reconciled rows/12 accepted tasks; adding the
requested Discrete (still P3) audit gives 176 rows/16 tasks without double-counting.
See the canonical/master audit for remaining P0-01–P0-09 architecture/legacy exceptions.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/global-style)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **0 local table rows + 16 explicit source supplements + 0 inherited rows = 16 tracker rows**.
Original public owner/member identity count remains **zero**; no fictional public props/
slots/methods are introduced. **Seven adapted effects/lifetime capabilities + nine
omissions, zero unresolved**. Verified is the narrowed native resolution, not the source
framework API/inline mutation contract.

## API tracker

No named local props, callbacks, slots or methods are declared in this public API page.
The following rows are **source effect/lifecycle/export supplements**, not an artificial
public property inventory.

### GlobalStyle body effects — explicit source supplements

| Upstream item · source | Kind | Native mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`-webkit-text-size-adjust`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L40) | Source body declaration | No forced text-size adjustment; preserve UA text behavior. | ⏭️ Intentionally omitted | No adjustment declaration in package CSS. |
| [`-webkit-tap-highlight-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L41) | Source body declaration | Do not suppress native tap feedback. | ⏭️ Intentionally omitted | No transparent tap-highlight rule. |
| [`padding`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L42) | Source body declaration | No padding reset; author spacing explicitly. | ⏭️ Intentionally omitted | Body/author padding not written or reset. |
| [`margin`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L43) | Source body declaration | ADAPTED: zero-specificity opt-in body margin zero. | 🟢 Verified | Linked zero margin, native unlinked margin and author/inline precedence accepted. |
| [`backgroundColor`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L44) | Source body declaration | ADAPTED: --mui-bg-page or native Canvas, not provider bodyColor injection. | 🟢 Verified | Actual body/scope distinction, schemes, author tokens, forced colors/print. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L45) | Source body declaration | ADAPTED: --mui-text-primary or native CanvasText, not exact upstream textColor2 values. | 🟢 Verified | Native body/text colors and readable media fallbacks accepted. |
| [`fontSize`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L46) | Source body declaration | ADAPTED: --mui-font-size with 1rem fallback on body only. | 🟢 Verified | Actual 16px default/18px author token; no universal input font sizing. |
| [`fontFamily`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L47) | Source body declaration | ADAPTED: --mui-font-family or local system-ui/sans-serif. | 🟢 Verified | Body system/author families; no font asset/download or native-control reset. |
| [`lineHeight`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L48) | Source body declaration | ADAPTED: --mui-line-height with 1.5 fallback. | 🟢 Verified | Actual 24px default/30.6px authored line heights and native text inheritance. |
| [`transition`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L49-L57) | Source timed style effect | No global animated body transition or timer. | ⏭️ Intentionally omitted | Reduced-motion path adds no animation/transition and touches no component motion policy. |

### GlobalStyle lifetime and framework boundaries — explicit source supplements

| Upstream item · source | Kind | Native mapping | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`n-styled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L39-L66) | Source ownership marker | No first-owner singleton or duplicate-provider warning; native CSS cascade instead. | ⏭️ Intentionally omitted | Duplicate links follow ordinary stylesheet lifetime, without a body marker. |
| [`inject / watchEffect`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L18-L38) | Source provider/reactivity boundary | No upward provider theme merge or reactive body mutation; document tokens must be authored on actual html/body ancestors. | ⏭️ Intentionally omitted | Nested dark/RTL scope does not mutate body; CSS reacts through normal inheritance. |
| [`onUnmounted`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L70-L74) | Source cleanup capability | ADAPTED: disable/remove the authored stylesheet to expose the remaining cascade; no callback or inline state restoration manager. | 🟢 Verified | Repeated disable/remove/reinsert preserves author inline/body settings; no stale singleton ownership. |
| [`typeof document guard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L16-L17) | Source SSR boundary | No runtime guard/SSR style adapter; server-authored HTML links CSS normally. | ⏭️ Intentionally omitted | Source SSR test is non-throwing rendering, not full style-output parity. |
| [`render`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/src/GlobalStyle.ts#L76-L78) | Source renderer boundary | No null-rendering framework component, custom element or virtual node. | ⏭️ Intentionally omitted | Native link is the actual styling opt-in; no JS/global distribution. |
| [`NGlobalStyle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/index.ts#L1) | Source export | No runtime export/registration; only the explicit package stylesheet export. | ⏭️ Intentionally omitted | No fake JS budget or dependency. |


<!-- END PINNED API INVENTORY -->
