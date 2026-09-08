# Anchor

**🟢 Verified for retained native Anchor/AnchorLink and scrollspy scope.**
All **11 original public identities** remain. Six explicit source-only supplements make
**17 tracker rows: 12 Verified adapted targets, 5 intentional omissions**.

## Baseline and delivery

Historical [foundation.ts](../../../src/components/foundation.ts) supplies native link
wrapping, not active-section tracking. The new [Anchor helper](../../../src/components/anchor/anchor.ts)
adopts real named navigation/fragment links and marks actual location from ordered geometry.
The [native scroll context](../../../src/components/anchor/scroll.ts) is a concrete small
primitive for Back Top next, not a scrolling/animation framework.

- **HTML:** original nested native links, labels and uniquely identified target sections.
- **JS:** explicit scroll-root validation, deterministic active location, safe fragment
  decoding, readonly diagnostics and lifecycle-managed native scrolling/observation.
- **CSS:** external native sticky, scroll-margin, rail/block/current/focus and motion/print.
- **Evidence:** [API/loading/limits/acceptance](../../components/anchor.md),
  [native demo](../../../demo/components/anchor.html), [tests](../../../tests/anchor.test.ts).

Native href/hash/history/modifiers/defaultPrevented/focus remain untouched. No click
interceptor, router, generated TOC, measured rail animation, Affix/Scrollbar dependency,
CSS-in-JS or provider is introduced.

## Upstream source evidence

Pinned [BaseAnchor tracking/scrolling](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/BaseAnchor.tsx),
[AnchorLink rendering](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/Link.tsx),
[adapter/Affix forwarding](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/AnchorAdapter.tsx)
and [offset calculation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/utils.ts)
were read. Source uses collected hrefs, document scroll throttling, geometry-based
selection and measured rail/slot positioning. The native target preserves useful tracking,
but defines deterministic ties, visible-final-section behavior, explicit root ownership,
decoded IDs and reduced-motion scrolling rather than copying renderer/animation machinery.

## Migration steps

**Delivery phase:** P3 — navigation. **Task state:** 🟢 Verified retained scope.
**Prerequisites:** native links/sticky/overflow conventions; no runtime Affix dependency.
**Next task:** Back Top; overall P3 remains incomplete.

1. [x] **Preserve deep links.** Native nested fragment navigation, UTF-8/special IDs,
   browser history/focus and authored AnchorLink labels retained.
2. [x] **Add active-location tracking.** Explicit root and deterministic ordered geometry,
   gap/offset/end/tie rules, one current marker and ownership transfer accepted.
3. [x] **Map scrolling and offsets.** Native root-only requests and CSS scroll-margin,
   reduced-motion enforcement and no readonly-field/global-style overrides.
4. [x] **Verify navigation history.** Native Back/hash, missing/changed targets, root
   resizing/scroll planes, nesting, cleanup and no-JS links have evidence.

### Native primitives and fallback

Native links and scroll-margin work before enhancement. Passive scroll/rAF and optional
ResizeObserver coordinate deterministic geometry; no IntersectionObserver delivery-order
heuristic or polling loop is used. Unsupported ResizeObserver falls back to native events
and explicit update. Sticky remains CSS with native containing-block limits. No-JS keeps
destinations usable; only current-location tracking is absent.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/anchor)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor)
- [Catalog/provenance](../index.md) · [Architecture/statuses](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`;
historical MarkupUI baseline **5dcb190 / 0.11.0**.
Inventory: **11 local rows + 6 source-only additions = 17**. Original owner/name/source-line
identities are preserved. **ADAPTED** denotes the linked native contract, not identical
Vue prop/selector/provider/scroll-animation behavior. Omissions receive no parity credit.

### Anchor Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`affix`][a22] | Prop | ADAPTED optional native sticky CSS class. | 🟢 Verified | Native containing block; no Affix dependency or fixed/absolute prop inheritance. |
| [`bound`][a23] | Prop | ADAPTED finite tolerance after the location reference line. | 🟢 Verified | Default 12; bounded viewport/offset and deterministic tie/end rules. |
| [`ignore-gap`][a24] | Prop | ADAPTED snapshot ignoreGap option. | 🟢 Verified | False clears between section boxes; true retains latest passed start. |
| [`offset-target`][a25] | Prop | ADAPTED explicit Window/Document/element root. | 🟢 Verified | Actual same-document vertical scrollport; string/function providers and mixed scroll planes excluded. |
| [`show-rail`][a26] | Prop | ADAPTED external rail/no-rail CSS. | 🟢 Verified | Per-link marker, no measured moving rail. |
| [`show-background`][a27] | Prop | ADAPTED external current-background/no-background CSS. | 🟢 Verified | No generated position/width slot. |
| [`type`][a28] | Prop | ADAPTED rail/default and block CSS classes. | 🟢 Verified | Scoped native presentation; no style-object/theme renderer. |

### AnchorLink Props

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`href`][a34] | Prop | ADAPTED unchanged native link href. | 🟢 Verified | URL/hash/history/target/modifiers remain browser-owned; safe target resolution has explicit diagnostics. |
| [`title`][a35] | Prop | ADAPTED authored native link text/title. | 🟢 Verified | No text-to-HTML or link generator. |

### AnchorLink Slots

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`title`][a41] | Slot | ADAPTED original native label markup. | 🟢 Verified | Nodes/listeners preserved; no VNode render slot. |

### Anchor Methods

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`scrollTo`][a47] | Method | ADAPTED validated native root-only fragment scroll. | 🟢 Verified | Boolean request result, offset/reduced motion; no URL/focus changes or fabricated click. |

### Source-only supplements — six explicit additions

| Upstream item · source | Kind | MarkupUI disposition | Status | Evidence / boundary |
| --- | --- | --- | --- | --- |
| [`default` (AnchorLink)][link] | Source-only nested-content slot | ADAPTED authored nested TOC/list structure. | 🟢 Verified | Explicit nested Anchor root boundaries and native links. |
| [`internalScrollable` / `NScrollbar`][base] | Source-only internal wrapper | No automatic Scrollbar component wrapper. | ⏭️ Intentionally omitted | Author native overflow explicitly. |
| [`AnchorProps` / `AnchorInst`][adapter], [`AnchorLinkProps`][link], [`BaseAnchorInst`][base] | Source-only type group | No Vue instance/prop aliases. | ⏭️ Intentionally omitted | Explicit native controller/root/issue/location types. |
| [`affixProps`, `affixPropKeys`, `NAffix`][adapter] | Source-only forwarding group | No implicit Affix runtime/prop inheritance. | ⏭️ Intentionally omitted | CSS sticky is the declared affix adaptation. |
| [`AnchorInjection`, `anchorInjectionKey`, theme/config/cssVars][link] | Source-only provider/theme group | No injection, registry or CSS-in-JS. | ⏭️ Intentionally omitted | Per-link ownership and external CSS. |
| [`updateBarPosition`, `disableTransitionOneTick`, `setActiveHref`][base] | Source-only internal methods | No measured rail/slot animation or internal alias API. | ⏭️ Intentionally omitted | Deterministic location plus public native scrollTo instead. |

[a22]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L22
[a23]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L23
[a24]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L24
[a25]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L25
[a26]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L26
[a27]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L27
[a28]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L28
[a34]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L34
[a35]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L35
[a41]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L41
[a47]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/demos/enUS/index.demo-entry.md#L47
[link]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/Link.tsx
[base]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/BaseAnchor.tsx
[adapter]: https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/anchor/src/AnchorAdapter.tsx

<!-- END PINNED API INVENTORY -->
