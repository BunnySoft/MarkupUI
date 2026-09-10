# Auto Complete default-style audit

**2026-09-11 — standalone source and separate Input print follow-up ready.**
Changed only Auto Complete CSS, a new Auto Complete style test and its canonical/
audit documentation for the standalone patch. The separately approved Input follow-up
changes only Input print CSS, three focused tests and Input/Auto Complete documentation.
Controllers, Form/global/shared sources, generated files, dependencies and demos are
unchanged. No full build or commit.

## Reference and isolated method

Pinned commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. AutoComplete delegates its
default editor to NInput and its prefix/suffix slots; it has no independent native
datalist popup skin. Reviewed that delegation and the relevant Input metrics/themes.

Private `.auto-complete-audit` pages bundled existing **Naive UI 2.45.3 / Vue
3.5.30**, plus the unchanged native Auto Complete/Input helpers, with existing
esbuild. Reference popup visibility was held closed. Native pages used original
inputs/datalists and labelled fields. Both used 360px stages and matching
application typography/backdrops.

Private browser contexts never touched shared pages. Fixture files/server were
cleaned up. Input CSS and its helper were unchanged during this standalone comparison;
the later print-only owner follow-up is recorded separately below.

## Matched standalone scope

**12 cases × two themes = 24 matching comparisons**: small/medium/large ordinary,
disabled and prefix+suffix fields; placeholder, disabled placeholder and readonly.

Compared outer field and input rectangles, font size/line height, text/background/
border/radius/opacity, visible placeholder color and affix rectangles. The source's
placeholder is an overlay element while the native field uses `::placeholder`;
actual painted placeholder colors were compared, not its intentionally transparent
source input pseudo-element.

| Size | Before native height/font | After = reference height/font | Padding |
| --- | --- | --- | --- |
| small | 39.729px / 14px | **28px / 14px** | 10px inline |
| medium | 39.729px / 14px | **34px / 14px** | 12px inline |
| large | 46.125px / 18px | **40px / 15px** | 14px inline |

The old input had 8px/10px padding, a GrayText border and .65 opacity when disabled.
Now the standalone wrapper paints the field; its input has zero padding/border and
inherits the wrapper's field-height line box. This also aligns the source affix
boxes without moving or manufacturing affix nodes.

## Palette and focus

| Role | Light | Dark |
| --- | --- | --- |
| Value text | `#333639` | white `.82` |
| Field background | white | white `.1` |
| Disabled text | `#c2c2c2` | white `.38` |
| Disabled background | `#fafafc` | white `.06` |
| Placeholder | `#c2c2c2` | white `.38` |
| Disabled placeholder | `#d1d1d1` | white `.28` |
| Border | `#e0e0e6` | transparent |
| Focus border | `#36ad6a` | `#7fe7c4` |

Actual focused border/background/shadow matched:
light **0 0 0 2px rgba(24,160,88,.2)** on white; dark **0 0 8px 0
rgba(99,226,183,.3)** with **rgba(99,226,183,.1)** focus background.
Disabled fields do not gain hover/focus decoration from the editable-field rule.
No suggestion-open state is inferred from focus.

## Input composition and dependency proposal

Standalone selectors exclude `.mui-input`. This is intentional ownership, not a
copy of the full Input stylesheet. Generic field layout agrees on the 4px gap,
while Input keeps its own border, control metrics, actions and state styles.

Both stylesheet orders measured the composed medium field at **34px**, with a
**34px input, 0px input border and 0px input padding**, and identical dark paint.
The composed fixture's extra native “Clear” button consumes more space than the
reference glyph-only affordance; its exact width is Input/application-owned.
Parent Auto Complete size tokens are not forwarded into Input's independently
owned root.

**Separate Input-owner follow-up, now implemented:** during print, the composed
`.mui-input` remained `color-scheme:dark` with input color **white/.82**. Disabling
Auto Complete CSS gave the **same result**, confirming the issue belongs to the
Input stylesheet. The approved patch adds only `color-scheme:light` to Input roots,
groups and group labels inside Input's print rule. Existing public value/disabled
tokens remain authoritative, and three focused tests cover the stylesheet budget,
scope and retained native nodes. Auto Complete CSS does not override Input ownership.

Standalone print already measured **black normal text**, native GrayText for a
disabled field and light scheme. The composed field now also uses the light print
scheme in both stylesheet orders.

## Native behavior and author evidence

- Construction/focus produced **zero** loader calls.
- “Unlisted town” remained valid free text, submitted literally, retained
  defaultValue “London” and selection range **3–7** across refresh.
- Synthetic composition/input events for “東” produced no query. Committing “東京”
  produced exactly one loader call and supplied “東京 result” without changing
  the input's “東京” value.
- Native reset restored “London” and the exact original datalist nodes.
- Disabled and readonly explicit queries returned **skipped**.
- Existing public standalone overrides retained **42px height, 18px font,
  16px inline padding, navy text, ivory background and teal focus border** after
  reinserting package CSS later.
- Native hidden roots and field wrappers remained `display:none`.
- All existing async, cancellation, error, ownership, IME, native form and
  Input/Form composition tests passed; no controller implementation changed.

The browser composition exercise used DOM composition events; it is not certification
of every OS IME. Actual native suggestion-popup selection was not simulated or
claimed: the helper still cannot distinguish typing a value from choosing it.

## Tests and strict accounting

`node node_modules\vitest\vitest.mjs run tests\auto-complete.test.ts tests\auto-complete-style.test.ts tests\input.test.ts tests\input-print.test.ts`
→ **134 passed**: 68 Auto Complete, seven CSS, 56 read-only Input and three
print-follow-up tests.

| Auto Complete CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,253 | 494 | 1,000 |
| After | 3,526 | 997 | 1,000 |

**Three gzip bytes headroom**, no ceiling relaxation. Compact authored CSS uses
existing esbuild-equivalent whitespace formatting; no builder/runtime formatting
step or shared stylesheet dependency was added. Full isolated distribution/
manifest/build validation remains with the parent.

## Remaining limits

Native datalist popup geometry, matching, rows, group rendering and selection
signals remain platform-owned or omitted. No custom combobox, keyboard capture,
value rewriting, grouped option renderer, binding/template engine or source
popup lifecycle was added. Modern `:has()`/`light-dark()` support is required
for the enhanced standalone skin; older-engine skin/focus parity is not claimed.
Application text/labels/status content still need an appropriate document theme.
Only Chromium was rendered. The composed Input print dependency is fixed by the
separate owner patch above; all other retained differences remain explicit.
