import type { SourcesPathNormalizer } from 'load-source-map';

export class Config implements Required<IntegrationOptions> {
	#options: Required<IntegrationOptions>;

	public constructor(
		options: Partial<IntegrationOptions> | Config,
		defaults: IntegrationOptions
	) {
		if ( options instanceof Config ) {
			this.#options = options.#options;
			return;
		}

		this.#options = Object.assign( {
			enabled: true,
			format: 'html',
			outputDir: '.sonda',
			open: false,
			deep: false,
			sources: false,
			gzip: false,
			brotli: false,
			server: false,
			filename: 'sonda',
			sourcesPathNormalizer: null
		}, defaults, options );
	}

	public clone(): Config {
		return new Config( {}, structuredClone( this.#options ) );
	}

	public get enabled(): boolean {
		return this.#options.enabled;
	}

	public get format(): Format {
		return this.#options.format;
	}

	public get outputDir(): string {
		return this.#options.outputDir;
	}

	public get open(): boolean {
		return this.#options.open;
	}

	public get deep(): boolean {
		return this.#options.deep;
	}

	public get sources(): boolean {
		return this.#options.sources;
	}

	public get gzip(): boolean {
		return this.#options.gzip;
	}

	public get brotli(): boolean {
		return this.#options.brotli;
	}

	public get server(): boolean {
		return this.#options.server;
	}

	public get integration(): Integration {
		return this.#options.integration;
	}

	public get filename(): string {
		return this.#options.filename;
	}

	public get sourcesPathNormalizer(): SourcesPathNormalizer {
		return this.#options.sourcesPathNormalizer;
	}

	public set filename( filename: string ) {
		this.#options.filename = filename;
	}

	public set sourcesPathNormalizer( normalizer: SourcesPathNormalizer ) {
		this.#options.sourcesPathNormalizer = normalizer;
	}
}

export interface UserOptions {
  /**
   * Specifies whether the plugin is enabled.
   *
   * @default true
   */
  enabled?: boolean;

	/**
   * Specifies the output format of the report.
   *
   * @default 'html'
   */
	format?: Format;

	/**
	 * Specifies the name of the directory where the report will be saved.
	 *
	 * @default '.sonda'
	 */
	outputDir?: string;

	/**
	 * Specifies whether to automatically open the report in the default program for
	 * the given file extension (`.html` or `.json`, depending on the `format` option)
	 * after the build process.
	 *
	 * @default false
	 */
	open?: boolean;

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
  deep?: boolean;

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
  sources?: boolean;

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
  gzip?: boolean;

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
  brotli?: boolean;

	/**
	 * Specifies whether to generate a report for the server build.
   *
   * This option is only available for meta-framework integrations.
	 *
	 * @default false
	 */
	server?: boolean;
}

export interface IntegrationOptions extends UserOptions {
	/**
	 * Specifies the integration used to generate the report.
	 */
	integration: Integration;

	/**
	 * Specifies the name of the file where the report will be saved.
	 *
	 * @default 'sonda'
	 */
	filename?: string;

	/**
	 * Normalizes the paths in source maps to a consistent format.
	 *
	 * @default null
	 */
	sourcesPathNormalizer?: SourcesPathNormalizer;
}

export type Format = 'html' | 'json';

export type Integration = 
	'angular' |
	'astro' |
	'esbuild' |
	'next' |
	'nuxt' |
	'rolldown' |
	'rollup' |
	'rspack' |
	'sveltekit' |
	'vite' |
	'webpack' |
	'unknown';
