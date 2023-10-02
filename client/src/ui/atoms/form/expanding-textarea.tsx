import { DetailedHTMLProps, TextareaHTMLAttributes, useCallback } from "react";

type AreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

export default function ExpandingTextarea(
  props: AreaProps | { enterKeyHint: string }
) {
  const { value } = props as AreaProps;

  const resizeCallback = useCallback(
    (node: HTMLTextAreaElement) => {
      if (value && node && node.scrollHeight > node.clientHeight) {
        node.style.height = `${node.scrollHeight + 2}px`;
      }
    },
    [value]
  );

  return (
    <textarea
      {...(props as AreaProps)}
      rows={(props as AreaProps).rows || 2}
      ref={resizeCallback}
    />
  );
}
