import { version } from 'sonda/package.json' with { type: 'json' };
import open from 'tiny-open';
import { sortObjectKeys } from './utils.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { updateOutputs } from './processors/outputs.js';
import { updateInputs } from './processors/inputs.js';
import { updateDependencies } from './processors/dependencies.js';
import type { DecodedSourceMap } from '@ampproject/remapping';
import type { Formatter } from './formatters/Formatter.js';
import type { Config, Integration, Format } from './config.js';

const formatters: Record<Format, new ( config: Config ) => Formatter> = {
	'html': HtmlFormatter,
	'json': JsonFormatter
};

export class Report implements JsonReport {
	#config: Config;
	#metadata: Metadata;
	#inputs: Record<string, Input>;
	#outputs: Record<string, Output>;
	#dependencies: Record<string, Array<string>>;
	#issues: Array<Issue>;

	constructor( config: Config ) {
		this.#config = config;

		this.#metadata = {
			version,
			integration: config.integration,
			sources: config.sources,
			gzip: config.gzip,
			brotli: config.brotli
		};

		this.#inputs = {};
		this.#outputs = {};
		this.#dependencies = {};
		this.#issues = [];
	}

	addInput( name: string, input: Input ): void {
		this.#inputs[ name ] = input;
	}

	addOutput( name: string, output: Output ): void {
		this.#outputs[ name ] = output;
	}

	addDependency( name: string, path: string ): void {
		const paths = this.#dependencies[ name ] ??= [];

		if ( paths.includes( path ) ) {
			return;
		}

		paths.push( path );

		// If the dependency has more than one path, it's likely duplicated and bundled in multiple copies.
		// Only add the issue on the second path, to avoid duplicates, if there are more than two paths.
		if ( paths.length === 2 ) {
			this.#addIssue( {
				type: 'duplicate-dependency',
				data: { name }
			} );
		}
	}

	#addIssue( issue: Issue ): void {
		this.#issues.push( issue );
	}

	get config(): Config {
		return this.#config;
	}

	get metadata(): Metadata {
		return this.#metadata;
	}

	get inputs(): Record<string, Input> {
		return this.#inputs;
	}

	get outputs(): Record<string, Output> {
		return this.#outputs;
	}

	get dependencies(): Record<string, Array<string>> {
		return this.#dependencies;
	}

	get issues(): Array<Issue> {
		return this.#issues;
	}

	getInput( name: string ): Input | undefined {
		return this.#inputs[ name ];
	}

	getOutput( name: string ): Output | undefined {
		return this.#outputs[ name ];
	}

	removeInput( name: string ): void {
		delete this.#inputs[ name ];
	}

	async generate( assets: Array<string> ): Promise<void> {
		await updateOutputs( this, assets );
		updateInputs( this );
		updateDependencies( this );

		const config = this.#config;
		const formatter = new formatters[ config.format ]( config );
		const path = await formatter.write( this.#getData() );

		if ( config.open ) {
			await open( path );
		}
	}

	#getData(): JsonReport {
		return {
			metadata: this.#metadata,
			inputs: sortObjectKeys( this.#inputs ),
			outputs: sortObjectKeys( this.#outputs ),
			dependencies: sortObjectKeys( this.#dependencies ),
			issues: this.#issues
		};
	}
}

export interface JsonReport {
	/**
	 * Metadata about the report, including the version of Sonda used to generate it,
	 * the integration used, and the options passed to Sonda.
	 */
	metadata: Metadata;

	/**
	 * List of all source input files.
	 */
	inputs: Record<string, Input>;

	/**
	 * List of all generated output files.
	 */
	outputs: Record<string, Output>;

	/**
	 * List of all detected external dependencies and their paths. If
	 * a dependency has more than one path, it's likely duplicated and
	 * bundled in multiple copies.
	 */
	dependencies: Record<string, Array<string>>;

	/**
	 * List of issues detected in the outputs.
	 */
	issues: Array<Issue>;
}

export interface Metadata {
	version: string;
	integration: Integration;
	sources: boolean;
	gzip: boolean;
	brotli: boolean;
}

export interface Input {
	bytes: number;
	type: SourceType;
	format: ModuleFormat;
	imports?: Array<string>;
	belongsTo?: string | null;
}

export interface Output extends Sizes {
	type: SourceType;
	inputs?: Record<string, OutputInput>;
	map?: DecodedSourceMap;
}

export interface OutputInput extends Sizes {}

export interface Sizes {
	uncompressed: number;
	gzip: number;
	brotli: number;
};

export type Issue = IssueDuplicateDependency;

export interface BaseIssue {
	type: string;
	data: unknown;
}

export interface IssueDuplicateDependency extends BaseIssue {
	type: 'duplicate-dependency';
	data: {
		name: string;
	};
}

export type SourceType =
	'component' |
	'font' |
	'image' |
	'script' |
	'style' |
	'other';

export type ModuleFormat =
	'esm' |
	'cjs' |
	'unknown' |
	'other';
