# Select default-style audit

**2026-09-11 — integrated native-field correction.** Changes are limited to Select CSS,
a Select-specific style test and its two documentation files. Select controller,
Popselect/Popover/shared helpers, generated files, demos and dependencies are
unchanged. No full build or commit was run.

## Reference and isolated rendering

Reference commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Reviewed Select's peer-theme composition, InternalSelection light/dark styles,
size constants and native Select/Popselect contracts.

Private `.select-audit` pages bundled existing **Naive UI 2.45.3 / Vue 3.5.30**
and the unchanged `createSelect` helper with existing esbuild. Naive's closed
trigger used selected Alpha, controlled closed popup state and actual peer styles.
Native pages used real labelled select/options/optgroups and source CSS. Matched
light/dark document backgrounds and 360px fields controlled the comparison.
Private browser contexts, fixture files and server were cleaned up.

The reference has separate ordinary/state border layers: warning/error paint was
read from the visible state layer, not incorrectly from the ordinary border below.

## Measured corrections

**11 closed single cases × two themes = 22 matching comparisons** in field
width/height, font size, selected text color, background, painted border color and
radius: tiny/small/medium/large enabled and disabled, warning, error and borderless.

| Size | Before font / measured height | After = reference font / height |
| --- | --- | --- |
| tiny | 12px / 22.667px | **12px / 22px** |
| small | 14px / 29.333px | **14px / 28px** |
| medium | 16px / 40px | **14px / 34px** |
| large | 18px / 50.667px | **15px / 40px** |

Before padding was 2/4/8/12px by size. New defaults are `0 12px`, with a size-specific
minimum height. Radius changed **6px → 3px**. Native arrow/text insets are still
platform-owned; a real border is not the reference's absolute border-layer anatomy.

| Role | Before | After light / dark |
| --- | --- | --- |
| Text | `#17212b` | `#333639` / white `.82` |
| Background | white | white / white `.1` |
| Disabled text | `#64707a` | `#c2c2c2` / white `.38` |
| Disabled background | same as enabled | `#fafafc` / white `.06` |
| Border | `#687787` | `#e0e0e6` / transparent |
| Radius | 6px | 3px |

Enabled focus borders matched **#36ad6a light / #7fe7c4 dark**. Naive paints a
2px translucent halo in light and an 8px blur in dark; native Select deliberately
retains a **2px solid outline with 2px offset**. Borderless focus kept a transparent
border and visible outline. No native arrow/picker suppression was introduced.

## Native multiple, options and groups

These are different native controls, not failed reproductions of a chip renderer:

- The selected two-value native multiple list (`size=4`) measured **80px** high;
  the reference's closed multi-tag trigger measured **34px**.
- The native grouped single list (`size=5`) measured **99.667px**, versus the
  reference's closed 34px trigger.
- Both native list specimens matched the same checked field font/text/background/
  border/radius roles; only their native row-driven height differed.
- Native optgroup labels retained bold **700**, original label strings and disabled
  group state. No option/group selectors or replacement rows were added.
- `appearance` stayed **auto**. A trusted application button successfully called
  native `showPicker()` and Escape closed it. No library show/hide state or custom
  dropdown was introduced.

Native option painting, row metrics, selected highlights, checkmarks and popup
geometry vary by browser/OS. This audit does not claim custom-menu/option artwork,
multiple chips, placeholder rendering or cross-platform popup pixel parity.

## Native behavior and author regressions

- Native ArrowDown selected Beta and produced exactly one input and one change
  notification; the original helper observed value `"b"`.
- Programmatically selected values `["a","b","c","d"]` included a disabled option
  and an option inside a disabled group. Native FormData submitted only
  `["a","b"]`; reset restored those authored defaults. Option identities stayed equal.
- Public overrides retained **18px font, 7px 13px padding, navy text, ivory
  background and teal focus border/outline** after a later package stylesheet.
- Size/status recipes use private values rather than overwriting public font,
  padding or border tokens. Shared warning/error/success values are consumed in
  their correct semantic roles, not substituted for generic surface/text values.
- Dark scheme kept native lists/pickers coherent. Forced colors produced system
  white-on-black while preserving `appearance:auto`.
- Print over an inherited dark scheme computed light native UI, black enabled
  field text and system-gray disabled text. Single/multiple/group fields remained
  visible, with white or light disabled backgrounds.

CSS `light-dark()` support is required for the color defaults. Native selection,
forms and helper behavior do not become a custom renderer in older engines.

## Derived Popselect impact — no consumer edits

The existing composition order is **Popover CSS + Select CSS + Popselect CSS**.
Holding the currently read surrounding sources fixed:

| In-memory composition | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Current Popover/Popselect + original Select | 6,203 | 1,785 | 2,500 |
| Same surrounding sources + corrected Select | 6,752 | 1,986 | 2,500 |

The Select contribution adds **201 composed gzip bytes**, leaving **514 bytes**
of composed headroom. These are not regenerated distribution/manifest measurements;
parallel changes to surrounding sources require the parent's final build.

Read-only consumer rendering confirmed:

| Popselect override | Before / after font and padding | Before / after list height |
| --- | --- | --- |
| small | **14px / 4px** unchanged | **107.667px** unchanged |
| large | **18px / 12px** unchanged | **150.333px** unchanged |

The embedded field's light border changed from `#687787` to `#e0e0e6`, and radius
from 6px to 3px. Its existing explicit public size overrides still win; the large
consumer does not silently become standalone Select's 15px preset. No Popselect,
Popover or shared-base edit is proposed as necessary for this correction.

## Validation and standalone budget

`node node_modules\vitest\vitest.mjs run tests\select.test.ts tests\select-style.test.ts tests\popselect.test.ts`
→ **81 passed**: 40 Select, six CSS, 35 Popselect.

| Select CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 2,615 | 780 | 1,000 |
| After | 3,164 | 982 | 1,000 |

**18 bytes headroom**, no ceiling relaxation. Existing esbuild whitespace
compaction adds no builder/runtime step. Controller/entry sources are unchanged.
The coordinator's isolated release build and all **81 Select/Popselect tests** passed.
Final Select CSS is **982/1,000 gzip bytes**; the released-base Popselect composition
is **1,991/2,500 bytes**. Popselect is now complete and integrated against the released
Select baseline, so there is no pending shared guard dependency.

## Scope boundary

No custom popup, option/group/chip renderer, hidden input, combobox keyboard model,
binding language, filtering engine expansion or shared helper change is included.
Native focus outline and popup/list geometry limits remain explicit. Only Chromium
was rendered; no all-browser/OS/AT certification is claimed.
