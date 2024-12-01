import { join, relative, resolve } from 'path';
import type { Transformer as TransformerOpts } from '@parcel/types';
import {
  generateReportFromAssets,
  normalizePath,
  type JsonReport,
  type ReportInput,
  type UserOptions
} from '../index.js';

class Transformer {
  constructor ( opts: TransformerOpts<UserOptions> ) {
    // @ts-ignore
    this[ Symbol.for( 'parcel-plugin-config' ) ] = opts;
  }
}

const SondaParcelPlugin: Transformer = new Transformer( {
  async loadConfig( { config } ): Promise<UserOptions> {
    const conf = await config.getConfig<UserOptions>( [
      resolve( '.sondarc' ),
      resolve( '.sondarc.js' ),
      resolve( 'sonda.config.js' ),
    ], {} );

    return conf!.contents;
  },

  // @ts-ignore
  async report( { event, options } ) {
    if ( event.type !== 'buildSuccess' ) {
      return;
    }

    let inputs: JsonReport[ 'inputs' ] = {};
    const assets: Array<string> = [];

    for ( let bundle of event.bundleGraph.getBundles() ) {
      assets.push( bundle.filePath );

      // @ts-ignore
      bundle.traverseAssets( asset => {
        const input: ReportInput = {
          bytes: asset.stats.size,

          // TODO: 'unknown'
          format: asset.meta.hasCJSExports ? 'cjs' : 'esm',
          imports: [],
          belongsTo: null,
        }

        for ( let dep of event.bundleGraph.getDependencies( asset ) ) {
          let resolved = event.bundleGraph.getResolvedAsset( dep, bundle )!;

          if ( resolved ) {
            input.imports.push( normalizePath( relative( process.cwd(), resolved.filePath ) ) );
          }
        }
        
        inputs[ normalizePath( relative( process.cwd(), asset.filePath ) ) ] = input;
      } );
    }

    // TODO: Weird paths in `sources` in source maps

    return generateReportFromAssets(
      assets,
      inputs,
      // TODO
      {
        format: 'html',
        detailed: true,
        sources: true,
        gzip: true,
        brotli: true,
        sourcesPathNormalizer: ( path: string ) => join( options.projectRoot, path ),
      }
    );
  }
} );

export default SondaParcelPlugin;
