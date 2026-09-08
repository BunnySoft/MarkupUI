# Back Top: native top links and explicit scrolling

**🟢 Verified for the retained native link/button, threshold and presentation scope.**
Native fragments are the no-JS baseline. The optional controller reuses
[Anchor's native scroll context](../../src/components/anchor/scroll.ts), not its scrollspy
or any popup/positioning engine. No Float Button, Icon, Affix, portal or provider is required.

## Loading and anatomy

| Asset / export | Contract |
| --- | --- |
| `@dataengine/markup-ui/back-top` | `createBackTop`, controller/options and native scroll types |
| `dist/markup-ui-back-top.js` | Self-contained ESM |
| `dist/markup-ui-back-top.global.js` | Classic `window.MarkupUIBackTop.createBackTop`; rejects an existing namespace without replacing it |
| `@dataengine/markup-ui/back-top/style.css` | Independent external `dist/markup-ui-back-top.css` |
| [Demo](../../demo/components/back-top.html) | Separate authored HTML, CSS and JavaScript; all actions are local |

```html
<link rel="stylesheet" href="./vendor/markup-ui-back-top.css">
<script defer src="./vendor/markup-ui-back-top.global.js"></script>
<script defer src="./back-top-setup.js"></script>

<header id="page-top"><h1>Page title</h1></header>
<!-- Authored long content -->
<a class="mui-back-top mui-back-top--fixed" href="#page-top" id="return-top">
  <span aria-hidden="true">↑</span> Top
</a>
```

```js
// back-top-setup.js; a named ESM import is an alternative.
const top = window.MarkupUIBackTop.createBackTop(document.querySelector("#return-top"))
top.show = true // Silent helper visibility override; null restores threshold mode.
top.show = null
top.disconnect() // Link remains usable without enhancement.
```

Use an authored native anchor with an existing same-document fragment destination, or an
explicit `button[type=button]`, with class `mui-back-top`. Name it using visible text,
aria-label or resolvable aria-labelledby. Icons are decorative authored children, not an
automatic label. Original IDs, labels, aria-controls, nodes, listeners and templates stay intact.
Do not supply roles/tabindex, nested controls, interactive ancestors, or other native button
commands such as popovertarget. The helper validates rather than rewrites unsafe anatomy.
There is no custom element registration or special ordering rule with the legacy aggregate.

For an isolated reader use a typed button and `root: readerElement`. Initially author that
JS-only button `hidden`; remove hidden in application setup after a successful binding.
Keep a real fragment return link inside the reader for no-JS navigation. Author hidden remains
author-owned: the controller never removes it. A native fragment may scroll several ancestors;
only the explicit button/method promises to scroll just the configured root.

## State, events and activation

| Option / controller | Actual contract |
| --- | --- |
| `root` | This document/window by default; or a connected same-document HTMLElement with computed native vertical auto/scroll/hidden overflow |
| `visibilityHeight` | Finite nonnegative number, default **180**; inclusive `scrollTop >= height`, including zero/fractions |
| `show` | Boolean override or null/omitted for automatic threshold visibility; mutable controller field, not a Vue controlled prop |
| `behavior` | Setup snapshot: native smooth default, auto or instant; no duration/easing guarantee |
| `thresholdVisible` | Readonly latest measured threshold result, independent of show override or focus retention |
| `visible` | Readonly helper visibility request, including focus retention; not a promise that author CSS/hidden/inert makes the action perceivable |
| `connected` | Explicit lifetime |
| `update()`, `refresh()` | Read current root/anatomy and update state; refresh also invalidates queued button clicks |
| `scrollToTop({ behavior? })` | Explicit request for this root's vertical zero; returns whether a native request was issued, not animation completion |
| `connect()`, `disconnect()` | Idempotent lifecycle; reuse after reinsertion, or disconnect/create anew to change roots/options |

Unknown options, invalid bounds/behaviors/roots and unsafe live anatomy throw. Selectors,
function roots, nearest-parent inference and special body wrappers are excluded. Roots are
validated through the same utility as Anchor. Page-root metrics use the visual viewport;
element metrics account for borders and axis-aligned scaling. Rotated/3D transforms, vertical
writing and cross-document roots are outside this retained scope.

`mui:back-top-update-show` is a nonbubbling notification with `{ show: boolean }` when the
measured threshold changes **after initialization**. It reports the automatic threshold even
when a show override or held focus keeps actual helper visibility different. It is not a user
event or a promise that pixels changed. Assigning show paints silently from the latest
measurement; explicit update/refresh or programmatic scrolling can subsequently report a real
threshold change. No callback aliases, synthetic click events or animation-complete events.

**Links have no helper click listener at all.** Native fragment URL/hash/history, default
focus behavior, Enter, targets, download, modified/middle clicks and application cancellation
remain browser/application-owned. Destination IDs use URL decoding and getElementById, never
unsafe selector interpolation. Authored target placement determines where a native link lands;
the numeric scroll threshold does not alter fragment alignment.

Buttons use only the native click produced by pointer/Enter/Space, never key-to-click synthesis.
Only primary unmodified, enabled, nonhidden/noninert activation is admitted. Work runs in a
subsequent task so synchronous application listeners anywhere on the event path can cancel
via defaultPrevented. Refresh, disconnect and invalid live anatomy invalidate pending work.
Native disabled/fieldset semantics remain native; aria-disabled alone is not a replacement
for disabling a native button or link. The helper does not turn an anchor into a disabled widget.
Programmatic scrollToTop is independent of action visibility/disabled state.

Explicit scrolling preserves scrollLeft/scrollX, including RTL negative values, URL/history
and focus. Native reduced-motion preference forces instant, including over author smooth CSS.
The browser clamps its scroll range. No scroll completion, fixed duration, scroll cancellation
or focus relocation is promised. Missing element scrollTo falls back to writable scrollTop;
readonly window scroll fields are never overridden. A disconnected/removed or zero-height
root returns false; invalid explicit requests throw. Automatic failures disconnect and emit
`mui:back-top-error` with `{ error }` rather than silently succeeding.

## Focus, ownership and cleanup

**A focused action stays helper-visible until blur**, even below the threshold or after
`show=false`. This prevents activation from hiding its own keyboard focus. Native fragment
navigation may itself move the browser's sequential-focus starting point; that remains native.
No tabindex is added to headings, no unrelated target is focused, and no live announcement is
invented. Authors can still hide/remove/inert their own controls; they own safe focus transfer
when doing so. Print deliberately hides navigation controls.

Only `data-back-top-hidden` is managed, with the common conditional attribute ledger.
External CSS hides that marker with display:none, removing the action from Tab flow and the
accessibility tree. Author hidden is independently respected. Install the CSS with the helper;
if CSS is absent the action remains usable but threshold hiding is unavailable. Reserve the
marker for the helper while connected. Disconnect restores its original value only if it
still matches the last owned write; observable unrelated author changes are not restored over.

One active controller owns each action; multiple independent actions can observe one root.
No document mutation observer, polling loop, global scroll store or provider is installed.
A passive root scroll listener and resize/visual-viewport signals coalesce into one rAF;
optional ResizeObserver observes only the root box. Call update/refresh after content, href,
label, class or overflow changes not accompanied by a scroll/resize signal.
**Call disconnect before removing/reparenting the action or its root.** Removal is also
detected on the next update/activation, but immediate removal detection is not advertised.
Disconnect removes listeners, observer, frames and pending tasks. Refresh keeps node/listener
identity. Cross-document or separate helper-copy handoff needs explicit disconnection.

## External presentation and native fallback

Default inline presentation, round/square and small/large classes require no JS. The optional
`mui-back-top--fixed` class uses logical inline/block-end offsets (2.5rem defaults), safe-area
minimums and an explicit z-index token. Author `--mui-back-top-size`, `--mui-back-top-radius`,
`--mui-back-top-inline-end`, `--mui-back-top-block-end`, color/border/background/focus tokens,
or ordinary external CSS for custom icon and unequal width/height requirements.

Logical inline-end moves to the left in RTL, unlike upstream's physical right. Fixed position
is constrained by native transformed/containing blocks; no teleport, body scroll-lock
compensation, portal-position or pinch-viewport-following guarantee. Place the control in a
suitable authored ancestor. Insets assume horizontal writing. Responsive CSS, readable text,
native focus and browser zoom remain authorable without geometry writes or injected styles.
Forced colors preserve border/focus cues; print hides actions. There is no decorative motion
to suppress in component CSS. Native link smoothness is opt-in author CSS and must itself
respect reduced motion, as in the demo. No-JS links remain visible and navigate normally.

## Acceptance — 2026-09-09

- **104 targeted tests:** 42 Back Top + 35 Anchor + 27 native/legacy
  (`npm exec vitest run -- tests\back-top.test.ts tests\anchor.test.ts tests\native.test.ts`).
- Build, TypeScript/declarations, package ESM/CSS exports, standalone classic and old/new
  budgets pass. No runtime dependencies and no existing shared source changes.
- Chromium verifies inclusive threshold crossing, native fragment/hash/Enter, button
  Space/Enter exactly once, form safety, final synchronous defaultPrevented, focus-held hide
  then untrapped Tab, independent roots and page/reader horizontal-position preservation.
- Chromium also covers refresh/disposal races, reconnect, author hidden, RTL/narrow layout,
  2x visual-viewport scale and CSS zoom, forced colors/print, no-JS navigation, missing ResizeObserver/
  element scrollTo fallback, classic/ESM/legacy coexistence, native target opening and an
  unconsumed real Ctrl-click before author cancellation. No background-tab Ctrl-click guarantee
  is inferred from the automated browser harness.
- Read-only review found a Windows-only test path; paths now use node:path for Linux CI too.
- Both classic/legacy load orders, unrelated namespace preservation and live overflow-root
  invalidation/cleanup pass Chromium. Inventory audit preserves all seven original identities:
  **96 routes, 3,289 rows, 172/384 accepted tasks and 10 Planned P3 routes**.
  All **294 relative file links** in the changed documentation resolve; prior budgets are unchanged.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Back Top ESM | 8,069 | 3,212 | 3,500 |
| Back Top classic | 8,232 | 3,281 | 3,500 |
| Back Top CSS | 1,831 | 682 | 1,000 |
| Core, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One helper format plus CSS is **3,894 ESM / 3,963 classic gzip bytes** (build's level-9
measurement). Previous optional bundles/ceilings remain unchanged. All seven original
inventory identities remain; nine explicit source supplements yield **10 adapted targets and
six omissions**. No all-browser, screen-reader or physical pinch certification is claimed.
P3 remains in progress. **Next: Pagination, then Steps.**
