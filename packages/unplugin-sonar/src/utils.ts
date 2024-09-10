import { exec } from 'child_process';

const normalizers: Array<[ RegExp, string ]> = /* #__PURE__ */ ( () => [
	// Unicode escape sequences used by Rollup and Vite to identify virtual modules
	[ /^\0/, '' ],
] )();

export function normalizePath( path: string ): string {
	return normalizers.reduce( ( p, [ pattern, replace ] ) => p.replace( pattern, replace ), path );
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
