# Experiment: X-Cache response headers in site-search XHRs

## Issue

<https://github.com/mdn/yari/issues/3420>

## Overview

Find out how the CDN cache is working out for people doing site-search queries.
The objective is to record what value people get for `X-Cache` from the CDN.

## Start date

Early April 2021.

## End date

May 1 2021.

## Details

As described in the issue, the current `Cache-Control` set by Kuma is 12h
(`12 * 60 * 60 = 43200`).
Perhaps we should increase it if too few people are getting cold caches from
the CDN.

## Analysis

Look at Google Analytics Events under `Site-search X-Cache`.
