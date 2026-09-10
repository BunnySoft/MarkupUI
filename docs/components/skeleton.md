# Skeleton

**Migration status: 🟢 Verified for the retained native/CSS scope below.**
Skeleton creates bounded decorative placeholder spans. CSS owns shape, dimensions and motion;
the application—not Skeleton—owns actual loading state, meaningful status and content replacement.
Static native spans need no Custom Element controller.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Skeleton documentation](https://www.naiveui.com/en-US/os-theme/components/skeleton)
- [Public API: nine properties](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/demos/enUS/index.demo-entry.md)
- [Implementation: dimensions, repeat and shape precedence](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/src/Skeleton.tsx)
- [Native-size/theme mapping](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/skeleton/styles/light.ts)

The pinned page has no slots, events, methods or companion component. Source-only theme
objects are tracked separately; no provider, Houdini registration, VDOM or animation runtime
is imported.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-skeleton.js` | ESM; exports `MuiSkeleton`, `registerSkeleton()`; registers on browser import. |
| `dist/markup-ui-skeleton.global.js` | Classic script; registers and exposes `MarkupUISkeleton`. |
| `dist/markup-ui-skeleton.css` | External component and native static-placeholder CSS. |
| `dist/components/skeleton/index.d.ts` | Declarations, including validation-field names. |
| `demo/components/skeleton.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript example. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-skeleton.css">
<script defer src="./vendor/markup-ui-skeleton.global.js"></script>
<script defer src="./app.js"></script>

<mui-skeleton width="160px" height="20px" repeat="3"></mui-skeleton>
```

Application ESM: `import "@dataengine/markup-ui/skeleton";`. Serve/link the
`@dataengine/markup-ui/skeleton/style.css` export using your asset mechanism. Plain browsers
import the served `markup-ui-skeleton.js` URL instead of the package specifier.

Load enhanced Skeleton **before the legacy aggregate**, using ordered `defer` scripts or
ESM imports. The aggregate preserves registered definitions; legacy-first enhanced loading
throws an explicit conflict. Do not load both enhanced distributions in one document.
The legacy Skeleton, previous bundle sizes and 15,000-byte core ceiling remain unchanged.

## Decorative ownership, not a loading wrapper

Each component creates one owned native span group with `aria-hidden="true"` and `inert`;
the group contains only generated native placeholder spans. Native inertness prevents
focus/pointer activation inside the decorative group, rather than merely hiding potentially
focusable content from the accessibility tree.

The **host remains neutral**: no automatic `aria-hidden`, role, tab stop, `aria-live`,
`aria-busy` or keyboard handler. This deliberately differs from the legacy controller's
blanket host hiding. Author-supplied host ARIA is preserved. Authored root children and
listeners remain outside the decorative group, unmoved and not silently hidden.

Keep real content outside Skeleton whenever practical:

```html
<section id="results" aria-busy="true">
  <mui-skeleton class="result-placeholder" repeat="3"></mui-skeleton>
  <p role="status">Loading results.</p>
  <div id="real-results" hidden>Application-owned content</div>
</section>
```

The application changes busy state, status text and native `hidden` flags when appropriate.
Skeleton never treats repeat zero, an invalid input, animation off or its own removal as
proof that data finished loading. It neither disables nor announces unrelated content.

Do not put live controls under an explicitly authored `aria-hidden="true"` host without
appropriate inertness: that would be an author-created hidden-focusable subtree. Generated
groups are always decorative/inert; host `aria-hidden="false"` does not expose their bars.
Do not modify group markers/ARIA/inertness as an application API. Native inert support is
required for its full focus-blocking behavior; generated bars themselves are noninteractive
spans even without inert support.

Templates stay inert and are not cloned by the component. Complex authored placeholders may
use normal native HTML or application-owned `document.importNode` calls instead of a generic
library renderer. Original root nodes are not repeated when `repeat` changes.

## Width, height and validation

`width` and `height` attributes/properties accept nonnegative finite numbers (pixels) or
browser-supported CSS dimension values, including lengths, percentages, `calc`, variables
and intrinsic keywords such as `auto` where the browser supports them. Values are validated
through a detached native `CSSStyleDeclaration`, not a handwritten CSS parser/stylesheet.
Plain negative/nonfinite numeric dimensions and declaration-like strings are rejected.

CSS-wide keywords `inherit`, `initial`, `unset`, `revert`, `revert-layer` are intentionally
not accepted through these attributes, because their semantics differ when stored in a
custom property. Use ordinary external native CSS for those cascade operations.
Empty dimension attributes are invalid; remove an attribute or assign `null`/`undefined`
to return to CSS/preset defaults.

Property setters reject invalid input with `RangeError` **before** changing the current
attribute. Declarative invalid attributes remain visible for diagnosis and suppress the
generated group:

```js
const placeholder = document.querySelector("mui-skeleton");
placeholder.width = 160; // Validated pixel geometry.
placeholder.setAttribute("repeat", "500");
console.log(placeholder.valid); // false
console.log(placeholder.validationErrors); // ["repeat"]
```

`valid` and `validationErrors` are readonly target conveniences, not upstream or native
form-validity APIs. Invalid fields are also listed in `data-mui-skeleton-invalid`.
No guessed valid-looking geometry/count is silently substituted, and no error/live event
is synthesized. Correcting the attributes restores rendering.

Validation checks numeric ranges, supported syntax and enums—not whether external variables
exist or computed CSS expressions produce the application's desired geometry. The browser
still owns CSS resolution, percentage bases, intrinsic sizing and computed-value clamping.
Application styles and containing-block constraints remain significant.

### Dimensions and CSP

Prefer external tokens/presets:

```css
.result-placeholder {
  --mui-skeleton-width: 100%;
  --mui-skeleton-height: 18px;
  --mui-skeleton-gap: 8px;
}
```

To preserve existing attribute-driven geometry, the controller writes **only validated
values to isolated private custom properties** `--_mui-skeleton-width` and
`--_mui-skeleton-height`. Relative-height attributes additionally write a bounded numeric
`--_mui-skeleton-repeat` for CSS track calculations. No `style.cssText`, stylesheet strings,
style injection, JS measurements or animation frames are used.

These native style-property writes are an explicit CSP trade-off: avoid dimension attributes
and use external CSS/presets or static native placeholders when inline style attributes are
not permitted. Removal clears only these private overrides, preserving unrelated author
styles and public tokens. Private names must not be used as application styling APIs.
Explicit native CSS width/height declarations can still override normal stylesheet rules.

For rectangles, width sizes the host and each row fills it; height is per row. Percentages in
width do not accidentally apply twice. Height attributes containing percentages or variable/
environment expressions use native CSS total-height/row calculations. Percentage height
requires a **definite containing height**, just as ordinary native CSS does.
For a percentage supplied through an external height token on the enhanced component,
use an explicit `height="var(--mui-skeleton-height)"` bridge, or an appropriate native/static
CSS layout; an auto-height row group alone does not establish a percentage basis.

Explicit relative height constrains the placeholder envelope. Authored root content is
preserved but remains subject to ordinary CSS overflow/size constraints; Skeleton is not
intended to size or conceal a loaded-content subtree.

## Shapes, sizes and repeat

- Unspecified dimensions default to width 100% and height 1em.
- `size="small|medium|large"` supplies 28/34/40px per-row height. There is no implicit medium
  preset; removing size restores 1em unless a dimension/token overrides it.
- `text` uses an inline-block host with native `vertical-align: -.125em`.
- `sharp` defaults true (right angles). `sharp="false"` uses the soft-radius CSS token.
  `round` wins over sharp/soft, and `circle` wins over round.
- Circle side length prefers width, then height, then the size/default. Native `aspect-ratio`
  produces a real square even for percentage widths. A height used as a circle side is
  interpreted through width layout, rather than producing different percentage axes.
- `repeat` accepts whole decimal integer strings/numbers **0–100**, default one.
  Zero renders no rows. Invalid declarative repeat reads as `undefined`, not a valid-looking
  zero; `.validationErrors` distinguishes it from an intentional empty group.
- Valid updates grow/shrink only owned spans and retain surviving row identities.
  Invalid state can retain previously generated rows while hiding their group; the DOM
  allocation remains bounded. No authored content/template is cloned.
- Repetition is a vertical native grid with configurable gaps, not upstream Fragment
  siblings. Unlike upstream's repeat-at-most-one behavior, explicit zero means zero.

## Animation and CSS-only path

`animated` defaults true; `animated="false"` / `.animated = false` stops the CSS background-
color pulse. The default two-second cycle matches the pinned reference: start color at
0%, end color at 40%, then start color again at 80% and 100%, using
`cubic-bezier(.36, 0, .64, 1)`. It does not animate opacity, so authored opacity is preserved.
`prefers-reduced-motion: reduce` disables animation and background transitions for both
enhanced and static placeholders. This retained reduced-motion policy is stronger than the
pinned upstream default. There is no animation runtime, Houdini registration or loading timer.

For a static placeholder, load only the CSS:

```html
<span class="mui-skeleton avatar-placeholder" aria-hidden="true" inert data-circle
      data-animated="false"></span>
```

```css
.avatar-placeholder { --mui-skeleton-width: 48px; }
```

Static classes use `data-text`, `data-round`, `data-circle`, `data-sharp="false"`,
`data-size` and `data-animated="false"` equivalents. Explicitly author decorative/inert
semantics; CSS cannot supply accessibility attributes. An application may build repeated
static native spans when a controller is unnecessary.

Public tokens: `--mui-skeleton-width`, `--mui-skeleton-height`, `--mui-skeleton-gap`,
`--mui-skeleton-radius`, `--mui-skeleton-color` and `--mui-skeleton-color-end`.
The color token supplies the static/start color; the end token supplies the animated peak.
Override both colors when customizing the complete pulse, or disable animation for one
constant custom color. Radius overrides apply to soft and round shapes; circle retains 50%.
Private attribute variables/presets reset
on nested components to avoid geometry leakage; explicitly inherited public tokens remain
application-owned. Use a nonnegative CSS length for the gap (for example `8px` or `0px`),
not a percentage or intrinsic keyword, when relying on relative-height track calculations.

### Default colors and theme scope

Defaults now follow the pinned Naive UI theme: light `#eee` to `#ddd`, and dark white at
.12 to .18 alpha. Set `data-mui-theme="dark"` on an ancestor or the native/static placeholder;
nested `data-mui-theme="light"` scopes restore the light endpoints. These neutral defaults
are local to the Skeleton stylesheet, so even the CSS-only path needs no shared theme
stylesheet or JavaScript controller. Explicit public color tokens still take precedence.

The 1em default, 28/34/40px presets, 3px soft radius and text baseline treatment are retained.
The round-radius default is now 4096px, matching upstream; at ordinary dimensions both the
old 999px and new value render as pills. Existing true-square circle geometry, repeated-row
gaps and zero-repeat behavior remain deliberate native differences.

See the [rendered Skeleton style audit](../style-audit/components/skeleton.md) for measured
default/shape/text/color/animation comparisons and the exact retained boundaries.

## Per-property tracker

🟢 Verified retained native target · 🟡 Deliberate representation/scope boundary ·
⏭️ Framework-specific API intentionally omitted.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `text` | Boolean attribute/property, native inline-block baseline alignment. | 🟢 No typography renderer or hidden content replacement. |
| `round` | Boolean attribute/property and CSS pill radius. | 🟢 Wins over sharp/soft; circle has higher precedence. |
| `circle` | Boolean attribute/property and native aspect ratio. | 🟢 Width/height/size precedence retained with true-square percentage geometry. |
| `height` | Validated attribute/property or external CSS height token. | 🟡 Retained numeric/native CSS geometry; strict invalid-input policy and isolated style/CSP boundary above. |
| `width` | Validated attribute/property or external CSS width token. | 🟡 Same explicit validation/CSP contract; one-row host envelope remains native width/height. |
| `size` | Attribute/property: small/medium/large or absence. | 🟢 28/34/40px presets; invalid enums are diagnosed/rejected. |
| `repeat` | Attribute/property, bounded 0–100 integer rows. | 🟡 Native construction instead of Fragment/VNode cloning; zero and invalid behavior are explicit. |
| `animated` | `animated="false"` / `.animated`, true default. | 🟢 CSS pulse only; reduced motion respected independently of loading state. |
| `sharp` | `sharp="false"` / `.sharp`, true default. | 🟢 Native CSS corner treatment. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS/custom properties. | ⏭️ Framework theme/provider objects and runtime style adapters omitted. |

Presence booleans such as `circle="false"` still mean true; remove them or assign false.
Only `animated` and `sharp` use explicit `"false"` to opt out of true defaults.

## Lifecycle and boundaries

Retained geometry/repeat/size attributes synchronize immediately. Child replacement and
removal reconcile on a MutationObserver microtask; only owned generated spans are removed
by repeat changes. Reflected properties support pre-definition assignment.
Disconnect releases observation; reconnect reuses valid surviving spans and updates their
geometry without adding duplicate groups. No user-event listeners are installed.

The component does not claim to provide real-content readiness, form state, announcements,
virtualization, arbitrary renderer templates or complete upstream CSS/theme compatibility.
Unstyled meaningful fallback/status text remains application-owned and readable.

## Numbered migration steps and acceptance

1. [x] Inventory all nine pinned properties and source theme supplements; inspect legacy geometry.
2. [x] Add optional ESM/classic/CSS exports with unchanged core and measured independent ceilings.
3. [x] Keep owned placeholders decorative/inert without hiding or cloning authored root content.
4. [x] Validate dimensions/enums/repeat with explicit errors and bounded native construction.
5. [x] Implement external shape, text, size, repetition and reduced-motion CSS.
6. [x] Preserve useful numeric/percent/math geometry, circle precedence and nested-variable isolation.
7. [x] Demonstrate application-owned busy/content transitions and CSS-only static markup.
8. [x] Run focused/integration/build/browser gates and resolve coupled review findings.
9. [x] Reconcile reference rows/four tasks, catalog totals and master progression.

### Style acceptance — 2026-09-10

- Compared 24 cases in both themes against installed Naive UI 2.45.3/Vue 3.5.30 using
  current source, original source and later-loaded legacy CSS/aggregate.
- The 21 comparable variants per theme matched visible bar geometry, radius, inherited
  font size, fill, opacity and animation timing. Default/percentage circles and repeat zero
  retain the documented native differences; repeated bars retain their 8px grid gap.
- Browser animation samples at 0/400/800/1200/1600/1900ms matched upstream colors in both
  themes, including custom endpoint overrides. Static CSS-only dark rendering, nested
  light scope, custom dimensions/radius/opacity and reduced motion were verified separately.
- `pnpm test -- tests\skeleton.test.ts tests\skeleton.styles.test.ts`: **26 tests passed**,
  including three stylesheet regressions for endpoints/phases, shared static/bar timing
  and light/dark/reduced-motion rules.
- The coordinated full build and all **26 Skeleton tests** pass. Final manifest
  ESM/classic/CSS sizes are **1,802 / 2,007 / 912 gzip bytes**, below the unchanged
  **2,500 / 2,500 / 1,500** ceilings.

### Historical acceptance evidence — 2026-09-08

The original pulse observations and byte counts below predate the default-style corrections.

- `pnpm test -- tests\skeleton.test.ts`: **23 focused tests passed**.
- `pnpm build && pnpm test`: declarations and budget gates succeeded; **213 tests passed**
  (23 Skeleton plus all 190 previous component/legacy tests).
- Focused cases cover safe CSS-value normalization, negative/nonfinite/declaration-like
  rejection, invalid-attribute diagnosis, bounded repeat/zero, stable row identity, author
  nodes/templates/styles/ARIA, inert groups, silent assignment, pre-upgrade state and cleanup.
- Review corrected ambiguous invalid-repeat getters, prevented private dimension inheritance
  into nested Skeletons, and added native CSS percentage-height/variable-height row sizing
  rather than allowing valid-looking zero-height placeholders.
- Chromium verified 120×32px legacy-style one-row geometry, sharp/soft/pill/circle shapes,
  width-over-height circle precedence, 28/34/40px presets, 1em inline text alignment, percentages,
  `calc` width, repeat gaps, static CSS-only dimensions and no injected stylesheet.
- Percentage heights of 25% in a 200px containing block produced three 50px rows plus two
  8px gaps (166px envelope). Variable percentage heights and circle override also worked.
  Nested private geometry did not leak: a 160px outer/inner width retained the inner 1em height.
- Native inertness blocked focus on a control inserted into the decorative group, while
  authored root caption/action remained visible and functional through reconnect. Templates
  stayed outside layout. Invalid repeat hid the group and was reported by application UI,
  without changing application `aria-busy`; only the application's load toggle changed it.
- Animated-false and reduced-motion checks removed the pulse. Classic-before-aggregate kept
  the rich constructor, geometry and inert group, removed legacy host animation/background
  interference and did not hide author content. Separate documents verified ESM pre-upgrade
  dimensions/count/ARIA and explicit legacy-first conflicts. Test-only documents closed.
- Reference validation preserved all nine original rows plus three source supplements.
  The catalog records **96 pages, 3,059 rows, 384 tasks (32 accepted)** and
  **666 validated relative file links** with canonical colored statuses.
- Core remains **14,611 / 15,000 gzip bytes**, previous outputs unchanged.
  Skeleton ESM/classic/CSS are **1,802 / 2,007 / 786 gzip bytes**, under separate
  **2,500 / 2,500 / 1,500** ceilings; exact values are in `dist/manifest.json`.

This is retained scope, not pixel/Fragment/theme parity or all-browser accessibility
certification. Chromium was exercised; native CSS/inert support, application CSP, computed
variable values, layout constraints and assistive-technology behavior need downstream checks.
Spin is next only through coordinator selection; it is not started by this change.
