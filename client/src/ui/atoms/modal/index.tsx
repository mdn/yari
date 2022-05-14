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
      className={`modal-content ${props.className || ""} ${
        props.size ? `is-${props.size}` : ""
      }`}
      {...props}
    />
  );
}
