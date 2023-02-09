import ReactModal from "react-modal";

import "./index.scss";

if (process.env.NODE_ENV !== "test") ReactModal.setAppElement("#root");

interface ModalProps extends ReactModal.Props {
  size?: "small";
  extraOverlayClassName?: string;
}

export default function MDNModal(props: ModalProps) {
  return (
    <ReactModal
      overlayClassName={`modal-overlay ${props.extraOverlayClassName || ""}`}
      className={`modal-content ${props.className || ""} ${
        props.size ? `is-${props.size}` : ""
      }`}
      {...props}
    />
  );
}
