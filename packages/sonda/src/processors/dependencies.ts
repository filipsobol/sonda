import type { JsonReport } from '../report.js';

const packageNameRegExp = /(.*)(?:.*node_modules\/)(@[^\/]+\/[^\/]+|[^\/]+)/;

/**
 * Extract all unique package names and their paths.
 */
export function getDependencies( report: JsonReport ): JsonReport['dependencies'] {
	const dependencies: JsonReport['dependencies'] = {};

	for ( const input of Object.keys( report.inputs ) ) {
		const match = packageNameRegExp.exec( input );

		if ( match !== null ) {
			const [ path, , packageName ] = match;

			const dependency = dependencies[ packageName ] ??= [];

			if ( !dependency.includes( path ) ) {
				dependency.push( path );
			}
		}
	}

	return dependencies;
}
