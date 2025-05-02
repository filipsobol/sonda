import { readdir, access } from 'fs/promises';
import { relative, win32, posix, extname, join, resolve } from 'path';
import { loadCodeAndMap } from 'load-source-map';
import { default as remapping, type DecodedSourceMap, type EncodedSourceMap } from '@ampproject/remapping';
import type { FileType } from './report/producer.js';

export const extensions: Record<string, FileType> = {
	// Scripts
	'.js': 'script',
	'.jsx': 'script',
	'.mjs': 'script',
	'.cjs': 'script',
	'.ts': 'script',
	'.tsx': 'script',
	'.cts': 'script',
	'.mts': 'script',
	'.json': 'script',
	'.node': 'script',
	'.wasm': 'script',

	// Styles
	'.css': 'style',
	'.scss': 'style',
	'.sass': 'style',
	'.less': 'style',
	'.styl': 'style',
	'.pcss': 'style',
	'.postcss': 'style',

	// Fonts
	'.woff': 'font',
	'.woff2': 'font',
	'.ttf': 'font',
	'.otf': 'font',
	'.eot': 'font',

	// Images
	'.jpg': 'image',
	'.jpeg': 'image',
	'.png': 'image',
	'.gif': 'image',
	'.svg': 'image',
	'.webp': 'image',
	'.jxl': 'image',
	'.avif': 'image',
	'.ico': 'image',
	'.bmp': 'image',

	// Components
	'.vue': 'component',
	'.svelte': 'component',
	'.astro': 'component',
	'.marko': 'component',
	'.riot': 'component'
};

/**
 * Normalizes a given path by removing leading null characters and converting it to a relative POSIX path.
 */
export function normalizePath( pathToNormalize: string ): string {
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	const normalized = pathToNormalize.replace( /^\0/, '' )

	// Transform absolute paths to relative paths
	const relativized = relative( process.cwd(), normalized );

	// Ensure paths are POSIX-compliant - https://stackoverflow.com/a/63251716/4617687
	return relativized.replaceAll( win32.sep, posix.sep );
}

/**
 * Returns the type of a given file based on its name.
 */
export function getTypeByName( name: string ): FileType {
	return extensions[ extname( name ) ] ?? 'other';
}

/**
 * Returns only the object keys which have a string value.
 */
type StringKeys<T> = keyof {
  [P in keyof T as T[P] extends string ? P : never]: unknown
};

/**
 * Sort an array of objects by a specific key.
 */
export function sortByKey<
	T extends object,
	K extends StringKeys<T>
>( data: Array<T>, key: K ): Array<T> {
	return data.toSorted( ( a, b ) => ( a[ key ] as string ).localeCompare( b[ key ] as string ));
}

/**
 * Returns relative paths to all files in the given directory. The files are filtered to exclude source maps.
 */
export async function getAllFiles( dir: string, recursive = true ): Promise<string[]> {
	try {
		await access( dir );

		const files = await readdir( dir, {
			withFileTypes: true,
			recursive
		} );
	
		return files
			.filter( file => file.isFile() )
			.filter( file => extname( file.name ) !== '.map' )
			.map( file => join( relative( process.cwd(), file.parentPath ), file.name ) );
	} catch {
		// Directory does not exist or is inaccessible
		return [];
	}
}

/**
 * Parse the source map. If `options.deep` is set to `true`, it will
 * recursively load the source maps of the sources until it finds
 * the original source. Otherwise, it will only decode the source map.
 */
export function parseSourceMap(
	map: EncodedSourceMap,
	deep: boolean = false
): DecodedSourceMap {
	const alreadyRemapped = new Set<string>();

	return remapping( map, ( file, ctx ) => {
		if ( !deep || alreadyRemapped.has( file ) ) {
			return;
		}

		alreadyRemapped.add( file );

		// TODO: Update how path is resolved.
		// Replace `process.cwd()` with `dirPath`?
		const codeMap = loadCodeAndMap( resolve( process.cwd(), file ) );

		if ( !codeMap ) {
			return;
		}

		ctx.content ??= codeMap.code;

		return codeMap.map;
	}, { decodedMappings: true } ) as DecodedSourceMap;
}
