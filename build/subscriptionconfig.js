const got = require("got");

async function getSubscriptionConfig(url) {
  try {
    return await got(url, {
      responseType: "json",
      timeout: 5000,
      retry: 5,
      resolveBodyOnly: true,
    });
  } catch (error) {
    console.error(
      `Error while fetching subscription config for ${url}:`,
      error
    );
    throw error;
  }
}

module.exports = { getSubscriptionConfig };
