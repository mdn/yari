import { useState } from "react";
import { toggleAIHelpHistory } from "../plus/common/api";
import {
  TOGGLE_PLUS_AI_HELP_HISTORY_DISABLED,
  TOGGLE_PLUS_AI_HELP_HISTORY_ENABLED,
} from "../telemetry/constants";
import { useGleanClick } from "../telemetry/glean-context";
import { Spinner } from "../ui/atoms/spinner";
import { Switch } from "../ui/atoms/switch";
import { useUserData } from "../user-context";
import { useAiHelpSettings } from "../plus/ai-help/utils";

export function ManageAIHelp() {
  const [saving, setSaving] = useState<boolean>(false);
  const user = useUserData();
  const { isHistoryEnabled } = useAiHelpSettings();
  const gleanClick = useGleanClick();

  return (
    <section className="field-group">
      <h2>AI Help</h2>
      <ul>
        <li>
          <section
            id="ai-help--history-enable"
            aria-labelledby="ai-help-enable-history"
          >
            <h3 id="ai-help-enable-history">Enable History</h3>
            <div className="setting-row">
              <span>
                Enable history to automatically save your asked questions with
                AI Help's answers. If you disable the history, your current
                topics will be kept, but no new topics will be saved.
              </span>
              {saving ? (
                <Spinner extraClasses="loading" />
              ) : (
                <Switch
                  name="ai_help_history_enabled"
                  checked={isHistoryEnabled}
                  toggle={async (e) => {
                    setSaving(true);
                    const { checked } = e.target;
                    const source = checked
                      ? TOGGLE_PLUS_AI_HELP_HISTORY_DISABLED
                      : TOGGLE_PLUS_AI_HELP_HISTORY_ENABLED;
                    gleanClick(source);
                    await toggleAIHelpHistory(checked);
                    if (user?.settings) {
                      user.settings.aiHelpHistory = checked;
                    }
                    user?.mutate?.();
                    setSaving(false);
                  }}
                ></Switch>
              )}
            </div>
          </section>
        </li>
        <li>
          <h3 id="ai-help-history-delete">Delete History</h3>
          <section
            className="setting-row"
            aria-labelledby="ai-help-history-delete"
          >
            <span>
              Activating 'Delete history' will permanently erase all of your AI
              Help saved history.
            </span>
            <button
              onClick={async () => {
                if (
                  window.confirm(
                    "Do you want to permanently delete your AI Help history?"
                  )
                ) {
                  await fetch("/api/v1/plus/ai/help/history/list", {
                    method: "DELETE",
                  });
                }
              }}
            >
              Delete
            </button>
          </section>
        </li>
      </ul>
    </section>
  );
}
