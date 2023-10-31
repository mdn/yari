import { useEffect, useState } from "react";
import {
  ExperimentsConfig,
  getExperiments,
  setExperiments,
} from "../plus/common/api";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { useUserData } from "../user-context";

export default function Experiments() {
  const userData = useUserData();
  const [loading, setLoading] = useState<boolean>(true);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [exConfig, setExConfig] = useState<ExperimentsConfig>({});
  useEffect(() => {
    (async () => {
      const { active, config } = await getExperiments();
      setEnabled(active || false);
      setExConfig(config || {});
      setLoading(false);
    })();
  }, []);

  return userData?.experiments || enabled ? (
    <section className="field-group">
      <h2 id="experiments">Early Access</h2>
      <ul>
        <li>
          <h3>In-Development Features</h3>
          <span>
            By enabling and testing these features, you consent to us recording
            your interactions as feedback to refine our ongoing developments.
          </span>
          {loading ? (
            <Spinner extraClasses="loading" />
          ) : (
            <Switch
              name="mdn_plus_experiments"
              checked={Boolean(enabled)}
              toggle={async (e) => {
                setLoading(true);
                const { active, config } = await setExperiments({
                  active: Boolean(e.target.checked),
                });
                setEnabled(active || false);
                setExConfig(config || {});
                setLoading(false);
              }}
            ></Switch>
          )}
        </li>
        {enabled && (
          <>
            {"full_doc" in exConfig && (
              <li>
                <h3>Try Amplified Context</h3>
                <span>
                  Enhance the LLM with full MDN articles for richer context.
                </span>
                {loading ? (
                  <Spinner extraClasses="loading" />
                ) : (
                  <Switch
                    name="mdn_plus_experiments_full_docs"
                    checked={Boolean(exConfig?.full_doc)}
                    toggle={async (e) => {
                      setLoading(true);
                      const { active, config } = await setExperiments({
                        config: { full_doc: Boolean(e.target.checked) },
                      });
                      setEnabled(active || false);
                      setExConfig(config || {});
                      setLoading(false);
                    }}
                  ></Switch>
                )}
              </li>
            )}
            {"gpt4" in exConfig && (
              <li>
                <h3>Switch to GPT-4</h3>
                <span>Experience the power and versatility of GPT-4.</span>
                {loading ? (
                  <Spinner extraClasses="loading" />
                ) : (
                  <Switch
                    name="mdn_plus_experiments_gpt4"
                    checked={Boolean(exConfig?.gpt4)}
                    toggle={async (e) => {
                      setLoading(true);
                      const { active, config } = await setExperiments({
                        config: { gpt4: Boolean(e.target.checked) },
                      });
                      setEnabled(active || false);
                      setExConfig(config || {});
                      setLoading(false);
                    }}
                  ></Switch>
                )}
              </li>
            )}
            {"new_prompt" in exConfig && (
              <li>
                <h3>Use Optimized Prompts</h3>
                <span>Use enhanced prompts for more accurate responses.</span>
                {loading ? (
                  <Spinner extraClasses="loading" />
                ) : (
                  <Switch
                    name="mdn_plus_experiments_new_prompt"
                    checked={Boolean(exConfig?.new_prompt)}
                    toggle={async (e) => {
                      setLoading(true);
                      const { active, config } = await setExperiments({
                        config: { new_prompt: Boolean(e.target.checked) },
                      });
                      setEnabled(active || false);
                      setExConfig(config || {});
                      setLoading(false);
                    }}
                  ></Switch>
                )}
              </li>
            )}
          </>
        )}
      </ul>
    </section>
  ) : null;
}
