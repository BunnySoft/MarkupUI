# Alert

**Migration status: 🟢 Verified for the retained native scope below.**
Alert preserves authored notice content and provides optional native close intent. Appearance
is external CSS; roles, live regions and actual dismissal remain explicit application choices.
It does not turn every static informational notice into an assertive announcement.

## Pinned inventory and loading

Reference: Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official Alert documentation](https://www.naiveui.com/en-US/os-theme/components/alert)
- [Public API: seven props/callbacks and three slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/demos/enUS/index.demo-entry.md)
- [Implementation and deprecated after-hide hook](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/alert/src/Alert.tsx)

The official page has no companion component, action slot, size prop, provider API or
public visibility property. Its source sets an assertive role and hides itself after
resolving `onClose`, unless that callback returns false. This migration deliberately chooses
static-by-default semantics and intent-without-removal instead. Those differences are
not counted as upstream lifecycle parity.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-alert.js` | ESM; exports `MuiAlert`, `registerAlert()`; registers on browser import. |
| `dist/markup-ui-alert.global.js` | Classic script; registers and exposes `MarkupUIAlert`. |
| `dist/markup-ui-alert.css` | External component and native static-notice CSS. |
| `dist/components/alert/index.d.ts` | Declarations including `AlertCloseDetail`. |
| `demo/components/alert.html`, `.css`, `.js` | Separate classic HTML/CSS/plain-JavaScript demo. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-alert.css">
<script defer src="./vendor/markup-ui-alert.global.js"></script>
<script defer src="./app.js"></script>

<mui-alert type="warning" closable close-label="Dismiss session warning">
  <h2 data-mui-alert-header>Warning: session ending</h2>
  <p data-mui-alert-content>Save your work before leaving.</p>
</mui-alert>
```

Application ESM: `import "@dataengine/markup-ui/alert";`. Serve/link the
`@dataengine/markup-ui/alert/style.css` export through your asset mechanism; a plain browser
imports the served `markup-ui-alert.js` URL instead of the bare package specifier.
Consumers need no compiler or runtime dependency, and Alert does not import Button.

Load enhanced Alert **before the legacy aggregate**, using ordered `defer` scripts or
ordered ESM imports. The aggregate preserves existing definitions; legacy-first enhanced
registration reports an explicit conflict. Do not load both enhanced distributions in one
document. The legacy Alert implementation/styles, previous output sizes and core ceiling
remain unchanged. External Alert CSS isolates enhanced hosts from later legacy styling.

## Native anatomy and preserved content

Public authored regions are `data-mui-alert-header`, `data-mui-alert-content` and
`data-mui-alert-icon`. They can be direct children; an optional native
`div[data-mui-alert-body]` may already contain the header/content. The controller generates
a body/content wrapper only when needed and preserves the original nodes and listeners.
Use one body/header/content/icon region each.

```html
<mui-alert type="info">
  <svg data-mui-alert-icon aria-hidden="true" focusable="false" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" fill="currentColor"></circle>
  </svg>
  <header data-mui-alert-header><h3>Information</h3></header>
  <div data-mui-alert-content>
    <p>Review the original report before retrying.</p>
    <div data-mui-alert-actions><button type="button">View report</button></div>
  </div>
</mui-alert>
```

- Ordinary text/element children become default content without cloning. An authored
  content region is adopted; late explicit regions absorb previous generated content.
  Authored header/content/control identities survive type, border, icon and close updates.
- `title` / native `.title` provides a safe plain-text fallback header only when no authored
  header exists. An authored header takes precedence, as upstream does. No heading level
  is inferred; use native `h2`, `h3`, etc. when appropriate. The attribute also retains its
  ordinary HTML tooltip meaning; prefer an authored header if that tooltip is unwanted.
- Generated type icons are dependency-free decorative glyphs: info `ⓘ`, success `✓`,
  warning `!`, error `×`. Default/unknown types create no empty icon. Custom native
  HTML/SVG icon nodes take precedence and retain their own ARIA and listeners.
  Direct SVGs and nested SVG/images are sized with external CSS, not JS measurement.
- `show-icon="false"` hides authored icons through CSS rather than discarding them.
  Generated glyphs are library-owned; custom icon nodes remain available when enabled again.
  Mark duplicate decorative icons `aria-hidden="true"` and keep icons noninteractive.
- Actions are ordinary native controls in default content. `data-mui-alert-actions` is a
  CSS layout convenience, **not a new upstream slot or action controller**. Native button
  type, labels, focus, form submission and application listeners are preserved.
- Templates remain inert, even when they carry region markers. No renderer, template
  evaluator or VNode layer is introduced.

### Controller-free static notice

Link the same CSS and use native HTML when no controller is needed:

```html
<section class="mui-alert" data-type="info">
  <span data-mui-alert-icon aria-hidden="true">ⓘ</span>
  <div data-mui-alert-body>
    <h2 data-mui-alert-header>Information</h2>
    <p data-mui-alert-content>This notice needs no Custom Element or JavaScript.</p>
  </div>
</section>
```

Do not add a nonfunctional close affordance to the CSS-only version unless application
code explicitly handles its native button. Without scripting, explicitly authored notice
text/headings remain readable; a `title` attribute alone is not a no-JS visible header.

## Roles and announcement policy

**No role or live-region attribute is added by default.** This preserves the legacy
static-notice behavior and deliberately differs from upstream's unconditional `role="alert"`.
`type="error"` is appearance, not permission to interrupt a screen-reader user.

- For a static named region, author `role="region"` and `aria-labelledby` only when that
  grouping is useful. For ordinary inline notices, a readable native heading/body is enough.
- For a routine update, explicitly author `role="status"` and the desired native live/atomic
  attributes. For urgent content, explicitly author `role="alert"` on the appropriate region.
- Author-supplied `role`, `aria-live`, `aria-atomic`, names and description references are
  never overwritten or duplicated on generated children.
- Choose one announcing region for the actual update. Do not wrap another live region in an
  assertive Alert by accident, and do not combine independent announcers without a policy.
- Use readable severity text (“Warning”, “Error”) instead of relying only on color or a
  decorative glyph. Type changes do not rewrite authored heading/body/name text.
- The controller avoids rewriting unchanged close-button ARIA or moving controls when
  an authored live-region text node changes.

Actual spoken timing, whether initial/inserted content is announced, and interaction with
focused controls vary by browser/assistive technology. DOM-role and accessibility-tree
acceptance below is **not** a screen-reader announcement certification.

## Close lifecycle policy

`closable` creates a native `<button type="button">` after the body in DOM order, visually at
logical end. It is named by `close-label` / `.closeLabel`, default **“Close alert”** (also
when a blank value is supplied). It has a decorative glyph and a focus-visible outline.
It does not submit the enclosing form or require the Button module.

Native Enter/Space/pointer activation emits one bubbling, cancellable **`mui:close`** event
with `detail.originalEvent`. A native click cancelled before the close handler is respected.
The original click otherwise follows normal DOM bubbling; no second host click is synthesized.

```js
const notice = document.querySelector("#notice");
notice.addEventListener("mui:close", (event) => {
  if (event.target !== notice) return; // Nested notices can bubble their own intents.
  event.preventDefault();
  // Application policy: save/confirm, then hide or remove and restore focus if appropriate.
});
```

Alert **never hides or removes itself**, whether the event is cancelled or not. Return
values and promises from DOM listeners are not interpreted as upstream `onClose` results.
Applications may await their own confirmation and then set native `.hidden`, remove the
node, and choose a focus destination themselves.

There is consequently no `mui:after-leave`, after-hide hook, transition lifecycle,
Escape/Delete shortcut, focus trap or automatic post-removal focus restoration.
`on-after-leave` and deprecated `onAfterHide` are intentionally omitted, rather than faked
for a disappearance the library does not perform.

Generated close/header/icon output is library-owned; supply close labels through the host
and author custom header/icon regions rather than replacing generated internals. Native
disabled fieldsets and an explicitly disabled native close button are respected. Alert
itself has no `disabled` API, and the host is not an interactive control.

## Per-property and slot tracker

🟢 Verified retained target · 🟡 Deliberate native representation/lifecycle difference ·
⏭️ Intentionally omitted callback/framework contract.

| Upstream item | Mapping | Status / limits |
| --- | --- | --- |
| `bordered` | `bordered="false"` / `.bordered`, true default. | 🟢 External border/accent; false makes borders transparent without geometry shifts. |
| `closable` | Boolean attribute / `.closable`. | 🟢 Native close intent; no automatic hiding/removal. |
| `show-icon` | `show-icon="false"` / `.showIcon`, true default. | 🟢 Generated/custom icons; no empty default icon. |
| `title` | Native string attribute/property fallback, or authored header. | 🟢 Safe text, authored header wins; native tooltip and explicit heading-level differences noted above. |
| `type` | Attribute / `.type`: default, info, success, warning, error. | 🟢 External semantic appearance/glyphs; does not set urgency/live semantics. |
| `on-after-leave` | Application owns completion of its own hiding/removal. | ⏭️ No automatic leave or complex transition engine, so no misleading after-leave event. |
| `on-close` | Cancellable bubbling `mui:close`, `detail.originalEvent`. | 🟡 Verified native intent, not Boolean/promise callback-result parity. Default removal intentionally absent. |
| Default slot | Authored default content, optionally `data-mui-alert-content`. | 🟢 Native nodes/actions preserved without cloning or VNodes. |
| Header slot | Authored `data-mui-alert-header`. | 🟢 Native headings/labels and listeners preserved; no inferred heading level. |
| Icon slot | Authored HTML/SVG `data-mui-alert-icon`. | 🟢 Preserved nodes/ARIA; caller marks decorative content explicitly. |
| `onAfterHide` (deprecated source callback) | Application-owned removal policy. | ⏭️ Deprecated after-hide alias/warning machinery omitted. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External scoped CSS and custom properties. | ⏭️ Framework theme objects/provider injection and runtime style adapters omitted. |

Presence booleans such as `closable="false"` still mean true; remove them or assign the
property false. `bordered` and `show-icon` explicitly accept `"false"` because their defaults
are true. No action slot, visibility prop or automatic announcer is invented as an upstream API.

### External styling

Tokens include `--mui-alert-padding`, `--mui-alert-radius`, `--mui-alert-background`,
`--mui-alert-accent`, `--mui-alert-border-color`, `--mui-alert-color`,
`--mui-alert-font-size`, `--mui-alert-line-height`, `--mui-alert-title-size`,
`--mui-alert-title-weight`, `--mui-alert-title-color`, `--mui-alert-content-gap`,
`--mui-alert-gap`, `--mui-alert-icon-size`, `--mui-alert-icon-color`,
`--mui-alert-action-gap`, `--mui-alert-action-margin`, `--mui-alert-close-size`,
`--mui-alert-close-radius`, `--mui-alert-close-color`, `--mui-alert-close-hover-background`,
`--mui-alert-close-pressed-background` and `--mui-alert-focus-color`.

CSS grid/logical properties separate icon, body and close regions; there are no JS geometry
style mutations. RTL reverses the visual icon/close edge and start accent. Reduced motion
removes appearance transitions. Applications remain responsible for theme contrast, useful
severity wording and the behavior of their authored actions.

## Lifecycle and compatibility

Retained host attributes synchronize immediately. Late/replaced body/header/content/icon
regions and text changes reconcile on a MutationObserver microtask. Exposed properties
support pre-definition assignment. Disconnect releases observation and close listeners;
reconnection reuses original authored/native state without duplicated handlers.

Replacing all authored children is an application-owned destructive action; discarded nodes
are not resurrected. Generated title/glyph/body/control output may be regenerated, while
ordinary updates preserve authored content and native input values/listeners.
The optional component changes default appearance and adds documented behavior, not the
legacy aggregate. No dependencies, style injection, HTML-string renderer, application
provider, removal animation or general reactive framework are introduced.

## Numbered migration steps and acceptance

1. [x] Inspect pinned props/slots/source close semantics and the legacy registered/styled baseline.
2. [x] Add optional ESM/classic/CSS exports and independent payload gates, preserving core.
3. [x] Preserve native header/content/icon/action anatomy, safe title fallback and inert templates.
4. [x] Implement native close intent with labels, form safety, keyboard defaults and cleanup.
5. [x] Define static defaults versus explicit native live-region/naming responsibilities.
6. [x] Implement external appearance, HTML/SVG icons, borders, logical layout and reduced motion.
7. [x] Add classic HTML/CSS/JS examples and focused/unit integration acceptance.
8. [x] Review live-update DOM stability, SVG handling and native browser loading/interaction.
9. [x] Reconcile reference rows/four retained tasks, index totals and master current/next status.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\alert.test.ts`: **26 focused tests passed**.
- `pnpm build && pnpm test`: declarations and all budget gates succeeded;
  **167 tests passed** (26 Alert, 23 Badge, 26 Tag, 25 Card, 24 Button, 16 Avatar, 27 legacy/native).
- Unit coverage includes static/default versus authored live semantics, original nodes/
  actions/input state, safe/author-preferred title, generated/custom/direct SVG icons, inert
  templates, late/replaced body/regions, close cancellation/no removal/no leave events,
  disabled fieldsets, native forms/focus/keys, pre-upgrade state, nesting and reconnect.
- Review fixes accepted direct SVG icons as icon regions rather than body content, sized
  native graphics with CSS, and avoided redundant close-label ARIA writes on content updates.
- Chromium in an isolated port-4187 demo tab: native Tab/Enter/Space reached the named close
  control and emitted one intent each with a 3px focus ring; close never submitted or removed
  the notice. The authored retry button submitted once; input values/action listeners and
  single close handling survived reconnect.
- Browser checks verified custom icon hide/restore, borderless/closable changes, all semantic
  palettes/glyphs, CSS-only static layout and RTL placement. Default notices had no live role;
  explicit status/polite and urgent alert regions remained authored and unduplicated in the
  accessibility tree. Actual spoken announcement timing is not claimed.
- An observed authored live-text update produced no ARIA attribute writes or control moves
  and preserved focused-close identity. Classic-before-aggregate kept rich registration,
  grid layout, 12px/16px padding, 24px close width, native roles and RTL 1px/3px edge borders.
  Reduced-motion emulation removed transitions.
- Separate documents verified ESM pre-upgrade flags/labels, original headings, author role,
  no-removal close intent and explicit legacy-first collision preserving the original
  constructor. Test-only documents closed; unrelated browser tabs were not changed.
- Final browser review verified a direct native SVG remains one 20px icon region across
  type/show changes and late body adoption preserves original heading/content nodes.
- Reference validation retained all ten original Alert rows plus four explicit source
  supplements. The catalog records **96 pages, 3,052 rows, 384 tasks (24 accepted)** and
  **648 validated relative file links** with canonical colored statuses.
- Core remains **14,611 / 15,000 gzip bytes** with previous bundle sizes unchanged.
  Alert ESM/classic/CSS are **1,770 / 1,981 / 1,233 gzip bytes**, under separate
  **2,500 / 2,500 / 2,000** ceilings; exact figures are in `dist/manifest.json`.

This is retained native scope, not Vue lifecycle/pixel parity or all-browser/screen-reader
certification. Browser acceptance here is Chromium. Safari/Firefox, touch devices, spoken
announcements and application-specific themes/focus policies need downstream verification.
Empty is next only through coordinator selection; it is not started by this change.
