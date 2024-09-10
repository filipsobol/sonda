import { join, dirname, resolve } from 'path';
import { writeFileSync } from 'fs';
import {
  createUnplugin,
  type TransformResult,
  type UnpluginInstance,
  type UnpluginOptions,
} from 'unplugin';
import {
  generateHtmlReport,
  loadCodeAndMap,
  type JsonReport,
} from 'sonar';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';
import type { NormalModule } from 'webpack';
import { rollupHandler } from './rollup.js';
import { normalizePath, open } from './utils.js';

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
  });

  const report = generateHtmlReport( assets, inputs );

  if ( !report ) {
    return;
  }

  const path = join( outputDir, 'sonar-report.html' );

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
  let inputs: JsonReport['inputs'] = {};
  let sourcesGraph = new Map<string, Array<string>>();

  return {
    name: 'unplugin-sonar',
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
        sourcesGraph.set( relativePath, result.map.sources )
      }

      return result;
    },

    writeBundle( ...args ) {
      if ( !args.length && !assets ) {
        throw new Error( 'Could not detect output assets. Please file an issue in the Sonar repository.' );
      }

      if ( args.length ) {
        // Get outputs from Rollup / Vite
        const [ options, bundle ] = args as unknown as [ NormalizedOutputOptions, OutputBundle ];

        outputDir = resolve( process.cwd(), options.dir ?? dirname( options.file! ) );
        assets = Object.keys( bundle ).map( name => join( outputDir, name ) );
      }

      return generateReportFromAssets( assets, outputDir, inputs, sourcesGraph, open );
    },

    // Get outputs from Webpack
    webpack( { hooks, options } ) {
      hooks.afterEnvironment.tap( 'ModifyOutputPlugin', () => {
        options.output.devtoolModuleFilenameTemplate = '[absolute-resource-path]';
      } );
  
      hooks.afterEmit.tap( 'unplugin-sonar', ( compiler ) => {
        outputDir = compiler.options.output.path ?? process.cwd();
        assets = Object.keys( compiler.assets ).map( name => join( outputDir, name ) );
      } );
      
      hooks.compilation.tap( 'unplugin-sonar', ( { hooks, moduleGraph } ) => {
        hooks.optimizeModules.tap( 'unplugin-sonar', ( modules ) => {
          Array
            .from( modules as Iterable<NormalModule> )
            .forEach( ( { dependencies, resource, type } ) => {
              const resolvedDependencies = dependencies
                .map( dependency => moduleGraph.getModule( dependency ) as NormalModule | null )
                .map( resolved => resolved?.resource )
                .filter( resolved => resolved !== undefined );
              
              const existingInput = inputs[ resource ];

              if ( existingInput ) {
                existingInput.format = type === 'javascript/esm' ? 'esm' : 'cjs';
                existingInput.imports = resolvedDependencies;
                return;
              }

              inputs[ normalizePath( resource ) ] = {
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

type Plugin = UnpluginInstance<Partial<Options> | undefined>;

export const plugin: Plugin = /* #__PURE__ */ createUnplugin(factory);
export const vitePlugin: Plugin['vite'] = plugin.vite;
export const rollupPlugin: Plugin['rollup'] = plugin.rollup;
export const rolldownPlugin: Plugin['rolldown'] = plugin.rolldown;
export const webpackPlugin: Plugin['webpack'] = plugin.webpack;
export const rspackPlugin: Plugin['rspack'] = plugin.rspack;
export const esbuildPlugin: Plugin['esbuild'] = plugin.esbuild;
export const farmPlugin: Plugin['farm'] = plugin.farm;
