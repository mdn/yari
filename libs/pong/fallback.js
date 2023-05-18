/* global fetch */
export async function fallbackHandler(
  coder,
  carbonZoneKey,
  userAgent,
  anonymousIp
) {
  try {
    const {
      ads: [
        { description = null, statlink, statimp, smallImage, ad_via_link },
      ] = [],
    } = await (
      await fetch(
        `https://srv.buysellads.com/ads/${carbonZoneKey}.json?forwardedip=${encodeURIComponent(
          anonymousIp
        )}${userAgent ? `&useragent=${encodeURIComponent(userAgent)}` : ""}`
      )
    ).json();
    return {
      click: coder.encodeAndSign(statlink),
      view: coder.encodeAndSign(statimp),
      image: coder.encodeAndSign(smallImage),
      copy: description,
      by: ad_via_link,
    };
  } catch (e) {
    console.log(e);
    return null;
  }
}
