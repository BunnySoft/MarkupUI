# Gradient Text visual-default audit

Date: 2026-09-10. Scope: CSS-only authored text, native gradient declarations, typography
and readable fallback paths. No runtime renderer, gradient-object adapter or Houdini registration.

## Actual reference and method

- Pinned Naive UI: `42a52e6436b38bed456fee19eb0b89cdcd00fcc2`.
- Rendered `naive-ui@2.45.3`, `vue@3.5.30`, `NGradientText` in explicit light/default
  and dark providers. Source implementation, CSSR and both theme definitions were inspected.
- Chromium private contexts; 900×2200 viewport, device scale 1, 360px wrappers and
  matching surrounding 14px/1.6 system typography. Reference color transitions settled
  before measurements/screenshots.
- Twenty cases per theme: absent/primary/info/success/warning/error/danger; numeric,
  rem and responsive sizes; a native heading; custom endpoints, 0° object-default
  translation and multi-stop image; none/invalid images; matched/mismatched colored
  canvas; nested strong text; long wrapping text.
- Session `files/gradient-text-style-audit` retains fixtures, CSS snapshots, raw computed
  metrics and before/reference/after screenshots. Fixture dependencies are not shipped.

Nineteen nonwrapping cases match reference font size, weight, paint-box geometry and
wrapper geometry after the correction, including RTL. That statement deliberately does
not equate solid fallback foregrounds or native descendant behavior with upstream.

## Font and box corrections

| Measurement | Before | Reference / after |
| --- | ---: | ---: |
| Default weight | 700 | 500 |
| Default text width | 87.219px | 83.344px |
| Default paint-box height | 19px | 22.391px |
| 24px text width | 149.5px | 142.875px |
| 24px paint-box height | 32px | 38.391px |
| 2rem text width at 16px root | 199.328px | 190.5px |
| 2rem paint-box height | 43px | 51.188px |
| 36px responsive text width | 224.25px | 214.313px |
| Heading paint width | 360px | 166.688px |

The enhanced element is now inline-block, giving the gradient the correct text-sized
painting bounds instead of a short inline fragment or full-width heading background.
No font-size default is set: the native heading remained 28px in this fixture and its
whole wrapper stayed 82.297px high. A 2rem size became 40px under a 20px root in both
implementations. Native element types, margins, text and language/direction remain authored.

Place the class on an inner span when an outer heading/link should retain its independent
block/decorative box. Native wrapping is preserved rather than copying upstream nowrap:
the long case is 360×44.781px versus upstream's 693.516×22.391px overflowing text box.

## Direction and semantic stops

The 252° theme direction was already correct and is retained; explicit stops are 0%/100%.
Custom 90°, explicit 0° and multi-stop image declarations were verified.

| Type | Before light and dark | Upstream light start → end | Dark reference / after |
| --- | --- | --- | --- |
| primary / success | `#36ad6a` → `#0c7a43` | `#18a058` at `.6` → `#18a058` | `#63e2b7` → `#2a947d` |
| info | `#4098fc` → `#1060c9` | `#2080f0` at `.6` → `#2080f0` | `#70c0e8` → `#3889c5` |
| warning | `#f0a020` → `#8a5500` | `#f0a020` at `.6` → `#f0a020` | `#f2c97d` → `#f08a00` |
| error / danger | `#de576d` → `#ab1f3f` | `#d03050` at `.6` → `#d03050` | `#e88080` → `#d03a52` |

Dark starts are normal severity colors and ends are supplemental colors. Light semantic
roles are reused where correct; dark pairs remain local defaults. No shared palette file
was edited. Dark solid fallback colors also use the readable normal severity tones rather
than the previous dark light-theme fallback shades.

## Light compositing versus the safety underpaint

The existing native contract deliberately paints a solid clipped underpaint so a missing
or invalid custom image cannot erase the words. Simply placing upstream's translucent
start over that dark underpaint would produce the wrong fade.

The native light default therefore uses an **opaque precomposite**:
60% selected semantic color + 40% `--mui-gradient-text-surface`, default white, followed
by the full semantic end color. Explicit sRGB interpolation keeps the color space stable
when `color-mix` supplies the start. The underpaint remains intact behind valid images.

This is a documented adaptation, not a claim that opaque and translucent CSS stops are
interchangeable on every background:

- On the default white canvas, the eleven theme/size/heading cases differ from reference
  by at most **2 levels in any 8-bit RGB channel**, due to compositing/rasterization.
- On the tested opaque `#ead8c4` canvas with the matching surface token, the maximum
  channel difference is **3**. Omitting that token gives a **22-level** difference.
- Image/translucent backdrops are not sampled. A surface token does not rewrite an
  explicitly supplied image or endpoint color.
- Dark gradients are opaque and need no surface precomposite.

For an explicit true-alpha option, ordinary author CSS was tested:

```css
.true-alpha.mui-gradient-text {
  --mui-gradient-text-from: rgba(24, 160, 88, .6);
  --mui-gradient-text-to: #18a058;
  background-color: transparent;
}
```

On the colored canvas this produced **zero differing RGB pixels** against upstream.
It intentionally disables the missing-image underpaint inside the enhancement; use a
valid gradient and verified contrast. The library does not silently choose that tradeoff.

## Pixel results and retained exceptions

Comparisons count any changed RGB channel, without tolerance. Ordinary case regions share
the same origin/geometry in the full screenshots; the true-alpha check uses fixed-origin
individual screenshots.

| Group | Result |
| --- | --- |
| Sixteen ordinary dark theme/size/heading/custom/canvas cases | 0 differing pixels |
| Three opaque custom light gradients (90°, 0°, multi-stop) | 0 differing pixels |
| Eleven default-white light theme/size/heading cases | Maximum channel error 2 |
| Explicit matching colored light surface | Maximum channel error 3 |
| Explicit raw-alpha colored-surface override | 0 differing pixels |

None/invalid, nested strong and wrapping cases are not included in those matching groups:

- Upstream `gradient="none"` paints no visible gradient glyphs; native underpaint keeps
  the text visible. An invalid upstream direct image declaration falls back to its
  stylesheet gradient, whereas an invalid native custom-property image yields the
  intended solid fallback.
- Nongradient descendants retain their own solid currentColor fill. Native strong/code/
  links remain readable rather than depending on an ancestor's clipped transparency.
- Native normal wrapping is retained instead of upstream nowrap overflow.
- No theme-transition/Houdini behavior or runtime alias/object precedence is implemented.

## Author, native text and fallback verification

- Author font 30px/weight 600, 0° direction, independent endpoint colors and fallback
  RGB color produced a 178.594×48px paint box with the exact requested declarations.
- `none` and malformed image tokens both retained the authored solid underpaint and
  the original text node. Normal foreground was never made transparent by the stylesheet.
- Selection returned the exact original text and used system HighlightText fill.
- Nested light inside dark restored the light info composite and solid fallback.
- Native link Enter navigation changed the hash once, preserved href/focus and emitted
  one native click; no handler or renderer was added by the library.
- Forced colors removed images and restored CanvasText/LinkText and currentColor fill.
  Print removed images and restored black text/fill.
- Removing the CSSSupportsRule simulated unsupported clipping: readable solid
  `#17583b` foreground/fill remained. This is a simulation, not older-engine certification.
- Later legacy CSS changed none of the captured fields in either theme.

See [Gradient Text](../../components/gradient-text.md) for the full native styling contract,
including the new surface token and the recommendation to keep semantic outer wrappers.

## Validation and limits

- `pnpm test -- tests\gradient-text.test.ts`: **9 tests passed**.
- CSS: **961 / unchanged 1,500 gzip bytes**, gzip level 9.
- Component JavaScript, runtime dependencies, generated text and asset URLs remain **0**.
- The coordinator's isolated release `pnpm build` and all **9 Gradient Text tests**
  passed. Final CSS remains **961 gzip bytes**; unfinished unrelated work is excluded.
  No shared source or generated adapter was edited.
- Chromium only; no universal pixel, contrast, speech or physical-print certification.
  Arbitrary translucent custom gradients, unmatched backgrounds and descendant painting
  remain explicit native limitations, not hidden parser/renderer promises.
