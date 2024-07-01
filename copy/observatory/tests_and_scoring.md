---
title: Tests & Scoring
---

# HTTP Observatory Scoring Methodology

It is difficult to assign an objective value to a subjective question such as
"How bad is not implementing HTTP Strict Transport Security?" In addition, what
may be unnecessary for one site — such as implementing Content Security Policy —
might mitigate important risks for another. The scores and grades offered by the
Mozilla Observatory are designed to alert developers when they're not taking
advantage of the latest web security features. Individual developers will need
to determine which ones are appropriate for their sites.

This page outlines the scoring methodology and grading system Observatory uses,
before listing all of the specific tests along with their score modifiers.

## Scoring Methodology

All websites start with a baseline score of 100, which is then modified with
penalties and/or bonuses resulting from the tests. The scoring is done across
two rounds:

1. The baseline score has the penalty points deducted from it.
2. If the resulting score is 90 (A) or greater, the bonuses are then added to
   it. You can think of the bonuses as extra credit for going above and beyond
   the call of duty in defending your website.

Each site tested by Observatory is awarded a grade based on its final score
after the two rounds. The minimum score is 0, and the highest possible score in
the HTTP Observatory is currently 135.

## Grading Chart

| Scoring Range |     Grade     |
| :-----------: | :-----------: |
|     100+      |   &nbsp;A+    |
|     90-99     | &nbsp;A&nbsp; |
|     85-89     |   &nbsp;A-    |
|     80-84     |   &nbsp;B+    |
|     70-79     | &nbsp;B&nbsp; |
|     65-69     |   &nbsp;B-    |
|     60-64     |   &nbsp;C+    |
|     50-59     | &nbsp;C&nbsp; |
|     45-49     |   &nbsp;C-    |
|     40-44     |   &nbsp;D+    |
|     30-39     | &nbsp;D&nbsp; |
|     25-29     |   &nbsp;D-    |
|     0-24      | &nbsp;F&nbsp; |

The letter grade ranges and modifiers are essentially arbitrary, however, they
are based on feedback from industry professionals on how important passing or
failing a given test is likely to be.

## Tests and Score Modifiers

> **Note:** Over time, the modifiers may change as baselines shift or new
> cutting-edge defensive security technologies are created. The bonuses
> (positive modifiers) are specifically designed to encourage people to adopt
> new security technologies or tackle difficult implementation challenges.
