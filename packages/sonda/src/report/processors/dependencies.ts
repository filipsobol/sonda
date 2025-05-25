import type { Report } from '../report.js';
import type { Dependency } from '../types.js';

const packageNameRegExp = /(.*)(?:.*node_modules\/)(@[^\/]+\/[^\/]+|[^\/]+)/;

/**
 * Finds all external dependencies based on the filesystem resources
 * and adds them to the report with their paths.
 */
export function updateDependencies( report: Report ): Array<Dependency> {
	const dependencies: Record<string, Array<string>> = {};

	report.resources
		.map( file => packageNameRegExp.exec( file.name ) )
		.filter( match => match !== null )
		.forEach( ( [ path, , name ] ) => {
			const paths = dependencies[ name ] ??= [];

			if ( !paths.includes( path ) ) {
				paths.push( path );
			}
		} );
	
	return Object
		.entries( dependencies )
		.map( ( [ name, paths ] ) => ( { name, paths } ) );
}
