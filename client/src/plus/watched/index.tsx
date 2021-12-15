import List from "../common/list";

function Page(item) {
  return (
    <div>
      <h4>PAGE: {item.title}</h4>
      <p>{item.text}</p>
    </div>
  );
}

export default function WatchedPages() {
  return (
    <>
      <h1>Watched Pages</h1>
      <List component={Page} apiUrl="/api/v1/plus/watched/" />
    </>
  );
}
