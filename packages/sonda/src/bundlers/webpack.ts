import { join } from 'path';
import { normalizeOptions, normalizePath } from '../utils';
import { generateReportFromAssets } from '../report/generate';
import type { Compiler, StatsModule } from 'webpack';
import type { Options, ModuleFormat, JsonReport } from '../types';

const jsRegexp = /\.[c|m]?[t|j]s[x]?$/;

export class SondaWebpackPlugin {
	options: Partial<Options>;

	constructor ( options?: Partial<Options> ) {
		this.options = options || {};
	}

	apply( compiler: Compiler ): void {
		compiler.options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

		compiler.hooks.afterEmit.tapPromise( 'SondaWebpackPlugin', compilation => {
			const inputs: JsonReport[ 'inputs' ] = {};
			const stats = compilation.getStats().toJson( {
				modules: true,
				providedExports: true
			} );

			const outputPath = stats.outputPath || compiler.outputPath;
			const modules = stats.modules?.filter( mod => mod.nameForCondition && mod.moduleType !== 'asset/inline' ) || [];

			modules.forEach( module => {
				const imports = modules.reduce( ( acc, { nameForCondition, issuerName, reasons } ) => {
					if ( issuerName === module.name || reasons?.some( reason => reason.resolvedModule === module.name ) ) {
						acc.push( normalizePath( nameForCondition! ) );
					}

					return acc;
				}, [] as Array<string> );

				inputs[ normalizePath( module.nameForCondition! ) ] = {
					bytes: module.size || 0,
					format: getFormat( module ),
					imports,
					belongsTo: null
				};
			} );

			return generateReportFromAssets(
				stats.assets?.map( asset => join( outputPath, asset.name ) ) || [],
				inputs,
				normalizeOptions( this.options )
			);
		} );
	}
}

function getFormat( module: StatsModule ): ModuleFormat {
	if ( !jsRegexp.test( module.nameForCondition! ) ) {
		return 'unknown';
	}

	/**
	 * Sometimes ESM modules have `moduleType` set as `javascript/auto`, so we
	 * also need to check if the module has exports to determine if it's ESM.
	 */
	if ( module.moduleType === 'javascript/esm' || !!module.providedExports?.length ) {
		return 'esm';
	}

	return 'cjs';
}
