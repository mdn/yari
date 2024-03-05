export default {
  "!*.{js,jsx,ts,tsx,css,scss}": "prettier --ignore-unknown --write",
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss}": ["stylelint --fix --allow-empty-input", "prettier --write"],
};
