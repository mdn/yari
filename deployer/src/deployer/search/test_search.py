from deployer.search import html_strip


def test_html_strip_basic():
    html = "<p>Hej då<p>"
    text = "Hej då"
    assert html_strip(html) == text


def test_html_strip_advanced():
    html = """
    <div class="warning">This should get stripped.</div>
    <p>Please keep.</p>
    <div class="hidden">
    <h6 id="Playable_code">Playable code</h6>
    </div>
    <div style="display: none">This should also get stripped.</div>
    <div style="foo:bar;display:none;fun:k">This should also get stripped.</div>
    <div style="foo:bar;">Expect to keep this</div>
    """
    result = html_strip(html)
    assert "This should get stripped" not in result
    assert "Please keep." in result
    assert "Playable code" not in result
    assert "This should also get stripped" not in result
    assert "Expect to keep this" in result
