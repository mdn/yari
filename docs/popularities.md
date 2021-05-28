# Popularities

A popular page is one that has lot of pageviews. We get this from our CDN access
logs. Being popular helps search because when a certain search term matches many
documents, too many to display all, we need to sort them to try to predict
which one the user most probably wanted to find.

To accomplish this we check-in a file in the content repo called `popularities.json`
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

## Where's the data from

Popularities are based on our CDN access logs. We use CloudFront for our CDN.
Access logs are post processed using an
[AWS Lambda function](https://github.com/aws-samples/amazon-cloudfront-access-logs-queries).

Every month these logs are aggregated by another Lambda called
`popularitiesCron` using AWS Athena:

```python
import time
import boto3

from datetime import datetime, timezone, timedelta

last_month = datetime.now(timezone.utc) - timedelta(weeks=1)

month = "{:0>2}".format(last_month.month)
year = "{}".format(last_month.year)

query = """
SELECT u AS Page,
         count(*) AS Pageviews
FROM
    (SELECT replace(uri,
         '/index.json', '') AS u
    FROM partitioned_parquet
    WHERE year = '{}'
            AND month = '{}'
            AND status = 200
            AND user_agent LIKE 'Mozilla%'
            AND uri NOT LIKE '%/_sample%'
            AND (uri LIKE '/%/docs/%'
            AND sc_content_type = 'text/html;%20charset=utf-8'
            OR uri LIKE '/%/docs/%/index.json'))
GROUP BY  u
ORDER BY  Pageviews DESC
""".format(year, month)

DATABASE = 'yariprod_cf_access_logs_db'
output='s3://mdn-popularities-prod/{}/{}/'.format(year, month)

def lambda_handler(event, context):
    client = boto3.client('athena')
    response = client.start_query_execution(
        QueryString=query,
        QueryExecutionContext={
            'Database': DATABASE
        },
        ResultConfiguration={
            'OutputLocation': output,
        }
    )
    s3 = boto3.resource('s3')
    uuid=response["QueryExecutionId"]
    if uuid:
        content = (
          "https://mdn-popularities-prod.s3.amazonaws.com/"
          "{year}/{month}/{uuid}.csv"
        ).format(year=year, month=month, uuid=uuid)
        s3.Object(
          'mdn-popularities-prod', 'current.txt'
        ).put(Body=content, ContentType="text/plain; charset=utf-8")
    return response
```

This is trigger at via a CloudWatch cron job (`popularities-cron-trigger`) every
1st of the month.

Output is stored in an S3 bucket named `mdn-popularities-prod`.
<'s3://mdn-popularities-prod/current.txt> points to the current file.

## Run the CLI tool

```bash
yarn tool popularities
```

This should now download the latest popularities csv and update the file
`files/popularities.json` in your `mdn/content` repo. It takes the value of the
`CONTENT_ROOT` constant.

Once you've done this, you need to make a pull request on the new `mdn/content`
repo.

## The future

One idea would be that we instead use Kuma to collect this. Then Yari could
download it from Kuma right before the build starts. If we do this we would
fully automate everything and the data would be more up-to-date.
