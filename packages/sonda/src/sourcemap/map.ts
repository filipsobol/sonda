import { default as remapping, type DecodedSourceMap, type EncodedSourceMap } from '@ampproject/remapping';
import { loadCodeAndMap } from 'load-source-map';
import { resolve } from 'path';
import { normalizePath } from '../utils.js';
import type { CodeMap, ReportInput } from '../types.js';

export function mapSourceMap(
	map: EncodedSourceMap,
	dirPath: string,
	inputs: Record<string, ReportInput>
): DecodedSourceMap {
	const alreadyRemapped = new Set<string>();
	const remapped = remapping( map, ( file, ctx ) => {
		if ( alreadyRemapped.has( file ) ) {
			return;
		}

		alreadyRemapped.add( file );

		const codeMap = addSourcesToInputs(
			resolve( dirPath, file ),
			inputs
		);

		if ( !codeMap ) {
			return;
		}

		ctx.content ??= codeMap.code;

		return codeMap.map;
	}, { decodedMappings: true } );

	return remapped as DecodedSourceMap;
}

/**
 * Loads the source map of a given file and adds its "sources" to the given inputs object.
 */
export function addSourcesToInputs(
	path: string,
	inputs: Record<string, ReportInput>
): CodeMap | null {
	const codeMap = loadCodeAndMap( path );

	if ( !codeMap ) {
		return null;
	}

	const parentPath = normalizePath( path );
	const format = inputs[ parentPath ]?.format ?? 'unknown';

	codeMap.map?.sources
		.filter( source => source !== null )
		.forEach( ( source, index ) => {
			const normalizedPath = normalizePath( source );

			if ( parentPath === normalizedPath ) {
				return;
			}

			inputs[ normalizedPath ] = {
				bytes: Buffer.byteLength( codeMap.map!.sourcesContent?.[ index ] ?? '' ),
				format,
				imports: [],
				belongsTo: parentPath
			};
		} );
	
	return codeMap;
}
