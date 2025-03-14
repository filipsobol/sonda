import { resolve } from 'path';
import { generateReportFromAssets, addSourcesToInputs } from '../index.js';
import type { Metafile, Plugin } from 'esbuild';
import type { JsonReport, UserOptions } from '../types.js';

export default function SondaEsbuildPlugin( options: Partial<UserOptions> = {} ): Plugin {
	return {
		name: 'sonda',
		setup( build ) {
			if ( options.enabled === false ) {
				return;
			}

			build.initialOptions.metafile = true;

			// Esbuild already reads the existing source maps, so there's no need to do it again
			options.detailed = false;

			build.onEnd( result => processEsbuildMetaFile( result.metafile!, options ) );
		}
	};
}

export function processEsbuildMetaFile( metafile: Metafile, options: Partial<UserOptions> ): void {
	const cwd = process.cwd();
	const inputs = Object
		.entries( metafile.inputs )
		.reduce( ( acc, [ path, data ] ) => {
			acc[ path ] = {
				bytes: data.bytes,
				format: data.format ?? 'unknown',
				imports: data.imports.map( data => data.path ),
				belongsTo: null,
			};

			/**
			 * Because esbuild already reads the existing source maps, there may be
			 * cases where some report "outputs" include "inputs" that don't exist
			 * in the main "inputs" object. To avoid this, we parse each esbuild
			 * input and add its sources to the "inputs" object.
			 */
			addSourcesToInputs(
				resolve( cwd, path ),
				acc
			);

			return acc;
		}, {} as JsonReport[ 'inputs' ] );

	generateReportFromAssets(
		Object.keys( metafile!.outputs ).map( path => resolve( cwd, path ) ),
		inputs,
		options
	);
}
