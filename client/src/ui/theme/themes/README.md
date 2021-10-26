# Themes

> NOTE: This is work in progress document so, should you have any questions, please reach out to me(@schalkneethling) on Slack.

The various themes that MDN supports are:

- Default mode aka light mode [light]
- Dark mode [dark]
- High contrast light mode [light-high-contrast]
- High contrast dark mode [dark-high-contrast]

Each theme has a different color palette and related variables. These are all defined in this folder.
The format of the variables follow the naming convention used in the design system on Figma. For example:

```sass
$mdn-[theme-name]-color-[variable-name]
/* for example for text-primary */
$mdn-light-color-text-primary
```

In order to make use of a theme inside a SASS file, you need to import the theme as follows:

```sass
@use "../themes/light-mode" as light-mode;
```
