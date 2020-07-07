import React from "react";

export default function AuthModal() {
  return (
    <>
      <p>
        Sign in to enjoy the benefits of an MDN account. If you haven’t already
        created an MDN profile, you will be prompted to do so after signing in.
      </p>
      <div className="auth-button-container">
        <a href="/GITHUB_SIGNIN_URL" className="github-auth">
          Sign in with Github
        </a>
        <a href="/GOOGLE_SIGNIN_URL" className="google-auth">
          Sign in with Google
        </a>
      </div>
    </>
  );
}
