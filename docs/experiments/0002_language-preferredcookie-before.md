# Experiment: Change language with or without a `preferredlocale` cookie before

## Issue

<https://github.com/mdn/yari/issues/3519>

## Overview

When someone changes the document language on the document-footer, we record
a GA event. But unfortunately we don't know, at that event, if they already
had a cookie before.

## Start date

April 15 2021.

## End date

June 1 2021.

## Details

We just need to change the existing event action `Change preferred language`
to mention what value for the cookie they _had_.

## Analysis

Look at Google Analytics Events under `Language`.
