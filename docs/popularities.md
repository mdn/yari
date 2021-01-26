# Popularities

A popular page is one that has lot of pageviews. We get this from Google Analytics.
Being popular helps search because when a certain search term matches many
documents, too many to display all, we need to sort them to try to predict
which one the user most probably wanted to find.

To accomplish this we check in a file in the content repo called `popularities.json`
which looks like this:

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

The number of pageviews is normalized. The popularity is a number between 0 and 1.
Where the most popular page is `1`.
Note that not all documents will have a popularity. So don't expect every known
URL in the content to appear in the `popularities.json` file.

## How to get the data

To update the `popularities.json` file, you need to generate an "Unsampled Report"
in Google Analytics.
In Google Analytics, go to "Behavior" -> "Site content" -> "All pages". Then,
click on "Export" (upper right-hand corner) and select "Unsampled report" and leave
all options to default.
Once you've done that, it takes a while, but you can now go to "Customization"
-> "Unsampled reports" and there, there should be a report called "Pages". On that
row there's a "Download" column. Click "CSV" to download the `Pages.csv` file.
Download that file and save anywhere on your computer.

## Run the CLI tool

Once you have the `Pages.csv` file run:

```bash
yarn tool popularities ~/Downloads/Pages.csv
```

This should now update the file `files/popularities.json` in your `mdn/content`
repo. It takes the value of the `CONTENT_ROOT` constant.

Once you've done this, you need to make a pull request on the new `mdn/content`
repo.

## The future

We have talked about automating this. Not only is it very clunky to have to
use the Google Analytics web app to get the report, it's also only a matter
of time till it's out of date. And if a new page is introduced, since the last
time you generated a report, it will be "unfavored" in search.

One idea would be that we instead use Kuma to collect this. Then Yari could
download it from Kuma right before the build starts. If we do this we would
fully automate everything and the data would be more up-to-date.
