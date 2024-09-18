export interface SourceMap {
  version: 3;
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

export interface ReportInput {
  bytes: number;
  format: ModuleFormat;
  imports: ReadonlyArray<string>;
  belongsTo: string | null;
}

export interface ReportOutput {
  bytes: number;
  inputs: Record<string, ReportOutputInput>;
}

export interface ReportOutputInput {
  bytesInOutput: number;
}

export interface JsonReport {
  inputs: Record<string, ReportInput>;
  outputs: Record<string, ReportOutput>;
}

export interface CodeMap {
  code: string;
  map?: SourceMap;
}

export type ModuleFormat = 'esm' | 'cjs' | 'unknown';
export type MaybeCodeMap = CodeMap | null;
