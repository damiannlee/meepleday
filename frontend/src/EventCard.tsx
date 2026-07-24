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
      {event.scheduleNote && <p className="schedule-note">{event.scheduleNote}</p>}
      {children && <div className="card-actions">{children}</div>}
    </article>
  );
}
