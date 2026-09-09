# Global Style: explicit document-wide CSS opt-in

**🟢 Verified retained scope.** Global Style is a small, standalone external stylesheet,
not a runtime component, installer, provider or automatic reset. It intentionally supplies
document defaults **only when the application links/enables it**.

```html
<link rel="stylesheet" href="./dist/markup-ui-global-style.css">
```

Package consumers may resolve **`@dataengine/markup-ui/global-style/style.css`** to the
same asset. A classic HTML application needs no compiler or JavaScript to use the link.
There is no `@dataengine/markup-ui/global-style` JS entry, `NGlobalStyle`/`mui-global-style`
runtime, global registration, theme watcher, injected style node or JS byte budget.
The source is [global-style.css](../../src/components/global-style/global-style.css).
It is copied unchanged by the existing build, not maintained in a second CSS string.

This stylesheet is **not imported by the core, plugins or any component**. Existing
loading defaults and compatibility entrypoints are unchanged.

## Exactly what the stylesheet does

Every selector is zero-specificity **`:where(html)` or `:where(body)`**:

| Target | Declaration / source of value |
| --- | --- |
| html | `color-scheme: light dark`; native system preference is permitted |
| body | `margin: 0` — deliberate document-edge default, not a universal spacing reset |
| body font family | `var(--mui-font-family, system-ui, sans-serif)` |
| body font size | `var(--mui-font-size, 1rem)` |
| body line height | `var(--mui-line-height, 1.5)` |
| body text | `var(--mui-text-primary, CanvasText)` |
| body background | `var(--mui-bg-page, Canvas)` |
| forced colors | body uses native `CanvasText`/`Canvas` |
| print | html permits light colors; body uses native `CanvasText`/`Canvas` |

No custom property is defined by this asset. It consumes existing supported `--mui-*`
tokens and otherwise uses browser/system defaults: **no second full theme palette**,
font download or external runtime dependency.

The stylesheet does **not** reset padding, lists, links, headings, native form-control
appearance, focus indicators, box sizing, selection, text-size adjustment or tap
highlighting. There are no descendant/universal rules, scroll locks, forced focus,
global events, generated class prefixes or hidden state markers.
No color transition or animation is introduced, so there is no global reduced-motion
override that might interfere with a component's own motion policy.

### Document theme versus a scoped theme

Set document-wide tokens on **html or body** when they should affect the body. Normal
text inherits body typography/color unless a closer author/component declaration wins.
Tokens inside a descendant Config Provider recipe scope do not flow upward to body.
Native top layers, if used elsewhere, retain their real DOM ancestry; this stylesheet
adds no portal/context-copying facility.

`color-scheme` lets supporting native UI choose appropriate system colors; it is **not**
a generator for every component's theme variables. The tested native input kept its UA
Arial/13.3333px typography while body used authored Georgia/18px. Body font styling
does not promise all-control styling. Existing component styles still own their hooks,
states and local presentation.

Authors can use the native `color-scheme` property on html to choose `light`, `dark`,
`normal`, or their own policy. With no author override, the linked asset permits
light/dark system selection. Its native fallbacks followed Chromium's light white/black
and dark dark-canvas/white choices. Supplying fixed color tokens does **not** make those
tokens automatically respond to OS preference; choose readable combinations explicitly.
`lang` remains a language hint, not translation or OS picker localization.

### Cascade, disable/removal and author ownership

Ordinary unlayered author `body`/class rules beat the zero-specificity package defaults,
even when the package link is inserted later. Inline author declarations are not erased.
Cascade origins, layers, importance and inheritance still apply normally; low specificity
is not a promise to outrank or bypass every layer arrangement.

```css
/* Application stylesheet: native properties, not a GlobalStyle options object. */
body {
  margin: 1rem;
  font-family: Georgia, serif;
}
```

Disable a normal link via its native `disabled` property, or remove it from the document.
The cascade naturally reveals remaining author/UA declarations. There is no disposal
routine overwriting stored body styles. Multiple active links follow CSS, not a
first-mounted singleton; disabling one cannot remove another active stylesheet's effects.
Author document settings remain author settings after removal.

External stylesheet loading remains native and may be asynchronous after re-enabling/
reinsertion. Link flags alone do not prove that CSS finished loading; applications needing
readiness can observe native link load/error events. The demo reports only link flags.
The legacy coexistence probe was corrected to wait for the external sheet before reading
computed styles; there was no required synchronous style-install API.

Forced-colors/print rules keep the default **body** readable; they do not guarantee every
component, author override or printer/device output. Direct author body/color-scheme
rules can override the low-specificity print defaults. A user-authored colored component
may retain its own print appearance. No all-browser/AT or print-device parity is claimed.

## Demo and native fallback

The separate [HTML](../../demo/components/global-style.html),
[CSS](../../demo/components/global-style.css) and [JS](../../demo/components/global-style.js)
demo shows linked/disabled/removed/reinserted states, native color-scheme choices,
document typography/two-color token samples and author body overrides. Its scoped Card
and nested section reuse the **unchanged Config Provider application CSS**, not a new
library palette. That scoped section stays dark/RTL independently of body settings.

The application-only `connectExample(root)` wires its authored controls to its one known
link and document attributes. It is not exported by the package. Disconnect aborts only
those demo listeners, hands off focus before hiding controls, and preserves chosen link/
author states. CSS itself has no JS lifecycle. No storage, clipboard, backend, OS service
or network beyond normal local asset loading is involved.

Native headings, lists, labels, fieldsets, inputs, select, checkbox, reset and details/
summary remain native. The form has no submit button and two text-entry fields; no-JS
editing/Enter/reset/disclosure were verified without submission. That no-button implicit
submission behavior depends on this authored anatomy, not a global form interception
policy. An application that changes the form or submits programmatically owns that action.

## Pinned reference boundary

The pinned English page has **zero named local props, slots, callbacks or methods**.
That absence is preserved. The [reference record](../naive-ui/components/global-style.md)
adds **16 explicitly source-derived effect/lifecycle/export rows**, not invented props:
**seven native adaptations + nine omissions, zero unresolved**.

| Source behavior | Retained / omitted resolution |
| --- | --- |
| body fontFamily/fontSize/lineHeight/color/backgroundColor/margin | 🟢 External CSS defaults and explicit supported tokens; not the upstream common-theme object values |
| onUnmounted cleanup intent | 🟢 Native link disable/removal restores the cascade; no callback or inline restoration manager |
| body padding reset | ⏭️ No padding reset; author it if needed |
| text-size adjustment/tap-highlight suppression | ⏭️ Preserve browser behavior |
| timed body transition | ⏭️ No automatic global motion or timer |
| n-styled/first-owner guard | ⏭️ No singleton marker/duplicate-provider warning |
| injected provider merge/watchEffect | ⏭️ No upward context synchronization, Vue refs or theme engine |
| document guard/SSR branch, render-null component, NGlobalStyle export | ⏭️ No runtime component or SSR adapter; server-authored HTML can link CSS normally |

Pinned source removes its marker on unmount but does not restore every body style it
wrote. This implementation deliberately uses native stylesheet lifetime instead of
copying that inline ownership contract. Its SSR test establishes non-throwing framework
rendering, not a native CSS API or complete SSR style output; neither is inferred here.

## Four tasks and acceptance — 2026-09-10

1. [x] Create one maintained, bounded opt-in document stylesheet; keep component CSS and legacy extraction separate.
2. [x] Add CSS-only package/build delivery and measured budget without altering old entrypoints.
3. [x] Define actual html/body effects, scope/cascade/native color policies and omissions.
4. [x] Verify native linked/no-JS/CSP/media/legacy paths and the requested component-route audit.

- **77 tests passed**: 12 Global Style, 12 Config Provider, 12 Element, 14 Discrete and
  27 native/legacy tests:
  `npm test -- --run tests\global-style.test.ts tests\config-provider.test.ts tests\element.test.ts tests\discrete.test.ts tests\native.test.ts`.
- **Build/declarations and all budgets pass.** The sole new distribution file is
  `markup-ui-global-style.css`. **All 1,141 previous non-manifest files byte-match**;
  every previous manifest entry remains equal. Only the manifest gains this CSS entry.
- Catalog/route audit confirms **3,966 rows, 332/384 tasks and 83/96 accepted pages**.
  All **550 scoped documentation file links** and **125 four-route canonical/reference
  file links** resolve. Config Provider/Element/Discrete inventories are unchanged;
  Global Style preserves zero original public rows and explicitly adds 16 source rows.
- Chromium measured linked body defaults versus disabled/removed UA margin/font/color,
  reinserted and still-disabled links, duplicate-link cascade and preserved inline
  author styles. Author body rules still won after reinserting the package link last.
- Actual body/root tokens, native input typography/appearance, scoped/nested Card colors,
  light/dark/system/native choices and non-upward scope inheritance passed.
- Native heading/group/link/list/control semantics, FormData exclusions, constraints,
  reset/disclosure and hidden behavior passed. No global native-control reset or fake
  semantic roles were required.
- **320px**, **2x CSS zoom**, forced colors and print body colors passed. Reduced-motion
  mode retained **no body animation/transition** and normal visible overflow.
- Strict CSP `default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none';
  form-action 'none'` allowed author/link operations with **zero inline style nodes/
  attributes and no CSP errors**. Script-blocked reload retained body styling and
  usable native content/forms/disclosure.
- A separate legacy import left the unlinked body at UA defaults, preserved native
  input/Card nodes, and did not opt in this asset. After explicit enabling and native
  loading, legacy `theme.register/apply` root tokens produced the expected body values
  while local Card tokens remained independent. Legacy inline writes were not used
  in the strict-CSP run.

### Asset accounting

Published CSS: **661 raw / 310 gzip bytes**, with a **500 gzip-byte ceiling**.
There is no JS/global/registration bundle or JS budget for Global Style.
Core/advanced/widgets stay **14,611/2,181/2,779 gzip bytes** under
**15,000/3,000/4,000**. All previous helper assets, exports and budgets are unchanged;
the package adds only the explicit stylesheet export.

The full example is accounted separately from the published component:

| Loaded file | Raw bytes | gzip bytes (level 9) |
| --- | ---: | ---: |
| Global Style HTML | 4,521 | 1,732 |
| Application CSS | 1,266 | 543 |
| Application JS | 2,597 | 884 |
| Reused configuration application CSS | 3,022 | 972 |
| Existing Card CSS | 8,200 | 1,512 |
| Published Global Style CSS | 661 | 310 |
| Total example | 20,267 | 5,953 |

The demo imports no library JavaScript, fonts or images. Its control wiring is application
overhead, not a new Global Style runtime/budget.

## Requested P0-related component-route audit

These are component-route results, **not completion of every P0 architecture task**:

| Route | Actual phase | Rows | Adapted | Omitted | Unresolved | Accepted tasks |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Config Provider | P0 | 117 | 8 | 109 | 0 | 4/4 |
| Element | P0 | 15 | 3 | 12 | 0 | 4/4 |
| Global Style | P0 | 16 | 7 | 9 | 0 | 4/4 |
| **Strict P0 catalog subtotal** | P0 | **148** | **18** | **130** | **0** | **12/12** |
| Discrete API | P3; requested related-route audit | 28 | 7 | 21 | 0 | 4/4 |
| **Four-route audit** | P0 + related P3 | **176** | **25** | **151** | **0** | **16/16** |

Discrete stays assigned to P3 and its existing accepted tasks are **not counted twice**.
Each retained API/lifetime/omission in these routes remains scoped to its own canonical
record; no omitted framework behavior receives implementation credit.

### Foundation follow-through remains open

The [master P0 task table](../naive-ui/migration-plan.md#p0--architecture-and-contracts)
is deliberately **not promoted to complete** by this route audit:

| Task IDs | Remaining broader boundary |
| --- | --- |
| P0-01 | Authored legacy core/plugin CSS still lives in TypeScript; this small body stylesheet is not wholesale extraction. |
| P0-02 | Legacy aggregate still auto-registers/installs styles; full separated aggregate classic/ESM loading remains distinct from existing optional entries. |
| P0-03, P0-04, P0-05 | Retained components have tested adoption/events/forms, but complete baseline/remaining-P6 conventions and legacy exceptions are not globally signed off. |
| P0-06 | Native configuration/body CSS is accepted narrowly; legacy theme palettes/register/apply remain programmatic and inline, not fully extracted named themes for every consumer. |
| P0-07 | Existing/new budgets are enforced; full catalog loading/accounting including forthcoming P6 entries is still a broader gate. |
| P0-08 | Nine P6 routes retain 232 unresolved rows; route reconciliation is not globally finished. |
| P0-09 | Future P6 primitive/support/ownership decisions and acceptance still need component-specific review. |

Compatibility exceptions remain explicit: [core CSS](../../src/components/styles.ts)
and [advanced](../../src/plugins/advanced.ts)/[widgets](../../src/plugins/widgets.ts)
still contain/install authored CSS strings; the default entry still installs styles;
legacy theme.apply writes inline tokens and theme.set retains storage/global-subscriber
behavior. They remain compatible, not the strict external-CSS path. No such legacy
behavior is newly introduced or silently declared CSP-safe here.

## Remaining catalog and next recommendation

Current catalog: **3,966 rows / 332 of 384 accepted tasks / 83 of 96 accepted pages**.
Retained P5 stays **827 rows / 349 adapted / 478 omitted / zero unresolved / 40 tasks**.

- **P6, nine Planned routes / 232 unresolved rows:** Carousel, Watermark, Upload,
  Calendar, Countdown, Number Animation, Time, Heatmap and Marquee.
- **Four explicit exclusion routes / 35 omitted rows:** Equation, QR Code, Legacy Grid
  and Legacy Transfer. Their page tasks are not claimed as accepted implementation.

Recommend **Carousel (P6-03)** next: its documented prerequisites—native button/focus/
motion contracts and optional packaging—have retained foundations. Start with authored
slides, readable native scrolling/scroll snap and real previous/next controls; preserve
slide/focus identity and make autoplay a separately bounded opt-in with pause policy.
Do not infer drag/effect/full framework parity from the old widgets baseline.
**No P6 implementation is included in this Global Style resolution.**
