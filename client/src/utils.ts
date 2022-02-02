export function docCategory({ pathname = "" } = {}) {
  const [, , , webOrLearn, category] = pathname.split("/");
  if ((webOrLearn === "Learn" || webOrLearn === "Web") && category) {
    return `category-${category.toLowerCase()}`;
  }
  return null;
}
