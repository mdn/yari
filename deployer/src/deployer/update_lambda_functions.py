import base64
import hashlib
import json
import subprocess
from pathlib import Path

import boto3

from .utils import log


class PackageError(Exception):
    """Errors related to creating a AWS Lambda Zip package."""


def get_sha256_hash(zip_file_bytes):
    hasher = hashlib.sha256()
    hasher.update(zip_file_bytes)
    return base64.b64encode(hasher.digest()).decode()


def get_lambda_function_dirs(directory):
    for lambda_function_dir in directory.iterdir():
        if (
            lambda_function_dir.is_dir()
            and lambda_function_dir.joinpath("package.json").is_file()
            and lambda_function_dir.joinpath("index.js").is_file()
        ):
            yield lambda_function_dir


def get_aws_info(lambda_function_dir):
    with open(lambda_function_dir.joinpath("package.json")) as f:
        aws_config = json.load(f)["aws"]
    return (
        aws_config.get("name", lambda_function_dir.name),
        aws_config.get("region", "us-east-1"),
    )


def make_package(lambda_function_dir):
    # Remove any existing zip package(s).
    for zip_filename in lambda_function_dir.glob("*.zip"):
        zip_filename.unlink()
    # Create a new zip package.
    subprocess_result = subprocess.run(
        "yarn run make-package",
        cwd=lambda_function_dir,
        shell=True,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
    )
    # If we created a zip package, return the filename.
    for zip_filename in lambda_function_dir.glob("*.zip"):
        return zip_filename
    else:
        # Otherwise, something went wrong.
        raise PackageError(
            "failed to create an AWS Lambda deployment package (Zip file)\n\n"
            f"{subprocess_result.stdout}"
        )


def update(lambda_function_dir, dry_run=False):
    zip_filename = make_package(lambda_function_dir)
    function_name, region_name = get_aws_info(lambda_function_dir)
    client = boto3.client("lambda", region_name=region_name)
    # Get the function info for the latest version.
    function_info = client.get_function(FunctionName=function_name)
    function_hash = function_info["Configuration"]["CodeSha256"]
    zip_file_bytes = zip_filename.read_bytes()
    # If nothing has changed, don't do anything.
    if get_sha256_hash(zip_file_bytes) != function_hash:
        if dry_run:
            # If this is a dry run, just return the existing function info.
            return function_info["Configuration"]
        # Return the function info of the freshly-published version.
        return client.update_function_code(
            FunctionName=function_name, ZipFile=zip_file_bytes, Publish=True
        )
    return None


def update_all(directory: Path, dry_run=False):
    log.info(f"Updating all lambda functions within: {directory}")

    for lambda_function_dir in get_lambda_function_dirs(directory):
        log.info(f"Found {lambda_function_dir.stem}: ", nl=False)

        info = update(lambda_function_dir, dry_run=dry_run)
        if info:
            if dry_run:
                log.info(
                    f"would have published a new version of {info['FunctionName']}"
                )
            else:
                log.success(
                    f"published version {info['Version']} of {info['FunctionName']} "
                    f"as {info['FunctionArn']}",
                )
        else:
            log.info(" no change (matches the latest version in AWS)")
