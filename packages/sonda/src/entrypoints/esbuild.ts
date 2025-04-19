import { dirname, resolve } from 'path';
import {
	generateReport,
	addSourcesToInputs,
	getTypeByName,
	Config,
	type UserOptions,
	type JsonReport
} from '../index.js';
import type { BuildOptions, Metafile, Plugin } from 'esbuild';

export default function SondaEsbuildPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'esbuild'
	} );

	return {
		name: 'sonda-esbuild',
		setup( build ) {
			if ( !options.enabled ) {
				return;
			}

			build.initialOptions.metafile = true;

			build.onEnd( async result => {
				await processEsbuildBuild(
					getBuildDir( build.initialOptions ),
					result.metafile!,
					options
				);
			} );
		}
	};
}

function getBuildDir( options: BuildOptions ): string {
	const workingDir = options.absWorkingDir || process.cwd();

	return options.outfile
		? dirname( resolve( workingDir, options.outfile ) )
		: resolve( workingDir, options.outdir! )
}

export function processEsbuildBuild(
	buildDir: string,
	metafile: Metafile,
	options: Config
): Promise<string> {
	const cwd = process.cwd();
	const inputs = Object
		.entries( metafile.inputs )
		.reduce( ( acc, [ path, data ] ) => {
			acc[ path ] = {
				bytes: data.bytes,
				type: getTypeByName( path ),
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

	return generateReport(
		buildDir,
		options,
		inputs
	);
}
