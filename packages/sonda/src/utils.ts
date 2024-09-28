import { relative, posix, sep } from 'path';
import { exec } from 'child_process';
import type { Options } from './types';

const cwd = /* #__ PURE__ */ process.cwd();

export function normalizeOptions( options?: Partial<Options> ) {
	const defaultOptions: Options = {
		open: true,
		format: 'html',
	};

	return Object.assign( {}, defaultOptions, options ) as Options;
}

export function normalizePath( path: string ): string {
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	const normalized = path.replace( /^\0/, '' )

	// Transform absolute paths to relative paths
	const relativized = relative( cwd, normalized );

	// Ensure paths are POSIX-compliant - https://stackoverflow.com/a/63251716/4617687
	return relativized.replaceAll( sep, posix.sep );
}

function getOpenCommand() {
	switch ( process.platform ) {
		case 'darwin': return 'open';
		case 'win32': return 'start';
		default: return 'xdg-open';
	}
}

export function open( path: string ): void {
	exec( getOpenCommand() + ' ' + path )
}
