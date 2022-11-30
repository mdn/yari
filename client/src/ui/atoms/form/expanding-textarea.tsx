import { DetailedHTMLProps, TextareaHTMLAttributes, useCallback } from "react";

export default function ExpandingTextarea(
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) {
  const { value } = props;

  const resizeCallback = useCallback(
    (node: HTMLTextAreaElement) => {
      if (value && node && node.scrollHeight > node.clientHeight) {
        node.style.height = `${node.scrollHeight + 2}px`;
      }
    },
    [value]
  );

  return <textarea {...props} rows={2} ref={resizeCallback} />;
}
