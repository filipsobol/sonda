import { join } from 'path';
import { normalizeOptions, normalizePath } from '../utils';
import { generateReportFromAssets } from '../report/generate';
import type { Options, ModuleFormat, JsonReport } from '../types';
import { NormalModule, type Compiler, type Module } from 'webpack';

const jsRegexp = /* #__PURE__ */ /\.[c|m]?[t|j]s[x]?$/;

export class SondaWebpackPlugin {
	options: Partial<Options>;
	inputs: JsonReport[ 'inputs' ];

	constructor ( options?: Partial<Options> ) {
		this.options = options || {};
		this.inputs = {};
	}

	apply( compiler: Compiler ): void {
		compiler.options.output.devtoolModuleFilenameTemplate = '[resource-path]';

		compiler.hooks.compilation.tap( 'SondaWebpackPlugin', ( compilation ) => {
			compilation.hooks.optimizeModules.tap( 'SondaWebpackPlugin', ( modules ) => {
				Array
					.from( modules )
					.forEach( module => {
						if ( !isNormalModule( module ) ) {
							return;
						}

						const imports = module.dependencies.reduce( ( acc, dependency ) => {
							const module = compilation.moduleGraph.getModule( dependency );

							if ( isNormalModule( module ) ) {
								acc.push( normalizePath( module.resource ) );
							}

							return acc;
						}, [] as Array<string> );

						this.inputs[ normalizePath( module.resource ) ] = {
							bytes: module.size(),
							format: getFormat( module ),
							imports,
							belongsTo: null,
						};
					} );
			} );
		} );

		compiler.hooks.emit.tapAsync( 'SondaWebpackPlugin', ( compilation, callback ) => {
			const outputPath = compiler.options.output.path || compiler.outputPath || process.cwd();
			const assets = Object.keys( compilation.assets ).map( name => join( outputPath, name ) );

			generateReportFromAssets(
				assets,
				this.inputs,
				normalizeOptions( this.options )
			);

			callback();
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
