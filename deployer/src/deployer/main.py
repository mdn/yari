from pathlib import Path

import click

from . import __version__
from .constants import (
    CONTENT_ROOT,
    CONTENT_TRANSLATED_ROOT,
    DEFAULT_BUCKET_NAME,
    DEFAULT_BUCKET_PREFIX,
    DEFAULT_NO_PROGRESSBAR,
)
from .update_lambda_functions import update_all
from .upload import upload_content
from .whatsdeployed import dump as dump_whatsdeployed
from .utils import log


def validate_directory(ctx, param, value):
    if not value:
        raise click.BadParameter(f"{value!r}")
    path = Path(value)
    if not path.exists():
        raise click.BadParameter(f"{value} does not exist")
    elif not path.is_dir():
        raise click.BadParameter(f"{value} is not a directory")
    return path


def validate_optional_directory(ctx, param, value):
    if value:
        return validate_directory(ctx, param, value)


@click.group()
@click.option(
    "--dry-run",
    default=False,
    help="Show what would be done, but don't actually do it.",
    show_default=True,
    is_flag=True,
)
@click.version_option(version=__version__)
@click.pass_context
def cli(ctx, **kwargs):
    ctx.ensure_object(dict)
    ctx.obj.update(kwargs)


@cli.command()
@click.argument(
    "directory", type=click.Path(), callback=validate_directory, default="aws-lambda",
)
@click.pass_context
def update_lambda_functions(ctx, directory):
    log.info(f"Deployer ({__version__})", bold=True)
    update_all(directory, dry_run=ctx.obj["dry_run"])


@cli.command(
    help="Create a whatsdeployed.json file "
    "by asking git for the date and commit hash of HEAD."
)
@click.option(
    "--output",
    type=click.Path(),
    help="Name of JSON file to create",
    default="whatsdeployed.json",
)
@click.argument(
    "directory", type=click.Path(), callback=validate_directory, default=".",
)
@click.pass_context
def whatsdeployed(ctx, directory: Path, output: str):
    dump_whatsdeployed(directory, Path(output), dry_run=ctx.obj["dry_run"])


@cli.command()
@click.option(
    "--bucket",
    help="Name of the S3 bucket",
    default=DEFAULT_BUCKET_NAME,
    show_default=True,
)
@click.option(
    "--prefix",
    help="Upload into this folder of the S3 bucket instead of its root",
    default=DEFAULT_BUCKET_PREFIX,
    show_default=True,
)
@click.option(
    "--force-refresh",
    is_flag=True,
    default=False,
    show_default=True,
    help="Forces all files to be uploaded even if they already match what is in S3",
)
@click.option(
    "--content-root",
    help="The path to the root folder of the main content (defaults to CONTENT_ROOT)",
    default=CONTENT_ROOT,
    show_default=True,
    callback=validate_directory,
)
@click.option(
    "--content-translated-root",
    help="The path to the root folder of the translated content (defaults to CONTENT_TRANSLATED_ROOT)",
    default=CONTENT_TRANSLATED_ROOT,
    show_default=True,
    callback=validate_optional_directory,
)
@click.option(
    "--no-progressbar",
    help="Don't show the progress bar",
    default=DEFAULT_NO_PROGRESSBAR,
    show_default=True,
    is_flag=True,
)
@click.argument("directory", type=click.Path(), callback=validate_directory)
@click.pass_context
def upload(ctx, directory: Path, **kwargs):
    log.info(f"Deployer ({__version__})", bold=True)
    content_roots = [kwargs["content_root"]]
    if kwargs["content_translated_root"]:
        content_roots.append(kwargs["content_translated_root"])
    ctx.obj.update(kwargs)
    upload_content(directory, content_roots, ctx.obj)
