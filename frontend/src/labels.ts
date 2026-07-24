import type { EventStatus, EventType, Region } from "./api";

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  FUNDING: "펀딩",
  PREORDER: "선주문",
  SALE: "특가",
  OFFLINE_EVENT: "행사",
};

export const REGION_LABEL: Record<Region, string> = {
  DOMESTIC: "국내",
  OVERSEAS: "해외",
};

export const STATUS_LABEL: Record<EventStatus, string> = {
  ANNOUNCED: "예고",
  UPCOMING: "예정",
  ONGOING: "진행중",
  ENDING_SOON: "마감임박",
  ENDED: "마감",
};

export const STATUS_COLOR: Record<EventStatus, string> = {
  ANNOUNCED: "#a855f7",
  UPCOMING: "#6366f1",
  ONGOING: "#16a34a",
  ENDING_SOON: "#dc2626",
  ENDED: "#6b7280",
};

export function formatDeadline(endAt: string | null): string {
  if (!endAt) return "상시";
  const end = new Date(endAt);
  const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "마감됨";
  if (days === 0) return "오늘 마감";
  return `D-${days}`;
}
