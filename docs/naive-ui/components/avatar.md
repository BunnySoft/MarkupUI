# Avatar

**Migration status: 🟢 Verified for the retained Avatar and Avatar Group scope in commit `9afc818`.**
This is not full Naive UI API/pixel parity or all-browser certification. Framework-specific
and deliberately reduced surfaces remain **⏭️ Intentionally omitted** below.

## Baseline and target

[A1: accepted API and test/browser record](../../components/avatar.md) is the implementation
authority for this page. The original comparison baseline was `5dcb190`; the retained
standalone implementation is now committed as `9afc818`.

| Evidence | Current implementation |
| --- | --- |
| [S1: Avatar controller](../../../src/components/avatar/avatar.ts) | Authored image/content preservation, live source/default handling, bounded fallback, template content and lifecycle cleanup. |
| [S2: group controller](../../../src/components/avatar/group.ts) | Authored Avatar children, maximum visible count and native details/summary overflow; identities/order preserved. |
| [S3: external stylesheet](../../../src/components/avatar/avatar.css) | Size/shape/fit, image state, group overlap, logical layout and overflow summary presentation. |
| [S4: standalone registration](../../../src/components/avatar/index.ts) | `MuiAvatar`, `MuiAvatarGroup` and `registerAvatar`; conflicting pre-existing definitions throw. |
| [D1: classic demonstration](../../../demo/components/avatar.html) | Separate [JavaScript](../../../demo/components/avatar.js) and [CSS](../../../demo/components/avatar.css). |

- **HTML:** native image/text content and optional authored fallback/placeholder templates;
  group members remain real light-DOM Avatar elements.
- **JS:** the standalone controllers adopt nodes, synchronize retained attributes, own
  listeners/observers and move overflow members without recreating them.
- **CSS:** external component CSS owns appearance. Numeric size and the object-fit convenience
  attribute write isolated CSS properties; automatic fitting also writes a private scale
  property on the content wrapper. Account for these inline CSSOM writes in strict CSP.
- **Placement:** implemented under `src/components/avatar/`; not added to the aggregate core.

## Acceptance and gaps

The accepted record reports **43 passing tests** from `pnpm check` (16 focused Avatar tests
and 27 existing native tests), a successful build, and **Chromium** interaction evidence.
Covered cases include preserved nodes, fallback/source changes, templates, pre-upgrade values,
reconnect, group replacement/order, native lazy loading, overflow keyboard activation and
registration conflicts. These are recorded results, not tests rerun by this documentation edit.

The new [default-style audit](../../style-audit/components/avatar.md) supersedes the original
compatibility-default decision: Avatar now defaults to a 34px, 3px-radius square, with white
normal 14px text and `#ccc` light background. Group members remain round. `square` is still
explicitly supported, and `round` wins if both attributes occur.
Native loading replaces observer configuration. Framework render callbacks, data-option
rendering, arbitrary rest rendering and hover-only expansion are excluded. Automatic text
fitting uses the pinned 90%-of-outer-box scale rule, with scoped ResizeObserver updates and
preserved text/node ownership. The new default-style follow-up supersedes the migration's
font-sizing/ellipsis simplification. See A1 for exact bounds and limitations.

## Standalone loading and budgets

Use `@dataengine/markup-ui/avatar` and the separate
`@dataengine/markup-ui/avatar/style.css` export. Plain-browser applications can serve
`dist/markup-ui-avatar.js` or `dist/markup-ui-avatar.global.js` plus
`dist/markup-ui-avatar.css`; no consumer compiler or runtime dependency is required.

Register the enhanced Avatar entry **before** the legacy aggregate. The aggregate preserves
already-defined names; loading enhanced Avatar after the legacy basic definition throws a
clear conflict rather than silently upgrading it. Do not mix the ESM and classic Avatar
distributions in one document.

Original migration core was **14,611 bytes gzip**; the **15,000 ceiling** remains unchanged.
See the current manifest/style audit for updated measurements. The separate Avatar ESM/classic entries
each have **4,000-byte gzip ceilings**, and CSS has a **1,500-byte ceiling**. Consult the
build manifest for exact standalone output sizes; these ceilings are not actual size claims.

## Migration steps

**Delivery phase:** P1 — pilot. **Task state:** 🟢 Verified for the retained scope in `9afc818`.
**Prerequisites:** P0 native-child adoption, external CSS and image URL/error contracts in the [master plan](../migration-plan.md).
**Next task:** proceed to Button, then Card; reopen omitted Avatar scope only through a separate reviewed decision.

1. [x] **Reconcile image ownership.** S1 and A1 establish authored image/content identity, live source changes, pre-upgrade values and preserved listeners.
2. [x] **Resolve loading/failure APIs.** Native lazy loading, one fallback attempt per primary source and `mui:error`/`mui:load` notifications are documented and accepted.
3. [x] **Separate group scope.** S2/A1 establish authored-member ordering, CSS inheritance, visible-member limits and keyboard-operable native overflow.
4. [x] **Close the retained rows.** A1 records build/43-test and Chromium evidence, standalone loading, registration conflicts and payload ceilings.

### Native primitives and fallback

- **Native path:** light-DOM custom elements adopt image/content nodes; groups use native
  details/summary overflow. Explicit fallback/placeholder templates are cloned once with
  `document.importNode(template.content, true)`. Data-driven group template cloning remains
  application code, not a library renderer.
- **Small enhancement:** native image load/error/loading behavior, MutationObserver and
  custom-element lifecycle support the accepted scope. External CSS uses grid/flex/logical
  properties. No custom IntersectionObserver lazy-loading API, Shadow DOM or image polyfill
  is supplied. Recorded browser evidence covers Chromium; broader capability verification
  remains outside this sign-off.

## Retained-scope accounting

All **35** upstream inventory rows remain: 13 Avatar props/callbacks, 6 group props,
6 Avatar/group content regions and 10 supplementary entries. **19 rows are Verified for
their adapted native target; 16 are Intentionally omitted.** Omission is not implementation
credit. Verified child/content alternatives do not imply support for upstream VNode callbacks
or their scoped payloads.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/avatar)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; comparison baseline **5dcb190 / 0.11.0**; retained Avatar implementation **9afc818**.
Documentation inventory: **25 local table rows + 10 supplementary declarations + 0 inherited rows = 35 tracker rows**.
Full upstream internal behavior has not been audited. The rows below instead record the
accepted MarkupUI target in A1/S1–S4, with the stated tests and Chromium evidence.
Verified means retained-target acceptance, not identical defaults, VNode compatibility or
all-browser behavior. Textual statuses and explicit omission reasons are authoritative.


### Avatar Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L26) | Prop | Boolean `bordered` attribute; external border styling/token. | 🟢 Verified | A1/S3: retained CSS appearance. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L27) | Prop | Author CSS sets `--mui-avatar-background` and `--mui-avatar-color`; no inline color prop. | 🟢 Verified | A1/S3: adapted CSS-token contract. |
| [`fallback-src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L28) | Prop | `fallback-src` / `.fallbackSrc`; one alternate attempt per primary source; set before changing primary source. | 🟢 Verified | A1/S1: bounded failure and fallback tests. |
| [`img-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L29) | Prop | Author native image attributes directly, including alt/decoding/referrer policy; object forwarding is not supported. | 🟢 Verified | A1/S1: native-HTML replacement, not prop-bag compatibility. |
| [`intersection-observer-options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L30) | Prop | Native image lazy loading replaces configurable intersection observation. | ⏭️ Intentionally omitted | A1: no redundant observer API. |
| [`lazy`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L31) | Prop | Boolean `lazy` / `.lazy`; native image loading; removing the override restores authored loading behavior. | 🟢 Verified | A1/S1: native lazy-loading and restoration evidence. |
| [`object-fit`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L32) | Prop | Native fit keywords through `object-fit` or CSS `--mui-avatar-object-fit`; default fill. | 🟢 Verified | A1/S1/S3; convenience attribute mutates an isolated CSS property and restores authored tokens. |
| [`render-fallback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L33) | Prop | No render callback/VNode API; use the accepted authored fallback template/span below. | ⏭️ Intentionally omitted | A1: framework rendering excluded; native content alternative verified separately. |
| [`render-placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L34) | Prop | No render callback/VNode API; use the accepted authored placeholder template/span below. | ⏭️ Intentionally omitted | A1: framework rendering excluded; native content alternative verified separately. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L35) | Prop | Default 3px-radius square; `round` opts into a circle and wins over explicit `square`. Groups default round. | 🟢 Verified | A1/S3 and rendered default-style audit; supersedes the old intentional difference. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L36) | Prop | `size` / `.size`: tiny 22px, small 28px, medium/default 34px, large 40px, huge 46px or positive numeric pixels; borders add 4px. | 🟢 Verified | A1/S1/S3: numeric convenience and text fitting use CSSOM writes; see A1's CSP note. |
| [`src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L37) | Prop | `src` / `.src` or authored direct image; source changes restart loading while preserving nodes. | 🟢 Verified | A1/S1: source, authored-image and reconnect tests. |
| [`on-error`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L38) | Callback | Bubbling `mui:error` detail contains `src`, `fallback`, `state`; handler return values do not control fallback. | 🟢 Verified | A1/S1: explicit notification adaptation. |

### AvatarGroup Props

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`expand-on-hover`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L54) | Prop | Native details/summary supports keyboard, touch and pointer instead of hover-only expansion. | ⏭️ Intentionally omitted | A1/S2: hover-specific contract excluded. |
| [`max`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L55) | Prop | `max` / `.max` counts directly visible avatars, excluding summary; absent shows all, zero moves all to overflow, negative clamps to zero. | 🟢 Verified | A1/S2: order, replacement and boundary evidence. |
| [`max-style`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L56) | Prop | Style the native overflow summary in external CSS; no `max-style` object API. | 🟢 Verified | A1/S3: adapted summary styling, not object passthrough. |
| [`options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L57) | Prop | Author child avatars; application code may clone native templates for data-driven members. | ⏭️ Intentionally omitted | A1/S2: no library-owned options renderer. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L58) | Prop | Group CSS custom properties provide shared sizing; explicit child sizes override inherited group sizing. | 🟢 Verified | A1/S3: inheritance, not a second group size-prop model; author inline tokens override named presets. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L59) | Prop | Boolean `vertical` attribute with CSS logical stacking/overlap. | 🟢 Verified | A1/S3: retained group orientation. |

### Avatar Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L65) | Slot | Authored text/image/icon nodes retained in light DOM; ordinary content moves without cloning. | 🟢 Verified | A1/S1: node/listener preservation; no native slot projection. |
| [`fallback`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L66) | Slot | Authored `template[data-mui-avatar-fallback]` or matching span; template content imported once. | 🟢 Verified | A1/S1: native content alternative, not callback or slot projection. |
| [`placeholder`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L67) | Slot | Authored `template[data-mui-avatar-placeholder]` or matching span shown while loading. | 🟢 Verified | A1/S1/S3: image retains layout box for native lazy loading. |

### AvatarGroup Slots

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L73) | Slot | Author native child `mui-avatar` elements; no scoped renderer callback. | 🟢 Verified | A1/S2: retained child anatomy, not payload compatibility. |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L74) | Slot | Native child avatars preserve identity/order while moving into and out of overflow. | 🟢 Verified | A1/S2: replacement/order and keyboard overflow evidence. |
| [`rest`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L75) | Slot | Fixed native summary supports `rest-label` and CSS; arbitrary rest rendering is excluded. | ⏭️ Intentionally omitted | A1/S2: semantic disclosure exists, but no rest callback contract. |

### AvatarGroupOption

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L48) | Record field | Author image/Avatar src directly; no AvatarGroupOption data-record API. | ⏭️ Intentionally omitted | A1: group options rendering excluded; individual src is verified above. |

### Generic companion

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`NGAvatarGroup`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L44) | Framework API | No Vue-only generic component; use native authored children. | ⏭️ Intentionally omitted | A1: framework API excluded. |

### Avatar Props: intersection-observer-options inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`intersection-observer-options.root?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L30) | Inline record field | No custom lazy observer root; native image loading is the retained path. | ⏭️ Intentionally omitted | A1: parent observer-options API omitted. |
| [`intersection-observer-options.rootMargin?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L30) | Inline record field | No custom lazy observer margin. | ⏭️ Intentionally omitted | A1: parent observer-options API omitted. |
| [`intersection-observer-options.threshold?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L30) | Inline record field | No custom lazy observer threshold. | ⏭️ Intentionally omitted | A1: parent observer-options API omitted. |

### AvatarGroup Slots: avatar inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`avatar.option`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L73) | Inline record field | Authored avatars replace the scoped option callback; no callback-context field is emitted. | ⏭️ Intentionally omitted | A1: group data renderer/scoped callback excluded. |
| [`avatar.option.src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L73) | Inline record field | Set src on the authored Avatar/image; no scoped option record. | ⏭️ Intentionally omitted | A1: parent scoped payload excluded. |

### AvatarGroup Slots: rest inline fields

| Upstream item · source | Kind | Proposed MarkupUI mapping | Status | Existing evidence / remaining work |
| --- | --- | --- | --- | --- |
| [`rest.options`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L75) | Inline record field | Fixed native disclosure contains existing Avatar nodes; no rest-render options payload. | ⏭️ Intentionally omitted | A1: arbitrary rest rendering excluded. |
| [`rest.options.src`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L75) | Inline record field | Overflow retains each authored Avatar's own source; no rest-options record. | ⏭️ Intentionally omitted | A1: parent rest-render payload excluded. |
| [`rest.rest`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/avatar/demos/enUS/index.demo-entry.md#L75) | Inline record field | Generated summary count and `rest-label` replace a scoped rest-count callback argument. | ⏭️ Intentionally omitted | A1/S2: fixed disclosure alternative; callback payload excluded. |

<!-- END PINNED API INVENTORY -->
