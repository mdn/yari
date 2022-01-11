import { Button } from "../../ui/atoms/button";
import { post } from "./utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationCard({ item, changedCallback, csrfToken }) {
  const toggleStarUrl = `/api/v1/plus/notifications/${item.id}/toggle-starred/`;
  const deleteUrl = `/api/v1/plus/notifications/${item.id}/delete/`;

  return (
    <article className={`notification-card ${!item.read ? "unread" : ""}`}>
      <Button
        type="action"
        extraClasses="notification-card-star"
        icon={item.starred ? "star-filled" : "star"}
        onClickHandler={async () => {
          await post(toggleStarUrl, csrfToken);
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Toggle Starring</span>
      </Button>

      <div className="notification-card-description">
        <h2 className="notification-card-title">{item.title}</h2>
        <p className="notification-card-text">{item.text}</p>
      </div>

      <time
        className="notification-card-created"
        dateTime={dayjs(item.created).toISOString()}
      >
        {dayjs(item.created).fromNow().toString()}
      </time>

      <Button
        type="action"
        icon="trash"
        onClickHandler={async () => {
          await post(deleteUrl, csrfToken);
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Delete</span>
      </Button>
    </article>
  );
}
