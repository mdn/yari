import React from "react";
import Modal from "react-modal";

import "../kumastyles/minimalist/components/auth-modal.scss";

Modal.setAppElement("#root");

// Why using `next=${window.location.href}` instead of `next=${window.location.pathname}`?
// The reason is that you might be doing local development with Yari and
// that means that logging in takes you to a different domain entirely.
// In local development, you want to tell that other server that
// "Hey I came from this other development domain". And when it's all in
// production, the Yari and the Kuma, it's harmless to do this because the
// domain will actually be identical. django-allauth *discards* the `?next`
// parameter if it is an absolute URL with a different host name. That's
// right and sensible, but it's totally worth doing an exception for the
// greater development experience of mixing Kuma and Yari all in development
// mode.
const authURL = (provider) =>
  `/users/${provider}/login/?next=${window.location.href}`;

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
        <a href={authURL("github")} className="github-auth">
          Sign in with Github
        </a>
        <a href={authURL("google")} className="google-auth">
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
