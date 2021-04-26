import json
import tempfile
from contextlib import contextmanager
from pathlib import Path
from unittest.mock import patch

from deployer.analyze_pr import analyze_pr

DEFAULT_CONFIG = {
    "prefix": None,
    "analyze_flaws": False,
    "analyze_dangerous_content": False,
    "repo": "mdn/content",
    "pr_number": None,
    "dry_run": False,
    "github_token": "",
}


@contextmanager
def mock_build_directory(*docs):
    with tempfile.TemporaryDirectory() as tmpdirname:
        dirname = Path(tmpdirname)
        for i, doc in enumerate(docs):
            doc_dirname = dirname / f"doc{i}"
            doc_dirname.mkdir()
            with open(doc_dirname / "index.json", "w") as f:
                json.dump(doc, f)
        yield dirname


def test_analyze_pr_prefix():
    doc = {"doc": {"mdn_url": "/en-US/docs/Foo"}}
    with mock_build_directory(doc) as build_directory:
        comment = analyze_pr(build_directory, dict(DEFAULT_CONFIG, prefix="pr007"))
        assert "## Preview URLs" in comment
        assert "- <https://pr007.content.dev.mdn.mozit.cloud/en-US/docs/Foo>" in comment


def test_analyze_pr_flaws():
    doc = {
        "doc": {
            "mdn_url": "/en-US/docs/Foo",
            "title": "Foo",
            "flaws": {
                "faux_pas": [
                    {"explanation": "Socks in sandals"},
                    {"explanation": "Congrats on losing your cat"},
                ],
            },
            "source": {"github_url": "https://github.com/foo"},
        }
    }
    no_flaws_doc = {
        "doc": {
            "mdn_url": "/en-US/docs/Bar",
            "title": "Bar",
            "flaws": {},
            "source": {"github_url": "https://github.com/bar"},
        }
    }
    with mock_build_directory(no_flaws_doc, doc) as build_directory:
        comment = analyze_pr(build_directory, dict(DEFAULT_CONFIG, analyze_flaws=True))
        assert "## Flaws" in comment
        assert "1 document with no flaws that don't need to be listed" in comment
        assert "Flaw count: 2" in comment
        assert len(comment.split("\n---\n")) == 1
        assert "- **faux_pas**:" in comment
        assert "  - `Socks in sandals`" in comment
        assert "  - `Congrats on losing your cat`" in comment


def test_analyze_pr_dangerous_content():
    doc = {
        "doc": {
            "mdn_url": "/en-US/docs/Foo",
            "title": "Foo",
            "body": [
                {
                    "type": "prose",
                    "value": {
                        "content": """
            <p>
            <a href="https://www.peterbe.com">Peterbe.com</a>
            </p>
            """
                    },
                }
            ],
            "source": {"github_url": "https://github.com/foo"},
        }
    }
    with mock_build_directory(doc) as build_directory:
        comment = analyze_pr(
            build_directory, dict(DEFAULT_CONFIG, analyze_dangerous_content=True)
        )
        assert "## External URLs" in comment
        assert "  - <https://www.peterbe.com> (1 time)" in comment


@patch("deployer.analyze_pr.Github")
def test_analyze_pr_prefix_and_postcomment(mocked_github):
    doc = {"doc": {"mdn_url": "/en-US/docs/Foo"}}
    with mock_build_directory(doc) as build_directory:
        comment = analyze_pr(
            build_directory,
            dict(DEFAULT_CONFIG, prefix="pr007", pr_number=123, github_token="abc123"),
        )
        assert "## Preview URLs" in comment
        assert "- <https://pr007.content.dev.mdn.mozit.cloud/en-US/docs/Foo>" in comment

    mocked_github().get_repo().get_issue().create_comment.assert_called()
