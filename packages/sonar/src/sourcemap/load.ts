import { readFileSync } from 'fs';
import { dirname, join, resolve, isAbsolute } from 'path';
import convert from 'convert-source-map';
import type { SourceMap, MaybeCodeMap } from '../types.js';

/**
 * Loads code and (optionally) source map from a given file. If the file is missing
 * the `sourcesContent` field, it will be populated based on the `sources` field paths.
 */
export function loadCodeAndMap( codePath: string ): MaybeCodeMap {
  let code: string = '';

  try {
    code = readFileSync( codePath, 'utf-8' );
  } catch (err) {
    return null;
  }

  const extractedComment = /(?:\/\/|\/\*)[@#][ \t]+sourceMappingURL=([^\s*'"`]+)[ \t]*\*?\/*/mg.exec( code );

  if ( !extractedComment ) {
    return { code };
  }

  const { map, mapPath } = handleSourceMappingURL( extractedComment, codePath );

  // TODO: Handle `map.sections`
  // https://tc39.es/source-map/#index-map

  // map.sourcesContent ??= await updateSourcesContent( map );
  map.sources = normalizeSourcesPaths( map, mapPath );
  delete map.sourceRoot;

  return {
    code,
    map
  };
}

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented in the source maps specification),
 * and parses the string as JSON.
 *
 * https://github.com/mozilla/source-map/blob/3cb92cc3b73bfab27c146bae4ef2bc09dbb4e5ed/lib/util.js#L162-L164
 */
function parseSourceMapInput( str: string ): SourceMap {
  return JSON.parse( str.replace( /^\)]}'[^\n]*\n/, "" ) );
}

/**
 * Loads the source map information from the data URL and file path.
 */
function handleSourceMappingURL(
  extractedComment: RegExpExecArray,
  sourcePath: string,
): { map: SourceMap; mapPath: string } {
  const comment = extractedComment[0];
  const souceMappingURL = extractedComment[1];

  const { converter, mapPath } = ( () => {
    if ( souceMappingURL.startsWith( 'data' ) ) {
      return {
        converter: convert.fromComment( comment ),
        mapPath: sourcePath
      };
    }

    const mapPath = join( sourcePath, '..', souceMappingURL );
    const file = readFileSync( mapPath, 'utf-8' );

    return {
      converter: convert.fromJSON( file ),
      mapPath
    };
  } )();

  return {
    map: parseSourceMapInput( converter.toJSON() ),
    mapPath
  };
}

/*
function updateSourcesContent( { sources, sourceRoot }: SourceMap ): Promise<SourceMap[ 'sourcesContent' ]> {
  return Promise.all(
    sources.map( source => readFile( join( sourceRoot ?? '', source ), 'utf-8' ) )
  );
}
*/

function normalizeSourcesPaths( map: SourceMap, mapPath: string ): SourceMap['sources'] {
  const mapDir = dirname( mapPath );

  return map.sources.map( source => {
    return isAbsolute( source )
      ? source
      : resolve( mapDir, map.sourceRoot ?? '.', source );
  } );
}
