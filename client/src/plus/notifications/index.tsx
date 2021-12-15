import List from "../common/list";

function Notification(item) {
  return (
    <div>
      <h4>{item.title}</h4>
      <p>{item.text}</p>
    </div>
  );
}

export default function Notifications() {
  return (
    <>
      <h1>My Notifications</h1>
      <List component={Notification} apiUrl="/api/v1/plus/notifications/" />
    </>
  );
}
