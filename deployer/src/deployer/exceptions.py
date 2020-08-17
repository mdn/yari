class CoreException(Exception):
    """Exists for the benefit of making the cli easier to catch exceptions."""


# class NoGitDirectory(CoreException):
#     """When trying to find a/the git directory and failing."""


class CantDryRunError(Exception):
    """When the preconditions prevent a dry-run"""
