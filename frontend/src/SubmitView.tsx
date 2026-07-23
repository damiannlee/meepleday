import { useState } from "react";
import { submitEvent, type SubmissionPayload } from "./api";
import { EVENT_TYPE_LABEL, REGION_LABEL } from "./labels";

const EMPTY: SubmissionPayload = {
  title: "",
  eventType: "FUNDING",
  region: "DOMESTIC",
  platform: "",
  originalUrl: "",
};

export function SubmitView() {
  const [form, setForm] = useState<SubmissionPayload>(EMPTY);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof SubmissionPayload>(key: K, value: SubmissionPayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEvent(form);
      setDone(true);
      setForm(EMPTY);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="submit">
      <h2 className="section-title">이벤트 제보</h2>
      <p className="muted">
        제보한 이벤트는 운영자 검수 후 피드에 게시됩니다.
      </p>
      {done && <p className="success">제보 완료! 검수 후 게시됩니다.</p>}
      {error && <p className="error">에러: {error}</p>}
      <form onSubmit={onSubmit} className="form">
        <label>
          제목 *
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} />
        </label>
        <div className="form-row">
          <label>
            유형 *
            <select value={form.eventType} onChange={(e) => set("eventType", e.target.value as SubmissionPayload["eventType"])}>
              {Object.entries(EVENT_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            지역 *
            <select value={form.region} onChange={(e) => set("region", e.target.value as SubmissionPayload["region"])}>
              {Object.entries(REGION_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          플랫폼 * (예: 텀블벅, Gamefound)
          <input required value={form.platform} onChange={(e) => set("platform", e.target.value)} />
        </label>
        <label>
          원본 링크 *
          <input required type="url" value={form.originalUrl} onChange={(e) => set("originalUrl", e.target.value)} />
        </label>
        <label>
          마감일
          <input
            type="datetime-local"
            onChange={(e) => set("endAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
          />
        </label>
        <label>
          설명
          <textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="hp-field" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            value={form.website ?? ""}
            onChange={(e) => set("website", e.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "제출 중…" : "제보하기"}
        </button>
      </form>
    </section>
  );
}
