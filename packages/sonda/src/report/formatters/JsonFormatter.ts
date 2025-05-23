import { Formatter } from './Formatter.js';
import type { JsonReport } from '../types.js';

export class JsonFormatter extends Formatter {
	protected extension = '.json';

	public parse( data: JsonReport ): string {
		return JSON.stringify( data, null, 2 );
	}
}
