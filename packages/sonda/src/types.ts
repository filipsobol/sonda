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
   * Whether to read the source maps of imported modules.
   * 
   * By default, external dependencies that are bundled into a single file are shown
   * as a single asset in the report. However, when investigating tree-shaking issues,
   * it can be useful to see individual source files of the dependencies.
   * 
   * Enabling this options will read the source maps of imported modules and show
   * individual files that make up these bundles.
   *
   * Enabling this option will increase the time it takes to generate the report and
   * decrease the accuracy of the estimated GZIP and Brotli sizes of individual files.
   *
   * @default false
   */
  detailed: boolean;

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
