import { resolve, dirname, extname } from 'path';
import {
	generateReport,
	normalizePath,
	getTypeByName,
	Config,
	type JsonReport,
	type ModuleFormat,
	type UserOptions
} from '../index.js';
import type { Plugin, ModuleInfo, NormalizedOutputOptions } from 'rollup';

export default function SondaRollupPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'rollup'
	} );

	if ( !options.enabled ) {
		return { name: 'sonda-rollup' };
	}

	let inputs: JsonReport[ 'inputs' ] = {};

	return {
		name: 'sonda-rollup',
		moduleParsed( module: ModuleInfo ) {
			inputs[ normalizePath( module.id ) ] = {
				bytes: module.code ? Buffer.byteLength( module.code ) : 0,
				type: getTypeByName( module.id ),
				format: getFormat( module ),
				imports: module.importedIds.map( id => normalizePath( id ) ),
				belongsTo: null,
			};
		},
		async writeBundle( { dir, file }: NormalizedOutputOptions ) {
			await generateReport(
				resolve( process.cwd(), dir ?? dirname( file! ) ),
				options,
				inputs
			);
		}
	};
}

function getFormat( module: ModuleInfo ): ModuleFormat {
	const ext = extname( module.id );

	if ( module.meta.commonjs?.isCommonJS === true || ext === '.cjs' || ext === '.cts' ) {
		return 'cjs';
	}

	if ( module.meta.commonjs?.isCommonJS === false || ext === '.mjs' || ext === '.mts' ) {
		return 'esm';
	}

	return'unknown';
}
