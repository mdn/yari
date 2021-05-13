import React from "react";
import useSWR from "swr";

import { useUserData } from "../../user-context";
import "./index.scss";

const API_URL = "/api/v1/plus/landing-page-survey/";
const SESSIONSTORAGE_KEY_UUID = "plus-landing-page-survey-uuid";
const SESSIONSTORAGE_KEY_EMAIL = "plus-landing-page-survey-email";

interface PingData {
  csrfmiddlewaretoken: string;
  uuid: string;
}

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

export default function LandingPageSurvey({ variant }: { variant: number }) {
  const [email, setEmail] = React.useState(
    getSessionStorageData(SESSIONSTORAGE_KEY_EMAIL) || ""
  );
  const [page, setPage] =
    React.useState<"start" | "thankyou" | "price">("start");
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

  const [surveySubmissionError, setSurveySubmissionError] =
    React.useState<Error | null>(null);

  // Use a useMemo(() => {...}, [variant]) so that you don't get a different
  // response if there's a re-render because in a re-render you might get
  // something different (from the first render) from getSessionStorageData().
  const pingURL = React.useMemo(() => {
    const pingSP = new URLSearchParams();
    pingSP.set("variant", `${variant}`);
    const previousUUID = getSessionStorageData(SESSIONSTORAGE_KEY_UUID);
    if (previousUUID) {
      pingSP.set("uuid", previousUUID);
    }
    return `${API_URL}?${pingSP.toString()}`;
  }, [variant]);

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
    formData.set("response", JSON.stringify({ price }));
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
              setPage("price");
            } catch (error) {
              setWaitlistSubmissionError(error);
            }
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
          Thank you for taking our survey. Your response is very important to
          us.
        </p>
      )}
      {page === "price" && (
        <div className="form-element price">
          <label>What do you think about the price?</label>
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
      )}
      {page === "start" && (
        <div className="form-element email">
          <label htmlFor="id_email">Email</label>
          <input
            type="email"
            id="id_email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      )}
      {page !== "thankyou" && (
        <button type="submit" className="button">
          {page === "start" ? "Join the waitlist" : "Submit survey"}
        </button>
      )}

      {process.env.NODE_ENV === "development" && (
        <div style={{ margin: 30, float: "right" }}>
          <button
            onClick={() => {
              sessionStorage.removeItem(SESSIONSTORAGE_KEY_UUID);
              sessionStorage.removeItem(SESSIONSTORAGE_KEY_EMAIL);
              window.location.reload();
            }}
          >
            <small>Dev Reset Survey</small>
          </button>
        </div>
      )}
    </form>
  );
}
