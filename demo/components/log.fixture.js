export function localLogFixture(count = 10000) {
  if (!Number.isSafeInteger(count) || count < 1 || count > 10000) throw new RangeError("Local fixture count must be 1..10000.")
  return Array.from({ length: count }, (_, index) => {
    const suffix = index % 997 === 0 ? " <tag> & literal ANSI-looking \u001b[32m" : " complete"
    return `Line ${String(index + 1).padStart(5, "0")} | local task ${index % 31} |${suffix}`
  }).join("\n")
}
