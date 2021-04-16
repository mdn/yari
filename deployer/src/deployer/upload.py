import concurrent.futures
import datetime
import hashlib
import mimetypes
import re
from dataclasses import dataclass
from functools import cached_property
from itertools import chain
from pathlib import Path

import boto3
import click
from boto3.s3.transfer import S3TransferConfig
from dateutil.tz import UTC

from .constants import (
    DEFAULT_CACHE_CONTROL,
    HASHED_CACHE_CONTROL,
    LOG_EACH_SUCCESSFUL_UPLOAD,
    MAX_WORKERS_PARALLEL_UPLOADS,
)
from .utils import StopWatch, fmt_size, iterdir, log

S3_MULTIPART_THRESHOLD = S3TransferConfig().multipart_threshold
S3_MULTIPART_CHUNKSIZE = S3TransferConfig().multipart_chunksize

NO_CACHE_VALUE = "no-store, must-revalidate"

hashed_filename_regex = re.compile(r"\.[a-f0-9]{8,32}\.")


def log_task(task):
    if task.error:
        if task.is_redirect:
            # With redirect upload tasks, we have to embellish the
            # error message.
            log.error(f"Failed to upload {task}: {task.error}")
        else:
            # With file upload tasks, the error message says it all.
            log.error(task.error)
    elif LOG_EACH_SUCCESSFUL_UPLOAD:
        log.success(task)


@dataclass
class Totals:
    """Class for keeping track of some useful totals."""

    failed: int = 0
    skipped: int = 0
    uploaded_files: int = 0
    uploaded_redirects: int = 0
    uploaded_files_size: int = 0
    deleted_files: int = 0

    def count(self, task):
        if task.skipped:
            self.skipped += 1
        elif task.error:
            self.failed += 1
        elif task.is_redirect:
            self.uploaded_redirects += 1
        elif task.is_deletion:
            self.deleted_files += 1
        else:
            self.uploaded_files += 1
            self.uploaded_files_size += task.size


class DisplayProgress:
    def __init__(self, total_count, show_progress_bar=True):
        if show_progress_bar:
            self.progress_bar = click.progressbar(
                fill_char="▋",
                show_pos=True,
                show_eta=False,
                show_percent=True,
                length=total_count,
            )
            self.failed_tasks = []
        else:
            self.progress_bar = None

    def __enter__(self):
        if self.progress_bar:
            self.progress_bar.__enter__()
            # Forces the progress-bar to show-up immediately.
            self.progress_bar.update(0)
        return self

    def __exit__(self, *exc_args):
        if self.progress_bar:
            self.progress_bar.__exit__(*exc_args)
            # Now that we've left the progress bar, let's report
            # any failed tasks.
            for task in self.failed_tasks:
                log_task(task)
        return False

    def update(self, task):
        if self.progress_bar:
            self.progress_bar.update(1)
            if task.error:
                self.failed_tasks.append(task)
        else:
            log_task(task)


class UploadTask:
    """
    Base class for indicating the common interface for all upload tasks.
    """

    error = None
    skipped = False
    is_redirect = False
    is_deletion = False

    def upload(self):
        raise NotImplementedError()


class UploadFileTask(UploadTask):
    """
    Class for file upload tasks.
    """

    def __init__(
        self,
        file_path: Path,
        key: str,
        dry_run=False,
        default_cache_control=DEFAULT_CACHE_CONTROL,
    ):
        self.key = key
        self.file_path = file_path
        self.dry_run = dry_run
        self.default_cache_control = default_cache_control

    def __repr__(self):
        return f"{self.__class__.__name__}({self.file_path}, {self.key})"

    def __str__(self):
        return self.key

    @property
    def size(self) -> int:
        return self.file_path.stat().st_size

    @property
    def etag(self):
        """
        Calculates and returns a value equivalent to the file's AWS ETag value.
        """
        md5s = []

        with self.file_path.open("rb") as f:

            def read_chunks():
                yield f.read(S3_MULTIPART_THRESHOLD)
                while True:
                    yield f.read(S3_MULTIPART_CHUNKSIZE)

            for chunk in read_chunks():
                if not chunk:
                    break
                md5s.append(hashlib.md5(chunk))

        if not md5s:
            return f'"{hashlib.md5().hexdigest()}"'

        if len(md5s) == 1:
            return f'"{md5s[0].hexdigest()}"'

        digests_md5 = hashlib.md5(b"".join(m.digest() for m in md5s))
        return f'"{digests_md5.hexdigest()}-{len(md5s)}"'

    @property
    def content_type(self):
        mime_type = (
            mimetypes.guess_type(str(self.file_path))[0] or "binary/octet-stream"
        )
        if mime_type.startswith("text/") or (
            mime_type in ("application/json", "application/javascript")
        ):
            mime_type += "; charset=utf-8"

        if mime_type == "binary/octet-stream" and self.file_path.suffix == ".woff2":
            # See https://github.com/mdn/yari/issues/2017
            mime_type = "font/woff2"

        return mime_type

    @property
    def is_hashed(self):
        return hashed_filename_regex.search(self.file_path.name)

    @property
    def cache_control(self):

        if self.file_path.name == "service-worker.js":
            return NO_CACHE_VALUE

        if self.file_path.name == "404.html":
            return NO_CACHE_VALUE

        if self.file_path.parent.name == "_whatsdeployed":
            return NO_CACHE_VALUE

        if self.is_hashed:
            cache_control_seconds = HASHED_CACHE_CONTROL
        else:
            cache_control_seconds = self.default_cache_control

        if cache_control_seconds == 0:
            return "max-age=0, no-cache, no-store, must-revalidate"
        else:
            return f"max-age={cache_control_seconds}, public"

    def upload(self, bucket_manager):
        if not self.dry_run:
            bucket_manager.client.upload_file(
                str(self.file_path),
                bucket_manager.bucket_name,
                self.key,
                ExtraArgs={
                    "ACL": "public-read",
                    "ContentType": self.content_type,
                    "CacheControl": self.cache_control,
                },
            )


class UploadRedirectTask(UploadTask):
    """
    Class for redirect upload tasks.
    """

    is_redirect = True

    def __init__(self, redirect_from_key, redirect_to_key, dry_run=False):
        self.key = redirect_from_key
        self.to_key = redirect_to_key
        self.dry_run = dry_run

    def __repr__(self):
        return f"UploadRedirectTask({self.key}, {self.to_key})"

    def __str__(self):
        return f"{self.key} -> {self.to_key}"

    @property
    def cache_control(self):
        return f"max-age={HASHED_CACHE_CONTROL}, public"

    def upload(self, bucket_manager):
        if not self.dry_run:
            bucket_manager.client.put_object(
                Body=b"",
                Key=self.key,
                ACL="public-read",
                CacheControl=self.cache_control,
                WebsiteRedirectLocation=self.to_key,
                Bucket=bucket_manager.bucket_name,
            )


class DeleteTask(UploadTask):
    """
    Class for doing deletion by key tasks.
    """

    is_deletion = True

    def __init__(self, key, dry_run=False):
        self.key = key
        self.dry_run = dry_run

    def __repr__(self):
        return f"{self.__class__.__name__}({self.key})"

    def __str__(self):
        return self.key

    def delete(self, bucket_manager):
        if not self.dry_run:
            bucket_manager.client.delete_object(
                Key=str(self.key),
                Bucket=bucket_manager.bucket_name,
            )


class BucketManager:
    def __init__(self, bucket_name, bucket_prefix):
        self.bucket_name = bucket_name
        self.bucket_prefix = bucket_prefix

    @property
    def key_prefix(self):
        if self.bucket_prefix:
            return f"{self.bucket_prefix.lower()}/"
        return ""

    @cached_property
    def client(self):
        # According to the boto3 docs, this low-level client is thread-safe.
        return boto3.client("s3")

    def get_key(self, build_directory, file_path):
        if file_path.name == "index.html":
            # NOTE: All incoming requests, unless immediately served from the CDN
            # cache, are first handled by our "origin-request" Lambda@Edge function,
            # which tansforms incoming URL's to S3 keys. This line of code allows
            # that function to remain as simple as possible, because we no longer
            # have to determine when to add an "/index.html" suffix when transforming
            # the incoming URL to it corresponding S3 key. We will simply store
            # "/en-us/docs/web/index.html" as "/en-us/docs/web", which mirrors
            # its URL. Also, note that the content type is not determined by the
            # suffix of the S3 key, but is explicitly set from the full filepath
            # when uploading the file.
            file_path = file_path.parent
        return f"{self.key_prefix}{str(file_path.relative_to(build_directory)).lower()}"

    def get_redirect_keys(self, from_url, to_url):
        return (
            f"{self.key_prefix}{from_url.strip('/').lower()}",
            f"/{to_url.strip('/')}" if to_url.startswith("/") else to_url,
        )

    def get_bucket_objects(self):
        result = {}
        continuation_token = None
        while True:
            # Note! You can set a `MaxKeys` parameter here.
            # The default is 1,000. Any number larger than 1,000 is ignored
            # and it will just fall back to 1,000.
            # (Peterbe's note) I've experimented with different numbers (
            # e.g. 500 or 100) and the total time difference is insignificant.
            # A large MaxKeys means larger batches and fewer network requests
            # which has a reduced risk of network failures (automatically retried)
            # and there doesn't appear to be any benefit in setting it to a lower
            # number. So leave it at 1,000 which is what you get when it's not set.
            kwargs = dict(Bucket=self.bucket_name)
            if self.key_prefix:
                kwargs["Prefix"] = self.key_prefix
            if continuation_token:
                kwargs["ContinuationToken"] = continuation_token
            response = self.client.list_objects_v2(**kwargs)
            for obj in response.get("Contents", ()):
                result[obj["Key"]] = obj
            if response["IsTruncated"]:
                continuation_token = response["NextContinuationToken"]
            else:
                break
        return result

    def iter_file_tasks(
        self,
        build_directory,
        for_counting_only=False,
        dry_run=False,
        default_cache_control=DEFAULT_CACHE_CONTROL,
    ):
        # The order matters! In particular the order of static assets compared to
        # the HTML files that reference said static assets.
        # If you upload the HTML files before we upload the static assets, what
        # might happen is this:
        #
        #  ...
        #  <link rel=stylesheet href=/static/css/main.350fa0c1.css">
        #  <title>JavaScript MDN Web Docs</title>
        #  ...
        #
        # Now if the CDN serves this new HTML file *before*
        # the /static/css/main.350fa0c1.css file has been uploaded, you get a busted
        # page.
        # So explicitly upload all the static assets first.
        # I.e. `<build_directory>/static/`
        # And since we later processed the whole of `<build_directory>` we'll
        # come across these static files again. So that's why we populate a
        # `set` so that when we do the second pass, we'll know what we've already
        # yielded.
        # Origin for this is: https://github.com/mdn/yari/issues/3315
        done = set()

        # Walk the build_directory/static and yield file upload tasks.
        for fp in iterdir(build_directory / "static"):
            # Exclude any files that aren't artifacts of the build.
            if fp.name.startswith(".") or fp.name.endswith("~"):
                continue

            key = self.get_key(build_directory, fp)

            if for_counting_only:
                yield 1
            else:
                yield UploadFileTask(
                    fp,
                    key,
                    dry_run=dry_run,
                    default_cache_control=default_cache_control,
                )
            done.add(key)

        # Prepare a computation of what the root /index.html file would be
        # called as a S3 key. Do this once so it becomes a quicker operation
        # later when we compare *each* generated key to see if it matches this.
        root_index_html_as_key = self.get_key(
            build_directory, build_directory / "index.html"
        )

        # Walk the build_directory and yield file upload tasks.
        for fp in iterdir(build_directory):
            # Exclude any files that aren't artifacts of the build.
            if fp.name.startswith(".") or fp.name.endswith("~"):
                continue

            key = self.get_key(build_directory, fp)

            if key in done:
                # This can happen since we might have explicitly processed this
                # in the for-loop above. See comment at the beginning of this method.
                continue

            # The root index.html file is never useful. It's not the "home page"
            # because the home page is actually `/$locale/` since `/` is handled
            # specifically by the CDN.
            # The client/build/index.html is actually just a template from
            # create-react-app, used to server-side render all the other pages.
            # But we don't want to upload it S3. So, delete it before doing the
            # deployment step.
            if root_index_html_as_key == key:
                continue

            if for_counting_only:
                yield 1
            else:
                yield UploadFileTask(
                    fp,
                    key,
                    dry_run=dry_run,
                    default_cache_control=default_cache_control,
                )

    def iter_redirect_tasks(
        self, content_roots, for_counting_only=False, dry_run=False
    ):
        # Walk the content roots and yield redirect upload tasks.
        for content_root in content_roots:
            # Look for "_redirects.txt" files up to two levels deep to
            # accommodate the content root specified as the root of the
            # repo or the "files" sub-directory of the root of the repo.
            for fp in chain(
                content_root.glob("*/_redirects.txt"),
                content_root.glob("*/*/_redirects.txt"),
            ):
                for line_num, line in enumerate(fp.read_text().split("\n"), start=1):
                    line = line.strip()
                    if line and not line.startswith("#"):
                        parts = line.split("\t")
                        if len(parts) != 2:
                            raise Exception(
                                f"Unable to parse {fp}:{line_num} into a from/to URL pair"
                            )
                        from_url, to_url = parts
                        if for_counting_only:
                            yield 1
                        else:
                            yield UploadRedirectTask(
                                *self.get_redirect_keys(from_url, to_url),
                                dry_run=dry_run,
                            )

    def iter_delete_tasks(self, keys, dry_run=False):
        for key in keys:
            yield DeleteTask(key, dry_run=dry_run)

    def count_file_tasks(self, build_directory):
        return sum(self.iter_file_tasks(build_directory, for_counting_only=True))

    def count_redirect_tasks(self, content_roots):
        return sum(self.iter_redirect_tasks(content_roots, for_counting_only=True))

    def upload(
        self,
        build_directory,
        content_roots,
        existing_bucket_objects=None,
        on_task_complete=None,
        skip_redirects=False,
        dry_run=False,
        default_cache_control=DEFAULT_CACHE_CONTROL,
    ):
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=MAX_WORKERS_PARALLEL_UPLOADS
        ) as executor, StopWatch() as timer:
            # Upload the redirects first, then the built files. This
            # ensures that a built file overrides its stale redirect.
            task_iters = []
            if not skip_redirects:
                task_iters.append(
                    self.iter_redirect_tasks(content_roots, dry_run=dry_run)
                )
            task_iters.append(
                self.iter_file_tasks(
                    build_directory,
                    dry_run=dry_run,
                    default_cache_control=default_cache_control,
                )
            )
            for task_iter in task_iters:
                futures = {}
                for task in task_iter:
                    # Note: redirect upload tasks are never skipped.
                    if existing_bucket_objects and not task.is_redirect:
                        s3_obj = existing_bucket_objects.get(task.key)
                        if s3_obj and s3_obj["ETag"] == task.etag:
                            task.skipped = True
                            if on_task_complete:
                                on_task_complete(task)

                            # Before continuing, pop it from the existing dict because
                            # we no longer need it after the ETag comparison has been
                            # done.
                            existing_bucket_objects.pop(task.key, None)
                            continue

                    if existing_bucket_objects:
                        # Independent of if we benefitted from the knowledge of the
                        # key already existing or not, remove it from the dict
                        # so we can figure out what remains later.
                        existing_bucket_objects.pop(task.key, None)

                    future = executor.submit(task.upload, self)
                    futures[future] = task

                for future in concurrent.futures.as_completed(futures):
                    task = futures[future]
                    try:
                        task.error = future.exception()
                    except concurrent.futures.CancelledError as cancelled:
                        task.error = cancelled

                    if on_task_complete:
                        on_task_complete(task)

        return timer

    def delete(self, keys, on_task_complete=None, dry_run=False):
        """Delete doesn't care if it's a redirect or a regular file."""
        with concurrent.futures.ThreadPoolExecutor(
            max_workers=MAX_WORKERS_PARALLEL_UPLOADS
        ) as executor, StopWatch() as timer:
            # Upload the redirects first, then the built files. This
            # ensures that a built file overrides its stale redirect.
            task_iter = self.iter_delete_tasks(keys, dry_run=dry_run)
            futures = {}
            for task in task_iter:
                future = executor.submit(task.delete, self)
                futures[future] = task

            for future in concurrent.futures.as_completed(futures):
                task = futures[future]
                try:
                    task.error = future.exception()
                except concurrent.futures.CancelledError as cancelled:
                    task.error = cancelled

                if on_task_complete:
                    on_task_complete(task)

        return timer


def parse_archived_txt_file(file: Path):
    with open(file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                yield line


def upload_content(build_directory, content_roots, config):
    full_timer = StopWatch().start()

    dry_run = config["dry_run"]
    bucket_name = config["bucket"]
    bucket_prefix = config["prefix"]
    force_refresh = config["force_refresh"]
    show_progress_bar = not config["no_progressbar"]
    upload_redirects = not config["no_redirects"]
    prune = config["prune"]
    archived_txt_file = config["archived_files"]
    default_cache_control = config["default_cache_control"]

    log.info(f"Upload files from: {build_directory}")
    if upload_redirects:
        log.info(f"Upload redirects from: {', '.join(str(fp) for fp in content_roots)}")
    log.info("Upload into: ", nl=False)
    if bucket_prefix:
        log.info(f"{bucket_prefix}/ of ", nl=False)
    log.info(bucket_name)

    mgr = BucketManager(bucket_name, bucket_prefix)

    if upload_redirects:
        with StopWatch() as timer:
            total_redirects = mgr.count_redirect_tasks(content_roots)
            if not total_redirects:
                raise click.ClickException(
                    "unable to find any redirects to upload "
                    "(did you specify the right content-root?)"
                )
        log.info(f"Total pending redirect uploads: {total_redirects:,} ({timer})")
    else:
        total_redirects = 0
        log.info("Not going to upload any redirects")

    with StopWatch() as timer:
        total_possible_files = mgr.count_file_tasks(build_directory)
    log.info(f"Total pending file uploads: {total_possible_files:,} ({timer})")

    if force_refresh:
        existing_bucket_objects = None
    else:
        log.info("Total existing S3 objects: ", nl=False)
        with StopWatch() as timer:
            existing_bucket_objects = mgr.get_bucket_objects()
        log.info(f"{len(existing_bucket_objects):,} ({timer})")

    totals = Totals()

    with DisplayProgress(
        total_redirects + total_possible_files, show_progress_bar
    ) as progress:

        def on_task_complete(task):
            progress.update(task)
            totals.count(task)

        upload_timer = mgr.upload(
            build_directory,
            content_roots,
            existing_bucket_objects,
            on_task_complete=on_task_complete,
            skip_redirects=not upload_redirects,
            dry_run=dry_run,
            default_cache_control=default_cache_control,
        )

    if dry_run:
        log.info("No uploads. Dry run!")
    else:
        log.info(
            f"Total uploaded files: {totals.uploaded_files:,} "
            f"({fmt_size(totals.uploaded_files_size)})"
        )
        if upload_redirects:
            log.info(f"Total uploaded redirects: {totals.uploaded_redirects:,} ")
        log.info(f"Total skipped files: {totals.skipped:,} matched existing S3 objects")
        log.info(f"Total upload/skip time: {upload_timer}")

    if prune:
        # Now `existing_bucket_objects` has mutated to only contain the keys
        # that were not uploaded or not needed to be uploaded.
        # That basically means all the S3 keys that exist before but are
        # unrecognized now. For example, things that were once built but are
        # now deleted.
        now = datetime.datetime.utcnow().replace(tzinfo=UTC)
        delete_keys = []

        archived_files_as_keys = set()
        if archived_txt_file:
            for file in parse_archived_txt_file(archived_txt_file):
                locale, slug = file.replace("/index.html", "").split("/", 1)
                archived_files_as_keys.add(f"{bucket_prefix}/{locale}/docs/{slug}")
            if not archived_files_as_keys:
                raise Exception(f"found no entries inside {archived_txt_file}")

        for key in existing_bucket_objects:
            if key.startswith(f"{bucket_prefix}/_whatsdeployed/"):
                # These are special and wouldn't have been uploaded
                continue

            if key.startswith(f"{bucket_prefix}/static/"):
                # Careful with these!
                # Static assets such as `main/static/js/8.0b83949c.chunk.js`
                # are aggressively cached and they might still be referenced
                # from within HTML pages that are still in the CDN cache.
                # Suppose someone gets a copy of yesterday's HTML from the CDN
                # and it refers to `/static/js/foo.abc123.js` which is not in their
                # browser cache or the CDN's cache, what might happen is that
                # their browser requests it even though
                # `/static/js/foo.def456.js` is now the latest and greatest.
                # To be safe, only delete if it's considered "old".
                delta = now - existing_bucket_objects[key]["LastModified"]
                if delta.days < 30:
                    continue

            # Remember, if `key` is from a "index.html" file it will be represented
            # something like this: `main/en-us/docs/web/api/documentorshadowroot`
            # with the `/index.html` portion removed.
            # But every page usually has a `index.json` file, which might look
            # something like this: `main/en-us/docs/web/api/index.json` or
            # `main/en-us/docs/web/api/screenshot.png`

            # This if statement protects against possible deleting anything that
            # isn't a document.
            if "/docs/" in key:
                is_archived = False
                # Trying to avoid having to do another for-loop with key.startswith()
                # so first look for the low-hanging fruit.
                if key in archived_files_as_keys:
                    # This is the easiest and fastest lookup
                    is_archived = True
                elif (
                    re.sub(r"/(index\.json|contributors\.txt|bcd\.json)$", "", key)
                    in archived_files_as_keys
                ):
                    # This is easy and fast too and covers 99% of the other
                    # possible keys.
                    is_archived = True
                else:
                    # This is for things like:
                    # `main/en-us/docs/web/api/screenshot.png` where you can't
                    # confidently use `path.dirname()` because the key could
                    # be something like `main/fr/docs/web/api/manifest.json` which
                    # is actually a "folder".
                    for archive_file_as_key in archived_files_as_keys:
                        if key.startswith(archive_file_as_key):
                            is_archived = True
                            break
                if is_archived:
                    continue

            assert key.startswith(bucket_prefix)

            delete_keys.append(key)

        log.info(f"Total pending task deletions: {len(delete_keys):,}")

        with DisplayProgress(len(delete_keys), show_progress_bar) as progress:

            def on_task_complete(task):
                progress.update(task)
                totals.count(task)

            mgr.delete(delete_keys, on_task_complete=on_task_complete, dry_run=dry_run)

        if dry_run:
            log.info("No deletions. Dry run!")
        else:
            log.info(f"Total deleted keys: {totals.deleted_files:,}")

    log.info(f"Done in {full_timer.stop()}.")

    if totals.failed:
        raise click.ClickException(f"There were {totals.failed} failures.")
