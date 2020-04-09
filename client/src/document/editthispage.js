import React from "react";

import "./editthispage.css";

export function EditThisPage({ source }) {
  const [opening, setOpening] = React.useState(false);

  React.useEffect(() => {
    let dismounted = false;
    if (opening) {
      setTimeout(() => {
        if (!dismounted) {
          setOpening(false);
        }
      }, 3000);
    }
  }, [opening]);

  function openInEditorHandler(event) {
    event.preventDefault();

    const filepath = source.content_file;
    console.log(`Going to try to open ${filepath} in your editor`);
    setOpening(true);
    fetch(`/_open?filepath=${filepath}`);
    // .then(r => {
    //   console.log("R", r);
    // })
    // .catch(ex => {
    //   console.log("EX:", ex);
    // });
  }
  if (!source) {
    return null;
  }
  if (source.github_url) {
    return (
      <p className="edit-this-page">
        <a
          href={source.github_url}
          title={`Folder: ${source.folder}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Edit this page in <b>GitHub</b>
        </a>
      </p>
    );
  } else if (source.content_file) {
    return (
      <p className="edit-this-page">
        <a
          href={`file://${source.content_file}`}
          title={`Folder: ${source.folder}`}
          onClick={openInEditorHandler}
        >
          Edit this page in your editor
        </a>
        <br />
        {opening && <small>Trying to your editor now...</small>}
      </p>
    );
  } else {
    throw new Error("source has neither .github_url or .content_file");
  }
}
