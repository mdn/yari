import React from "react";
import Modal from "react-modal";

import { getAuthURL } from "./auth-link";

import "../kumastyles/minimalist/components/auth-modal.scss";

Modal.setAppElement("#root");

export default function AuthModal(props: Omit<Modal.Props, "isOpen">) {
  return (
    <Modal
      isOpen
      overlayClassName="modal"
      className="auth-providers"
      {...props}
    >
      <header>
        <h2 id="modal-main-heading">Sign In</h2>
      </header>
      <p>
        Sign in to enjoy the benefits of an MDN account. If you haven’t already
        created an MDN profile, you will be prompted to do so after signing in.
      </p>
      <div className="auth-button-container">
        <a href={getAuthURL("/users/github/login/")} className="github-auth">
          Sign in with Github
        </a>
        <a href={getAuthURL("/users/google/login/")} className="google-auth">
          Sign in with Google
        </a>
      </div>

      <button
        id="close-modal"
        className="close-modal"
        onClick={props.onRequestClose}
      >
        <span>Close modal</span>
      </button>
    </Modal>
  );
}
