import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { loadCodeAndMap } from 'load-source-map';
import { decode } from '@jridgewell/sourcemap-codec';
import { mapSourceMap } from './sourcemap/map.js';
import { getBytesPerSource, getSizes } from './sourcemap/bytes.js';
import type {
  JsonReport,
  MaybeCodeMap,
  ReportInput,
  ReportOutput,
  CodeMap,
  ReportOutputInput,
  Options
} from './types.js';
import { normalizePath } from './utils.js';

export function generateJsonReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>,
  options: Options
): JsonReport {
  const outputs = assets
    .filter( asset => !asset.endsWith( '.map' ) )
    .reduce( ( carry, asset ) => {
      const data = processAsset( asset, inputs, options );

      if ( data ) {
        carry[ normalizePath( asset ) ] = data;
      }

      return carry;
    }, {} as Record<string, ReportOutput> );

  return {
    inputs,
    outputs
  };
}

export function generateHtmlReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>,
  options: Options
): string {
  const json = generateJsonReport( assets, inputs, options );
  const __dirname = dirname( fileURLToPath( import.meta.url ) );
  const template = readFileSync( resolve( __dirname, './index.html' ), 'utf-8' );

  return template.replace( '__REPORT_DATA__', JSON.stringify( json ) );
}

function processAsset(
  asset: string,
  inputs: Record<string, ReportInput>,
  options: Options
): ReportOutput | void {
  const maybeCodeMap = loadCodeAndMap( asset );

  if ( !hasCodeAndMap( maybeCodeMap ) ) {
    return;
  }

  const { code, map } = maybeCodeMap;
  const mapped = options.detailed
    ? mapSourceMap( map, dirname( asset ), inputs )
    : { ...map, mappings: decode( map.mappings ) };

  mapped.sources = mapped.sources.map( source => normalizePath( source! ) );

  const assetSizes = getSizes( code, options );
  const bytes = getBytesPerSource( code, mapped, assetSizes, options );

  return {
    ...assetSizes,
    inputs: Array.from( bytes ).reduce( ( carry, [ source, sizes ] ) => {
      carry[ normalizePath( source ) ] = sizes;

      return carry;
    }, {} as Record<string, ReportOutputInput> )
  };
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
  return Boolean( result && result.code && result.map );
}
