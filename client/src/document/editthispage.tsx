import React, { useEffect } from "react";

import "./editthispage.css";

export function EditThisPage({ source }) {
  const [opening, setOpening] = React.useState(false);

  useEffect(() => {
    let dismounted = false;
    if (opening) {
      setTimeout(() => {
        if (!dismounted) {
          setOpening(false);
        }
      }, 3000);
    }
    return () => {
      dismounted = true;
    };
  }, [opening]);

  function openInEditorHandler(folder: string) {
    const filepath = folder + "/index.html";
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
  const url = new URL(source.github_url);
  const { pathname } = url;
  const branch = pathname.split("/")[4];
  const folder = pathname.split("/").slice(5).join("/");

  return (
    <p className="edit-this-page">
      <a
        href={url.toString()}
        title={`Folder: ${folder} Branch: ${branch}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Edit this page in <b>GitHub</b>
      </a>
      {process.env.NODE_ENV === "development" && (
        <>
          {" "}
          <button
            title={`Folder: ${folder}`}
            onClick={(event) => {
              event.preventDefault();
              openInEditorHandler(folder);
            }}
          >
            Edit this page in your <b>editor</b>
          </button>
          <br />
          {opening && <small>Trying to your editor now...</small>}
        </>
      )}
    </p>
  );
}
