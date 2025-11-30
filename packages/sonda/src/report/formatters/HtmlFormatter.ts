import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import { gzipSync } from 'zlib';
import { readFile } from 'fs/promises';
import { Formatter } from './Formatter.js';
import type { JsonReport } from '../types.js';

export class HtmlFormatter extends Formatter {
	protected extension = '.html';

	public async parse( data: JsonReport ): Promise<string> {
		const template = await readFile(
			resolve( dirname( fileURLToPath( import.meta.resolve( 'sonda' ) ) ), './index.html' ),
			'utf-8'
		);

		return template.replace(
			'__REPORT_DATA__',
			gzipSync( JSON.stringify( data ) ).toString('base64')
		);
	}
}
