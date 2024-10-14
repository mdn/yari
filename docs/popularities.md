# Popularities

A popular page is one that has lot of pageviews. We get this from our CDN access
logs. Being popular helps search because when a certain search term matches many
documents, too many to display all, we need to sort them to try to predict which
one the user most probably wanted to find.

To accomplish this we create a file during build `popularities.json` which looks
like this:

```json
{
  "/en-US/docs/Web/JavaScript": 1,
  "/en-US/docs/Web/API/Fetch_API/Using_Fetch": 0.9672804290643255,
  "/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array": 0.9530352201687562,
  "/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter": 0.9444402691900387,
  ...
  "/zh-TW/docs/Web/JavaScript/Guide/Numbers_and_dates": 0.0008813582482150788,
  "/de/docs/Web/HTML/Globale_Attribute/title": 0.0008745260137327913,
  "/de/docs/Web/Performance/dns-prefetch": 0.0008745260137327913,
  "/de/docs/Web/SVG/Tutorial/SVG_Image_Tag": 0.0008745260137327913,
  "/en-US/docs/Learn/Forms/Test_your_skills:_HTML5_controls": 0.0008745260137327913
}
```

The number of pageviews is normalized. The popularity is a number between 0
and 1. Where the most popular page is `1`. Note that not all documents will have
a popularity. So don't expect every known URL in the content to appear in the
`popularities.json` file.

## Where's the data from

Popularities are based on our Glean data, exposed at
https://popularities.mdn.mozilla.net/current.csv.

## Run the CLI tool

```bash
npm run tool popularities
```

This should now download the latest popularities csv and update the file
`popularities.json`.
