# Color Picker default-style audit

**2026-09-11 — native trigger defaults fixed; OS chooser remains native.**
Changed only Color Picker CSS, its existing fixture and canonical/audit documentation.
Controller code, Input/Form sources, demos, generated files and dependencies are
unchanged. No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the existing native Color Picker
demo in Chromium. The current source stylesheet was isolated from the old built CSS
before measuring sizes and computed light/dark paint.

The source trigger fills its containing block and renders its own color/value layer.
MarkupUI retains the actual `input[type=color]`, including its browser/OS swatch and
chooser. Height, type, border and surface are parity targets; full-width custom trigger
content and popup internals are not.

## Measured defaults

| Size | Reference height / font | Native after height / font | Retained native width |
| --- | --- | --- | --- |
| small | 28px / 14px | 28px / 14px | 40px |
| medium | 34px / 14px | 34px / 14px | 52px |
| large | 40px / 15px | 40px / 15px | 64px |

Both use a **3px** radius. Light border/background are `#e0e0e6` / white. Dark
border/background are white `.24` / `#48484e`, matching the source trigger roles.
Hover/focus use `#36ad6a` / `#7fe7c4`; focus adds the established light halo/dark
glow. Disabled controls use `#fafafc` / white `.06` without opacity loss.

Public `--mui-color-picker-` tokens own width, height, font size, color, border,
radius, background, focus/ring and disabled paint. Size selectors set private
defaults, so authored public values remain authoritative.

## Draft composition and native limits

The standalone hex draft receives the medium field height, 12px inline padding,
3px radius and matching light/dark field paint. Selectors exclude
`[data-input-control]`: when the same native field is enhanced by Input, Color Picker
does not compete for its sizing, padding, border or background.

The actual color input keeps native appearance. CSS does not replace its swatch,
datalist palette, focus activation, chooser dialog, eyedropper, alpha/colorspace
capabilities or OS rendering. The helper's existing strict `#RRGGBB`, form/default,
dirty-draft and event contracts are unchanged.

Forced colors use Canvas/CanvasText/GrayText while preserving the native chooser.
Print selects the light color scheme. No all-browser chooser, print or assistive-
technology parity is claimed.

## Validation and budget

Four checks were added to the existing fixture for the package ceiling, measured size
defaults, Input composition exclusion and explicit native/media ownership. All
**52 Color Picker tests** pass.

| Color Picker CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 1,258 | 458 | 1,000 |
| After | 3,335 | 911 | 1,000 |

No ceiling or dependency changed. Full cross-component/build validation remains with
the parent audit.
