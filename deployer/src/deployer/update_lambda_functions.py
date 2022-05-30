import base64
import hashlib
import json
import os
import subprocess
import time
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

    # Reset timestamp of files for reproducible zips.
    times = (0, 0)
    for file in lambda_function_dir.glob("**/*"):
        os.utime(file, times)

    # Create a new zip package.
    subprocess_result = subprocess.run(
        "npm run make-package",
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


def update(lambda_function_dir, dry_run=False, force=False):
    zip_filename = make_package(lambda_function_dir)
    function_name, region_name = get_aws_info(lambda_function_dir)
    client = boto3.client("lambda", region_name=region_name)
    # Get the function info for the latest version.
    function_info = client.get_function(FunctionName=function_name)
    function_hash = function_info["Configuration"]["CodeSha256"]
    zip_file_bytes = zip_filename.read_bytes()
    # If nothing has changed, don't do anything.
    if force or get_sha256_hash(zip_file_bytes) != function_hash:
        if dry_run:
            # If this is a dry run, just return the existing function info.
            return function_info["Configuration"]

        # Return the function info of the freshly-published version.
        function_config = client.update_function_code(
            FunctionName=function_name, ZipFile=zip_file_bytes, Publish=True
        )

        function_arn = function_config["FunctionArn"]

        for tries in range(10):
            if function_config["State"] != "Pending":
                break

            time.sleep(1 + tries)

            function_config = client.get_function_configuration(
                FunctionName=function_arn
            )

        return function_config

    return None


def update_all(directory: Path, dry_run=False, force=False):
    log.info(f"Updating all lambda functions within: {directory}")

    updated_functions = []

    for lambda_function_dir in get_lambda_function_dirs(directory):
        log.info(f"Found {lambda_function_dir.stem}: ", nl=False)

        info = update(lambda_function_dir, dry_run=dry_run, force=force)
        if info:
            updated_functions.append(info)
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

    return updated_functions


def deploy(updated_functions: list, distribution_id, dry_run=False):
    if len(updated_functions) == 0:
        log.success(
            "Skipping Lambda deployment to CloudFront, because no Lambdas were updated."
        )
        return

    if not distribution_id:
        log.warning(
            "Skipping Lambda deployment to CloudFront, because no --distribution was specified."
        )
        return

    # Pre-process updated functions.
    function_arn_by_prefix = {}

    for function_config in updated_functions:
        arn = function_config["FunctionArn"]
        version = function_config["Version"]
        state = function_config["State"]

        if state != "Active":
            log.warning(
                f"Skipping Lambda deployment of {arn}, because it has state {state}."
            )
            continue

        if arn.endswith(version):
            # update_function_code() returns FunctionArn with version.
            prefix = arn.replace(version, "")
        else:
            # get_function() returns FunctionArn without version.
            prefix = arn + ":"
            arn = prefix + version

        function_arn_by_prefix[prefix] = arn

    client = boto3.client("cloudfront")

    # Get config.
    response = client.get_distribution_config(Id=distribution_id)
    etag = response["ETag"]
    distribution_config = response["DistributionConfig"]
    distribution_description = distribution_config["Comment"]

    log.success(
        f"Deploying lambda updates to CloudFront distribution {distribution_id} ({distribution_description})..."
    )

    behavior_items = [
        distribution_config["DefaultCacheBehavior"]
    ] + distribution_config["CacheBehaviors"]["Items"]

    # Modify config.
    changes = False
    for behavior_item in behavior_items:
        if "PathPattern" in behavior_item:
            path_pattern = behavior_item["PathPattern"]
        else:
            path_pattern = "Default (*)"

        if (
            "LambdaFunctionAssociations" not in behavior_item
            or "Items" not in behavior_item["LambdaFunctionAssociations"]
        ):
            continue

        lambda_items = behavior_item["LambdaFunctionAssociations"]["Items"]

        for lambda_item in lambda_items:
            current_arn = lambda_item["LambdaFunctionARN"]

            for prefix, arn in function_arn_by_prefix.items():
                if not current_arn.startswith(prefix) or arn == current_arn:
                    continue

                if dry_run:
                    log.info(
                        f"Would update '{path_pattern}' ({lambda_item['EventType']}) from {current_arn} to {arn}"
                    )
                else:
                    log.info(
                        f"Updating '{path_pattern}' ({lambda_item['EventType']}) from {current_arn} to {arn}"
                    )
                    lambda_item["LambdaFunctionARN"] = arn

                changes = True
                break

    if not changes:
        log.info(
            "CloudFront distribution was not changed, because it does not use any of the updated lambdas."
        )
        return

    if dry_run:
        # If this is a dry run, just return the config.
        log.success(
            f"Would have deployed lambda updates to CloudFront distribution {distribution_id} ({distribution_description})!"
        )
        return distribution_config

    # Update config.
    response = client.update_distribution(
        Id=distribution_id, IfMatch=etag, DistributionConfig=distribution_config
    )
    log.success(
        f"Deployed lambda updates to CloudFront distribution {distribution_id} ({distribution_description})!"
    )

    return response["Distribution"]["DistributionConfig"]
