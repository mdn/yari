import React from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useLocale } from "../hooks";
import { useUserData } from "../user-context";

import "./sign-up.scss";

export default function SignUpApp() {
  const userData = useUserData();
  const locale = useLocale();
  const [searchParams] = useSearchParams();

  const [checkedTerms, setCheckedTerms] = React.useState(false);

  if (!userData) {
    return <div>Loading...</div>;
  }

  if (userData.isAuthenticated) {
    return (
      <div>
        <h2>You're already signed up</h2>
        {/* XXX Include a link to the settings page */}
        <Link to={`/${locale}/`}>Return to the home page</Link>.
      </div>
    );
  }

  if (searchParams.get("errors")) {
    console.warn("Errors", searchParams.get("errors"));
    const errors = JSON.parse(searchParams.get("errors") || "{}");
    return (
      <div>
        <h2>Sign-up errors</h2>
        <p>An error occurred trying to sign you up.</p>
        <pre>{JSON.stringify(errors, null, 2)}</pre>
        <p>
          <Link to={`/${locale}/signin`}>
            Try starting over the sign-in process
          </Link>
          .
        </p>
      </div>
    );
  }

  const csrfMiddlewareToken = searchParams.get("csrfmiddlewaretoken");
  const provider = searchParams.get("provider");
  if (!csrfMiddlewareToken || !provider) {
    return (
      <div>
        <h2>Invalid Sign up URL</h2>
        <p>You arrived here on this page without the necessary details.</p>
        <p>
          <Link to={`/${locale}/signin`}>
            Try starting over the sign-in process
          </Link>
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
      {/* This is just a temporary thing needed to tell Kuma's signup view
          that the request came from (the jamstack) Yari and not the existing
          Kuma front-end. Then Kuma knows to certainly only respond with redirects. */}
      <input type="hidden" name="yarisignup" value="1" />

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
      <DisplaySignupProvider provider={provider || ""} />
      <DisplayUserDetails details={searchParams.get("user_details") || ""} />

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

function DisplaySignupProvider({ provider }: { provider: string }) {
  if (!provider) {
    // Exit early because there's nothing useful we can say
    return null;
  }
  let providerVerbose = provider.charAt(0).toUpperCase() + provider.slice(1);
  if (provider === "github") {
    providerVerbose = "GitHub";
  }
  return (
    <p>
      You are signing in to MDN Web Docs with <b>{providerVerbose}</b>.
    </p>
  );
}

interface UserDetails {
  name?: string;
  avatar_url?: string;
}

function DisplayUserDetails({ details }: { details: string }) {
  if (!details) {
    // Exit early because there's nothing useful we can say
    return null;
  }

  const userDetails: UserDetails = JSON.parse(details);

  return (
    <div className="user-details">
      <p>
        {userDetails.avatar_url && (
          <img
            src={userDetails.avatar_url}
            className="avatar"
            alt="User profile avatar_url"
          />
        )}

        {userDetails.name && ` as ${userDetails.name}`}
      </p>
    </div>
  );
}
