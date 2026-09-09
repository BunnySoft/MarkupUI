/** Move focus before hiding/disabling an action, while application attribute writes are still observed. */
export function prepareTemporalActionFocus(
  action: HTMLButtonElement | null,
  controls: readonly HTMLInputElement[],
  becomingUnavailable: boolean,
  available: (control: HTMLInputElement) => boolean,
): void {
  if (!action || !becomingUnavailable || action.ownerDocument.activeElement !== action) return
  const target = controls.find(available)
  if (target) target.focus({ preventScroll: true })
  else action.blur()
}
