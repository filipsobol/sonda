import {
	generateReport,
	getTypeByName,
	normalizePath,
	Config,
	type JsonReport,
	type ModuleFormat,
	type UserOptions
} from '../index.js';
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

		compiler.options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

		compiler.hooks.afterEmit.tapPromise( 'SondaWebpackPlugin', async ( { modules, moduleGraph, outputOptions } ) => {
			const inputs: JsonReport[ 'inputs' ] = {};

			for ( const mod of modules ) {
				const name = mod.nameForCondition();

				if ( !name || name.startsWith( 'data:' ) ) {
					continue;
				}

				// ConcatenatedModule is a special case in Webpack where multiple modules are combined into one.
				// We only want to get the module that is the entry point for the concatenated module.
				const module = ( mod as any).modules?.find( ( module: Module ) => module.nameForCondition() === name ) || mod;
				
				const imports = Array
					// Get all the connections from the current module
					.from( moduleGraph.getOutgoingConnections( module ) )

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

				inputs[ normalizePath( name ) ] = {
					bytes: module.size() || 0,
					type: getTypeByName( name ),
					format: getFormat( name, module ),
					imports,
					belongsTo: null
				};
			}

			await generateReport(
				outputOptions.path || compiler.outputPath,
				this.options,
				inputs,
			);
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
