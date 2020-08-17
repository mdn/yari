import os
from pathlib import Path

import click


def error(*msg):
    msg = " ".join([str(x) for x in msg])
    click.echo(click.style(msg, fg="red"))


def warning(*msg):
    msg = " ".join([str(x) for x in msg])
    click.echo(click.style(msg, fg="yellow"))


def info(*msg):
    msg = " ".join([str(x) for x in msg])
    click.echo(click.style(msg))


def success(*msg):
    msg = " ".join([str(x) for x in msg])
    click.echo(click.style(msg, fg="green"))


def ppath(path: Path, current_dir=None):
    current_dir = current_dir or Path(os.curdir)
    p = Path(path)
    try:
        return p.relative_to(current_dir)
    except ValueError:
        # FIXME: Would be nice if it could produce something like ../../other/dir
        return path


def is_junk_file(file_path: Path):
    if file_path.name == ".DS_Store":
        return True
    if file_path.name.endswith("~"):
        return True
    return False


def fmt_size(bytes_):
    if bytes_ > 1024 * 1024:
        return f"{bytes_ / 1024 / 1024:.1f}MB"
    if bytes_ > 1024:
        return f"{bytes_ / 1024:.1f}KB"
    return f"{int(bytes_)}B"


def fmt_seconds(seconds):
    if seconds < 1:
        return f"{seconds * 1000:.1f}ms"
    if seconds >= 60 * 60:
        minutes = seconds / 60
        return f"{int(minutes) // 60}h{int(minutes) % 60}m"
    if seconds >= 60:
        return f"{int(seconds) // 60}m{int(seconds) % 60}s"
    return f"{seconds:.1f}s"
