import { gzipSync, brotliCompressSync } from 'zlib';
import type { DecodedSourceMap } from '@ampproject/remapping';
import type { Sizes } from '../types';

export function getBytesPerSource( code: string, map: DecodedSourceMap ): Map<string, Sizes> {
	const contributions = new Array( map.sources.length ).fill( '' );

	// Split the source code by lines
	const codeLines = code.split( /(?<=\r?\n)/ );

	for ( let lineIndex = 0; lineIndex < map.mappings.length; lineIndex++ ) {
		const line = map.mappings[ lineIndex ];
		const lineCode = codeLines[ lineIndex ];

		for ( let mappingIndex = 0; mappingIndex < line.length; mappingIndex++ ) {
			// 0: generatedColumn
			// 1: fileIndex
			// 2: originalLine
			// 3: originalColumn
			// 4: nameIndex

			const [ startColumn, fileIndex ] = line[ mappingIndex ];
			const endColumn = line[ mappingIndex + 1 ]?.[ 0 ] ?? lineCode.length;

			contributions[ fileIndex! ] += lineCode.slice( startColumn, endColumn );
		}
	}

	return new Map<string, Sizes>( 
		contributions.map( ( code, index ) => [ map.sources[ index ]!, getSizes( code ) ] )
	);
}

export function getSizes( code: string ): Sizes {
	return {
		uncompressed: Buffer.byteLength( code ),
		gzip: gzipSync( code ).length,
		brotli: brotliCompressSync( code ).length
	};
}
