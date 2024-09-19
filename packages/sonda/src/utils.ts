import { relative } from 'path';
import { exec } from 'child_process';
import upath from 'upath';

const normalizers: Array<[ RegExp, string ]> = /* #__PURE__ */ ( () => [
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	[ /^\0/, '' ],
] )();

const cwd = process.cwd();

export function normalizePath( path: string ): string {
	const normalized = normalizers.reduce(
		( p, [ pattern, replace ] ) => p.replace( pattern, replace ),
		upath.normalizeSafe( path )
	);

	return relative( cwd, normalized );
}

function getCommandLine() {
	switch ( process.platform ) {
		case 'darwin': return 'open';
		case 'win32': return 'start';
		default: return 'xdg-open';
	}
}

export function open( path: string ): void {
	exec( getCommandLine() + ' ' + path )
}
