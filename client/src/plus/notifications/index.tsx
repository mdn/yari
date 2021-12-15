import Container from "../../ui/atoms/container";
import Tabs from "../../ui/molecules/tabs";
import List from "../common/list";

function Notification(item) {
  return (
    <article>
      <h4>{item.title}</h4>
      <p>{item.text}</p>
    </article>
  );
}

export default function Notifications() {
  return (
    <>
      <header className="plus-header">
        <Container>
          <h1>My Notifications</h1>
        </Container>

        <Tabs />
      </header>
      <List component={Notification} apiUrl="/api/v1/plus/notifications/" />
    </>
  );
}
