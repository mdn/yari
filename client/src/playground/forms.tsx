import { useState } from "react";
import { Button } from "../ui/atoms/button";
import { EditorContent, codeToMarkdown } from "./utils";
import { Loading } from "../ui/atoms/loading";

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
          Send
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
  let [url, setUrl] = useState<string | null>(null);
  let [loading, setLoading] = useState(false);
  return (
    <form className="share">
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
      </section>
      <div className="buttons">
        <Button value="cancel" buttonType="submit" formMethod="dialog">
          Close
        </Button>
      </div>
    </form>
  );
}
