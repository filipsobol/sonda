import { resolve } from 'path';
import {
	Config,
	Report,
	getTypeByName,
	type UserOptions
} from '../index.js';
import type { Metafile, Plugin } from 'esbuild';

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

			build.onEnd( result => processEsbuildBuild( result.metafile!, options ) );
		}
	};
}

export async function processEsbuildBuild(
	metafile: Metafile,
	options: Config
): Promise<void> {
	const report = new Report( options );
	const cwd = process.cwd();

	for ( const [ path, data ] of Object.entries( metafile.inputs ) ) {
		report.addInput( path, {
			bytes: data.bytes,
			type: getTypeByName( path ),
			format: data.format ?? 'unknown',
			imports: data.imports.map( data => data.path ).filter( path => !path.startsWith( 'data:' ) ),
			belongsTo: null,
		} );
	};

	await report.generate(
		Object.keys( metafile!.outputs ).map( path => resolve( cwd, path ) )
	);
}
