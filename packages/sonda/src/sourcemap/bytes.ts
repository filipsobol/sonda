import type { DecodedSourceMap } from '@ampproject/remapping';

export function getBytesPerSource( code: string, map: DecodedSourceMap ): Map<string, number> {
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

			// TODO: What if fileIndex is null / undefined?
			contributions[ fileIndex! ] += lineCode.slice( startColumn, endColumn );
		}
	}

	return new Map<string, number>( 
		contributions.map( ( code, index ) => [ map.sources[ index ]!, Buffer.byteLength( code ) ] )
	);
}
