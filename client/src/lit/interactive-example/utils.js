/**
 * Checks if the CSS code is supported by the current browser.
 *
 * @param {string} code
 */
export function isCSSSupported(code) {
  // http://regexr.com/3fvik
  const cssCommentsMatch = /(\/\*)[\s\S]+(\*\/)/g;
  const element = document.createElement("div");

  // strip out any CSS comments before applying the code
  code = code.replace(cssCommentsMatch, "");

  const vendorPrefixMatch = /^-(?:webkit|moz|ms|o)-/;
  const style = element.style;
  // Expecting declarations to be separated by ";"
  // Declarations with just white space are ignored
  const declarationsArray = code
    .split(";")
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  /**
   * @param {string} declaration
   * @returns {boolean} - true if declaration starts with -webkit-, -moz-, -ms- or -o-
   */
  function hasVendorPrefix(declaration) {
    return vendorPrefixMatch.test(declaration);
  }

  /**
   * Looks for property name by cutting off optional vendor prefix at the beginning
   * and then cutting off rest of the declaration, starting from any whitespace or ":" in property name.
   * @param {string} declaration - single css declaration, with not white space at the beginning
   * @returns {string} - property name without vendor prefix.
   */
  function getPropertyNameNoPrefix(declaration) {
    const prefixMatch = vendorPrefixMatch.exec(declaration);
    const prefix = prefixMatch === null ? "" : prefixMatch[0];
    const declarationNoPrefix =
      prefix === null ? declaration : declaration.slice(prefix.length);
    // Expecting property name to be over, when any whitespace or ":" is found
    const propertyNameSeparator = /[\s:]/;
    return declarationNoPrefix.split(propertyNameSeparator)[0] ?? "";
  }

  // Clearing previous state
  style.cssText = "";

  // List of found and applied properties with vendor prefix
  const appliedPropertiesWithPrefix = new Set();
  // List of not applied properties - because of lack of support for its name or value
  const notAppliedProperties = new Set();

  for (const declaration of declarationsArray) {
    const previousCSSText = style.cssText;
    // Declarations are added one by one, because browsers sometimes combine multiple declarations into one
    // For example Chrome changes "column-count: auto;column-width: 8rem;" into "columns: 8rem auto;"
    style.cssText += declaration + ";"; // ";" was previous removed while using split method
    // In case property name or value is not supported, browsers skip single declaration, while leaving rest of them intact
    const correctlyApplied = style.cssText !== previousCSSText;

    const vendorPrefixFound = hasVendorPrefix(declaration);
    const propertyName = getPropertyNameNoPrefix(declaration);

    if (correctlyApplied && vendorPrefixFound) {
      // We are saving applied properties with prefix, so equivalent property with no prefix doesn't need to be supported
      appliedPropertiesWithPrefix.add(propertyName);
    } else if (!correctlyApplied && !vendorPrefixFound) {
      notAppliedProperties.add(propertyName);
    }
  }

  if (notAppliedProperties.size !== 0) {
    // If property with vendor prefix is supported, we can ignore the fact that browser doesn't support property with no prefix
    for (const substitute of appliedPropertiesWithPrefix) {
      notAppliedProperties.delete(substitute);
    }
    // If any other declaration is not supported, whole block should be marked as invalid
    if (notAppliedProperties.size !== 0) return false;
  }
  return true;
}
