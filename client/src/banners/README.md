# Using banners

Your first step is to define an `id` for the banner in the `BannerId` enum in
`client/src/banners/ids.ts`, or use an existing one. For example:

```js
export enum BannerId {
  // ...
  REDESIGN_ANNOUNCEMENT = "redesign_announcement",
};
```

Next go into `client/src/banners/index.tsx` and update `currentBannerId`:

```js
const currentBannerId: BannerId | null = BannerId.REDESIGN_ANNOUNCEMENT;
```

To adjust the number of days to embargo the banner, update `daysToEmbargo`:

```js
const daysToEmbargo = 14;
```

> NOTE: Banners are not embargoed, if `REACT_APP_DEV_MODE` is set to `true`.

Now head over to `client/src/banners/active-banner.tsx` and add or update the
the component function for the banner as appropriate:

```js
function RedesignAnnouncementBanner({
  onDismissed,
}: {
  onDismissed: () => void,
}) {
  return (
    <Banner id={REDESIGN_ANNOUNCEMENT} onDismissed={onDismissed}>
      <p className="mdn-cta-copy">
        ✨{" "}
        <a
          href="https://hacks.mozilla.org/2022/02/a-new-year-a-new-mdn/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => SendCTAEventToGA(REDESIGN_ANNOUNCEMENT)}
        >
          Learn more
        </a>{" "}
        about MDN Web Docs' new design.
      </p>
    </Banner>
  );
}
```

Lastly update the `ActiveBanner` function to include your banner:

```js
export default function ActiveBanner({
  id,
  onDismissed,
}: {
  id: BannerId,
  onDismissed: () => void,
}) {
  switch (id) {
    // ...

    case BannerId.REDESIGN_ANNOUNCEMENT:
      return <RedesignAnnouncementBanner onDismissed={onDismissed} />;

    // ...
  }
}
```

## What to do when disabling all banners?

Go to `client/src/banners/index.tsx` and set `currentBannerId` to `null`.
