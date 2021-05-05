import React from "react";

import { useUserData } from "../../user-context";
import "./index.scss";

const API_URL = "/api/v1/mdnplusplus/landing-page-survey/";

export default function LandingPageSurvey({ variant }: { variant: number }) {
  const [email, setEmail] = React.useState("");
  const [page, setPage] = React.useState<"start" | "thankyou" | "price">(
    "start"
  );
  const userData = useUserData();
  React.useEffect(() => {
    if (userData && userData.email && !email) {
      setEmail(userData.email);
    }
  }, [userData, email]);

  const [price, setPrice] = React.useState("");

  const [
    surveySubmissionError,
    setSurveySubmissionError,
  ] = React.useState<Error | null>(null);

  async function sendSurvey() {
    const formData = new URLSearchParams();
    formData.set("price", price);
    formData.set("email", email);
    formData.set("variant", `${variant}`);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        // "X-CSRFToken": surveySettingsData.csrfmiddlewaretoken,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`${response.status} on ${API_URL}`);
    }
    setSurveySubmissionError(null);
    return response;
  }

  return (
    <form
      className="landing-page-survey"
      onSubmit={async (event) => {
        event.preventDefault();
        if (email.trim()) {
          if (email.trim() !== email) {
            setEmail(email.trim());
          }
          setPage("price");
        }
        if (page === "price") {
          try {
            await sendSurvey();
            setPage("thankyou");
          } catch (err) {
            setSurveySubmissionError(err);
          }
        }
      }}
    >
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
    </form>
  );
}
