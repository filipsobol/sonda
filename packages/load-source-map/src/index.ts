import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve, isAbsolute } from 'path';

export interface SourceMapV3 {
	file?: string | null;
	names: string[];
	sourceRoot?: string;
	sources: ( string | null )[];
	sourcesContent?: ( string | null )[];
	mappings: string;
	version: 3;
	ignoreList?: number[];
}

export interface CodeMap {
	code: string;
	map?: SourceMapV3;
}

export type MaybeCodeMap = CodeMap | null;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented in the source maps specification),
 * and parses the string as JSON.
 *
 * https://github.com/mozilla/source-map/blob/3cb92cc3b73bfab27c146bae4ef2bc09dbb4e5ed/lib/util.js#L162-L164
 */
function parseSourceMapInput( str: string ): SourceMapV3 {
	return JSON.parse( str.replace( /^\)]}'[^\n]*\n/, "" ) );
}

/**
	sourceMappingURL=data:application/json;charset=utf-8;base64,data
	sourceMappingURL=data:application/json;base64,data
	sourceMappingURL=data:application/json;uri,data
	sourceMappingURL=map-file-comment.css.map
	sourceMappingURL=map-file-comment.css.map?query=value
*/
const sourceMappingRegExp = /[@#]\s*sourceMappingURL=(\S+)\b/g;

export function loadCodeAndMap( codePath: string ): MaybeCodeMap {
	if ( !existsSync( codePath ) ) {
		return null;
	}

	const code = readFileSync( codePath, 'utf-8' );

	const extractedComment = code.includes( 'sourceMappingURL' ) && Array.from( code.matchAll( sourceMappingRegExp ) ).at( -1 );

	if ( !extractedComment || !extractedComment.length ) {
		return { code };
	}

	const maybeMap = loadMap( codePath, extractedComment[ 1 ] );

	if ( !maybeMap ) {
		return { code };
	}

	const { map, mapPath } = maybeMap;

	map.sources = normalizeSourcesPaths( map, mapPath );
	map.sourcesContent = loadMissingSourcesContent( map );

	delete map.sourceRoot;

	return {
		code,
		map
	};
}

function loadMap( codePath: string, sourceMappingURL: string ): { map: SourceMapV3; mapPath: string } | null {
	if ( sourceMappingURL.startsWith( 'data:' ) ) {
		const map = parseDataUrl( sourceMappingURL );

		return {
			map: parseSourceMapInput( map ),
			mapPath: codePath
		};
	}

	const sourceMapFilename = new URL( sourceMappingURL, 'file://' ).pathname;
	const mapPath = join( dirname( codePath ), sourceMapFilename );

	if ( !existsSync( mapPath ) ) {
		return null;
	}

	return {
		map: parseSourceMapInput( readFileSync( mapPath, 'utf-8' ) ),
		mapPath
	};
}

function parseDataUrl( url: string ): string {
	const [ prefix, payload ] = url.split( ',' );
	const encoding = prefix.split( ';' ).at( -1 );

	switch ( encoding ) {
		case 'base64':
			return Buffer.from( payload, 'base64' ).toString();
		case 'uri':
			return decodeURIComponent( payload );
		default:
			throw new Error( 'Unsupported source map encoding: ' + encoding );
	}
}

/**
 * Normalize the paths of the sources in the source map to be absolute paths.
 */
function normalizeSourcesPaths( map: SourceMapV3, mapPath: string ): SourceMapV3[ 'sources' ] {
	const mapDir = dirname( mapPath );

	return map.sources.map( source => {
		if ( !source ) {
			return source;
		}

		return isAbsolute( source )
			? source
			: resolve( mapDir, map.sourceRoot ?? '.', source );
	} );
}

/**
 * Loop through the sources and try to load missing `sourcesContent` from the file system.
 */
function loadMissingSourcesContent( map: SourceMapV3 ): Array<string | null> {
	return map.sources.map( ( source, index ) => {
		if ( !source ) {
			return null;
		}

		return map.sourcesContent?.[ index ] || readFileSync( source, 'utf-8' )
	} );
}
