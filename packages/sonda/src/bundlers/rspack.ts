import { join } from 'path';
import { normalizeOptions, normalizePath } from '../utils';
import { generateReportFromAssets } from '../report/generate';
import type { Compiler, StatsModule } from '@rspack/core';
import type { Options, ModuleFormat, JsonReport } from '../types';

const jsRegexp = /\.[c|m]?[t|j]s[x]?$/;

export class SondaRspackPlugin {
	options: Partial<Options>;

	constructor ( options?: Partial<Options> ) {
		this.options = options || {};
	}

	apply( compiler: Compiler ): void {
		compiler.options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

		compiler.hooks.afterEmit.tapPromise( 'SondaRspackPlugin', compilation => {
			const inputs: JsonReport[ 'inputs' ] = {};
			const outputPath = compiler.options.output.path || compiler.outputPath || process.cwd();
			const stats = compilation.getStats().toJson( { modules: true } );

			const modules = stats.modules
				?.filter( mod => !mod.codeGenerated )
				.filter( mod => mod.nameForCondition )
				|| [];

			modules.forEach( module => {
				const imports = modules.reduce( ( acc, { nameForCondition, issuerName, reasons } ) => {
					if ( !nameForCondition ) {
						return acc;
					}

					if ( issuerName === module.name || reasons?.some( reason => reason.resolvedModule === module.name ) ) {
						acc.push( normalizePath( nameForCondition ) );
					}

					return acc;
				}, [] as Array<string> );

				inputs[ normalizePath( module.nameForCondition! ) ] = {
					bytes: module.size,
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

	if ( module.moduleType === 'javascript/esm' ) {
		return 'esm';
	}

	return 'cjs';
}
