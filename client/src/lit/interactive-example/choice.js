window.addEventListener("message", ({ data }) => {
  console.log("DATA!", data);
  if (data.typ === "choice") {
    const code = data.code;
    const element = document.getElementById("example-element");
    if (element) {
      element.style.cssText = code;
    }
    // TODO: nice transitions
    // TODO: whatever prefixing and validation is going on in bob/editor/js/editor-libs/css-editor-utils.ts
  }
});
