# Badge

**Migration status: 🟢 Verified for the retained native scope below.**
Badge preserves authored targets and value content. Its small optional controller formats
dynamic values and visibility; positioning, colors, size and processing motion are external
CSS. Static badges can be ordinary spans without any Custom Element or JavaScript.

**Default-style audit (2026-09-10):** the enhanced Badge now matches the pinned reference's
18px pill, 12px type, fixed-width integer cells, 8px dot, light/dark status fills and
processing wave for the measured scope. See the [rendered audit](../style-audit/components/badge.md)
for before/after evidence, theme roles and remaining limits. This does not restyle the
legacy aggregate Badge or introduce binding/templates.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Badge documentation](https://www.naiveui.com/en-US/os-theme/components/badge)
- [Public API: nine props and default slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/demos/enUS/index.demo-entry.md)
- [Badge source, including the additional value slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/badge/src/Badge.tsx)
- [Upstream number-rendering internal](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/slot-machine/src/SlotMachine.tsx)

The pinned page documents no events, methods, size/placement props or companion component.
The source adds a `value` slot and inherited theme plumbing; these are tracked explicitly.
MarkupUI's placement/decorative conveniences and CSS sizing are identified as extensions,
not invented upstream API rows.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-badge.js` | ESM; exports `MuiBadge`, `registerBadge()`; registers on browser import. |
| `dist/markup-ui-badge.global.js` | Classic script; registers and exposes `MarkupUIBadge`. |
| `dist/markup-ui-badge.css` | External component and CSS-only static badge styling. |
| `dist/components/badge/index.d.ts` | TypeScript declarations. |
| `demo/components/badge.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript example. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-badge.css">
<script defer src="./vendor/markup-ui-badge.global.js"></script>
<script defer src="./app.js"></script>

<mui-badge value="12" max="99" decorative>
  <button type="button" aria-label="Inbox, 12 unread messages">Inbox</button>
</mui-badge>
```

Application ESM: `import "@dataengine/markup-ui/badge";`. Serve/link the
`@dataengine/markup-ui/badge/style.css` export through your asset mechanism. Plain browsers
import the served `markup-ui-badge.js` URL, not the npm package specifier.

Load enhanced Badge **before the legacy aggregate**, using ordered `defer` scripts or ESM
imports. The aggregate preserves existing registrations. Legacy-first enhanced registration
throws an explicit conflict; it does not silently claim to upgrade the element. Do not load
both enhanced distributions in one document. The original aggregate definition, styles,
output sizes and 15,000-byte core ceiling remain unchanged.

## Native markup and content ownership

CSS-only static badge, requiring no controller:

```html
<span>Release status: <span class="mui-badge-value">New</span></span>
```

Dynamic standalone badge and authored value content:

```html
<span>Unread messages: <mui-badge value="5"></mui-badge></span>
<mui-badge>
  <button type="button" aria-describedby="new-status">Notifications</button>
  <span data-mui-badge-value id="new-status">New</span>
</mui-badge>
```

- Ordinary default children are the **target**, left in their original position and never
  cloned/replaced by value changes. Prefer one logical target; wrap a multi-node target
  yourself if needed. Native button/link semantics, listeners, focus, form type and disabled
  state remain entirely native.
- With no target, the indicator participates in normal inline flow. With a target it is
  positioned at the target wrapper's logical top-end corner by default. `show="false"` hides
  only the indicator; native `hidden` on the host hides the entire composition.
- Direct non-inert elements marked `data-mui-badge-value` provide custom value content.
  They move into the indicator without cloning, preserving IDs, listeners and native ARIA.
  Custom content wins over `value`, `max` and zero suppression. Use noninteractive phrasing
  content, not actions or focusable controls, in this passive indicator.
- Dot mode hides all indicator content through library-owned wrappers while preserving
  authored nodes and their own hidden/ARIA attributes. Removing dot mode restores content.
  Inert templates, scripts and styles are never interpreted as value content.
- Default target text alone does not manufacture a second count. Enhanced
  `<mui-badge>New</mui-badge>` keeps “New” readable as target text, but does not reproduce the
  legacy colored-pill treatment. Use `value="New"`, a marked value region, or the static CSS
  span for a standalone pill. The basic aggregate's old markup remains unchanged.
- Templates remain inert and application-owned. There is no template/VNode renderer.
  Unenhanced native targets still work; static authored spans are the fallback for counts
  that must be visible without JavaScript.

## Values and visibility

`value` / `.value` accepts text or a finite number. The attribute is the source of truth;
the getter returns its string or `undefined`. Assigning `null`, `undefined`, or a nonfinite
numeric value removes it. Empty/whitespace-only values do not show an indicator.

Finite decimal/exponent strings are treated as numeric counts for zero suppression and
overflow. Uncapped text is preserved, including decimals/leading zeros. Other strings
(including labels such as `NEW`) remain literal text and bypass numeric caps.
HTML is never parsed from a value.

- Without `show-zero`, counts **less than or equal to zero** are hidden, matching the
  upstream visibility condition. `show-zero` allows both zero and negative values.
- `max` / `.max` is optional; there is **no implicit cap**. A finite nonnegative cap displays
  `max+` when a numeric count exceeds it, without changing `.value`. Invalid/negative caps
  are ignored; invalid numeric property assignments remove the cap.
- `show="false"` / `.show = false` always hides the indicator, including dots/custom content.
- `dot` shows an indicator even without a value. `processing` only adds a visual pulse to an
  otherwise visible indicator; it does not force visibility or imply a busy/live ARIA state.
- Programmatic assignments are silent. Badge emits no extra click/input/change/status events.

Deliberate differences from upstream internals: numeric strings also participate in the cap;
signed/decimal numeric values display their actual text instead of animated integer digits;
dot mode hides custom value content as well as numeric text. There is no odometer,
enter/leave transition renderer, localized number parser or automatic raw-value tooltip.
Use explicit native target text/ARIA/title when the full uncapped value matters.

Unsigned integer count text and its overflow `+` use passive `.6em`-wide character spans,
matching upstream numeric geometry without old/new digit copies or animation machinery.
Leading zeroes remain intact. Signed, decimal, exponent and arbitrary text keep natural
text layout. Unlike Vue, HTML cannot distinguish a numeric prop from a numeric-string prop:
both integer forms take the fixed-cell path here. CSS-only static spans use natural text.

## Accessible naming and announcements

The component never adds a role, accessible name, tab stop or keyboard handler to the host
or target. Its indicator is a **sibling of the target**, not inserted into a native button's
label. Badge also never adds `aria-live`, `role="status"` or `aria-busy` automatically.

- Name the actual action with meaningful text, `aria-label`, or `aria-describedby`. Keep
  that wording synchronized in application code when the underlying count changes.
  For example, show `99+` visually but name the button “Inbox, 105 unread messages.”
- Use Boolean `decorative` / `.decorative` when the indicator duplicates that accessible
  information. It sets `aria-hidden` **only on the indicator**, never on the host or action.
  Without it, indicator text remains available to the accessibility tree.
- Do not set `aria-hidden` or `role="img"` on a host wrapping an interactive control; that
  can hide or override the control's semantics. Do not rely on a colored dot to communicate
  status: provide target/adjacent readable status text.
- If announcements are needed, author one appropriate live region and update it explicitly.
  A marked value region can retain author-supplied ARIA; no implicit duplicate announcer
  is introduced. Choose an announcement policy rather than blindly combining several
  live regions and focused-control label updates.
- There is no Badge `disabled` API. Disable the actual button/link behavior appropriately;
  the decorative count has no interaction to disable and must not become a fake control.

`element.indicator` exposes the native generated span (or `null` before connection) for
explicit native attributes when needed. Structural children/markers of that generated span
are library-owned; author count content with `data-mui-badge-value` rather than replacing
its internals. To retain description IDs across application-driven whole-host replacement,
preserve the authored value region itself.

## API and slot migration tracker

🟢 Verified retained native/CSS target · 🟡 Deliberate native representation/scope difference ·
⏭️ Framework-specific contract intentionally omitted.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `color` | `--mui-badge-background` in external CSS. | 🟡 Full CSS color support; no JS color prop or inline-style adapter. |
| `dot` | Boolean attribute / `.dot`. | 🟢 Passive circular indicator; authored/native content retained while hidden. |
| `max` | Numeric attribute / `.max`. | 🟢 Optional finite nonnegative cap; numeric strings participate; source value unchanged. |
| `offset` | `--mui-badge-offset-x`, `--mui-badge-offset-y`. | 🟡 External CSS lengths replace the tuple/JS transform API. Applies to attached indicators; positive X is right, positive Y down. |
| `processing` | Boolean attribute / `.processing`. | 🟢 CSS pulse only; reduced-motion mode removes it. Does not force show or announcements. |
| `show-zero` | Boolean attribute / `.showZero`. | 🟢 Allows zero and negative counts; custom value content and dots are independent. |
| `show` | `show="false"` / `.show`; default true. | 🟢 Hides indicator, not the authored target. |
| `type` | Attribute / `.type`: default, success, error, warning, info. | 🟢 External semantic palettes; default uses the error/red palette, as upstream does. |
| `value` | Attribute / `.value`; finite number or text input. | 🟢 Safe text and count formatting, no animation renderer; silent assignment. |
| Default slot | Authored native target children. | 🟢 Original nodes/listeners/semantics preserved; not a Shadow DOM slot. |
| `value` slot (source-only) | Authored `data-mui-badge-value` region(s). | 🟢 Preserved native content; takes precedence over generated counts. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS and inherited custom properties. | ⏭️ Vue theme objects, provider injection and runtime theme adapters omitted. |

Presence booleans such as `dot="false"` remain true; remove them or assign the property false.
Only `show` uses the explicit string `"false"` to opt out of its true default.

### MarkupUI CSS/native extensions

`placement` / `.placement` accepts `top-start`, `top-end`, `bottom-start`, `bottom-end`.
Top-end is default; unsupported values fall back to it. Logical anchors work in RTL;
offset X/Y remain physical directions. This convenience is not an upstream Badge prop.

Size is CSS-only: `--mui-badge-size` (18px height/leading; an explicit value also sets a
minimum width), `--mui-badge-dot-size` (8px), `--mui-badge-font-size` (12px),
`--mui-badge-font-family` (shared `--mui-font-family`, then the reference system stack),
`--mui-badge-font-weight` (inherited), `--mui-badge-padding` (6px horizontally),
`--mui-badge-radius` (9px), `--mui-badge-background`, `--mui-badge-color` (white), and
`--mui-badge-z-index` (2) are available.
There is no invented upstream size enum. Standalone/static badges remain in ordinary flow;
use normal native CSS if they need additional positioning.

An ancestor or host `data-mui-theme="dark"` selects Naive's supplementary dark Badge fills;
explicit nested `"light"` restores the light roles. This works without aggregate CSS.
Light roles reuse `--mui-color-error`, `--mui-color-success`, `--mui-color-warning`,
and `--mui-color-info`. Dark roles use the corresponding `--mui-color-*-suppl` token when
provided, otherwise local pinned fallbacks; ordinary dark semantic text colors are **not**
interchangeable with these badge fills. Set shared roles at the theme boundary; set
`--mui-badge-background` for a per-badge override. No shared theme adapter is installed.
The processing wave uses a 2s box-shadow spread with a 1s delay; reduced motion removes it
and the 0.3s color transitions.

Attached indicators ignore pointer hit-testing so they cannot steal target activation.
They may extend outside the target box; application ancestors with clipping/overflow must
provide enough space or use inward offsets. Long arbitrary labels remain the application's
layout responsibility. Custom colors must meet the contrast requirements of the actual theme.

## Lifecycle and limits

Host value/cap/visibility attributes synchronize immediately. Target/value-region additions,
removals, marker changes and text edits reconcile on a MutationObserver microtask. Ordinary
target replacement preserves the indicator; replacing **all** host children creates a new
indicator and does not resurrect discarded authored values.

Reflected properties support pre-definition assignment. Disconnect releases observation;
reconnection updates existing indicator/value nodes without duplication. No timers, geometry
measurements, event listeners, consumer compiler or runtime dependency are introduced.
No automatic provider, disabled, selection, form-field or announcing semantics are claimed.

## Numbered migration steps and acceptance

1. [x] Inventory all pinned props/default slot and source-only value/theme surfaces.
2. [x] Implement standalone ESM/classic/CSS exports without changing legacy aggregate budgets.
3. [x] Preserve native targets/custom content and supply a controller-free static span path.
4. [x] Implement count/text/max/zero/show/dot states and silent pre-upgrade/live properties.
5. [x] Implement external colors/sizing/logical placement/offsets and reduced-motion processing.
6. [x] Define explicit decorative, naming, announcement and disabled-target responsibilities.
7. [x] Add classic HTML/CSS/JS demo, focused tests and full integration validation.
8. [x] Review and verify native targets, accessible names, layout, zoom and loading order in Chromium.
9. [x] Reconcile reference rows/four retained tasks, index inventory and master status with evidence.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\badge.test.ts`: **23 focused tests passed**.
- `pnpm build && pnpm test`: declarations and budget-enforced distributions succeeded;
  **141 tests passed** (23 Badge, 26 Tag, 25 Card, 24 Button, 16 Avatar, 27 legacy/native).
- Focused coverage: numeric/text/decimal/exponent values, invalid caps/nonfinite input,
  zero/negative/show/dot rules, source-preserving caps, literal unsafe-looking text, custom
  content priority, inert templates, native form/focus/disabled preservation, decorative
  isolation, late/replaced targets/regions, silent updates, pre-upgrade state and reconnect.
- Chromium in an isolated demo tab on the existing port-4187 server: native Inbox submission
  and Tab order were unchanged, show/zero controls affected only the indicator, and reconnect
  preserved the original submit behavior. Capped `99+` stayed out of the decorative target's
  accessible name while its author-owned label described all 105 unread messages.
- Browser CSS confirmed all four logical corners, RTL end placement, external -6px/+6px
  offsets, type palettes, 18px/default and 28px/custom sizing, an 8px processing dot, native
  static/custom/signed content and no library-injected/inline styles. The static span's
  computed `flex` display is normal flex-item blockification of `inline-flex`.
- At **200% CSS zoom**, the count doubled from 18px to 36px, stayed readable and remained
  centered on its anchor. Reduced-motion emulation removed processing animation.
- Classic-before-aggregate preserved the rich constructor, zero host padding/transparent
  background, native target name and capped count. Separate documents verified ESM
  pre-upgrade values/max/type/placement, original target identity/click behavior and an
  explicit legacy-first conflict preserving the legacy constructor. Test-only documents closed.
- Final browser review also composed Badge around the enhanced Button before the aggregate:
  one native form submission, preserved focus/name, a capped indicator and target availability
  after hiding. A value-marked template stayed inert without creating an empty badge.
- Reference validation preserved all ten pinned Badge rows and added four explicit source
  supplements. The catalog has **96 pages, 3,048 rows, 384 tasks (20 accepted)** and
  **639 validated relative file links**, with canonical colored row statuses.
- Core remains **14,611 / 15,000 gzip bytes**, with all previous bundle sizes unchanged.
  Badge ESM/classic/CSS are **1,452 / 1,661 / 963 gzip bytes**, under separate
  **2,500 / 2,500 / 2,000** ceilings. Exact sizes are in `dist/manifest.json`.

Verification is for the retained scope, not Vue/pixel parity or all-browser/screen-reader
certification. Browser acceptance is Chromium, including CSS zoom rather than every browser's
page-zoom implementation. Safari/Firefox, touch devices, clipping contexts, custom themes and
application-specific announcements require downstream verification. Alert is next only through
coordinator selection; it is not implemented or started by this change.
