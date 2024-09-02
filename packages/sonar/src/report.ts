import { dirname, parse, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { getBytesPerSource } from './sourcemap/bytes.js';
import { loadCodeAndMap } from './sourcemap/load.js';
import type { ImportsGraph, SourcesGraph, JsonReportData } from './types.js';

export async function generateJsonReport(
  codePath: string,
  importsGraph: ImportsGraph,
  sourcesGraph: SourcesGraph
): Promise<JsonReportData | null> {
  const { code, map } = await loadCodeAndMap( codePath ) || {};

  if ( !code || !map ) {
    return null;
  }

  const files = new Set( [
    ...importsGraph.keys(),
    ...sourcesGraph.keys(),
  ] );

  const bytes = getBytesPerSource( code, map );

  const dataEntries = Array.from( files ).map( path => {
    const { dir, base } = parse( path );
    const parent = sourcesGraph.get( path ) ?? null;
    const data = importsGraph.get( path );
    const parentData = parent ? importsGraph.get( parent ) : null;
    const sourcesIndex = map.sources.indexOf( path );

    return [ path, {
      originalPath: path,
      mappedPath: normalizePath( path ),
      dir,
      filename: base,
      bytes: sourcesIndex >= 0 ? bytes[ sourcesIndex ] : 0,
      format: data?.format ?? parentData?.format ?? 'unknown',
      imports: data?.imports ?? [],
      parent
    } ];
  } );

  return Object.fromEntries( dataEntries ) as JsonReportData;
}

const normalizers: Array<[ RegExp, string ]> = [
  // Remove current working directory
  [ new RegExp( '^' + process.cwd() + '/' ), '/' ],

  // Unicode escape sequences used by Rollup and Vite to identify virtual modules
  [ /^\0/, '/' ],

  // Remove everything before the last occurrence of "node_modules"
  [ /^(.*)node_modules/, '/node_modules' ],
];

function normalizePath( path: string ): string {
  return normalizers.reduce( ( p, [ pattern, replace ] ) => p.replace( pattern, replace ), path );
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
