# 5. Implementation sequence

> **Historical reference.** Preserved from the previous documentation layout. This page is not the current design or a completion claim for the ViewElement rewrite.

Follow the [catalog order](../../elements/02-catalog.md), one element at a time.
The [full rewrite](../../architecture/04-rewrite.md) includes every retained
Web UI component; completing the initial seven does not complete the branch's scope.

MarkupUI is still in development: breaking migrations are allowed. Remove superseded
implementations, aliases and compatibility shims instead of maintaining parallel APIs.
Keep still-used functionality until its replacement is ready; a historical filename alone
does not make working code obsolete.

| Stage | Required outcome |
| --- | --- |
| 1. Ground | Read current code, tests, demos and component docs. Classify retained, changed and removed behavior. |
| 2. Approve | Resolve the draft's decisions: exact types, content rules, actions, notifications and renderer mappings. Approve before implementation. |
| 3. Implement | Rewrite the component's properties, content, behavior and lifecycle on `ViewElement`; expose reflected `ElementMeta` through `.meta` and align registration, styling and consumers. |
| 4. Validate | Cover behavior, accessibility, lifecycle and demos; update documentation and measure performance. |
| 5. Complete | Mark Implemented, then Validated, before starting the next element. |

Avatar's existing behavior has completed these gates under the previous metadata API.
Its next step is the [class-owned metadata refactor](../../architecture/05-meta.md),
not a new handwritten definition. Validate that refactor before applying it to the next element.

## Completion gates

Typed properties, content and behavior agree with the approved contract. Platform details
stay in their profile. Documentation and demos use the canonical API; no compatibility
alias is added without separate approval.

Direct Web mode has no duplicate model tree. Compare startup, memory, update and payload
costs with the existing baseline; retain payload ceilings unless an increase is approved.

Keep shared infrastructure small. Do not put multiple rewrites behind an unapproved
abstraction; extract shared runtime only after two concrete controls prove the boundary.

After the first batch, continue the inventory in dependency-aware order. Full completion
also requires removal of superseded public UI implementations/bases and reconciliation of
aggregate exports, registration, styles and documentation.

## Current documentation

[Read the current design](../../architecture/README.md).
