# Thing

**Migration status: 🟢 Verified for the retained native scope.**
Thing is an external-CSS composition of authored media, heading, description, content,
footer and action regions. It has no controller, renderer, provider or component constructor.

**Default-style audit (2026-09-10):** the retained composition now uses the pinned
reference's 14px body, 16px/500 title, 1.6 leading, region margins, avatar alignment and
light/dark text roles. See the [rendered audit](../style-audit/components/thing.md) for
before/after geometry, authored-token precedence, strict CSS budget and remaining limits.
There is still **zero component JavaScript**.

## Loading and reference boundary

| Asset | Purpose |
| --- | --- |
| `src/components/thing/thing.css` | Maintained isolated CSS. |
| `dist/markup-ui-thing.css` | Browser stylesheet. |
| `@dataengine/markup-ui/thing/style.css` | Stylesheet-only package export. |
| `demo/components/thing.html`, `.css`, `.js` | Native regions/forms and optional application submit/follow behavior. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-thing.css">
```

There is no `./thing` JavaScript export, global, registration or load-order requirement.
Card/List/PageHeader informed the composition conventions, but none of their stylesheets
or runtimes is imported. The unchanged aggregate and widgets plugin do not acquire a
`mui-thing` definition.

Authority: [official page](https://www.naiveui.com/en-US/os-theme/components/thing),
[pinned public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/demos/enUS/index.demo-entry.md),
[Thing source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/src/Thing.tsx)
and [presentation source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/thing/src/styles/index.cssr.ts),
at `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [reference tracker](../naive-ui/components/thing.md) keeps all **16 original public
rows**, plus **three explicit source-only theme supplements**: **14 Verified adapted
targets and 5 Intentionally omitted contracts**. Green is native-scope acceptance, not
Vue, style-object, theme or pixel parity.

## Native anatomy

```html
<article class="mui-thing" aria-labelledby="project-title">
  <div class="mui-thing-avatar">
    <img src="./project-emblem.png" width="48" height="48" alt="Project emblem">
  </div>
  <div class="mui-thing-lead">
    <header class="mui-thing-header">
      <h2 class="mui-thing-title" id="project-title">
        <a href="./project.html">Atlas project</a>
      </h2>
      <div class="mui-thing-header-extra">Private</div>
    </header>
    <p class="mui-thing-description">A short project description.</p>
  </div>
  <div class="mui-thing-content">Authored project content.</div>
  <footer class="mui-thing-footer">Updated today.</footer>
  <div class="mui-thing-action">
    <button type="button">Follow project</button>
    <a href="./project.html">Project details</a>
  </div>
</article>
```

Use `article` only when the content is an independently meaningful article. A `div` or
appropriate native section is equally valid. Choose actual heading levels and names
yourself; `.mui-thing-title` does not assign them. For list composition, place the Thing
**inside** a real `li` so the surrounding native list keeps its markers/list-item display.
Thing itself is not a List, Card surface or PageHeader landmark.

The direct root regions are avatar, lead, content, footer and action. Lead contains an
optional header (title plus header-extra) followed by description. Keep the avatar before
the lead and subsequent regions in DOM order; CSS never moves it between wrappers.
Each named region is optional. Native text should be placed in the appropriate authored
region rather than relying on a renderer to wrap anonymous root text.

Use meaningful image `alt` or explicitly decorative media, and name meaningful SVGs.
The avatar region accepts authored media/glyphs, not an Avatar/Icon component instance.
An optional `--mui-thing-avatar-width` bounds direct avatar images/SVGs proportionally;
there is no default 48px cap. Media keeps its authored size, as an upstream avatar slot does.
Large media, content images and unusual media need their own author constraints.
Nodes, source attributes, alternative text, classes, labels,
listeners, links, native controls and content order remain unchanged.

## Property and slot mappings

| Upstream surface | Native target and boundary |
| --- | --- |
| `content-indented` | Presence `data-content-indented` changes content/footer/action to the lead column when a visible authored avatar exists. Default absent is unindented. |
| `title`, `header` slot | Authored `.mui-thing-title` heading/header content in `.mui-thing-header`. No native title-tooltip mapping, generated heading or prop/slot precedence. |
| `title-extra`, `header-extra` slot | Authored `.mui-thing-header-extra` alongside the title; text or real controls remain native. |
| `description`, `description` slot | `.mui-thing-description` below the header, inside lead; a header is not required. |
| `content`, `default` slot | Rich native `.mui-thing-content` children. For dynamic plain strings, assign `textContent`, not parsed HTML. |
| `description-class`, `content-class` | Native classes/classList on the actual description/content nodes; no host-to-child forwarding. |
| `description-style`, `content-style` | ⏭️ Runtime string/object forwarding omitted; use external CSS on the actual nodes. |
| `avatar` slot | An authored `.mui-thing-avatar` before lead; images, SVG and text remain author-owned. |
| `footer` slot | An optional `.mui-thing-footer` region; use a native footer only if that semantic fits. |
| `action` slot | `.mui-thing-action` with independent native buttons/links; no whole-host action or nested interactive root. |
| Source `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ Framework/provider objects and override merging omitted; external CSS tokens instead. |

Neither public API nor reviewed source declares `size`, `align`, `prefix`, a render callback,
or component-specific events/methods. Do not confuse the leading avatar region with an
additional prefix slot. Size/alignment customization below is ordinary **local CSS**, not
an invented Thing prop API.

String props and slot functions are not accepted JavaScript properties on a new element.
They map to one explicit authored region per surface, with no duplicated data tree,
fallback evaluation or render callback. Empty regions remain authored nodes; omit or
hide them if their grid spacing is not wanted.

## Indentation, sparse regions and direction

By default, avatar and lead share the first row; content, footer and actions span the
full Thing width. With `data-content-indented`, those later regions align with the lead
at logical inline-start. The avatar remains in the same DOM position and only native
grid placement changes. Footer/actions follow the same indentation intentionally.

```html
<div class="mui-thing" data-content-indented>
  <!-- Same authored region order as the first example -->
</div>
```

The switch is presence-based: `data-content-indented="false"` is still enabled. Remove
the attribute to disable it. The indent applies only when a real, non-template avatar
region before the content is not `[hidden]`. A missing/hidden avatar produces full-width
lead/content/footer/action with no phantom leading column, even when an avatar-class
template exists. Hiding through unrelated application `display:none` selectors is not
detected; use native `hidden` for conditional regions.

Unlike the upstream branching renderer, the native composition does not move avatar nodes
when indentation changes or suppress an authored description merely because an avatar
exists without header/title content. Description-only, content-only, action-only and empty
examples remain explicit HTML, without generated placeholders or headings.

Nested Things use their own grid placement, so indentation does not leak into nested
content. Default values are CSS fallbacks, not assignments that erase inherited author
tokens: a shared/ancestor Thing override now inherits normally, and an explicit nested
override wins. Native `dir`, typography and authored color tokens may also inherit.
Logical grid columns and margins support RTL without reversing DOM reading/Tab order.
Header-extra and action controls wrap naturally; no measurement, responsive string parser,
container controller or hidden overflow is introduced.

## Native actions, forms and styling

The host remains passive. Use anchors for destinations and actual typed buttons for
commands. Do not turn the entire Thing into a clickable-looking button or put multiple
actions inside a row-wide link. Native labels, required validity, fieldset disabling,
focus, form association, submission and reset remain browser behavior.

The demo places a form in content and uses real `form="project-form"` submit/reset buttons
in the separate action region. Its follow toggle and status messages are application JS,
not Thing state or automatic announcements. With JS disabled, ordinary markup, images,
links, reset and GET submission still work; application-specific follow behavior requires
its own listener. No lifecycle/cleanup machinery is necessary for CSS-only presentation.

| CSS token | Default / responsibility |
| --- | --- |
| `--mui-thing-column-gap`, `--mui-thing-row-gap` | `12px`; avatar-column spacing and margins before subsequent content/footer/action regions. Use nonnegative lengths. |
| `--mui-thing-avatar-width` | No default cap; optional maximum avatar-region width. Media retains authored dimensions unless constrained. |
| `--mui-thing-title-size`, `--mui-thing-title-weight` | `16px` / shared `--mui-font-weight-strong`, then `500`; heading levels remain author-selected. |
| `--mui-thing-lead-gap` | `4px` margin below the header, including header-only content. Use a nonnegative length. |
| `--mui-thing-header-align` | `center`; valid native flex `align-items` values. |
| `--mui-thing-action-gap`, `--mui-thing-action-justify` | `0` / `start`; explicit native wrapping-flex spacing/justification conveniences. |
| `--mui-thing-font-size` | Shared `--mui-font-size`, then `14px`. |
| `--mui-thing-font-family`, `--mui-thing-line-height` | Shared `--mui-font-family`, then inherited family; shared `--mui-line-height`, then `1.6`. |
| `--mui-thing-color` | `#333639` in light; white/.82 in explicit dark. |
| `--mui-thing-title-color`, `--mui-thing-description-color` | Title defaults to `#1f2225` / white/.9; description inherits body color unless locally overridden. |

Local tokens win over shared typography/defaults, including when inherited from an ancestor.
`data-mui-theme="dark"` on a host or ancestor selects dark role fallbacks; nested explicit
`"light"` resets them. Legacy `--mui-text-primary` does not represent Naive's body/title
roles and is deliberately not reused. Changing body color does not implicitly recolor
the title; both roles have independent local overrides.

The avatar starts 2px below the top. With indentation, it spans the four logical
lead/content/footer/action tracks without moving any DOM node; the final flexible track
absorbs excess avatar height so a tall avatar does not push later text downward.
Header-only indented content accounts for the reference's collapsed margins, including
row gaps smaller than the header gap. Ordinary named regions should remain in the
documented order.

Apply valid values through external CSS classes/stylesheets. There is no `data-size` or
alignment prop parser. The demo's compact/aligned styles and panel borders are application
choices: Thing adds no Card border, padding, cover, close button, elevation or hover state.
It also adds no List semantics/dividers or PageHeader back-navigation behavior.

Native hidden roots/regions/controls and templates remain hidden/inert. Standalone CSS
does not force `hidden="until-found"` to `display:none`; that reveal path is browser-owned
and not separately certified. Print requests unbroken Things where pagination permits;
forced colors preserve readable body/title/description text. Body/title color changes
transition for 0.3s; reduced motion removes those transitions. There is no runtime animation.

## Migration steps and acceptance

1. [x] Define the seven authored regions with native heading/media/content semantics.
2. [x] Keep header/action controls and associated forms native; leave the host passive.
3. [x] Implement indentation, media/header/action layout and logical wrapping in external CSS.
4. [x] Validate sparse/hidden/template/nested content, native actions and no-controller behavior.

On 2026-09-08, `pnpm --dir D:\repos\MarkupUI check` passed build/budget gates and
**455 tests**, including **12 Thing cases**. Chromium acceptance exercised:

- Named native articles/headings, image alt and SVG title names, generic nested Things,
  native lists, visible/hidden regions and original content/reading order.
- A 48px avatar plus 12px gap: unindented content started 60px before lead; live indentation
  aligned content/footer/actions with lead without changing nodes or current focus.
  Hiding the real avatar restored full-width regions despite an avatar-class template.
- RTL indentation and avatar placement, authored header/action alignment, independent
  nested 12px gap/full-width content, and description-only/content-only/action-only/empty cases.
- Tab order through header link/action, labelled input, external form-associated submit/reset
  controls and detail link, skipping disabled controls. Enter/Space each activated the
  application follow button once with native focus; required validation blocked empty
  submission, one valid submission excluded the disabled fieldset, and reset restored default.
- 280px/320px widths and 200% CSS zoom without Thing/region/document horizontal overflow;
  print and forced-colors rules.
- Later aggregate/widgets loading preserved Thing nodes and native grid/article semantics;
  no Thing custom element appeared, while legacy structured Card/List behavior still worked.
- A JavaScript-disabled Chromium context retained image/heading names and native externally
  associated reset/GET submission to `?project=NoJS`.

Library CSS is **3,637 bytes / 841 gzip bytes**, below its new **1,000-byte** ceiling.
Component JS is **0 bytes**. Demo application JS is **588 / 297 gzip bytes**, and demo-only
CSS is **1,151 / 548 gzip bytes**. Core remains **62,558 / 14,611 gzip bytes** under **15,000**;
widgets remains **10,858 / 2,779 gzip bytes** under **4,000**. Existing outputs/ceilings and
zero runtime dependencies are unchanged. These checks do not certify all browsers,
browser-UI zoom, screen-reader speech, animation or framework/pixel parity.
