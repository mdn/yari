import express from "express";
import { createHandler } from "./app.js";
import { Origin } from "./env.js";

const contentApp = express();
const contentPort = 3000;

contentApp.all("*", createHandler(Origin.main));
contentApp.listen(contentPort, () => {
  console.log(`Content app listening on port ${contentPort}`);
});

const liveSampleApp = express();
const liveSamplePort = 5042;

liveSampleApp.all("*", createHandler(Origin.liveSamples));
liveSampleApp.listen(liveSamplePort, () => {
  console.log(`Sample app listening on port ${liveSamplePort}`);
});
