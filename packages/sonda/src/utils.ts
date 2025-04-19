import { readdir, access } from 'fs/promises';
import { relative, win32, posix, extname, join } from 'path';
import type { SourceType } from './report.js';

export const extensions: Record<string, SourceType> = {
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
export function getTypeByName( name: string ): SourceType {
	return extensions[ extname( name ) ] ?? 'unknown';
}

/**
 * Sorts the keys of an object in alphabetical order.
 */
export function sortObjectKeys<T>(object: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries( object ).sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
  );
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
