require("dotenv").config();

const {
  FLAW_LEVELS,
  DEFAULT_FLAW_LEVELS,
  VALID_FLAW_CHECKS,
} = require("./constants");

// Core defaults
const options = {
  flawLevels: checkFlawLevels(DEFAULT_FLAW_LEVELS),
};

// Override based on env vars but only for options that are *not*
// exclusive to building everyhing.
function checkFlawLevels(flawChecks) {
  const checks = flawChecks
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x)
    .map((x) => x.split(":").map((s) => s.trim()));

  // Check that it doesn't contain more than 1 wildcard,
  // because that'd make no sense.
  const wildcards = checks.filter((tuple) => tuple[0] === "*");
  if (wildcards.length > 1) {
    throw new Error(`Can only be 1 wild card (not: ${wildcards})`);
  }

  // Put any wildcards (e.g. '*:warn') first
  checks.sort((a, b) => {
    if (a[0] === "*" && b[0] !== "*") {
      return -1;
    } else if (a[0] !== "*" && b[0] === "*") {
      return 1;
    }
    return 0;
  });

  const checked = new Map();

  // Unless specified, set 'ignore' on all of them first.
  for (const check of VALID_FLAW_CHECKS) {
    checked.set(check, FLAW_LEVELS.IGNORE);
  }

  const levelValues = Object.values(FLAW_LEVELS);

  for (const tuple of checks) {
    if (tuple.length !== 2) {
      throw new Error(`Not a tuple pair of 2 (${tuple})`);
    }
    const [identifier, level] = tuple;
    if (!levelValues.includes(level)) {
      throw new Error(`Invalid level: '${level}' (only ${levelValues})`);
    }
    if (identifier === "*") {
      for (const check of VALID_FLAW_CHECKS) {
        checked.set(check, level);
      }
    } else if (!VALID_FLAW_CHECKS.has(identifier)) {
      throw new Error(
        `Unrecognized flaw identifier: '${identifier}' (only ${[
          ...VALID_FLAW_CHECKS,
        ]})`
      );
    } else {
      checked.set(identifier, level);
    }
  }

  return checked;
}

module.exports = options;
