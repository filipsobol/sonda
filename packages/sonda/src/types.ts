import type { EncodedSourceMap } from '@ampproject/remapping';

export interface Options {
  /**
   * Output format of the report.
   *
   * @default 'html'
   */
  format: 'html' | 'json';

  /**
   * Whether to open the report in the default program for given file extension
   * (`.html` or `.json` depending on the `format` option) after the build.
   *
   * @default true
   */
  open: boolean;

  /**
   * Whether to calculate the sizes of assets after compression with GZIP.
   *
   * The report will also include the estimated compressed sizes of the
   * individual files that make up each asset. However, unlike the
   * compressed size of the entire asset, the estimates for individual
   * files are not completely accurate and should only be used as a reference.
   *
   * Enabling this option will increase the time it takes to generate the report.
   *
   * @default false
   */
  gzip: boolean;

  /**
   * Whether to calculate the sizes of assets after compression with Brotli.
   *
   * The report will also include the estimated compressed sizes of the
   * individual files that make up each asset. However, unlike the
   * compressed size of the entire asset, the estimates for individual
   * files are not completely accurate and should only be used as a reference.
   *
   * Enabling this option will increase the time it takes to generate the report.
   *
   * @default false
   */
  brotli: boolean;
}

export interface ReportInput {
  bytes: number;
  format: ModuleFormat;
  imports: ReadonlyArray<string>;
  belongsTo: string | null;
}

export interface ReportOutput extends Sizes {
  inputs: Record<string, ReportOutputInput>;
}

export interface ReportOutputInput extends Sizes {}

export interface JsonReport {
  inputs: Record<string, ReportInput>;
  outputs: Record<string, ReportOutput>;
}

export interface Sizes {
  uncompressed: number;
  gzip: number;
  brotli: number;
}

export interface CodeMap {
  code: string;
  map?: EncodedSourceMap;
}

export type ModuleFormat = 'esm' | 'cjs' | 'unknown';
export type MaybeCodeMap = CodeMap | null;
