import "./index.scss";

export function Switch({
  name,
  checked = false,
  toggle = () => {},
}: {
  name: string;
  checked?: boolean;
  toggle: (Event) => void;
}) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={toggle}
      ></input>
      <span className="slider"></span>
    </label>
  );
}
