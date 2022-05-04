import "./index.scss";

type IconProps = {
  name: string;
  extraClasses?: string;
};

export const Icon = ({ name, extraClasses }: IconProps) => {
  return <span className={`icon icon-${name} ${extraClasses || ""}`}></span>;
};
