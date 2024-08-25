import { dirname, parse, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { getBytesPerSource } from './sourcemap/bytes.js';
import { loadCodeAndMap } from './sourcemap/load.js';
import type { ImportsGraph, SourcesGraph, JsonReportData, NormalizedSource } from './types.js';

export async function generateJsonReport(
  codePath: string,
  importsGraph: ImportsGraph,
  sourcesGraph: SourcesGraph
): Promise<JsonReportData | null> {
  const { code, map } = await loadCodeAndMap( codePath ) || {};

  if ( !code || !map ) {
    return null;
  }

  const bytes = getBytesPerSource( code, map );

  const dataPromise = map.sources.map(( path, index ): [ string, NormalizedSource ] => {
    const { dir, base } = parse( path );
    const parent = sourcesGraph.get( path ) ?? null;
    const data = importsGraph[ path ];
    const parentData = parent ? importsGraph[ parent ] : null;

    return [ path, {
      originalPath: path,
      dir,
      filename: base,
      bytes: bytes[ index ],
      format: data?.format ?? parentData?.format ?? 'unknown',
      imports: data?.imports ?? [],
      parent
    } ];
  } );

  return Object.fromEntries( dataPromise ) as JsonReportData;
}

export async function generateHtmlReport(
  codePath: string,
  importsGraph: ImportsGraph,
  sourcesGraph: SourcesGraph
): Promise<string> {
  // @ts-ignore This file will be available at runtime
  const __dirname = dirname( fileURLToPath( import.meta.url ) );
  const template = await readFile( resolve( __dirname, './index.html' ), 'utf-8' );
  const json = await generateJsonReport( codePath, importsGraph, sourcesGraph );

  if ( !json ) {
    return '';
  }

  return template.replace( '__REPORT_DATA__', JSON.stringify( json, null, 2 ) );
}
