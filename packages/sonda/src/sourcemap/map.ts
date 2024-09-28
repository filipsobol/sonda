import { default as remapping, type DecodedSourceMap, type EncodedSourceMap } from '@ampproject/remapping';
import { loadCodeAndMap } from './load';
import { resolve } from 'path';
import type { ReportInput } from '../types';
import { normalizePath } from '../utils';

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

		const codeMap = loadCodeAndMap( resolve( dirPath, file ) );

		if ( !codeMap ) {
			return;
		}

		const parentPath = normalizePath( file );
		const { format } = inputs[ parentPath ];

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

		ctx.content ??= codeMap.code;

		return codeMap.map;
	}, { decodedMappings: true } );

	return remapped as DecodedSourceMap;
}
