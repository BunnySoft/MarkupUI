# Card

**Migration status: 🟢 Complete and verified for the retained native scope below.**
Card is a dependency-free optional component, separate from the legacy aggregate's basic
Card. All documented upstream props and six slots are mapped, with deliberate native
replacements and framework omissions identified individually.

**Default-style audit: 🟢 native defaults fixed / 🟡 legacy and rendering boundaries.**
The [rendered comparison](../style-audit/components/card.md) records the 2026-09-10
light/dark measurements separately from the historical migration acceptance below.

## Sources and loading

Inventory pinned to Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:

- [Official Card documentation](https://www.naiveui.com/en-US/os-theme/components/card)
- [Card API and slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/demos/enUS/index.demo-entry.md)
- [Card implementation, source-only `role` and close callback](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/Card.tsx)
- [Upstream segmentation and layout implementation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/card/src/styles/index.cssr.ts)

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-card.js` | ESM; exports `MuiCard` and `registerCard()` and registers on browser import. |
| `dist/markup-ui-card.global.js` | Classic script; registers and exposes `MarkupUICard`. |
| `dist/markup-ui-card.css` | Required external CSS. No injected styles or runtime style objects. |
| `dist/components/card/index.d.ts` | Type declarations, including `CardCloseDetail`. |
| `demo/components/card.html`, `.css`, `.js` | Runnable comparison page mirroring all thirteen pinned Naive UI 2.45.3 Card demos, with one highlighted code control per case. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-card.css">
<script defer src="./vendor/markup-ui-card.global.js"></script>
<script defer src="./app.js"></script>

<mui-card title="Overview">Authored card content.</mui-card>
```

Application ESM: `import "@dataengine/markup-ui/card";`. Serve/link the
`@dataengine/markup-ui/card/style.css` export through your asset mechanism; plain browsers
import the served `markup-ui-card.js` URL rather than the npm package specifier.
No compiler or runtime dependency is required by consumers.

**Load Card before the legacy aggregate**, using ordered `defer` classic scripts or ordered
ESM imports. Legacy registration preserves the rich `mui-card` definition. Loading Card
after an existing legacy/different Card definition throws an explicit conflict. Do not
load both Card distributions in one document. External Card CSS takes precedence over
legacy Card host/compound styles even when that aggregate installs its stylesheet later.
The original aggregate implementation, output sizes and 15,000-byte core ceiling are unchanged.

Only `mui-card` is registered by this entry. Passive regions do not need Custom Element
classes or controllers. Existing `mui-card-header`, `mui-card-content` and `mui-card-footer`
tags still work; the legacy aggregate may register their passive classes later without
replacing their nodes or interfering with rich Card behavior.

## Authored anatomy and ownership

Prefer native elements marked with explicit region attributes:

```html
<mui-card closable segmented role="region" aria-labelledby="report-heading"
          close-label="Close quarterly report">
  <div data-mui-card-cover><img src="./cover.png" alt="Report cover"></div>
  <header data-mui-card-header>
    <h2 id="report-heading">Quarterly report</h2>
    <div data-mui-card-header-extra><button type="button">Star report</button></div>
  </header>
  <section data-mui-card-content><p>Authored report content.</p></section>
  <footer data-mui-card-footer>Prepared by the project team</footer>
  <div data-mui-card-action><button type="button">Export</button></div>
</mui-card>
```

| Region | Native marker | Passive compound spelling | Placement |
| --- | --- | --- | --- |
| Cover | `data-mui-card-cover` | `mui-card-cover` | Direct card child, normally first. |
| Header | `data-mui-card-header` | `mui-card-header` | Direct card child. Author native headings at the appropriate level. |
| Header extra | `data-mui-card-header-extra` | `mui-card-header-extra` | Inside header; a direct card child is moved into the header. |
| Content | `data-mui-card-content` | `mui-card-content` | Direct card child. |
| Footer | `data-mui-card-footer` | `mui-card-footer` | Direct card child. |
| Action | `data-mui-card-action` | `mui-card-action` | Direct card child, normally last. |

Use at most one of each region, and do not mark the same element as multiple regions.
Authored regions keep their order; this is explicit DOM anatomy, not a slot renderer that
sorts arbitrary markup. Ordinary free-form content moves into a generated native content
wrapper, or appends to an authored content region, without cloning. Generated content is
placed before footer/action; a generated header is placed after cover. Late authored
header/content regions replace only the generated wrapper, preserving original content
nodes, extra controls and listeners.

`title` / the native `.title` property provides a **plain-text** fallback title when no
authored header exists. It never renders HTML or invokes functions. An authored header
takes precedence. Generated title spans do not infer a heading level or name the card;
author `h2`, `h3`, etc., and `role`/`aria-labelledby` when the card should be a named
region. `title` also retains its ordinary HTML tooltip meaning. Prefer an authored heading
if that tooltip is undesirable. Card does not invent a landmark, click handler or tab stop.

Authored templates remain inert and are not moved into generated content or cloned by
the library. Applications may explicitly clone their own templates with native DOM APIs.
Changing `innerHTML` or `textContent` remains an application-owned replacement operation;
the component cannot preserve nodes that the application itself discarded.

### Close is an intent, not removal

`closable` creates one native `<button type="button">` in the header, after authored header
content and extra. It has a localized `close-label` (default **“Close card”**, including when
the supplied value is blank), a decorative close glyph and a visible keyboard focus ring.
It does not depend on the optional Button module or submit an enclosing form.

The native control emits one bubbling, cancellable **`mui:close`** event per native
activation, with `detail.originalEvent`. No card is hidden, removed or otherwise closed by
the component, whether or not the event is cancelled:

```js
const card = document.querySelector("#report");
card.addEventListener("mui:close", (event) => {
  if (event.target !== card) return; // Nested cards can bubble their own intents.
  event.preventDefault();
  // Application policy: confirm, save, hide/remove, and restore focus if appropriate.
});
```

Use native Enter/Space activation. No keydown click synthesis, Escape-to-close handler,
focus trap or application lifecycle is added. Unlike upstream's false default,
**`close-focusable` defaults to true** so the close control is keyboard-reachable.
`close-focusable="false"` / `.closeFocusable = false` removes sequential Tab focus only;
pointer/programmatic focus remains browser-native. When an application actually removes
a card, the application must choose a sensible focus destination.

The generated close button and `data-mui-card-close` / `data-mui-card-title` markers are
library-owned output, not alternate authoring slots. Customize their appearance through
external CSS tokens rather than moving them or changing their native type. The native
control respects disabled fieldsets; Card itself has no `disabled` property.

## Per-property migration tracker

🟢 Verified retained implementation · 🟡 Native/CSS replacement or intentional default/scope
difference · ⏭️ Framework-specific API intentionally omitted.

| Upstream property | Mapping | Status and limits |
| --- | --- | --- |
| `action` | Authored action region with native controls. | 🟡 Content equivalent implemented; render-function prop omitted. |
| `bordered` | `bordered="false"` / `.bordered = false`; default true. | 🟢 Transparent outer border when false; geometry remains stable. Inner segmentation is independent. |
| `closable` | Boolean `closable` / `.closable`. | 🟢 Native close button and close intent; never silently hides/removes the card. |
| `close-focusable` | `close-focusable="false"` / `.closeFocusable`. | 🟡 Verified native tab-order control, with accessible true default instead of upstream false. |
| `content` | Authored free-form nodes or explicit content region. | 🟡 String/function prop omitted; native DOM content remains application-owned. |
| `content-class` | `class` / `.classList` on the content region. | 🟡 Native replacement, no host class-string forwarding API. |
| `content-scrollable` | Boolean `content-scrollable` / `.contentScrollable`. | 🟢 Native `overflow:auto` on content within flex layout; requires an author-supplied height/max-height to constrain scrolling. |
| `content-style` | External CSS targeting content, or component tokens. | ⏭️ Style-string/object prop omitted; no runtime CSS-in-JS. |
| `cover` | Authored cover region with native `img`, picture or other content. | 🟡 Content equivalent implemented; render-function prop omitted. Native images retain alt/loading/srcset behavior. |
| `embedded` | Boolean `embedded` / `.embedded`; embedded-background token. | 🟡 Muted background implemented; no automatic bright/dark/modal/popover theme-context detection. |
| `footer` | Authored footer region. | 🟡 Content equivalent implemented; render-function prop omitted. |
| `footer-class` | Native `class` / `.classList` on footer. | 🟡 No host class-string forwarding API. |
| `footer-style` | External footer CSS. | ⏭️ Style-string/object prop omitted. |
| `header-class` | Native `class` / `.classList` on header. | 🟡 No host class-string forwarding API. |
| `header-style` | External header CSS. | ⏭️ Style-string/object prop omitted. |
| `header-extra` | Authored header-extra region. | 🟡 Native content equivalent; render-function prop omitted. A direct extra is adopted into the header. |
| `header-extra-class` | Native `class` / `.classList` on header extra. | 🟡 No host class-string forwarding API. |
| `header-extra-style` | External header-extra CSS. | ⏭️ Style-string/object prop omitted. |
| `hoverable` | Boolean `hoverable` / `.hoverable`. | 🟢 CSS hover shadow/border only; it does not make Card interactive. |
| `segmented` | Boolean `segmented` / `.segmented`; `segmented-content`, `segmented-footer`, `segmented-action` for individual regions. | 🟢 Full/inset/off separators implemented. The upstream object form is replaced by explicit attributes, described below. |
| `size` | `size="small\|medium\|large\|huge"` / `.size`. | 🟢 16/24/32/40px region padding; medium default. Header font size also varies. No JS measurements. |
| `tag` | Author native region elements and/or a native semantic wrapper around Card. | ⏭️ Arbitrary host-tag replacement omitted; `mui-card` stays a Custom Element. |
| `title` | Plain-text `title` attribute / native `.title`, or authored heading in header. | 🟡 String fallback implemented; authored header wins, render-function overload omitted, heading semantics remain explicit. |
| `on-close` / source `onClose` | Bubbling cancellable `mui:close` with `CardCloseDetail`. | 🟢 Intent notification; no function/array callback prop adapter and no default removal. |
| `role` (source-only prop) | Native host `role` attribute, with author-chosen ARIA name. | 🟢 Preserved, never inferred or overwritten. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` (inherited theme plumbing) | External CSS and inherited custom properties. | ⏭️ Vue theme objects, provider injection and runtime theme adapters omitted. |

Presence booleans such as `closable="false"` still mean **true**; remove the attribute or set
the corresponding property to `false`. `bordered` and `close-focusable` explicitly recognize
the string `"false"` because their defaults are true.

### Six slots

| Upstream slot | Native content equivalent | Status |
| --- | --- | --- |
| `cover` | Direct cover region. | 🟢 Verified authored image/region identity. |
| `header` | Direct header with authored heading/content. | 🟢 Verified; no duplicate synthetic heading roles. |
| `header-extra` | Header-extra region inside header, or direct child adopted into it. | 🟢 Verified node/listener preservation. |
| `default` | Free-form children or explicit content region. | 🟢 Verified native wrapper adoption without cloning. |
| `footer` | Direct footer region. | 🟢 Verified; native content and actions remain author-owned. |
| `action` | Direct action region. | 🟢 Verified; no generic control renderer or event delegation layer. |

## Segmentation, scrolling and styling

`segmented` enables content/footer/action separators when a preceding visible region exists.
Inert templates and hidden regions do not create an artificial first separator. Use
`segmented-content`, `segmented-footer` or `segmented-action` with:

- An empty value or `"true"`: full-width separator.
- `"soft"`: inset region/separator, keeping the original content alignment.
- `"false"`: disable this region's separator, even when `segmented` is present.

Each per-region attribute works without the global Boolean. `"soft"` applies consistently
to action as well as content/footer here; the pinned upstream implementation treats its
action `"soft"` value as an ordinary full separator. This is an explicit native-scope difference.
No JSON object parser is included.

For content-only scrolling, constrain the Card through external CSS and author a keyboard
target/name on the content region when appropriate:

```html
<mui-card class="report-card" content-scrollable>
  <header data-mui-card-header><h2>Report</h2></header>
  <div data-mui-card-content tabindex="0" role="region" aria-label="Scrollable report">...</div>
  <footer data-mui-card-footer>Report footer</footer>
</mui-card>
```

```css
.report-card { --mui-card-height: 320px; }
```

Native scrollbars and keyboard scrolling replace the upstream custom scrollbar component.
Headers, covers, footers and actions do not shrink; exceptionally large fixed regions can
consume the available height, so applications remain responsible for a usable layout.

Public CSS tokens: `--mui-card-padding`, `--mui-card-height`, `--mui-card-max-height`,
`--mui-card-radius`, `--mui-card-background`, `--mui-card-color`, `--mui-card-border-color`,
`--mui-card-embedded-background`, `--mui-card-action-background`, `--mui-card-font-size`,
`--mui-card-line-height`, `--mui-card-title-size`, `--mui-card-title-weight`,
`--mui-card-title-color`, `--mui-card-header-gap`, `--mui-card-action-gap`,
`--mui-card-hover-border-color`, `--mui-card-hover-shadow`, `--mui-card-close-size`,
`--mui-card-close-radius`, `--mui-card-close-color`, `--mui-card-close-hover-background`,
`--mui-card-close-pressed-background`, `--mui-card-focus-color`, `--mui-card-target-color`
and `--mui-card-ease`.
Private size defaults reset on nested cards; explicit theme tokens can still inherit.
Logical margins/corners support RTL and reduced motion removes transitions.

### Default geometry and theme ownership

| Size | Header top / horizontal / bottom | Content/footer bottom | Title |
| --- | --- | --- | --- |
| Small | 12 / 16 / 12px | 12px | 16px / 500 |
| Medium (default) | 19 / 24 / 20px | 20px | 18px / 500 |
| Large | 23 / 32 / 24px | 24px | 18px / 500 |
| Huge | 27 / 40 / 28px | 28px | 18px / 500 |

Unsegmented content and footer have no top padding after a visible preceding region.
First visible content/footer and segmented regions use the bottom-padding value at
the top too. Actions always have that vertical padding. Footer/action are ordinary
start-aligned block flow; authors can opt into flex/grid and use `--mui-card-action-gap`
with that layout. `--mui-card-padding` overrides the positive padding values as one
length, but does not introduce an unsegmented top gap. Radius is 3px; borderless cards
have no layout-consuming border. Close has an 18px layout box and a 22px state surface.

Shared tokens are reused only for equivalent roles: `--mui-font-size`,
`--mui-line-height`, `--mui-focus-ring`, and the fragment-target `--mui-color-primary`.
An explicit `--mui-card-*` override takes precedence. Font family inherits normally.
Geometry, title scale, state easing and Card palette defaults stay in Card CSS.
Explicit `data-mui-theme="dark"` selects the audited dark palette; nested
`data-mui-theme="light"` resets it. This works with Card CSS alone, the external theme
stylesheet, or `theme.apply()`, without requiring aggregate CSS.

The existing generic surface, muted, text and border palette is **not** equivalent
to these Card roles (for example, the light Card divider is `#efeff5`, not the generic
`#e4e4e7`). This pass neither recolors unaudited components nor creates a second
global palette. Card no longer implicitly aliases those unequal generic color
tokens. Applications that intentionally relied on that alias should set public Card
tokens explicitly, for example `--mui-card-color: var(--mui-text-primary)` and
`--mui-card-background: var(--mui-bg-surface)`. Shared custom palettes can set those
aliases on an ancestor or register Card tokens through `theme.register()`.
Card CSS never assigns public override tokens; inherited and per-card values remain
author-owned. The canonical preset JSON and generated theme/core adapters are unchanged.

## Compatibility and lifecycle limits

- Existing free-form and compound card content is supported, preserving authored nodes and
  listeners. `structured` reflects the current normalized anatomy, including generated
  content; it is library-managed rather than an author configuration switch.
- Standalone default separators are **off**, unlike the legacy compound header/footer
  borders. Opt into `segmented` to retain dividers. Audited native region spacing now
  follows the table above, not the legacy equal-padding/end-aligned layout.
- Legacy `basis`/`overflow` convenience attributes are not interpreted by this standalone
  entry. Use ordinary external CSS `flex-basis`/`overflow`; content scrolling has its own
  dedicated Boolean. Passive regions do not gain controllers or geometry style mutations.
- Live host title/close attributes synchronize immediately. Structural child/region-marker
  changes are reconciled on a MutationObserver microtask; visual attributes work directly
  through CSS. Exposed properties support pre-definition assignment. Observers and native
  close listeners are removed on disconnect and restored on reconnect without duplication.
- Card does not implement a loading prop, data fetching, a skeleton renderer, whole-card
  links, modal focus management or closing animations. Compose authored content/native ARIA
  or other optional components for those needs.

## Numbered migration steps and acceptance

1. [x] Inventory pinned upstream props/slots/callbacks and existing legacy compound behavior.
2. [x] Implement optional ESM/classic registration, declarations, CSS export and separate budgets.
3. [x] Preserve free-form/compound/native region nodes; keep templates inert and regions passive.
4. [x] Implement native accessible close intent, title fallback, dynamic anatomy and cleanup.
5. [x] Implement sizes, bordered/embedded/hover appearance, independent segmentation and native scrolling.
6. [x] Add separate HTML/CSS/JS demonstration and focused regression tests.
7. [x] Build and run targeted plus full overlapping unit/integration validation.
8. [x] Verify native keyboard/focus/forms, content scrolling, appearance and load ordering in Chromium.
9. [x] Review implementation and record retained scope, intentional omissions and acceptance evidence.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\card.test.ts`: **25 focused tests passing**.
- `pnpm build` and `pnpm test`: declarations and budget-enforced distributions succeeded;
  **92 tests passing** (25 Card, 24 Button, 16 Avatar, 27 unchanged legacy/native tests).
- Unit coverage includes free-form and passive compound content, six native regions, safe
  text title/author precedence, late/replaced nodes, inert templates, close detail/cancellation,
  form safety, native disabled fieldsets, dynamic labels/tab order, pre-upgrade properties,
  nested event bubbling, disconnect/reconnect and explicit registration conflicts.
- Chromium in a new tab on the existing port-4187 demo server: Tab reached the named native
  close control after header extra; Enter and Space emitted one intent each with a 3px
  focus-visible outline. Neither submitted the form nor removed/hidden the card. Reconnect
  retained an edited native input and authored action listeners without duplicate requests.
- Browser CSS verified 16/24/32/40px padding, live size and full/inset/off segmentation,
  independent footer/action settings, hover shadow, embedded/borderless surfaces, loaded
  full-width native cover, no injected/inline styles, and no passive-region registrations.
- A 320px Card scrolled only its native content with Page Down; header/footer positions stayed
  fixed. Additional checks verified nested medium defaults, no separator before first visible
  content after hidden/inert regions, close Tab opt-out, and reduced-motion transitions.
  Reviewed late-header adoption retained heading/extra/close order, the original extra
  listener and logical end placement of the close control under RTL.
- Classic Card plus ESM Button before the aggregate retained both rich constructors, native
  node identity and Card CSS (zero host padding, visible overflow, no legacy header border,
  correct compound-region padding). Separate documents verified ESM pre-upgrade properties,
  passive legacy region upgrades and close intent, plus a legacy-first conflict preserving
  the original constructor. Test-only documents were closed.
- Existing core remains **14,611 / 15,000 gzip bytes**. Card ESM/classic/CSS outputs are
  **1,765 / 1,972 / 1,512 gzip bytes**, under separate **3,000 / 3,000 / 2,500** ceilings.
  Existing Avatar, Button and legacy bundle sizes are unchanged; see `dist/manifest.json`.

This is retained functional scope, not a Vue API clone, pixel-perfect port, screen-reader
certification or all-browser guarantee. Browser acceptance here is Chromium; Safari/Firefox,
touch-device behavior and application-specific theming/contrast need downstream verification.
The next component is selected and coordinated separately after this component's commit.
