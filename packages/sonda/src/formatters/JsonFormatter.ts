import { Formatter } from './Formatter';
import type { JsonReport } from '../report';

export class JsonFormatter extends Formatter {
	protected extension = '.json';

	public parse( data: JsonReport ): string {
		return JSON.stringify( data, null, 2 );
	}
}
