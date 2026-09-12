# 2. Initial element catalog

The first batch establishes the shared pattern. It is not the full scope of the
[ViewElement rewrite](../architecture/04-rewrite.md), and a design page is not an
implementation completion claim.

| Order | Contract | Scope | Design status |
| ---: | --- | --- | --- |
| 1 | [Avatar demo and API](../../demo/components/avatar.html) | Image, text/icon, resources and named fallback content. | Implemented with direct runtime access and generated demo docs. |
| 2 | [Button](../../demo/components/button.html) | Activation, naming, content and ButtonGroup. | ViewElement implemented; payload acceptance pending. |
| 3 | [Card](contracts/03-card.md) | Named regions, presentation and close intent. | Draft. |
| 4 | [Carousel](contracts/04-carousel.md) | Paged items, navigation, identity and autoplay. | Draft. |
| 5 | [Collapse](contracts/05-collapse.md) | Keyed disclosure, accordion behavior and focus. | Draft. |
| 6 | [Divider](contracts/06-divider.md) | Visual or semantic separation. | Draft. |
| 7 | [Dropdown](contracts/07-dropdown.md) | Temporary command/navigation hierarchy. | Draft. |

Avatar proves direct properties, resources, content and state without requiring a new
form, collection or overlay subsystem. Complete each family, including companions and
regions, before beginning the next.

The [full inventory](03-inventory.md) covers the remaining UI families. Define their
contracts and dependencies before implementation; an earlier
helper or CSS-only form does not exempt a retained UI component.

## References

- [Previous implementation guides](../archive/components/README.md)
- [Previous first-batch record](../archive/architecture/01-first-batch.md)
