import { join, dirname, resolve } from 'path';
import { writeFile } from 'fs/promises';
import {
  createUnplugin,
  type UnpluginInstance,
  type UnpluginOptions,
} from 'unplugin';
import {
  generateHtmlReport,
  loadCodeAndMap,
  type ImportsGraph,
  type SourcesGraph
} from 'sonar';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';
import type { NormalModule } from 'webpack';

async function generateReportFromAssets(
  assets: Array<string>,
  outputDir: string,
  importsGraph: ImportsGraph,
  sourcesGraph: SourcesGraph
): Promise<void> {
  const { default: open } = await import( 'open' );

  const reports = assets
    .map( asset => generateHtmlReport( asset, importsGraph, sourcesGraph ) )
    .map( async ( reportPromise, index ) => {
      const path = join( outputDir, `sonar-report-${ index }.html` );
      const report = await reportPromise;

      if ( !report ) {
        return null;
      }

      await writeFile( path, report );
      await open( path );

      return path;
    } );

  await Promise.all( reports );
}

// TODO: Add "open" parameter
function factory(): UnpluginOptions {
  // Absolute path to the output directory
  let outputDir: string;

  // Map of abolute paths to assets and their source maps
  let assets: Array<string>;

  // Map of absolute paths to source files and files they import
  let importsGraph: ImportsGraph = new Map();

  // Map of absolute paths to compiled files and files that they include
  let sourcesGraph: SourcesGraph = new Map();

  return {
    name: 'unplugin-sonar',
    enforce: 'pre',

    async load( id: string ): Promise<void> {
      const result = await loadCodeAndMap( id );

      if ( result?.map ) {
        result.map.sources.forEach( source => {
          if ( source === id ) {
            return;
          }

          return sourcesGraph.set( source, id );
        } );
      }
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

      return generateReportFromAssets( assets, outputDir, importsGraph, sourcesGraph );
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

              importsGraph.set( resource, {
                format: type === 'javascript/esm' ? 'esm' : 'cjs',
                imports: Array.from( new Set( resolvedDependencies ) )
              } )
            } );
        } );
      } );
    },

    rollup: {
      moduleParsed( module ) {
        importsGraph.set( module.id, {
          format: module.meta?.commonjs?.isCommonJS ? 'cjs' : 'esm',
          imports: module.importedIds
        } );
      },
    },

    vite: {
      moduleParsed( module ) {
        importsGraph.set( module.id, {
          format: module.meta?.commonjs?.isCommonJS ? 'cjs' : 'esm',
          imports: module.importedIds
        } );
      },
    },
  };
}

type Plugin = UnpluginInstance<undefined>;

export const plugin: Plugin = /* #__PURE__ */ createUnplugin(factory);
export const vitePlugin: Plugin['vite'] = plugin.vite;
export const rollupPlugin: Plugin['rollup'] = plugin.rollup;
export const rolldownPlugin: Plugin['rolldown'] = plugin.rolldown;
export const webpackPlugin: Plugin['webpack'] = plugin.webpack;
export const rspackPlugin: Plugin['rspack'] = plugin.rspack;
export const esbuildPlugin: Plugin['esbuild'] = plugin.esbuild;
export const farmPlugin: Plugin['farm'] = plugin.farm;
