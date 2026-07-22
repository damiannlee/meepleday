import { useEffect, useState } from "react";
import { fetchFeed, type EventResponse, type FeedFilters } from "./api";
import { EventCard } from "./EventCard";
import { EVENT_TYPE_LABEL, REGION_LABEL, STATUS_LABEL } from "./labels";

export function FeedView() {
  const [filters, setFilters] = useState<FeedFilters>({});
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchFeed(filters)
      .then((page) => {
        if (!active) return;
        setEvents(page.content);
        setTotal(page.totalElements);
        setError(null);
      })
      .catch((e: Error) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters]);

  const update = (patch: Partial<FeedFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  return (
    <section>
      <div className="filters">
        <select
          value={filters.region ?? ""}
          onChange={(e) => update({ region: (e.target.value || undefined) as FeedFilters["region"] })}
        >
          <option value="">지역 전체</option>
          {Object.entries(REGION_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filters.eventType ?? ""}
          onChange={(e) => update({ eventType: (e.target.value || undefined) as FeedFilters["eventType"] })}
        >
          <option value="">유형 전체</option>
          {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filters.status ?? ""}
          onChange={(e) => update({ status: (e.target.value || undefined) as FeedFilters["status"] })}
        >
          <option value="">상태 전체</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          placeholder="플랫폼 (예: 텀블벅)"
          value={filters.platform ?? ""}
          onChange={(e) => update({ platform: e.target.value || undefined })}
        />
      </div>

      {loading && <p className="muted">불러오는 중…</p>}
      {error && <p className="error">에러: {error}</p>}
      {!loading && !error && (
        <>
          <p className="muted">{total}건</p>
          <div className="grid">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {events.length === 0 && <p className="muted">조건에 맞는 이벤트가 없습니다.</p>}
        </>
      )}
    </section>
  );
}
