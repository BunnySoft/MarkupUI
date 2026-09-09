# Element: author the native element

**🟢 Verified native composition, not a new wrapper or runtime.** The useful Element
capabilities are already supplied by HTML and CSS: choose the correct tag, keep real
children, and consume explicitly available inherited custom properties. A synthetic
tag factory or custom element would obscure semantics and add code without a capability.

There is **no** `NElement`/`NEl` equivalent constructor, `mui-element` registration,
`@dataengine/markup-ui/element` export, Element JS/CSS distribution, or new budget.
The separate [HTML](../../demo/components/element.html),
[CSS](../../demo/components/element.css), [JS](../../demo/components/element.js) and
[tests](../../tests/element.test.ts) are an executable **application composition recipe**.
`connectExample(root)` is local demo event wiring, not a public enhancement API.

## Semantics come from the actual HTML

```html
<section aria-labelledby="workspace-title">
  <h2 id="workspace-title" class="workspace-title">Workspace</h2>
  <p>Keep this <strong>authored emphasis</strong>.</p>
  <a href="#workspace-notes">Read notes</a>
  <button type="button">Run a local action</button>
</section>
```

Choose a native heading, link, button, list, fieldset/legend, label, input or other suitable
element directly. A heading is not a div with a `tag` attribute. A link with a real href
is not a clickable span. Native buttons supply their keyboard activation; do not add
duplicate Space/Enter handlers or redundant button/link/heading roles.

The pinned source renders its selected tag with `role="none"`. **That automatic role
assignment is intentionally omitted**: this recipe keeps native semantics instead of
potentially removing them. Add ARIA only when it describes real authored relationships
or needed accessible names. The demo has an article named by its actual h3, labels
associated with their native inputs, a native fieldset/legend and native output elements.

Original default-slot content becomes real child nodes, not Vue callbacks, VNodes,
Shadow DOM projection or a template evaluator. There is no upgrade wait for native HTML.
Changing a palette/dir/hidden attribute does not replace a tag, subtree, input, text node
or author listener. If the desired semantics change, author appropriate HTML deliberately;
this resolution offers no runtime tag-swapping API or arbitrary prop forwarding.

## Styling uses explicit tokens and the normal cascade

```css
/* Application CSS, not a library Element utility. */
.workspace-title {
  color: var(--mui-color-primary, CanvasText);
}
```

Use supported shared `--mui-*` properties from an actual ancestor, or author your own
local CSS. The demo consumes `--mui-bg-surface`, `--mui-text-primary`, `--mui-border`,
`--mui-color-primary` and `--mui-button-contrast`; native system colors are its honest
fallbacks outside a configured scope. No provider is created by styling a native element.

The demo links the **unchanged application stylesheet** from the accepted
[Config Provider composition](config-provider.md), reusing its light/dark/system token
subsets and local accent override. It does not copy a second palette, import that demo's
JS or turn its application selectors into public package APIs. Its own Element stylesheet
defines no token set and no document-wide reset. Global Style remains a separate scope.

- A nested section with no palette declaration inherits from its actual ancestor.
- An explicit nested light choice overrides that ancestor; removing it exposes inheritance.
- A sibling outside the configured section does not acquire the section's tokens or dir.
- An inline ancestor token is inherited, but a local descendant declaration still wins
  over that inherited value. Same-node declarations obey normal cascade precedence.
- `prefers-color-scheme` changes the existing system palette through CSS. No JS theme
  subscriber, polling, stylesheet injection or hidden configuration graph is involved.
- `lang` describes actual content language, not translations; `dir` controls native
  direction and logical layout, not all third-party/helper keyboard behavior.

Pinned Element source derives **unprefixed kebab-case variables** from its common theme
object (for example `--primary-color`), rather than automatically supplying MarkupUI
tokens. This recipe does **not** generate those aliases, copy every common variable,
map arbitrary `--n-*` names, or implement `useThemeVars`. The accepted capability is
explicit native CSS-variable consumption, not compatibility with that theme object.
Computed heading/button/surface appearances were tested; metadata alone is not theme
or accessibility acceptance, and other components/states retain their own contracts.

## Native actions and a local-only form example

The application attaches ordinary `addEventListener` callbacks to its existing button,
selects and form. Native button activation increments a native output. Native links follow
local fragments, including a deliberately focusable heading target. Native details/summary
works without any script.

The form has labelled required title/email fields, a native checkbox, a disabled fieldset
and native Reset. It deliberately has **no submit button**. Its two enabled text-entry
controls block implicit no-button submission in the tested native path; this property
depends on the authored form anatomy, not a universal network-prevention feature.
No-JS editing, Enter, reset and disclosure were verified.

When JavaScript is active, a separate `type="button"` preview action calls native
`requestSubmit()`. Browser constraints run first; the form's submit listener prevents
navigation and writes `FormData` entries as **literal output text**. Disabled controls and
unchecked checkboxes are excluded by native FormData semantics. No fetch, hidden value
proxy, storage, clipboard, backend or OS service is involved.

This is a local demonstration, **not** a reusable form controller, submit policy or
validation framework. If an application changes the form anatomy, adds a submit button,
submits programmatically after disconnect, or needs server submission, it must explicitly
own that policy. The example does not cancel unrelated application actions.

Disconnect aborts only the example's listeners, moves focus before hiding its optional
controls, and leaves native nodes/current values/defaults, other listeners, disclosure/
hidden state, palette choices and author overrides intact. Repeated disconnect is harmless.
Native-only styling/content needs no lifecycle API; call disconnect before removing this
demo's application root when using its optional listeners.

## Existing MuiElement is a different API

The unchanged [abstract MuiElement base](../../src/core/element.ts) provides protected
custom-event emission and finite numeric-attribute parsing to existing controllers.
It is **not** a general wrapper, automatic theme-variable producer, native tag renderer
or an alias for Naive UI's NElement/NEl/El. Nothing here changes its existing subclasses,
registration conventions or event contracts.

A separate legacy aggregate compatibility check preserved the native input/text-node
identities and real heading semantics; no `mui-element` became registered.
Legacy `theme.register/apply` still writes inline tokens with normal cascade behavior.
That aggregate's style installation and inline token writes are **not** the strict-CSP
path; the normal demo loads only external application CSS/JS.

## Pinned API dispositions

The [reference tracker](../naive-ui/components/element.md) retains both original public
owner/name/kind/source identities and adds **ten source supplements plus three explicitly
source-inherited props**: **15 rows = three adapted capabilities + twelve omissions**.

| Surface | Resolution |
| --- | --- |
| `Element Props.tag` | 🟢 ADAPTED: author the native semantic tag; dynamic prop/renderer omitted |
| `Element Slots.default` | 🟢 ADAPTED: actual authored child nodes; no callback/projection |
| source `cssVars` capability | 🟢 ADAPTED: explicit supported CSS variable consumption; common-theme alias generator omitted |
| inherited `theme`, `themeOverrides`, `builtinThemeOverrides` | ⏭️ No theme object/peer merge injection; use the native cascade |
| `ElementProps` | ⏭️ No Vue public-prop extractor/type export |
| `NEl`, internal `El` alias | ⏭️ No factory aliases, registration or wrapper |
| renderer `role`, generated `class`, `themeClass / onRender` | ⏭️ No forced presentation role, class-prefix generation or render-time theme/style mounting |
| `ElementThemeVars`, `ElementTheme`, `ElementThemeOverrides` | ⏭️ No upstream theme interfaces or implicit complete common light/dark variable set |

Source supplements cite Element.ts, its public index/style types and the explicitly
spread `useTheme.props`; they are not invented English-table APIs. Existing CSS defaults
and native HTML are not falsely exposed under those omitted type/export names.

## Four tasks and acceptance — 2026-09-10

1. [x] Map tag choice to actual semantic HTML and omit dynamic tag rendering/forced roles.
2. [x] Preserve authored children, listeners, native values, attributes and relationships.
3. [x] Demonstrate inherited/local tokens without a second palette or provider/style runtime.
4. [x] Verify native semantics/actions/forms, scope/media/CSP/no-JS and legacy coexistence.

- **51 tests passed**: 12 Element composition, 12 Config Provider composition and 27
  native/legacy tests:
  `npm test -- --run tests\element.test.ts tests\config-provider.test.ts tests\native.test.ts`.
- **`npm run build` passed**, including declarations and every existing budget.
  **All 1,142 pre-existing distribution files byte-match**; no source/package/build change.
- Catalog audit preserves both original Element owner/member/kind/source identities,
  resolves all 15 current rows, and verifies all **541 scoped canonical/reference/index/
  master relative file links**. Retained P5 stays at 827 rows/349 adapted/478 omitted/
  zero unresolved/40 tasks.
- Chromium verified real heading/group/link/button roles, fragment navigation/focus,
  Space/Enter activation, labelled native fields, invalid-field focus, local valid
  submission, actual FormData exclusions, native reset and literal preview output.
  Named article/output relationships passed; request observation recorded **zero requests**
  during local direction/preview actions.
- Computed native heading/button/surface appearances passed inside/outside/nested scopes,
  explicit light removal, author/inline precedence, RTL and live system media changes.
  Stable input/text nodes and independently attached listeners survived palette changes
  and disconnect; native reparenting switched inherited colors/direction and preserved the
  same input. Hidden content stayed out of layout and native disclosure retained state.
- **320px**, **2x CSS zoom**, forced-colors contrast, reduced-motion preference and print
  checks passed; print uses normal flow and hides optional demo controls.
- Strict CSP `default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none';
  form-action 'none'` allowed palette/preview operations with **zero inline style nodes/
  attributes, zero forced presentation roles and no CSP console errors**.
- Script-blocked reload retained styled native content; editing/Enter/reset/disclosure
  worked without navigation or an Element upgrade. Separate legacy import/apply retained
  native nodes, semantics and supported inline token precedence.

Only scoped Chromium behavior is claimed, not all-browser/AT certification, every Naive
theme variable, automatic locale/reactive context or every component's appearance parity.

### Asset accounting

No library Element asset or budget was created. The full application example costs:

| File | Raw bytes | gzip bytes (level 9) |
| --- | ---: | ---: |
| Element HTML | 4,875 | 1,791 |
| Element application CSS | 1,761 | 576 |
| Element application JS | 2,284 | 845 |
| Reused configuration application CSS | 3,022 | 972 |
| Total example | 11,942 | 4,184 |

The normal page imports **no library JavaScript**. Core/advanced/widgets remain
**14,611/2,181/2,779 gzip bytes** under **15,000/3,000/4,000**; all previous helper
assets/budgets and runtime dependencies (zero) are unchanged.

Catalog after this resolution: **3,950 rows / 328 of 384 tasks / 82 of 96 accepted pages**.
P0's three catalog pages contain **132 rows: eleven adapted, 121 omitted, zero unresolved**,
but only **eight of twelve tasks** are accepted. Global Style has zero API rows and still
needs four tasks; broader architectural gates remain independent.
**Next: Global Style. P0 is not complete; no Global Style implementation is included here.**
