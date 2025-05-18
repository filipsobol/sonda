import { join, resolve } from 'path';
import { Config, type UserOptions } from '../config.js';
import { getTypeByName, normalizePath } from '../utils.js';
import { UNASSIGNED } from '../sourcemap/bytes.js';
import { Report } from '../report/report.js';
import type { Compiler, Module } from 'webpack';
import type { ModuleFormat } from '../report/types.js';

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
			for ( const mod of compilation.modules ) {
				const name = mod.nameForCondition();

				if ( !name || name.startsWith( 'data:' ) ) {
					continue;
				}

				// ConcatenatedModule is a special case in Webpack where multiple modules are combined into one.
				// We only want to get the module that is the entry point for the concatenated module.
				const module = ( mod as any).modules?.find( ( module: Module ) => module.nameForCondition() === name ) || mod;
				const normalized = normalizePath( name );

				report.resources.push( {
					kind: 'source',
					name: normalized,
					type: getTypeByName( normalized ),
					format: getFormat( normalized, module ),
					uncompressed: module.size(),
					parent: null
				} );

				Array
					// Get all the connections from the current module
					.from( compilation.moduleGraph.getOutgoingConnections( module ) )

					// Get the module name for each connection
					.map( connection => ( {
						target: connection.module?.nameForCondition(),
						original: (connection.dependency as any)?.request
					} ) )

					// Filter out connections without a name, or that are the same as the current module, or that are data URLs
					.filter( ( { target } ) => {
						return !!target
							&& target !== name
							&& !target.startsWith( 'data:' )
					} )

					// Normalize module path
					.map( ( { target, original } ) => ( {
						target: normalizePath( target! ),
						original
					} ) )

					// Remove duplicates
					.filter( ( { target }, index, self ) => self.findIndex( c => c.target === target ) === index )

					// Add connection to the report
					.forEach( ( { target, original } ) => report.edges.push( { source: normalized, target, original } ) );
			}
			const assets = Object
				.keys( compilation.assets )
				.filter( name => !name.endsWith( '.map' ) )
				.map( name => {
					const path = join( compilation.outputOptions.path!, name );
					let entry: Array<string> | undefined = undefined;

					for ( const chunk of compilation.chunks ) {
						if ( !chunk.files.has( name ) ) {
							continue;
						}

						entry = Array
							.from( compilation.chunkGraph.getChunkEntryModulesIterable( chunk ) )
							.map( module => module.nameForCondition()! );
					}
					
					
					return [ path, entry ] as [ string, Array<string> | undefined ];
				} );

			this.options.sourcesPathNormalizer = ( path: string ) => {
				if ( !path.startsWith( 'webpack://' ) ) {
					return resolve( process.cwd(), path );
				}

				const [ , filePath ] = path.match( sourceMapFilenameRegex )!;

				return filePath
					? resolve( process.cwd(), filePath )
					: UNASSIGNED;
			}

			await report.generate( assets );
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
