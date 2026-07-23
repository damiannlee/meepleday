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

export type AuthProvider = "KAKAO" | "GOOGLE";
export type UserRole = "USER" | "ADMIN";

export interface MeResponse {
  id: number;
  provider: AuthProvider;
  email: string | null;
  displayName: string;
  role: UserRole;
}

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Spring Security's CookieCsrfTokenRepository sets this on every response — read it back for mutating requests. */
function readCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiHttpError(res.status, body?.message ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** POST/PATCH/DELETE need the CSRF header attached; GET is exempt (Spring Security only checks mutating methods). */
function mutatingHeaders(): Record<string, string> {
  const token = readCsrfToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "X-XSRF-TOKEN": token } : {}),
  };
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
      headers: mutatingHeaders(),
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
      headers: mutatingHeaders(),
      body: JSON.stringify({ action, reason }),
    }),
  );
}

export async function fetchMe(): Promise<MeResponse | null> {
  const res = await fetch("/api/me");
  if (res.status === 401) return null;
  return handle(res);
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", headers: mutatingHeaders() });
}
