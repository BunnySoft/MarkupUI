# Delivered foundations and compatibility boundaries

**Status: 🟢 Verified for the retained native architecture.** The
[catalog](index.md) resolves 96 component scopes and 384 component tasks. Its 4,058
API rows distinguish **2,111 native mappings** from **1,947 explicit omissions**.
That is not a claim that every Naive UI API, renderer or visual effect was copied.

This record closes P0-01 through P0-09 with actual source separation, loading contracts,
per-component evidence and explicitly retained legacy behavior.

## Authoring sources and generated compatibility adapters

| Maintained source | Generated adapter | External distribution |
| --- | --- | --- |
| [`src/components/styles.css`](../../src/components/styles.css) | `src/components/styles.ts` | `dist/markup-ui.css` |
| [`src/plugins/advanced.css`](../../src/plugins/advanced.css) | `src/plugins/advanced.styles.ts` | `dist/markup-ui-advanced.css` |
| [`src/plugins/widgets.css`](../../src/plugins/widgets.css) | `src/plugins/widgets.styles.ts` | `dist/markup-ui-widgets.css` |
| [`src/theme/presets.json`](../../src/theme/presets.json) | `src/theme/presets.ts` | `dist/markup-ui-themes.css` |

Edit the CSS/JSON sources, **not the generated TypeScript adapters**. The existing
`pnpm build` regenerates adapters through
[`scripts/legacy-styles.mjs`](../../scripts/legacy-styles.mjs) before TypeScript compilation.
Adapters are checked in so ordinary source imports/tests remain available after checkout;
they are generated compatibility data, not a second maintained stylesheet or palette.
Generation normalizes checkout line endings and does not rewrite unchanged adapters.

The three extracted runtime CSS strings match their pre-extraction SHA-256 baselines
exactly. Both built-in theme maps preserve all 31 original string tokens and their values.
The adapters retain native JavaScript imports and the old style installers without a
runtime CSS/JSON loader, added runtime dependency or altered visual default.

## Choose a loading mode deliberately

| Mode | Loading contract |
| --- | --- |
| Native CSS-only component | Link that component's stylesheet; author its documented native HTML. There is no invented JS entry or registration. |
| Native helper | Link its CSS, load **one** ESM or classic helper entry, then explicitly bind the documented native DOM and dispose when done. |
| Standalone Custom Element | Link its CSS and load its element entry. For overlapping names, load the richer entry before the legacy aggregate, as its own record requires. |
| Legacy aggregate | `markup-ui.js` / `markup-ui.global.js` still auto-registers core elements and installs generated CSS for backward compatibility. |
| Legacy plugins | Existing ESM plugin installation still registers their legacy elements and installs generated plugin CSS. Their CSS is also available separately. |

There is no universal new bootstrap, provider, DOM scanner or hidden application.
Follow the specific [component record](index.md) rather than assuming that a CSS-only
recipe, native helper and Custom Element use identical APIs.

For example, classic native Input setup uses external files:

```html
<link rel="stylesheet" href="./vendor/markup-ui-input.css">
<script defer src="./vendor/markup-ui-input.global.js"></script>
<script defer src="./app.js"></script>
```

In `app.js`, after authoring the native structure from the
[Input contract](../components/input.md):

```js
const field = MarkupUIInput.createInput(document.querySelector("#subject-field"));
field.setValue("A silent programmatic update");
// On application teardown:
field.disconnect();
```

The ESM equivalent imports `createInput` from `@dataengine/markup-ui/input` or the
served `markup-ui-input.js` URL. Do not load both runtime formats together.

The new legacy presentation exports are:

```text
@dataengine/markup-ui/style.css
@dataengine/markup-ui/advanced/style.css
@dataengine/markup-ui/widgets/style.css
@dataengine/markup-ui/themes.css
```

CSS alone does not implement custom-tag behavior. Loading external legacy CSS **and**
the auto-installing aggregate is supported, but duplicates the presentation payload;
it is not a smaller or strict-CSP replacement for choosing native optional entries.
No fictitious CSP-safe version of the legacy aggregate is advertised.

## Native stylesheet themes

Link `markup-ui-themes.css` and use `data-mui-theme="light"` or `"dark"` on the root
or a scoped ancestor. Tokens inherit through real DOM ancestry. The stylesheet supplies
native `color-scheme` and the same palette data used by the legacy API. Root selectors
take precedence over the legacy aggregate's later default `:root` rules.

```html
<link rel="stylesheet" href="./vendor/markup-ui-themes.css">
<section data-mui-theme="dark" class="surface">...</section>
```

In application CSS:

```css
.surface {
  color: var(--mui-text-primary);
  background: var(--mui-bg-surface);
}
```

Native HTML `lang`/`dir`, explicit helper labels/options and ordinary media queries
remain the context model. Theme attributes do not translate text, rewrite every helper's
options or move context across unrelated DOM roots. Author inline values still win by
normal cascade. Custom themes can remain author stylesheet rules or explicit existing
`theme.register` calls; this is not a new provider graph.

**Retained compatibility:** `theme.apply` / `theme.set` still write inline custom
properties; `theme.set` still has its existing persistence behavior. The new external
preset path neither calls them nor writes storage. Use the external path when inline
style mutations or persistence are unwanted. These legacy methods were not silently
changed or claimed to satisfy strict CSP.

## Native data, forms and ownership

The per-component contracts define actual adoption, template cloning, supported controls,
live attributes, defaults and disposal. New native helpers preserve their authored
controls and declared ownership. Legacy basic wrappers keep their original behavior;
they are not transparently converted into the new helper implementations.

Native fields own editing, IME, selection, checkedness, defaults, constraints, fieldsets,
reset and successful FormData controls. Helpers do not fabricate user events from ordinary
programmatic setters; native events such as `toggle`, `scroll` and reset still follow their
documented browser semantics. Explicit user helper actions have their own stated event
sequence. There is no universal replacement event payload.

[Form](../components/form.md) coordinates native validity and separately owned custom
feedback. Custom failures require explicit application submission gating; no implicit
schema engine or hidden network submit is added. Group limits, virtualized unmounted
controls, filtered table rows and Transfer membership have their own real FormData and
validation boundaries. See their component records rather than assuming that every
visible widget is an automatically successful form field.

Multiple helpers may coexist only within their declared attribute/token/control ownership.
An ownership error is not permission to bind a second controller and hope it wins.
Native templates do not imply an expression language, VNode renderer or automatic
deep-model serialization.

## Payload and browser evidence

`dist/manifest.json` keeps per-asset bytes, gzip bytes and budgets. It now also includes
`componentPayloads`: each actual component's CSS and, when present, its ESM/classic
runtime plus CSS total. CSS-only scopes have no fabricated runtime records. Recipe-only
resolutions have no fabricated distribution assets.

Select **one** runtime mode and its documented CSS. Composed CSS is already accounted for
in that asset. Sum the files the application really loads; do not add ESM and classic as
though both were required, ignore repeated embedded helper code across independent
bundles, or call moving bytes from JavaScript to CSS a payload reduction.

The later Button motion audit keeps canonical CSS readable while applying the existing
esbuild whitespace-only transform to **Button's distributed stylesheet only**. Syntax
minification is disabled; other standalone copies, composed CSS and legacy adapters keep
their existing build paths. The manifest measures the actual output against the unchanged
2,500-byte Button CSS ceiling. This adds no runtime dependency or consumer build step.

The following figures describe the historical foundation checkpoint, not later visual-audit
payloads; use the current manifest and individual style reports for those.

| Foundation asset | Gzip bytes | Ceiling |
| --- | --- | --- |
| Legacy core JavaScript | 14,633 | 15,000 |
| Legacy advanced JavaScript | 2,183 | 3,000 |
| Legacy widgets JavaScript | 2,782 | 4,000 |
| External core CSS | 4,814 | 6,000 |
| External advanced CSS | 588 | 1,000 |
| External widgets CSS | 895 | 1,500 |
| External light/dark presets | 631 | 1,500 |

The small JavaScript byte changes come from module/source reorganization; runtime CSS
and palette values are unchanged. No previous ceiling was increased.

Chromium acceptance of [the foundation demo](../../demo/foundations.html) covered external
light/dark/nested presets, root theme precedence after loading the legacy entry, author
overrides, disabled preset links, real legacy plugin registration/behavior and all three
injected CSS hashes. An isolated JavaScript-disabled context with `script-src 'none'`
and external-only `style-src 'self'` rendered the presets with **zero inline styles or
style tags**. The legacy auto-installer is deliberately not part of that strict-CSP claim.

Browser support is capability-based and component-specific. Development browser evidence
is Chromium, not certification of every Firefox/Safari/assistive-technology version.
The build's ES2022 target is not a browser-support promise. Individual records document
native feature detection, static fallbacks, geometry limits and unverified native picker
UI. No runtime polyfill is installed or fetched.

### Final validation record

The final existing-suite run used `pnpm build` followed by
`pnpm exec vitest run --maxWorkers=4 --minWorkers=1`: **98 test files and 3,372 tests passed**.
The worker ceiling limits concurrent validation load; no new runner or dependency was added.
All four checked-in compatibility adapters also regenerated without content or timestamp drift.

The independent catalog/export/link audit found **96 pages, 4,058 API rows, 384 accepted
component tasks, 235 existing export targets, 2,162 local links and 40 heading fragments**.
Its table parser includes both inline-source links and named-source/reference table formats.
The source-generation/native compatibility tests additionally cover exact stylesheet and
preset hashes, external assets, malformed palette data and combined payload accounting.
An independent read-only source review found no significant issues in the foundation
changes. No previous bundle ceiling was relaxed.

## P0 acceptance ledger

| Task | Accepted evidence and boundary |
| --- | --- |
| P0-01 | Canonical legacy CSS files, generated compatibility adapters and exact pre-extraction runtime hashes; optional components already use external CSS. |
| P0-02 | Actual CSS-only, helper, Custom Element and legacy loading contracts above; preserved legacy auto-install behavior, not a fake replacement entry. |
| P0-03 | Per-component adoption/template/lifetime contracts and native examples; legacy wrapper behavior explicitly retained. |
| P0-04 | Per-component parsing/current-default/event contracts, native control tests and no invented universal event protocol. |
| P0-05 | Native form/fieldset/default/reset/validity ownership and explicit custom-validation/serialization boundaries. |
| P0-06 | One maintained built-in palette source, generated external presets, scoped native configuration and retained inline legacy API. |
| P0-07 | Unchanged previous ceilings, new CSS ceilings and machine-readable per-component JS+CSS accounting. |
| P0-08 | All 96 scopes, 384 tasks and 4,058 named API dispositions reconciled; omissions are not implementation credit. |
| P0-09 | Native platform decisions and per-component fallback/evidence limits; no provider, generic renderer or polyfill stack. |
