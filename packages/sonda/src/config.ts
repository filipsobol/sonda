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
			include: null,
			exclude: null,
			format: 'html',
			filename: 'sonda_[index]',
			outputDir: '.sonda',
			open: true,
			deep: false,
			sources: false,
			gzip: false,
			brotli: false,
			server: false,
			sourcesPathNormalizer: null
		}, defaults, options );
	}

	public clone(): Config {
		return new Config( {}, structuredClone( this.#options ) );
	}

	public get enabled(): boolean {
		return this.#options.enabled;
	}

	public get include(): AssetFilter {
		return this.#options.include;
	}

	public get exclude(): AssetFilter {
		return this.#options.exclude;
	}

	public get format(): Array<Format> {
		return Array.isArray( this.#options.format ) ? this.#options.format : [ this.#options.format ];
	}

	public get filename(): string {
		return this.#options.filename;
	}

	public get outputDir(): string {
		return this.#options.outputDir;
	}

	public get open(): boolean | Format {
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
	 * Specifies a list of RegExp patterns used to match output assets to include in the report.
	 * By default, all assets are included.
	 *
	 * Patterns are matched against the relative asset paths as displayed in the report. For example,
	 * to include only JavaScript files, use `[ /\.js$/ ]`.
	 *
	 * @default null
	 */
	include?: AssetFilter;

	/**
	 * Specifies a list of RegExp patterns used to match output assets to exclude from the report.
	 * By default, no assets are excluded, except for those with `.map` and `.d.ts` extensions, which
	 * are always excluded regardless of this setting.
	 *
	 * This option takes precedence over `include`.
	 *
	 * Patterns are matched against the relative asset paths as shown in the report. For example, to exclude all CSS files, use `[ /\.css$/ ]`.
	 *
	 * @default null
	 */
	exclude?: AssetFilter;

	/**
   * Specifies the output format of the report. Supported formats include:
	 *
	 * - `'html'` - An HTML file with a treemap visualization.
	 * - `'json'` - A JSON file.
   *
   * @default 'html'
   */
	format?: Format | Array<Format>;

	/**
   * Specifies the filename of the generated report. If this value is an absolute path,
	 * it overrides the `outputDir` option.
   *
   * The default value includes placeholders like `[index]` and `[env]`, which are replaced
   * during report generation.
   *
   * The `[index]` placeholder is replaced with a version number that increments each time
   * a new report is generated. This allows you to keep multiple revisions of the report without
   * overwriting previous ones. If you want to generate only a single report and always overwrite
	 * the previous one, you can set this option to a static value, such as `'sonda'`.
   *
   * Additionally, framework integrations that can generate reports for both the client and server
   * (with the `server` option) will include the `[env]` placeholder in the filename. This is replaced with
   * the environment name (e.g., `client`, `server`), allowing you to distinguish between client and server reports.
   *
   * @default `'sonda_[index]'` for bundler integrations and `'sonda_[env]_[index]'` for framework integrations.
   */
  filename?: string;

	/**
	 * Specifies the directory where the report will be saved. This can be a relative or absolute path. By default,
	 * the report is saved in a `.sonda` directory relative to the current working directory.
	 *
	 * The directory is created if it does not exist.
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
	open?: boolean | Format;

	/**
   * Specifies whether to read source maps of imported modules.
	 *
	 * By default, external dependencies bundled into a single file appear as a single asset. When this option
	 * is enabled, the report includes the source files of imported modules, if their source maps are available.
	 *
	 * Enabling this option may increase report generation time and reduce the accuracy of estimated GZIP
	 * and Brotli sizes.
   *
   * @default false
   */
  deep?: boolean;

	/**
   * Specifies whether to include source maps of generated assets in the report to visualize which parts of
	 * the code contribute to the final asset size.
   *
   * ⚠️
	 * This option significantly increases the report size and embeds the **source code** of the assets.
	 * If you are working with proprietary code, ensure you share the report responsibly.
	 * ⚠️
   *
   * @default false
   */
  sources?: boolean;

	/**
   * Specifies whether to calculate asset sizes after compression with GZIP.
   *
   * The report also includes estimated compressed sizes for each file within an asset. These estimates are
	 * approximate and intended for general reference.
   *
   * Enabling this option may increase report generation time.
   *
   * @default false
   */
  gzip?: boolean;

  /**
   * Specifies whether to calculate asset sizes after compression with Brotli.
   *
   * The report also includes estimated compressed sizes for each file within an asset. These estimates are
	 * approximate and intended for general reference.
   *
   * Enabling this option may increase report generation time.
   *
   * @default false
   */
  brotli?: boolean;

	/**
	 * Specifies whether to generate a report for the server build.
   *
   * This option is only available for framework integrations.
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
	 * Normalizes the paths in source maps to a consistent format.
	 *
	 * @default null
	 */
	sourcesPathNormalizer?: SourcesPathNormalizer;
}

/**
 * Filter for including or excluding assets based on their paths.
 */
export type AssetFilter = Array<RegExp> | null;

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
