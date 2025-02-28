/** @param {string} code */
function setChoice(code) {
  const element = document.getElementById("example-element");
  if (element) {
    element.style.cssText = code;
  }
}

window.addEventListener("message", ({ data }) => {
  if (data.typ === "choice") {
    setChoice(data.code);
  }
});
