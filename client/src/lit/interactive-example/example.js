window.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLAnchorElement) {
    const hrefAttr = target.getAttribute("href");
    const targetAttr = target.getAttribute("target");
    if (hrefAttr && !hrefAttr.startsWith("#") && !targetAttr) {
      target.target = "_parent";
    }
  }
});
