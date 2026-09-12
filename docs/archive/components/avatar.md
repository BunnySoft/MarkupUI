# Avatar and Avatar Group

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

The canonical Web implementation uses `Avatar : ViewElement`, named content regions and
typed properties. The [Element Contract reference](../contracts/01-avatar.md)
defines its behavior; this page covers loading, Web authoring and migration.
Avatar is dependency-free and standalone. The aggregate no longer registers a second basic Avatar.

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

<m-avatar label="Ada" size="large">A</m-avatar>
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
The [default-style audit](../styling/components/avatar.md) records the Naive UI 2.45.3
rendered comparison and intentional remaining native differences.

Import Avatar explicitly even when using the aggregate; the two entries can load in either
order. Duplicate registration by a different implementation throws before changing the
registry. Do not mix old/new Avatar versions or its ESM and classic distributions in one document.

Public exports are `Avatar`, `AvatarGroup`, `AvatarPlaceholder`, `AvatarFallback`,
`AvatarDefinition`, `AvatarGroupDefinition`, `ViewElement` and `registerAvatar`, plus their
TypeScript types. Old `MAvatar`/`MAvatarGroup` names are not aliases.

**Planned metadata API:** the [class-owned reflection design](../../architecture/05-meta.md)
replaces handwritten definitions with `Avatar.meta` / `AvatarGroup.meta` returning
`ElementMeta`. It is not implemented yet; the exports above and the acceptance record
describe the current baseline, not the planned API.

## Authored HTML and templates

```html
<m-avatar label="Ada" loading="lazy" shape="circle">
  <img src="./ada.png" alt="Ada" width="34" height="34">
  A
  <m-avatar-placeholder><template><span>...</span></template></m-avatar-placeholder>
  <m-avatar-fallback>?</m-avatar-fallback>
</m-avatar>
```

The original image and content nodes are preserved. Ordinary fallback content is wrapped
without cloning it, so existing node listeners survive. Optional inert templates are cloned
once per named region with `document.importNode`; use unique IDs for labels/references.
Template edits are not live bindings; update rendered content or replace the region.
Do not put interactive controls inside an avatar's image-like content.

Native `loading="lazy"` handles lazy loading. While loading, the image keeps a layout box so
lazy loading can activate; placeholders occupy the same grid cell. A failed primary image
can attempt one `fallback-src`, then shows the authored fallback template or ordinary content.
Host `label=""` denotes decoration; a null/absent label uses the authored image alt or ordinary
text. Explicit host ARIA takes precedence and live naming changes update generated semantics.
Generated images have empty alt text so the host owns the accessible name.

## Attribute and property tracker

| Upstream item / target feature | MarkupUI equivalent | Status / scope |
| --- | --- | --- |
| `src` | `src` attribute and `.src` property; an authored direct `img` is also accepted. | 🟢 Verified; source changes restart loading. |
| `fallback-src` | `fallback-src` / `.fallbackSrc`. | 🟢 Verified; one alternate image attempt per primary source. Set before changing the primary source. |
| `size` | `size="tiny\|small\|medium\|large\|huge"` or positive numeric pixels; `.size` accepts the named enum or a number. | 🟢 Verified; 22/28/34/40/46px content boxes, default 34px. Borders add 4px to the outer dimensions. |
| `round` / shape | `shape="rounded\|circle\|square"`; default rounded. | Rounded uses the 3px theme radius; circle is 50%; square is 0. Old flags are removed. |
| `bordered` | Boolean `bordered` attribute and external CSS. | 🟢 Verified. |
| `color` | `--m-avatar-background` and `--m-avatar-color` in author CSS. | 🟢 Verified as CSS tokens, not an inline style prop. |
| `object-fit` | `image-fit` / `.imageFit`, or `--m-avatar-object-fit`; native fit keywords. | Default fill; use cover to crop. The old attribute is removed. |
| `img-props` | Author native image attributes directly, including alt, decoding and referrer policy. | 🟢 Verified as native HTML, not an object passthrough API. |
| `lazy` | `loading="eager\|lazy"` / `.loading`, using native image loading. | Removing the override restores the authored image hint. The old boolean is removed. |
| `intersection-observer-options` | Native image lazy loading. | ⏭️ Intentionally omitted; no redundant observer configuration. |
| `on-error` | Bubbling `m:error`; detail contains `src`, `fallback` and `state`. | 🟢 Verified as notification; the fallback policy is explicit, not controlled by an event handler return value. |
| Default content | Authored text/image/icon nodes. | 🟢 Verified without a VNode renderer. |
| Fallback region | `m-avatar-fallback`, optionally containing one template. | Light-DOM content, not native slot projection. |
| Placeholder region | `m-avatar-placeholder`, optionally containing one template. | Light-DOM content. |
| Automatic text fitting | Natural-width text scaled by `min(0.9 × hostWidth / textWidth, 0.9 × hostHeight / textHeight, 1)`. | 🟢 Verified against rendered Naive short/long text; scoped native ResizeObserver updates fit without replacing content or truncating labels. |
| Theme/render framework plumbing | External CSS, native children and DOM events. | ⏭️ Framework-specific API compatibility is intentionally omitted. |

`m:load` is an additional bubbling notification with `{ src }`. State is exposed through
the read-only `.state` property and `data-state="empty|loading|loaded|error"`. Internal nodes
use `data-part`; applications author named region elements instead. `m:error` remains a
notification per failed attempt, including a primary failure while fallback is loading.
Property assignment does not fabricate user input/change events. Numeric `size` and `image-fit` write
isolated CSS custom properties. Automatic text fitting also writes its private
`--m-avatar-text-scale` value on the content wrapper; account for these inline CSSOM writes
in your CSP. The component does not inject stylesheets or change authored font-size/transform
declarations.

Default text is white, 14px, inherited normal weight; its line-height is 1.25. Light
background is `#ccc`; explicit `data-m-theme="dark"` uses `#424245` and `#18181c`
border (light border is white). `--m-avatar-size`, `--m-avatar-font-size`,
`--m-avatar-radius`, `--m-avatar-background`, `--m-avatar-color`,
`--m-avatar-border-color` and `--m-avatar-object-fit` remain author overrides.
Numeric size/fit attributes temporarily override authored inline tokens and restore them
when removed; source/text updates and reconnection do not erase later author changes,
even while the corresponding convenience attribute remains present.
Named child sizes override inherited group sizing; an authored inline `--m-avatar-size`
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
<m-avatar-group max="2" label="Project team">
  <m-avatar label="Ada">A</m-avatar>
  <m-avatar label="Grace">G</m-avatar>
  <m-avatar label="Linus">L</m-avatar>
</m-avatar-group>
```

| Upstream item / target feature | MarkupUI equivalent | Status / scope |
| --- | --- | --- |
| `max` | `max` attribute / `.max`; directly visible count excluding the summary. Absence or `.max = Infinity` shows all; zero puts all into overflow. | Fractions floor; negatives clamp to zero; other nonfinite values throw. |
| `vertical` | Boolean `vertical` attribute and CSS logical layout. | 🟢 Verified. |
| `size` / appearance shared across options | CSS custom properties on the group, or attributes on each child. | 🟢 Verified through inheritance; no second group prop model. |
| `options` | Authored child avatars; application code may clone an authored template for data-driven groups. | ⏭️ A library-owned options renderer is intentionally omitted. |
| `expand-on-hover` | Native `details`/`summary` disclosure usable by keyboard, touch and pointer. | ⏭️ Hover-only expansion is intentionally omitted. |
| Avatar/default slot | Native child `m-avatar` elements. | 🟢 Verified, preserving identity and document order. |
| Rest slot | Generated native summary; customize `rest-label` and CSS. | ⏭️ Arbitrary render callbacks are omitted; the fixed semantic disclosure is implemented. |

Overflow avatars move into the native disclosure rather than being recreated. Group updates
preserve child identities. `label` names the group; `rest-label` supplies a localized
accessible label for the overflow summary. Without it the summary uses an English count.
Both have nullable typed properties, `.label` and `.restLabel`.
Group members and the summary default to circles with real 2px borders and -12px overlap:
three default members occupy 90×38px (38×90px vertically). Explicit `shape="rounded"` or
`shape="square"` overrides the group's circular default. Author radius/border/background
tokens and native disclosure/count semantics remain available.

## Canonical migration acceptance

On 2026-09-11, the Web migration passed `pnpm build` and these existing fixtures, run
individually: Avatar (32), native integration (27), demo index (18), styles (9) and
Button distribution (2): **88 passing tests**. No new test file was required.

Isolated Chromium 152 verified classic and ESM loading, aggregate-first registration,
all three shapes, lazy loading, fallback/empty transitions, live accessible naming,
content identity, keyboard overflow and the visibility demo, with no page exceptions.
This is Chromium coverage, not all-browser or native-target certification.

| Distribution | Gzip bytes | Unchanged ceiling |
| --- | ---: | ---: |
| Avatar ESM | 3,946 | 4,000 |
| Avatar classic | 3,994 | 4,000 |
| Avatar CSS | 1,079 | 1,500 |
| Aggregate core | 14,885 | 15,000 |

A local isolated-browser comparison against the pre-migration Git HEAD used five fresh
contexts per version, 200 text Avatars, the respective stylesheet, and explicit garbage
collection. Medians include module evaluation plus synchronous creation for startup, and
one size/name update per control for the update batch:

| Measurement | Previous implementation | Canonical implementation |
| --- | ---: | ---: |
| Startup | 98.6ms | 100.9ms |
| Scalar update batch | 60.4ms | 72.5ms |
| Retained JS heap delta after settling | 180,767 bytes | 232,958 bytes |
| DOM elements | 400 | 400 |

The stronger contract costs about 261 extra heap bytes per Avatar in this sample, and the
update batch is slower. These are local observations, not speed guarantees. The renderer
retains content identity and creates no duplicate model/DOM tree; payload ceilings pass.

## Original migration record

The checklist and 2026-09-08 results below describe the previous retained implementation,
not the renamed API. The canonical migration removes the aggregate's basic registration and
the old class/attribute aliases.

- [x] Map image/default/fallback/loading features to native HTML and documented scope.
- [x] Add standalone Custom Elements without changing the legacy default bundle.
- [x] Preserve authored nodes and clone only explicit inert templates.
- [x] Implement external CSS for size, shape, state and grouping.
- [x] Implement bounded fallback, live attributes, pre-upgrade properties and reconnect cleanup.
- [x] Implement native group overflow with preserved order and identities.
- [x] Add separate classic HTML, CSS and JavaScript demonstration files.
- [x] Record final unit/build and browser acceptance results, then update accepted rows to Verified.

### Original acceptance

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

## Current documentation

[Read the current demo and API](../../../demo/components/avatar.html).
