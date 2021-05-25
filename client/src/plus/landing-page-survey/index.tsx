import React from "react";
import useSWR from "swr";

import { useUserData } from "../../user-context";
import "./index.scss";

const API_URL = "/api/v1/plus/landing-page/survey/";
const SESSIONSTORAGE_KEY_UUID = "plus-landing-page-survey-uuid";
const SESSIONSTORAGE_KEY_EMAIL = "plus-landing-page-survey-email";

interface PingData {
  csrfmiddlewaretoken: string;
  uuid: string;
}

type Page = "start" | "thankyou" | "price" | "features";

function setSessionStorageData(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.warn("Unable to set sessionStorage key");
  }
}

function getSessionStorageData(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch (err) {
    console.warn("Unable to get sessionStorage key");
  }
}

export function LandingPageSurvey({ variant }: { variant: number }) {
  const [email, setEmail] = React.useState(
    getSessionStorageData(SESSIONSTORAGE_KEY_EMAIL) || ""
  );
  const [page, setPage] = React.useState<Page>("start");
  const userData = useUserData();
  React.useEffect(() => {
    if (userData && userData.email && !email) {
      setEmail(userData.email);
    }
  }, [userData, email]);

  React.useEffect(() => {
    if (email) {
      setSessionStorageData(SESSIONSTORAGE_KEY_EMAIL, email.trim());
    }
  }, [email]);

  const [price, setPrice] = React.useState("");
  const [priceComment, setPriceComment] = React.useState("");
  const [features, setFeatures] = React.useState([""]);
  const [featuresComment, setFeaturesComment] = React.useState("");

  const [surveySubmissionError, setSurveySubmissionError] =
    React.useState<Error | null>(null);

  // Use a useMemo(() => {...}, [variant]) so that you don't get a different
  // response if there's a re-render because in a re-render you might get
  // something different (from the first render) from getSessionStorageData().
  const pingURL = React.useMemo(() => {
    const pingSP = new URLSearchParams();
    const previousUUID = getSessionStorageData(SESSIONSTORAGE_KEY_UUID);
    if (previousUUID) {
      pingSP.set("uuid", previousUUID);
    }
    return `${API_URL}?${pingSP.toString()}`;
  }, []);

  const { data: pingData, error: pingError } = useSWR<PingData>(
    pingURL,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} on ${url}`);
      }
      return await response.json();
    },
    {
      revalidateOnFocus: false,
    }
  );

  React.useEffect(() => {
    if (pingData) {
      setSessionStorageData(SESSIONSTORAGE_KEY_UUID, pingData.uuid);
    }
  }, [pingData]);

  async function sendSurveySubmission() {
    if (!pingData) {
      throw new Error("Can't send survey if ping didn't work");
    }
    const formData = new URLSearchParams();
    formData.set(
      "response",
      JSON.stringify({
        price: price.trim(),
        features: features.filter(Boolean),
        priceComment: priceComment.trim(),
        featuresComment: featuresComment.trim(),
      })
    );
    formData.set("uuid", pingData.uuid);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-CSRFToken": pingData.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${API_URL}`);
    }
    return response;
  }

  const [waitlistSubmissionError, setWaitlistSubmissionError] =
    React.useState<Error | null>(null);

  async function sendWaitlistSubmission(email: string) {
    if (!pingData) {
      throw new Error("Can't send waitlist sing up if ping didn't work");
    }
    const formData = new URLSearchParams();
    formData.set("email", email);
    formData.set("uuid", pingData.uuid);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "X-CSRFToken": pingData.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${API_URL}`);
    }
    return response;
  }

  if (!pingData && !pingError) {
    return null;
  }

  if (pingData) {
    if (!pingData.csrfmiddlewaretoken) {
      console.warn("No valid 'csrfmiddlewaretoken' from the ping");
      return null;
    }
    if (!pingData.uuid) {
      console.warn("No valid 'uuid' from the ping");
      return null;
    }
  }

  if (pingError) {
    return (
      <p className="ping-error">
        Unable to ping the server for the survey. Sorry.
        <br />
        <small>({pingError.toString()})</small>
      </p>
    );
  }

  return (
    <form
      className="landing-page-survey"
      onSubmit={async (event) => {
        event.preventDefault();
        if (page === "start") {
          if (email.trim()) {
            if (email.trim() !== email) {
              setEmail(email.trim());
            }
            try {
              await sendWaitlistSubmission(email.trim());
              setWaitlistSubmissionError(null);
              setPage("features");
            } catch (error) {
              setWaitlistSubmissionError(error);
            }
          }
        } else if (page === "features") {
          try {
            await sendSurveySubmission();
            setSurveySubmissionError(null);
            setPage("price");
          } catch (err) {
            setSurveySubmissionError(err);
          }
        } else if (page === "price") {
          try {
            await sendSurveySubmission();
            setSurveySubmissionError(null);
            setPage("thankyou");
          } catch (err) {
            setSurveySubmissionError(err);
          }
        }
      }}
    >
      {waitlistSubmissionError && (
        <p className="survey-submission-error">
          <strong>Oh no!</strong> Your survey submission unfortunately failed.{" "}
          <br />
          <code>{waitlistSubmissionError.toString()}</code>
        </p>
      )}
      {surveySubmissionError && (
        <p className="survey-submission-error">
          <strong>Oh no!</strong> Your survey submission unfortunately failed.{" "}
          <br />
          <code>{surveySubmissionError.toString()}</code>
        </p>
      )}
      {page === "thankyou" && (
        <p className="thank-you">
          <h2>
            Thank you for your feedback! Your input helps shape the future of
            MDN Plus.
          </h2>
        </p>
      )}
      {page === "price" && (
        <div className="features">
          <h2>
            {
              "Thanks! Before you go, help us by answering some optional questions (2/2)"
            }
          </h2>

          <div className="form-element price">
            <label>
              <h6>What do you think about the price?</h6>
            </label>
            {[
              ["too low", "Too low"],
              ["seems fair", "Seems fair"],
              ["too high", "Too high"],
            ].map(([value, label]) => {
              const id = value.replace(/\s+/g, "_");
              return (
                <div key={id}>
                  <input
                    type="radio"
                    id={id}
                    value={value}
                    checked={price === value}
                    onChange={() => setPrice(value)}
                  />{" "}
                  <label htmlFor={id}>{label}</label>
                </div>
              );
            })}
          </div>
          <div className="form-element price-comment">
            <label>
              <h6>Please tell us why</h6>
            </label>
            <textarea
              value={priceComment}
              onChange={(e) => setPriceComment(e.target.value)}
              placeholder="Let us know what you think"
              rows={2}
              cols={80}
            ></textarea>
            <button type="submit">Submit</button>
          </div>
        </div>
      )}
      {page === "features" && (
        <div className="features">
          <h2>
            {
              "Thanks! Before you go, help us by answering some optional questions (1/2)"
            }
          </h2>

          <div className="form-element">
            <label>
              <h6>Which content or features were most compelling to you?</h6>
            </label>
            {[
              "Deep dive: Modern CSS in the Real World: Your browser support toolkit",
              "Deep dive: GDPR, DSAR, CCPA, and COPA. So Many Acronyms! Learn Mozilla's Framework To Handle Privacy Laws",
              "Deep dive: Stop using jQuery and start using JavaScript!",
              "Deep dive: A robust CSS pattern library",
              "Deep dive: Modern Responsive Web Design",
              "Deep dive: Security Considerations in Web Development",
              "Premium feature: Bookmark and annotations",
              "Premium feature: MDN offline",
              "Premium feature: Custom BCD table",
            ].map((value) => {
              const id = value.replace(/\s+/g, "_");
              return (
                <div key={id}>
                  <input
                    type="checkbox"
                    id={id}
                    value={value}
                    checked={features.includes(value)}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setFeatures([value, ...features]);
                      } else {
                        setFeatures(features.filter((v) => v !== value));
                      }
                    }}
                  />{" "}
                  <label htmlFor={id}>{value}</label>
                </div>
              );
            })}
          </div>

          <div className="form-element features-comment">
            <label>
              <h6>What motivated your selection?</h6>
            </label>
            <textarea
              value={featuresComment}
              onChange={(e) => setFeaturesComment(e.target.value)}
              placeholder="Let us know what you think"
              rows={2}
              cols={80}
            ></textarea>
          </div>
          <button type="submit">Next</button>
        </div>
      )}
      {page === "start" && (
        <div>
          <h2>Interested? Be the first to be notified when we launch.</h2>
          <div className="form-element email">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="E-mail address"
            />
            <button type="submit" className="button">
              Join the waitlist
            </button>
            <p>
              <small>
                By clicking “Join the waitlist”, you agree to our{" "}
                <a
                  href="https://www.mozilla.org/en-US/privacy/websites/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
                .
              </small>
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
