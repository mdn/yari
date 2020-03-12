import React from "react";

const banners = {
  deprecated: {
    class: "deprecated-banner",
    text:
      "This is an <strong>deprecated</strong> technology. Avoid using it, and update existing code if possible. Be aware that this feature may cease to work at any time."
  },
  experimental: {
    class: "experimental-banner",
    text:
      "This is an <strong>experimental</strong> technology. Check the Browser compatibility table carefully before using it in production."
  },
  non_standard: {
    class: "nonstandard-banner",
    text:
      "This is an <strong>non-standard</strong> technology. Do not use it on production sites facing the Web: it will not work for every user."
  }
};

function StatusBanner({ content }) {
  return (
    <div
      className={`banner ${content.class}`}
      dangerouslySetInnerHTML={{ __html: content.text }}
    />
  );
}

export function StatusBanners({ status }) {
  return (
    <>
      {status.deprecated && <StatusBanner content={banners["deprecated"]} />}
      {status.experimental && (
        <StatusBanner content={banners["experimental"]} />
      )}
      {status.non_standard && (
        <StatusBanner content={banners["non_standard"]} />
      )}
    </>
  );
}
