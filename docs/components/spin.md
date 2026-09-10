# Spin

**Migration status: 🟢 Verified for the retained native scope below.**
Spin supplies a decorative graphic, optional native description and a narrowly owned display
delay. It preserves wrapped native content and does not become a data-loading service,
interaction blocker, focus trap or automatic live announcer.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Spin documentation](https://www.naiveui.com/en-US/os-theme/components/spin)
- [Public API: eleven properties and three slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/demos/enUS/index.demo-entry.md)
- [Spin implementation and deprecated spinning alias](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/spin/src/Spin.tsx)
- [Shared loading geometry declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_internal/loading/src/Loading.tsx)

The pinned page has no public methods/events or companion component. Its radius/scale/stroke
declarations are public rows, not duplicate supplements. Deprecated `spinning` and three
inherited theme contracts are recorded separately as omissions.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-spin.js` | ESM; exports `MuiSpin`, `registerSpin()`; registers on browser import. |
| `dist/markup-ui-spin.global.js` | Classic script; registers and exposes `MarkupUISpin`. |
| `dist/markup-ui-spin.css` | External component and native static-spinner CSS. |
| `dist/components/spin/index.d.ts` | Declarations including validation-field names. |
| `demo/components/spin.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript demo. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-spin.css">
<script defer src="./vendor/markup-ui-spin.global.js"></script>
<script defer src="./app.js"></script>

<mui-spin description="Loading reports"></mui-spin>
```

Application ESM: `import "@dataengine/markup-ui/spin";`. Serve/link the
`@dataengine/markup-ui/spin/style.css` export with your asset mechanism. A plain browser
imports the served `markup-ui-spin.js` URL rather than the bare package specifier.
Consumers require no compiler, icon package or runtime dependency.

Load enhanced Spin **before the legacy aggregate**, using ordered `defer` scripts or ESM
imports. The aggregate preserves registered definitions. Legacy-first enhanced loading
throws an explicit conflict. Do not load both enhanced distributions in one document.
Legacy code/styles, earlier bundle sizes and the 15,000-byte core ceiling remain unchanged.

## Standalone versus wrapped content

- **Standalone:** no default content target. The indicator is displayed immediately;
  `show` and `delay` do not control it, matching the documented standalone distinction.
  Use native `hidden`, conditional insertion or removal to hide a standalone spinner.
- **Wrapped:** ordinary default children, or one explicit
  `div[data-mui-spin-content]`, are the target. The indicator is centered over this content,
  and `show`/`delay` control its visual presence.
- Explicit empty content regions still establish wrapped mode. Removing a generated empty
  content wrapper returns to standalone mode. Adding content starts a fresh wrapped display
  episode rather than inheriting an old timer.

```html
<mui-spin show="false" delay="200" description="Refreshing reports">
  <div data-mui-spin-content class="report-panel" aria-busy="false">
    <label>Report title <input name="title"></label>
    <button type="button">Refresh</button>
  </div>
</mui-spin>
```

Authored native targets, classes, IDs, listeners, input values, button types and form behavior
are preserved. Loose target nodes move into a native wrapper without cloning. A late explicit
content region adopts existing target nodes; replacing the entire subtree never resurrects
discarded content.

### Exact busy/blocking contract

**Spin does not write `aria-busy`, `inert`, `aria-hidden`, disabled or readonly state to its
content.** It does not rewrite target labels or install keyboard/focus handlers.
Wrapped content stays operable while the indicator is visible. This deliberately differs
from upstream's pointer-blocking CSS.

The overlay ignores pointer hit-testing. Visible wrapped content is dimmed by external CSS
(`--mui-spin-content-opacity`, default `.5` in light and `.38` in dark); hiding/disconnecting removes that private
visual state so the author's original CSS applies again. No author opacity attribute/style
is overwritten.

Applications own actual request/busy state, which often begins **before** a delayed indicator
appears. If a specific operation must block controls, explicitly use native disabled/inert
on the application's appropriate content owner and restore its prior state yourself.
The demo demonstrates application-owned inert/busy snapshots and restoration; these are
not Spin props or behavior. Existing author-set busy/inert/hidden values remain untouched by
Spin on show/hide, disconnect, reconnect and replacement.

Do not set `aria-hidden` on a wrapper containing live focusable controls as a substitute for
blocking. No default Spin behavior creates such a hidden-but-focusable content subtree.

## Description, naming and native icons

```html
<mui-spin rotate="false">
  <svg data-mui-spin-icon aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle>
  </svg>
  <span data-mui-spin-description>Reading the report</span>
</mui-spin>
```

Icon and description regions are explicit authored-child conventions, not Shadow DOM slots.
They move into the indicator without cloning and retain their own SVG/HTML/ARIA attributes.
Use noninteractive icon/description content; recovery/cancel actions belong in the usable
default content, not in the pointer-transparent indicator.

Description precedence follows the useful source contract:

1. A nonblank `description` attribute/property supplies safe visible text.
2. Otherwise, authored `data-mui-spin-description` region(s) supply content.
3. Otherwise, a visually hidden readable fallback uses legacy `label` / `.label`, default
   **“Loading”**. If the host already has an explicit ARIA name, this fallback is suppressed
   to avoid a competing generic label.

When a property description takes precedence, only a library-owned slot wrapper is hidden;
the original description nodes/hidden attributes/listeners are preserved for restoration.
Empty/whitespace-only property descriptions are treated as absent. An explicitly authored
empty description region suppresses fallback; its meaningful naming is the author's
responsibility.

No role, `aria-live`, `aria-atomic` or automatic status announcer is added. This is a deliberate
difference from the legacy host's unconditional `role="status"`. Choose an appropriate native
status region yourself—for example a standalone `role="status" aria-label="Uploading files"`,
or a separate live description outside a busy content region. Explicit host/child ARIA is
preserved, not duplicated. Do not indiscriminately label a wrapped host in a way that overrides
the semantics of its native controls.

The default graphic is a native circle SVG with a CSS-animated arc, created in the SVG namespace,
decorative and nonfocusable. It has no SMIL elements or icon-library dependency. The visible
description/accessible fallback carries the meaning, not rotation or color.

## Geometry, colors and motion

- `size` / `.size` accepts small/medium/large or a finite nonnegative number of pixels.
  Presets are **28 / 34 / 40px**, with medium default. Numeric strings are accepted in HTML;
  arbitrary CSS size strings are not this API—use `--mui-spin-size` externally instead.
- Default stroke widths are **20 / 18 / 16** for small/medium/large, and 18 for numeric size,
  in the default graphic's relative coordinate system.
- `stroke-width` / `.strokeWidth` is finite and nonnegative. `radius` / `.radius` defaults
  to 100 and must be positive; `scale` / `.scale` defaults to 1 and must be positive.
- The native graphic uses center `radius / scale`, a square viewBox twice that center, and
  circle radius `radius - strokeWidth / 2`. Combined geometry requires a finite positive
  viewBox and stroke width less than twice radius. Scale can zoom/crop the ring as upstream's
  coordinate model does; choose values suited to the visible graphic.
- The circle's native `pathLength` normalizes dash units by the configured radius. Fixed
  CSS dash values 567/142 then correspond to upstream's `5.67 × radius` / `1.42 × radius`
  across supported stroke/radius/scale combinations, without extra style-property writes.
- `stroke` / `.stroke` is a browser-supported CSS color, validated with a detached native
  color declaration and applied through SVG `color` with `stroke="currentColor"` rather
  than a broader paint-server URL contract. Empty/invalid values and CSS-wide cascade
  keywords are rejected; remove the attribute to use `currentColor`/external CSS.
- Geometry/stroke props affect the default graphic, not an authored icon's path/stroke.
  Configuration is still validated consistently when custom content is present.
- `rotate="false"` / `.rotate = false` stops rotation of **custom** icons. The default
  graphic retains its own CSS rotation and arc animation, matching the documented distinction.
  Reduced-motion preference stops both kinds and leaves a readable stationary partial ring.

Default motion now follows the pinned loading graphic: a three-second full rotation plus
a 1.6-second arc cycle. The latter combines the source's nested rotations into
0° → 270° → 720°, while its dash offset moves 567 → 142 → 567. Both cycles are linear.
Custom icons retain their separate two-second rotation. No SMIL, animation frame loop or
JavaScript animation controller is introduced.

Descriptions inherit surrounding typography and, in standalone mode, surrounding text color.
Wrapped descriptions use the primary theme color by default. This matches the actual pinned
rendering, including its mode-dependent description color. Public description/font tokens
override these defaults. Use the existing themes stylesheet with `data-mui-theme="dark"` for
the shared primary palette; content dimming is scoped locally by the Spin stylesheet.
Nested `data-mui-theme="light"` scopes restore its light dimming value.

Numeric size uses one isolated private custom-property write, `--_mui-spin-size`; this is
an explicit style-attribute/CSP boundary, not a runtime stylesheet or prop-object adapter.
Use presets or external `--mui-spin-size` when avoiding inline sizing. SVG geometry uses
validated native numeric attributes, not a CSS/animation renderer.

Invalid scalar property assignments throw `RangeError` before changing that attribute.
Invalid declarative values or cross-field geometry produce `validationErrors`,
`valid === false` and `data-mui-spin-invalid`, cancel pending display and hide the indicator.
They do not change actual content/busy state or silently choose a successful-looking fallback.
Cross-field constraints are evaluated together: configure stroke width/radius in a compatible
sequence, or correct the flagged attributes. Validation is not a data-loading or form-validity API.

## Delay and cleanup

`delay` / `.delay` is an integer millisecond value from **0 through 2,147,483,647**; omission
means zero. Negative, fractional, nonfinite and native-timer-overflow values are rejected or
diagnosed.

For wrapped mode:

- A new shown request starts one delay. Zero displays immediately.
- `show="false"`, native host `hidden`, invalid configuration or disconnect cancels pending
  work and hides the indicator immediately.
- Repeated same-value `show` assignments or description/size/icon updates do not restart a
  pending deadline. Changing a pending delay restarts from that change.
- Changing delay after the indicator is visible does not flash/hide it or start a redundant
  timer. A subsequent hide/show cycle uses the new delay.
- Reconnect/reveal starts a fresh full delay for a requested wrapped indicator.
  Mode changes cancel stale timing; standalone never needs a display timer.
- Generation guards prevent callbacks from earlier requests from activating a later one.

`active` exposes logical indicator visibility after the delay, **not actual loading completion**
or computed stylesheet visibility. Stylesheet-only or ancestor visibility changes are not
observed as timer commands; use `show`, native `hidden` on Spin, or removal for cancellation.
`contentElement` and `indicatorElement` expose native nodes for appropriate native attributes
or application policy. Generated structure/markers are library-owned.
No change/input/ready event is fabricated for property assignment.

## Per-property and slot tracker

🟢 Verified retained target · 🟡 Deliberate native representation/scope difference ·
⏭️ Framework/deprecated API intentionally omitted.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `content-class` | Native `class` / `classList` on authored content region. | 🟡 Useful class styling retained; no host class-string forwarding adapter. |
| `content-style` | External scoped content CSS. | ⏭️ Inline style-string/object prop omitted. |
| `description` | Safe visible string attribute/property, or authored description. | 🟢 Property-first precedence with preserved native slot content; blank strings treated as absent. |
| `rotate` | `rotate="false"` / `.rotate`, true default. | 🟢 Custom-icon rotation only; reduced motion applies to all graphics. |
| `size` | Preset or nonnegative finite numeric attribute/property. | 🟢 28/34/40px presets, numeric size and explicit validation/CSP boundary. |
| `show` | `show="false"` / `.show`, true default. | 🟢 Controls wrapped indicator only; standalone remains displayed unless natively hidden/removed. |
| `stroke-width` | Validated `.strokeWidth` / numeric attribute. | 🟢 Native SVG stroke geometry, including explicit zero; valid combined radius required. |
| `radius` | Positive numeric attribute/property, default 100. | 🟢 Native circle/viewBox geometry; not a separate animation engine. |
| `scale` | Positive numeric attribute/property, default 1. | 🟢 Native viewBox scaling; finite derived geometry required, zoom/cropping documented. |
| `stroke` | Validated color attribute/property or external color token. | 🟢 Native SVG paint; no dynamic CSS style object. |
| `delay` | Bounded integer milliseconds attribute/property. | 🟢 Real wrapped display delay, cancellation and stale-generation guard. |
| Default slot | Authored targets or `data-mui-spin-content`. | 🟢 Original controls/listeners/state preserved; interaction stays usable instead of upstream pointer blocking. |
| Description slot | Authored `data-mui-spin-description`. | 🟢 Native nodes/ARIA retained while property overrides are temporary. |
| Icon slot | Authored HTML/SVG `data-mui-spin-icon`. | 🟢 Native node identity/ARIA and custom rotation; no icon dependency. |
| `spinning` (deprecated source prop) | Use `show`. | ⏭️ Deprecated compatibility/warning layer omitted. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS/custom properties. | ⏭️ Framework provider/theme objects and runtime adapters omitted. |

`show` and `rotate` explicitly accept `"false"` because their defaults are true.
`label`, `active`, node accessors and validation getters are target/legacy conveniences,
not invented upstream inventory rows.

## CSS-only/native and lifecycle boundaries

The demo includes a native `.mui-spin` wrapper with an authored decorative SVG, explicit
description and the same external CSS. It needs no controller when delayed wrapping is
unnecessary. An existing arbitrary static SVG may retain only whole-graphic rotation.
For the complete default arc motion, the equivalent 34px native markup is:

```html
<span class="mui-spin">
  <span data-mui-spin-indicator>
    <span data-mui-spin-icon-box>
      <svg data-mui-spin-default aria-hidden="true" focusable="false"
           viewBox="0 0 200 200" fill="none" stroke="currentColor">
        <circle data-mui-spin-arc cx="100" cy="100" r="91" stroke-width="18"
                stroke-linecap="round" pathLength="571.7698629533425"
                stroke-dasharray="567" stroke-dashoffset="142"></circle>
      </svg>
    </span>
    <span data-mui-spin-description-area data-mui-spin-visible-description>Loading</span>
  </span>
</span>
```

The normalized `pathLength` above is specific to radius 100 / stroke width 18. Preserve
that geometry or recalculate it when authoring a different static ring; the enhanced
controller does so automatically. Templates stay inert and are never cloned or rendered.

Public CSS tokens: `--mui-spin-size`, `--mui-spin-color`, `--mui-spin-font-size`,
`--mui-spin-description-color`, `--mui-spin-description-gap`, `--mui-spin-content-opacity`,
`--mui-spin-z-index`. Scoped icon selectors prevent a parent's custom rotation from affecting
nested spinners. Native hidden icons remain hidden. Motion is CSS-only and reduced-motion-aware.

Live attributes/pre-upgrade properties update native DOM without replacing target nodes.
Mutation observation adopts late/changed regions; disconnect removes observation and timers.
No target-state writes, focus handlers, busy provider, blocking overlay service, VDOM,
HTML-string evaluator, stylesheet injection or runtime dependency is introduced.

## Numbered migration steps and acceptance

1. [x] Inventory fourteen pinned rows plus deprecated/theme source supplements and shared SVG geometry.
2. [x] Add optional ESM/classic/CSS exports, preserving legacy registration and core budgets.
3. [x] Preserve wrapped targets/custom descriptions/icons and define native label/busy ownership.
4. [x] Implement validated SVG sizes/stroke/radius/scale and scoped CSS motion/reduced motion.
5. [x] Implement real wrapped delay with cancellation, mode/reconnect and stale-generation rules.
6. [x] Demonstrate usable native controls and separately owned explicit inert/busy restoration.
7. [x] Validate focused timing/DOM tests, full integration suite and budget-enforced build.
8. [x] Review nested CSS/hidden-state issues and verify native browser timing, focus and load order.
9. [x] Reconcile reference rows/four tasks, catalog totals and P2-02 retained-workstream completion.

### Style acceptance — 2026-09-10

- Actual Chromium reference/source comparisons covered 20 cases in both themes: all sizes,
  numeric size, stroke/radius/scale, standalone/wrapped descriptions, custom icons, show/off,
  delayed wrapping and authored tokens. Corrected geometry, text metrics/colors and content
  opacity matched all corresponding visible reference regions.
- Five timeline samples across five geometries in both themes matched arc angles within
  .001°; normalized dash values reproduce the source's radius-scaled arc cycle.
  Later-loaded legacy CSS/aggregate retained identical corrected measurements.
- Real wrapped delay, short-load cancellation, native input/click usability, author tokens,
  adjacent-text baseline, static CSS-only motion and reduced motion were checked separately.
- `pnpm test -- tests\spin.test.ts tests\spin.styles.test.ts`: **32 tests passed**.
  Isolated strict TypeScript passed. Existing exact build recipes exercised without `dist`
  writes produced ESM/classic/CSS **3,117 / 3,325 / 1,194 gzip bytes**. The subsequent
  coordinated build passed with final manifest counts **3,111 / 3,319 / 1,190**,
  below unchanged **3,500 / 3,500 / 2,000** ceilings; all 32 Spin tests passed again.
- See the [rendered Spin style audit](../style-audit/components/spin.md) for evidence,
  deliberate native differences and the distinction between matching samples and pixel parity.

### Historical acceptance evidence — 2026-09-08

The initial fixed-arc motion, `.65` opacity and byte counts below predate the style corrections.

- `pnpm test -- tests\spin.test.ts`: **28 focused tests passed**.
- `pnpm build && pnpm test`: declarations and budgets passed; **241 tests passed**
  (28 Spin plus all 213 prior tests).
- Fake-timer tests cover short/long loads, same-show/visual updates, pending-delay changes,
  immediate zero, hide/native hidden, disconnect/reconnect, mode changes, stale callbacks,
  pre-upgrade configuration and invalid-input cancellation.
- DOM tests cover native submit/reset/focus, untouched busy/inert/ARIA/class state, target
  and custom-description/icon identity, safe labels, source description precedence, SVG
  namespace/geometry, numeric/color validation, templates and replacement.
- Chromium on the existing port-4187 server verified 28/34/40/48px sizes, SVG radius/scale/
  stroke, standalone show distinction, real 300ms display delay and short-request cancellation.
  Native form controls remained usable through the active visual overlay; input/listeners
  survived reconnect. Application-owned inert blocked focus only when explicitly requested
  and was restored by the application on completion.
- Custom rotate/reduced-motion and explicit host status/name behavior were exercised without
  duplicate generic fallback text. Actual assistive-technology speech timing is not certified.
- Review scoped custom rotation to its own indicator and honored hidden native icon nodes;
  browser checks verified no nested double rotation. Classic-before-aggregate retained the
  rich constructor, removed legacy host animation/border, restored content opacity from .65
  to 1 on hide, and left author busy/inert/role state unchanged.
- Final color review applies validated colors through SVG `color` while keeping paint
  `currentColor`; Chromium verified teal/purple output and the final delay/hide behavior.
- Separate documents verified ESM pre-upgrade timing/geometry, native target and description
  identity, explicit role and legacy-first conflict. Test-only documents closed.
- Core remains **14,611 / 15,000 gzip bytes**, previous output sizes unchanged.
  Spin ESM/classic/CSS are **3,077 / 3,284 / 966 gzip bytes**, under separate
  **3,500 / 3,500 / 2,000** ceilings; exact values are in `dist/manifest.json`.
- Reference validation preserved fourteen pinned rows plus four source supplements:
  **96 pages, 3,063 rows, 384 tasks (36 accepted), 675 validated relative file links**.
  P2-02 is Verified for retained scope while whole P2 remains In progress.

This is retained native scope, not full source pointer-blocking/theme/announcement parity.
Chromium was exercised; other browsers, native inert/CSS support, computed colors, application
CSP/contrast and actual screen-reader announcements require downstream checks.
P2-02's Tag/Badge/Alert/Empty/Skeleton/Spin retained workstream is complete, not all of P2.
Progress is next, then Statistic and the remaining typography/layout/content work, only through
coordinator selection; none are started by this change.
