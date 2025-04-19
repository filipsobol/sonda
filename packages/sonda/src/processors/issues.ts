import type { JsonReport, IssueDuplicateDependency } from '../report.js';

/**
 * Find issues with the bundles.
 */
export function getIssues( report: JsonReport ): JsonReport['issues'] {
	return [
		...getDuplicateDependencies( report )
	];
}

function getDuplicateDependencies( report: JsonReport ): Array<IssueDuplicateDependency> {
	return Object
		.entries( report.dependencies )
		.filter(  ( [ , paths ] ) => paths.length > 1 )
		.map( ( [ name ] ) => ( {
			type: 'duplicate-dependency',
			data: { name }
		} ) );
}
