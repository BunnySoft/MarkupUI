# Marquee

**🟢 Verified retained single-track native traversal scope.** Optional Web Animations
and external CSS move the original noninteractive authored content. Every pause
cancels translation into a full native-scrolling/static view; media preferences wrap
content. No obsolete marquee tag, cloned/mirrored track or source seamless-loop claim.

## Baseline and implementation evidence

The unchanged [registry](../../../src/components/elements.ts) has no Marquee.
The optional [native helper](../../../src/components/marquee/marquee.ts) operates on
authored native DOM, not a synthetic Custom Element. [External CSS](../../../src/components/marquee/marquee.css)
owns layout/scroll/focus/media. See [canonical API/acceptance](../../components/marquee.md),
[tests](../../../tests/marquee.test.ts) and [separate local demo](../../../demo/components/marquee.html).

Reviewed pinned [props](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/props.ts#L6-L16),
[public type export](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/public-types.ts),
[measurement/timing](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L26-L76)
and [original/mirror/auto-fill rendering](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L97-L154).
Even auto-fill=false renders a mirror in source; that is deliberately not reproduced.
Native pause/direction/pass/delay/media/lifetime options are explicit local additions,
not undocumented source public props.

**Default-style follow-up:** [rendered pinned comparison](../../style-audit/components/marquee.md).
Short tracks now fill the viewport; normal whitespace and native image baseline match
the source, with no invented edge fade or panel style. A local light print surface
keeps default dark-theme text readable, while the existing public
`--mui-marquee-focus` token stays authoritative. The first 250/500/1000ms of a
supported 48px/s pass match source translations, but the native pass covers only
overflow and never adds source mirror groups. Automatic infinite motion, seamless
repetition and source scheduling remain intentionally different.

## Migration steps

**Delivery phase:** P6 — optional motion. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** explicit external CSS, native original-node ownership, accessible
motion control and event-driven measurements; no animation/provider dependency.
**Next task:** Equation alternative-guidance resolution, separately. P0 foundation
tasks remain open/partial; this page does not close them.

1. [x] **Define static anatomy.** One original bounded text/phrasing/image track,
   named native scrollport and meaningful no-JS fallback; no duplicate or obsolete tag.
2. [x] **Specify user control.** Real enabled labelled button, sticky user pause,
   focus/hover/selection/media/visibility reasons and full-content static view.
3. [x] **Isolate motion CSS.** External layout/media, native linear alternate passes,
   layout-pixel measurement, observed restart and complete callback/resource disposal.
4. [x] **Test moving content.** Native motion/resize/RTL/zoom/control/selection/media/
   no-JS/CSP/coexistence, deterministic lifetime/error tests and budget gates.

### Native primitives and fallback

Use native div/section/content/button, not marquee, canvas or a VNode renderer.
Enhancement is opt-in (`active=false`); finite one-pass default, explicit infinite
alternate option. Pausing cancels motion, not freezes clipped content. Full original
content remains horizontally scrollable; reduced/forced/print wrap it. Only
noninteractive phrasing/images may move. No role=grid/tabs, focus trap, live tick spam,
clone, forced-reflow iteration engine, per-frame measurement or external dependency.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/marquee)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **3 original table rows + 5 explicit source-behavior supplements +
3 inherited theme rows = 11 tracker rows**. All three original identity/source links
remain one-for-one. **5 native adaptations + 6 intentional omissions; zero unresolved.**
These dispositions are not seamless ticker, automatic motion, framework/theme,
arbitrary-content renderer or all-browser/AT parity.

### Marquee Props

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`auto-fill`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L21) | Prop | No repeat-to-fill or mirror copies; one original track. Short fitting content remains static. | ⏭️ Intentionally omitted |
| [`speed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L22) | Prop | Native speed=48 default, finite 1..1000 layout CSS px/s. Overflow-only alternate traversal, not source full-track duplicated loop. | 🟢 Verified |

### Marquee Slots

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/demos/enUS/index.demo-entry.md#L28) | Slot | Original authored native text/phrasing/images; bounded noninteractive subset. Nodes/listeners/selection/order stay intact. No arbitrary VNode or repeated slot execution. | 🟢 Verified |

### Explicit source-behavior supplements

These five implementation observations were absent from the original inventory.
They are not additional upstream public props or utility-export promises.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`container/content resize observation`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L67-L73) | Source behavior | Native ResizeObserver uses layout dimensions; zero/hidden/fitting states are static. Actual width changes restart; same-size delivery does not. | 🟢 Verified |
| [`duration from content width / speed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L41-L46) | Source behavior | Bounded overflow/speed duration instead of repeatCount×contentWidth/speed. No visual-rectangle/zoom unit mixing. | 🟢 Verified |
| [`direction / delay / iteration variables`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L48-L56) | Source behavior | Explicit physical left/right, initial delay and finite/infinite alternating passes replace fixed normal/0/infinite CSS variables. Default is opt-in static, not source automatic motion. | 🟢 Verified |
| [`original / mirror / auto-fill groups`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L97-L154) | Source behavior | No duplicate DOM/readable/focusable content, slot-repeat renderer or seamless duplicated-track effect, even when auto-fill is false. | ⏭️ Intentionally omitted |
| [`forced-reflow iteration restart`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/Marquee.tsx#L59-L76) | Source behavior | No nextTick/offsetTop iteration restart. Native alternating timing owns passes; only actual events/refresh remeasure. | ⏭️ Intentionally omitted |

### Explicit source-inherited theme props

The [source spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/marquee/src/props.ts#L7)
adds three inherited theme identities.

| Upstream item · source | Kind | Native mapping / explicit boundary | Status |
| --- | --- | --- | --- |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | Explicit external CSS, no injected theme/provider graph. | ⏭️ Intentionally omitted |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | No CSS-in-JS override merge or arbitrary geometry/style strings. | ⏭️ Intentionally omitted |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No internal override precedence; legacy inline-theme/P0 exceptions remain separate. | ⏭️ Intentionally omitted |

<!-- END PINNED API INVENTORY -->

## Acceptance and limits

The following numbers describe the historical migration, before the linked style pass.

**69 targeted tests** (42 Marquee + 27 native/legacy), declarations/build and unchanged
prior budgets pass. Chromium verified actual linear movement, finite finish once,
native controls/selection/forms, sticky pause/static reveal, resize/content/hidden/
RTL/CSS zoom, reduced/forced/print, narrow/no-JS, strict CSP and classic/legacy coexistence.
Review fixed motion continuing after the pause control became disabled; author
disabled/hidden/fieldset state now stops motion without being overwritten.

Measured gzip: **4,920 ESM / 5,062 classic / 552 CSS** under **6,000 / 6,000 / 1,000**.
Full original-content/geometry bounds, restart semantics, ownership, observed browser
measurements and limitations are in the canonical record. Main P6 retained scopes
are now reconciled; Equation/QR Code/Legacy Grid/Legacy Transfer alternative tasks
and broad P0 foundations are not completed by this acceptance.
