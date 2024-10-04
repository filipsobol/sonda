import { join } from 'path';
import { writeFileSync } from 'fs';
import { generateHtmlReport, generateJsonReport } from '../report.js';
import type { Options, JsonReport } from '../types.js';

export async function generateReportFromAssets(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: Options
): Promise<void> {
	const { default: open } = await import( 'open' );

	const handler = options.format === 'html'
		? saveHtml
		: saveJson;

	const path = handler( assets, inputs, options );

	options.open && path && open( path );
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
