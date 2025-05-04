import { extname, resolve, dirname } from 'path';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { ReportProducer } from '../report/producer.js';
import type {
	Plugin,
	ModuleInfo,
	OutputBundle,
	NormalizedOutputOptions
} from 'rollup';
import type { ModuleFormat } from '../report/types.js';

export function SondaRollupPlugin( userOptions: UserOptions = {} ): Plugin {
	const options = new Config( userOptions, {
		integration: 'rollup'
	} );

	if ( !options.enabled ) {
		return { name: 'sonda-rollup' };
	}

	const report = new ReportProducer( options );

	return {
		name: 'sonda-rollup',

		moduleParsed( module: ModuleInfo ) {
			const name = normalizePath( module.id );

			report.resources.push( {
				kind: 'source',
				name,
				type: getTypeByName( name ),
				format: getModuleFormat( name, module ),
				uncompressed: module.code ? Buffer.byteLength( module.code ) : 0
			} );

			module.importedIds.forEach( id => report.edges.push( {
				source: name,
				target: normalizePath( id )
			} ) );
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

function getModuleFormat( name: string, module: ModuleInfo ): ModuleFormat | null {
	if ( getTypeByName( name ) !== 'script' ) {
		return null;
	}

	const ext = extname( module.id );

	return module.meta.commonjs?.isCommonJS === true || ext === '.cjs' || ext === '.cts'
		? 'cjs'
		: 'esm';
}
