import { dirname, join } from 'path';
import { readFile } from 'fs/promises';
import convert, { type SourceMapConverter } from 'convert-source-map';
import type { TransformResult } from 'unplugin';

interface SourceMap {
  version: number;
  file?: string;
  sourceRoot?: string;
  sources: Array<string>;
  sourcesContent?: Array<string | null>;
  names: Array<string>;
  mappings: string;
}

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 *
 * https://github.com/mozilla/source-map/blob/3cb92cc3b73bfab27c146bae4ef2bc09dbb4e5ed/lib/util.js#L162-L164
 */
export function parseSourceMapInput( str: string ): SourceMap {
  return JSON.parse( str.replace( /^\)]}'[^\n]*\n/, "" ) );
}

export async function loadCodeAndMap( path: string ): Promise<TransformResult> {
  let code: string = '';

  try {
    code = await readFile(path, { encoding: 'utf8' });
  } catch (err) {
    return;
  }

  const extractedComment = convert.mapFileCommentRegex.exec(code)!;

  if ( !extractedComment ) {
    return {
      code
    };
  }

  let converter: SourceMapConverter;

  try {
    converter = await handleSourceMappingURL(extractedComment, path);
  } catch (err) {
    return {
      code
    };
  }

  const map = parseSourceMapInput( converter.toJSON() );

  if ( map ) {
    // Make sure that the sourceRoot ends with a slash
    map.sourceRoot = dirname( path.replace( /\/?$/, '/' ) )
  }

  // TODO: `map.sections` ??
  // TODO: Handle missing `sourcesContent`

  return {
    code,
    map
  };
}

async function handleSourceMappingURL( extractedComment: RegExpExecArray, sourcePath: string ): Promise<SourceMapConverter> {
  const [ comment, souceMappingURL ] = extractedComment;

  // TODO: Handle souceMappingURL being an actual URL

  if ( souceMappingURL.startsWith('data') ) {
    return convert.fromComment(comment);
  }

  const path = join( sourcePath, '..', souceMappingURL );
  const file = await readFile(path, { encoding: 'utf8' });
  return convert.fromJSON(file);
}
