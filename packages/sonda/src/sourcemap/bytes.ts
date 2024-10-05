import { gzipSync, brotliCompressSync } from 'zlib';
import type { DecodedSourceMap, SourceMapSegment } from '@ampproject/remapping';
import type { Options, Sizes } from '../types';

const UNASSIGNED = '[unassigned]';

export function getBytesPerSource(
	code: string,
	map: DecodedSourceMap,
	assetSizes: Sizes,
	options: Options
): Map<string, Sizes> {
	const contributions = getContributions( map.sources );

	// Split the code into lines
	const codeLines = code.split( /(?<=\r?\n)/ );

	for ( let lineIndex = 0; lineIndex < codeLines.length; lineIndex++ ) {
		const lineCode = codeLines[ lineIndex ];
		const mappings = map.mappings[ lineIndex ] || [];
		let currentColumn = 0;

		for ( let i = 0; i <= mappings.length; i++ ) {
			// 0: generatedColumn
			// 1: sourceIndex
			// 2: originalLine
			// 3: originalColumn
			// 4: nameIndex

			const mapping: SourceMapSegment | undefined = mappings[ i ];
			const startColumn = mapping?.[ 0 ] ?? lineCode.length;
			const endColumn = mappings[ i + 1 ]?.[ 0 ] ?? lineCode.length;

			// Slice the code from currentColumn to startColumn for unassigned code
			if ( startColumn > currentColumn ) {
				contributions.set( UNASSIGNED, contributions.get( UNASSIGNED ) + lineCode.slice( currentColumn, startColumn ) );
			}

			if ( mapping ) {
				// Slice the code from startColumn to endColumn for assigned code
				const sourceIndex = mapping?.[ 1 ];
				const codeSlice = lineCode.slice( startColumn, endColumn );
				const source = sourceIndex !== undefined ? map.sources[ sourceIndex ]! : UNASSIGNED;

				contributions.set( source, contributions.get( source ) + codeSlice );
				currentColumn = endColumn;
			} else {
				currentColumn = startColumn;
			}
		}
	}

	// Compute sizes for each source
	const sourceSizes = new Map<string, Sizes>();

	const contributionsSum: Sizes = {
		uncompressed: 0,
		gzip: 0,
		brotli: 0
	};

	for ( const [ source, codeSegment ] of contributions ) {
		const sizes = getSizes( codeSegment, options );

		contributionsSum.uncompressed += sizes.uncompressed;
		contributionsSum.gzip += sizes.gzip;
		contributionsSum.brotli += sizes.brotli;

		sourceSizes.set( source, sizes );
	}

	return adjustSizes( sourceSizes, assetSizes, contributionsSum, options );
}

export function getSizes(
	code: string,
	options: Options
): Sizes {
	return {
		uncompressed: Buffer.byteLength( code ),
		gzip: options.gzip ? gzipSync( code ).length : 0,
		brotli: options.brotli ? brotliCompressSync( code ).length : 0
	};
}

function getContributions( sources: Array<string | null> ): Map<string, string> {
	const contributions = new Map<string, string>();

	// Populate contributions with sources
	sources
		.filter( source => source !== null )
		.forEach( source => contributions.set( source, '' ) );

	// Add entry for the code that is not assigned to any source
	contributions.set( UNASSIGNED, '' );

	return contributions;
}

/**
 * Compression efficiency improves with the size of the file.
 *
 * However, what we have is the compressed size of the entire bundle (`actual`),
 * the sum of all files compressed individually (`sum`) and the compressed
 * size of a given file (`content`). The last value is essentially a “worst-case”
 * scenario, and the actual size of the file in the bundle is likely to be smaller.
 *
 * We use this information to estimate the actual size of the file in the bundle
 * after compression.
 */
function adjustSizes(
	sources: Map<string, Sizes>,
	asset: Sizes,
	sums: Sizes,
	options: Options
): Map<string, Sizes> {
	const gzipDelta = options.gzip ? asset.gzip / sums.gzip : 0;
	const brotliDelta = options.brotli ? asset.brotli / sums.brotli : 0;

	for ( const [ source, sizes ] of sources ) {
		sources.set( source, {
			uncompressed: sizes.uncompressed,
			gzip: options.gzip ? Math.round( sizes.gzip * gzipDelta ) : 0,
			brotli: options.brotli ? Math.round( sizes.brotli * brotliDelta ) : 0
		} );
	}

	return sources;
}
