window.addEventListener("message", ({ data }) => {
  console.log("DATA!", data);
  if (data.typ === "choice") {
    const code = data.code;
    const element = document.getElementById("example-element");
    if (element) {
      element.style.cssText = code;
    }
  }
});
