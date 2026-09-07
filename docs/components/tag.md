# Tag

**Migration status: 🟢 Complete and verified for the retained native scope below.**
Tag is an optional, dependency-free module. Passive tags use ordinary text/span content;
checkable and closable tags use native buttons. No interactive role is synthesized on the
host, and close intent never automatically removes authored content.

## Sources and distribution

Inventory pinned to Naive UI commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`:

- [Official Tag documentation](https://www.naiveui.com/en-US/os-theme/components/tag)
- [Tag API and slots](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/demos/enUS/index.demo-entry.md)
- [Tag implementation, callbacks and public method](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/Tag.tsx)
- [Shared Tag properties](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/tag/src/common-props.ts)

The pinned official page has no separate TagGroup/companion component API. Its avatar
slot is accounted for as authored native content, not an implicit dependency on Avatar.

| Asset | Purpose |
| --- | --- |
| `dist/markup-ui-tag.js` | ESM; exports `MuiTag`, `registerTag()`; registers on browser import. |
| `dist/markup-ui-tag.global.js` | Classic script; registers and exposes `MarkupUITag`. |
| `dist/markup-ui-tag.css` | Required external CSS; no style injection or JS style strings. |
| `dist/components/tag/index.d.ts` | Declarations, including `TagCloseDetail`. |
| `demo/components/tag.html`, `.css`, `.js` | Separate HTML, external CSS and plain JavaScript demonstration. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-tag.css">
<script defer src="./vendor/markup-ui-tag.global.js"></script>
<script defer src="./app.js"></script>

<mui-tag type="success">Ready</mui-tag>
<mui-tag checkable>Design</mui-tag>
```

Application ESM: `import "@dataengine/markup-ui/tag";`. Serve/link the
`@dataengine/markup-ui/tag/style.css` export with your asset mechanism. Plain browsers import
the served `markup-ui-tag.js` URL instead of a bare package specifier. Consumers require no
compiler or runtime dependency.

**Load enhanced Tag before the legacy aggregate**, with ordered `defer` classic scripts or
ordered ESM imports. The aggregate skips existing registrations. Legacy-first loading throws
an explicit conflict, preserving the legacy definition rather than pretending to upgrade it.
Do not load both Tag distributions in the same document. External Tag CSS is isolated from
later-installed legacy Tag styles. The basic legacy Tag and core bundle ceiling are unchanged.

## Native content and interaction contract

```html
<mui-tag round>
  <span data-mui-tag-avatar aria-hidden="true"><img src="./ada.png" alt=""></span>
  Ada
</mui-tag>

<mui-tag checkable aria-label="Favorite">
  <span data-mui-tag-icon aria-hidden="true">★</span>
</mui-tag>

<mui-tag checkable>
  <button type="button"><span data-mui-tag-icon aria-hidden="true">✓</span>Approved</button>
</mui-tag>

<mui-tag closable close-label="Remove project label">Project</mui-tag>
```

- Ordinary content moves into a native `span[data-mui-tag-content]` without cloning.
  An authored direct content span is also accepted. Original text, icon/avatar elements
  and their listeners survive normal updates and generated passive/checkable mode changes.
- Checkable mode creates a real `<button type="button">`, or adopts **one direct authored
  button** without wrapping it in another button. Its label must contain noninteractive
  phrasing content. Do not put links, inputs, nested buttons, interactive tags, or multiple
  action roots inside a checkable label; use separate tags/actions instead. Known native
  interactive/focusable descendants are rejected with an explicit error before a generated
  toggle wraps them, rather than silently constructing nested interactive roots.
- The native toggle owns `aria-pressed` and focus. The host gets neither `role="button"` nor
  a tab stop. Put native `tabindex`, additional ARIA and native attributes on an authored
  button. Do not put a competing interactive role/tabindex on the host.
- Visible label text supplies the accessible name. Icon-only toggles need `aria-label` or
  `aria-labelledby`. Host `aria-label`, `aria-labelledby` and `aria-describedby` are forwarded
  to the native button, restoring authored values when removed. Mark decorative icons/images
  explicitly; the library does not rewrite their accessibility text.
- `element.control` exposes the current native button or `null`; `element.contentElement`
  exposes the content span or `null` before connection. In checkable mode `.click()`,
  `.focus(options)` and `.blur()` delegate to the native control. Passive host `.click()`
  is an ordinary host click, never an implicit close request.
- Removing `checkable` unwraps only a **generated** toggle. An **authored** button remains
  authored native content, with its original type/pressed state restored and no Tag toggle
  behavior. This preserves the author's control identity/listeners rather than silently
  replacing a native action. Its original form behavior can therefore resume; author
  `type="button"` if it should remain a nonsubmitting action.
- Templates remain inert, unconsumed and uncloned. Applications can explicitly clone their
  own templates. Direct native DOM replacement is deliberately destructive: the component
  cannot preserve nodes that application code removed using `innerHTML`/`textContent`.

### Checked state and event payload

Native Enter, Space and pointer activation toggle `.checked`, synchronously reflect
`aria-pressed`, and emit one bubbling **`mui:change` with Boolean `event.detail`**. This
matches the existing Checkbox/Switch change-payload convention and upstream checked callback.
There is no keyboard click synthesis or duplicate input/change protocol.

```js
const tag = document.querySelector("#topic");
tag.addEventListener("mui:change", (event) => {
  console.log(event.detail); // true or false, already reflected in tag.checked
});
tag.checked = true; // Silent: no fabricated user event.
```

Attribute changes and pre-upgrade/programmatic property assignments are silent.
`checked` can be stored while not checkable, but has no visual or interactive effect until
checkable mode is enabled. This is local reflected state, not a Vue controlled-prop adapter.
Applications can assign their desired value in response to `mui:change`.

The checkable button is not a form field: it does not contribute a checked value to FormData
or participate in automatic form reset. While checkable it is always `type="button"`, so
activation does not submit/reset an enclosing form. Native disabled fieldsets work normally.

### Close policy

Closable passive tags receive a separate native `type="button"` close control. It is named
by `close-label` / `.closeLabel`, default **“Remove tag”** (also for blank labels), and remains
keyboard-focusable unless disabled. It emits a bubbling, cancellable **`mui:close`**, with
`detail.originalEvent`, and never removes/hides the Tag:

```js
tag.addEventListener("mui:close", (event) => {
  event.preventDefault();
  // Application policy: confirm, update data, then remove/hide and restore focus if needed.
});
```

By default the original close **click does not bubble** beyond the close control.
`trigger-click-on-close` / `.triggerClickOnClose = true` allows that same native click to
bubble; it does not dispatch a second host click. `mui:close` remains a separate bubbling
notification regardless of this click policy. Cancelling the intent does not itself change
the configured click-propagation policy.

As in the pinned upstream implementation, **checkable takes precedence over closable**:
there is no close button while checkable, and no nested toggle/close roots. If a close
handler enables checkable mode, its original click does not become a toggle activation.
There is no Backspace/Delete-to-remove shortcut or application removal/focus-management policy.

## Per-property migration tracker

🟢 Verified retained implementation · 🟡 Explicit native/CSS replacement ·
⏭️ Framework/private/deprecated API intentionally not transplanted.

| Upstream property | Mapping | Status / limits |
| --- | --- | --- |
| `bordered` | `bordered="false"` / `.bordered`; true by default. | 🟢 Transparent passive border when false; ignored for borderless native checkable treatment, matching upstream. |
| `checkable` | Boolean `checkable` / `.checkable`; native toggle button. | 🟢 Real keyboard/focus behavior; type palette and close affordance are suppressed in this mode. |
| `checked` | Boolean `checked` / `.checked`; native `aria-pressed`. | 🟢 Local reflected state, silent programmatic assignment; no false native form-field claim. |
| `closable` | Boolean `closable` / `.closable`. | 🟢 Native close intent, not automatic removal; suppressed when checkable. |
| `color` | `--mui-tag-background`, `--mui-tag-border-color`, `--mui-tag-color`. | 🟡 External CSS equivalents override passive semantic colors; no JS color object/parser or inline styles. Checkable palettes have separate tokens. |
| `disabled` | Boolean `disabled` / `.disabled`. | 🟢 Native buttons disabled, check/close activation suppressed, focus helpers guarded, passive appearance dimmed. |
| `round` | Boolean `round` / `.round`. | 🟢 Pill shape; authored avatar wrapper becomes circular. |
| `size` | `size="tiny\|small\|medium\|large"` / `.size`. | 🟢 20/22/28/34px presets, medium default; not a claim of upstream pixel parity or the legacy 24px default. |
| `strong` | Boolean `strong` / `.strong`. | 🟢 Font weight 600; independently authored native text formatting remains intact. |
| `trigger-click-on-close` | Boolean attribute / `.triggerClickOnClose`. | 🟢 Explicit native click-bubbling opt-in; no duplicate click dispatch. |
| `type` | `type` / `.type`: default, primary, info, success, warning, error. | 🟢 Passive semantic surfaces/borders/text. Checkable uses its own palette regardless of type. |
| `on-close` / source `onClose` | `mui:close`, `detail.originalEvent`. | 🟢 Native close intent; function/array callback-prop adapter omitted. |
| `on-update:checked`, source `onUpdateChecked` / `onUpdate:checked` | `mui:change`, Boolean `detail`. | 🟢 New checked state emitted once after reflection; programmatic assignment stays silent. |
| `onMouseenter`, `onMouseleave` (source callbacks) | Ordinary `mouseenter` / `mouseleave` listeners. | 🟡 Browser-native events; no library callback properties or event forwarding layer. |
| Deprecated `onCheckedChange` | Listen to the same `mui:change` Boolean event. | ⏭️ Deprecated callback alias and warning machinery omitted. |
| Private `internalCloseFocusable`, `internalCloseIsButtonTag` | Always a keyboard-focusable native close button when enabled. | ⏭️ Private tag/focus switches omitted; no non-native close impersonation. |
| `theme`, `themeOverrides`, `builtinThemeOverrides` | External stylesheets and CSS custom properties. | ⏭️ Vue theme objects/provider injection and CSS-in-JS runtime omitted. |

Presence booleans such as `disabled="false"` remain **true**; remove the attribute or assign
the property `false`. Only `bordered` uses the explicit `"false"` opt-out from its true default.
Generated close/toggle markers are library-owned output, not additional authoring slots.

## Slots and source methods

| Upstream surface | Native equivalent | Status / limits |
| --- | --- | --- |
| Default slot | Authored text/phrasing nodes, optionally `span[data-mui-tag-content]`. | 🟢 Preserved without VNodes/shadow slot projection. |
| Icon slot | Direct `[data-mui-tag-icon]` inside content, or host/native-button content before normalization. | 🟢 Original nodes preserved; author decorative semantics and icon-only names. |
| Avatar slot | Direct `[data-mui-tag-avatar]` with native image/content. | 🟢 Size/round CSS and native image behavior; no implicit Avatar module import. Icon takes precedence when both slots are present, as upstream does. |
| `setTextContent(text)` (source public method) | Assign `textContent` on an authored label node, or `tag.contentElement`. | 🟡 Native destructive replacement; replacing the complete content span also removes icon/avatar children. Target a separate authored label span to retain them. No second library renderer. |
| Framework ref `$el` | The actual `mui-tag` node from native DOM queries. | ⏭️ Framework ref wrappers omitted. |

All layout/state styles are external. Additional tokens include `--mui-tag-height`,
`--mui-tag-font-size`, `--mui-tag-padding`, `--mui-tag-gap`, `--mui-tag-radius`,
`--mui-tag-disabled-opacity`, `--mui-tag-avatar-size`, `--mui-tag-avatar-radius`,
`--mui-tag-close-size`, `--mui-tag-close-radius`, `--mui-tag-close-hover-background` and
`--mui-tag-focus-color`. Checkable tokens are `--mui-tag-checkable-background`,
`--mui-tag-checkable-color`, `--mui-tag-checkable-hover-background`,
`--mui-tag-checkable-pressed-background`, `--mui-tag-checked-background`,
`--mui-tag-checked-color`, `--mui-tag-checked-hover-background` and
`--mui-tag-checked-pressed-background`. Reduced motion removes transitions.
Applications remain responsible for contrast in custom themes and for short tag content.

## Lifecycle and scope limitations

Live host state/label attributes synchronize immediately. Late/replaced child content and
authored native button attribute changes reconcile on a MutationObserver microtask.
Temporary type/ARIA/disabled/tab-order overrides restore authored values, including distinct
native edits made during an override. A write identical to an active override cannot convey
a new baseline; remove the host override first in that case.

Reflected properties support pre-definition assignment. Observers and native/host capture
listeners are removed on disconnect and restored once on reconnect. Detached markup is not
continuously synchronized. Core basic Tag behavior is unchanged; richer state and this
component's minimum sizes are intentionally opt-in. Tag does not implement form association,
data-driven tag lists, truncation measurement, removal animation, or framework theme/slot
rendering. Native CSS/image/content APIs remain available instead.

## Numbered migration steps and acceptance

1. [x] Inventory legacy Tag behavior and pinned public props/slots/source callbacks/methods.
2. [x] Add optional ESM/classic registration, declarations, CSS export and isolated budgets.
3. [x] Preserve native content and authored button identity; keep templates inert.
4. [x] Implement native checking, Boolean change events and silent programmatic state.
5. [x] Implement native close intent, click propagation and checkable/closable precedence.
6. [x] Implement semantic types, size/shape/border, icon/avatar and CSS color equivalents.
7. [x] Validate dynamic attributes, disabled/focus, pre-upgrade state and reconnect cleanup.
8. [x] Add separate HTML/CSS/JS demo; run focused tests, full integration suite and build.
9. [x] Review, fix findings and verify native interaction/loading order in Chromium.

### Acceptance evidence — 2026-09-08

- `pnpm test -- tests\tag.test.ts`: **26 focused tests passed** after fixing disabled focus
  delegation. `pnpm build && pnpm test`: budgeted distributions/declarations succeeded and
  **118 tests passed** (26 Tag, 25 Card, 24 Button, 16 Avatar, 27 unchanged legacy/native).
- Focused coverage includes passive/explicit content, inert templates, authored/late native
  controls, generated mode identity, Boolean event payloads, silent assignment, click
  cancellation, disabled state/restoration, native fieldsets/form safety, close cancellation/
  propagation, mode precedence, pre-definition state, reconnect and registration conflicts.
- Chromium on the existing port-4187 server in a new tab: Enter/Space toggled exactly once;
  programmatic checked assignment changed ARIA without events. Tab used native controls
  without a second host stop, skipped disabled controls, and showed a 3px focus-visible ring.
  Toggling and closing never submitted the enclosing form.
- Close keyboard activation emitted intent without hiding/removing Tag; default close click
  bubbling was suppressed, opt-in propagated the original click once. Checkable suppressed
  closable, including a close handler switching modes without accidental toggle activation.
- Browser CSS verified 20/22/28/34px sizes, all semantic palettes, round/strong/borderless,
  native avatar image and icon precedence, no injected/inline styles, type-independent
  checked primary palette, and reduced-motion behavior. Final review/browser checks also
  covered authored hidden content across modes, the round close-control shape, and explicit
  rejection of interactive label descendants without generating nested button roots.
- Browser lifecycle checks verified native fieldset disabling/restoration, node/listener
  identity through generated mode switching and reconnect, and no nested toggle/close roots.
  Classic-before-aggregate preserved rich registration, zero checkable host padding/border,
  28px native toggle height, 16px close width and original content identity.
- Separate documents verified ESM pre-upgrade checked/disabled/size state, Boolean change
  payload after aggregate loading, and legacy-first rejection preserving its constructor.
  Test-only documents were closed; unrelated browser tabs were not modified.
- Optional build configuration now shares one small component list for identical ESM/classic
  and CSS tasks. All prior output sizes remain unchanged. Core is **14,611 / 15,000 gzip bytes**;
  Tag ESM/classic/CSS are **2,246 / 2,455 / 1,386 gzip bytes**, under separate
  **3,500 / 3,500 / 2,500** ceilings. Exact values are in `dist/manifest.json`.

This is verified retained scope, not Vue API/pixel parity, a screen-reader certification or
an all-browser guarantee. Browser acceptance here is Chromium; application-specific themes,
Safari/Firefox, touch-device behavior and accessibility combinations need downstream checks.
The next component is selected by the coordinator after this component's commit.
