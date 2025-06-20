import { styleText } from 'util';
import { join, resolve } from 'path';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { Report } from '../report/report.js';
import { UNASSIGNED } from '../report/processors/sourcemap.js';
import type { Compiler, Module, ModuleGraphConnection } from 'webpack';
import type { ModuleFormat, ConnectionKind } from '../report/types.js';

export class SondaWebpackPlugin {
  options: Config;

  constructor( userOptions: UserOptions = {} ) {
    this.options = new Config( userOptions, {
      integration: 'webpack'
    } );
  }

  apply( compiler: Compiler ): void {
    if ( !this.options.enabled ) {
      return;
    }

    const report = new Report( this.options );

    const namespace = compiler.options.output.devtoolNamespace
			|| compiler.options.output.library?.name
			|| '[^/]+/';

		/**
		 * Regex that matches the default Webpack source map filename format
		 * (https://webpack.js.org/configuration/output/#outputdevtoolmodulefilenametemplate).
		 *
		 * Examples:
		 *  - webpack://[namespace]/[path]?[loaders]
		 *  - webpack://[namespace]?[loaders]
		 *  - [namespace]/[path]?[loaders]
		 *  - [path]?[loaders]
		 *  - All of the above without `?[loaders]`
		 *
		 * While it doesn't cover all possible cases, it should be enough for now.
		 *
		 * Regex explanation:
		 * - (?:webpack://)? - Non-capturing group that matches the optional "webpack://" prefix
		 * - (?:${ namespace })? - Non-capturing group that matches the optional namespace
		 * - ([^?]*) - Matches the path, which is everything up to the first "?" (if present)
		 */
    const sourceMapFilenameRegex = new RegExp( `(?:webpack://)?(?:${ namespace })?([^?]*)` );

    compiler.hooks.afterEmit.tapPromise( 'SondaWebpackPlugin', async compilation => {
			// Add resources and connections to the report
			for ( const mod of compilation.modules ) {
				const name = mod.nameForCondition();

				if ( !name ) {
					continue;
				}

				// ConcatenatedModule is a special case in Webpack where multiple modules are combined into one.
				// We only want to get the module that is the entry point for the concatenated module.
				const module = ( mod as any).modules?.find( ( module: Module ) => module.nameForCondition() === name ) || mod;
				const normalizedName = normalizePath( name );

				report.addResource( {
					kind: 'filesystem',
					name: normalizedName,
					type: getTypeByName( normalizedName ),
					format: getFormat( normalizedName, module ),
					uncompressed: module.size()
				} );

				Array
					// Get all the connections from the current module
					.from( compilation.moduleGraph.getOutgoingConnections( module ) )

					// Filter out connections without a name, or that are the same as the current module
					.filter( connection => {
						const target = connection.module?.nameForCondition();

						return !!target && target !== name;
					} )

					// Get the module name for each connection
					.map( connection => ( {
						kind: connectionKindMapper( connection ),
						target: normalizePath( connection.module?.nameForCondition()! ),
						original: (connection.dependency as any)?.request
					} ) )

					// Add connection to the report
					.forEach( ( { kind, target, original } ) => report.addConnection( {
						kind,
						source: normalizedName,
						target,
						original
					} ) );
			}

			// Add assets to the report
			for ( const name of Object.keys( compilation.assets ) ) {
				let entry: Array<string> | undefined = undefined;

				for ( const chunk of compilation.chunks ) {
					if ( !chunk.files.has( name ) ) {
						continue;
					}

					entry = Array
						.from( compilation.chunkGraph.getChunkEntryModulesIterable( chunk ) )
						.map( module => module.nameForCondition()! );
				}

				report.addAsset(
					join( compilation.outputOptions.path!, name ),
					entry
				)
			}

			// Register a custom sourcemap path normalizer to handle webpack specific paths.
			this.options.sourcesPathNormalizer = ( path: string ) => {
				if ( !path.startsWith( 'webpack://' ) ) {
					return resolve( process.cwd(), path );
				}

				const [ , filePath ] = path.match( sourceMapFilenameRegex )!;

				return filePath
					? resolve( process.cwd(), filePath )
					: UNASSIGNED;
			}

			const reportPath = await report.generate();

			compilation
				.getLogger('SondaWebpackPlugin')
				.info( styleText( 'green', `📝 Sonda report generated: ${ reportPath }` ) );
		} );
  }
}

function getFormat( name: string, module: Module ): ModuleFormat {
	if ( getTypeByName( name ) !== 'script' ) {
    return 'other';
  }

	return module.type === 'javascript/esm'
		? 'esm'
		: 'cjs';
}

/**
 * Maps esbuild's ImportKind to Sonda's ConnectionKind.
 */
function connectionKindMapper( connection: ModuleGraphConnection ): ConnectionKind {
	if ( !connection.dependency ) {
		return 'import';
	}

	const { category, type } = connection.dependency;

	if ( category === 'esm' && type === 'import()' ) {
		return 'dynamic-import';
	}

	if ( category === 'esm' || category === 'css-import' ) {
		return 'import';
	}

	if ( category === 'commonjs' ) {
		return 'require';
	}

	return 'import'
}
