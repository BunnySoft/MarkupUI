# Carousel default-style audit

## Pinned demo parity page — 2026-09-11

The runnable Carousel page now mirrors all eighteen pinned Naive UI 2.45.3 demo identities
in source order: Basic, Arrow, Autoplay, Dots, Vertical, Space between, Slides per view,
Auto slides per view, Centered, Effect, Customizing transition, Hover, Keyboard,
Mousewheel, Simulate drag, Customizing arrow and dots, Customize card and Custom Dots.
Every case has a Naive-shaped icon-only code control and highlighted authored HTML.

Functional retained cases use the actual Carousel controller: single-view scroll-snap,
arrows, autoplay with an explicit pause/play action, horizontal/vertical direction,
viewport keyboard navigation, hover/focus indicators, native wheel scrolling, authored
custom controls and current/total readout. Chromium confirmed 13 independently owned
controllers, Basic indicator navigation, dynamic direction/arrows, hover navigation and
zero page console errors. Basic source/reference height is **240px**.

Five source capability groups remain visible as honest native/static comparisons:

- space-between with multi-view cards;
- fixed and automatic slides-per-view;
- centered variable-width slides;
- fade/card/custom transition effects and per-neighbor transforms;
- a component-owned mouse-drag/physics engine.

The proposals remain separate decisions: multi-view/centered requires a widened layout
and measurement contract; fade/card/custom transitions require a different visibility/
transform lifecycle; mouse drag and discrete wheel switching require owned gesture input;
dot placement/type can remain authored controls or become narrow presentation attributes;
arrow/dot renderer slots should wait for the proposed native template engine. None is
implemented by misleading demo-only Carousel behavior.

**2026-09-11 — native controls aligned; transform/dot topology retained as different.**
Changed only Carousel CSS, its existing test fixture and canonical/audit documentation.
Carousel JavaScript, demos, shared styles, generated files and dependencies are
unchanged. No full build or commit.

## Reference and method

Compared the existing native Carousel with Naive UI 2.45.3 and pinned source commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2`. Chromium measured the official rendered
slide example and the local authored demo with the current source stylesheet injected.

The reference example used a 614.667×240px transform viewport, 28×28px icon arrows
with 8px radius and 8px overlay dots. MarkupUI intentionally uses a native scrolling
viewport, authored slide contents and visible labelled buttons below the viewport.
Outer viewport dimensions and overlay positions are therefore application/topology
differences, not parity targets.

## Fixed native defaults

Before the pass, enhancement buttons inherited the demo/browser's **44px** minimum,
native square corners and platform paint. After:

| Control | Measured result |
| --- | --- |
| Labelled previous/next/toggle | 28px high, 10px inline padding, 3px radius |
| Numeric indicator | 28×28px, zero inline padding |
| Light neutral | `#333639` on white, `#e0e0e6` border |
| Dark neutral | white `.82` on white `.1`, white `.24` border |
| Current indicator | `#18a058`/white or `#63e2b7`/black |

The reference arrow height is also **28px**. MarkupUI keeps the readable native label
width instead of manufacturing icon-only controls. Numeric indicator text remains
visible; it is not replaced by an 8px custom-role dot. Hover uses the shared primary
hover role, and disabled native/aria-disabled controls use the muted role without
opacity loss.

The viewport still measured one authored slide per view, with native `overflow:auto`,
mandatory start snap and no CSS transform. Light/dark control changes do not recolor
application-owned slide contents.

## Retained differences

- Source slides move on a transform track and inactive items are hidden. MarkupUI
  preserves all authored slides, fields, links and native scrolling.
- Source loop behavior can clone/teleport. MarkupUI commands wrap but native swiping
  stops at actual scroll extents; no duplicate nodes are created.
- Source dots/arrows overlay media. MarkupUI uses visible labelled native controls
  outside application content so contrast does not depend on an unknown image.
- Native wheel/touch scrolling, focus, validation and nested scroll areas remain
  browser owned. No drag/physics listener or mouse capture was added.
- Reduced motion retains instant native movement. Forced colors use ButtonFace,
  ButtonText, Highlight and GrayText.
- Print expands all slides, avoids breaks inside each item and hides enhancement
  controls/readout. This is not an all-browser print or screen-reader parity claim.

## Validation and budget

The existing Carousel fixture adds four style checks for the package ceiling, native
snap geometry, labelled 28px controls and explicit current/disabled/media behavior.
Carousel and shared native fixtures pass separately.

| Carousel CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Before | 2,053 | 656 | 1,500 |
| After | 3,672 | 1,045 | 1,500 |

No ceiling or dependency changed. Full integration build/distribution validation
remains with the parent audit.
