import { ChangeEventHandler } from "react";
import { charLength } from "../../../utils";

interface Props {
  children: (props: ChildProps) => void;
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
      const { value: newValue } = e.target;
      const trimmed = newValue.trimStart();
      const length = charLength(trimmed);
      if (length <= limit || length < charLength(value)) {
        callback(e);
      }
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
  return (
    <div className="limit">
      <b>{charLength(value)}</b>/{limit}
    </div>
  );
}
