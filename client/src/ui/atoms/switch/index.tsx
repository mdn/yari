import "./index.scss";

export function Switch({
  name,
  hiddenLabel,
  checked = false,
  toggle = () => {},
  children,
}: {
  name: string;
  hiddenLabel?: string;
  checked?: boolean;
  toggle?: React.ChangeEventHandler<HTMLInputElement>;
  children?: React.ReactNode;
}) {
  return (
    <label className="switch">
      {hiddenLabel && <span className="visually-hidden">{hiddenLabel}</span>}
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={toggle}
      ></input>
      <span className="slider"></span>
      {children && <span className="label">{children}</span>}
    </label>
  );
}
