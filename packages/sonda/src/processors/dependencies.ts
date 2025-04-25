import type { Report } from '../report.js';

const packageNameRegExp = /(.*)(?:.*node_modules\/)(@[^\/]+\/[^\/]+|[^\/]+)/;

export function updateDependencies( report: Report ): void {
	for ( const input of Object.keys( report.inputs ) ) {
		const match = packageNameRegExp.exec( input );

		if ( match ) {
			report.addDependency( match[ 2 ], match[ 0 ] )
		}
	}
}
