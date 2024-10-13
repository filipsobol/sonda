import path from 'path';
import type { Options } from './types';

export function normalizeOptions( options?: Partial<Options> ) {
	const defaultOptions: Options = {
		open: true,
		format: 'html',
		detailed: false,
		gzip: false,
		brotli: false,
	};

	return Object.assign( {}, defaultOptions, options ) as Options;
}

export function normalizePath( pathToNormalize: string ): string {
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	const normalized = pathToNormalize.replace( /^\0/, '' )

	// Transform absolute paths to relative paths
	const relativized = path.relative( process.cwd(), normalized );

	// Ensure paths are POSIX-compliant - https://stackoverflow.com/a/63251716/4617687
	return relativized.replaceAll( path.win32.sep, path.posix.sep );
}
