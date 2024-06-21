export function Link({ href, children }: { href: string; children: any }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${href.startsWith("/") ? "" : "external"}`}
    >
      {children}
    </a>
  );
}

export function PassIcon({ pass }: { pass: boolean | null }) {
  if (pass === null) {
    return <>-</>;
  }
  return (
    <span className="obs-pass-icon">
      {pass ? (
        <svg
          className="pass"
          width="24"
          height="27"
          viewBox="0 -2 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="11.8984" r="9" />
          <path d="M12 1.89844C6.5 1.89844 2 6.39844 2 11.8984C2 17.3984 6.5 21.8984 12 21.8984C17.5 21.8984 22 17.3984 22 11.8984C22 6.39844 17.5 1.89844 12 1.89844ZM10 16.8984L5 11.8984L6.41 10.4884L10 14.0684L17.59 6.47844L19 7.89844L10 16.8984Z" />
        </svg>
      ) : (
        <svg
          className="fail"
          width="24"
          height="27"
          viewBox="0 -2 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_6033_1063)">
            <circle cx="12" cy="11.8984" r="9" />
            <path d="M12 1.79688C17.53 1.79688 22 6.26687 22 11.7969C22 17.3269 17.53 21.7969 12 21.7969C6.47 21.7969 2 17.3269 2 11.7969C2 6.26687 6.47 1.79688 12 1.79688ZM15.59 6.79688L12 10.3869L8.41 6.79688L7 8.20687L10.59 11.7969L7 15.3869L8.41 16.7969L12 13.2069L15.59 16.7969L17 15.3869L13.41 11.7969L17 8.20687L15.59 6.79688Z" />
          </g>
          <defs>
            <clipPath id="clip0_6033_1063">
              <rect
                width="24"
                height="24"
                fill="white"
                transform="translate(0 0.203125)"
              />
            </clipPath>
          </defs>
        </svg>
      )}
      <span className="visually-hidden">{pass ? "Passed" : "Failed"}</span>
    </span>
  );
}

export const ERROR_MAP = {
  TypeError: "Observatory is currently down.",
};

export function fixMinusSymbol(term: string | number | null | undefined) {
  if (!term) {
    return null;
  }
  // replace dash with unicode minus symbol
  // −
  // MINUS SIGN
  // Unicode: U+2212, UTF-8: E2 88 92
  return `${term}`.replaceAll(/-/g, "−");
}
