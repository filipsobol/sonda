import { loadCodeAndMap } from 'load-source-map';
import { ReportProducer, type FileType } from '../producer.js';
import { Config } from '../../config.js';
import { getTypeByName, normalizePath, parseSourceMap } from '../../utils.js';
import { getBytesPerSource, getSizes } from '../../sourcemap/bytes.js';
import type { DecodedSourceMap } from '@ampproject/remapping';
import type { CodeMap, MaybeCodeMap } from '../../types.js';

const RESOURCE_TYPES_TO_ANALYZE: Array<FileType> = [
	'script',
	'style',
];

/**
 * Update the report with the output assets and their sources from the source map.
 */
export function updateOutputs(
	report: ReportProducer,
	assets: Array<string>,
): void {
	for ( const asset of assets ) {
		const type = getTypeByName( asset );

		if ( type === 'other' ) {
			continue;
		}

		const assetName = normalizePath( asset );
		const { code, map } = getSource( type, asset, report.config );
		const sizes = getSizes( code, report.metadata );
		const sourcesSizes = map ? getBytesPerSource( code, map, sizes, report.config ) : [];
		const sourcemap = report.config.sources && map
			? { mappings: map.mappings, sources: map.sources, sourcesContent: map.sourcesContent }
			: null

		report.resources.push( {
			kind: 'asset',
			name: assetName,
			type,
			...sizes,
			sourcemap
		} );

		for ( const [ source, sizes ] of sourcesSizes ) {
			const sourceName = normalizePath( source );
			const existingSource = report.resources.find( resource => resource.name === sourceName );

			report.resources.push( {
				kind: 'chunk',
				name: sourceName,
				type: getTypeByName( source ),
				format: existingSource?.format || null,
				...sizes,
				parent: assetName
			} );

			report.edges.push( {
				target: assetName,
				source: sourceName,
			} );
		}
	}
}

/**
 * Load the code and source map from the given path. If the `deep` option
 * is enabled, it will recursively load the source maps of the sources
 * until it finds the original source.
 */
function getSource(
	type: FileType,
	path: string,
	config: Config
): { code: string, map: DecodedSourceMap | undefined } {
	if ( !RESOURCE_TYPES_TO_ANALYZE.includes( type ) ) {
		return { code: '', map: undefined };
	}

	const codeMap = loadCodeAndMap( path, config.sourcesPathNormalizer );

	if ( !hasCodeAndMap( codeMap ) ) {
		throw new Error( `Sonda: Failed to load the output asset or its source map: "${ path }"` );
	}

	const { code, map } = codeMap;
	const remapped = parseSourceMap( map, config.deep );

	remapped.sources = remapped.sources.map( source => source && normalizePath( source ) );

	return { code, map: remapped };
}

/**
 * Check if the result of `loadCodeAndMap` has both code and map.
 */
function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
	return Boolean( result && result.code && result.map );
}
