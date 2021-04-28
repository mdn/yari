test.each(findAllMarkdownDocs())("%s", async (doc) => {
  const page = await browser.newPage();
  await page.goto(`https://localhost:5000${doc.url}`);
  const image = await page.screenshot();
  expect(image).toMatchImageSnapshot();
});
