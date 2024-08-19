import { parse } from 'path';
import { Traverse } from 'neotraverse/modern';
import { moduleLexerAsync, parseAsync } from 'oxc-parser';
import { decode, type SourceMapMappings } from '@jridgewell/sourcemap-codec';

export interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
}

export async function analyze( code: string, map: SourceMap ): Promise<any> {
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
      imports: await getImports( path, sourceCode )
    };
  }

  return result;
}

async function getImports( path: string, sourceCode?: string | null ): Promise<Array<string>> {
  if ( !sourceCode ) {
    return [];
  }

  /**
   * Naively check if the file contains any `import` or `require(` statements to
   * avoid parsing files that can be easily determined to depend on other files.
   */
  if ( !sourceCode.includes( 'import' ) && !sourceCode.includes( 'require(' ) ) {
    return [];
  }

  const { hasModuleSyntax, imports } = await moduleLexerAsync( sourceCode, {
    sourceFilename: path
  } );

  // If file is an ES module, we can statically analyze imports
  if ( hasModuleSyntax ) {
    return imports
      .map( item => item.n )
      .filter( item => item !== undefined ); // Can be empty if dynamic import doesn't have a valid JS string.
  }

  // Otherwise, the file is a CommonJS module and we need to traverse the AST and look for `require` calls.
  const { program } = await parseAsync( sourceCode, {
    sourceFilename: path
  } );

  let requires: Array<string> = [];

  new Traverse( JSON.parse( program ).body ).forEach( ( ctx, item ) => {
    // TODO: This check is naive and should be improved in the future
    if ( ctx.notLeaf && item?.type === 'CallExpression' && item.callee.name === 'require' ) {
      requires.push( item.arguments[ 0 ].value );
    }
  } );

  return requires;
}
