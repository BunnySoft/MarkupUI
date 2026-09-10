# Discrete API default-style review

**2026-09-11 — not applicable as an aggregate visual component.**
MarkupUI intentionally ships no Discrete API factory, host, wrapper, stylesheet,
export or distribution bundle. This review changes documentation only.

## Style ownership

The native resolution is explicit application composition of existing independent
owners:

- Message
- Notification
- Loading Bar
- Dialog
- Modal

Each owner has its own authored root/template, stylesheet, tokens, placement, media
rules, lifecycle and component-specific style audit. Selecting several services does
not create another DOM ancestor or visual surface that could own shared defaults.

Naive UI's discrete factory creates a hidden framework app/provider tree and returns
service APIs. MarkupUI deliberately omits that app/provider layer. Adding aggregate
CSS would not reproduce the framework mechanism; it would instead conceal which real
root owns placement, top-layer behavior and teardown.

## Reviewed application behavior

The existing demo links the five component stylesheets explicitly because its runtime
chooser may enable any service. A fixed application can import/link only what it uses.
Theme, language and direction remain normal CSS/HTML or supported per-owner options.
Modal-local feedback uses roots inside that modal; page-level overlays do not bypass a
native top layer through an aggregate z-index.

No global body host, provider class, CSS injection, placement normalization, shared
animation, combined budget or all-services theme adapter is introduced.

## Validation and limits

The existing Discrete composition fixture verifies absent source/export/bundle entries,
selective imports, explicit roots and ordered retryable cleanup. Individual visual
claims remain in the five component audits.

Status is **Not applicable**, not Matched: there is no implemented Discrete visual
component. This does not imply that every selected service has completed its own style
audit or that their APIs reproduce the framework factory result.
