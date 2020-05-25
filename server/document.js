const path = require("path");

const promiseRouter = require("express-promise-router");

const Document = require("content/scripts/document");

const { getOrCreateBuilder, normalizeContentPath } = require("./utils");

const router = promiseRouter();

function withDocFolder(req, res, next) {
  if (!req.query.url) {
    return res.status(400).send("No ?url= query param");
  }
  const mdn_url = req.query.url.toLowerCase();
  const docData = getOrCreateBuilder().allTitles.get(mdn_url);
  if (!docData) {
    return res.status(400).send(`No document by the URL ${req.query.url}`);
  }
  req.folder = normalizeContentPath(docData.file);
  next();
}

router.get("/", withDocFolder, async (req, res) => {
  res.status(200).json(await Document.read(req.folder));
});

router.put("/", withDocFolder, async (req, res) => {
  const { html, meta } = req.body;
  if (meta.title && html) {
    await Document.update(req.folder, html.trim() + "\n", {
      title: meta.title.trim(),
      summary: meta.summary.trim(),
    });
  }
  res.sendStatus(200);
});

router.post("/", async (req, res) => {
  const { locale, html, meta } = req.body;
  const contentPath = path.join(
    "..",
    process.env.BUILD_ROOT,
    locale.toLowerCase()
  );
  await Document.create(contentPath, html, meta);
  getOrCreateBuilder().ensureAllTitles();
  res.sendStatus(200);
});

module.exports = router;
