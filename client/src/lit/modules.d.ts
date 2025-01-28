// once https://github.com/microsoft/TypeScript/issues/46135 is fixed
// we'll be able to do something like:
// declare module '*' with {type: 'css'} {
declare module "*?css" {
  const sheet: CSSStyleSheet;
  export default sheet;
}

declare module "*?raw" {
  const src: string;
  export default src;
}
