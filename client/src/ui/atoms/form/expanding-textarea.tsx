import {
  DetailedHTMLProps,
  TextareaHTMLAttributes,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

type AreaProps = DetailedHTMLProps<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  HTMLTextAreaElement
>;

const ExpandingTextarea = forwardRef(function ExpandingTextarea(
  props: AreaProps | { enterKeyHint: string },
  ref
) {
  const { value } = props as AreaProps;
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          textAreaRef.current?.focus();
        },
      };
    },
    []
  );
  useEffect(() => {
    const node = textAreaRef.current;

    if (!node) {
      return;
    }

    // Collapse.
    node.style.height = "";

    if (value && node.scrollHeight > node.clientHeight) {
      // Expand.
      node.style.height = `${node.scrollHeight + 2}px`;
    }
  }, [value]);

  return (
    <textarea
      {...(props as AreaProps)}
      rows={(props as AreaProps).rows || 2}
      ref={textAreaRef}
    />
  );
});

export default ExpandingTextarea;
