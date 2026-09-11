# Divider default-style audit

## Pinned demo parity page — 2026-09-11

The runnable page mirrors Basic, Title and Vertical in source order. Basic uses a native
thematic `hr`; titled dividers use one labelled separator owner with left/right/dashed
variants; vertical rules remain decorative between inline text. Every example has an
icon-only highlighted code view.

Chromium 152 confirmed all three cases, two vertical rules, the Left/Right/Dashed labels
and zero console errors. No new component gap was found: MarkupUI’s explicit labelled
separator anatomy is the accepted accessible replacement for a framework default slot.

**2026-09-10 — integrated defaults fixed; native differences documented.** Only Divider CSS, Divider
tests and its two documentation files changed. No dependency installation, shared
source, generated files, full build or commit. Global Style/Typography remained frozen.

## Reference and isolated rendering

Pinned source commit: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
Inspected `src/divider/src/Divider.tsx`, `src/divider/src/styles/index.cssr.ts`,
`src/divider/styles/light.ts`, and common light/dark colors. Divider consumes
`dividerColor`, `textColor1` and `fontWeightStrong`, not general border/body-text roles.

Existing Naive UI **2.45.3** / Vue **3.5.30** were bundled with existing esbuild.
Private `.divider-audit` pages mounted only NConfigProvider/NGlobalStyle/NDivider and
sample native context. Candidate pages loaded only Divider source CSS with equivalent
14px/1.6 application typography. Reference transitions settled for 400ms. Rendering
used fresh private Chromium contexts, not shared browser tabs or another agent's fixture.
The local server and private fixture were cleaned up afterward.

**Eight specimens × two widths × two themes**: plain, dashed, vertical,
vertical-dashed, centered caption, left caption, right caption and dashed caption,
at **640px and 320px**, light and dark. A ninth long-caption specimen tested the
deliberately different narrow-container wrapping policy.

After changes, the 32 ordinary case/width/theme comparisons had **no mismatches**
in measured box width/height, font size, text/rule color, margins, caption weight,
caption width/start and first-rule width (numeric tolerance **0.02px**).
This comparison does not equate border painting with Naive's background-painted
rules, or claim parity for the deliberately dashed vertical rule.

## Measured before → after

| Property | Before | After / reference |
| --- | --- | --- |
| Light rule color | `rgb(184,184,195)` | `rgb(239,239,245)` |
| Dark rule color | Same light fallback | `rgba(255,255,255,.09)` |
| Light caption/root foreground | Inherited body `rgb(51,54,57)` | `rgb(31,34,37)` |
| Dark caption/root foreground | Inherited body white `.82` | white `.9` |
| Divider root font | Inherited 14px in fixture | 16px |
| Caption weight | 600 | 500 |
| Vertical box | 1×14px | 1×16px |
| Block / inline / caption-gap defaults | 1.5rem / .5rem / .75rem | 24px / 8px / 12px |
| Caption size | 1rem | 16px |
| Short rule at 640px | 28px | **22.2656px** |
| Left caption start at 640px | 40px | **34.265625px** |
| Right caption start at 640px | 515.15625px | **520.890625px** |

The “Divider title” caption measured **84.84375px** wide and **25.59375px** tall.
At 640px, centered rules were **265.578px** and the caption began at **277.578125px**.
At 320px, centered rules were **105.578px**, the short edge rule **16.9844px**, and
the left caption began at **28.984375px**. Light/dark geometry was identical.

The pinned `28px` edge style is only its initial width: flex shrink reduces it
because the opposite line begins at 100% width. Copying `28px` as a fixed final
length was not rendered parity. Both native pseudo-rules now use a 100% basis,
with the short one retaining a shrinkable 28px basis. Captions keep intrinsic
width up to a bounded maximum so normal titles do not shrink prematurely.

## Author, scope and native regression evidence

- Theme boundaries set only private `--_mui-divider-*` defaults. Nested dark/light
  rules measured white/.09 and `#efeff5`; inherited public Divider color overrides
  still took precedence over those defaults.
- Shared `--mui-font-family: Georgia, serif` was consumed. Setting unrelated
  `--mui-border: red` and `--mui-text-primary: red` did **not** corrupt Divider's
  distinct rule/heading-text roles. No shared-source palette additions are needed.
- Public color tokens produced purple rules / teal text in dark scopes. Thickness,
  length and inline spacing produced **3×32px** vertical rules with **11px** margins.
  Caption tokens produced **21px/800** text and **9px** gaps; block margins became 31px.
- More-specific author rules remained effective after a later package stylesheet:
  maroon caption container, **37px** block margins, **23px** caption font.
- Changing html font size to **20px** retained the new **24px/8px/12px** spacing,
  **16px** caption size and **1×16px** vertical box. The existing 1rem minimum-rule
  token intentionally remains relative and can still be authored independently.
- At **280px**, the long label was **224×102.375px**, with **16px** rules and 12px
  gaps. Its scroll/client widths were both 224px: no clipped or overflowing label.
- Vertical caption composition preserved its original text and visible label,
  removed both horizontal pseudo-rules, and measured 25.594px high for that sample.
  This remains different from Naive, which omits the vertical slot.
- Native `dir="rtl"` retained physical left/right: caption starts were 34.266px
  and 520.891px at 640px. Naive's left/right classes followed flex item order and
  produced the opposite positions. Target-only logical start/end follow that
  reversed direction explicitly. CSS `direction` alone does not change `:dir()`.
- At 2× CSS zoom, the vertical box measured **2×32px**.
- Forced colors produced identical system-black horizontal/vertical/caption rules,
  including author-token cases. Print retained the authored 3px border without
  requiring background painting.
- Existing tests retain native hr semantics, authored names/headings, original
  caption nodes/listeners, orientation authority, hidden/template behavior,
  placeholder-free native actions and no global hr styling.

## Validation and budget

`node node_modules\vitest\vitest.mjs run tests\divider.test.ts`
→ **16 passed** (11 existing tests plus five default-style/budget regressions).

| Source CSS | Raw bytes | gzip level 9 |
| --- | ---: | ---: |
| Before | 2,923 | 765 |
| After | 3,513 | 904 |

The **1,500 gzip-byte ceiling is unchanged**, leaving **596 bytes**. No JS bundle,
new dependency or core bytes. The coordinator subsequently ran `pnpm build` successfully;
the distribution/manifest records **904 gzip bytes**. All **16 Divider tests** and
**24 Empty tests** passed together. Generated files were not edited manually.

## Honest retained differences and API limits

The plain native hr uses a printable border, while Naive draws internal background
lines. Vertical dashed styling remains dashed, unlike Naive's solid vertical background.
Vertical captions retain authored DOM rather than being discarded.

Long captions wrap; minimum rule lengths and positive gaps can diverge from Naive's
nowrap behavior at narrow widths. Physical RTL left/right, logical start/end extensions,
native hidden/semantics and no transitions remain intentional adaptations.
At widths too small even for the authored minima/gaps, applications must reduce tokens.

No framework theme objects, providers, slot renderer, automatic role/name/orientation,
runtime vertical Boolean, theme watcher or background/color-scheme policy is added.
The original four adapted API rows and three theme-contract omissions remain intact.
Only Chromium was rendered; this is bounded default-style parity, not all-browser,
all-state, pixel-identical or accessibility-tool certification.
