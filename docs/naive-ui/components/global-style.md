# Global Style

**Plan: Planned for external stylesheets. Current baseline: automatically injected core styles.**

## Baseline and target

[B1: styles.ts](../../../src/components/styles.ts) embeds CSS; [B2: entry](../../../src/index.ts) installs core styling.

- **HTML:** explicit stylesheet link; scoped root classes where needed.
- **JS:** no required global style installer in the separated path; preserve compatibility entry.
- **CSS:** external baseline body/text/background rules with opt-in reset and documented scope.
- **Placement:** proposed `src/styles/`, not a new custom element.

## Acceptance and gaps

Test strict CSP, coexistence with host-page styles, theme switching and no-JS rendering. Upstream publishes no local props/slots/method table on this page; absence is recorded rather than inventing an API.

## Migration steps

**Delivery phase:** P0 — stylesheet separation. **Task state:** 🔵 Planned.
**Prerequisites:** compatibility and total-asset budgeting decisions in the [master plan](../migration-plan.md).
**Next task:** identify baseline/theme rules currently embedded in TypeScript and choose their external CSS ownership.

1. [ ] **Extract maintained CSS sources.** Separate global defaults, opt-in reset and scoped component rules without maintaining duplicate handwritten styles.
2. [ ] **Preserve loading compatibility.** Keep the current automatic installer while designing explicit external-CSS/registration entries.
3. [ ] **Define scope and themes.** Document body-level effects, host-page coexistence and inherited theme behavior without a runtime GlobalStyle component.
4. [ ] **Verify delivery paths.** Test strict CSP, no-JS CSS, theme changes and combined asset budgets; retain the explicit absence of an upstream API table.

### Native primitives and fallback

- **Native path:** normal stylesheet links, CSS custom properties, root classes, prefers-color-scheme/reduced-motion and logical properties; no runtime GlobalStyle element is needed.
- **Small enhancement:** guard container queries, `:has()` and other optional selectors with @supports; use basic scoped selectors/media queries as fallback. Preserve the old automatic installer only as compatibility packaging. Do not replace unsupported CSS with a JavaScript style engine, adopted-stylesheet requirement or Shadow DOM/theme polyfill.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/global-style)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/global-style)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; MarkupUI baseline **5dcb190 / 0.11.0**.
Documentation inventory: **0 local table rows + 0 supplementary declarations + 0 inherited rows = 0 tracker rows**.
Detailed upstream implementation/edge-case review: **Not reviewed** per item unless explicitly stated.
Current baseline evidence above is a source-inspected slice, not full parity or browser verification.
Every mapping below is a proposal. Planned rows still require implementation and the page/shared acceptance cases.
Not reviewed rows identify a candidate only; they do not promise that an attribute, event, field or method already exists.

## API tracker

No named local props, callbacks, slots or methods are declared in this public API page. The CSS/service scope above is intentional; no artificial property inventory is inferred.


<!-- END PINNED API INVENTORY -->
