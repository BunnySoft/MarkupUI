# Config Provider: native scoped composition

**🟢 Verified retained capabilities, with no new library runtime.** A native ancestor,
external author CSS, `lang`/`dir`, and explicit existing helper options supply the useful
configuration scope. A provider/context manager would duplicate the browser's cascade and
hide service ownership. As with [Discrete](discrete.md), this is a tested **application
composition recipe**, not an API-compatible framework component.

There is **no** ConfigProvider class, config-root registration/helper, provider injection,
`@dataengine/markup-ui/config-provider` export, distributed ConfigProvider JS/CSS bundle
or new byte budget. The separate [HTML](../../demo/components/config-provider.html),
[CSS](../../demo/components/config-provider.css) and [JS](../../demo/components/config-provider.js)
demo files are application examples. `mountExample(root)` is local demo wiring for its
three existing Loading Bar owners and controls, **not a public MarkupUI API**.

## HTML and CSS own scope

```html
<!-- Application HTML; settings do not require a wrapper custom element. -->
<section class="project-night" lang="en" dir="rtl">
  <h2>Project workspace</h2>
  <section>
    <!-- No local palette: inherits the actual ancestor's tokens. -->
    <mui-card data-mui-card>
      <div data-mui-card-content>Authored native content</div>
    </mui-card>
  </section>
</section>
```

```css
/* Application stylesheet, loaded after the chosen component styles. */
.project-night {
  color-scheme: dark;
  --mui-bg-surface: #172b35;
  --mui-text-primary: #eef5f4;
  --mui-border: #88aaa9;
  --mui-color-primary: #91d8c2;
}
```

Load Card's existing external stylesheet explicitly. Semantic `section`, `main`, `div`,
or an existing suitable ancestor is chosen by the author, not a dynamic `tag` renderer.
Using the existing ancestor instead of adding a wrapper replaces the useful `abstract`
intent; it does not create a context without a DOM inheritance relationship. Native
children remain children, not Vue slots or light-DOM slot projection.

### Palette decisions and cascade

The demo's `data-example-palette` is an **application-only selector**, with these policies:

| Choice | Actual behavior |
| --- | --- |
| no attribute | No local theme declaration; inherit ancestor custom properties and color-scheme |
| `light` | Explicit author light token subset and `color-scheme: light` |
| `dark` | Explicit author dark token subset and `color-scheme: dark` |
| `system` | Explicit light subset, switched by external `prefers-color-scheme: dark` CSS |
| `native` | `Canvas`/`CanvasText`/`ButtonBorder`/`Highlight`/`HighlightText`; `color-scheme: normal` leaves default UA policy, not automatic dark matching |

This original five-token subset is **not** another copy of the legacy full light/dark
palettes. It verifies only the consumers used here:

- Card consumes shared `--mui-bg-surface`, `--mui-text-primary` and `--mui-border`.
- Primary Button consumes `--mui-color-primary` and its `--mui-button-contrast` hook.
- Loading Bar has its own supported tokens. The demo explicitly bridges its background,
  text, track and progress color **on each Loading Bar consumer**, so references resolve
  against that consumer's inherited tokens. No library-wide token adapter is implied.
- The authored native dialog uses ordinary CSS background/text/border declarations.

Other component hooks, states, hover colors and JS-direction behavior require their own
contracts and tests. Setting shared tokens does not establish all-component theme parity.
`color-scheme` affects supporting UA surfaces; it is not a component palette generator.

Nested scopes without a palette never reset to light. Removing an explicit palette
attribute reveals the cascade again; moving a native subtree changes its actual ancestors.
Local author classes/custom properties and inline declarations retain normal precedence.
An inline token on an ancestor is inherited, but a declaration on a descendant can override
that inherited value; inline style does not outrank a closer descendant declaration.
No promise is made that a palette selector can override inline tokens on the **same** node.
Use normal cascade layers, specificity and source order deliberately. No token reset,
stylesheet injection, body reset, storage persistence or global theme subscriber is added.

Responsive layout is likewise author CSS: the demo uses a normal one-column layout and
an explicit `56rem` media query for two columns. There is no injected breakpoint map,
automatic upstream Grid breakpoint naming, or JS viewport context.

## Language, direction and explicit options

`lang` is a language hint used by browsers and assistive technology. It **does not translate**
authored text, choose a framework locale dictionary, or guarantee the operating system's
date/time picker language. Correctly mark the language of actual text; the demo's English
explanations have `lang="en"` even when its outer hint is changed experimentally.
`dir` and logical CSS provide native writing direction; they do not make every JS helper's
keyboard logic automatically reactive.

```js
import { createLoadingBar } from "@dataengine/markup-ui/loading-bar"

const work = createLoadingBar(document.querySelector("#work"), {
  finishDelay: null,
  labels: {
    idle: "En attente", loading: "Chargement",
    success: "Terminé", error: "Échec"
  }
})
work.start()
work.setProgress(25)
// Before the application removes this host:
work.disconnect()
```

Author a named native progress/status host as specified by [Loading Bar](loading-bar.md);
mark the supplied French status text's language appropriately. These are ordinary explicit
options, not injected defaults. Loading Bar snapshots its labels and has no update-labels
method: the demo disconnects and recreates **only its outer owner** to change them.
The modal and sibling labels remain unchanged. For other helpers use their documented
`refresh`/update methods where supported, or an explicit ownership-safe reconstruction.
Changing an ancestor attribute alone does not call any helper method.

No `DateLocale`, date-fns formatting/parser engine, timezone conversion, date dictionary,
KaTeX or highlight.js adapter is installed. Use native date/time values and controls
within their existing contracts, or explicitly selected native `Intl` formatting in
application code. The demo does not claim to exercise OS picker UI or a translation engine.

## Hosts, top layers, documents and lifetime

Custom properties inherit by **actual DOM ancestry**, not the call site that creates a
service. A native dialog promoted by `showModal()` retains its original ancestors and
therefore its scoped tokens and direction. The demo's third progress host lives inside
that dialog, while the separate light sibling's host remains outside. Outside hosts
neither acquire the dark scope nor jump above native modality with a high z-index.

For template-based owners, author the owner host in the intended scope and instantiate
the trusted template into that host. Inert template content is not an active styled scope;
its eventual DOM placement is decisive. There is no portal manager, automatic namespace
forwarding, context-copying teleport, hidden body mount or global renderer.

An iframe/another document has its own HTML attributes and stylesheet links. It does not
inherit the embedding document's custom properties or share a provider. Explicit owners
retain their existing same-document restrictions; this resolution adds no cross-document
service transport, SSR renderer, hydration switch or app-level configuration.

The demo's Disconnect action aborts its listeners, closes its own native dialog, disconnects
its three progress owners, restores their authored progress/text, and leaves chosen
palette/lang/dir and author overrides in place. Its explicit French status-language
adjustment is restored only if still owned. It moves focus before hiding its controls.
Repeated disconnect is harmless; dispose before removing application-owned hosts.
CSS-only scopes need no disposal API. Removing a scope does not clean up unrelated services.

## Exact retained and omitted mappings

The [pinned reference tracker](../naive-ui/components/config-provider.md) preserves every
original **95 owner/name/kind/source identity** (14 public table rows and 81 declarations).
There are **22 explicit source supplements**, including the source-only default slot,
five undocumented/deprecated props and typed theme/RTL/injection boundaries:
**117 rows = eight adapted capabilities + 109 explicit omissions, zero unresolved**.

| Reference surface | Disposition |
| --- | --- |
| `abstract`, `tag`, source `default` slot | 🟢 Native existing ancestor/author-chosen element/real child nodes, not a wrapper renderer |
| `breakpoints` | 🟢 Explicit author media queries, no provided breakpoint object |
| `locale` | 🟢 Narrow language hint + authored words/explicit supported labels; locale objects and translation are not retained |
| `theme`, `theme-overrides` | 🟢 Scoped CSS token choices and cascade overrides; no upstream object merge or null-clearing semantics |
| source-only `rtl` | 🟢 Native `dir`/logical CSS for demonstrated consumers; not the source `RtlProp` array/style graph |
| `date-locale`, `katex`, source `hljs` | ⏭️ No formatter/dictionary/math/highlighter provider adapters |
| `cls-prefix`, `namespace`, `style-mount-target`, `inline-theme-disabled` | ⏭️ No class rewriting, detached context or style-engine mount controls; explicit scoped CSS/hosts instead |
| `preflight-style-disabled` | ⏭️ No provider preflight toggle; this recipe installs no global reset; Global Style is a separate opt-in scope |
| `component-options`, all 81 original `GlobalComponentConfig` declarations (including Pick-expanded Empty fields), source `bordered`/`icons` | ⏭️ No defaults injection or VNode render callbacks; author each control's supported attributes/options/content |
| source deprecated `as` and framework/type graph supplements | ⏭️ No alias renderer, Vue prop extractor, common-theme object graph, component-theme map, injection refs, CSS-render RTL descriptors or VNode icon factory bag |

Typed `GlobalTheme.common`, per-component override keys, theme `name` and custom-common
extension interfaces remain **omitted types**, not aliases for `ThemeTokens`. Native CSS
capability acceptance does not imply structural/type compatibility with any of them.
No fictional general SSR/hydration prop is added to the inventory: none appears in the
pinned provider props. Framework style/renderer integration is excluded, ordinary
server-authored HTML and linked CSS need no provider or hydration runtime.

## Legacy compatibility and CSP

The unchanged [legacy theme API](../../src/theme/index.ts) still supports
`theme.register(name, tokens)` and `theme.apply(name, root)`. `apply` writes inline
`--mui-*` tokens and `data-mui-theme`, does not persist, and does not broadcast the
`set` subscription event. `theme.set` retains its existing localStorage/global-subscriber
behavior; this demo never calls it. Neither API now recognizes the demo palette selectors.
Their legacy ownership/replacement behavior is unchanged, not a new restoration promise.

Strict-CSP consumers can use external component/author styles and the demo's attribute/
native DOM wiring without inline styles. The optional legacy aggregate still installs
styles, and legacy `apply` writes inline tokens; **it is not the strict-CSP path**.
The separate CSP browser run did not import the aggregate or execute the inline-override
compatibility probe. Component-specific dynamic positioning/measurement exceptions
remain documented in those components, not silently waived here.

## Four migration tasks and acceptance — 2026-09-10

1. [x] Define native inheritance: actual ancestors, external tokens, nested/independent scope and author overrides.
2. [x] Reconcile legacy theme APIs with explicit light/dark/system/native author policies and CSP boundaries.
3. [x] Resolve all original provider/type rows plus source supplements, without a context/style/renderer framework.
4. [x] Verify scoped presentation, lang/dir versus explicit labels, native modal hosts, independent documents and teardown.

- **86 tests passed**: 12 composition tests, 47 Loading Bar and 27 native/legacy tests:
  `npm test -- --run tests\config-provider.test.ts tests\loading-bar.test.ts tests\native.test.ts`.
  Tests cover no new exports/runtime, no-JS anatomy, label snapshots/recreation, independent
  roots, setup-failure cleanup, stable nodes/listeners/current input values, author changes,
  idempotent cleanup, focus handoff and no storage writes.
- **`npm run build` passed**, including declarations and all existing budgets.
  All **1,142 pre-existing distribution files byte-match** after rebuilding.
- Catalog audit confirms **3,937 rows, 324/384 accepted tasks and 81/96 accepted pages**.
  All **95 original Config Provider identities** are preserved, all 117 current rows
  resolved, and all **567 scoped canonical/reference/index/master relative file links**
  resolve. P0 remains eight adapted/110 omitted/one unresolved across 119 rows, with
  only four of twelve page tasks accepted.
- Chromium computed actual Card/Button/Loading Bar appearances, nested inheritance,
  explicit nested light/reset-to-inherit, author class and inline precedence, native
  attributes, logical RTL and unchanged sibling scope. System media changes switched
  external CSS without JS theme listeners; native system colors remained readable.
- Native modal `:modal`, DOM parent, autofocus, Escape and `method="dialog"` close passed.
  Modal-local hosts inherited dark tokens/RTL; outside hosts retained their own scope.
  Reparenting a nested native scope changed its inherited token source, then restored it.
- **320px**, **2x CSS zoom**, forced-colors contrast and separate-document CSS/dir passed.
  Disconnect restored native progress **25/40/60**, left zero owned loading states,
  safely moved focus and preserved authored configuration.
- Strict policy `default-src 'none'; script-src 'self'; style-src 'self'` (with explicit
  local image/base/form directives) allowed palette/label/native-dialog operations with
  **zero inline styles/style nodes and no CSP console errors**.
- Script-blocked reload retained dark nested CSS, native buttons/date input/progress and
  hid enhanced controls. A separate legacy aggregate/import and `theme.register/apply`
  check preserved scoped Card styling and respected its inline primary override.

No new package/build/source asset or budget was warranted. Existing demo consumers cost
Button CSS **1,837**, Card CSS **1,512**, Loading Bar JS **2,627** and CSS **826 gzip bytes**
(**6,802 combined**, excluding this example's HTML/CSS/JS). Those are existing assets,
not a new config bundle. Core/advanced/widgets remain **14,611/2,181/2,779 gzip bytes**
under **15,000/3,000/4,000**. Runtime dependencies remain zero.

The **application example**, not a new library distribution, costs:

| Demo file | Raw bytes | gzip bytes (level 9) |
| --- | ---: | ---: |
| HTML | 5,853 | 1,783 |
| External author CSS | 3,022 | 972 |
| Application JS | 3,608 | 1,274 |
| Total example overhead | 12,483 | 4,029 |

Including its four chosen existing assets gives **10,831 gzip bytes** for the full
example's HTML/JS/CSS. No fonts, images, network service or new aggregate are required.

Evidence is scoped Chromium/native behavior, not all-browser/AT, picker localization,
complete state/theme parity or framework compatibility. No storage, clipboard, picker
opening, OS notification, external network or persistence side effect was exercised.
**Next: Element, then Global Style, before P6. P0 is not complete.**
