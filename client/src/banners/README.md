# Using banners

Your first step is to define an `id` for the banner or reuse one of the previous
banners' (if appropriate) `ids` in `client/src/banners/ids.ts`. For example:

```js
export const REDESIGN_ANNOUNCEMENT = "redesign_announcement";
```

Next go into `client/src/banners/index.tsx` and import your banner id:

```js
import { REDESIGN_ANNOUNCEMENT } from "./ids";
```

> NOTE: If there are currently no banners running, ensure that you set
> `hasActiveBanners` to `true`.

In the `Banner` function update the following code as appropriate:

```js
if (CRUD_MODE || !isEmbargoed(REDESIGN_ANNOUNCEMENT)) {
  return (
    <React.Suspense fallback={null}>
      <ActiveBanner
        id={REDESIGN_ANNOUNCEMENT}
        onDismissed={() => {
          setEmbargoed(REDESIGN_ANNOUNCEMENT, 7);
        }}
      />
    </React.Suspense>
  );
}
```

> NOTE: The seconds parameter to the `setEmbargoed` function is the number of
> days to embargo the banner. A banner will always show if you have
> `REACT_APP_CRUD_MODE` set to `true` in `.env` or the banner is not embargoed.

Now head over to `client/src/banners/active-banner.tsx` and update the following
function as appropriate:

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

Lastly update the `ActiveBanner` function to list your banner:

```js
export default function ActiveBanner({
  id,
  onDismissed,
}: {
  id: string,
  onDismissed: () => void,
}) {
  if (id === REDESIGN_ANNOUNCEMENT) {
    return <RedesignAnnouncementBanner onDismissed={onDismissed} />;
  }
  throw new Error(`Unrecognized banner to display (${id})`);
}
```

## What to do when disabling all banners?

Go to `client/src/banners/index.tsx` and set `hasActiveBanners` to `false`.
