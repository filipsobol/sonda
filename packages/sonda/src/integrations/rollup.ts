import { extname, resolve, dirname } from 'path';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { Report } from '../report/report.js';
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

	const report = new Report( options );

	return {
		name: 'sonda-rollup',

		async resolveId( source: string, importer: string | undefined ) {
			if ( !importer ) {
				return;
			}

			const resolved = await this.resolve( source, importer, { skipSelf: true } );

			if ( resolved ) {
				report.edges.push( {
					source: normalizePath( importer ),
					target: normalizePath( resolved.id ),
					original: source
				} );
			}
		},

		moduleParsed( module: ModuleInfo ) {
			const name = normalizePath( module.id );

			report.resources.push( {
				kind: 'source',
				name,
				type: getTypeByName( name ),
				format: getModuleFormat( name, module ),
				uncompressed: module.code ? Buffer.byteLength( module.code ) : 0,
				parent: null
			} );
		},

		async writeBundle(
			{ dir, file }: NormalizedOutputOptions,
			bundle: OutputBundle
		) {
			const outputDir = resolve( process.cwd(), dir ?? dirname( file! ) );
			const assets: Array<[ string, Array<string> | undefined ]> = Object
				.entries( bundle )
				.filter( ( [ name ] ) => !name.endsWith( '.map' ) )
				.map( ( [ name, bundle ] ) => [
					resolve( outputDir, name ),
					bundle.type === 'chunk' && bundle.facadeModuleId ? [ bundle.facadeModuleId ] : undefined
				] );

			await report.generate( assets );
		}
	};
}

function getModuleFormat( name: string, module: ModuleInfo ): ModuleFormat {
	if ( getTypeByName( name ) !== 'script' ) {
		return 'other';
	}

	const ext = extname( module.id );

	return module.meta.commonjs?.isCommonJS === true || ext === '.cjs' || ext === '.cts'
		? 'cjs'
		: 'esm';
}
