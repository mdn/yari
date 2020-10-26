import json
import subprocess
from pathlib import Path

import click

from .utils import log


def dump(directory: Path, output: Path, dry_run=False):
    command = "git log -n 1 --pretty=medium"
    log.info(f"Executing {command!r} in {directory}")
    subprocess_result = subprocess.run(
        command,
        cwd=directory,
        shell=True,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    )
    commit: str = None
    date: str = None

    for line in subprocess_result.stdout.splitlines():
        if line.startswith("commit "):
            commit = line.split()[1]
        elif line.startswith("Date:"):
            date = line.split("Date:")[1].strip()

    if date and commit:
        data = {"commit": commit, "date": date}
        if dry_run:
            log.info(f"Write {json.dumps(data)!r} to {output}")
        else:
            output.parent.mkdir(parents=True, exist_ok=True)
            with open(output, "w") as f:
                json.dump(data, f, indent=2)
            log.info(f"Wrote {json.dumps(data)!r} to {output}")
    else:
        raise click.ClickException("'commit' and 'date' not found in git log output")
