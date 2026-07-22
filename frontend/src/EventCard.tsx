import type { EventResponse } from "./api";
import {
  EVENT_TYPE_LABEL,
  REGION_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  formatDeadline,
} from "./labels";

interface Props {
  event: EventResponse;
  children?: React.ReactNode;
}

export function EventCard({ event, children }: Props) {
  const progress = event.fundingProgressPercent;
  return (
    <article className="card">
      <div className="card-head">
        <span className="badge" style={{ background: STATUS_COLOR[event.status] }}>
          {STATUS_LABEL[event.status]}
        </span>
        <span className="deadline">{formatDeadline(event.endAt)}</span>
      </div>
      <h3 className="card-title">
        <a href={event.originalUrl} target="_blank" rel="noreferrer">
          {event.title}
        </a>
      </h3>
      <div className="card-meta">
        <span className="chip">{REGION_LABEL[event.region]}</span>
        <span className="chip">{EVENT_TYPE_LABEL[event.eventType]}</span>
        <span className="chip chip-platform">{event.platform}</span>
      </div>
      {event.publisher && <p className="publisher">{event.publisher}</p>}
      {progress != null && (
        <div className="progress-wrap">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="progress-label">{progress}% 달성</span>
        </div>
      )}
      {children && <div className="card-actions">{children}</div>}
    </article>
  );
}
