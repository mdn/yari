// This file is the magic. It gets edited by the automation in the cli.
// In fact its content is auto-generated and when it gets edited, this
// will cause the development server to refresh itself.
import touched from "./touchthis";

// Display a minimal top bar at top of the page about information about
// what was touched.
if (process.env.NODE_ENV === "development") {
  if (Object.keys(touched).length) {
    const wrapper = document.createElement("p");
    wrapper.style["background-color"] = "#dedede";
    wrapper.style["bgColor"] = "orange";
    wrapper.style["position"] = "absolute";
    wrapper.style["top"] = "0px";
    wrapper.style["font-size"] = "70%";
    wrapper.style["margin"] = "0";
    wrapper.style["width"] = "100%";

    const labelChangedFile = document.createElement("b");
    labelChangedFile.textContent = "changed file: ";
    wrapper.appendChild(labelChangedFile);

    if (touched.hasEDITOR) {
      const changedFile = document.createElement("a");
      changedFile.href = `file://${touched.changedFile.path}`;
      changedFile.onclick = event => {
        event.preventDefault();
        console.log(
          `Going to try to open ${touched.changedFile.path} in your editor`
        );
        fetch(`/_open?filepath=${touched.changedFile.path}`);
      };
      changedFile.title = "Click to open in your editor";
      changedFile.style["padding-left"] = "2px";
      changedFile.style["padding-right"] = "10px";
      changedFile.textContent = touched.changedFile.name;
      wrapper.appendChild(changedFile);
    } else {
      const changedFile = document.createElement("span");
      changedFile.title = "$EDITOR is not set. See README.";
      changedFile.style["padding-right"] = "10px";
      changedFile.textContent = touched.changedFile.name;
      wrapper.appendChild(changedFile);
    }

    const labelDocument = document.createElement("b");
    labelDocument.textContent = "document url: ";
    wrapper.appendChild(labelDocument);

    const builtFile = document.createElement("a");
    builtFile.href = touched.documents[0].uri;
    builtFile.title = "Click to go to";
    builtFile.style["padding-left"] = "2px";
    builtFile.textContent = touched.documents[0].uri;
    wrapper.appendChild(builtFile);
    document.body.appendChild(wrapper);
  }
}
