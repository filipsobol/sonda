import { join, resolve } from 'path';
import {
	Config,
	Report,
	getTypeByName,
	normalizePath,
	type ModuleFormat,
	type UserOptions,
} from '../index.js';
import { UNASSIGNED } from '../sourcemap/bytes.js';
import type { Compiler, Module } from 'webpack';

export default class SondaWebpackPlugin {
	options: Config;

	constructor ( userOptions: UserOptions = {} ) {
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

		compiler.hooks.afterEmit.tapPromise( 'SondaWebpackPlugin', async ( compilation ) => {
			for ( const mod of compilation.modules ) {
				const name = mod.nameForCondition();

				if ( !name || name.startsWith( 'data:' ) ) {
					continue;
				}

				// ConcatenatedModule is a special case in Webpack where multiple modules are combined into one.
				// We only want to get the module that is the entry point for the concatenated module.
				const module = ( mod as any).modules?.find( ( module: Module ) => module.nameForCondition() === name ) || mod;
				
				const imports = Array
					// Get all the connections from the current module
					.from( compilation.moduleGraph.getOutgoingConnections( module ) )

					// Get the module name for each connection
					.map( connection => connection.module?.nameForCondition() )

					// Filter out connections without a name, or that are the same as the current module, or that are data URLs
					.filter( ( path ): path is string => {
						return !!path
							&& path !== name
							&& !path.startsWith( 'data:' )
					} )

					// Normalize module path
					.map( path => normalizePath( path ) )

					// Remove duplicates
					.filter( ( path, index, self ) => self.indexOf( path ) === index );
				
				report.addInput( normalizePath( name ), {
					bytes: module.size() || 0,
					type: getTypeByName( name ),
					format: getFormat( name, module ),
					imports,
					belongsTo: null
				} );
			}

			const assets = Object
				.keys( compilation.assets )
				.map( name => join( compilation.outputOptions.path!, name ) )
				.filter( name => !name.endsWith( '.map' ) );

			this.options.sourcesPathNormalizer = ( path: string ) => {
				if ( !path.startsWith( 'webpack://' ) ) {
					return resolve( process.cwd(), path );
				}

				const [ , filePath ] = path.match( sourceMapFilenameRegex )!;

				if ( filePath ) {
					return resolve( process.cwd(), filePath );
				}

				return UNASSIGNED;
			}

			await report.generate( assets );
		} );
	}
}

function getFormat( name: string, module: Module ): ModuleFormat {
	if ( getTypeByName( name ) !== 'script' ) {
		return 'unknown';
	}

	if ( module.type === 'javascript/esm' ) {
		return 'esm';
	}

	return 'cjs';
}
