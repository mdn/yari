import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGleanClick } from "../telemetry/glean-context";
import { OBSERVATORY } from "../telemetry/constants";
import Container from "../ui/atoms/container";
import { SidePlacement } from "../ui/organisms/placement";

import { ObservatoryAnalyzeRequest } from "./types";
import { ObservatoryLayout } from "./layout";
import { Progress } from "./progress";
import { ERROR_MAP, FeedbackLink, useUpdateResult } from "./utils";

import "./landing.scss";
import { ReactComponent as LandingSVG } from "../../public/assets/observatory/landing-illustration.svg";
import { ReactComponent as LinesSVG } from "../../public/assets/observatory/lines.svg";
import { ReactComponent as AssessmentSVG } from "../../public/assets/observatory/assessment.svg";
import { ReactComponent as ScanningSVG } from "../../public/assets/observatory/scanning.svg";
import { ReactComponent as SecuritySVG } from "../../public/assets/observatory/security.svg";
import { ReactComponent as MdnSVG } from "../../public/assets/observatory/mdn.svg";

export default function ObservatoryLanding() {
  document.title = "HTTP Observatory | MDN";

  const defaultForm: ObservatoryAnalyzeRequest = {
    host: "",
  };

  const [form, setForm] = useState(defaultForm);
  const [cleanHostname, setCleanHostname] = useState(form.host);
  const {
    trigger,
    isMutating,
    data,
    error: updateError,
  } = useUpdateResult(cleanHostname);
  const [error, setError] = useState<Error>();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // tolerate url-style host values and pick out the hostname part
      const url = new URL(form.host);
      setCleanHostname(url.hostname.trim() || form.host);
    } catch {
      setCleanHostname(form.host);
    }
  }, [form.host]);

  useEffect(() => {
    if (!isMutating && data) {
      if (data.scan.error) {
        setError(new Error(data.scan.error));
      } else {
        navigate(`./analyze?host=${encodeURIComponent(cleanHostname)}`);
      }
    }
  }, [isMutating, data, navigate, cleanHostname]);

  useEffect(() => {
    setError(updateError);
  }, [updateError]);

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(undefined);
    if (form.host.trim().length === 0) {
      setError(new Error("Please enter a valid hostname"));
    } else {
      trigger();
    }
  };

  const gleanClick = useGleanClick();

  useEffect(() => {
    if (error && !isMutating) {
      gleanClick(
        `${OBSERVATORY}: error: ${ERROR_MAP[error.name] || error.message}`
      );
    }
  }, [error, isMutating, gleanClick]);

  return (
    <ObservatoryLayout>
      <section className="observatory-landing observatory-landing-top">
        <Container extraClasses="observatory-wrapper">
          <section className="header">
            <section className="scan-form">
              <h1>
                <span className="accent">HTTP Observatory</span>
              </h1>
              <p>
                Launched in 2016, HTTP Observatory enhances web security by
                analyzing compliance with best security practices. It has
                provided insights to over 6.5 million websites through 47
                million scans.
              </p>
              {isMutating ? (
                <Progress message={`Scanning ${cleanHostname}…`} />
              ) : (
                <form onSubmit={submit}>
                  <div className="input-group">
                    <label htmlFor="host" className="visually-hidden">
                      Domain
                    </label>
                    <input
                      placeholder="Scan a website for free (e.g. mdn.dev)"
                      type="text"
                      name="host"
                      id="host"
                      value={form.host}
                      onChange={(e) =>
                        setForm({ ...form, host: e.target.value })
                      }
                    />
                    <button
                      type="submit"
                      disabled={isMutating}
                      onClick={() => gleanClick(`${OBSERVATORY}: click: scan`)}
                    >
                      Scan
                    </button>
                  </div>
                </form>
              )}
              {error && !isMutating && (
                <div className="error">
                  Error: {ERROR_MAP[error.name] || error.message}
                </div>
              )}
            </section>
            <section className="landing-illustration">
              <LandingSVG role="none" />
            </section>
          </section>
        </Container>
      </section>
      <section className="observatory-landing">
        <Container extraClasses="observatory-wrapper">
          <section className="main">
            <section className="about">
              <h2>About the HTTP Observatory</h2>
              <figure className="assessment">
                <AssessmentSVG role="none" />
                <figcaption>
                  <p>
                    Developed by Mozilla, the tool performs an in-depth
                    assessment of a site’s HTTP headers and other key security
                    configurations.
                  </p>
                </figcaption>
              </figure>
              <LinesSVG className="lines assessment" role="none" />
              <figure className="scanning">
                <ScanningSVG role="none" />
                <figcaption>
                  <p>
                    Through its automated scanning process, it provides
                    developers and website administrators with detailed,
                    actionable feedback, focusing on identifying and addressing
                    potential vulnerabilities.
                  </p>
                </figcaption>
              </figure>
              <LinesSVG className="lines scanning" role="none" />
              <figure className="security">
                <SecuritySVG role="none" />
                <figcaption>
                  <p>
                    The tool is instrumental in helping developers and website
                    administrators to strengthen their sites against common
                    security threats. The ratings and recommendations are based
                    on well-established web security trends and guidelines, and
                    are shaped by Mozilla's expertise and experience in the
                    field.
                  </p>
                </figcaption>
              </figure>
              <LinesSVG className="lines security" role="none" />
              <figure className="mdn">
                <MdnSVG role="none" />
                <figcaption>
                  <p>
                    As in any area of web development, there may be multiple
                    valid approaches, and our suggestions are guided by our
                    commitment to a safer and more secure internet. The MDN HTTP
                    Observatory ensures easy access to security insights,
                    enabling the development of more secure and resilient
                    websites in a constantly advancing digital environment.
                  </p>
                </figcaption>
              </figure>
            </section>
            <FeedbackLink />
          </section>
          <SidePlacement />
        </Container>
      </section>
    </ObservatoryLayout>
  );
}
