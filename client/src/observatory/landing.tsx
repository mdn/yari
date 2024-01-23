import { useEffect, useState } from "react";
import { ObservatoryAnalyzeRequest } from "./types";
import { useNavigate } from "react-router-dom";
import { useUpdateResult } from ".";
import { SidePlacement } from "../ui/organisms/placement";

export default function ObservatoryLanding() {
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
    <section className="observatory-header">
      <div className="inner">
        <h1>
          <span className="accent">Scan</span> a website for free
        </h1>
        <p>
          Empowering over 240,000 websites, the Mozilla Observatory educates
          developers, system administrators, and security professionals in
          configuring sites securely.
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
                placeholder="Enter the website’s address"
                type="text"
                name="host"
                id="host"
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
              />
              <button type="submit" disabled={form.host.trim().length === 0}>
                Scan
              </button>
            </div>
          )}
          <label>
            <input
              type="checkbox"
              name="hidden"
              checked={form.hidden}
              onChange={(e) => setForm({ ...form, hidden: e.target.checked })}
              disabled={isMutating}
            />
            Don’t include my site in the public results
          </label>
        </form>
        <SidePlacement />
      </div>
    </section>
  );
}
