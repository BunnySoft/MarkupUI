# Layout and companion regions

**Migration status: 🟢 Verified for the retained native scope.**
Layout, Content, Header, Footer and Sider are CSS-only compositions of ordinary HTML.
There is no component controller, registration, provider, custom scrollbar or generated
application shell.

## Default-style audit — 2026-09-10

The [isolated light/dark audit](../style-audit/components/layout.md) corrects body,
content, header, footer, sider, embedded and inverted colors without changing
native layout/disclosure/scroll behavior. Region-specific defaults now follow the
reference rather than unrelated shared primary-text/surface/border roles.
Inverted presentation no longer overwrites inherited public author tokens.

**16 focused tests pass.** All **96 scoped rendered comparisons** matched the
checked colors/outer dimensions; collapsed disclosure height and internal scrollbar/
border anatomy remain intentionally different. Source CSS is **4,930 raw / 1,051
gzip bytes**, below the unchanged **1,500-byte ceiling**. The coordinator's isolated
release build and all **16 Layout tests** pass; no other component or shared source changed.

## Distribution and references

| Asset | Purpose |
| --- | --- |
| `src/components/layout/layout.css` | Maintained scoped CSS. |
| `dist/markup-ui-layout.css` | Browser stylesheet. |
| `@dataengine/markup-ui/layout/style.css` | Stylesheet-only package export. |
| `demo/components/layout.html`, `.css`, `.js` | Native shell, disclosure, scroll and application-action examples. |

Link the stylesheet normally. There is no `./layout` JS export, ESM/classic runtime/global,
or registration-order restriction. The stylesheet can coexist with the unchanged legacy
aggregate; its structural `mui-*` elements are not silently redefined.

Pinned Naive UI reference: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
The [public API](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/demos/enUS/index.demo-entry.md)
and [Header source](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/src/LayoutHeader.tsx)
inform the contract. Header's
[positioning stylesheet](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/layout/src/styles/layout-header.cssr.ts)
confirms top positioning despite the reversed Header/Footer descriptions in the public table.
The [reference tracker](../naive-ui/components/layout.md) preserves every original owner and row.

## Native anatomy

```html
<link rel="stylesheet" href="./vendor/markup-ui-layout.css">
<div class="mui-layout">
  <header class="mui-layout-header" data-bordered>Application header</header>
  <div class="mui-layout" data-has-sider>
    <details class="mui-layout-sider" open data-bordered>
      <summary>Menu</summary>
      <nav aria-label="Project navigation">
        <a href="./overview.html">Overview</a>
      </nav>
    </details>
    <main class="mui-layout-content">
      <h1>Overview</h1>
      <p>Native application content.</p>
    </main>
  </div>
  <footer class="mui-layout-footer" data-bordered>Application footer</footer>
</div>
```

Use `main` only for the actual main landmark. Nested regions can be ordinary `div` or
named `section` elements; CSS does not manufacture banner, heading or navigation roles.
Content, links, labels, controls, templates and listeners remain author-owned. No nodes
are moved, cloned or replaced. Header/Footer remain fixed-size flex regions; content fills
remaining space without forcing a viewport height.

`data-has-sider` changes a shell from column to row. Place an end-side Sider **after** content
in DOM order and add `data-side="end"` for its border/absolute-position edge. This uses
logical start/end, not a visual reversal that contradicts reading and Tab order. An
application that needs physical left/right behavior must choose its markup and direction
explicitly.

## Disclosure, scrolling and positioning

An optional `details.mui-layout-sider` supplies a real focusable `summary` and native
open/closed behavior. Include `open` for the upstream-like initially expanded state;
omit it for initially collapsed content. A plain `aside.mui-layout-sider` has no disclosure
or generated trigger.

```js
const sidebar = document.querySelector("#sidebar");
sidebar.addEventListener("toggle", () => {
  console.log({ collapsed: !sidebar.open });
});
sidebar.open = false;
```

Native `toggle` is asynchronous and can coalesce rapid changes; it is not a synchronous
Vue update callback. Closing hides the disclosure's content rather than squeezing or
translating focusable navigation off-screen. Width/transform collapse modes, permanently
visible clipped content, bar/arrow-circle generated triggers and transition completion
hooks are intentionally not reproduced. Native summary activation preserves focus on the
trigger. When application code closes a panel containing current focus, move focus to the
summary first; the CSS-only library does not execute application focus policy.

`--mui-layout-sider-width` defaults to `272px` and
`--mui-layout-sider-collapsed-width` to `48px`. Supply CSS lengths, not a JavaScript number
or a unitless attribute. Ordinary CSS validation/inheritance applies; there is no parser.
The closed width affects only native details, not a plain aside.

Apply `mui-layout-scroll` only to a region intended to scroll, and give it an appropriate
height/max-height in application CSS. Name and focus a standalone scroll region when needed:

```html
<section class="mui-layout-scroll activity" tabindex="0"
  aria-labelledby="activity-title">
  <h2 id="activity-title">Activity</h2>
  <!-- Authored activity -->
</section>
```

Its native `scroll` event and `Element.scrollTo(x, y)` /
`Element.scrollTo({ left, top, behavior })` are the API; no `mui:scroll` or wrapper method
is added. Native scrollbars are always used. For explicit smooth scrolling, application
code should honor `prefers-reduced-motion`. Printed scroll regions expand to show content.
Absolute application layouts may need their own print overrides, as demonstrated.

`data-position="absolute"` fills the containing block for Layout/Content, pins Header to
block-start and Footer to block-end, and pins Sider to its logical start/end edge. Establish
a positioned containing block and reserve space for overlays in **application CSS**.
The default is normal flow; there is no automatic offset calculation, fixed height,
scroll trap or hidden viewport state. Native sticky positioning is also application CSS.

Responsive stacking in the demo is an authored media query. It does not toggle `open`,
invent a breakpoint event or implement a controlled-collapse model.

## Appearance and shared-token ownership

Select `data-mui-theme="light|dark"` on an ancestor or the actual layout. No marker
means light. Only private Layout defaults are defined at that boundary; this is
not a theme watcher, body stylesheet or provider. Nested light boundaries reset
the private defaults under dark.

| Role | Light | Dark |
| --- | --- | --- |
| Layout / Content | `#fff` | `#101014` |
| Embedded Layout / Content | `#fafafc` | `#101014` |
| Header / Sider | `#fff` | `#18181c` |
| Footer | `#fafafc` | `#18181c` |
| Normal text | `#333639` | white `.82` |
| Normal borders | `#efeff5` | white `.09` |
| Inverted Header/Footer/Sider | `#001428` | `#18181c` |
| Inverted text / borders | white / `#001428` | white `.82` / white `.09` |

Each actual region resets its own private role selection. For example, normal
Content nested inside an inverted Header keeps body defaults rather than inheriting
the Header's internal inverted color choice.

Public `--mui-layout-background`, `--mui-layout-color` and
`--mui-layout-border-color` remain first-priority overrides, including when inherited
into inverted regions. `--mui-layout-embedded-background` takes precedence over the
generic background token on embedded regions; otherwise the generic token can
override that background too. Public author overrides intentionally inherit until
the application scopes them differently.

The former implicit fallbacks to `--mui-text-primary`, `--mui-bg-surface`,
`--mui-bg-muted` and `--mui-border` are removed: they do not represent all of these
Naive roles. Applications deliberately using those colors should choose their
mapping through local Layout tokens, not assume a global palette migration. No
shared preset is rewritten merely to recolor this shell.

Font family, size and line height remain inherited from application CSS; no global
typography correction is repeated here. The stylesheet also does not change
`color-scheme` or the document background.

## Property and callback scope

The reference page has **42 rows: 32 Verified adapted native targets and 10 Intentionally
omitted contracts**. Shared property names remain separately accounted for by owner there.

| Upstream surface | Native target | Disposition |
| --- | --- | --- |
| `content-class` | Native class/classList on the actual content/scroll region. | 🟢 Verified adapted target; no host forwarding. |
| `content-style` | External scoped CSS. | ⏭️ Runtime style-string/object forwarding omitted. |
| `embedded` | `data-embedded` and the embedded-background token. | 🟢 Verified; no theme-provider mode detection. |
| `has-sider` | Explicit `data-has-sider` row shell. | 🟢 Verified; no child inspection. |
| `native-scrollbar` | Native overflow/scrollbars only. | 🟢 Verified native path; false/custom-scrollbar mode omitted. |
| `position` | Normal flow or `data-position="absolute"`, with author constraints. | 🟢 Verified as described above. |
| `scrollbar-props` | Native scrollbar/scroll-container CSS and attributes. | ⏭️ Custom component configuration omitted. |
| `sider-placement` | Authored DOM order and logical `data-side="end"`. | 🟢 Verified adapted target; no reverse-order algorithm. |
| `bordered` | `data-bordered` on Header/Footer/Sider. | 🟢 Verified logical separators; false means remove the data attribute. |
| `inverted` | `data-inverted` on Header/Footer/Sider, external tokens. | 🟢 Verified appearance; no provider. |
| `collapse-mode` | Native disclosure hides its content. | ⏭️ Width/transform animation models omitted. |
| `collapsed`, `default-collapsed` | Native `.open` / authored `open`, with inverse meaning. | 🟢 Verified adapted state; no controlled/uncontrolled wrapper. |
| `collapsed-trigger-class`, `trigger-class` | Native summary class/classList and `[open]` selectors. | 🟢 Verified styling path; no automatic class forwarding. |
| `collapsed-trigger-style`, `trigger-style` | External summary CSS. | ⏭️ Runtime style-object forwarding omitted. |
| `width`, `collapsed-width` | CSS width tokens with native lengths. | 🟢 Verified; nested layouts can override inherited values. |
| `show-collapsed-content` | Closed disclosure content is hidden. | ⏭️ Visible compressed content mode omitted for a simpler focus-safe model. |
| `show-trigger` | Author details/summary or a plain aside. | 🟢 Verified native choice; generated trigger variants omitted. |
| `on-after-enter`, `on-after-leave` | No automatic transition. | ⏭️ Transition lifecycle callbacks omitted. |
| `on-scroll` | Native `scroll` listener on the scrollable element. | 🟢 Verified; no event alias. |
| `on-update:collapsed` | Native `toggle`, inspect `!details.open`. | 🟢 Verified with native event timing. |
| Default slots | Native authored region children. | 🟢 Verified; not Shadow DOM projection. |
| `scrollTo` and left/top/behavior fields | Existing `Element.scrollTo` APIs. | 🟢 Verified; no shim or hidden scrollbar object. |

External tokens include `--mui-layout-background`, `--mui-layout-color`,
`--mui-layout-embedded-background`, `--mui-layout-border-color`, Sider widths and
`--mui-layout-trigger-padding`. Header/Footer/Sider inverted presentation has native
forced-colors fallbacks. Explicit author styles can override the low-specificity defaults.
No animation engine, automatic ARIA naming, synthetic runtime or runtime dependency exists.

## Original migration steps and acceptance (historical)

1. [x] Reconcile all five owners and use authored semantic regions without duplicate landmarks.
2. [x] Implement external shell, border, positioning, scrolling and responsive-composition CSS.
3. [x] Adapt collapse/trigger/events to native details/summary and document omitted state machines.
4. [x] Exercise native structure, forms, focus, nested/positioned shells, scrolling and payload.

On 2026-09-08, `pnpm check` completed the build and **396 tests**, including 11 Layout cases.
Chromium acceptance covered a 200px expanded / 64px custom collapsed sidebar, native Enter/Tab
disclosure with hidden links skipped, one form submission and reset, a 220px scroll region
with sticky header, absolute header/footer edges, logical RTL end placement, 320px responsive
stacking, 200% CSS zoom, forced colors, print expansion and later legacy-aggregate loading.
At that original delivery the stylesheet was **874 gzip bytes** under its 1,500-byte ceiling; the aggregate was
**14,611 / 15,000 gzip bytes**. This is retained-scope Chromium evidence, not all-browser,
screen-reader speech, animation or framework parity certification, and not evidence
that the new coordinated build has already passed.
