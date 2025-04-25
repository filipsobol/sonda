import { resolve, dirname, extname } from 'path';
import {
	Config,
	Report,
	getTypeByName,
	normalizePath,
	type ModuleFormat,
	type UserOptions
} from '../index.js';
import type { Plugin, ModuleInfo, NormalizedOutputOptions, OutputBundle } from 'rollup';

export default function SondaRollupPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'rollup'
	} );

	if ( !options.enabled ) {
		return { name: 'sonda-rollup' };
	}

	const report = new Report( options );

	return {
		name: 'sonda-rollup',

		moduleParsed( module: ModuleInfo ) {
			const name = normalizePath( module.id );

			report.addInput( name, {
				bytes: module.code ? Buffer.byteLength( module.code ) : 0,
				type: getTypeByName( module.id ),
				format: getFormat( name, module ),
				imports: module.importedIds.map( id => normalizePath( id ) ),
				belongsTo: null,
			} );
		},

		async writeBundle(
			{ dir, file }: NormalizedOutputOptions,
			bundle: OutputBundle
		) {
			const outputDir = resolve( process.cwd(), dir ?? dirname( file! ) );
			const assets = Object
				.keys( bundle )
				.map( name => resolve( outputDir, name ) )
				.filter( name => !name.endsWith( '.map' ) );

			await report.generate( assets );
		}
	};
}

function getFormat( name: string, module: ModuleInfo ): ModuleFormat {
	if ( getTypeByName( name ) !== 'script' ) {
		return 'unknown';
	}

	const ext = extname( module.id );

	if ( module.meta.commonjs?.isCommonJS === true || ext === '.cjs' || ext === '.cts' ) {
		return 'cjs';
	}

	return'esm';
}
