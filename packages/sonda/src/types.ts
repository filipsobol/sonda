import type { DecodedSourceMap, EncodedSourceMap } from '@ampproject/remapping';

export interface Options {
  /**
   * Determines the output format of the report.
   *
   * @default 'html'
   */
  format: 'html' | 'json';

  /**
   * Determines the path of the generated report. The values can be either
   * a filename, a relative path, or an absolute path.
   *
   * @default 'sonda-report.html' or 'sonda-report.json' depending on the `format` option
   */
  filename: string;

  /**
   * Determines whether to open the report in the default program for given file
   * extension (`.html` or `.json` depending on the `format` option) after the build.
   *
   * @default true
   */
  open: boolean;

  /**
   * Determines whether to read the source maps of imported modules.
   *
   * By default, external dependencies that are bundled into a single file appear as
   * a single asset in the report. When this option is enabled, the report will instead
   * include the source files of the imported modules, if they have source maps.
   *
   * Enabling this option will increase the time needed to generate the report and
   * reduce the accuracy of estimated GZIP and Brotli sizes for individual files.
   *
   * @default false
   */
  detailed: boolean;

  /**
   * Determines whether to include the source maps of the assets in the report to
   * visualize which parts of the code contribute to the final bundle size.
   *
   * ⚠️ Enabling this option will significantly increase the report size and include
   * it in the **source code** of the assets. If you work with proprietary code, be
   * cautious when sharing the report. ⚠️
   *
   * @default false
   */
  sources: boolean;

  /**
   * Determines whether to calculate the sizes of assets after compression with GZIP.
   *
   * The report will include estimated compressed sizes for each file within an asset.
   * However, unlike the compressed size of the entire asset, these individual file
   * estimates are approximate and should be used as a general reference.
   *
   * Enabling this option will increase the time needed to generate the report.
   *
   * @default false
   */
  gzip: boolean;

  /**
   * Determines whether to calculate the sizes of assets after compression with Brotli.
   *
   * The report will include estimated compressed sizes for each file within an asset.
   * However, unlike the compressed size of the entire asset, these individual file
   * estimates are approximate and should be used as a general reference.
   *
   * Enabling this option will increase the time needed to generate the report.
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
  map?: DecodedSourceMap;
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
