# CLI Tool

The CLI tool is a command line interface to a number of commands. Below is a list of commands and their usage.

## frontmatter-inventory

The `frontmatter-inventory` command generates a JSON output file names `frontmatter-inventory.json` in the root directory of the project. The JSON file contains a list of all front matter and file paths for the [content repo](https://github.com/mdn/content).

```json
{
  "/files/en-us/games/anatomy/index.md": {
    "frontmatter": {
      "title": "Anatomy of a video game",
      "slug": "Games/Anatomy",
      "tags": ["Games", "JavaScript", "Main Loop", "requestAnimationFrame"]
    }
  }
}
```

In order to run the command, ensure that you have `CONTENT_ROOT` set in your `.env` file. For example:

```text
CONTENT_ROOT=/Users/steve/mozilla/mdn-content/files
```

You can then run the tool with the following command:

```bash
yarn tool frontmatter-inventory
```

If you want to see the output of the command as it builds, you can use the `--verbose` flag:

```bash
yarn tool frontmatter-inventory --verbose
```
