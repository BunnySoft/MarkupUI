# Space

**Migration status: 🟢 Verified retained native CSS/item-composition scope.**
**Architecture: CSS-only.** Authors choose the actual item/group markup and styling.
There is no wrapper generator, child traversal, gap detector/polyfill, size parser, Custom
Element, renderer, observer or mandatory Flex/Divider dependency.

## Pinned reference and loading

Reference: Naive UI `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.

- [Official documentation](https://www.naiveui.com/en-US/os-theme/components/space)
- [Ten public props and the default slot](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/demos/enUS/index.demo-entry.md)
- [Implementation, wrapper branches and source-only declarations](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/Space.tsx)
- [Source gap measurement helper](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/utils.ts)
- [SpaceSize source alias](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/src/public-types.ts)
- [Pinned spacing presets](https://github.com/tusen-ai/naive-ui/blob/42a52e6436b38bed456fee19eb0b89cdcd00fcc2/src/space/styles/_common.ts)

The pinned page/source expose **no separator prop or separator slot**. Explicit separator
examples below are application-authored native composition, not a fabricated migrated API.
All eleven public rows are retained. Seven source supplements identify the internal gap
override, alignment aliases, two types and three theme contracts.

| Asset | Purpose |
| --- | --- |
| `src/components/space/space.css` | Maintained standalone native Space CSS. |
| `dist/markup-ui-space.css` | Browser stylesheet distribution. |
| `@dataengine/markup-ui/space/style.css` | Stylesheet-only package export. |
| `demo/components/space.html`, `.css` | Native item/separator/list/form examples; no script. |

```html
<link rel="stylesheet" href="./vendor/markup-ui-space.css">
```

Serve/copy the stylesheet normally. No `./space` JS entry, classic global, synthetic type
export, registration-order rule or JS budget exists. CSS can load before or after the
legacy aggregate; existing row/stack/wrap wrappers remain unchanged.

## Space versus Flex

[Flex](flex.md) is the preferred simple direct-child layout. Space adds a documented
**author-owned item convention** for grouping mixed content and applying item classes.
Both use native flex-gap rather than a runtime compatibility engine.

The tiny native root declarations intentionally reuse Flex's flag/token naming conventions
and the same verified preset values, but do not import its stylesheet. Separate CSS namespaces
and independent distributions avoid a mandatory import chain or a new layout framework.
Flex's source/output remains unchanged.

Upstream Space may generate wrappers, flatten VNodes, measure gap support and replace gaps
with margins/padding in older browsers. **Those runtime contracts are not retained.**
This Space is not an older-browser gap-polyfill alternative to Flex. It retains useful
layout/item styling through native markup, not the source's historical compatibility machinery.

## Authored item and wrapper contract

```html
<div class="mui-space">
  <span class="mui-space-item card-item">One text item</span>
  <div class="mui-space-item card-item">
    <strong>One grouped item</strong>
    <p>Inline and block content stay in this same native group.</p>
    <a href="./details.html">Details</a>
  </div>
</div>
```

Only direct `.mui-space-item` children receive item-box styling: border-box sizing,
max-inline-size:100% and the shared direct-child min-inline-size:0. The item is not given
a display mode, role, padding, color or interaction. Its interior remains ordinary native
flow unless the application chooses its own layout class.

- **wrap-item adaptation:** author a real wrapper when a group is needed, or omit it and
  use direct native children. No wrap-item attribute/property inserts, removes or toggles
  wrappers. Adding a class to an existing valid item can avoid an unnecessary element.
- **item-class adaptation:** put the actual desired class on that item. Nothing reads a
  root item-class string and propagates it to descendants.
- **item-style adaptation:** author external CSS for the item class. No string/object style
  adapter or synthetic inline-style merge is supplied. Existing native style attributes
  remain untouched if the application already authored them.

```css
.card-item {
  padding: .5rem .75rem;
  border: 1px solid #96969d;
  border-radius: .5rem;
}
```

Wrapping is a markup/semantic decision, not just a layout flag. An ol/ul still requires
direct li children; use `.mui-space-item` on the li instead of inserting anonymous divs.
Forms retain actual labels, inputs, buttons and their relationships. No automatic
`role="none"` is copied from the source onto the container or items.

Bare text is **not discarded**. Native flexbox represents it as anonymous text items;
whitespace/comments follow browser rules. For stable group boundaries around mixed text,
inline and block elements, author one appropriate span/div/li explicitly. Do not expect
Vue fragment flattening, slot evaluation or HTML parsing.

An empty authored container/item is not removed. Hiding only an item's inner control leaves
the wrapper as a layout unit and can leave a gap. **Hide/remove the actual item wrapper**
when the whole spacing unit should disappear. Hidden roots/direct hidden items stay hidden
despite flex/inline-flex rules. Templates remain inert until explicitly cloned by the
application; repeated IDs and listener binding remain application responsibilities.

## Explicit separators and semantic ownership

An independently authored separator is an ordinary flex item:

```html
<div class="mui-space">
  <span class="mui-space-item">First</span>
  <span aria-hidden="true">/</span>
  <span class="mui-space-item">Second</span>
</div>
```

It consumes a gap on each side and can wrap independently. The library does not insert,
clone, hide, announce or reposition it. Use explicit ARIA/decorative treatment appropriate
to the content; do not hide a group that contains live links/buttons.

To keep related actions and their separator in one outer item, author that group:

```html
<span class="mui-space-item paired-item">
  <a href="./terms.html">Terms</a>
  <span aria-hidden="true">/</span>
  <a href="./privacy.html">Privacy</a>
</span>
```

Put this group directly in a `.mui-space` container and give `.paired-item` an application
layout if needed. The root gap now separates groups, not the inner links. Internal wrapping
is still the group's native CSS policy; no line-aware separator-hiding algorithm is claimed.
A real semantic separator can also be authored deliberately, without requiring Divider.

## Direction, size, alignment and wrapping

Space uses the same explicit flag conventions as Flex:

| Native input | Contract |
| --- | --- |
| `.mui-space` | Native flex row, wrap enabled, align-items:normal, justify-content:flex-start. |
| `data-inline` | Presence selects inline-flex. |
| `data-vertical` | Presence selects column and forces nowrap, even when data-wrap=true. |
| `data-wrap="false"` | Disables wrapping for a row. |
| `data-size="small|medium|large"` | Selects the pinned gap preset; absent/medium uses medium. |
| `--mui-space-align` | Native align-items value, including the source flex-start/flex-end aliases. |
| `--mui-space-justify` | Native justify-content value. |
| `--mui-space-row-gap`, `--mui-space-column-gap` | Explicit native CSS gap values. |

Inline/vertical are presence flags, not parsed Booleans: remove them rather than writing
data-vertical=false. Wrap is a string opt-out exception. Vertical nowrap matches the source.
The source maps start/end justification to flex-start/flex-end; the target's default is
flex-start, and native start/end remain available in its non-reversed layout.
Distributed justification may add space beyond the configured minimum gap.

| Preset | Row gap / vertical spacing | Column gap / horizontal spacing |
| --- | --- | --- |
| small | 4px | 8px |
| medium / absent | 8px | 12px |
| large | 12px | 16px |

The effective source default is medium after its component-provider fallback. The target
uses a local medium CSS default, not provider/component-prop merging.
The source tuple **[horizontalGap, verticalGap] = [20,6]** maps to:

```css
.tuple {
  --mui-space-column-gap: 20px;
  --mui-space-row-gap: 6px;
}
.uniform { gap: 10px; }
```

Native shorthand for the tuple would be `gap:6px 20px`, not the original tuple order.
The axes are not swapped for columns: successive column items use the 6px row-gap.
Numeric/tuple source values are external CSS declarations here, not values parsed from
data-size, JavaScript properties, arrays or JSON.

Use native nonnegative CSS lengths/percentages or normal, with units where required.
Zero intentionally removes a gap. A missing token uses the preset, but a present invalid
token does not trigger the var fallback: native gap becomes initial normal (zero used gap
in flex). Relative/percentage sizing and invalid alignment values follow browser CSS rules;
no runtime coercion, clamp or false validation success is provided.

Internal preset defaults reset per container, so an outer large preset does not leak into
a nested small/default Space. Public custom properties inherit normally; override them
or use `initial` when a nested container should return to its own preset/default.

## Order, responsiveness and scope

Reverse is deliberately omitted, including row/column/wrap reversal helpers. Native
DOM/reading/tab order is authoritative; native RTL row direction begins at inline-start
without reversing the nodes. Use end justification to align a group without reversing it.
The stylesheet adds no tabindex, click handler, role, live region or typography/list reset.

Min-inline-size on the container/direct children and wrapped text allow narrow native
flex/grid nesting. Border-box max sizing on authored items contains their own padding/border.
An item's interior is not traversed or restyled: constrain oversized native controls/assets
inside it explicitly. The demo's field class bounds its input using ordinary application CSS.
For surrounding grids use suitable minmax(0,1fr) tracks; arbitrary fixed-width widgets are
not automatically repaired.

No overflow clipping or focus trapping is supplied. A nowrap row may overflow by design;
choose an explicit application scrolling/print policy rather than hiding usable controls.
The demo prints its scroll row without clipping. No animation, transition, forced-color
opt-out or focus reset exists.

Source gap-support measurement, half-margin/padding fallback, internalUseGap and runtime
wrapper/style branches are omitted. Older browsers without flex-gap may lose spacing;
without flexbox, native HTML remains in ordinary flow. A generic CSS gap test is not
promoted into a flex-gap guarantee. Supply/test a separate authored fallback if required.

Native hidden/ARIA, late content, node identity and listeners remain application-owned.
Until-found is not converted to ordinary hidden by this stylesheet. No pre-upgrade state,
connected/disconnected hooks, observer cleanup or rendering/disposal API is necessary.

## API tracker and numbered acceptance

🟢 Verified **native/CSS adaptation**, not Vue-compatible wrapper/prop/type behavior.
⏭️ Intentionally omitted runtime/order/framework contract.

| Upstream item | Native target | Status / limits |
| --- | --- | --- |
| align | --mui-space-align / native align-items. | 🟢 Browser CSS grammar; no enum/string runtime adapter. |
| inline | Presence of data-inline. | 🟢 Native inline-flex. |
| wrap-item | Explicit authored group or direct native children. | 🟢 Markup adaptation; automatic Boolean wrapper generation/toggling omitted. |
| item-class | Actual class on the author-owned item. | 🟢 No root-string propagation. |
| item-style | External CSS on the actual item class. | 🟢 No string/object adapter or runtime style merging. |
| justify | --mui-space-justify / native justify-content. | 🟢 Default flex-start; native distribution. |
| reverse | Meaningful native DOM order. | ⏭️ Visual reversal helpers omitted. |
| size | Pinned presets or native row/column gap declarations. | 🟢 Correct [H,V] mapping and native scalar/invalid behavior; no parser. |
| vertical | Presence of data-vertical. | 🟢 Column with source-compatible nowrap. |
| wrap | Row opt-out data-wrap=false. | 🟢 No automatic clipping/reverse wrapping. |
| default slot | Original authored items/mixed content. | 🟢 No flattening, dropping text, wrapper insertion or empty-item removal. |
| Source internalUseGap | No internal override/detector. | ⏭️ Internal, not public; gap fallback machinery omitted. |
| Source align flex-start/flex-end | Native CSS alignment aliases. | 🟢 Additional source values recorded explicitly. |
| Source SpaceSize | Native presets and explicit gap declarations. | 🟢 Type clarified; no library type or array parser. |
| Source Justify | Native CSS justification vocabulary. | 🟢 Type clarified; no library type export. |
| Source theme/themeOverrides/builtinThemeOverrides | External CSS/presets. | ⏭️ Three provider/object/internal contracts omitted. |

The reference retains eleven public rows plus seven explicit source supplements:
**18 rows, 13 Verified ADAPTED native targets and 5 intentional omissions**.
There is no invented separator API row.

1. [x] Review actual Space/Flex sources, wrapper/gap branches, all public rows and source supplements.
2. [x] Define author-owned item/mixed-content/separator contracts instead of a renderer.
3. [x] Implement independent CSS with shared native flag/preset conventions and item-box sizing.
4. [x] Preserve native lists/forms/order/hidden behavior without old-browser gap machinery.
5. [x] Add no-JS demo and existing-runner structure/source/native/packaging tests.
6. [x] Validate build/budgets and Chromium grouping/gaps/actions/RTL/zoom/print/coexistence.
7. [x] Reconcile reference rows/four tasks, catalog totals and next Grid.

### Evidence — 2026-09-08

- `pnpm test -- tests\space.test.ts`: **11 focused tests passed**.
- `pnpm build && pnpm test`: **373 tests passed**, including all 362 prior tests.
- Tests cover independent CSS-only export, exact wrapped/unwrapped mixed nodes, author
  classes/styles, presets/axes/modes, explicit separators, native lists/forms, hidden/empty
  units, inert templates, late/reconnected nodes and absence of ordering/renderer machinery.
- Chromium loaded no scripts/injected styles before compatibility tests. Three authored
  groups remained three; bare text stayed present. External classes supplied 12px item
  padding and a 3px accent border without a style-object adapter.
- Preset row/column gaps were 4/8, 8/12 and 12/16px. Tuple [20,6] gave 20px horizontal and
  6px wrapped-row/column-item gaps. Vertical stayed nowrap; inline-flex shrink-wrapped to
  about 61px. Center/space-between and independent nested presets passed.
- A free authored separator consumed a 12px gap on both sides. Decorative separators were
  ignored in Chromium AX; paired links stayed in their original group and native Tab order.
  Native ol/li markers B./C. remained visible/semantic. Reset restored the input, disabled
  controls were skipped, and real GET submission reached `space.html?name=Accepted#destination`.
- Hidden item wrappers contributed no gap item; an empty wrapper with hidden inner content
  correctly remained a native layout unit. Hidden roots and application templates stayed inert.
- At 960/480/320/280px, padded grid-nested items wrapped without page overflow; at 280px the
  long item's client box was 131px wide and its full content height 208px. RTL kept DOM order
  with the expected 16px gap. At 200% CSS zoom, tuple gaps became 40/12px.
- Live CSS 0px/-1px/invalid/1.5rem gaps produced used 0/0/0/24px spacing; invalid tokens
  computed to normal. Native scalar gap:10px set both axes to 10px.
- Forced colors preserved native focus; no motion ran. Print retained gaps, markers/hidden
  states and the complete scroll row. In-memory A4 PDF generation without backgrounds
  returned a valid 42,805-byte PDF; no PDF file was written.
- Late item listeners and reconnect identity passed. CSS-before/after-legacy plus explicit
  independent Flex CSS preserved exact native markup, outside styles, Space 6/20px gaps,
  Flex 8/12px gaps and original legacy row/stack/wrap 8px spacing. No Space registration/global
  appeared. Only the task browser tab was used.
- **Space CSS: 1,122 raw / 423 gzip bytes, under its 1,000-byte ceiling.**
  Flex remains **390 gzip bytes**; core remains **14,611 / 15,000**, with no new dependency or JS bundle.
- Reference validation preserved all eleven original name/source rows plus seven explicit
  source supplements: **96 pages, 3,135 rows, 384 tasks (76 accepted), 750 relative file links**.

This is retained native item/CSS scope, not source wrapper-runtime, old-browser gap,
all-browser/AT or automatic separator behavior. Grid is next through coordinator selection,
then Layout; P2-04/P2 and remaining content work are not complete.
