# Config Provider default-style review

**2026-09-11 — not applicable as a component skin.**
MarkupUI intentionally has no Config Provider element, helper, stylesheet, export or
distributed asset. This review changes documentation only; it does not add a wrapper,
context runtime, provider object or token adapter.

## Why no rendered component comparison exists

Naive UI's ConfigProvider supplies framework injection, theme/locale objects, component
defaults and CSS-render mounting behavior to descendant Vue components. MarkupUI's
accepted mapping uses:

- actual DOM ancestry and normal custom-property inheritance;
- authored external CSS and media queries;
- native `lang`, `dir` and `color-scheme`;
- explicit options on the helper that owns each behavior;
- existing legacy theme APIs only where an application deliberately chooses them.

There is therefore no MarkupUI trigger, panel, control, geometry, palette or state skin
to compare with an upstream rendered ConfigProvider. Adding one for this audit would
duplicate the cascade and contradict the accepted no-runtime architecture.

## Reviewed visual mechanism

The existing application demo already exercises nested light/dark/system/native token
scopes, native direction, language hints, author override precedence, modal ancestry,
separate documents, forced colors, narrow layout, zoom, no-JS and strict-CSP behavior.
Those styles are explicitly application-owned and are not a hidden package default.

Component styles continue to consume their documented tokens from their actual
ancestors. A subtree without a local theme declaration inherits; moving it changes
its real cascade source. No provider recreates, teleports or copies that context.

## Validation and limits

The existing Config Provider composition fixture verifies there is no package export,
source directory, bundle or manifest entry and that application composition remains
scoped. This review makes no all-component theme, translation, OS-picker localization,
SSR, framework injection or complete RTL claim.

Status is **Not applicable**, not Matched: there is deliberately no implemented visual
component whose defaults could match. Future component audits remain responsible for
their own token consumption and rendered light/dark behavior.
