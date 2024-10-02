import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { loadCodeAndMap } from 'load-source-map';
import { mapSourceMap } from './sourcemap/map.js';
import { getBytesPerSource, getSizes } from './sourcemap/bytes.js';
import type {
  JsonReport,
  MaybeCodeMap,
  ReportInput,
  ReportOutput,
  CodeMap,
  ReportOutputInput
} from './types.js';
import { normalizePath } from './utils.js';

export function generateJsonReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>
): JsonReport {
  const outputsEntries = assets
    .filter( asset => !asset.endsWith( '.map' ) )
    .map( asset => processAsset( asset, inputs ) )
    .filter( output => !!output );

  return {
    inputs,
    outputs: Object.fromEntries( outputsEntries )
  };
}

export function generateHtmlReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>
): string {
  const json = generateJsonReport( assets, inputs );
  const __dirname = dirname( fileURLToPath( import.meta.url ) );
  const template = readFileSync( resolve( __dirname, './index.html' ), 'utf-8' );

  return template.replace( '__REPORT_DATA__', JSON.stringify( json ) );
}

function processAsset( asset: string, inputs: Record<string, ReportInput> ): [ string, ReportOutput ] | void {
  const maybeCodeMap = loadCodeAndMap( asset );

  if ( !hasCodeAndMap( maybeCodeMap ) ) {
    return;
  }

  const { code, map } = maybeCodeMap;
  const mapped = mapSourceMap( map, dirname( asset ), inputs );

  mapped.sources = mapped.sources.map( source => normalizePath( source! ) );

  const bytes = getBytesPerSource( code, mapped );

  return [ normalizePath( asset ), {
    ...getSizes( code ),
    inputs: mapped.sources.reduce( ( acc, source ) => {
      if ( source ) {
        acc[ normalizePath( source ) ] = bytes.get( source ) ?? {
          uncompressed: 0,
          gzip: 0,
          brotli: 0
        };
      }

      return acc;
    }, {} as Record<string, ReportOutputInput> )
  }  ];
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
  return Boolean( result && result.code && result.map );
}
