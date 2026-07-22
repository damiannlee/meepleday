import { useCallback, useEffect, useState } from "react";
import { fetchModerationQueue, moderate, type EventResponse } from "./api";
import { EventCard } from "./EventCard";

export function AdminView() {
  const [pending, setPending] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchModerationQueue("PENDING")
      .then((page) => {
        setPending(page.content);
        setError(null);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const onPublish = async (id: number) => {
    await moderate(id, "PUBLISH");
    load();
  };

  const onReject = async (id: number) => {
    const reason = window.prompt("반려 사유를 입력하세요");
    if (!reason) return;
    await moderate(id, "REJECT", reason);
    load();
  };

  return (
    <section>
      <h2 className="section-title">검수 큐 (제보 대기)</h2>
      {loading && <p className="muted">불러오는 중…</p>}
      {error && <p className="error">에러: {error}</p>}
      {!loading && !error && pending.length === 0 && (
        <p className="muted">대기 중인 제보가 없습니다.</p>
      )}
      <div className="grid">
        {pending.map((event) => (
          <EventCard key={event.id} event={event}>
            <button className="btn btn-primary" onClick={() => onPublish(event.id)}>
              승인
            </button>
            <button className="btn btn-danger" onClick={() => onReject(event.id)}>
              반려
            </button>
          </EventCard>
        ))}
      </div>
    </section>
  );
}
