import { join } from 'path';
import { writeFileSync } from 'fs';
import { open } from '../utils.js';
import { generateHtmlReport, generateJsonReport } from '../report.js';
import type { Options, JsonReport } from '../types.js';

export function generateReportFromAssets(
	assets: string[],
	inputs: JsonReport[ 'inputs' ],
	options: Options
): void {
	const handler = options.format === 'html'
		? saveHtml
		: saveJson;

	const path = handler( assets, inputs );

	options.open && path && open( path );
}

function saveHtml(
	assets: string[],
	inputs: JsonReport[ 'inputs' ]
): string | null {
	const report = generateHtmlReport( assets, inputs );
	const path = join( process.cwd(), 'sonda-report.html' );

	writeFileSync( path, report );

	return path;
}

function saveJson(
	assets: string[],
	inputs: JsonReport[ 'inputs' ]
): string | null {
	const report = generateJsonReport( assets, inputs );
	const path = join( process.cwd(), 'sonda-report.json' );

	writeFileSync( path, JSON.stringify( report, null, 2 ) );

	return path;
}
