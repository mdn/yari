from pathlib import Path

import click

from . import __version__
from .constants import (
    CI,
    ELASTICSEARCH_URL,
)
from .utils import log
from . import search


def validate_directory(ctx, param, value):
    if not value:
        raise click.BadParameter(f"{value!r}")
    path = Path(value)
    if not path.exists():
        raise click.BadParameter(f"{value} does not exist")
    elif not path.is_dir():
        raise click.BadParameter(f"{value} is not a directory")
    return path


def validate_file(ctz, param, value):
    if not value:
        raise click.BadParameter(f"{value!r}")
    path = Path(value)
    if not path.exists():
        raise click.BadParameter(f"{value} does not exist")
    elif not path.is_file():
        raise click.BadParameter(f"{value} is not a file")
    return path


@click.group()
@click.option(
    "--dry-run",
    default=False,
    help="Show what would be done, but don't actually do it.",
    show_default=True,
    is_flag=True,
)
@click.option(
    "--verbose",
    default=False,
    help="Be louder with stdout logging",
    show_default=True,
    is_flag=True,
)
@click.version_option(version=__version__)
@click.pass_context
def cli(ctx, **kwargs):
    ctx.ensure_object(dict)
    ctx.obj.update(kwargs)


@cli.command()
@click.option(
    "--url",
    help="Elasticsearch URL (if not env var ELASTICSEARCH_URL)",
    default=ELASTICSEARCH_URL,
    show_default=False,
)
@click.option(
    "--update",
    is_flag=True,
    help="Don't first delete the index",
    default=False,
    show_default=True,
)
@click.option(
    "--no-progressbar",
    is_flag=True,
    help="Disables the progressbar (this is true by default it env var CI==true)",
    default=CI,
    show_default=True,
)
@click.argument("buildroot", type=click.Path(), callback=validate_directory)
@click.pass_context
def search_index(ctx, buildroot: Path, **kwargs):
    url = kwargs["url"]
    if not url:
        if not ELASTICSEARCH_URL:
            # The reason we're not throwing an error is to make it super convenient
            # to call this command, from bash, without first having to check and figure
            # out if the relevant environment variables are available.
            log.warning("DEPLOYER_ELASTICSEARCH_URL or --url not set or empty")
            return
        raise Exception("url not set")
    search.index(
        buildroot,
        url,
        update=kwargs["update"],
        no_progressbar=kwargs["no_progressbar"],
    )


@cli.command()
@click.option(
    "--url",
    help="Elasticsearch URL (if not env var ELASTICSEARCH_URL)",
    default=ELASTICSEARCH_URL,
    show_default=False,
)
@click.option("--analyzer", "-a", default="text_analyzer", show_default=True)
@click.argument("text")
@click.pass_context
def search_analyze(ctx, text, analyzer, url):
    if not url:
        raise Exception("url not set")
    search.analyze(
        url,
        text,
        analyzer,
    )
