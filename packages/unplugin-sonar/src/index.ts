import { join, dirname } from 'path';
import { readFile, writeFile } from 'fs/promises';
import {
  createUnplugin,
  type UnpluginInstance,
  type UnpluginOptions,
} from 'unplugin';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';
import { analyze } from './loadSourceMap';

function getJavaScriptAndSourceMaps(
  assets: Array<string>,
  outputDir: string = process.cwd()
): Record<string, string> {
  return assets.reduce( ( acc, name ) => {
    const sourceMapName = `${ name }.map`;

    if ( assets.includes( sourceMapName ) ) {
      acc[ join( outputDir, name ) ] = join( outputDir, sourceMapName )
    }

    return acc;
  }, {} as Record<string, string> )
}

async function generateReportFromAssets(
  assets: Record<string, string>,
  outputDir: string
): Promise<void> {
  let index = 0;

  for ( const [ codePath, mapPath ] of Object.entries( assets ) ) {
    const code = await readFile( codePath, 'utf8' );
    const map = await readFile( mapPath, 'utf8' );
    const result = await analyze( code, JSON.parse( map ) );

    await writeFile(
      join( outputDir, `sonar-report-${ index }.json` ),
      JSON.stringify( result, null, 2 )
    );

    index++;
  }
}

function factory(): UnpluginOptions {
  // Absolute path to the output directory
  let outputDir: string;

  // Map of abolute paths to JavaScript assets and their source maps
  let assets: Record<string, string>;

  return {
    name: 'unplugin-sonar',

    writeBundle( ...args ) {
      if ( !args.length && !assets ) {
        throw new Error( 'Could not detect output assets. Please file an issue in the Sonar repository.' );
      }

      if ( args.length ) {
      // Get outputs from Rollup / Vite
        const [ options, bundle ] = args as unknown as [ NormalizedOutputOptions, OutputBundle ];
        outputDir = join(
          process.cwd(),
          dirname( options.dir ?? options.file! )
        );

        assets = getJavaScriptAndSourceMaps( Object.keys( bundle ), outputDir );
      }

      return generateReportFromAssets( assets, outputDir )
    },

    // Get outputs from Webpack
    webpack( { hooks } ) {
      hooks.afterEmit.tap( 'unplugin-sonar', ( compiler ) => {
        outputDir = compiler.options.output.path ?? process.cwd();
        assets = getJavaScriptAndSourceMaps( Object.keys( compiler.assets ), outputDir );
      } );
    }
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
