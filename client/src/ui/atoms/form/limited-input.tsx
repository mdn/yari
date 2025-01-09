import { ChangeEventHandler } from "react";
import { charLength } from "../../../utils";

interface Props {
  children: (props: ChildProps) => React.ReactNode;
  value: string;
  limit: number;
}

interface ChildProps {
  value: string;
  changeWrapper: ChangeWrapper;
}

type ChangeWrapper = (
  callback: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
) => ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;

export default function LimitedInput({ children, value, limit }: Props) {
  const changeWrapper: ChangeWrapper = (callback) => {
    return (e) => {
      callback(e);
      e.target.setCustomValidity(
        charLength(e.target.value) > limit
          ? `Please ensure your input is no longer than ${limit} characters.`
          : ""
      );
    };
  };

  return (
    <>
      {children({
        value,
        changeWrapper,
      })}
      <Limit value={value} limit={limit} />
    </>
  );
}

interface LimitProps {
  value: string;
  limit: number;
}

function Limit({ value, limit }: LimitProps) {
  const length = charLength(value);
  return (
    <div className={"limit" + (length > limit ? " invalid" : "")}>
      <b>{length}</b>/{limit}
    </div>
  );
}
