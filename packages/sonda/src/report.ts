import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { getBytesPerSource } from './sourcemap/bytes.js';
import { loadCodeAndMap } from './sourcemap/load.js';
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
    .map( asset => processAsset( asset ) )
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

function processAsset( asset: string ): [ string, ReportOutput ] | void {
  const maybeCodeMap = loadCodeAndMap( asset );

  if ( !hasCodeAndMap( maybeCodeMap ) ) {
    return;
  }

  const { code, map } = maybeCodeMap;
  const bytes = getBytesPerSource( code, map );

  return [ normalizePath( asset ), {
    bytes: Buffer.byteLength( code ),
    inputs: map.sources.reduce( (acc, source) => {
      acc[ normalizePath( source ) ] = {
        bytesInOutput: bytes.get( source ) || 0
      };

      return acc;
    }, {} as Record<string, ReportOutputInput> )
  }  ];
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
  return Boolean( result && result.code && result.map );
}
