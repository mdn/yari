# CLI Tool

The CLI tool is a command line interface to a number of commands. Below is a
list of commands and their usage.

## inventory

The `inventory` command generates a JSON representation of the content repo’s
markdown files. The JSON contains an Array of all front matter and file paths
for the [content repo](https://github.com/mdn/content/files).

```json
[
  {
    "path": "/files/en-us/games/anatomy/index.md",
    "frontmatter": {
      "title": "Anatomy of a video game",
      "slug": "Games/Anatomy",
      "tags": ["Games", "JavaScript", "Main Loop", "requestAnimationFrame"]
    }
  }
]
```

In order to run the command, ensure that you have `CONTENT_ROOT` set in your
`.env` file. For example:

```text
CONTENT_ROOT=/Users/steve/mozilla/mdn-content/files
```

You can then run the tool with the following command:

```bash
npm run tool inventory
```

This will output the JSON to the stdout which can then be piped into another
utility. If you want to write the JSON to a file, you can use the following
command:

```bash
npm run run --silent tool inventory > inventory.json
```

This will write a file called `inventory.json` to the root directory of the
project.
