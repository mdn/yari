export function Summary({ section }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: buildSummary(section.content) }} />
  );
}

function buildSummary(content: string) {
  // We should strip any embedded examples from the summary
  return content.replace(/<iframe.*<\/iframe>/gm, "");
}
