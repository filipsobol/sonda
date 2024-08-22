import { dirname, parse, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { decode, type SourceMapMappings } from '@jridgewell/sourcemap-codec';
import { getImports } from './imports.js';

export interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
}

export async function generateJsonReport( code: string, map: SourceMap ): Promise<any> {
  const mappings: SourceMapMappings = decode( map.mappings );
  const contributions = new Array( map.sources.length ).fill( '' );
  const codeLines = code.split( '\n' ).map( code => code + '\n' );

  for ( let lineIndex = 0; lineIndex < mappings.length; lineIndex++ ) {
    const line = mappings[ lineIndex ];
    const lineCode = codeLines[ lineIndex ];

    for ( let mappingIndex = 0; mappingIndex < line.length; mappingIndex++ ) {
      // 0: generatedColumn
      // 1: fileIndex
      // 2: originalLine
      // 3: originalColumn
      // 4: nameIndex

      const [ startColumn, fileIndex ] = line[ mappingIndex ];
      const endColumn = line[ mappingIndex + 1 ]?.[ 0 ] ?? lineCode.length;

      // TODO: What if fileIndex is null / undefined?
      contributions[ fileIndex! ] += lineCode.slice( startColumn, endColumn );
    }
  }

  const result: Record<string, any> = {};

  for ( let index = 0; index < map.sources.length; index++ ) {
    const path = map.sources[ index ];
    const bundleCode = contributions[ index ];
    const sourceCode = map.sourcesContent?.[ index ];

    const { dir, base } = parse( path );

    result[ path ] = {
      dir,
      filename: base,
      bytes: Buffer.byteLength( bundleCode ),
      imports: sourceCode ? await getImports( path, sourceCode ) : []
    };
  }

  return result;
}

export async function generateHtmlReport( code: string, map: SourceMap ): Promise<any> {
  // @ts-ignore This file will be available at runtime
  const __dirname = dirname( fileURLToPath( import.meta.url ) );
  const template = await readFile( resolve( __dirname, './index.html' ), { encoding: 'utf-8' } );
  const json = await generateJsonReport( code, map );

  return template.replace( '__REPORT_DATA__', JSON.stringify( json, null, 2 ) );
}
