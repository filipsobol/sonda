import open from 'tiny-open';
import { getMetadata } from './processors/metadata.js';
import { getInputs } from './processors/inputs.js';
import { getOutputs } from './processors/outputs.js';
import { getDependencies } from './processors/dependencies.js';
import { getIssues } from './processors/issues.js';
import { getAllFiles } from './utils.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import type { DecodedSourceMap } from '@ampproject/remapping';
import type { Config, Integration, Format } from './config.js';
import type { Formatter } from './formatters/Formatter.js';

const formatters: Record<Format, new ( config: Config ) => Formatter> = {
	'html': HtmlFormatter,
	'json': JsonFormatter
};

export async function generateReport(
	buildDir: string,
	config: Config,
	inputs: JsonReport[ 'inputs' ]
): Promise<void> {
	const assets = await getAllFiles( buildDir );

	const data: JsonReport = {
		metadata: getMetadata( config ),
		inputs: {},
		outputs: {},
		dependencies: {},
		issues: []
	};

	data.inputs = getInputs( inputs );
	data.outputs = await getOutputs( assets, inputs, config );
	data.dependencies = getDependencies( data );
	data.issues = getIssues( data );

	const formatter = new formatters[ config.format ]( config );

	const path = await formatter.write( data );

	if ( config.open ) {
		open( path );
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
