import { DisplayH3 } from "./utils";

const ALLOWED_POLYFILL_SERVICE = [
  {
    baseURL: "https://github.com/zloirock/core-js",
    serviceURL: "",
    serviceName: "core-js",
  },
  {
    baseURL: "https://github.com/Financial-Times/polyfill-service",
    serviceURL: "http://polyfill.io",
    serviceName: "polyfill.io",
  },
  {
    baseURL: "https://formatjs.io/docs/polyfills",
    serviceURL: "https://formatjs.io/",
    serviceName: "formatjs.io",
  },
  {
    baseURL: "https://github.com/tc39/",
    serviceURL: "https://github.com/tc39/",
    serviceName: "TC39",
  },
  {
    baseURL: "https://github.com/w3c",
    serviceURL: "https://github.com/w3c",
    serviceName: "W3C",
  },
];

function polyfillService(url) {
  return ALLOWED_POLYFILL_SERVICE.find((entry) =>
    url.startsWith(entry.baseURL)
  );
}

export function PolyfillsSubSection({
  id,
  polyfillURLs,
}: {
  id: string;
  polyfillURLs: string;
}) {
  if (polyfillURLs) {
    const title = "Polyfills";

    const service = polyfillService(polyfillURLs);
    if (service === undefined) {
      return (
        <>
          <DisplayH3 id={id} title={title} />
          Error: Polyfill url not in allowed list.
        </>
      );
    } else {
      return (
        <>
          <DisplayH3 id={id} title={title} />A{" "}
          <a href={polyfillURLs}> polyfill</a> for this feature is available at{" "}
          <a href={service.serviceURL}>{service.serviceName}</a>.
        </>
      );
    }
  }
  return "";
}
