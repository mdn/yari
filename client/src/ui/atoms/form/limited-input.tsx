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
      const length = charLength(newValue);
      if (length <= limit || length < charLength(value)) {
        callback(e);
      } else {
        // attempt to put cursor back where it was
        // by default it moves to the end of the input
        const cursor = e.target.selectionStart;
        setTimeout(() => {
          if (cursor !== null) {
            e.target.setSelectionRange(cursor - 1, cursor - 1);
          }
        }, 0);
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
