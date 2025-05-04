import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { Formatter } from './Formatter.js';
import type { JsonReport } from '../types.js';

export class HtmlFormatter extends Formatter {
	protected extension = '.html';

	public async parse( data: JsonReport ): Promise<string> {
		const template = await readFile(
			resolve( import.meta.dirname, './index.html' ),
			'utf-8'
		);

		return template.replace(
			'__REPORT_DATA__',
			encodeURIComponent( JSON.stringify( data ) )
		);
	}
}
