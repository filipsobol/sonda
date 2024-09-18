import { readFileSync } from 'fs';
import { dirname, join, resolve, isAbsolute } from 'path';
import type { SourceMap, MaybeCodeMap } from '../types.js';

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
	sourceMappingURL=data:application/json;charset=utf-8;base64,data
 	sourceMappingURL=data:application/json;base64,data
	sourceMappingURL=data:application/json;uri,data
	sourceMappingURL=map-file-comment.css.map
*/
const sourceMappingRegExp = /[@#]\s*sourceMappingURL=(\S+)\s*/;

export function loadCodeAndMap( codePath: string ): MaybeCodeMap {
	try {
		const code = readFileSync( codePath, 'utf-8' );

		const extractedComment = code.includes( 'sourceMappingURL' ) && sourceMappingRegExp.exec( code );

		if ( !extractedComment ) {
			return { code };
		}

		const { map, mapPath } = loadMap( codePath, extractedComment[ 1 ] );
		map.sources = normalizeSourcesPaths( map, mapPath );
		delete map.sourceRoot;

		return {
			code,
			map
		};
	} catch {
		return null;
	}
}

function loadMap( codePath: string, sourceMappingURL: string ): { map: SourceMap; mapPath: string } {
	if ( sourceMappingURL.startsWith( 'data:' ) ) {
		const map = parseDataUrl( sourceMappingURL );

		return {
			map: parseSourceMapInput( map ),
			mapPath: codePath
		};
	}

	const mapPath = join( codePath, '..', sourceMappingURL );

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

function normalizeSourcesPaths( map: SourceMap, mapPath: string ): SourceMap[ 'sources' ] {
	const mapDir = dirname( mapPath );

	return map.sources.map( source => {
		return isAbsolute( source )
			? source
			: resolve( mapDir, map.sourceRoot ?? '.', source );
	} );
}
