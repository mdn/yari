export default function BrowserName({ browserNameKey }) {
  let firstChar;
  switch (browserNameKey) {
    case "chrome":
    case "edge":
    case "firefox":
    case "opera":
    case "safari":
      firstChar = browserNameKey.charAt(0);
      return browserNameKey.replace(firstChar, firstChar.toUpperCase());
    case "ie":
      return "Internet Explorer";
    case "webview_android":
      return "Android webview";
    case "chrome_android":
      return "Chrome for Android";
    case "firefox_android":
      return "Firefox for Android";
    case "opera_android":
      return "Opera for Android";
    case "safari_ios":
      return "Safari on iOS";
    case "samsunginternet_android":
      return "Samsung Internet";
    case "edge_mobile":
      return "Edge Android";
    case "nodejs":
      return "Node.js";
    default:
      return browserNameKey;
  }
}
