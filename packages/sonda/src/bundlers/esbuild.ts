import { normalizeOptions } from '../utils';
import { generateReportFromAssets } from '../report/generate';
import type { Plugin } from 'esbuild';
import type { Options, JsonReport } from '../types';

export function SondaEsbuildPlugin( options?: Partial<Options> ): Plugin {
	return {
		name: 'sonda',
		setup( build ) {
			build.initialOptions.metafile = true;

			build.onEnd( result => {
				if ( !result.metafile ) {
					return console.error( 'Metafile is required for SondaEsbuildPlugin to work.' );
				}

				const inputs = Object
					.entries( result.metafile.inputs )
					.reduce( ( acc, [ path, data ] ) => {
						
						acc[ path ] = {
							bytes: data.bytes,
							format: data.format ?? 'unknown',
							imports: data.imports.map( data => data.path ),
							belongsTo: null,
						};

						return acc;
					}, {} as JsonReport[ 'inputs' ] );

				return generateReportFromAssets(
					Object.keys( result.metafile.outputs ),
					inputs,
					normalizeOptions( options )
				);
			} );
		}
	};
}
