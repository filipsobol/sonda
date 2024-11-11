import { join, relative, win32, posix, extname, isAbsolute, format, parse } from 'path';
import type { Options } from './types';

export const esmRegex: RegExp = /\.m[tj]sx?$/;
export const cjsRegex: RegExp = /\.c[tj]sx?$/;
export const jsRegexp: RegExp = /\.[cm]?[tj]s[x]?$/;

export function normalizeOptions( options?: Partial<Options> ): Options {
	const format = options?.format
		|| options?.filename?.split( '.' ).at( -1 ) as Options['format']
		|| 'html';

	const defaultOptions: Options = {
		format,
		filename: 'sonda-report.' + format,
		open: true,
		detailed: false,
		sources: false,
		gzip: false,
		brotli: false,
	};

	// Merge user options with the defaults
	const normalizedOptions = Object.assign( {}, defaultOptions, options ) satisfies Options;

	normalizedOptions.filename = normalizeOutputPath( normalizedOptions );

	return normalizedOptions;
}

export function normalizePath( pathToNormalize: string ): string {
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	const normalized = pathToNormalize.replace( /^\0/, '' )

	// Transform absolute paths to relative paths
	const relativized = relative( process.cwd(), normalized );

	// Ensure paths are POSIX-compliant - https://stackoverflow.com/a/63251716/4617687
	return relativized.replaceAll( win32.sep, posix.sep );
}

function normalizeOutputPath( options: Options ): string {
	let path = options.filename;
	const expectedExtension = '.' + options.format;

	// Ensure the filename is an absolute path
	if ( !isAbsolute( path ) ) {
		path = join( process.cwd(), path );
	}

	// Ensure that the `filename` extension matches the `format` option
	if ( expectedExtension !== extname( path ) ) {
		console.warn(
			'\x1b[0;33m' + // Make the message yellow
			`Sonda: The file extension specified in the 'filename' does not match the 'format' option. ` +
			`The extension will be changed to '${ expectedExtension }'.`
		);

		path = format( { ...parse( path ), base: '', ext: expectedExtension } )
	}

	return path;
}
