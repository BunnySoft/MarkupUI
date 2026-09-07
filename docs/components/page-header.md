# Page Header

**Migration status: 🟢 Verified retained native HTML/CSS scope.**
**Architecture: CSS-only.** Authored header/navigation/heading/link/button elements supply
the semantics and behavior; an external stylesheet supplies layout. No Custom Element,
router, history helper, renderer, provider or mandatory Button/Avatar/Breadcrumb module exists.

## Pinned reference and distribution

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/page-header)
- [Public props, callback and eight slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/demos/enUS/index.demo-entry.md)
- [Implementation and theme declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/src/PageHeader.tsx)
- [Source presentation](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/page-header/src/styles/index.cssr.ts)

The public page has three string props, one back callback and eight slots. Three source-only
theme declarations supplement those twelve rows. Breadcrumb content is a useful application
of the `header` slot, **not** a separate undocumented breadcrumb prop/slot. No public
style-object, tag, size or type prop is invented.

| Asset | Purpose |
| --- | --- |
| `src/components/page-header/page-header.css` | Maintained scoped CSS. |
| `dist/markup-ui-page-header.css` | Browser stylesheet distribution. |
| `@dataengine/markup-ui/page-header/style.css` | Stylesheet-only package export. |
| `demo/components/page-header.html`, `.css` | Native region, navigation, form and RTL examples. |
| `demo/components/page-header.js` | Application-only back-click/form-result demonstration. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-page-header.css">
```

Copy/serve the stylesheet through your asset mechanism. There is no `./page-header` JavaScript
export, ESM/classic global, registration order/conflict or fake JS budget. It loads before
or after the unchanged legacy aggregate. The demo script is not distributed as a component
runtime; native layout/headings and href navigation work without it.

## Native anatomy and all content regions

```html
<header class="mui-page-header">
  <nav class="mui-page-header-header" aria-label="Breadcrumb">
    <a href="./projects.html">Projects</a>
    <span aria-current="page">Example project</span>
  </nav>
  <div class="mui-page-header-main">
    <div class="mui-page-header-lead">
      <a class="mui-page-header-back" href="./projects.html">Back to projects</a>
      <span class="mui-page-header-avatar">
        <img src="./project.png" width="40" height="40" alt="">
      </span>
      <div class="mui-page-header-titles">
        <h1 class="mui-page-header-title">Example project</h1>
        <p class="mui-page-header-subtitle">Original subtitle</p>
      </div>
    </div>
    <div class="mui-page-header-extra">
      <a href="./project-edit.html">Edit project</a>
    </div>
  </div>
  <div class="mui-page-header-content">Main descriptive content.</div>
  <div class="mui-page-header-footer">Additional footer information.</div>
</header>
```

Keep these relationships for the scoped layout selectors:

| Upstream region | Native authored region |
| --- | --- |
| `header` | Root's direct `.mui-page-header-header`; optional native nav, breadcrumb or other introductory content. |
| `avatar` | Lead's direct `.mui-page-header-avatar`; authored image/SVG/glyph, with native sizing and meaning. |
| `title` | Titles group's direct `.mui-page-header-title`; choose the appropriate real heading level or another justified native element. |
| `subtitle` | Titles group's direct `.mui-page-header-subtitle`; typically a native paragraph. |
| `back` | Lead's direct native a[href]/button `.mui-page-header-back`, containing an authored name and optional decorative icon. |
| `extra` | Main row's direct `.mui-page-header-extra`; native text, links or actual controls. |
| default | Root's direct `.mui-page-header-content`; ordinary authored content. |
| `footer` | Root's direct `.mui-page-header-footer`; ordinary content, not automatically a footer/contentinfo landmark. |

The main/lead/titles wrappers only arrange content. They introduce no semantics. Regions
are optional: omit them or use native `hidden` explicitly. An authored empty/whitespace-only
region is still a grid/flex item and can contribute a gap; there is no CSS `:empty` removal
that could unexpectedly hide a native input/image or application-owned placeholder.

Choose **one authored value/content source** for title, subtitle and extra. They are not
runtime properties or host attributes. A native HTML `title` attribute remains browser
advisory text; it does not become the visible heading.
The pinned public documentation says extra's slot overrides its string prop, while the
actual source renders a truthy `extra` string before the slot. Title/subtitle similarly use
truthy-string-before-slot source expressions. The target avoids that ambiguity entirely:
normal DOM content is authoritative, without an alias/precedence adapter or silent fallback.

## Heading, landmark and asset ownership

- Choose h1–h6 according to the actual document hierarchy; the CSS does not synthesize or
  reset heading levels, roles, accessible labels, IDs or relationships. A visual title
  class on a span does not turn it into a heading.
- A top-level native header may be the page banner; one inside article/section/main has
  different native landmark semantics. Use header/div and surrounding native structure
  deliberately rather than adding `role="banner"` to every composition.
- A breadcrumb/navigation region needs an appropriate native nav name and authored current
  item. The stylesheet does not generate a breadcrumb trail, separators, links or route state.
- Footer/default/extra regions have no automatic role or live behavior. The demo's named
  native output belongs to its application form; any output/status announcements come from
  that author-selected HTML, not an automatic Page Header announcer.
- Asset selection, native width/height/viewBox, alt text, title/desc, fixed fills/strokes and
  loading behavior stay authored. The stylesheet does not recursively resize or repaint
  images/SVG, fetch icons, mirror artwork or import Avatar.

Use an empty alt/decorative SVG policy when the adjacent heading already supplies the
meaning; give a meaningful standalone image its own native name only when needed.
The demo uses original simple folder/back SVG geometry, not copied vendor assets.
Its directional back-arrow mirroring in RTL is explicit **application CSS**, not a generic
asset transform imposed by the library.

## Back actions and native forms

For a known destination use a real link, preserving authored href/target/rel and browser
navigation. Do not replace a destination with an unconditional `history.back()` guess.

For application behavior use an explicitly named native button:

```html
<button class="mui-page-header-back" type="button" id="return-to-list">
  Back to list
</button>
```

```js
const back = document.getElementById("return-to-list")
back.addEventListener("click", applicationReturnToList)
```

This is an ordinary native click, **not** `mui:back`, an onBack property setter or an event
raised by a wrapper. Supply the application handler and its lifetime/cleanup policy.
The source only renders its back icon when onBack is supplied; the native target renders
exactly the control the author includes. With no handler, a type=button control has no
navigation side effect. No runtime infers destination or visibility from a callback.

Visible text is preferred for the back action. If an application deliberately uses an
icon-only action, name the button/link explicitly once and mark its graphic decorative;
do not rely on an unlabeled arrow or tooltip. Never put another control inside a back action.

Native buttons retain `type`, `disabled`, focus, form owner and browser keyboard behavior.
Use `type="button"` for non-submitting back behavior. Authored untyped buttons keep native
submit behavior; CSS does not silently change them. Submit/reset buttons in extra remain
real controls. A disabled anchor is not a disabled button: the library does not emulate
disabled links or intercept their activation. Application code owns those design decisions.

The demo records application back clicks and intercepts form submission only to display
FormData locally. Its normal reset button still resets the native input. These are explicit
document-lifetime demo handlers, not library callbacks, routing or a form engine.

## Responsive CSS and tokens

Root grid spacing, wrapping main/lead/title/extra flex groups and logical min/max sizing
preserve source order. No CSS order, measurements, media-query JS or overflow clipping is
used. Title text wraps, including long unbroken words. At narrow widths the heading group
can move below a long back label rather than collapse to zero width.
Title and subtitle may share a row when space permits; extra wraps without rearranging
keyboard order. The main lead uses a 20rem flex basis and titles a 12rem basis, both shrinkable.

| CSS token | Default |
| --- | --- |
| `--mui-page-header-gap` | `1.25rem` between root regions |
| `--mui-page-header-main-gap` | `1rem` |
| `--mui-page-header-lead-gap` | `.75rem` |
| `--mui-page-header-title-gap` | `.375rem 1rem` |
| `--mui-page-header-extra-gap` | `.5rem` |
| `--mui-page-header-font-size` | `inherit` |
| `--mui-page-header-title-size`, `--mui-page-header-title-weight` | `1.25rem`, `600` |
| `--mui-page-header-title-color` | `inherit` |
| `--mui-page-header-subtitle-size`, `--mui-page-header-subtitle-color` | `.875rem`, `#57575c` |
| `--mui-page-header-back-padding`, `--mui-page-header-back-radius` | `.375rem .5rem`, `.25rem` |
| `--mui-page-header-back-color` | `inherit` |
| `--mui-page-header-back-hover-color`, `--mui-page-header-back-pressed-color` | `#175fbb`, `#104b95` |
| `--mui-page-header-focus-color` | `currentColor` |

These are ordinary external CSS values, not public Vue style props or a theme-object parser.
Set tokens/classes in your stylesheet; native CSS grammar/cascade controls invalid values.
No CSS strings or numeric inline styles are generated by JavaScript.
Author borders/padding/overall width remain outside the default component style; use
border-box sizing for padded constrained containers, as the demo does.
Arbitrary extra controls and large assets retain their own sizing policies; make them
responsive rather than expecting Page Header to repair a fixed-width widget.

RTL uses the document's own dir/lang and logical properties, without a provider or reordering
the DOM. There is no truncation or animation to undo for printing or reduced motion.
Forced-color adjustment is not disabled. Back focus has an explicit outline; other native
controls keep their own focus appearance. Check text, muted/disabled colors, custom backgrounds
and focus contrast in the actual application; automatic theme/contrast parity is not promised.

Original nodes/listeners/attributes, late changes and reconnects remain normal DOM behavior.
Templates remain inert until the application explicitly clones them. Scoped important display
rules preserve ordinary hidden regions/templates despite flex/grid display; `hidden="until-found"`
is left to native browser behavior, not converted into display:none.
No observer, upgrade, component state, lifecycle/disposal method or implicit HTML evaluation exists.
Without the stylesheet, original native markup still reads and navigates in document order.

## API tracker and numbered acceptance

🟢 Verified **native adaptation**, not a compatible framework prop/slot runtime.
⏭️ Intentionally omitted framework contract.

| Upstream item | Native target | Status / limits |
| --- | --- | --- |
| `extra` prop | Authored extra text/content. | 🟢 One DOM source, no ambiguous prop/slot precedence. |
| `subtitle` prop | Authored subtitle text/content. | 🟢 No runtime coercion or attribute fallback. |
| `title` prop | Author-chosen heading/text node. | 🟢 Native title attribute is not a heading API. |
| `on-back` callback | Native click/application handler or direct href. | 🟢 No custom event, implicit routing/history or generated control. |
| `avatar` slot | Original native asset region. | 🟢 Native sizing/paint/accessible owner preserved. |
| `header` slot | Authored top region, optionally named native navigation. | 🟢 No invented breadcrumb API/dependency. |
| default slot | Native content region. | 🟢 Original nodes/controls remain native. |
| `extra` slot | Native extra region. | 🟢 Actions/form types/disabled state stay authored. |
| `footer` slot | Native footer-content region. | 🟢 No automatic contentinfo role. |
| `subtitle` slot | Native subtitle node. | 🟢 Content and semantics remain authored. |
| `title` slot | Native title node. | 🟢 Heading level/ARIA chosen by the author. |
| `back` slot | Native named action's original icon/text. | 🟢 No default asset or unlabeled clickable div. |
| Source theme/themeOverrides/builtinThemeOverrides | External CSS/tokens. | ⏭️ Three object/provider/internal contracts omitted. |

All twelve original rows plus three explicit source supplements are retained:
**15 rows, 12 Verified ADAPTED native targets and 3 intentional omissions**.

1. [x] Review all pinned props/callback/slots and source theme/precedence details.
2. [x] Define native region/heading/navigation/asset ownership without component dependencies.
3. [x] Implement external grid/flex/logical styling, native focus and narrow long-title wrapping.
4. [x] Preserve native links/actions/forms, hidden/template behavior and original nodes/listeners.
5. [x] Add separate demo HTML/CSS and meaningful application-only JS, with existing-runner tests.
6. [x] Validate build/budgets and Chromium landmarks/names/keyboard/forms/RTL/zoom/print/coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Divider.

### Evidence — 2026-09-08

- Focused Page Header tests passed; final `pnpm build && pnpm test` passed **340 tests**,
  including **13 Page Header tests** and all 327 previous tests.
- Tests cover stylesheet-only exports/source, all regions, original headings/ARIA/content,
  explicit links/clicks, button/submit/reset/disabled semantics, native paints, empty regions,
  hidden/templates, late/reconnected nodes and source-order/motion/scope constraints.
- Chromium found a long back label collapsing the title at 280px. The lead now wraps and
  the title group has a shrinkable nonzero basis; source regression and browser checks passed.
- At 960/480/320/280px there was no page/header horizontal overflow or clipped title.
  At 280px the long heading had 215px available width and fully wrapped over 135px height.
- Chromium AX inspection found one contextual page banner, a nested sectionheader rather
  than another banner, real h1/h2 headings, a named Breadcrumb navigation and singly named
  native back link/button. No role/heading-level attributes were synthesized.
- Enter followed the authored back href. Enter and Space each produced one application
  back click, neither submitting the form. Tab preserved Save/Reset/input order and skipped
  the disabled action. Native submit delivered FormData once; native reset restored the input.
- Blocking only the application demo script retained native heading/layout/link behavior;
  the application-only button correctly had no invented navigation side effect.
- Native avatar SVG paints/viewBox remained intact; 200% CSS zoom changed 40px artwork to
  80px without document overflow. RTL retained native direction and inline-start back placement,
  including wrapped rows. Forced colors retained a visible outline; no motion ran.
- Print showed full title text. In-memory Chromium A4 PDF generation with backgrounds disabled
  returned a valid 53,831-byte PDF; no PDF file was written. This is not physical-printer proof.
- Late actions and detached/reinserted headers retained original nodes/listeners. Ordinary
  hidden headers stayed display:none; until-found remained native content-visibility:hidden.
- Isolated CSS-before/after-legacy checks preserved exact original markup/nodes, outside styles
  and flex layout; no Page Header registration/global appeared. Only the task tab was used.
- **CSS: 3,636 raw / 778 gzip bytes, under its 1,500-byte ceiling.**
  Core remains **14,611 / 15,000 gzip bytes**, with no dependency or JavaScript bundle added.
- Reference validation preserved all twelve original name/source rows plus three explicit
  source supplements: **96 pages, 3,119 rows, 384 tasks (64 accepted), 729 relative file links**.

This is native/CSS retained scope, not all-browser/AT, arbitrary widget sizing, theme/provider
or vendor pixel parity certification. Divider is next through coordinator selection, followed
by Flex, Space, Grid, Layout, List, Descriptions, Timeline and Breadcrumb. P2 is not complete.
