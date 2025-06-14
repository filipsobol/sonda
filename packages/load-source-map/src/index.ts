import { existsSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve, isAbsolute } from 'path';

export type SourcesPathNormalizer = ( path: string, sourceRoot: string ) => string;

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

/**
 * Checks if the given path is a file.
 */
function isFile( path: string ): boolean {
	try {
		return statSync( path ).isFile();
	} catch {
		return false;
	}
}

/**
 * Default path normalizer that resolves the path relative to the source root.
 */
function defaultPathNormalizer( path: string, sourceRoot: string ): string {
	return isAbsolute( path ) ? path : resolve( sourceRoot, path );
}

export function loadCodeAndMap(
	codePath: string,
	sourcesPathNormalizer?: SourcesPathNormalizer
): MaybeCodeMap {
	if ( !isFile( codePath ) ) {
		return null;
	}

	const code = readFileSync( codePath, 'utf-8' );
	const maybeMap = loadMap( codePath, code );

	if ( !maybeMap ) {
		return { code };
	}

	const { map, mapPath } = maybeMap;
	const sourceRoot = resolve( dirname( mapPath ), map.sourceRoot ?? '.' );
	const normalizer = sourcesPathNormalizer || defaultPathNormalizer;

	map.sources = map.sources.map( source => source && normalizer( source, sourceRoot ) );
	map.sourcesContent = loadMissingSourcesContent( map );

	delete map.sourceRoot;

	return {
		code,
		map
	};
}

function loadMap( codePath: string, code: string ): { map: SourceMapV3; mapPath: string } | null {
	/**
	 * Because in most cases the source map has the same name as the code file,
	 * we can try to append `.map` to the code path and check if the file exists.
	 */
	try {
		const possibleMapPath = codePath + '.map';
		const map = readFileSync( possibleMapPath, 'utf-8' );

		return {
			map: parseSourceMapInput( map ),
			mapPath: possibleMapPath
		}
	} catch {}

	/**
	 * If the source map is not found by file name, we can try to extract it from the code.
	 * The path to the source map is usually in a comment at the end of the file, but it can
	 * also be inlined in the code itself.
	 */
	const extractedComment = code.includes( 'sourceMappingURL' ) && Array.from( code.matchAll( sourceMappingRegExp ) ).at( -1 );

	if ( !extractedComment || !extractedComment.length ) {
		// There's no source map comment in the code.
		return null;
	}

	const sourceMappingURL = extractedComment[ 1 ];

	if ( sourceMappingURL.startsWith( 'data:' ) ) {
		// The source map is inlined in the code.
		const map = parseDataUrl( sourceMappingURL );

		return {
			map: parseSourceMapInput( map ),
			mapPath: codePath
		};
	}

	// The source map comment is a path to a file.
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
 * Loop through the sources and try to load missing `sourcesContent` from the file system.
 */
function loadMissingSourcesContent( map: SourceMapV3 ): Array<string | null> {
	return map.sources.map( ( source, index ) => {
		if ( map.sourcesContent?.[ index ] ) {
			return map.sourcesContent[ index ];
		}

		if ( source && existsSync( source ) ) {
			return readFileSync( source, 'utf-8' );
		}

		return null;
	} );
}
