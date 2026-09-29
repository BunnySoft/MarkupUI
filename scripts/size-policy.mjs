/** Validate measurement metadata; exceeding a size recommendation is only diagnostic. */
export function checkSizeRecommendation(gzipBytes, budget, label = "Payload", warn = console.warn) {
  if (!Number.isSafeInteger(gzipBytes) || gzipBytes < 0
    || !Number.isSafeInteger(budget) || budget <= 0) {
    throw new TypeError(`Invalid size measurement or recommendation: ${label}`)
  }
  if (gzipBytes <= budget) return null
  const warning = { label, gzipBytes, budget, excessBytes: gzipBytes - budget }
  warn?.(`[size recommendation] ${label}: ${gzipBytes} gzip bytes; recommended ${budget} (+${warning.excessBytes}).`)
  return warning
}
