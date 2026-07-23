export type EventType = "FUNDING" | "PREORDER" | "SALE";
export type Region = "DOMESTIC" | "OVERSEAS";
export type EventStatus = "UPCOMING" | "ONGOING" | "ENDING_SOON" | "ENDED";
export type ModerationStatus = "PENDING" | "PUBLISHED" | "REJECTED";
export type ModerationAction = "PUBLISH" | "REJECT";

export interface EventResponse {
  id: number;
  title: string;
  eventType: EventType;
  region: Region;
  platform: string;
  originalUrl: string;
  description: string | null;
  coverImageUrl: string | null;
  publisher: string | null;
  startAt: string | null;
  endAt: string | null;
  goalAmount: string | null;
  currentAmount: string | null;
  currency: string | null;
  fundingProgressPercent: number | null;
  status: EventStatus;
  moderationStatus: ModerationStatus;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface FeedFilters {
  region?: Region;
  eventType?: EventType;
  platform?: string;
  status?: EventStatus;
}

export interface SubmissionPayload {
  title: string;
  eventType: EventType;
  region: Region;
  platform: string;
  originalUrl: string;
  description?: string;
  publisher?: string;
  startAt?: string;
  endAt?: string;
  goalAmount?: string;
  currentAmount?: string;
  currency?: string;
  submitterName?: string;
  submitterEmail?: string;
  /** Honeypot decoy: must stay empty for real users, see SubmitView. */
  website?: string;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchFeed(filters: FeedFilters, page = 0): Promise<Page<EventResponse>> {
  const params = new URLSearchParams({ page: String(page), size: "20" });
  if (filters.region) params.set("region", filters.region);
  if (filters.eventType) params.set("eventType", filters.eventType);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.status) params.set("status", filters.status);
  return handle(await fetch(`/api/events?${params.toString()}`));
}

export async function submitEvent(payload: SubmissionPayload): Promise<EventResponse> {
  return handle(
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
}

export async function fetchModerationQueue(
  status: ModerationStatus,
): Promise<Page<EventResponse>> {
  return handle(await fetch(`/api/admin/events?status=${status}&size=50`));
}

export async function moderate(
  id: number,
  action: ModerationAction,
  reason?: string,
): Promise<EventResponse> {
  return handle(
    await fetch(`/api/admin/events/${id}/moderation`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    }),
  );
}
