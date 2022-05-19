// @ts-expect-error ts-migrate(1259) FIXME: Module '"/Users/claas/github/mdn/yari/node_modules... Remove this comment to see the full error message
import ReactModal from "react-modal";

import "./index.scss";

if (process.env.NODE_ENV !== "test") ReactModal.setAppElement("#root");

interface ModalProps extends ReactModal.Props {
  size?: "small";
}

export default function MDNModal(props: ModalProps) {
  return (
    <ReactModal
      overlayClassName="modal-overlay"
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'className' does not exist on type 'Modal... Remove this comment to see the full error message
      className={`modal-content ${props.className || ""} ${
        props.size ? `is-${props.size}` : ""
      }`}
      {...props}
    />
  );
}
