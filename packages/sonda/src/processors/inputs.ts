import { sortObjectKeys } from '../utils.js';
import type { JsonReport } from '../report.js';

export function getInputs( inputs: JsonReport[ 'inputs' ] ): JsonReport[ 'inputs' ] {
	return sortObjectKeys( inputs );
}
