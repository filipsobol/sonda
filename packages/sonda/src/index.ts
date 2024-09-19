import { writeFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import {
	createUnplugin,
	type TransformResult,
	type UnpluginInstance,
	type UnpluginOptions,
} from 'unplugin';
import { generateHtmlReport } from './report.js';
import { loadCodeAndMap } from './sourcemap/load.js';
import { normalizePath, open } from './utils.js';
import type { ModuleFormat, JsonReport } from './types.js';
import type { NormalModule } from 'webpack';
import type { Plugin, ModuleInfo, NormalizedOutputOptions, OutputBundle } from 'rollup';

export interface Options {

	/**
	 * RegExp matching imports which sourcemap should be read.
	 *
	 * @default /(\.js|\.css)$/
	 */
	include: RegExp;

	/**
	 * RegExp matching imports for which sourcemaps should be ignored.
	 *
	 * @default undefined
	 */
	exclude?: RegExp;

	/**
	 * Whether to open the generated report in the default program for HTML files.
	 *
	 * @default true
	 */
	open: boolean;
}

function generateReportFromAssets(
	assets: Array<string>,
	outputDir: string,
	inputs: JsonReport[ 'inputs' ],
	sourcesGraph: Map<string, Array<string>>,
	shouldOpen: boolean
): void {
	sourcesGraph.forEach( ( sources, path ) => {
		const parent = inputs[ path ];

		sources.forEach( source => {
			const normalized = normalizePath(
				join( dirname( path ), source )
			);

			inputs[ normalized ] = {
				bytes: 0,
				format: parent.format,
				imports: [],
				belongsTo: path,
			}
		} );
	} );

	const report = generateHtmlReport( assets, inputs );

	if ( !report ) {
		return;
	}

	const path = join( outputDir, 'sonda-report.html' );

	writeFileSync( path, report );
	shouldOpen && open( path );
}

// TODO: Add "open" parameter
function factory( options?: Partial<Options> ): UnpluginOptions {
	const defaultOptions: Options = {
		include: /(\.js|\.css)$/,
		exclude: undefined,
		open: true,
	};

	const {
		include,
		exclude,
		open
	} = Object.assign( {}, defaultOptions, options ) as Options;

	let outputDir: string;
	let assets: Array<string>;
	let inputs: JsonReport[ 'inputs' ] = {};
	let sourcesGraph = new Map<string, Array<string>>();

	return {
		name: 'sonda',
		enforce: 'pre',

		loadInclude( id: string ): boolean {
			return include.test( id ) && !exclude?.test( id );
		},

		load( id: string ): TransformResult {
			const result = loadCodeAndMap( id );
			const relativePath = normalizePath( id );

			inputs[ relativePath ] = {
				bytes: 0,
				format: 'unknown',
				imports: [],
				belongsTo: null,
			};

			if ( result?.map?.sources ) {
				sourcesGraph.set( relativePath, result.map.sources.map( source => normalizePath( source ) ) )
			}

			return result;
		},

		writeBundle( ...args ) {
			if ( !args.length && !assets ) {
				throw new Error( 'Could not detect output assets. Please file an issue in the Sonda repository.' );
			}

			if ( args.length ) {
				// Get outputs from Rollup / Vite
				const [ options, bundle ] = args as unknown as [ NormalizedOutputOptions, OutputBundle ];

				outputDir = normalizePath( resolve( process.cwd(), options.dir ?? dirname( options.file! ) ) );
				assets = Object.keys( bundle ).map( name => join( outputDir, name ) );
			}

			return generateReportFromAssets( assets, outputDir, inputs, sourcesGraph, open );
		},

		// Get outputs from Webpack
		webpack( { hooks, options } ) {
			hooks.afterEnvironment.tap( 'ModifyOutputPlugin', () => {
				options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';
			} );

			hooks.afterEmit.tap( 'sonda', ( compiler ) => {
				outputDir = normalizePath( compiler.options.output.path ?? process.cwd() );
				assets = Object.keys( compiler.assets ).map( name => join( outputDir, name ) );
			} );

			hooks.compilation.tap( 'sonda', ( { hooks, moduleGraph } ) => {
				hooks.optimizeModules.tap( 'sonda', ( modules ) => {
					Array
						.from( modules as Iterable<NormalModule> )
						.forEach( ( { dependencies, resource, type } ) => {
							if ( !resource ) {
								return;
							}

							const relativePath = normalizePath( resource );
							const resolvedDependencies = dependencies
								.map( dependency => moduleGraph.getModule( dependency ) as NormalModule | null )
								.map( resolved => resolved?.resource )
								.filter( resolved => resolved !== undefined );

							const existingInput = inputs[ relativePath ];

							if ( existingInput ) {
								existingInput.format = type === 'javascript/esm' ? 'esm' : 'cjs';
								existingInput.imports = resolvedDependencies;
								return;
							}

							inputs[ relativePath ] = {
								// TODO: Get bytes from the module
								bytes: 0,
								format: type === 'javascript/esm' ? 'esm' : 'cjs',
								imports: resolvedDependencies.map( dep => normalizePath( dep ) ),
								belongsTo: null,
							};
						} );
				} );
			} );
		},

		rollup: rollupHandler( inputs ),
		vite: rollupHandler( inputs ),
	};
}

export function rollupHandler( inputs: JsonReport[ 'inputs' ] ): Partial<Plugin> {
	const esmRegex = /\.m[tj]sx?$/;
	const cjsRegex = /\.c[tj]sx?$/;

	function guessFormat( file: string ): 'esm' | 'cjs' | undefined {
		if ( esmRegex.test( file ) ) {
			return 'esm';
		}

		if ( cjsRegex.test( file ) ) {
			return 'cjs';
		}

		return;
	}

	const formats = new Map<true | false | undefined, ModuleFormat>( [
		[ true, 'cjs' ],
		[ false, 'esm' ],
	] );

	return {
		moduleParsed( module: ModuleInfo ) {
			const input = inputs[ normalizePath( module.id ) ] ??= {
				bytes: 0,
				format: 'unknown',
				imports: [],
				belongsTo: null,
			};

			input.bytes = module.code ? Buffer.byteLength( module.code ) : 0;
			input.format = formats.get( module.meta.commonjs?.isCommonJS ) ?? guessFormat( module.id ) ?? 'unknown';
			input.imports = module.importedIds.map( id => normalizePath( id ) );
		}
	};
}

type SondaPlugin = UnpluginInstance<Partial<Options> | undefined>;

export const plugin: SondaPlugin = /* #__PURE__ */ createUnplugin( factory );
export const vitePlugin: SondaPlugin[ 'vite' ] = plugin.vite;
export const rollupPlugin: SondaPlugin[ 'rollup' ] = plugin.rollup;
export const rolldownPlugin: SondaPlugin[ 'rolldown' ] = plugin.rolldown;
export const webpackPlugin: SondaPlugin[ 'webpack' ] = plugin.webpack;
export const rspackPlugin: SondaPlugin[ 'rspack' ] = plugin.rspack;
export const esbuildPlugin: SondaPlugin[ 'esbuild' ] = plugin.esbuild;
export const farmPlugin: SondaPlugin[ 'farm' ] = plugin.farm;

export { loadCodeAndMap } from './sourcemap/load.js';
export type { JsonReport } from './types';
