// Source map proposal: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k
// Intro to source maps: https://developer.chrome.com/blog/sourcemaps
export interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
}
