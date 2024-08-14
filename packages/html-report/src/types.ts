export interface TileData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FileImport {
  path: string;
}

export interface FileReport {
  bytes: number;
  format?: "esm" | "cjs";
  imports?: Array<FileImport>;
}

export type ReportData = Map<string, FileReport>;
