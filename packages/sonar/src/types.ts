export interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;

  // TODO: Potentially `null`?
  // https://tc39.es/source-map/#source-map-format
  sources: Array<string>; 

  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
  ignoreList?: Array<number>;
  sections?: Array<SourceMapSection>;
}

export interface SourceMapSection {
  offset: {
    line: number;
    column: number;
  };
  map: SourceMap;
}

export interface ModuleInfo {
  format: 'esm' | 'cjs' | 'unknown';
  imports: ReadonlyArray<string>;
}

export interface NormalizedSource extends ModuleInfo {
  originalPath: string;
  mappedPath: string;
  dir: string;
  filename: string;
  bytes: number;
  parent: string | null
}

export type Sources = Record<string, NormalizedSource>;
export type ImportsGraph = Map<string, ModuleInfo>;
export type SourcesGraph = Map<string, string>;
export type JsonReportData = Record<string, NormalizedSource>;

export type LoadCodeAndMapResult = null | {
  code: string;
  map?: SourceMap;
}
