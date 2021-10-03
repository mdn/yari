# Debugging site-search

## How it works

Site-search is done via Kuma and Elasticsearch. The default way, when you sort
by "Best" is that it combines the match with each documents' popularity number.
This hopefully gives the best possible results as it elevates popular documents,
on the assumption that it's more likely to be what you're looking for, with how
much the title and body matches the search string.

This metadata is always included in the search results JSON from Kuma. But
displaying it in Yari is optional.

## How to enable it

To display each search results `score` and `popularity`, simply add `&debug`
to the current URL. E.g. `?q=foreach&debug` or `?debug=1&q=foreach`.

Now, when you open <http://localhost:3000/en-US/search?q=test&debug> the `score`
and `popularity` is shown.

## How to use it

You can't affect the sorting algorithm in Yari. To try out different techniques
for the `function_score` in the Python Elasticsearch code, you have to
make changes within Kuma to try different combinations such as `popularity_factor`
and `boost_mode` and `score_mode`. Most of these values are currently hardcoded in
the Kuma Python code.

It's hard to predict exactly what users really prefer and a lot of it depends
on learning from how people react to the sorting.
