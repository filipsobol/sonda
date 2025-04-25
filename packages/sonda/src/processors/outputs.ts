import { resolve, dirname } from 'path';
import { readFile } from 'fs/promises';
import { loadCodeAndMap } from 'load-source-map';
import {
	default as remapping,
	type DecodedSourceMap,
	type EncodedSourceMap
} from '@ampproject/remapping';
import { getBytesPerSource, getSizes, UNASSIGNED } from '../sourcemap/bytes.js';
import { getTypeByName, sortObjectKeys, normalizePath } from '../utils.js';
import type { CodeMap, MaybeCodeMap } from '../types.js';
import type { Report, Output, OutputInput, Sizes } from '../report.js';

export async function updateOutputs(
	report: Report,
	assets: Array<string>,
): Promise<void> {
	for ( const asset of assets ) {
		const name = normalizePath( asset );
		const type = getTypeByName( asset );
		const content = await readFile( asset, 'utf-8' );
		const sizes = getSizes( content, report.metadata );
		const inputsAndMap = type === 'script' || type === 'style'
			? processAsset( name, sizes, report )
			: undefined;
		
		report.addOutput( name, {
			type,
			...sizes,
			...inputsAndMap
		} );
	}
}

function processAsset(
	assetPath: string,
	sizes: Sizes,
	report: Report
): Pick<Output, 'inputs' | 'map'> | undefined {
	const codeMap = loadCodeAndMap( assetPath, report.config.sourcesPathNormalizer );

	if ( !hasCodeAndMap( codeMap ) ) {
		return;
	}

	const format = report.getInput( assetPath )?.format ?? 'unknown';
	const remapped = parseSourceMap( assetPath, codeMap.map, report );

	remapped.sources = remapped.sources.map( source => source && normalizePath( source ) );

	const outputInputs = Array
		.from( getBytesPerSource( codeMap.code, remapped, sizes, report.config ) )
		.reduce( ( carry, [ source, sizes ] ) => {
			const name = normalizePath( source );

			if ( source !== UNASSIGNED && !report.getInput( name ) ) {
				const index = remapped.sources.indexOf( source );

				report.addInput( name, {
					bytes: Buffer.byteLength( remapped.sourcesContent?.[ index ] ?? '' ),
					type: getTypeByName( name ),
					format,
					imports: [],
					belongsTo: assetPath,
				} );
			}

			carry[ name ] = sizes;

			return carry;
		}, {} as Record<string, OutputInput> );

	return {
		inputs: sortObjectKeys( outputInputs ),
		map: report.config.sources ? {
			version: 3,
			names: [],
			mappings: remapped.mappings,
			sources: remapped.sources,
			sourcesContent: remapped.sourcesContent,
		} : undefined
	};
}

/**
 * Parse the source map. If `options.deep` is set to `true`, it will
 * recursively load the source maps of the sources until it finds
 * the original source. Otherwise, it will only decode the source map.
 */
function parseSourceMap(
	assetPath: string,
	map: EncodedSourceMap,
	report: Report
): DecodedSourceMap {
	const { deep } = report.config;
	const dirPath = dirname( assetPath );
	const alreadyRemapped = new Set<string>();

	return remapping( map, ( file, ctx ) => {
		if ( !deep || alreadyRemapped.has( file ) ) {
			return;
		}

		alreadyRemapped.add( file );

		const codeMap = loadCodeAndMap( resolve( dirPath, file ) );

		if ( !codeMap ) {
			return;
		}

		ctx.content ??= codeMap.code;

		return codeMap.map;
	}, { decodedMappings: true } ) as DecodedSourceMap;
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
	return Boolean( result && result.code && result.map );
}
