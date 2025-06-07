import { readdir, access } from 'fs/promises';
import { relative, win32, posix, extname, join } from 'path';
import type { FileType } from './report/types.js';

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

export const ignoredExtensions: Array<string> = [
	'.map',
	'.d.ts',
];

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
			.filter( file => !ignoredExtensions.includes( extname( file.name ) ) )
			.map( file => join( relative( process.cwd(), file.parentPath ), file.name ) );
	} catch {
		// Directory does not exist or is inaccessible
		return [];
	}
}
