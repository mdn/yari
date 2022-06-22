# The UI Folder

> NOTE: This document is a work in progress. If you have any questions please
> contact me(@schalkneethling) on Slack

The UI folder contains all the UI components of the application.

> NOTE: Some of this is still a work in progress

The most important pieces to understand here is that:

- Small concrete components like a button, goes into the `atoms` folder
- As soon as you combine more that one `atom`, it goes into the `molecules`
  folder
- As soon as you start combining `molecules`, it goes into the `organisms`
  folder

Larger pieces like full pages, will go into the relevant top level folders such
as the `client/src/plus/` folder.

## The `minimalist` folder

This is a not in sync copy of
[mdn-minimalist](https://github.com/mdn/mdn-minimalist). See the note on the
status of this under the `theme` folder docs below.

## Style Dictionary

We use [Style Dictionary](https://amzn.github.io/style-dictionary/#/) to build
out our first level variables into SASS. Down the road we may want to also
generate these same into variables in JS, or for specific mobile platforms. We
therefore started down this road now, so that we have the infrastructure in
place.

The variables defined here are hardly ever directly used but, are instead mapped
to more second level semantic named that are then used to in components. The
source from which Style Dictionary builds are located in
`client/src/ui/style-dictionary/`. The config for Style Dictionary is in
`sd-config.json` at the root of the project.

Tokens directly exported from Figma are located in
`client/src/ui/style-dictionary/tokens.json`. This was an initial export which
is now manually kept in sync. In future we hope to automate this process.

## The `theme` folder

When we embarked on the redesign, the idea was to use
[mdn-minimalist](https://github.com/mdn/mdn-minimalist) as the base and override
what is different. In the end this prooved more cumbersome than we had hoped.
This means that either the `theme` folder will be removed in future or, the
`client/src/ui/minimalist` folder.

For the moment it is a little confusing 🙃 - If anything is unclear, please
reach out.

## The `vars` folder

This is the folder into which we will generate the Style Dictionary variables.
You should never need to touch these.
