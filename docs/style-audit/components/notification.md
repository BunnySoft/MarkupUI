# Notification default-style audit

**2026-09-11 — card metrics and palette aligned; native semantics retained.**
Changed Notification CSS, its existing fixture and canonical/audit documentation.
Controller/feedback behavior, generated files, dependencies and demos are unchanged.
No full build or commit.

## Reference and method

Compared Naive UI 2.45.3 at pinned commit
`42a52e6436b38bed456fee19eb0b89cdcd00fcc2` with the local native Notification cards.
Chromium measured an open source notification.

The source card measured **365px** wide, 14px type with 1.6 line height, 16px inline
padding, 3px corners, white background and its standard three-layer popup shadow.
Its close icon measured 20px. MarkupUI uses authored native articles, visible type words
and a labelled close button; card density and palette are comparison targets, while icon
topology and transition queues remain intentionally different.

## Fixed defaults

Notification now uses:

- a 365px fixed-host width constrained by the shared responsive feedback host;
- 16px card padding, 8px × 12px grid gaps and 3px corners;
- 14px / 1.6 body type and a 16px, weight-500 title;
- source light/dark card, title, description/meta and close roles;
- source info/success/warning/error semantic colors;
- the source three-layer popup shadow.

The previous 28rem card, 9.6px corners, heavy title and blue-gray painted surface are
removed. Public `--mui-notification-*` overrides remain available.

## Native retained differences

The card keeps a 3px semantic start edge and visible type word because fallback icons are
plain decoration and color alone is not the notification identity. The close control is a
labelled native button with a 34px minimum height rather than a hidden-label 20px icon.
Authored action controls keep their own paint and semantics.

Cards do not animate entering/leaving. Forced colors uses CanvasText/Highlight system
roles and removes the shadow; print removes the shadow and avoids splitting a card.
The shared feedback host retains native overflow, six explicit placements and top-layer
limits.

## Validation and budget

Four checks in the existing fixture cover the **2,000-byte composed ceiling**, card
metrics/palette, labelled semantics and media behavior.

| Notification CSS | Raw bytes | gzip level 9 | Ceiling |
| --- | ---: | ---: | ---: |
| Own before | 3,507 | 1,009 | — |
| Composed before | 4,958 | 1,339 | 2,000 |
| Own after | 4,674 | 1,190 | — |
| Composed after | 6,125 | 1,539 | 2,000 |

Chromium confirmed the fixed-host **365px** width, 14px / 22.4px text, 16px padding,
3px corners, white surface, source shadow and 34px labelled close action. All
**61 Notification tests** pass. Full Message/shared-feedback/build integration remains
with the parent final pass.
