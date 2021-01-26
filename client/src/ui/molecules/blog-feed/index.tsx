import * as React from "react";

import "./index.scss";

export function BlogFeed() {
  return (
    <div className="blog-feed">
      <h2>Hacks Blog</h2>
      <p>
        <a href="http://hacks.mozilla.org/" className="blog-link">
          Read more at hacks.mozilla.org
        </a>
      </p>

      <ul>
        <li className="readable-line-length">
          <h3>
            <a href="https://hacks.mozilla.org/2021/01/porting-firefox-to-apple-silicon/">
              Porting Firefox to Apple Silicon
            </a>
          </h3>
          <p>
            The release of Apple Silicon-based Macs at the end of last year
            generated a flurry of news coverage and some surprises at the
            machine’s performance. This post details some background information
            on the experience of porting Firefox to run natively on these CPUs.
            The post Porting Firefox to Apple Silicon
          </p>
          <p className="post-meta">
            Posted January 20, 2021 by Gian-Carlo Pascutto
          </p>
        </li>
        <li className="readable-line-length">
          <h3>
            <a href="https://hacks.mozilla.org/2021/01/analyzing-bugzilla-testcases-with-bugmon/">
              Analyzing Bugzilla Testcases with Bugmon
            </a>
          </h3>
          <p>
            As a member of Mozilla’s fuzzing team, our job is not only to find
            bugs, but to do what we can to help get those bugs fixed as quickly
            as possible. To further reduce the delay in getting these bugs
            fixed, we wanted to automate as much of this process
          </p>
          <p className="post-meta">Posted January 21, 2021 by Jason Kratzer</p>
        </li>
      </ul>
    </div>
  );
}
