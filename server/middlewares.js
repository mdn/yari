const express = require("express");

const { STATIC_ROOT } = require("./constants");

// Lowercase every request because every possible file we might have
// on disk is always in lowercase.
// This only helps when you're on a filesystem (e.g. Linux) that is case
// sensitive.
const slugRewrite = (req, res, next) => {
  req.url = req.url.toLowerCase();
  next();
};

module.exports = {
  staticMiddlewares: [slugRewrite, express.static(STATIC_ROOT)],
};
