# Empty

**Migration status: 🟢 Verified for the retained native scope below.**
Empty is a small optional light-DOM display component. It supplies missing description/icon
fallbacks, preserves authored content and leaves recovery actions, headings and announcements
native. Static empty states can use ordinary HTML and the external CSS without a controller.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Empty documentation](https://www.naiveui.com/en-US/os-theme/components/empty)
- [Public API: four props and three slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/demos/enUS/index.demo-entry.md)
- [Implementation and source-only render hook](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/src/Empty.tsx)
- [Pinned icon-size presets](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/empty/styles/_common.ts)

There are no documented callbacks, methods, title prop or companion component. Source-only
`renderIcon` and inherited theme objects are recorded as intentional framework omissions;
the native icon slot supplies the useful content equivalent.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-empty.js` | ESM; exports `MuiEmpty`, `registerEmpty()`; registers on browser import. |
| `dist/markup-ui-empty.global.js` | Classic script; registers and exposes `MarkupUIEmpty`. |
| `dist/markup-ui-empty.css` | External component and CSS-only native display styling. |
| `dist/components/empty/index.d.ts` | Type declarations. |
| `demo/components/empty.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript demo. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-empty.css">
<script defer src="./vendor/markup-ui-empty.global.js"></script>
<script defer src="./app.js"></script>

<mui-empty description="No reports yet">
  <div data-mui-empty-extra><button type="button">Create report</button></div>
</mui-empty>
```

Application ESM: `import "@dataengine/markup-ui/empty";`. Serve/link the
`@dataengine/markup-ui/empty/style.css` export using your asset mechanism. A plain browser
imports the served `markup-ui-empty.js` URL rather than the bare npm specifier.
No compiler, Button import, icon library or runtime dependency is required.

Load enhanced Empty **before the legacy aggregate**, using ordered `defer` scripts or ESM
imports. The aggregate preserves existing definitions. Legacy-first enhanced registration
throws an explicit conflict, not a no-op pretending to upgrade the element. Do not load both
enhanced distributions in one document. The legacy aggregate, earlier bundle sizes and core
ceiling remain unchanged; external Empty CSS isolates the enhanced layout from legacy rules.

## Native regions and fallback precedence

```html
<mui-empty role="region" aria-labelledby="empty-heading">
  <svg data-mui-empty-icon aria-hidden="true" focusable="false" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor"></circle>
  </svg>
  <div data-mui-empty-description>
    <h2 id="empty-heading">No reports yet</h2>
    <p>Create a report or browse the examples.</p>
  </div>
  <div data-mui-empty-extra>
    <button type="button">Create report</button>
    <a href="./examples.html">Browse examples</a>
  </div>
</mui-empty>
```

Use one direct `data-mui-empty-icon`, `data-mui-empty-description` and
`data-mui-empty-extra` region each. Ordinary unmarked text/element children supply the
default description. Native heading/content nodes move into a description wrapper without
cloning; extra controls remain authored native controls.

Precedence is explicit and independent for each region:

1. **Description:** authored description/default nodes win over the `description` prop,
   even after that prop changes. An explicitly authored empty description region also
   suppresses the fallback. Otherwise, the string attribute/property supplies safe text,
   with **“No Data”** when absent.
2. **Icon:** an authored HTML/SVG/image icon region wins over all generated icons.
   Otherwise, a legacy `icon` text attribute supplies a simple glyph when present.
   With no glyph override, a small original two-path inbox/unavailable SVG is generated.
3. **Extra:** present only when authored. It does not suppress the missing description or
   default icon, and the library never invents a recovery button, link or callback.

Late authored regions replace only generated wrappers/fallback text, preserving existing
authored nodes and listeners. A late explicit description wrapper absorbs prior authored
default content, but never the generated “No Data” placeholder. Icon and description regions
are positioned before extra content without repeatedly moving native recovery controls.

Removing all children from a generated description restores its fallback; an explicitly
authored empty description remains empty. Replacing the whole host subtree is an
application-owned destructive operation: discarded authored nodes are not resurrected.

### Original illustration and legacy glyph

The default inbox with an unavailable badge is original minimal geometry, not copied
upstream icon-path data. Its SVG and paths are created with `document.createElementNS`
in the SVG namespace. The rounded inbox outline and filled badge with a transparent cross
cutout communicate the same visual category without claiming identical artwork. It is decorative,
`aria-hidden="true"`, and nonfocusable; the readable description carries the meaning.
All sizing/color is external CSS, with native SVG presentation attributes for the geometry.

`icon` / `.icon` is a **legacy MarkupUI text-glyph convenience**, not an upstream Empty prop.
It never renders HTML or invokes a function. Removing the attribute or assigning `null`
restores the original illustration. An empty string is an explicitly blank glyph; use
`show-icon="false"` to remove the visual icon region completely.

Custom HTML/SVG/image icons keep their native attributes and listeners. Mark duplicate
decorative artwork explicitly, and keep the icon region noninteractive. Native image source,
loading, alt and error behavior remain application-owned; Empty does not import Avatar.

## Show/hide, size and localization

`show-description="false"` / `.showDescription = false` hides only description content.
`show-icon="false"` / `.showIcon = false` hides only the icon. These flags do not discard
authored nodes or overwrite their native `hidden`/ARIA settings. If icon display starts
disabled, no default illustration is created until needed.

The extra region is optional by presence; use its native `hidden` property/attribute to hide
it. There is no invented `show-extra` prop. Native `hidden` on the host hides the entire
empty state. If the description is hidden, provide understandable empty-state context
elsewhere rather than relying only on decorative artwork.

Size presets are `tiny`, `small`, `medium`, `large`, `huge`, with icon dimensions
**28 / 34 / 40 / 46 / 52px** respectively. Medium is the default. Font presets are
12 / 14 / 14 / 15 / 16px. CSS tokens support custom dimensions without JS measurements.

`description` / `.description` is a string, not HTML. Assign `null`/`undefined` or remove the
attribute to restore the default. An explicit empty string stays empty, a deliberate native
override difference from upstream's locale fallback for falsey descriptions. Supply localized
text or native children yourself; no locale/provider object is required or inferred.
The basic aggregate keeps its original “No data” spelling; this optional entry uses the
pinned documented “No Data” default.

## Heading, action and announcement semantics

Empty never adds an interactive role, heading level, accessible name, tab stop, live region
or keyboard handler to its host. There is no component `title` prop: the ordinary HTML title
attribute remains a tooltip, not a generated heading. Author `h2`, `h3`, etc. in description
content when a heading is appropriate.

- Author `role="region"`/`aria-labelledby` only when a named group is useful. Explicit
  `role`, `aria-live`, `aria-label`, IDs and description references are preserved.
- If a results transition needs an announcement, choose one native application-owned live
  region. Empty does not add another announcer or infer urgency from becoming visible.
- Recovery buttons/links are not generated, cloned or intercepted. They retain listeners,
  names, focus, hrefs, disabled behavior and native form semantics.
- Use `type="button"` for non-submit actions. Deliberate native submit/reset buttons are
  preserved; Empty does not silently rewrite their type or make itself a form field.
- Property assignment is silent. There are no fabricated click/input/change events,
  close actions or provider callbacks.

Actual spoken announcement timing depends on the browser/assistive technology. The
DOM/accessibility-tree acceptance below does not certify screen-reader speech behavior.

## Native templates and controller-free display

Templates remain inert and are never consumed/cloned by Empty, even when they have region
markers. They also stay outside visual layout. Applications may explicitly use
`document.importNode(template.content, true)` and attach their own native action listeners
before insertion; the demo exercises this path without a renderer.

For fully static content, link only the CSS:

```html
<section class="mui-empty" data-size="small">
  <h2 data-mui-empty-description>No archived reports</h2>
  <div data-mui-empty-extra><a href="./create.html">Create your first report</a></div>
</section>
```

This native section needs no Custom Element. Explicit description/recovery text remains
usable without JavaScript; a description attribute alone is not a visible no-JS fallback.

## API and slot migration tracker

🟢 Verified retained native target · 🟡 Deliberate native/default representation difference ·
⏭️ Intentionally omitted framework API.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `description` | String attribute / `.description`, or authored description/default nodes. | 🟢 Safe localizable text; authored content wins; explicit empty strings stay empty. No automatic locale provider. |
| `show-description` | `show-description="false"` / `.showDescription`, true default. | 🟢 CSS visibility only; authored nodes and extra actions retained. |
| `show-icon` | `show-icon="false"` / `.showIcon`, true default. | 🟢 Independent generated/custom icon visibility; preserves authored icon identity/ARIA. |
| `size` | Attribute / `.size`: tiny/small/medium/large/huge. | 🟢 Pinned icon-size ladder; medium default, CSS-only geometry. |
| Default slot | Native unmarked children or `data-mui-empty-description`. | 🟢 Authored headings/text replace fallback without a VNode renderer or Shadow DOM slot. |
| Extra slot | Native `data-mui-empty-extra` region and controls. | 🟢 Original actions, form semantics and listeners preserved; no mandatory Button module. |
| Icon slot | Native HTML/SVG/image `data-mui-empty-icon`. | 🟢 Original nodes/attributes preserved; no icon-library dependency. |
| `renderIcon` (source-declared prop) | Author native icon nodes instead. | ⏭️ VNode/provider render hook omitted; the source-only declaration is not transplanted as a callback contract. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External CSS/custom properties. | ⏭️ Framework theme objects, provider injection and runtime style adapters omitted. |

`show-icon` and `show-description` explicitly accept `"false"` to opt out of their true
defaults. `icon` is the documented legacy extension above, not a new upstream inventory row.

### External CSS tokens

`--mui-empty-icon-size`, `--mui-empty-icon-color`, `--mui-empty-font-size`,
`--mui-empty-line-height`, `--mui-empty-color`, `--mui-empty-description-color`,
`--mui-empty-extra-color`, `--mui-empty-gap`, `--mui-empty-extra-gap`,
`--mui-empty-extra-margin`, `--mui-empty-min-height`, `--mui-empty-padding` and
`--mui-empty-background` customize native layout. Defaults now follow the rendered reference:
zero minimum height/padding, a centered 28/34/40/46/52px icon, 8px between a visible icon
and description, and 12px before authored extra content, including when extra is the only
visible region. `--mui-empty-gap` controls the icon-to-description margin;
`--mui-empty-extra-margin` independently controls the complete extra margin (it no longer
adds to a host flex gap). Hiding the icon removes the description gap.

Description line height and text alignment inherit from the surrounding page, as upstream;
the fixture's usual 1.6 line height is not forcibly applied to a differently styled parent.
Wrapped descriptions are start-aligned unless the author supplies another alignment.
Extra content remains centered. The old 140px minimum and 24px padding are available by
setting the existing tokens; add `justify-content: center` when vertical centering is desired.

Set `data-mui-theme="dark"` on the host or an ancestor for explicit dark defaults; a nested
`data-mui-theme="light"` scope resets them. Light icon/description use `#c2c2c2`, dark
icon/description use white at `.38`, and extra text uses `#333639` / white at `.82`.
These are upstream's subdued visual defaults, not an accessible-contrast certification;
override description/icon colors when your application requires stronger contrast.
Legacy global secondary-text colors are not substituted for these different roles.
Private size defaults reset for nested Empty instances; explicit theme tokens may inherit.
No animation or transition is generated, so there is no motion engine to disable.

See the [rendered Empty visual audit](../style-audit/components/empty.md) for geometry,
palette, screenshot evidence, author-token checks and remaining limitations.

## Lifecycle and limits

Fallback text/glyph attributes synchronize immediately; visual size/show-description flags
work directly through CSS. Late content and region/text edits reconcile on a MutationObserver
microtask. Reflected properties support pre-definition assignment. Disconnect releases
observation; reconnect updates existing nodes without duplicating illustration/description.
No event listeners, timers, measurements, runtime dependencies or style mutations are added.

Generated fallback output is library-owned. Use authored regions for custom content rather
than modifying generated internals and expecting ownership to be inferred. This is not a
vendor illustration/theme/pixel clone, generic template engine, results-data controller,
loading system or application announcement policy.

## Numbered migration steps and acceptance

1. [x] Inventory pinned props/slots/source render hook and existing legacy fallback behavior.
2. [x] Add optional ESM/classic/CSS exports and bounded payloads without changing core.
3. [x] Preserve authored description/icon/extra nodes; define independent fallback precedence.
4. [x] Add original decorative SVG with native namespaces and legacy plain-text glyph support.
5. [x] Implement five CSS sizes, visibility, localizable text and passive/native semantics.
6. [x] Keep templates inert and demonstrate explicit application-native cloning and actions.
7. [x] Validate focused tests, existing integration suite and budget-enforced build.
8. [x] Review and verify namespace/layout, native actions/focus and loading order in Chromium.
9. [x] Reconcile reference rows/four tasks, index totals and master next-component status.

### Initial migration acceptance — 2026-09-08 (historical appearance)

- `pnpm test -- tests\empty.test.ts`: **23 focused tests passed**.
- `pnpm build && pnpm test`: declarations and all budgets succeeded; **190 tests passed**
  (23 Empty, 26 Alert, 23 Badge, 26 Tag, 25 Card, 24 Button, 16 Avatar, 27 legacy/native).
- Focused coverage includes original SVG namespace/decorative attributes, description/glyph
  text safety, empty/absent/localized values, authored/late fallback precedence, region order,
  native hidden/ARIA, extra submit/reset/button behavior, focus, inert/native-cloned templates,
  pre-upgrade state, reconnect, replacements and explicit registration collisions.
- Review corrected region lookup in the inert-template test and ensured marked templates
  cannot acquire visible layout boxes from region CSS. Chromium confirmed `display:none`
  and zero height for all three marker-bearing templates.
- Chromium on the existing port-4187 server verified the five 28/34/40/46/52px icon sizes,
  SVG/path namespaces, localized/default text, legacy glyph/illustration restoration, native
  headings/region name and absence of automatic live regions or generated controls.
- Native Enter/Space invoked a recovery action once each; explicit submit/reset semantics,
  native link Tab order and input values were preserved. Description/icon hiding left extra
  actions independent; native extra `hidden` was honored. Reconnect preserved input state
  and action listeners; application-owned `importNode` clones retained bound native actions.
- Browser update checks preserved focused input, custom SVG and authored description
  against fallback changes. Classic-before-aggregate kept the rich constructor, flex layout,
  24px padding, 40px default illustration and passive semantics. ESM tests covered pre-upgrade
  flags/text, roles/names/native recovery identity and explicit legacy-first conflict.
  Test-only documents closed; unrelated browser tabs were untouched.
- Reference validation retained all seven original rows plus four explicit source
  supplements. The catalog records **96 pages, 3,056 rows, 384 tasks (28 accepted)** and
  **657 validated relative file links** with canonical colored statuses.
- Core remains **14,611 / 15,000 gzip bytes**, with all prior outputs unchanged.
  Empty ESM/classic/CSS are **1,596 / 1,805 / 759 gzip bytes**, under separate
  **2,500 / 2,500 / 1,500** ceilings; exact figures are in `dist/manifest.json`.

### Visual-default audit — 2026-09-10

- `pnpm test -- tests\empty.test.ts`: **24 tests passed**, including the original
  two-path illustration's fill/cutout treatment and stable SVG identity during updates.
- Twelve rendered cases in each light/dark theme matched reference host, icon, description
  and extra geometry/typography/colors. Default height changed **140→70.391px**;
  default with extra **150→104.781px**; wrapped description **159→92.781px**.
- RTL and inherited `line-height: 2` measurements also matched. Legacy CSS loaded afterward,
  nested theme/size defaults, native visibility/inert templates, CSS-only display, native
  keyboard recovery actions and author overrides were checked.
- Isolated production-named ESM/classic/CSS outputs measured **1,712 / 1,922 / 850 gzip
  bytes**, below the unchanged **2,500 / 2,500 / 1,500** ceilings. The coordinated
  full build passed with those same manifest sizes; all 24 Empty tests passed.

Verification is retained native scope, not all-browser/screen-reader or pixel certification.
Browser acceptance here is Chromium; Safari/Firefox, touch behavior, custom theme contrast
and application-specific announcement/focus policies need downstream checks. No next
component is implied by this audit.
