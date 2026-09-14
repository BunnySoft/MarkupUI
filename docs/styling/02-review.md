# 2. Visual review

A rewritten element needs new acceptance evidence. Compare the actual renderer against
its current contract; use previous implementations and pinned upstream references as
context, not automatic requirements or proof of parity.

## Review conditions

Record the browser/platform, viewport, fonts, content, theme and property values. Isolate
the reference and implementation stylesheets so one cannot mask the other's behavior.
Distinguish defaults from deliberately customized examples.

| Area | Review |
| --- | --- |
| Geometry | Content/border boxes, dimensions, spacing, alignment, clipping and overflow. |
| Text | Family, size, weight, line height, fitting and full accessible labels. |
| Paint | Surfaces, foregrounds, borders, radii, elevation and state indicators. |
| Interaction | Hover, press, focus, selection, disabled/busy states and touch behavior. |
| Accessibility | Keyboard operation, forced colors, zoom, reduced motion and semantic ownership. |
| Lifecycle | Live property/content changes, identity preservation and reconnection. |
| Delivery | Component CSS, theme resources, authored overrides and payload cost. |

## Results

Record the requirement, observed result, meaningful difference and decision. Fix the owning
component or shared resource rather than hiding a defect in demo CSS.
Declare platform limitations and deliberate differences explicitly; do not silently skip
a comparison or claim blanket pixel/API parity.

Acceptance belongs to the rewritten version. Historical reports remain in the archive,
linked from a dedicated References section of the relevant current contract.
Future reports should identify the implementation being measured and must not turn the
current styling guide into an accumulating migration log.

## References

- [Full rewrite gates](../architecture/04-rewrite.md)
- [Pinned style comparisons](../archive/styling/index.md)
- [Previous API/behavior comparisons](../archive/naive/index.md)
