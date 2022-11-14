---
title: Unsafe HTML
slug: Web/Unsafe_HTML
---
This page contains various nasty snippets of HTML that are expected to be caught as "unsafe".

Much of the inspiration for this comes from:
[https://github.com/payloadbox/xss-payload-list](https://github.com/payloadbox/xss-payload-list/blob/master/README.md)

<br \x20onerror="javascript:alert(1)">

[test](<\x02javascript:javascript:alert(1)>)

<iframe src="https://www.peterbe.com/"></iframe>

<iframe src="//evil.com/"></iframe>

Here's a link that contains the string `:JavaScript` within the `href`
attribute:
[A beginner's guide to SpiderMonkey, Mozilla's JavaScript engine](https://wiki.mozilla.org/JavaScript:New_to_SpiderMonkey)

<ul onmouseover="alert(&#x27;xss&#x27;)"><li>I'm</li><li>sneaky</li></ul>

<script>alert(1)</script>

<style>* { background-image: url(/api/v1/settings/);}</style>
