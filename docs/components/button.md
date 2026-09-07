# Button and Button Group

**Migration status: 🟢 Complete and verified for the retained native scope below.**
This is an optional, dependency-free component, not the basic Button in the legacy aggregate.
All upstream public properties, the source-only click callback and slots are accounted for;
intentional native replacements and omissions are not claims of Vue API or pixel parity.

## Sources and distribution

Inventory pinned to Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:

- [Official Button documentation](https://www.naiveui.com/en-US/os-theme/components/button)
- [Button API and slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md)
- [Button implementation and `onClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/src/Button.tsx)
- [ButtonGroup implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button-group/src/ButtonGroup.tsx)

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-button.js` | ESM; exports `MuiButton`, `MuiButtonGroup`, `registerButton()`; registers on browser import. |
| `dist/markup-ui-button.global.js` | Classic script; registers and exposes `MarkupUIButton`. |
| `dist/markup-ui-button.css` | Required external CSS; no style injection or inline styles. |
| `demo/components/button.html`, `.css`, `.js` | Separate runnable HTML, CSS and plain JavaScript demo. |
| `dist/components/button/index.d.ts` | TypeScript declarations, also selected by the package export. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-button.css">
<script defer src="./vendor/markup-ui-button.global.js"></script>
<script defer src="./app.js"></script>

<mui-button type="primary">
  <button type="submit" name="action" value="save">Save</button>
</mui-button>
```

Application ESM: `import "@dataengine/markup-ui/button";`. Serve/link the
`@dataengine/markup-ui/button/style.css` export using your asset-serving mechanism.
Plain browsers import the served `markup-ui-button.js` URL, not a bare npm specifier.
Consumers need no compiler or runtime dependencies.

If also using the legacy aggregate, **load Button before the aggregate**. Use ordered
`defer` classic scripts or ordered ESM imports. The aggregate preserves registered classes;
external Button CSS isolates the wrapper from later-installed legacy Button styling.
Legacy-first loading throws an explicit conflict before registering either rich class.
Do not load both Button ESM and classic builds in one document. The legacy aggregate still
contains its original basic implementation and has unchanged output sizes and budget.

## Native markup contract

Author **one direct `<button>` or `<a>`**, with phrasing content inside it. This native child
is the only interactive/accessible root. The `mui-button` wrapper does not acquire
`role="button"` or a tab stop. Give IDs referenced by native labels, native `tabindex`,
`autofocus`, `accesskey`, `title`, additional ARIA, popover attributes and other native
attributes to the **child**, not the host. Do not add a host `role` or `tabindex`: these
are not forwarded, and can create duplicate semantics/tab stops.

```html
<form id="editor">
  <label>Title <input name="title" required></label>
  <mui-button type="primary">
    <button type="submit" name="action" value="save">
      <span data-mui-button-icon aria-hidden="true">✓</span>Save
    </button>
  </mui-button>
  <mui-button><button type="reset">Reset</button></mui-button>
</form>

<mui-button circle>
  <button type="button" aria-label="Add item">
    <span data-mui-button-icon aria-hidden="true">+</span>
  </button>
</mui-button>
<mui-button text><a href="/help" rel="help">Help</a></mui-button>
```

Without an authored direct control, the component creates a real `<button type="button">`
and moves the original child nodes into it without cloning. This safe default does not
submit a form. An authored `<button>` with no `type` retains the browser's **submit**
default. Host `type` is always visual; use host `attr-type` to override the child's native
type, or author its `type` directly. Invalid `attr-type` falls back to `button`.
Do not put multiple controls, nested buttons/links, inputs, or other interactive descendants
inside one Button. Group multiple actions with `mui-button-group`.

Host form conveniences are `attr-type`, `name`, `value`, `form`, `formaction`, `formmethod`,
`formenctype`, `formtarget` and Boolean `formnovalidate`. These target a native **button**
only. For example, `form="editor" attr-type="submit"` on a generated Button works outside
the form. Constraint validation, submitter identity, successful-control name/value,
reset, external form ownership and disabled fieldsets are handled by the browser.
The wrapper is not a form-associated custom element and does not imitate those algorithms.
Host `href`/`tag` are not supported; author an `<a>` for navigation.

### Names, events, state and lifecycle

- Visible native child text names the control. Icon-only controls require a native
  `aria-label` or `aria-labelledby`. Mark decorative direct icons with
  `data-mui-button-icon aria-hidden="true"`; no icon library or renderer is included.
- Host `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-expanded`
  and `aria-pressed` are explicit conveniences forwarded to the native child. Removing an
  override restores the authored value. Other ARIA attributes belong on the native child.
  There is no `label` property that silently replaces visible authored content.
- `element.control` is the native button/anchor (or `null` before connection).
  `element.click()`, `.focus(options)` and `.blur()` delegate to it. Listen for ordinary
  bubbling `click` on either native child or host; delegated `mui-action` works when the
  aggregate is also loaded. There is no duplicate `mui:click`, synthesized keyboard click
  or automatic application loading state. `dispatchEvent()` does not imitate native
  activation; use `.click()` when submission/activation is intended.
- Buttons activate with native Enter/Space behavior; anchors with Enter, not Space.
  Loading and disabled states suppress click/auxclick at host capture and native buttons
  become disabled. Loading sets native `aria-busy="true"` and adds one decorative spinner;
  icon nodes are hidden by CSS, not discarded. Child text/listeners remain intact.
- Disabled/loading links temporarily lose `href`, leave the Tab order, and retain
  `role="link"` plus `aria-disabled="true"` (an authored role is preserved). This prevents
  navigation, including middle-click/new-tab actions. Enabling restores the authored URL,
  role and focus order. Loading/disabled buttons also leave the Tab order; unlike upstream,
  loading does not intentionally retain keyboard focus.
- Temporary overrides preserve authored disabled/type/ARIA/tab-order values. Native
  attribute edits are reconciled on the MutationObserver microtask; host state changes
  are synchronous. When a host override is active, edit the host to change the effective
  state. A native write identical to the currently applied override cannot express a new
  baseline; remove the host override first for that case.
- Visual attributes update through CSS. Reflected properties listed below support
  pre-definition assignment. A late native direct control is adopted, and replacing
  host contents with one new control restores overrides on the old control. Observers
  and capture listeners are removed on disconnect and reinstated on reconnect; detached
  native markup is not kept synchronized until reconnection.

## Per-property and slot migration tracker

🟢 Verified retained implementation · 🟡 Deliberate native/CSS replacement with narrower
scope · ⏭️ Intentionally omitted framework API.

| Upstream item | Native/MarkupUI mapping | Status and limits |
| --- | --- | --- |
| `attr-type` | Host `attr-type` / `.attrType`; or authored native `button[type]`. | 🟢 Real button/submit/reset behavior; generated default `button`, authored default native `submit`. |
| `block` | Boolean `block` / `.block`. | 🟢 Full-width host and native control. |
| `bordered` | `bordered="false"` / `.bordered = false`; default true. | 🟢 Transparent border when false; border geometry remains stable. |
| `circle` | Boolean `circle` / `.circle`. | 🟢 Equal preset width/height, circular corners. Keep content short/icon-only. |
| `color` | `--mui-button-color`, `--mui-button-hover-color`, `--mui-button-pressed-color`. | 🟡 External CSS tokens; no color-string JS parser or auto-generated hover colors. |
| `dashed` | Boolean `dashed` / `.dashed`. | 🟢 Dashed native-control border. |
| `disabled` | Boolean `disabled` / `.disabled`, or authored native disabled. | 🟢 Actual button disabling; explicit link navigation suppression and ARIA. |
| `focusable` | `focusable="false"` / `.focusable = false`. | 🟡 Excludes sequential Tab focus via native `tabindex=-1`; pointer/programmatic focus remains native, not forcibly prevented. |
| `ghost` | Boolean `ghost` / `.ghost`. | 🟢 Transparent fill with semantic text/border. |
| `native-focus-behavior` | Always use browser-native focus behavior. | 🟡 No Safari click-to-focus workaround or mousedown interception. |
| `icon-placement` | `icon-placement="left\|right"` / `.iconPlacement`. | 🟢 CSS order of direct marked icon/spinner; default left (logical start under RTL). DOM order/identity stays unchanged. |
| `keyboard` | Always retain native keyboard defaults. | 🟡 No API to suppress accessible Enter/Space activation and no custom keydown click synthesis. |
| `quaternary` | Boolean `quaternary` / `.quaternary`. | 🟢 Transparent resting surface, subtle hover/pressed fill. |
| `loading` | Boolean `loading` / `.loading`. | 🟢 Busy state, decorative spinner, suppressed activation, native disabling. No automatic promise tracking. |
| `spin-props` | `--mui-button-spinner-size`, `--mui-button-spinner-width`, `--mui-button-spinner-color`. | 🟡 CSS spinner controls size/stroke/color; no object prop or SVG radius/scale model. Reduced motion disables animation. |
| `render-icon` | Authored direct `[data-mui-button-icon]` child. | ⏭️ VNode render callback omitted; native content equivalent implemented. |
| `round` | Boolean `round` / `.round`. | 🟢 Pill corners; `circle` wins when both are present. |
| `secondary` | Boolean `secondary` / `.secondary`. | 🟢 Low-opacity semantic fill. |
| `size` | `size="tiny\|small\|medium\|large"` / `.size`. | 🟢 22/28/34/40px minimum height; medium default. CSS can customize dimensions. |
| `strong` | Boolean `strong` / `.strong`. | 🟢 Font weight 600. |
| `tertiary` | Boolean `tertiary` / `.tertiary`. | 🟢 Muted surface and hover/pressed state. |
| `text` | Boolean `text` / `.text`; legacy `type="text"` also accepted. | 🟢 Compact, borderless appearance; not a link unless the authored control is an anchor. |
| `text-color` | `--mui-button-label-color`. | 🟡 External CSS override; not an inline style/object prop. |
| `type` | `type` / `.type`: default, primary, info, success, warning, error, tertiary; legacy `variant` / `.variant` aliases semantic colors. | 🟢 Semantic treatments retained; `type=tertiary` deliberately maps to the muted treatment, not exact upstream text-color parity. Do not combine conflicting `type` and `variant` values. |
| `tag` | Author one native `<button>` or `<a>`. | ⏭️ Arbitrary tag rendering is omitted; no clickable div/span impersonation. |
| `onClick` (source prop) / DOM events demo | `addEventListener("click", handler)` on the native child or host. | 🟢 Ordinary cancellable event and bubbling; no function/array prop adapter. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` (inherited theme plumbing) | External component CSS and custom properties. | ⏭️ Vue theme injection, CSS-in-JS and framework theme objects omitted. |
| Default slot | Authored child phrasing content. | 🟢 Preserved nodes and listeners; no VNode renderer or shadow slot projection. |
| Icon slot | Authored direct `[data-mui-button-icon]` inside native control, or host content before generation. | 🟢 Preserved nodes; author decorative semantics and icon-only names explicitly. |

Boolean presence attributes such as `disabled="false"` are still **true** under native
HTML conventions; remove them or assign the corresponding property `false`. Only
`focusable` and `bordered` use the explicit string `"false"` to opt out of their true default.
Choose one main treatment; combinations that upstream rejects (ghost/dashed/text with
secondary/tertiary/quaternary) are not a supported precedence contract.

Additional CSS tokens include `--mui-button-height`, `--mui-button-padding`,
`--mui-button-font-size`, `--mui-button-radius`, `--mui-button-icon-gap`,
`--mui-button-border-color`, `--mui-button-background` (default surface),
`--mui-button-contrast`, `--mui-button-focus-color` and `--mui-button-disabled-opacity`.
Use external stylesheets, not runtime style objects. Application colors remain responsible
for contrast in their actual theme; this is not blanket accessibility certification.

## ButtonGroup

```html
<mui-button-group size="small" aria-label="Edit actions">
  <mui-button>Cut</mui-button>
  <mui-button>Copy</mui-button>
  <mui-button>Paste</mui-button>
</mui-button-group>
```

| Upstream item | Mapping | Status and limits |
| --- | --- | --- |
| `size` | `size` / `.size`; inherited CSS dimensions. | 🟢 Shared tiny/small/medium/large presets; explicit child size wins. This matches pinned Button implementation, although its API table claims group precedence. |
| `vertical` | Boolean `vertical` / `.vertical`. | 🟢 CSS column layout, joined borders/corners; horizontal is default. |
| Default slot | Authored direct `mui-button` children. | 🟢 Order/identity preserved, no renderer. |
| Group semantics | Default `role="group"`; author `aria-label` or `aria-labelledby`. | 🟢 Individual native controls retain Tab stops. No roving tab index, arrow-key toolbar behavior or selection state is invented. |

Logical margins/corners support RTL. Group join styling overrides individual rounded/circle
corners; use separate buttons instead for independent shapes. There is no framework form-item
or provider-derived sizing; use group/child attributes or inherited CSS.

## Numbered migration steps and acceptance

1. [x] Inspect legacy controller/CSS/tests and pinned upstream API, callbacks, slots and group.
2. [x] Implement standalone registration, ESM/classic distributions, declarations and CSS export.
3. [x] Implement native control adoption/generation, forms, focus, keyboard defaults and state.
4. [x] Preserve authored nodes, dynamic attributes, pre-upgrade properties and reconnect cleanup.
5. [x] Implement retained semantic variants, sizes, treatments, icons and native ButtonGroup.
6. [x] Add separate HTML/CSS/JS demo and focused regression tests.
7. [x] Build under unchanged legacy ceilings and run the full overlapping test suite.
8. [x] Verify real Chromium forms/keyboard/focus, accessible names, layout and load-order behavior.
9. [x] Review scoped changes and record intentional limitations and final evidence.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\button.test.ts`: focused native/control/lifecycle/registration tests.
- `pnpm build && pnpm test`: TypeScript declarations and all budget-enforced distributions;
  **67 tests passing**: 24 Button, 16 Avatar and 27 unchanged legacy/native tests.
- Chromium on the existing port-4187 demo server, using a new isolated tab: Enter and Space
  activated a button exactly once each; Enter navigated a link and Space did not. Tab skipped
  disabled/loading controls, disabled links and `focusable=false`, and visited individual group
  controls without an extra host stop. Native focus-visible outline was 3px.
- Browser forms: required-field validation blocked submission; native submitter name/value,
  external form association and reset worked; generated default buttons did not submit.
  Disabled fieldsets restored focus after enabling without stale library tabindex overrides.
- Browser state/content: loading prevented programmatic activation, restored original icon/
  label nodes and retained listeners; reconnect preserved control identity and single activation.
  Accessibility tree exposed native button names including the icon-only “Add”.
- Browser CSS: 22/28/34/40px sizes, semantic fill/contrast, ghost transparency, dashed borders,
  circle geometry, right icon placement, group sizing/orientation and no standalone style tags.
  Follow-up checks covered all semantic fills, ghost hover, borderless/strong/block, live group
  size with explicit child precedence, disabled-link accessible role restoration and the
  reduced-motion spinner.
  Classic Button followed by the aggregate retained native sizing, white primary text and
  unstyled wrappers (no doubled padding, pseudo-borders or legacy group margins).
- Separate browser documents verified ESM pre-upgrade properties, ESM-before-aggregate
  submission and both rich registrations, plus an explicit legacy-first conflict preserving
  the original legacy constructor. Test-only browser documents were closed.
- Build manifest: existing core **14,611 / 15,000 gzip bytes**, unchanged. Button has separate
  **4,000-byte ESM/classic** and **2,500-byte CSS** ceilings; exact sizes are in
  `dist/manifest.json`. No dependency installation or runtime dependency was added.

This is retained functional scope, not an all-browser certification or a pixel-identical
Naive UI port. Safari/Firefox focus behavior, touch-device coverage, screen-reader-specific
announcements, ripple/animated icon transitions, framework tag/render APIs and runtime
theme adapters are not claimed. Next sequential migration: **Card**, coordinated separately.
