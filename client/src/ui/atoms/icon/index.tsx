import "./index.scss";

type IconProps = {
  name: string;
  extraClasses?: string;
};

export const Icon = ({ name, extraClasses }: IconProps) => {
  return <span className={`icon icon-${name} ${extraClasses || ""}`}></span>;
};

export function HighlightedIcon(props: IconProps) {
  return (
    <span className={`icons icons-highlighted icons-highlighted-${props.name}`}>
      <span className="icons-highlight-wrapper">
        <Icon name="highlight" />
      </span>
      <span className="icons-icon-wrapper">
        <Icon {...props} />
      </span>
    </span>
  );
}
