window.addEventListener("click", (event) => {
  // open links in parent frame if they have no `_target` set
  const target = event.target;
  if (
    target instanceof HTMLAnchorElement ||
    target instanceof HTMLAreaElement
  ) {
    const hrefAttr = target.getAttribute("href");
    const targetAttr = target.getAttribute("target");
    if (hrefAttr && !hrefAttr.startsWith("#") && !targetAttr) {
      target.target = "_parent";
    }
  }
});
