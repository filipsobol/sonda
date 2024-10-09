import { join } from 'path';
import { normalizeOptions, normalizePath } from '../utils';
import { generateReportFromAssets } from '../report/generate';
import type { Options, ModuleFormat, JsonReport } from '../types';
import { NormalModule, type Compiler, type Module } from 'webpack';

const jsRegexp = /\.[c|m]?[t|j]s[x]?$/;

export class SondaRspackPlugin {
	options: Partial<Options>;
	inputs: JsonReport[ 'inputs' ];

	constructor ( options?: Partial<Options> ) {
		this.options = options || {};
		this.inputs = {};
	}

	apply( compiler: Compiler ): void {
		compiler.options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

		const importsMap = new Map<string, string[]>();

		compiler.hooks.compilation.tap( 'SondaWebpackPlugin', ( compilation, { normalModuleFactory } ) => {
			normalModuleFactory.hooks.afterResolve.tap( 'SondaWebpackPlugin', resolveData => {
				const importer = resolveData.contextInfo.issuer;
				const imported = resolveData.createData.resource;

				if ( !importer || !imported ) {
					return;
				}

				if ( !importsMap.has( importer ) ) {
					importsMap.set( importer, [] );
				}

				const imports = importsMap.get( importer )!;

				imports.push( imported );
				importsMap.set( importer, imports );
			} );

			compilation.hooks.optimizeModules.tap( 'SondaWebpackPlugin', ( modules ) => {
				Array
					.from( modules )
					.forEach( module => {
						if ( !isNormalModule( module ) ) {
							return;
						}

						if ( !module.resource ) {
							return;
						}

						this.inputs[ normalizePath( module.resource ) ] = {
							bytes: module.size(),
							format: getFormat( module ),
							imports: importsMap.get( module.resource ) || [],
							belongsTo: null,
						};
					} );
			} );
		} );

		compiler.hooks.afterEmit.tapAsync( 'SondaWebpackPlugin', ( compilation, callback ) => {
			const outputPath = compiler.options.output.path || compiler.outputPath || process.cwd();
			const assets = compilation.getAssets().map( asset => join( outputPath, asset.name ) );

			generateReportFromAssets(
				assets,
				this.inputs,
				normalizeOptions( this.options )
			)
				.then( () => callback() );
		} );
	}
}

function getFormat( module: NormalModule ): ModuleFormat {
	if ( !jsRegexp.test( module.resource ) ) {
		return 'unknown';
	}

	if ( module.type === 'javascript/esm' || module.buildMeta?.exportsType === 'namespace' ) {
		return 'esm';
	}

	return 'cjs';
}

function isNormalModule( module: Module | NormalModule | null ): module is NormalModule {
	return module !== null && 'resource' in module;
}
