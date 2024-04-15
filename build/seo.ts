export function rewritePageTitleForSEO(s: string | null): string | null {
  if (typeof s !== "string") {
    return s;
  }
  return (
    s
      // "AudioBuffer: sampleRate property" -> "AudioBuffer.sampleRate property"
      .replace(/^(.*): (.*?) (static )?(method|property)/, "$1.$2 $3$4")
      // "AudioBuffer: AudioBuffer() constructor" -> "AudioBuffer() constructor"
      .replace(/^(.*): (\1\(\)) constructor/, "$2 constructor") ?? null
  );
}
