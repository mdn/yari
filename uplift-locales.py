from pathlib import Path


def run(*args):
    destination = Path("../content/files")
    assert destination.is_dir()
    source = Path("../translated-content/files")
    assert source.is_dir()
    possible_locales = [x.name for x in source.iterdir()]

    outspill = set(args) - set(possible_locales)
    if outspill:
        raise Exception(f"{outspill} not recognized")

    for locale in args:
        locale_source = source / locale
        assert locale_source.is_dir()
        locale_destination = destination / locale
        locale_destination.mkdir(exist_ok=True)

        recursive_copy(locale_source, locale_destination)


def recursive_copy(root, destination, original_root=None):

    original_root = original_root or root

    index_html = None
    raw_html = None
    for thing in root.iterdir():
        if thing.is_dir():
            recursive_copy(thing, destination, original_root=original_root)
        elif thing.name == "index.html":
            with open(thing) as f:
                index_html = f.read()
        elif thing.name == "raw.html":
            with open(thing) as f:
                raw_html = f.read()

    if index_html and raw_html:
        front_matter = get_frontmatter(index_html)
        combined_html = f"{front_matter}\n{raw_html}"
        # print(combined_html)
        # print("\n")
        pathname = root.relative_to(original_root)
        file_destination = destination / pathname / "index.html"
        file_destination.parent.mkdir(parents=True, exist_ok=True)
        with open(file_destination, "w") as f:
            f.write(combined_html)
        print(file_destination)
    elif index_html or raw_html:
        raise Exception(f"Corrupt folder in {root}")


def get_frontmatter(text):
    markers = 0
    lines = []
    for line in text.splitlines():
        lines.append(line)
        if line == "---":
            markers += 1
            if markers >= 2:
                break

    return "\n".join(lines)


if __name__ == "__main__":
    import sys

    run(*sys.argv[1:])
