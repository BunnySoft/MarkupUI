export const alertTypes = ["default", "info", "success", "warning", "error"] as const
export type AlertType = (typeof alertTypes)[number]

export interface AlertCloseDetail {
  originalEvent: MouseEvent
}
