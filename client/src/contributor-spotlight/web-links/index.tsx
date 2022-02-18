export default function WebLinks({ webLinks }) {
  return (
    <ul>
      {webLinks.map(({ name, url }) => {
        return (
          <li key={url}>
            <a href={url}>{name}</a>
          </li>
        );
      })}
    </ul>
  );
}
