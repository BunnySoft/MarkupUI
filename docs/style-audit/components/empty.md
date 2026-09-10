# Empty visual-default audit

Date: 2026-09-10. Scope: optional enhanced Empty and controller-free `.mui-empty`
appearance. Alert files remain frozen; no shared source, binding/template work,
root demo, aggregate rebuild or registration changes belong to this audit.

## Reference and rendered evidence

- Pinned Naive UI source: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered packages: `naive-ui@2.45.3`, `vue@3.5.30`; `NEmpty` inside
  `NConfigProvider` with explicit light defaults or `darkTheme`.
- Theme/layout source inspected: `src/empty/styles/{_common,light,dark}.ts`,
  `src/empty/src/styles/index.cssr.ts`, and `Empty.tsx`.
- Chromium private contexts; 900×2200 viewport, device scale 1, 360px host width,
  matching system font, 14px/1.6 surrounding typography, and identical content.
- Twelve cases in each theme: five sizes, default with extra, no-icon with extra,
  no-description with extra, extra-only, blank authored description, wrapped text,
  and a shared authored SVG with extra content.
- `measurements.json`, light/dark before/reference/after screenshots, isolated build
  outputs and fixture sources are in coordinator session `files/empty-style-audit`.
  Fixture dependencies are reused from the existing reference workspace, not shipped.

Both implementations were actually rendered. All captured steady-state geometry,
typography and palette fields match after the changes in these 24 cases; source
inspection alone was not used to declare parity.

## Before / after measurements

Heights in pixels at the fixture's 1.6 line height. The after column equals the
rendered reference in both themes.

| Case | Before height | Reference / after height |
| --- | ---: | ---: |
| tiny | 140 | 55.188 |
| small | 140 | 64.391 |
| medium/default | 140 | 70.391 |
| large | 140 | 78 |
| huge | 140 | 85.594 |
| default with extra | 150 | 104.781 |
| no-icon with extra | 140 | 56.781 |
| no-description with extra | 140 | 74.391 |
| extra-only | 140 | 34.391 |
| blank authored description | 140 | 48 |
| wrapped description | 159 | 92.781 |
| authored SVG with extra | 150 | 104.781 |

Concrete corrections:

- Removed the imposed 140px minimum and 24px padding; default content now starts at y=0.
  Existing min-height/padding tokens remain available for deliberate roomy containers.
- Preserved the correct 28/34/40/46/52px icon and 12/14/14/15/16px font-size ladders.
- Replaced forced 1.5 line height with inheritance. At medium the description line box
  changed 21→22.391px; at huge it changed 24→25.594px.
- Removed host-wide flex gap. A visible icon contributes an 8px description margin;
  extra content independently contributes 12px, even when it is the only visible region.
- Default description y changed 83.5→48; default-with-extra extra y changed 105→82.391.
- Removed forced centering of description text. In the 360px wrapping case, description
  width changed 312→360 and height 63→44.781, with inherited start alignment.
- Extra content remains centered; native recovery-control layout is retained.

## Palette and original illustration

| Role | Before light and dark | Reference / after light | Reference / after dark |
| --- | --- | --- | --- |
| Description | `#636366` | `#c2c2c2` | white at `.38` |
| Icon | `#a4a4ad` | `#c2c2c2` | white at `.38` |
| Extra text | `#333639` | `#333639` | white at `.82` |

The before columns describe the standalone fixture, not an application supplying its
own global color tokens. The prior stylesheet also incorrectly borrowed legacy secondary
text roles when those tokens existed. Local light/dark role defaults avoid that mismatch.
Nested light scopes reset dark defaults; authored component color tokens remain authoritative.

The old sloped tray was replaced with an **independently expressed two-path inbox and
unavailable badge**. It uses a rounded outline, a filled circular badge, and a transparent
cross cutout. No upstream path data, icon library, runtime dependency or HTML-string
renderer was copied or introduced. SVG namespace, decorative ARIA, nonfocusability and
`currentColor` behavior are retained. Generated SVG identity survives description/size/
visibility changes; authored graphics remain untouched.

This is deliberately not the exact Naive UI illustration. Whole-screenshot comparison:

| 900×2200 image | Differing RGB pixels before | Differing RGB pixels after | After outside icon bounds |
| --- | ---: | ---: | ---: |
| Light | 24,259 | 4,986 | 0 |
| Dark | 24,335 | 5,028 | 0 |

Any changed RGB channel counts as a difference. Icon exclusions use reference viewport
bounds plus 1px for antialiasing. Remaining differences are original icon geometry;
exact illustration/pixel parity is not claimed. The shared authored-SVG case also checks
that caller artwork can be rendered without a generated-illustration substitution.

## Additional browser checks

- Loading legacy core CSS after enhanced Empty CSS left all measured fields unchanged
  in both themes. Legacy-only Empty was not rewritten.
- All twelve RTL cases matched reference measurements. Changing the surrounding
  `line-height` to `2` also matched, confirming real inheritance rather than a hardcoded
  1.6 imitation.
- `show-icon="false"` and native `hidden` on the icon both moved description y to 0,
  without deleting authored content. Generated SVG identity survived the update cycle.
- Marked templates remained `display:none`; templates between generated icon and
  description did not remove the required 8px visible-region spacing.
- Nested huge/default components kept independent 52px/40px icon defaults.
- Nested dark→light scope restored the light description/icon color and 70.391px
  default geometry.
- A controller-free native section with icon/description/extra measured 104.781px,
  matching the corresponding reference layout.
- Author overrides produced a 180px host, 10px padding, 56px icon, 17px/34px text,
  10px description gap and 20px extra margin. Description y=76 and extra y=130.
  Authored background/description/icon/extra RGB colors were honored.
- Native Enter and Space each activated an authored recovery button once, with focus
  preserved. The host acquired no inferred live or interactive semantics.

## Shared roles, author contract and limitations

No shared CSS/theme/generated adapter was edited. Empty requires upstream disabled-text/
icon roles (`#c2c2c2` or white `.38`) and ordinary extra text (`#333639` or white `.82`),
not the legacy secondary-text role. The coordinator may consolidate equivalent shared
roles later without changing public component-token precedence.

`--mui-empty-gap` now controls only the visible icon-to-description margin.
`--mui-empty-extra-margin` specifies the complete extra margin, not an addition to a
host flex gap. To retain the older roomy presentation, explicitly set the existing
140px minimum/24px padding tokens and author `justify-content: center` if desired.
See [Empty](../../components/empty.md) for all supported appearance tokens.

Limits retained intentionally:

- Original illustration, not copied vendor artwork.
- Explicit empty description overrides and the legacy text-glyph `icon` convenience
  remain native contract differences.
- Authored headings, graphics, extra controls and arbitrary custom themes remain caller
  responsibilities; this matrix does not certify every possible slot composition.
- No color-transition animation is added. Theme updates are immediate rather than
  upstream's color tweening; no motion engine is introduced.
- Upstream's muted description defaults are low contrast. Visual fidelity is not a
  WCAG contrast or screen-reader announcement certification; use author color tokens
  when stronger application contrast is required.
- Chromium only. Font substitutions, other browser engines, speech output and
  application-specific focus/announcement policies require downstream verification.

## Validation and budgets

- `pnpm test -- tests\empty.test.ts`: **24 tests passed**.
- Existing esbuild settings, isolated production-named outputs, gzip level 9:

  | Output | Measured gzip bytes | Unchanged ceiling |
  | --- | ---: | ---: |
  | Empty ESM | 1,712 | 2,500 |
  | Empty classic | 1,922 | 2,500 |
  | Empty CSS | 850 | 1,500 |

- The coordinator subsequently ran `pnpm build` successfully, including declarations
  and package budget gates. All **24 Empty tests** passed alongside **16 Divider
  tests**; final manifest gzip matches the isolated values above.
- No build budget was relaxed; no production dependency was added.
