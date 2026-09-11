# Avatar and Avatar Group

**Migration status: 🟢 Verified for the retained scope; acceptance evidence is recorded below.**
This is the dependency-free, standalone Avatar component. It does not replace the basic
Avatar embedded in the legacy aggregate unless it is registered first.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-avatar.js` | ES module; exports the element classes and `registerAvatar()`, and registers on browser import. |
| `dist/markup-ui-avatar.global.js` | Classic script; registers elements and exposes `MarkupUIAvatar`. |
| `dist/markup-ui-avatar.css` | External component stylesheet; no style injection. |
| `demo/components/avatar.html` | Runnable comparison page mirroring the ten pinned Naive UI 2.45.3 Avatar cases. Every case has an adjacent icon-only MarkupUI code control and highlighted literal authored snippet. |

## Loading

Classic HTML:

```html
<link rel="stylesheet" href="./vendor/markup-ui-avatar.css">
<script defer src="./vendor/markup-ui-avatar.global.js"></script>
<script defer src="./app.js"></script>

<mui-avatar alt="Ada" size="large">A</mui-avatar>
```

ES-module application JavaScript:

```js
import "@dataengine/markup-ui/avatar";
```

Link the exported `@dataengine/markup-ui/avatar/style.css` stylesheet using your application's
asset-serving mechanism, or copy the distribution CSS and link it directly. A plain-browser
application imports the served `markup-ui-avatar.js` path instead of the npm package specifier.
Consumers need no compiler or runtime dependency.

For the documented document typography, also link `@dataengine/markup-ui/global-style/style.css`.
It is opt-in and never injected by Avatar. Without it, text inherits the application's font.
The [default-style audit](../style-audit/components/avatar.md) records the Naive UI 2.45.3
rendered comparison and intentional remaining native differences.

If also using the legacy aggregate, load the Avatar entry **before** that aggregate. With
classic scripts, use `defer` on both and put Avatar first. With ES modules, import Avatar
before importing the aggregate. The aggregate's registry preserves existing definitions.
Loading Avatar after the basic legacy definition throws an explicit registration error:
the browser cannot redefine a custom element. Do not load both ESM and classic distributions
of the same component in one document.

## Authored HTML and templates

```html
<mui-avatar alt="Ada" lazy>
  <img src="./ada.png" alt="Ada" width="34" height="34">
  A
  <template data-mui-avatar-placeholder><span>...</span></template>
  <template data-mui-avatar-fallback><span>?</span></template>
</mui-avatar>
```

The original image and content nodes are preserved. Ordinary fallback content is wrapped
without cloning it, so existing node listeners survive. Optional inert templates are cloned
once with `document.importNode`; use unique IDs if your template needs labels/references.
Do not put interactive controls inside an avatar's image-like content.

Native `loading="lazy"` handles lazy loading. While loading, the image keeps a layout box so
lazy loading can activate; placeholders occupy the same grid cell. A failed primary image
can attempt one `fallback-src`, then shows the authored fallback template or ordinary content.
`alt=""` denotes decorative content. An explicit host `aria-label` or `role` takes precedence
over generated host semantics.

## Attribute and property tracker

| Upstream item / target feature | MarkupUI equivalent | Status / scope |
| --- | --- | --- |
| `src` | `src` attribute and `.src` property; an authored direct `img` is also accepted. | 🟢 Verified; source changes restart loading. |
| `fallback-src` | `fallback-src` / `.fallbackSrc`. | 🟢 Verified; one alternate image attempt per primary source. Set before changing the primary source. |
| `size` | `size="tiny\|small\|medium\|large\|huge"` or a positive numeric pixel value; `.size` accepts a string or number. | 🟢 Verified; 22/28/34/40/46px content boxes, default 34px. Borders add 4px to the outer dimensions. |
| `round` | Default is a 3px-radius square; `round` requests a circle and `square` explicitly requests the default shape. | 🟢 Verified against the default reference; `round` wins when both are present. |
| `bordered` | Boolean `bordered` attribute and external CSS. | 🟢 Verified. |
| `color` | `--mui-avatar-background` and `--mui-avatar-color` in author CSS. | 🟢 Verified as CSS tokens, not an inline style prop. |
| `object-fit` | `object-fit` attribute or `--mui-avatar-object-fit`; accepts native object-fit keywords. | 🟢 Verified; default fill, matching upstream's unset native image fit; use cover to crop. |
| `img-props` | Author native image attributes directly, including alt, decoding and referrer policy. | 🟢 Verified as native HTML, not an object passthrough API. |
| `lazy` | Boolean `lazy` / `.lazy`, using native image loading. | 🟢 Verified; authored loading behavior is restored when the override is removed. |
| `intersection-observer-options` | Native image lazy loading. | ⏭️ Intentionally omitted; no redundant observer configuration. |
| `on-error` | Bubbling `mui:error`; detail contains `src`, `fallback` and `state`. | 🟢 Verified as notification; the fallback policy is explicit, not controlled by an event handler return value. |
| Default content | Authored text/image/icon nodes. | 🟢 Verified without a VNode renderer. |
| Fallback slot | `template[data-mui-avatar-fallback]` or authored `span[data-mui-avatar-fallback]`. | 🟢 Verified as light-DOM content, not native slot projection. |
| Placeholder slot | `template[data-mui-avatar-placeholder]` or authored `span[data-mui-avatar-placeholder]`. | 🟢 Verified as light-DOM content. |
| Automatic text fitting | Natural-width text scaled by `min(0.9 × hostWidth / textWidth, 0.9 × hostHeight / textHeight, 1)`. | 🟢 Verified against rendered Naive short/long text; scoped native ResizeObserver updates fit without replacing content or truncating labels. |
| Theme/render framework plumbing | External CSS, native children and DOM events. | ⏭️ Framework-specific API compatibility is intentionally omitted. |

`mui:load` is an additional bubbling notification with `{ src }`. State is exposed through
`data-mui-avatar-state="empty|loading|loaded|error"`. Property assignment does not fabricate
user input/change events. Numeric `size` and the `object-fit` convenience attribute write
isolated CSS custom properties. Automatic text fitting also writes its private
`--mui-avatar-text-scale` value on the content wrapper; account for these inline CSSOM writes
in your CSP. The component does not inject stylesheets or change authored font-size/transform
declarations.

Default text is white, 14px, inherited normal weight; its line-height is 1.25. Light
background is `#ccc`; explicit `data-mui-theme="dark"` uses `#424245` and `#18181c`
border (light border is white). `--mui-avatar-size`, `--mui-avatar-font-size`,
`--mui-avatar-radius`, `--mui-avatar-background`, `--mui-avatar-color`,
`--mui-avatar-border-color` and `--mui-avatar-object-fit` remain author overrides.
Numeric size/fit attributes temporarily override authored inline tokens and restore them
when removed; source/text updates and reconnection do not erase later author changes,
even while the corresponding convenience attribute remains present.
Named child sizes override inherited group sizing; an authored inline `--mui-avatar-size`
can override a named preset. Ordinary CSS specificity/cascade governs stylesheet overrides.

Text is measured with untransformed integer `offsetWidth`/`offsetHeight`, including the
host border, as in the pinned reference. A single native ResizeObserver per connected Avatar
watches the host and content/placeholder/fallback wrappers; the existing MutationObserver
handles text/node changes. Size, font loading/font changes and newly visible content refit.
Observers disconnect when detached; reconnect measures existing nodes again. Text, accessible
labels and listeners remain intact. Without ResizeObserver, initial and attribute/text-triggered
fitting still works, but CSS-only/font resize changes are not observed. This fallback is not a
polyfill or a certification of older browsers.

## Group

```html
<mui-avatar-group max="2" label="Project team">
  <mui-avatar alt="Ada">A</mui-avatar>
  <mui-avatar alt="Grace">G</mui-avatar>
  <mui-avatar alt="Linus">L</mui-avatar>
</mui-avatar-group>
```

| Upstream item / target feature | MarkupUI equivalent | Status / scope |
| --- | --- | --- |
| `max` | `max` attribute / `.max`; count of directly visible avatars, excluding the overflow summary. Omission shows all; zero puts all into overflow. | 🟢 Verified; negative values clamp to zero. |
| `vertical` | Boolean `vertical` attribute and CSS logical layout. | 🟢 Verified. |
| `size` / appearance shared across options | CSS custom properties on the group, or attributes on each child. | 🟢 Verified through inheritance; no second group prop model. |
| `options` | Authored child avatars; application code may clone an authored template for data-driven groups. | ⏭️ A library-owned options renderer is intentionally omitted. |
| `expand-on-hover` | Native `details`/`summary` disclosure usable by keyboard, touch and pointer. | ⏭️ Hover-only expansion is intentionally omitted. |
| Avatar/default slot | Native child `mui-avatar` elements. | 🟢 Verified, preserving identity and document order. |
| Rest slot | Generated native summary; customize `rest-label` and CSS. | ⏭️ Arbitrary render callbacks are omitted; the fixed semantic disclosure is implemented. |

Overflow avatars move into the native disclosure rather than being recreated. Group updates
preserve child identities. `label` names the group; `rest-label` supplies a localized
accessible label for the overflow summary. Without it the summary uses an English count.
Group members and the summary default to circles with real 2px borders and -12px overlap:
three default members occupy 90×38px (38×90px vertically). Explicit `square` and author
radius/border/group-background tokens remain available; unlike upstream, `square` can
opt a group member out of the round default. Native disclosure/count semantics are unchanged.

## Migration steps and acceptance

- [x] Map image/default/fallback/loading features to native HTML and documented scope.
- [x] Add standalone Custom Elements without changing the legacy default bundle.
- [x] Preserve authored nodes and clone only explicit inert templates.
- [x] Implement external CSS for size, shape, state and grouping.
- [x] Implement bounded fallback, live attributes, pre-upgrade properties and reconnect cleanup.
- [x] Implement native group overflow with preserved order and identities.
- [x] Add separate classic HTML, CSS and JavaScript demonstration files.
- [x] Record final unit/build and browser acceptance results, then update accepted rows to Verified.

## Acceptance record

On 2026-09-08, `pnpm check` completed the build and all 43 tests: 16 focused Avatar tests
and 27 existing native tests. The focused cases include native-node preservation, source and
fallback transitions, templates, live authored image updates, pre-upgrade properties,
disconnect/reconnect, replaced group children, overflow ordering and registration conflicts.

Chromium acceptance covered native lazy loading, success/failure/text restoration, named and
numeric sizes, square/bordered appearance, object fitting, focusable native overflow toggled
with Enter, replaced group content, and a failed image reconnecting. Both classic loading and
ES-module loading before the legacy aggregate were exercised; standalone examples inject no
style tags. Browser coverage here is Chromium, not a claim of all-browser certification.

The original acceptance measured core at 14,611 gzip bytes; consult the current build manifest
and style audit for updated sizes. The core keeps its 15,000-byte ceiling. Avatar has separate
4,000-byte gzip ceilings for ESM/classic JavaScript and a 1,500-byte CSS ceiling, enforced by
the build; the manifest records exact output sizes. This page records the retained scope,
not pixel parity or blanket accessibility conformance.
