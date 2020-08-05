import concurrent.futures
import datetime
import getpass
import hashlib
import mimetypes
import shutil
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path

import boto3

# import git
from boto3.s3.transfer import TransferConfig
from botocore.exceptions import ClientError

# from git.exc import InvalidGitRepositoryError

from .constants import (
    AWS_PROFILE,
    DEFAULT_CACHE_CONTROL,
    DEFAULT_NAME_PATTERN,
    HASHED_CACHE_CONTROL,
    MAX_WORKERS_PARALLEL_UPLOADS,
)

# from .exceptions import NoGitDirectory, CantDryRunError
from .exceptions import CantDryRunError
from .utils import fmt_seconds, fmt_size, info, is_junk_file, ppath, success, warning

hashed_filename_regex = re.compile(r"\.[a-f0-9]{8,32}\.")


# def _find_git_repo(start):
#     if str(start) == str(start.root):
#         raise NoGitDirectory
#     try:
#         return git.Repo(start)
#     except InvalidGitRepositoryError:
#         return _find_git_repo(Path(start).parent)


def _has_hashed_filename(fn):
    return hashed_filename_regex.findall(os.path.basename(fn))


@dataclass()
class UploadTask:
    """All the relevant information for doing an upload"""

    key: str
    file_path: Path
    size: int
    file_hash: str
    needs_hash_check: bool

    def __repr__(self):
        return repr(self.key)

    def set_file_hash(self):
        with open(self.file_path, "rb") as f:
            self.file_hash = hashlib.md5(f.read()).hexdigest()


def upload_site(directory, config):
    if isinstance(directory, str):
        directory = Path(directory)
    if not config.get("name"):
        raise NotImplementedError("You gotta pick a name yourself")
        # try:
        #     repo = _find_git_repo(directory)
        # except NoGitDirectory:
        #     raise NoGitDirectory(
        #         f"From {directory} can't find its git root directory "
        #         "which is needed to supply a default branchname."
        #     )
        # active_branch = repo.active_branch
        # if active_branch == "master" and config["lifecycle_days"]:
        #     warning(
        #         f"Warning! You're setting a lifecycle_days "
        #         f"({config['lifecycle_days']} days) on a build from a 'master' repo."
        #     )
        # config["name"] = DEFAULT_NAME_PATTERN.format(
        #     username=getpass.getuser(),
        #     branchname=active_branch.name,
        #     date=datetime.datetime.utcnow().strftime("%Y%m%d"),
        # )
        # if not config.replace("-", "").strip():
        #     raise ValueError("Empty prefix name")
    info(
        f"About to upload {ppath(directory)} to prefix {config['name']!r} "
        f"into bucket {config['bucket']!r}"
    )

    print("CONFIG", repr(config))
    return 0

    session = boto3.Session(profile_name=AWS_PROFILE)
    s3 = session.client("s3")

    # First make sure the bucket exists
    try:
        s3.head_bucket(Bucket=config["bucket"])
        info(f"Bucket {config['bucket']!r} exists")
    except ClientError as error:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        if error.response["Error"]["Code"] != "404":
            print(error.response)
            raise

        # Needs to be created.
        bucket_config = {}
        if config["bucket_location"]:
            bucket_config["LocationConstraint"] = config["bucket_location"]
        if config["dry_run"]:
            raise CantDryRunError(
                f"The bucket ({config['bucket']} doesn't exist and won't be created "
                "in dry-run mode. But it needs to exist to be able to find out "
                "what files already exist."
            )
        s3.create_bucket(
            Bucket=config["bucket"],
            ACL="public-read",
            CreateBucketConfiguration=bucket_config,
        )
        info(f"Bucket {config['bucket']!r} created")

        if config["bucket_lifecycle_days"]:
            # https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Client.put_bucket_lifecycle_configuration
            # https://docs.aws.amazon.com/code-samples/latest/catalog/python-s3-put_bucket_lifecyle_configuration.py.html
            s3.put_bucket_lifecycle_configuration(
                Bucket=config["bucket"],
                LifecycleConfiguration={
                    "Rules": [
                        {
                            "Expiration": {"Days": config["bucket_lifecycle_days"]},
                            "Filter": {"Prefix": ""},
                            "Status": "Enabled",
                        }
                    ]
                },
            )
            info(
                f"Bucket lifecycle expiration of "
                f"{config['bucket_lifecycle_days']!r} days configured."
            )

    try:
        website_bucket = s3.get_bucket_website(Bucket=config["bucket"])
    except ClientError as error:
        if error.response["Error"]["Code"] != "NoSuchWebsiteConfiguration":
            raise
        # Define the website configuration
        website_configuration = {
            "ErrorDocument": {"Key": "404.html"},
            "IndexDocument": {"Suffix": "index.html"},
            "RoutingRules": [
                {
                    "Condition": {"KeyPrefixEquals": "/"},
                    "Redirect": {"ReplaceKeyWith": "index.html"},
                }
            ],
        }
        website_bucket = s3.put_bucket_website(
            Bucket=config["bucket"], WebsiteConfiguration=website_configuration
        )
        info(f"Created bucket website configuration for {config['bucket']!r}")

    if config["debug"]:
        info(f"Website bucket: {website_bucket!r}")

    uploaded_already = {}

    if config["refresh"]:
        info("Refresh, so ignoring what was previously uploaded.")
    else:
        info(
            f"Gather complete list of existing uploads under prefix "
            f"{config['name']!r}..."
        )
        t0 = time.time()
        continuation_token = None
        while True:
            # Have to do this so that 'ContinuationToken' can be omitted if falsy
            list_kwargs = dict(Bucket=config["bucket"], Prefix=config["name"])
            if continuation_token:
                list_kwargs["ContinuationToken"] = continuation_token
            response = s3.list_objects_v2(**list_kwargs)
            for obj in response.get("Contents", []):
                uploaded_already[obj["Key"]] = obj
            if response["IsTruncated"]:
                continuation_token = response["NextContinuationToken"]
            else:
                break
        t1 = time.time()

        warning(
            f"{len(uploaded_already):,} files already uploaded "
            f"(took {fmt_seconds(t1 - t0)})."
        )

    total_todo = 0
    t0 = time.time()
    for fp in pwalk(directory):
        if is_junk_file(fp):
            continue
        if fp.name.startswith("_"):
            continue
        total_todo += 1
    t1 = time.time()
    warning(
        f"{total_todo:,} files to be (maybe) upload " f"(took {fmt_seconds(t1 - t0)})."
    )

    transfer_config = TransferConfig()

    # Number of files that don't need to be uploaded because they are already uploaded
    # with a difference.
    skipped = 0

    # Number of files we deliberate chose to NOT upload. Or even attempt to.
    ignored = 0

    # Use this pattern in case there's a file without extension.
    # for fp in directory.glob("**/*"):
    # if fp.is_dir():
    #     # E.g. /pl/Web/API/docs/WindowBase64.atob/ which is
    #     continue
    counts = {"uploaded": 0, "not_uploaded": 0}

    total_size = []
    total_time = []

    def update_uploaded_stats(stats):
        counts["uploaded"] += stats["counts"].get("uploaded")
        counts["not_uploaded"] += stats["counts"].get("not_uploaded")
        total_size.append(stats["total_size_uploaded"])
        total_time.append(stats["total_time"])
        if not config["no_progressbar"]:
            done = skipped + counts["uploaded"] + counts["not_uploaded"]
            percentage = 100 * done / total_todo
            max_bar_width = shutil.get_terminal_size((80, 20)).columns - 30
            bar_width = int(max_bar_width * done / total_todo)
            print(
                f"{done:,} of {total_todo:,}".ljust(20)
                + f"[{'▋' * bar_width:<{max_bar_width}}] "
                f"{percentage:.1f}%\r",
                end="",
            )

    total_count = 0
    batch = []

    if config["no_progressbar"]:
        log = info
    else:
        current_log_file_name = Path("upload.log")
        if current_log_file_name.exists():
            warning(
                f"Logging file {current_log_file_name} already exists. "
                "Will append to it."
            )
        info(f"Logging progress into {current_log_file_name}")

        def log(line):
            with open(current_log_file_name, "a") as f:
                f.write(f"{line}\n")

    T0 = time.time()
    for fp in pwalk(directory):
        if is_junk_file(fp):
            ignored += 1
            continue
        if fp.name.startswith("_"):
            ignored += 1
            continue
        # This assumes  that it can saved in S3 as a key that is the filename.
        key_path = fp.relative_to(directory)
        # if key_path.name == "index.redirect":
        #     # Call these index.html when they go into S3
        #     key_path = key_path.parent / "index.html"
        key = f"{config['name']}/{key_path}"

        size = fp.stat().st_size
        # with open(fp, "rb") as f:
        #     file_hash = hashlib.md5(f.read()).hexdigest()
        task = UploadTask(key, fp, size, None, False)
        if key not in uploaded_already or uploaded_already[key]["Size"] != size:
            # No doubt! We definitely didn't have this before or it's definitely
            # different.
            batch.append(task)

        else:
            # At this point, the key exists and the size hasn't changed.
            # However, for some files, that's not conclusive.
            # Image, a 'index.html' file might have this as its diff:
            #
            #    - <script src=/foo.a9bef19a0.js></script>
            #    + <script src=/foo.3e98ca01d.js></script>
            #
            # ...which means it definitely has changed but the file size is
            # exactly the same as before.
            # If this is the case, we're going to *maybe* upload it.
            # However, for files that are already digest hashed, we don't need
            # to bother checking.
            if _has_hashed_filename(key):
                skipped += 1
                continue
            else:
                task.needs_hash_check = True
                batch.append(task)

        if len(batch) >= 1000:
            # Fire off these
            update_uploaded_stats(
                _start_uploads(
                    s3,
                    config,
                    batch,
                    transfer_config,
                    log=log,
                    dry_run=config["dry_run"],
                )
            )
            total_count += len(batch)
            batch = []

    if batch:
        update_uploaded_stats(
            _start_uploads(
                s3, config, batch, transfer_config, log=log, dry_run=config["dry_run"]
            )
        )
        if not config["no_progressbar"]:
            # If we don't do this, the progress bar won't have a last final
            # newline that terminates it.
            print("\n")
        total_count += len(batch)

    T1 = time.time()
    success(
        f"{counts['uploaded']:,} files uploaded, "
        f"{counts['not_uploaded']:,} files didn't need to be uploaded."
    )
    if ignored:
        info(f"{ignored:,} files ignored.")
    if skipped:
        info(f"{skipped:,} files skipped.")
    info(f"Total thread-pool time: {fmt_seconds(sum(total_time))}")
    success(f"Uploaded {fmt_size(sum(total_size))}.")
    if config["dry_run"]:
        warning("Remember! In dry-run mode")
    success(f"Done in {fmt_seconds(T1 - T0)}.")


def _start_uploads(s3, config, batch, transfer_config, log=info, dry_run=False):
    T0 = time.time()
    futures = {}
    total_threadpool_time = []
    counts = {"uploaded": 0, "not_uploaded": 0}
    total_size_uploaded = 0
    with concurrent.futures.ThreadPoolExecutor(
        max_workers=MAX_WORKERS_PARALLEL_UPLOADS
    ) as executor:
        bucket_name = config["bucket"]
        for task in batch:
            futures[
                executor.submit(
                    _upload_file_maybe,
                    s3,
                    task,
                    bucket_name,
                    transfer_config,
                    log=log,
                    dry_run=dry_run,
                )
            ] = task

        for future in concurrent.futures.as_completed(futures):
            was_uploaded, took = future.result()
            task = futures[future]
            total_threadpool_time.append(took)
            if was_uploaded:
                counts["uploaded"] += 1
                # print(f"Adding {task.size} to total_size_uploaded")
                total_size_uploaded += task.size
            else:
                counts["not_uploaded"] += 1

    T1 = time.time()

    return {
        "counts": counts,
        "took": T1 - T0,
        "total_time": sum(total_threadpool_time),
        "total_size_uploaded": total_size_uploaded,
    }


def pwalk(start):
    for entry in os.scandir(start):
        if entry.is_dir():
            for p in pwalk(entry):
                yield p
        else:
            yield Path(entry)


def _upload_file_maybe(s3, task, bucket_name, transfer_config, log=info, dry_run=False):
    t0 = time.time()
    if not task.file_hash:
        task.set_file_hash()
    if task.needs_hash_check:
        try:
            object_data = s3.head_object(Bucket=bucket_name, Key=task.key)
            if object_data["Metadata"].get("filehash") == task.file_hash:
                # We can bail early!
                t1 = time.time()
                start = f"{fmt_size(task.size):} in {fmt_seconds(t1 - t0)}"
                log(f"Skipped  {start:>19}  {task.key}")
                return False, t1 - t0
        except ClientError as error:
            # If a client error is thrown, then check that it was a 404 error.
            # If it was a 404 error, then the key does not exist.
            if error.response["Error"]["Code"] != "404":
                raise

            # If it really was a 404, it means that the method that gathered
            # the existing list is out of sync.

    mime_type = mimetypes.guess_type(str(task.file_path))[0] or "binary/octet-stream"

    if os.path.basename(task.file_path) == "service-worker.js":
        cache_control = "no-cache"
    else:
        cache_control_seconds = DEFAULT_CACHE_CONTROL
        if _has_hashed_filename(task.file_path):
            cache_control_seconds = HASHED_CACHE_CONTROL
        cache_control = f"max-age={cache_control_seconds}, public"

    ExtraArgs = {
        "ACL": "public-read",
        "ContentType": mime_type,
        "CacheControl": cache_control,
        "Metadata": {"filehash": task.file_hash},
    }
    # if task.file_path.name == "index.redirect":
    #     with open(task.file_path) as f:
    #         redirect_url = f.read().strip()
    #         ExtraArgs["WebsiteRedirectLocation"] = redirect_url
    if not dry_run:
        s3.upload_file(
            str(task.file_path),
            bucket_name,
            task.key,
            ExtraArgs=ExtraArgs,
            Config=transfer_config,
        )
    t1 = time.time()

    start = f"{fmt_size(task.size)} in {fmt_seconds(t1 - t0)}"
    log(f"{'Updated' if task.needs_hash_check else 'Uploaded'} {start:>20}  {task.key}")
    return True, t1 - t0
