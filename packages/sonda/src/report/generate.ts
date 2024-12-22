import { dirname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { generateHtmlReport, generateJsonReport } from './formats.js';
import type { PluginOptions, JsonReport } from '../types.js';
import { normalizeOptions } from '../utils.js';

export async function generateReportFromAssets(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	pluginOptions: Partial<PluginOptions>
): Promise<void> {
	const options = normalizeOptions( pluginOptions );
	const handler = options.format === 'html' ? saveHtml : saveJson;
	const report = handler( assets, inputs, options );
	const outputDirectory = dirname( options.filename );

	// Ensure the output directory exists
	if ( !existsSync( outputDirectory ) ) {
		mkdirSync( outputDirectory, { recursive: true } );
	}

	// Write the report to the file system
	writeFileSync( options.filename, report );

	if ( !options.open ) {
		return;
	}

	/**
	 * `open` is ESM-only package, so we need to import it
	 * dynamically to make it work in CommonJS environment.
	 */
	const { default: open } = await import( 'open' );

	// Open the report in the default program for the file extension
	open( options.filename );
}

function saveHtml(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: PluginOptions
): string {
	return generateHtmlReport( assets, inputs, options );
}

function saveJson(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: PluginOptions
): string {
	const report = generateJsonReport( assets, inputs, options );

	return JSON.stringify( report, null, 2 );
}
