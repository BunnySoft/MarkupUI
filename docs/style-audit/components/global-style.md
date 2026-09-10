# Global Style default-theme audit

**2026-09-10 — integrated defaults fixed; shared-preset limits remain.** Scope: the explicit standalone
Global Style stylesheet, its tests and documentation. No core, preset, plugin,
generated asset, other component, demo, binding or template changes.

## Reference and isolated method

- Pinned Naive UI source: commit `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`,
  `src/global-style/src/GlobalStyle.ts`, `src/_styles/common/light.ts`,
  `src/_styles/common/dark.ts` and `src/_styles/common/_common.ts`.
- Rendered reference: existing Naive UI **2.45.3** and Vue **3.5.30**, bundled with the
  repository's existing esbuild. Installed GlobalStyle implementation was checked
  against the pinned source: it reads `textColor2`, `bodyColor` and common typography.
- Private `.global-style-audit` fixture, local server, and a fresh browser context;
  no shared browser page or sibling fixture was changed. Each reference page mounted
  only NConfigProvider/NGlobalStyle plus sample text; each candidate page linked
  source CSS and native sample text/input. No showcase wrapper or demo CSS.
- Chromium computed styles were compared under emulated light/dark preferences;
  reference dark used `darkTheme`. Measurements waited **400ms** after mounting:
  Naive's 300ms body transition otherwise produces misleading intermediate RGBA values.
- Preset cases applied the actual `src/theme/presets.json` tokens at html, not guessed
  colors. The fixture and its server were removed/stopped after verification.

## Measured before / after

Colors below are computed body foreground / background. Dark foreground alpha is
intentional and must not be replaced with an opaque visually similar gray.

| Case | Light | Dark |
| --- | --- | --- |
| Naive reference | `rgb(51,54,57)` / `rgb(255,255,255)` | `rgba(255,255,255,.82)` / `rgb(16,16,20)` |
| Before, standalone | `rgb(0,0,0)` / `rgb(255,255,255)` | `rgb(255,255,255)` / `rgb(18,18,18)` |
| After, standalone | **Reference match** | **Reference match** |
| Existing shared preset, before and after | `rgb(24,24,27)` / `rgb(246,247,249)` | `rgb(250,250,250)` / `rgb(17,17,19)` |
| Existing shared preset + body-only opt-in | **Reference match** | **Reference match** |

All reference/before/after cases use the same computed `v-sans, system-ui,
-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Apple Color Emoji",
"Segoe UI Emoji", "Segoe UI Symbol"` family, **14px font**, **22.4px line height**,
and **0px margin**. Those typography corrections were already made by Avatar; this
audit does not repeat them. Zero padding on the unstyled specimen is UA behavior,
not a new MarkupUI padding reset.

## Change and author-token regressions

Only two CSS declarations changed. Body colors resolve in this order:

1. `--mui-global-style-color` / `--mui-global-style-background-color`;
2. existing `--mui-text-primary` / `--mui-bg-page`;
3. reference colors selected by `light-dark()`.

No token definitions, JS, registrations, transitions or automatic theme writes were
added. The body-only override is a deliberate compatibility escape hatch: a legacy
application can opt into Naive body colors without recoloring shared-token components.
See the [canonical recipe](../../components/global-style.md#document-theme-versus-a-scoped-theme).

Chromium regression results:

| Probe | Measured result |
| --- | --- |
| Existing author shared tokens | purple/beige → `rgb(128,0,128)` / `rgb(245,245,220)` |
| Body-only tokens over shared tokens | teal/pink → `rgb(0,128,128)` / `rgb(255,192,203)` |
| Opt-in over actual presets | Reference body colors; root shared tokens stayed `#18181b`/`#f6f7f9` and `#fafafa`/`#111113` |
| Authored html `color-scheme: light` on dark OS | Light reference body colors |
| Author typography tokens and padding | Georgia/18px, line-height **31.5px**, padding **7px** |
| Native input during author typography | UA Arial/**13.3333px**, not reset |
| Descendant scoped color tokens | No upward effect on body |
| Ordinary author body rule before a later package sheet | maroon/ivory, margin **13px** retained |
| Forced colors with author token colors present | system white/black, not teal/pink |
| Print with author token colors present | system black/white, not teal/pink |
| Motion | MarkupUI **0s**; Naive **0.3s** foreground/background transitions intentionally omitted |

## Shared palette proposal — not implemented

Do **not** change shared `text-primary` to Naive `textColor2` merely to fix body:
it conflates primary component text with Naive's body/secondary role. Prefer the
body-only opt-in above now; keep it application-authored external CSS. That path
adds **zero core JS bytes**, important with the reported **14,996/15,000** core limit.

If a separately approved *opt-in Naive preset* is later introduced, assess these
role mappings together rather than silently replacing the legacy palette:

| Shared role | Current light / dark | Proposed Naive light / dark |
| --- | --- | --- |
| `bg-page` → `bodyColor` | `#f6f7f9` / `#111113` | `#fff` / `#101014` |
| `text-primary` → `textColor1` | `#18181b` / `#fafafa` | `#1f2225` / `rgb(255 255 255 / .9)` |
| `text-secondary` → `textColor2` | `#52525b` / `#d4d4d8` | `#333639` / `rgb(255 255 255 / .82)` |
| `text-tertiary` → `textColor3` | `#71717a` / `#a1a1aa` | `#767c82` / `rgb(255 255 255 / .52)` |
| `global-style-color` → `textColor2` | absent | `#333639` / `rgb(255 255 255 / .82)` |
| `global-style-background-color` → `bodyColor` | absent | `#fff` / `#101014` |

Use explicit document scheme selection matching the application's chosen preset;
fixed dark tokens alone do not switch native controls or `light-dark()`. Scope a
future palette by an explicit application attribute or separately linked stylesheet;
do not modify the current light/dark presets in place. Broad surface, border,
status and hover palette parity still needs each consumer's audit.

Blast radius: current source CSS consumes `bg-page` only in Global Style, but it is
a public token and external applications may use it. `text-primary` is consumed by
standalone Alert, Tag, Breadcrumb, Empty, Layout, List, Descriptions, Timeline,
Thing, Progress, Table, Result, Statistic and Spin, plus legacy core and both
plugins. Core consumers include Card, form controls, tabs, accordion, menu,
pagination, dialogs/drawers, tooltip/popover, messages/notifications and app text.
Secondary/tertiary palette migration likewise affects muted text across components;
it cannot be signed off from a body specimen. Body-only tokens avoid that shared-token
blast radius, though unstyled text naturally inherits the new body foreground.

## Validation and budget

- **14 passed, 1 intentionally unselected**:
  `node node_modules\vitest\vitest.mjs run tests\global-style.test.ts --testNamePattern="^(?!.*builds byte-identical)"`.
  Tests cover source budget, exact fallback/token precedence, native media colors,
  zero-specificity selectors, lifecycle, author ownership and existing demo behavior.
- The unselected existing distribution byte-identity/manifest test requires the
  coordinated build. An initial unfiltered run correctly failed that assertion
  because dist still contained the old CSS; generated files were not edited to hide it.
- CSS source: **774 raw / 374 gzip before → 899 raw / 435 gzip after**,
  gzip level 9. **500 gzip ceiling unchanged**, 65 bytes headroom.
- No full build, commit, core remeasurement or distribution regeneration performed.
  The build owner must rebuild and rerun all **15 Global Style tests** and the normal
  manifest/budget gates. Historical canonical delivery measurements are not evidence
  that this integrated build has already passed.

### Coordinated integration

The coordinator ran `pnpm build` successfully and all **15 Global Style tests** passed,
including the previously unselected distribution byte-identity/manifest test. The combined
Card, Alert, Tag, Global Style, Typography, legacy/theme and browser suite passed
**135 tests**. Built Global Style is **899 raw / 435 gzip bytes**, below the unchanged
500-byte ceiling. The isolated-audit pending items above are resolved by this integration.

## Honest remaining differences

Existing shared presets retain the measured page/text differences unless the body-only
recipe is selected. Fallback colors require modern CSS `light-dark()` support; only
Chromium was rendered in this audit. The stylesheet retains system preference
selection, whereas Naive defaults to light without a dark provider. Padding reset,
text-size/tap-highlight changes, transitions, inline singleton ownership and provider
synchronization remain deliberately omitted. This is default body-style parity,
not runtime, global reset, control styling, cross-browser or full-theme parity.
