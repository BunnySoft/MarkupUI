# Affix: rendered native-sticky audit

**2026-09-10 — no component CSS change warranted.**
The existing stylesheet correctly implements the documented native-sticky alternative.
It is not the upstream fixed/absolute scroll controller. No runtime, observer, placeholder,
target parser, theme paint or gratuitous CSS was added.

## Reference, scope and reproducibility

- [Official Affix page](https://www.naiveui.com/en-US/os-theme/components/affix).
- Rendered **naive-ui@2.45.3 / vue@3.5.30**, pinned source commit
  [`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`](https://github.com/tusen-ai/naive-ui/tree/42a52e6436b38bed456fee19eb0b89cdcd00fcc2).
  Inspected `Affix.tsx`, Affix CSS and `utils.ts`.
- Native baseline is MarkupUI `ad26093ea9c34265e362c916021f5b2f8252d067`.
  `src/components/affix/affix.css` remains byte-for-byte unchanged in this audit.
- The source starts with a normal static div. It listens to a document or selected
  target, samples rectangles, stores activation scroll positions, and adds fixed/
  absolute positioning with top/bottom inline styles. It neither teleports the div
  nor inserts a placeholder or copies its original width.
- Native remains `position:sticky`, with auto/auto insets and local layer 1 by default.
  It uses normal-flow width/space, the nearest scrolling ancestor and a containing-block
  travel limit. It has no separate activation threshold or affixed-state API.
- Private fixture directory:
  `C:\Users\chengzhu\.copilot\session-state\99fde562-4396-4c35-9601-b00d03e1c14e\files\style-reference\affix`.
  `build.mjs` uses existing esbuild only for the Vue comparison. Native links the
  unchanged CSS. `node server.mjs` serves a fixed allowlist on
  `http://127.0.0.1:4207`; server is stopped after verification.
- Routes `reference.html` / `markup.html`, with `mode=default`, `top`, `bottom`,
  `nested-top`, `nested-bottom-late`, `nested-bottom-early`.
  `dark`, `rtl`, `custom`, and native `core` / `core&reverse` select labeled variants.
  Nested reference cases explicitly use `listenTo="#scroll"`; the native alternative
  uses the actual scroll ancestor, not a selector API.
- Chromium **151.0.7922.174**, Windows fonts, **740×800 viewport, DPR 1**.
  Private contexts are closed in `finally`; shared active pages are not used.
  Scroll anchoring is disabled in fixtures to isolate the positioning behavior.
- The fixture has a **meaningfully painted toolbar**, not an empty transparent div:
  text, a styled native button and input, border, padding and light/dark background.
  That skin belongs to the application and is identical on both pages.
  Default toolbar height is **46.390625px**. Window content is 500px wide; the nested
  scrollport has a 500px CSS width, 180px height, 2px borders and a scrollbar, leaving
  **485px content width** in this environment.
- Evidence: `scroll-traces.json` (50 measured states in six scenario pairs),
  `inheritance-traces.json` (64 states / 32 documents), `coexistence.json`,
  `native-checks.json`, plus initial/active/released and dark/RTL/custom screenshots.

## Actual scroll traces: matching a top coordinate is not parity

Coordinates below are viewport-relative unless identified as flow coordinates.
These numbers compare the real source controller with unchanged native CSS.

| Scenario / scroll | Reference | Native sticky | Meaning |
| --- | --- | --- | --- |
| No offsets, window scroll 0 | Static, (24,144), 500×46.390625 | Sticky, same rectangle, auto/auto insets | Both remain unclamped; computed positioning/stacking models still differ |
| No offsets, scroll 180 | y=-36 | y=-36 | Native does not invent a default top=0 constraint |
| Top=8, scroll 100 | Static y=44 | Sticky y=44 | Before either constraint activates |
| Top=8, scroll 180 | Fixed y=8, **width 203.484375** | Sticky y=8, **width 500** | Same top coordinate, different width and flow behavior |
| Top=8, scroll 450 | Fixed y=8 | Sticky y=7.609375 | Native reaches the containing-block end |
| Top=8, scroll 650 | Fixed y=8 | Sticky y=-192.390625 | Native releases out of view; source stays fixed |
| Late window bottom=8, scroll 0/160 | Fixed y=745.609375, width 203.484375 | Sticky y=745.609375, width 500 | Both reach viewport end here, not the same layout model |
| Late window bottom, scroll 400 | Static y=624, width 500 | Sticky y=624, width 500 | Normal flow has moved clear of the end constraint |
| Late window bottom, scroll 1500 | y=-476 | y=-476 | Bottom-only does not add a top constraint |
| Nested top=8, scroll 160 | Fixed **y=8**, width 203.484375 | Sticky **y=34**, width 485 | Source's fixed coordinate is viewport-relative; native is 24px scrollport top + 2px border + 8px inset |
| Nested top, scroll 600 | Fixed y=8 | Sticky y=-140.390625 | Native containing-block/scrollport limits remain active |
| Late nested bottom=8, scroll 0/260 | Fixed **y=745.609375** | Sticky **y=151.609375** | Source docks to viewport bottom; native to its own scrollport bottom |
| Late nested bottom, scroll 520 | Static y=106 | Sticky y=106 | Both return to the flow rectangle for this sample |
| Early nested bottom, scroll 0/80/160 | y=26 / -54 / -134, static | Same y values, sticky | A bottom inset cannot dock an arbitrary early-flow element |

The nested scroller's content edge is y=26 and its inner bottom is y=206; native
bottom=8 therefore constrains the toolbar bottom to y=198. A reference `listenTo`
target controls event/threshold measurement, not the destination of fixed CSS top/bottom.
The source measures the target border rectangle; native sticky uses its scrollport.

### Flow space and actual nodes

- The window-top following marker remains at document **y=190.390625** in native
  before/after sticking. Source activation moves it to **y=144**, a loss of
  **46.390625px**, because the fixed toolbar leaves flow without a placeholder.
- Nested-top native following content stays at content-coordinate **166.390625**;
  source moves it to **120** when fixed.
- Late-bottom native flow coordinates remain constant even when the toolbar is visually
  pulled upward. Source following content shifts while fixed, then returns on deactivation.
- Both implementations retained the same actual toolbar descendants in measured states.
  The lane always had **three children**, confirming that neither added a placeholder.
  Native does not need a placeholder because sticky itself retains its flow slot.

Screenshots show the painted narrow fixed toolbar versus the full-width sticky toolbar,
the viewport/nested-bottom difference, and the native release beyond the containing block.
No “pixel parity” score is inferred from unpainted wrapper defaults.

## Styled content, dark mode, RTL and author tokens

Affix has no independent typography or light/dark skin. Native correctly adds no color,
background, font, border or padding declarations. Shared document styling and the
author-owned toolbar determine the paint.

- Across light/dark, LTR/RTL, default/custom styling and default/nested-top cases,
  **32 paired samples** had identical wrapper/content/control paint properties:
  family, size, leading, weight, color, background, padding, border and radius.
  The checked in-flow rectangles also matched. This verifies inheritance only;
  it does not erase the active rectangle/stacking/flow differences above.
- The authored variant used **18px monospace / 27px leading**, text `rgb(1,2,3)`,
  panel background `rgb(221,238,255)`, 12px padding, a 2px `rgb(52,86,120)` border,
  8px corners and a local layer 7. Both retained a **61px** toolbar height.
- In dark RTL nested-top at scroll 160, native was **(229,34), 485×61**.
  Source was **(455.125,8), 258.875×61**, demonstrating normal RTL static-position
  anchoring plus fixed shrink-to-fit, not an added native mirroring algorithm.
  DOM order and inherited direction remained unchanged.
- Native dark nested-top measurements were unchanged after adding canonical core/themes
  CSS in either order.
- Element-local inset/layer overrides remain authoritative. Nested Affix defaults
  deliberately reset auto/auto/1, as the existing contract specifies; positional offsets
  are not accidentally inherited from a containing Affix.

Inactive source is static with auto z-index/content-box sizing. Native still has a
sticky stacking context, local layer 1, border-box sizing and min-inline-size 0.
Those existing native choices can matter in overlap or direct-wrapper styling scenarios;
no unrestricted inactive-wrapper CSS parity is claimed.

**Shared token changes needed: none.** Adding Affix-specific paint or theme tokens would
be gratuitous: the correct behavior is to preserve the application's content styling.

## JavaScript-disabled native checks and validation

- Page scripts did not execute and no `mui-affix` constructor existed, yet native RTL
  nested scrolling held the actual 8px inset. Changing the element's CSS token to 20px
  produced **20px**, with width **485px** and layer **7**.
- Following-content flow coordinate stayed **166.390625**. Original nodes, input value
  **Changed**, field focus and native disabled state survived scrolling/token changes.
- Print computed **static / top auto / bottom auto / z-index auto**. This verifies the
  positioning reset, not removal of application-owned scroll-container clipping.
- Native reset restored **Original**, required validation blocked empty submission,
  and a real form submitted **`?project=NoJS`**. Templates stayed inert.
- `pnpm exec vitest run tests\affix.test.ts`: **12/12 passed**. Added no-paint/no-type
  invariants, the strict gzip guard and explicit nested offset/layer reset coverage.
- CSS remains **618 raw / 270 level-9 gzip bytes**, below the unchanged **500-byte**
  ceiling; component JS and runtime dependencies remain **zero**.
- `git diff --exit-code -- src\components\affix\affix.css` confirms no stylesheet edit.
  No shared/index/generated files, full build, commit, push or broadcasts were changed/run.
  Parent owns final integration.

### Coordinated release integration

The coordinator's isolated release `pnpm build` and all **12 Affix tests** passed.
CSS remains unchanged at **270 gzip bytes**, within the 500-byte ceiling.
This accepts the documented native-sticky alternative, not fixed-controller parity.

## Explicit limits and outcome

- No fixed/absolute positioning mode, arbitrary target API, independent trigger/offset
  aliases, stored activation state, affixed notification or update method was added.
- Containing blocks, overflow/scroll ancestry, transforms, sticky stacking, logical
  writing modes and width remain browser layout responsibilities.
- Bottom-only behavior requires the right normal-flow placement. Oversized elements
  and simultaneous insets retain CSS constraints, not two independent source triggers.
- Native print behavior, hidden-until-found, arbitrary overlap/clipping and all-browser/
  assistive-technology behavior are not certified by these bounded traces.
- Existing canonical documentation already describes the correct native alternative.
  **Outcome: preserve the component CSS; strengthen tests and empirical documentation.**

See the [canonical Affix guide](../../components/affix.md) for retained usage and omissions.
