# Button

**Migration status: 🟢 Verified for the retained native Button and ButtonGroup scope in `43dd57f`.**
This is an optional standalone implementation, not Vue API, pixel or all-browser parity.

## Baseline and target

[A1: accepted API and acceptance record](../../components/button.md) is the implementation
authority. The original comparison baseline was `5dcb190`; the retained native component is
committed in `43dd57f`, independently of the basic aggregate Button.

| Evidence | Accepted implementation |
| --- | --- |
| [S1: native controller](../../../src/components/button/button.ts) | Authored/generated button or authored anchor, explicit state/ARIA overrides, native activation and lifecycle cleanup. |
| [S2: group controller](../../../src/components/button/group.ts) | Authored Button children, reflected size/orientation and group semantics; no invented toolbar selection model. |
| [S3: external stylesheet](../../../src/components/button/button.css) | Native-control variants, icons/spinner, logical group joins and reduced motion; no inline styles or injection. |
| [S4: standalone entry](../../../src/components/button/index.ts) | `MuiButton`, `MuiButtonGroup`, `registerButton`; pre-existing conflicting definitions throw before registration. |
| [D1: demonstration](../../../demo/components/button.html) | Separate [JavaScript](../../../demo/components/button.js) and [CSS](../../../demo/components/button.css). |

- **HTML:** one direct authored native button/anchor is the sole interactive root. If absent,
  a real button is generated and original phrasing-content nodes are moved without cloning.
- **JS:** host conveniences explicitly synchronize approved native attributes; native forms,
  keyboard activation, submitter identity and reset remain browser-owned.
- **CSS:** external CSS controls presentation and preserves content/icon identity through
  loading. No renderer, icon package, style-object forwarding or generic template system.
- **Placement:** implemented in `src/components/button/` as a separate optional distribution.

## Acceptance and gaps

A1 records a successful `pnpm build && pnpm test`: **67 tests** (24 Button, 16 Avatar,
27 legacy/native), plus **Chromium** keyboard, forms, focus, accessible-name, state/content,
CSS and registration-order checks. These recorded results were not rerun for this doc edit.

Generated buttons default to native `type="button"`; authored buttons without type retain
the browser's submit default. Host `type` is visual; `attr-type` changes the native action.
Disabled/loading anchors temporarily lose href and Tab access while retaining link semantics,
then restore authored values. Loading intentionally removes Tab focus rather than reproducing
upstream focus retention. `focusable=false` affects sequential Tab order, not all native focus.

Only `bordered` and `focusable` use the explicit string `"false"` to opt out of true defaults.
Other Boolean attributes use normal presence semantics. Group size is inherited unless a child
has its own explicit size; this follows the reviewed implementation rather than the conflicting
upstream API-table precedence claim. See A1 for unsupported treatment combinations and limitations.

## Standalone loading and budget

Use `@dataengine/markup-ui/button` with the separate
`@dataengine/markup-ui/button/style.css` export. Served browser assets are
`dist/markup-ui-button.js`, `dist/markup-ui-button.global.js` and
`dist/markup-ui-button.css`; do not load ESM and classic versions together.

Register Button **before** the legacy aggregate. The aggregate preserves rich registrations;
legacy-first loading throws a clear conflict rather than claiming an upgrade. Both retained
load modes and the conflict path have acceptance evidence.

Core remains **14,611 / 15,000 gzip bytes**. Standalone ESM/classic JavaScript each have a
**4,000-byte gzip ceiling**, and Button CSS has a **2,500-byte ceiling**. Exact outputs belong
to the build manifest; ceilings do not assert actual compressed sizes.

## Migration steps

**Delivery phase:** P1 — pilot. **Task state:** 🟢 Verified for the retained scope in `43dd57f`.
**Prerequisites:** P0 child adoption/events/form contract and the Avatar distribution pattern in the [master plan](../migration-plan.md).
**Next task:** proceed to Card; reopen omitted Button compatibility only through a separately reviewed scope decision.

1. [x] **Define the native action.** S1/A1 establish authored/generated native controls, actual submit/reset/submitter behavior and explicit anchor disabling.
2. [x] **Extract appearance.** S3/A1 establish retained variants, sizes, icons/spinner and group styling in external CSS.
3. [x] **Reconcile activation.** Native keyboard/click behavior and synchronous host state are accepted without duplicate synthesized clicks or promise loading.
4. [x] **Review ButtonGroup separately.** A1 records group sizing/direction, 67-test/build and Chromium evidence, lifecycle preservation and both registration orders.

### Native primitives and fallback

- **Native path:** the native child owns the only role/tab stop and browser form/keyboard
  behavior. Authored children and icons are preserved; no template is required for this
  small structure and no native Shadow DOM slot projection is involved.
- **Small enhancement:** custom-element lifecycle, MutationObserver and capture listeners
  coordinate explicit overrides, late/replaced controls and loading. CSS handles all
  presentation. An authored native control remains the nonenhanced path; generated controls
  require the component to run. Recorded browser evidence is Chromium, not every platform.

## Retained-scope accounting

The original **34** public-doc/inline rows remain. Four clearly labelled source-declared
entries add `onClick` and three inherited theme-plumbing props: **38 total rows**,
with **29 Verified adapted targets and 9 Intentionally omitted contracts**. CSS/native
replacements are Verified only for the stated narrower behavior; omitted framework APIs
receive no completion credit.

<!-- BEGIN PINNED API INVENTORY -->

## Reference and review boundary

- [Official website](https://www.naiveui.com/en-US/os-theme/components/button)
- [Pinned public API Markdown](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md)
- [Pinned implementation source](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button)
- [Catalog and provenance](../index.md) · [Architecture, statuses and shared acceptance](../architecture.md)

Snapshot: Naive UI **2.45.3**, `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`; comparison baseline **5dcb190 / 0.11.0**; retained Button implementation **43dd57f**.
Documentation inventory: **30 local table rows + 4 inline fields + 4 source-declared supplements = 38 tracker rows**.
Source-declared supplements are explicitly distinguished from public Markdown tables.
Accepted MarkupUI mappings cite A1/S1–S4; Verified is scoped to those native/CSS contracts.
It does not certify Vue callbacks, identical visual/default behavior or all-browser support.


### Button Props

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Evidence / retained limits |
| --- | --- | --- | --- | --- |
| [`attr-type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L34) | Prop | `attr-type` / `.attrType` or native child type; generated default button, authored default submit; invalid override uses button. | 🟢 Verified | A1/S1: real form validation, submitter and reset evidence. |
| [`block`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L35) | Prop | Boolean `block` / `.block`; full-width host and native control. | 🟢 Verified | A1/S3: external CSS/browser layout evidence. |
| [`bordered`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L36) | Prop | Default true; `bordered="false"` / `.bordered=false` makes the border transparent while retaining geometry. | 🟢 Verified | A1/S1/S3: explicit opt-out exception to presence semantics. |
| [`circle`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L37) | Prop | Boolean `circle` / `.circle`; equal preset dimensions and circular corners; short/icon-only content. | 🟢 Verified | A1/S3: circle wins over round; group joins are separately constrained. |
| [`color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L38) | Prop | External `--mui-button-color`, hover-color and pressed-color tokens; no color parser or automatic color derivation. | 🟢 Verified | A1/S3: narrower CSS replacement, application-owned contrast. |
| [`dashed`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L39) | Prop | Boolean `dashed` / `.dashed`; dashed native-control border. | 🟢 Verified | A1/S3: CSS variant; unsupported treatment combinations stay excluded. |
| [`disabled`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L40) | Prop | Presence `disabled` / `.disabled` or native disabled; buttons disable natively, anchors suppress href/Tab/navigation with restored authored state. | 🟢 Verified | A1/S1: keyboard, auxiliary click, ARIA and fieldset evidence. |
| [`focusable`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L41) | Prop | `focusable="false"` / `.focusable=false` removes sequential Tab access; pointer/programmatic focus remains browser-native. | 🟢 Verified | A1/S1: narrower explicit Tab-order contract. |
| [`ghost`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L42) | Prop | Boolean `ghost` / `.ghost`; transparent fill and semantic text/border. | 🟢 Verified | A1/S3: resting/hover CSS evidence. |
| [`native-focus-behavior`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L43) | Prop | Browser-native focus is always used; no toggle, Safari click-focus workaround or mousedown interception. | ⏭️ Intentionally omitted | A1: native behavior retained, compatibility switch excluded. |
| [`icon-placement`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L44) | Prop | `icon-placement` / `.iconPlacement`: left/right CSS order of direct marked icon/spinner; default logical start; nodes stay intact. | 🟢 Verified | A1/S3: placement and identity evidence. |
| [`keyboard`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L45) | Prop | No API suppresses native keyboard defaults or synthesizes keydown clicks; buttons use Enter/Space, anchors Enter only. | ⏭️ Intentionally omitted | A1/S1: native activation accepted; suppression toggle excluded. |
| [`quaternary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L46) | Prop | Boolean `quaternary` / `.quaternary`; transparent resting surface with subtle hover/pressed fill. | 🟢 Verified | A1/S3: retained treatment, not pixel parity. |
| [`loading`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L47) | Prop | Boolean `loading` / `.loading`; native busy/disabled state, one decorative spinner and suppressed activation; no automatic Promise tracking. | 🟢 Verified | A1/S1/S3: content preserved; Tab behavior deliberately differs upstream. |
| [`spin-props`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L48) | Prop | CSS spinner-size/spinner-width/spinner-color tokens replace the object prop; no SVG radius/scale model. | 🟢 Verified | A1/S3: narrower CSS controls and reduced-motion evidence. |
| [`render-icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L49) | Prop | No VNode/render callback; author a direct marked icon node in the native control. | ⏭️ Intentionally omitted | A1: authored-icon alternative verified under Icon slot. |
| [`round`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L50) | Prop | Boolean `round` / `.round` creates pill corners; circle wins, and group joins may override independent rounding. | 🟢 Verified | A1/S3: documented shape precedence. |
| [`secondary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L51) | Prop | Boolean `secondary` / `.secondary`; low-opacity semantic fill. | 🟢 Verified | A1/S3: retained CSS treatment. |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L52) | Prop | `size` / `.size`: tiny/small/medium/large minimum heights 22/28/34/40px; medium default, external CSS customization. | 🟢 Verified | A1/S3: browser size and group-precedence evidence. |
| [`strong`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L53) | Prop | Boolean `strong` / `.strong`; font weight 600. | 🟢 Verified | A1/S3: external CSS treatment. |
| [`tertiary`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L54) | Prop | Boolean `tertiary` / `.tertiary`; muted surface and hover/pressed treatment. | 🟢 Verified | A1/S3: retained CSS treatment. |
| [`text`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L55) | Prop | Boolean `text` / `.text`, or legacy visual `type=text`; compact borderless styling, not implicit anchor semantics. | 🟢 Verified | A1/S3: native control identity stays unchanged. |
| [`text-color`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L56) | Prop | External `--mui-button-label-color`; no inline style/object prop. | 🟢 Verified | A1/S3: narrower CSS-token replacement. |
| [`type`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L57) | Prop | Visual `type` / `.type` supports default/primary/info/success/warning/error/tertiary; legacy variant aliases semantic colors. | 🟢 Verified | A1/S3: tertiary is intentionally muted; avoid conflicting type/variant values. |
| [`tag`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L58) | Prop | Author exactly one native button or anchor; no arbitrary tag/host-href renderer. | ⏭️ Intentionally omitted | A1/S1: native control alternative; no clickable div/span imitation. |

### ButtonGroup Props

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Evidence / retained limits |
| --- | --- | --- | --- | --- |
| [`size`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L64) | Prop | Group `size` / `.size` provides inherited CSS dimensions; an explicit child size wins. | 🟢 Verified | A1/S2/S3: follows reviewed source, not conflicting API-table group precedence. |
| [`vertical`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L65) | Prop | Boolean `vertical` / `.vertical`; CSS column layout and joined borders/corners; horizontal default. | 🟢 Verified | A1/S2/S3: logical orientation, no toolbar selection state. |

### Button Slots

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Evidence / retained limits |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L71) | Slot | Authored phrasing-content nodes remain inside the native control; generation moves nodes without cloning. | 🟢 Verified | A1/S1: listener/identity preservation; no VNode/native slot projection. |
| [`icon`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L72) | Slot | Direct authored `[data-mui-button-icon]` node; decorative semantics and icon-only naming belong on native markup. | 🟢 Verified | A1/S1/S3: loading hides rather than discards icons. |

### ButtonGroup Slots

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Evidence / retained limits |
| --- | --- | --- | --- | --- |
| [`default`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L78) | Slot | Authored direct Button children keep order/identity and individual native Tab stops. | 🟢 Verified | A1/S2: group role, not invented roving/toolbar behavior. |

### Button Props: spin-props inline fields

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Evidence / retained limits |
| --- | --- | --- | --- | --- |
| [`spin-props.strokeWidth?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L48) | Inline record field | External `--mui-button-spinner-width` replaces the object/SVG stroke setting. | 🟢 Verified | A1/S3: narrower CSS spinner model, not record forwarding. |
| [`spin-props.stroke?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L48) | Inline record field | External `--mui-button-spinner-color` supplies spinner color. | 🟢 Verified | A1/S3: CSS replacement, no SVG prop object. |
| [`spin-props.scale?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L48) | Inline record field | No SVG scale model; use the explicit CSS spinner-size token. | ⏭️ Intentionally omitted | A1: unsupported spinner coordinate/scale contract. |
| [`spin-props.radius?`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/demos/enUS/index.demo-entry.md#L48) | Inline record field | No SVG radius model; retained spinner geometry is CSS-owned. | ⏭️ Intentionally omitted | A1: unsupported spinner radius contract. |

### Source-declared public supplements

These four entries are not additional Markdown-table rows. `onClick` is declared directly
in the pinned Button source; its [theme-prop spread](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/src/Button.tsx#L42) supplies the three named fields below.

| Upstream item · source | Kind | Accepted MarkupUI mapping | Status | Existing evidence / scope |
| --- | --- | --- | --- | --- |
| [`onClick`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/button/src/Button.tsx#L87) | Callback | Native bubbling/cancelable click via addEventListener on child or host; no function/array prop adapter or duplicate mui:click. | 🟢 Verified | A1/S1: ordinary native click and form activation evidence. |
| [`theme`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L170) | Inherited source prop | External component CSS replaces framework theme injection. | ⏭️ Intentionally omitted | A1: no Vue theme/provider runtime. |
| [`themeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L171) | Inherited source prop | Author CSS custom properties; no framework theme-object graph. | ⏭️ Intentionally omitted | A1: external styles only. |
| [`builtinThemeOverrides`](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/_mixins/use-theme.ts#L172) | Inherited source prop | No built-in framework theme-override object API. | ⏭️ Intentionally omitted | A1: styling stays in the external component stylesheet. |

<!-- END PINNED API INVENTORY -->
