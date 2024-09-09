import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
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

export async function generateJsonReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>
): Promise<JsonReport | null> {
  const outputsOrNull = await Promise.all( assets.map( asset => processAsset( asset ) ) );
  const outputsEntries = outputsOrNull.filter( output => !!output );

  return {
    inputs,
    outputs: Object.fromEntries( outputsEntries )
  };
}

export async function generateHtmlReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>
): Promise<string> {
  // @ts-ignore This file will be available at runtime
  const json = await generateJsonReport( assets, inputs );

  if ( !json ) {
    return '';
  }

  const __dirname = dirname( fileURLToPath( import.meta.url ) );
  const template = await readFile( resolve( __dirname, './index.html' ), 'utf-8' );

  return template.replace( '__REPORT_DATA__', JSON.stringify( json ) );
}

async function processAsset( asset: string ): Promise<[ string, ReportOutput ] | void> {
  const maybeCodeMap = await loadCodeAndMap( asset );

  if ( !hasCodeAndMap( maybeCodeMap ) ) {
    return;
  }

  const { code, map } = maybeCodeMap;
  const bytes = getBytesPerSource( code, map );

  return [ asset, {
    bytes: Buffer.byteLength( code ),
    inputs: map.sources.reduce( (acc, source) => {
      acc[ source ] = {
        bytesInOutput: bytes.get( source ) || 0
      };

      return acc;
    }, {} as Record<string, ReportOutputInput> )
  }  ];
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
  return Boolean( result && result.code && result.map );
}
