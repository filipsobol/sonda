import { styleText } from 'util';
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
		return { name: 'sonda/rollup' };
	}

	const report = new Report( options );

	return {
		name: 'sonda/rollup',

		async resolveId( source: string, importer: string | undefined, options ) {
			if ( !importer ) {
				return;
			}

			const resolved = await this.resolve(
				source,
				importer,
				{ ...options, skipSelf: true }
			);

			if ( resolved ) {
				report.addConnection( {
					kind: 'import',
					source: normalizePath( importer ),
					target: normalizePath( resolved.id ),
					original: source
				} );
			}

			return resolved;
		},

		moduleParsed( module: ModuleInfo ) {
			const name = normalizePath( module.id );

			report.addResource( {
				kind: 'filesystem',
				name,
				type: getTypeByName( name ),
				format: getModuleFormat( name, module ),
				uncompressed: module.code ? Buffer.byteLength( module.code ) : 0
			} );
		},

		async writeBundle(
			{ dir, file }: NormalizedOutputOptions,
			bundle: OutputBundle
		) {
			const outputDir = resolve( process.cwd(), dir ?? dirname( file! ) );

			for ( const [ path, asset ] of Object.entries( bundle ) ) {
				report.addAsset(
					resolve( outputDir, path ),
					asset.type === 'chunk' && asset.facadeModuleId ? [ asset.facadeModuleId ] : undefined
				)
			}

			const reportPath = await report.generate();

			this.info( styleText( 'green', `📝 Sonda report generated: ${ reportPath }` ) );
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
