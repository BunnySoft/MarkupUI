# Anchor and AnchorLink: native fragments with location tracking

**🟢 Verified for the retained native fragment/scrollspy scope.**
Authored links, URL/hash/history and focus remain browser-owned. An optional small helper
marks one current location using deterministic geometry and supplies explicit native scrolling.
It is not a router, Affix dependency, generated TOC or positioning/animation framework.

**Default-style audit (2026-09-10):** corrected 13px link typography, 4px continuous
rail, 16px indentation, reference spacing and light/dark interaction colors.
See the [rendered audit](../style-audit/components/anchor.md) for measured improvements
and remaining link-owned marker/background differences. Controller, shared scroll
utilities, native URL/history/focus and explicit-root ownership are unchanged.

## Loading and native baseline

| Export / asset | Contract |
| --- | --- |
| `@dataengine/markup-ui/anchor` | `createAnchor`, controller/options/location/issue types and native scroll-root/behavior types |
| `dist/markup-ui-anchor.js` | Standalone ESM |
| `dist/markup-ui-anchor.global.js` | Classic `window.MarkupUIAnchor.createAnchor`; refuses namespace replacement |
| `@dataengine/markup-ui/anchor/style.css` | Independent `dist/markup-ui-anchor.css`, usable without JS |
| `src/components/anchor/scroll.ts` | Small native vertical-scroll context for the next Back Top consumer, not a scrolling engine |
| `demo/components/anchor.*` | Separate authored HTML/CSS/JS and local section targets |

```html
<link rel="stylesheet" href="./vendor/markup-ui-anchor.css">
<script defer src="./vendor/markup-ui-anchor.global.js"></script>
<script defer src="./toc-setup.js"></script>

<nav class="mui-anchor mui-anchor--sticky" data-anchor id="contents" aria-label="Contents">
  <ul>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#details">Details</a>
      <ul><li><a href="#%E9%9B%AA%20%2F%23%5B%5D%25">Special identifier</a></li></ul>
    </li>
  </ul>
</nav>
<section id="overview" class="mui-anchor-target"><h2>Overview</h2>...</section>
<section id="details" class="mui-anchor-target"><h2>Details</h2>...</section>
<section id="雪 /#[]%" class="mui-anchor-target"><h2>Special identifier</h2>...</section>
```

```js
// toc-setup.js; named ESM import is an alternative.
const anchor = window.MarkupUIAnchor.createAnchor(document.querySelector("#contents"), {
  offset: 16,
  bound: 12
})
anchor.scrollTo("#details", { behavior: "smooth" }) // No hash/history/focus rewrite.
anchor.disconnect()
```

The root is connected same-document light-DOM `nav.mui-anchor[data-anchor]` with an explicit
nonempty accessible name. No menu/tab roles, tabindex, generated links, title labels, hidden
copies or renderer are introduced. Original nodes/listeners/templates remain authored.
Nested `[data-anchor]` roots are independent boundaries, including when introduced dynamically.
Classic/core loading order has no custom-element registration conflict.

## Native link identity and issues

Only owned native `a[href]` links resolving to a nonempty fragment of the **same origin,
pathname and query** are candidates. Resolution uses the document's actual base URI and URL.
External URLs, non-self targets and download links keep native behavior and are not managed
as current-location links. The helper has **no click handler**: modifiers, middle clicks,
defaultPrevented, native Tab/Enter, target browsing contexts, hash updates and browser Back
remain native/application behavior.

IDs are resolved with getElementById, not interpolated CSS selectors. UTF-8 percent decoding
handles Unicode, spaces, punctuation, encoded # and literal %. Malformed percent signs stay
literal; invalid UTF-8 bytes follow replacement-character decoding rather than a broad
swallowed URI exception. A literal encoded-looking ID needs its percent sign encoded as usual.

The readonly `issues` snapshot reports `{ link, href, reason }` for invalid URLs, missing/
duplicate IDs, unsupported non-HTML targets, targets outside an explicit root, and targets
inside a different intervening scrolling plane. Links are never removed or rewritten.
Missing targets can become valid after authored content appears. Duplicate targets reached
by multiple links are tracked once; the first eligible visible owned link wins.
Use unique native IDs and meaningful authored link text/markup rather than prop generators.

## Actual scroll roots and offsets

`root` is this document/window, or a connected same-document native HTMLElement scrollport.
Selectors and function-valued root providers are intentionally excluded. Use document/window
for document scrolling, not a special body-scroll wrapper. Element roots need computed native
vertical auto/scroll/hidden overflow; visible/clip roots are rejected rather than pretending
to scroll. Same-document/overflow validity is rechecked during updates and explicit scrolling.
Invalid live roots disconnect and report/throw; ordinary removal releases the binding.

Targets for an element root must be descendants, not the root itself. A different intervening
overflowing scroll container is a different scroll plane: bind another Anchor with that root.
Native links to excluded targets still work. Eligibility is re-evaluated when layout/style/
scrolling changes, including formerly excluded targets whose intermediate scroller disappears.

Metrics account for element borders and axis-aligned scale/CSS zoom using the actual border
box and native client sizes. Document tracking uses the visual viewport for zoomed visible
boundaries. Rotated/skewed/3D transforms, vertical writing and arbitrary cross-plane clipping
are outside the retained geometry scope.

Options:

- `bound`: 12 CSS px default, tolerance after the reference line.
- `offset`: 0 default, sticky-header/reference offset, also used by explicit scrollTo.
- `ignoreGap`: false default; choose true for heading-only tracking through gaps.
- All options are setup snapshots. Bound/offset are finite nonnegative values up to 60,000;
  effective detection/scroll offsets are constrained to the current viewport height.

Native fragment clicks use **author CSS scroll-margin/scroll-padding**, not the JS offset.
The opt-in `.mui-anchor-target` class maps `--mui-anchor-offset` to logical scroll margin.
Configure matching CSS and helper offsets if desired; explicit scrollTo uses the numeric
offset and does not add CSS margins again. No document style is installed implicitly.

## Deterministic location algorithm

Every scheduled update reads current candidate geometry; no “last IntersectionObserver
callback wins” rule is used. Candidates are sorted by start position, then larger height
first, then DOM order. The last qualifying candidate wins, so equal starts prefer the more
specific/smaller section and remaining ties are stable. At most one managed link receives
aria-current=location and data-anchor-active.

The reference line is offset, bounded by the viewport; the start threshold is offset+bound,
also bounded. Normally a candidate must start at/before that threshold and still extend to
the reference line. With ignoreGap=false, gaps can therefore clear current; with true, the
latest passed start remains current. Before the first qualifying section there is no current
link. Use full section containers for default gap semantics, or ignoreGap for short headings.

At the actual bottom of a genuinely scrollable root, a visible final target wins even if
its short height prevents it reaching the top threshold. A long trailing gap does not force
an invisible final target. This explicit bottom rule means the active location can differ
from the current hash when several end sections fit simultaneously; tracking reports actual
geometry, not the last clicked href.

## Controller, scheduling and ownership

| API | Contract |
| --- | --- |
| `connected` | Explicit lifetime |
| `activeHref`, `activeTarget` | Current original href/target, or null; readonly location, not a controlled router value |
| `issues` | Fresh diagnostics snapshot; not a silently successful missing-target result |
| `update()` | Recompute current layout/eligibility immediately; never focus or navigate |
| `refresh()` | Re-resolve authored links/IDs and resize targets, preserving nodes and attribute ownership |
| `scrollTo(href, { behavior? })` | Validated explicit same-document fragment scroll; false for a missing/hidden/unavailable target; invalid URL/root/plane/behavior throws |
| `connect()`, `disconnect()` | Idempotent lifetime; reconnect after reinsertion |

scrollTo scrolls only the configured root, preserves native horizontal position (including
RTL scrollLeft), and never changes hash/history or focus. Its boolean means a native request
was issued, not that an animation completed or every requested offset was physically possible.
The browser clamps to the root's scroll range. Optional smooth/auto scrolling is forced to
instant under reduced motion; no tween or animation dependency exists.

`mui:anchor-change` reports `{ href, link, target }` when actual location identity changes,
including initial/refresh/programmatic-scroll effects. It is explicitly **not a user click
event**. Scroll/update does not focus anything. `mui:anchor-error` reports automatic update
failures with `{ error }`; explicit invalid calls throw. Diagnostic arrays make missing/ignored
target boundaries inspectable without overriding native navigation.

Passive native scroll, resize, hashchange/popstate, visual viewport and captured load events
schedule at most one requestAnimationFrame. ResizeObserver, when available, observes resolved
targets and their relevant ancestors, including candidates excluded by a changing scroll
plane. Document mutations re-resolve IDs/links or schedule geometry work. There is no polling
loop, IntersectionObserver prerequisite, hidden sentinel node or global application provider.
Without ResizeObserver, native events and explicit update/refresh remain available.

Call update/refresh for position-only changes that emit none of those signals, such as a pure
CSS animation. History pushState/replaceState is not patched: a subsequent update recognizes
the current URL; call refresh immediately when the application needs immediate reconciliation.

Per-link ownership prevents a moved link or newly introduced nested TOC from restoring a
previous helper's current marker as author state. Ownership is rechecked before marking.
Disconnect restores only still-owned ARIA/active attributes, cancels frames, and releases
listeners/observers. Unrelated author classes/ARIA/listeners survive. Use one helper
distribution/copy per document for cross-root transfers; disconnect before cross-document
or independent module-copy handoff.

## CSS-only presentation and fallback

Rail/block, optional no-rail/no-background, native focus and nested indentation are external
CSS classes/tokens. The default rail is now one continuous root border, not disconnected
gray borders on each link. Active styling still uses each link's own border/background,
not a measured/sliding root-rail marker. In particular, an active nested link marks its
own indented edge; it does not move a shared marker back to the outer rail.
Nested independent roots reset private presentation presets rather than inheriting a
parent's block/no-rail mode accidentally.

| Token / presentation | Default and responsibility |
| --- | --- |
| `--mui-anchor-font-size` | 13px on links; leading is 1.5. Ordinary authored font-family is inherited. |
| `--mui-anchor-link-padding` | Rail: `0 16px`; block: `2px 8px`; no-rail rail mode retains a 4px leading inset. |
| `--mui-anchor-indent` | 16px per native nested list. |
| `--mui-anchor-rail-width`, `--mui-anchor-rail` | 4px; `#dbdbdf` in light, white/.2 in dark. |
| `--mui-anchor-color` | `#333639` in light, white/.82 in dark. |
| `--mui-anchor-active-color` | Shared primary color when supplied, otherwise `#18a058` / `#63e2b7`; also colors the link-owned active border. |
| `--mui-anchor-hover-color`, `--mui-anchor-pressed-color` | Local overrides over shared primary hover/pressed roles, then pinned light/dark fallbacks. |
| `--mui-anchor-active-background` | Primary color at 15% alpha via native CSS color mixing; a local value overrides the tint unless a no-background/no-rail mode suppresses it. |

An ancestor/root `data-mui-theme="dark"` selects dark fallback roles; nested explicit
`"light"` restores light. Shared primary-color tokens are reused, but mismatched legacy
generic text/rail colors are not. Link hover/focus changes color rather than introducing
an underline; the native focus-visible outline remains an accessibility adaptation.
The active border keeps the active color while hovered text uses the hover color.

Rail links have half-font-size spacing (6.5px by default); block links use 4px spacing
and 3px corners. Native block padding/background belongs to each actual link rather than
the upstream wrapper containing its descendants. Nested block offsets and final wrapper
spacing therefore remain adaptations. Long native titles wrap instead of receiving the
upstream ellipsis/automatic `title` tooltip.
No-rail removes the rail/marker and default rail-mode background; no-background explicitly
removes the native active fill, including when combined with block mode.

`.mui-anchor--sticky` is optional native CSS sticky: the nearest scroll/containing block
constrains it, as in the [Affix retained scope](affix.md). No Affix or Scrollbar asset is a
dependency and no fixed-position/placeholder/controller is smuggled into this option.
Native root overflow follows the [Scrollbar conventions](scrollbar.md).

`.mui-anchor-scroll` is an explicit opt-in smooth-scroll class; its media rules respect
reduced motion. Print makes sticky navigation static and uses ink-friendly colors.
Forced colors preserve visible location/focus cues. Color/border/background transitions
last 0.3s and are disabled under reduced motion; there is no measured indicator-motion
renderer. No-JS retains real nested fragment
links, browser history and authored targets; only location tracking is absent.
All scrolling/geometry reads are explicit; no CSS-in-JS, generated style text, implicit
document styling or readonly scroll-field override is used.

## Acceptance — 2026-09-09

- **62 targeted tests pass:** 35 Anchor, 27 native/legacy
  (`npm exec vitest run -- tests\anchor.test.ts tests\native.test.ts`).
- `npm run build` passes TypeScript/declarations, independent ESM/classic/CSS and all old/new
  budgets; runtime dependencies remain zero.
- Chromium primary checks: native click/hash, encoded Unicode/special ID, browser Back,
  no focus theft on scroll, explicit-root gap and short final section, unchanged URL for
  programmatic scrolling, page-bottom/single-current policy and missing-target diagnostics.
- Review fixes add per-link transfer ownership, dynamic TOC-boundary refresh, re-evaluation
  of changed scrolling planes and live explicit-root overflow validation.

- Additional Chromium checks cover dynamic TOC ownership transfer, new/removed scroll planes,
  invalid-root disposal, reduced-motion instant requests, RTL, narrow layout, visual-viewport
  2x zoom, forced colors/print, no-ResizeObserver fallback, separate realms, standalone/
  legacy load orders and native modified/no-JS fragment navigation.
- Native link role/name/focusability and the single DOM `aria-current="location"` marker
  were verified; classic loading preserves an existing unrelated `MarkupUIAnchor` namespace.
- Inventory audit preserves all **11 original owner/name/source identities**: **17 Anchor
  rows**, with **12 verified adapted targets and five omissions**. The catalog has **96
  routes, 3,280 rows and 168/384 accepted tasks**; **11 P3 routes remain Planned**.
  All **291 relative file links** in the changed documentation resolve.

| Asset | Raw bytes | gzip bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Anchor ESM | 10,411 | 3,991 | 4,500 |
| Anchor classic | 10,571 | 4,060 | 4,500 |
| Anchor CSS | 1,979 | 672 | 1,000 |
| Core minified, unchanged | 62,558 | 14,611 | 15,000 unchanged |
| Advanced, unchanged | 6,554 | 2,181 | 3,000 unchanged |
| Widgets, unchanged | 10,858 | 2,779 | 4,000 unchanged |

One helper format plus CSS costs **4,663 gzip bytes ESM** or **4,732 classic**.
Previous optional sources/bundles/ceilings are unchanged; Back Top will reuse only the concrete
native scroll context rather than importing an Anchor/renderer application framework.

No all-browser, screen-reader, physical pinch or universal AT certification is claimed. P3 remains in
progress. **Next: Back Top, reusing only the concrete native scroll context.**
