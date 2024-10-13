import { join } from 'path';
import { writeFileSync } from 'fs';
import { generateHtmlReport, generateJsonReport } from '../report.js';
import type { Options, JsonReport } from '../types.js';
import { normalizeOptions } from '../utils.js';

export async function generateReportFromAssets(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	userOptions: Partial<Options>
): Promise<void> {
	const options = normalizeOptions( userOptions );
	const handler = options.format === 'html' ? saveHtml : saveJson;
	const path = handler( assets, inputs, options );

	if ( !options.open || !path ) {
		return;
	}

	/**
	 * `open` is ESM-only package, so we need to import it
	 * dynamically to make it work in CommonJS environment.
	 */
	const { default: open } = await import( 'open' );

	open( path );
}

function saveHtml(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: Options
): string | null {
	const report = generateHtmlReport( assets, inputs, options );
	const path = join( process.cwd(), 'sonda-report.html' );

	writeFileSync( path, report );

	return path;
}

function saveJson(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: Options
): string | null {
	const report = generateJsonReport( assets, inputs, options );
	const path = join( process.cwd(), 'sonda-report.json' );

	writeFileSync( path, JSON.stringify( report, null, 2 ) );

	return path;
}
