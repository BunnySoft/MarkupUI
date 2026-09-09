/** Detached capability/grammar substrate; numeric coordinates are not a timezone policy. */
export function createTemporalProbe(document: Document, type: string, sample: string): HTMLInputElement | null {
  const probe = document.createElement("input")
  probe.type = type
  if (probe.type !== type) return null
  probe.value = sample
  if (probe.value !== sample || !Number.isFinite(probe.valueAsNumber)) return null
  probe.value = "not-a-temporal-value"
  return probe.value === "" ? probe : null
}
