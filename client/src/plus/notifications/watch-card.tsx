import { mutate } from "swr";
import { Button } from "../../ui/atoms/button";
import { post } from "./utils";

export default function WatchCard(item, { changedCallback, csrfToken }) {
  const deleteUrl = `/api/v1/plus/notifications/watch/${item.url}`;

  return (
    <article className="notification-card no-star">
      <div className="notification-card-description">
        <h2 className="notification-card-title">{item.title}</h2>
        <p className="notification-card-text">
          <a href={item.url}>{item.url}</a>
        </p>
      </div>

      <Button
        type="action"
        icon="trash"
        onClickHandler={async () => {
          await post(deleteUrl, csrfToken, { unwatch: true });
          mutate(deleteUrl);
          changedCallback && changedCallback();
        }}
      >
        <span className="visually-hidden">Unwatch</span>
      </Button>
    </article>
  );
}
