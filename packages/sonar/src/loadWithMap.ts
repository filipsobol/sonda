import { join } from 'path';
import { readFile } from 'fs/promises';
import convert from 'convert-source-map';
import type { SourceMap } from './types';

type Result = void | { code: string; map?: SourceMap };

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented in the source maps specification),
 * and parses the string as JSON.
 *
 * https://github.com/mozilla/source-map/blob/3cb92cc3b73bfab27c146bae4ef2bc09dbb4e5ed/lib/util.js#L162-L164
 */
export function parseSourceMapInput( str: string ): SourceMap {
  return JSON.parse( str.replace( /^\)]}'[^\n]*\n/, "" ) );
}

/**
 * Loads code and (optionally) source map from a given file. If the file is missing
 * the `sourcesContent` field, it will be populated based on the `sources` field paths.
 */
export async function loadCodeAndMap( path: string ): Promise<Result> {
  let code: string = '';

  try {
    code = await readFile(path, { encoding: 'utf8' });
  } catch (err) {
    return;
  }

  const extractedComment = convert.mapFileCommentRegex.exec(code)!;

  if ( !extractedComment ) {
    return { code };
  }

  try {
    const { map } = await handleSourceMappingURL( extractedComment, path );

    // TODO: Handle `map.sections`

    map.sourcesContent ??= await updateSourcesContent( map );

    return {
      code,
      map
    };
  } catch {
    return { code };
  }
}

/**
 * Loads the source map information from the data URL and file path.
 */
async function handleSourceMappingURL(
  extractedComment: RegExpExecArray,
  sourcePath: string,
): Promise<{ map: SourceMap; path: string | null }> {
  const [ comment, souceMappingURL ] = extractedComment;

  const { converter, path } = await ( async () => {
    if ( souceMappingURL.startsWith( 'data' ) ) {
      return {
        converter: convert.fromComment( comment ),
        path: null
      };
    }

    const path = join( sourcePath, '..', souceMappingURL );
    const file = await readFile( path, { encoding: 'utf8' } );

    return {
      converter: convert.fromJSON( file ),
      path
    };
  } )();

  return {
    map: parseSourceMapInput( converter.toJSON() ),
    path
  };
}

async function updateSourcesContent( { sources, sourceRoot }: SourceMap ): Promise<SourceMap[ 'sourcesContent' ]> {
  const sourcesContent: SourceMap['sourcesContent'] = new Array( sources.length ).fill( null );

  for ( const [ index, source ] of sources.entries() ) {
    const path = sourceRoot ? join( sourceRoot, source ) : source;

    // TODO: Load files in parallel to improve performance
    sourcesContent[ index ] = await readFile( path, { encoding: 'utf8' } );
  }

  return sourcesContent;
}
