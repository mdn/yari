import { useEffect, useState } from "react";
import { ObservatoryAnalyzeRequest } from "./types";
import { useNavigate } from "react-router-dom";
import { useUpdateResult } from ".";
import { SidePlacement } from "../ui/organisms/placement";

import { ReactComponent as AssessmentSVG } from "../../public/assets/observatory/assessment.svg";
import { ReactComponent as ScanningSVG } from "../../public/assets/observatory/scanning.svg";
import { ReactComponent as SecuritySVG } from "../../public/assets/observatory/security.svg";
import { ReactComponent as MdnSVG } from "../../public/assets/observatory/mdn.svg";
import Container from "../ui/atoms/container";

export default function ObservatoryLanding() {
  document.title = "HTTP Observatory | MDN";

  const defaultForm: ObservatoryAnalyzeRequest = {
    host: "",
    hidden: false,
  };

  const [form, setForm] = useState(defaultForm);
  const { trigger, isMutating, data, error } = useUpdateResult(form.host);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isMutating && data?.scan.state === "FINISHED") {
      navigate(`./${form.host}`);
    }
  }, [isMutating, data, navigate, form.host]);

  const submit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    trigger(form.hidden);
  };

  return (
    <>
      <section className="observatory-landing">
        <Container extraClasses="observatory-wrapper">
          <section className="header">
            <h1>HTTP Observatory</h1>
            <p>
              Launched in 2016, the HTTP Observatory is designed to enhance web
              security by analyzing website compliance with security best
              practices. To date, it has delivered insights and recommendations
              to over 6.5 million websites via 47 million scans.
            </p>
            <form onSubmit={submit}>
              {error && !isMutating && (
                <div className="error">Error: {error.message}</div>
              )}
              {isMutating ? (
                <div className="progress">Scanning...</div>
              ) : (
                <div className="input-group">
                  <label htmlFor="host" className="visually-hidden">
                    Domain
                  </label>
                  <input
                    placeholder="Scan a website for free (e.g. mozilla.org)"
                    type="text"
                    name="host"
                    id="host"
                    value={form.host}
                    onChange={(e) => setForm({ ...form, host: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={form.host.trim().length === 0}
                  >
                    Scan
                  </button>
                </div>
              )}
              <label>
                <input
                  type="checkbox"
                  name="hidden"
                  checked={form.hidden}
                  onChange={(e) =>
                    setForm({ ...form, hidden: e.target.checked })
                  }
                  disabled={isMutating}
                />
                Don’t include my site in the public results
              </label>
            </form>
          </section>
          <SidePlacement />
          <section className="footer">
            <section className="about">
              <figure>
                <AssessmentSVG />

                <figcaption>
                  <p>
                    Developed by Mozilla, the tool performs an in-depth
                    assessment of a site’s HTTP headers and other key security
                    configurations.
                  </p>
                </figcaption>
              </figure>

              <figure>
                <ScanningSVG />

                <figcaption>
                  <p>
                    Through its automated scanning process, it provides
                    developers and website administrators with detailed,
                    actionable feedback, focusing on identifying and addressing
                    potential vulnerabilities.
                  </p>
                </figcaption>
              </figure>

              <figure>
                <SecuritySVG />

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

              <figure>
                <MdnSVG />

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
          </section>
        </Container>
      </section>
    </>
  );
}
