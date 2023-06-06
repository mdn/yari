import { Button } from "../ui/atoms/button";

export function FlagForm({ gistId }: { gistId: string | null }) {
  return (
    <form>
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
            e.currentTarget.closest("dialog")?.close();
          }}
          value="default"
        >
          Send
        </Button>
      </div>
    </form>
  );
}

export function ShareForm({ url }: { url: null | string }) {
  return (
    <form>
      <span>Share your code via this Permalink:</span>
      {url && <a href={url}>{url}</a>}
      <div className="buttons">
        <Button
          type="secondary"
          onClickHandler={async () => {
            url && (await navigator.clipboard.writeText(url));
          }}
        >
          Copy to Clipboard
        </Button>
        <Button value="cancel" buttonType="submit" formMethod="dialog">
          Close
        </Button>
      </div>
    </form>
  );
}
