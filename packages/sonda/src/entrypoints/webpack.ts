import { join } from 'path';
import {
	generateReportFromAssets,
	jsRegexp,
	normalizePath,
	type JsonReport,
	type ModuleFormat,
	type UserOptions
} from '../index.js';
import type { Compiler, StatsModule } from 'webpack';

export default class SondaWebpackPlugin {
	options: Partial<UserOptions>;

	constructor ( options: Partial<UserOptions> = {} ) {
		this.options = options;
	}

	apply( compiler: Compiler ): void {
		if (this.options.enabled === false ) {
			return;
		}

		compiler.options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

		compiler.hooks.afterEmit.tapPromise( 'SondaWebpackPlugin', compilation => {
			const inputs: JsonReport[ 'inputs' ] = {};
			const stats = compilation.getStats().toJson( {
				modules: true,
				providedExports: true,
			} );

			const outputPath = stats.outputPath || compiler.outputPath;
			const modules: Array<StatsModule> = stats.modules
				?.flatMap( mod => mod.modules ? [ mod, ...mod.modules ] : mod )
				.filter( mod => mod.nameForCondition && !mod.codeGenerated )
				.filter( ( mod, index, self ) => self.findIndex( m => m.nameForCondition === mod.nameForCondition ) === index )
				|| [];

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
				this.options
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
