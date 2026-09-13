export const resultStatuses = ["info", "success", "warning", "error", "404", "403", "500"] as const
export type ResultStatus = (typeof resultStatuses)[number]
