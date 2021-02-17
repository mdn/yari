import React from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import { useUserData } from "../user-context";

import "./sign-up.scss";

export default function SignUpApp() {
  const userData = useUserData();
  const locale = useLocale();
  const [searchParams] = useSearchParams();

  const [checkedTerms, setCheckedTerms] = React.useState(false);

  if (userData && userData.isAuthenticated) {
    return (
      <div>
        <h2>You're already signed up</h2>
        {/* XXX Include a link to the settings page */}
        <a href={`/${locale}/`}>Return to the home page</a>.
      </div>
    );
  }
  const csrfMiddlewareToken = searchParams.get("csrfmiddlewaretoken");
  if (!csrfMiddlewareToken) {
    return (
      <div>
        <h2>Invalid Sign up URL</h2>
        <p>You arrived here on this page without the necessary details.</p>
        <p>
          <a href={`/${locale}/signin`}>
            Try starting over the sign-in process
          </a>
          .
        </p>
      </div>
    );
  }
  let prefix = "";
  // When doing local development with Yari, the link to authenticate in Kuma
  // needs to be absolute. And we also need to send the absolute URL as the
  // `next` query string parameter so Kuma sends us back when the user has
  // authenticated there.
  if (
    process.env.NODE_ENV === "development" &&
    process.env.REACT_APP_KUMA_HOST
  ) {
    prefix = `http://${process.env.REACT_APP_KUMA_HOST}`;
  }
  const signupURL = `${prefix}/${locale}/users/account/signup`;

  return (
    <form action={signupURL} method="post">
      {/* We can delete this once the Kuma backend is 100% just a backend. */}
      <input type="hidden" name="website" value="" />

      <h1>Sign up</h1>
      {searchParams.get("next") && (
        <input
          type="hidden"
          name="next"
          value={searchParams.get("next") || ""}
        />
      )}
      <input
        type="hidden"
        name="csrfmiddlewaretoken"
        value={csrfMiddlewareToken}
      />
      <DisplayUserDetails
        email={searchParams.get("email_address") || ""}
        details={searchParams.get("user_details") || ""}
      />

      <label htmlFor="id_terms">
        <input
          id="id_terms"
          type="checkbox"
          name="terms"
          checked={checkedTerms}
          onChange={(event) => {
            setCheckedTerms(event.target.checked);
          }}
        />{" "}
        I agree to Mozilla's{" "}
        <a
          href="https://www.mozilla.org/about/legal/terms/mozilla"
          target="_blank"
          rel="noreferrer noopener"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="https://www.mozilla.org/privacy/websites/"
          target="_blank"
          rel="noreferrer noopener"
        >
          Privacy Notice
        </a>
        .
      </label>

      <button type="submit" className="button" disabled={!checkedTerms}>
        Create account
      </button>
    </form>
  );
}

interface UserDetails {
  name?: string;
  picture?: string;
}

function DisplayUserDetails({
  email,
  details,
}: {
  email: string;
  details: string;
}) {
  if (!email && !details) {
    return null;
  }

  const userDetails: UserDetails = JSON.parse(details);

  return (
    <div className="user-details">
      <p>
        {userDetails.picture && (
          <img
            src={userDetails.picture}
            className="avatar"
            alt="User profile picture"
          />
        )}

        <b>{email}</b>
        {userDetails.name && ` as ${userDetails.name}`}
      </p>
    </div>
  );
}
