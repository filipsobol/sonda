import { normalizePath } from './utils'; 
import type { Plugin } from 'rollup';
import type { ModuleFormat, JsonReport } from 'sonar';

export function rollupHandler( inputs: JsonReport[ 'inputs' ] ): Partial<Plugin> {
	const esmRegex = /\.m[tj]sx?$/;
	const cjsRegex = /\.c[tj]sx?$/;

	function guessFormat( file: string ): 'esm' | 'cjs' | undefined {
		if ( esmRegex.test( file ) ) {
			return 'esm';
		}

		if ( cjsRegex.test( file ) ) {
			return 'cjs';
		}

		return;
	}

	const formats = new Map<true | false | undefined, ModuleFormat>( [
		[ true, 'cjs' ],
		[ false, 'esm' ],
	] );

	return {
		moduleParsed( module ) {
			const input = inputs[ normalizePath( module.id ) ] ??= {
				bytes: 0,
				format: 'unknown',
				imports: [],
				belongsTo: null,
			};

			input.bytes = module.code ? Buffer.byteLength( module.code ) : 0;
			input.format = formats.get( module.meta.commonjs?.isCommonJS ) ?? guessFormat( module.id ) ?? 'unknown';
			input.imports = module.importedIds.map( id => normalizePath( id ) );
		}
	};
}
