import type { DecodedSourceMap, EncodedSourceMap } from '@ampproject/remapping';

export interface UserOptions {
  /**
   * Specifies whether the plugin is enabled.
   *
   * @default true
   */
  enabled: boolean;

  /**
   * Specifies the output format of the report.
   *
   * @default 'html'
   */
  format: 'html' | 'json';

  /**
   * Specifies the path of the generated report. This can be a filename, a relative path,
   * or an absolute path. By default, the report is saved in the current working directory.
   *
   * @default 'sonda-report.html' or 'sonda-report.json' depending on the `format` option
   */
  filename: string;

  /**
   * Specifies whether to automatically open the report in the default program for
   * the given file extension (`.html` or `.json`, depending on the `format` option)
   * after the build process.
   *
   * @default true
   */
  open: boolean;

  /**
   * Specifies whether to read the source maps of imported modules.
   *
   * By default, external dependencies bundled into a single file appear as a single
   * asset in the report. When this option is enabled, the report includes the source
   * files of imported modules, if source maps are available.
   *
   * Enabling this option may increase the time needed to generate the report and reduce
   * the accuracy of estimated GZIP and Brotli sizes for individual files.
   *
   * @default false
   */
  detailed: boolean;

  /**
   * Specifies whether to include source maps of the assets in the report to visualize
   * which parts of the code contribute to the final asset size.
   *
   * ⚠️ This option significantly increases the size of the report and embeds the
   * **source code** of the assets. If you are working with proprietary code, ensure
   * you share the report responsibly. ⚠️
   *
   * @default false
   */
  sources: boolean;

  /**
   * Specifies whether to calculate the sizes of assets after compression with GZIP.
   *
   * The report includes estimated compressed sizes for each file within an asset.
   * However, these estimates are approximate and should be used as a general reference.
   *
   * Enabling this option may increase the time required to generate the report.
   *
   * @default false
   */
  gzip: boolean;

  /**
   * Specifies whether to calculate the sizes of assets after compression with Brotli.
   *
   * The report includes estimated compressed sizes for each file within an asset.
   * However, these estimates are approximate and should be used as a general reference.
   *
   * Enabling this option may increase the time required to generate the report.
   *
   * @default false
   */
  brotli: boolean;
}

export interface FrameworkUserOptions extends UserOptions {
  /**
   * Specifies whether the plugin generates a report for the server build.
   * 
   * @default false
   */
  server: boolean;
}

export interface PluginOptions extends UserOptions {
  sourcesPathNormalizer: ( (path: string) => string ) | null;
}

export interface ReportInput {
  bytes: number;
  format: ModuleFormat;
  imports: Array<string>;
  belongsTo: string | null;
}

export interface ReportOutput extends Sizes {
  type: SourceType;
  inputs: Record<string, ReportOutputInput>;
  map?: DecodedSourceMap;
}

export interface ReportOutputInput extends Sizes {}

export interface JsonReport {
  /**
   * List of all source input files.
   */
  inputs: Record<string, ReportInput>;

  /**
   * List of all generated output files.
   */
  outputs: Record<string, ReportOutput>;

  /**
   * List of all detected external dependencies and their paths. If
   * a dependency has more than one path, it's likely duplicated and
   * bundled in multiple copies.
   */
  dependencies: Record<string, Array<string>>;

  /**
   * List of issues detected in the outputs.
   */
  issues: {
    duplicateDependencies?: Array<string>
  }
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

export type SourceType = 'script' | 'style' | 'other';
export type ModuleFormat = 'esm' | 'cjs' | 'unknown';
export type MaybeCodeMap = CodeMap | null;
