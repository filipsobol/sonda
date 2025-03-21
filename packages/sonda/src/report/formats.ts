import { readFileSync } from 'fs';
import { dirname, extname, resolve } from 'path';
import { loadCodeAndMap } from 'load-source-map';
import { decode } from '@jridgewell/sourcemap-codec';
import { mapSourceMap } from '../sourcemap/map.js';
import { getBytesPerSource, getSizes } from '../sourcemap/bytes.js';
import type {
  JsonReport,
  MaybeCodeMap,
  ReportInput,
  ReportOutput,
  CodeMap,
  ReportOutputInput,
  PluginOptions
} from '../types.js';
import { normalizePath, getTypeByName } from '../utils.js';
import { getDependencies } from './dependencies.js';
import { getIssues } from './issues.js';

export function generateJsonReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>,
  options: PluginOptions
): JsonReport {
  const acceptedExtensions = [ '.js', '.mjs', '.cjs', '.css' ];

  const outputs = assets
    .filter( asset => acceptedExtensions.includes( extname( asset ) ) )
    .reduce( ( carry, asset ) => {
      const data = processAsset( asset, inputs, options );

      if ( data ) {
        carry[ normalizePath( asset ) ] = data;
      }

      return carry;
    }, {} as Record<string, ReportOutput> );

  const report: JsonReport = {
    inputs: sortObjectKeys( inputs ),
    outputs: sortObjectKeys( outputs ),
    dependencies: {},
    issues: []
  };

  report.dependencies = getDependencies( report );
  report.issues = getIssues( report );

  return report as JsonReport;
}

export function generateHtmlReport(
  assets: Array<string>,
  inputs: Record<string, ReportInput>,
  options: PluginOptions
): string {
  const json = generateJsonReport( assets, inputs, options );
  const template = readFileSync( resolve( import.meta.dirname, './index.html' ), 'utf-8' );

  return template.replace( '__REPORT_DATA__', encodeURIComponent( JSON.stringify( json ) ) );
}

function processAsset(
  asset: string,
  inputs: Record<string, ReportInput>,
  options: PluginOptions
): ReportOutput | void {
  const maybeCodeMap = loadCodeAndMap( asset, options.sourcesPathNormalizer );

  if ( !hasCodeAndMap( maybeCodeMap ) ) {
    return;
  }

  const { code, map } = maybeCodeMap;
  const mapped = options.detailed
    ? mapSourceMap( map, dirname( asset ), inputs )
    : { ...map, mappings: decode( map.mappings ) };

  mapped.sources = mapped.sources.map( source => source && normalizePath( source ) );

  const assetSizes = getSizes( code, options );
  const bytes = getBytesPerSource( code, mapped, assetSizes, options );
  const outputInputs = Array
    .from( bytes )
    .reduce( ( carry, [ source, sizes ] ) => {
      carry[ normalizePath( source ) ] = sizes;

      return carry;
    }, {} as Record<string, ReportOutputInput> );

  return {
    ...assetSizes,
    type: getTypeByName( asset ),
    inputs: sortObjectKeys( outputInputs ),
    map: options.sources ? {
      version: 3,
      names: [],
      mappings: mapped.mappings,
      sources: mapped.sources,
      sourcesContent: mapped.sourcesContent,
    } : undefined
  };
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
  return Boolean( result && result.code && result.map );
}

function sortObjectKeys<T extends unknown>( object: Record<string, T> ): Record<string, T> {
  return Object
    .keys( object )
    .sort()
    .reduce( ( carry, key ) => {
      carry[ key ] = object[ key ];

      return carry;
    }, {} as Record<string, T> );
} 
