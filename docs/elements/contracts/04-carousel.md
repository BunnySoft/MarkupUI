# 4. Carousel Element Contract

Present an ordered collection through one current paged view.

**Draft.** Web `Carousel` and `CarouselItem` use `ViewElement`; root: `m-carousel`.

## 1. Properties

| Property | Type / default | Web attribute | Meaning |
| --- | --- | --- | --- |
| `currentIndex` | integer / 0 | `current-index` | Settled index; write semantics pending. |
| `defaultIndex` | integer / 0 | `default-index` | Reset target. |
| `direction` | `horizontal`, `vertical` / `horizontal` | `direction` | Paging axis. |
| `loop` | boolean / true | `loop` | Commands wrap at ends. |
| `autoplay` | boolean / false | `autoplay` | Timed progression. |
| `interval` | positive duration / 5000ms | `interval` | Automatic transition delay. |
| `keyboard` | boolean / true | `keyboard` | Enable paging keys. |
| `smooth` | boolean / true | `smooth` | Request permitted animation. |
| `disabled` | boolean / false | `disabled` | Block control-driven movement. |

## 2. Content Model

| Region | Content / count | Web element |
| --- | --- | --- |
| `viewport` | Item container / exactly one. | `m-carousel-viewport` |
| `items` | `CarouselItem` / zero or more inside viewport. | `m-carousel-item` |
| `controls` | Navigation controls / zero or one region. | `m-carousel-controls` |
| `readout` | Status text / proposed Web cardinality: exactly one. | `m-carousel-readout` |

## 3. Behavior

Actions: `To(index)`, `Previous`, `Next`, `Play`, `Pause`, `Reset`, `Refresh`.
State includes current index, total, playing/paused, disabled and pause reasons;
pending target and layout readiness may be renderer state.

| Trigger | Result |
| --- | --- |
| Previous/Next | Wrap only when loop is enabled. |
| Movement begins | Retain current identity until the target settles. |
| Settled identity changes | Emit `CurrentChanged` with current/previous index and item, plus reason. |
| Items change | Preserve selected keyed/item identity where possible. |
| Unsafe autoplay | Pause for focus, interaction, hidden context, reduced motion or unsupported layout. |
| Disabled | Reject control-driven movement; retain visible item content. |

## 4. Rendering and accessibility

Web uses one-view native scroll snap without clones; native targets may use paged scrolling.
Name the collection, current item and navigation. Inactive items remain accessible unless
an explicit alternative paging capability is implemented.

Stop timers, movement observers and listeners on disconnect. Extent, paint and transitions
are renderer/theme values; unsupported effects need declared fallbacks.

## 5. Decisions

| Resolve before approval | Detail |
| --- | --- |
| Value ownership | Define requested versus settled index, two-way notifications, initial/default precedence, empty/out-of-range indices and writes during movement. |
| Identity/events | Portable item key/reference, removal behavior, reason values and event ordering/cancelability. |
| Playback | Interval representation/range and how Play/Pause interact with autoplay and automatic pause reasons. |
| Regions | Whether viewport/readout are logical requirements or Web mappings, including omitted/generated regions. |

Carousel and its region classes expose direct typed APIs. Native scrolling mechanics
remain renderer-owned rather than becoming portable action semantics.

## References

- [Previous implementation and scroll behavior](../../archive/components/carousel.md)
- [Default-style comparison](../../archive/styling/components/carousel.md)
