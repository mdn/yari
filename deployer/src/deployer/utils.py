import os
from collections import namedtuple
from functools import partial
from pathlib import Path

import click


ClickLogger = namedtuple("ClickLogger", "info success warning error")


def info(*msg, **kwargs):
    msg = " ".join(str(x) for x in msg)
    click.secho(msg, **kwargs)


log = ClickLogger(
    info,
    partial(info, fg="green"),
    partial(info, fg="yellow"),
    partial(info, fg="red"),
)


def iterdir(directory, max_depth=None, current_depth=0):
    with os.scandir(directory) as it:
        for entry in it:
            if entry.is_dir():
                if (max_depth is None) or (current_depth < max_depth):
                    yield from iterdir(
                        entry, max_depth=max_depth, current_depth=current_depth + 1
                    )
            else:
                yield Path(entry)
