import { useState } from "react";
import { Button } from "../ui/atoms/button";
import { EditorContent, codeToMarkdown } from "./utils";
import { Loading } from "../ui/atoms/loading";
import { useUserData } from "../user-context";
import { usePlusUrl } from "../plus/utils";
import { useGleanClick } from "../telemetry/glean-context";
import { AuthContainer } from "../ui/molecules/auth-container";
import { PLUS_UPDATES } from "../telemetry/constants";

export function FlagForm({ gistId }: { gistId: string | null }) {
  return (
    <form className="flag">
      <span>
        Report this malicious or inappropriate shared playground. Can you please
        share some details what wrong with this content:
      </span>
      <textarea id="flagReason"></textarea>
      <div className="buttons">
        <Button
          id="flag-cancel"
          value="cancel"
          type="secondary"
          buttonType="submit"
          formMethod="dialog"
        >
          Cancel
        </Button>
        <Button
          id="flag-send"
          onClickHandler={async (e) => {
            e.preventDefault();
            await fetch("/api/v1/play/flag", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: gistId,
                reason: (
                  document.getElementById("flagReason") as HTMLTextAreaElement
                ).value,
              }),
            });
            document.getElementById("flag-send")?.closest("dialog")?.close();
          }}
          value="default"
        >
          Report
        </Button>
      </div>
    </form>
  );
}

export function ShareForm({
  share,
  code,
}: {
  share?: () => Promise<string> | string;
  code?: () => EditorContent;
  extraClasses?: string;
}) {
  let userData = useUserData();
  const href = usePlusUrl();
  const gleanClick = useGleanClick();
  let [url, setUrl] = useState<string | null>(null);
  let [loading, setLoading] = useState(false);
  return (
    <form className="share">
      <Button
        id="share-cancel"
        title="Cancel"
        extraClasses="action"
        value="cancel"
        icon="cancel"
        buttonType="submit"
        formMethod="dialog"
      ></Button>
      <section>
        <span>Share Markdown</span>
        <Button
          type="secondary"
          onClickHandler={async () => {
            code &&
              (await navigator.clipboard.writeText(codeToMarkdown(code())));
          }}
        >
          Copy markdown to clipboard
        </Button>
      </section>
      <section>
        <span>Share your code via Permalink</span>
        {userData?.isAuthenticated ? (
          <>
            {url ? (
              loading ? (
                <Loading />
              ) : (
                <>
                  <a href={url}>{url}</a>
                  <Button
                    type="secondary"
                    onClickHandler={async () => {
                      url && (await navigator.clipboard.writeText(url));
                    }}
                  >
                    Copy to clipboard
                  </Button>
                </>
              )
            ) : (
              <Button
                onClickHandler={async () => {
                  setLoading(true);
                  const u = await share?.();
                  setLoading(false);
                  setUrl(u || null);
                }}
              >
                Create link
              </Button>
            )}
          </>
        ) : (
          <p className="share-get-plus">
            <span>
              <span>Want to share this playground via link?</span>
              <br />
              <strong>
                Upgrade to{" "}
                <a
                  className="plus-link"
                  href={href}
                  onClick={() =>
                    gleanClick(`${PLUS_UPDATES.MDN_PLUS}: banner-link`)
                  }
                >
                  MDN Plus
                </a>{" "}
                for free.
              </strong>
            </span>
            <AuthContainer
              signInGleanContext={`${PLUS_UPDATES.MDN_PLUS}: banner-login`}
              subscribeGleanContext={`${PLUS_UPDATES.MDN_PLUS}: banner-button`}
            />
          </p>
        )}
      </section>
    </form>
  );
}
