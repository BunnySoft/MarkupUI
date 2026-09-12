# 2. Initial element catalog

The first batch establishes the shared pattern. It is not the full scope of the
[ViewElement rewrite](../architecture/04-rewrite.md), and a design page is not an
implementation completion claim.

| Order | Contract | Scope | Design status |
| ---: | --- | --- | --- |
| 1 | [Avatar demo and API](../../demo/components/avatar.html) | Image, text/icon, resources and named fallback content. | Implemented with direct runtime access and generated demo docs. |
| 2 | [Button](../../demo/components/button.html) | Activation, naming, content and ButtonGroup. | Implemented and accepted with direct runtime access. |
| 3 | [Card demo and API](../../demo/components/card.html) | Named regions, presentation and close intent. | Implemented with direct runtime access and generated demo docs. |
| 4 | [Carousel demo and API](../../demo/components/carousel.html) | Native paging, named regions, identity and safe autoplay. | Direct runtime and generated demo docs implemented; validation recorded with the change. |
| 5 | [Collapse demo and API](../../demo/components/collapse.html) | Keyed native disclosures, named regions, accordion and focus. | Implemented and accepted with approved payload ceilings. |
| 6 | [Divider demo and API](../../demo/components/divider.html) | Native rule semantics with independent title/heading content. | Direct ViewElement implementation with generated demo API. |
| 7 | [Dropdown demo and API](../../demo/components/dropdown.html) | Native command/navigation hierarchy and named regions. | Direct ViewElement implementation with approved payload ceilings. |

Avatar proves direct properties, resources, content and state without requiring a new
form, collection or overlay subsystem. Complete each family, including companions and
regions, before beginning the next.

The [full inventory](03-inventory.md) covers the remaining UI families. Define their
contracts and dependencies before implementation; an earlier
helper or CSS-only form does not exempt a retained UI component.

## References

- [Previous implementation guides](../archive/components/README.md)
- [Previous first-batch record](../archive/architecture/01-first-batch.md)
