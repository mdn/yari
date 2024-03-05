import frontmatter from "../node_modules/front-matter/index.js";

// frontmatter 4.0.2 exposes incorrect types for an esm consumer:
// types are on frontmatter.default, however frontmatter.default is actually undefined
export default frontmatter as unknown as typeof frontmatter.default;
