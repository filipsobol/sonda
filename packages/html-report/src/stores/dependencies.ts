const packageNameRegExp: RegExp = /(.*)(?:.*node_modules\/)(@[^\/]+\/[^\/]+|[^\/]+)/;

/**
 * Extract all unique package names and their paths.
 */
const dependencies: Map<string, Set<string>> = Object
	.keys( window.SONDA_JSON_REPORT.inputs )
	.map( input => packageNameRegExp.exec( input ) )
	.filter( match => match !== null )
	.reduce( ( carry, match ) => {
		const [ path, , packageName ] = match;

		if ( !carry.has( packageName ) ) {
			carry.set( packageName, new Set() );
		}

		carry.get( packageName )!.add( path );

		return carry;
	}, new Map<string, Set<string>>() );

/**
 * Contains all packages which have more than one unique path.
 */
export const duplicates: Map< string, Array<string>> = new Map(
	Array
		.from( dependencies )
		.filter( ( [ , paths ] ) => paths.size > 1 )
		.map( ( [ packageName, paths ] ) => [ packageName, Array.from( paths ) ] )
);
