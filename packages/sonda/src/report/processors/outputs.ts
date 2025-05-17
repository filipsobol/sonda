import { resolve } from 'path';
import { readFileSync } from 'fs';
import { loadCodeAndMap } from 'load-source-map';
import { default as remapping, type DecodedSourceMap, type EncodedSourceMap } from '@ampproject/remapping';
import { Report } from '../report.js';
import { Config } from '../../config.js';
import { getBytesPerSource, getSizes } from '../../sourcemap/bytes.js';
import { getTypeByName, normalizePath } from '../../utils.js';
import type { AssetResource, FileType } from '../types.js';

const RESOURCE_TYPES_TO_ANALYZE: Array<FileType> = [
	'script',
	'style'
];

const parentMap: Record< string, string> = {};

/**
 * Update the report with the output assets and their sources from the source map.
 */
export function updateOutputs(
	report: Report,
	assets: Array<string>,
): void {
	for ( const asset of assets ) {
		const type = getTypeByName( asset );

		RESOURCE_TYPES_TO_ANALYZE.includes( type )
			? addAnalyzableType( report, asset, type )
			: addNonAnalyzableType( report, asset, type );
	}
}

/**
 * Adds simple assets like fonts, images, etc. to the report without analyzing their content or dependencies.
 */
function addNonAnalyzableType( report: Report, path: string, type: FileType ): void {
	const content = readFileSync( path );
	const sizes = getSizes( content, report.metadata );

	report.resources.push( {
		kind: 'asset',
		name: normalizePath( path ),
		type,
		...sizes,
		sourcemap: null
	} );
}

/**
 * Adds code assets like scripts and styles to the report and analyzes their content
 * to find their sources and dependencies.
 */
function addAnalyzableType( report: Report, path: string, type: FileType ): void {
	const assetName = normalizePath( path );
	const { code, map } = getSource( path, report.config );
	const sizes = getSizes( code, report.metadata );
	const sourcesSizes = getBytesPerSource( code, map, sizes, report.config );
	const sourcemap = report.config.sources ? normalizeSourceMap( map ) : null;

	report.resources.push( {
		kind: 'asset',
		name: assetName,
		type,
		...sizes,
		sourcemap
	} );

	// If not already present, add each source map source as report "source"
	for ( const [ index, path ] of map.sources.entries() ) {
		if ( path === null ) {
			// Skip if the source is null
			continue;
		}

		const existingSource = report.resources.find( resource => resource.name === path && resource.kind === 'source' );

		if ( existingSource ) {
			// Skip if the source is already in the report
			continue;
		}

		const { uncompressed } = getSizes(
			map.sourcesContent?.[ index ] || '',
			{ gzip: false, brotli: false }
		);

		report.resources.push( {
			kind: 'source',
			name: normalizePath( path ),
			type: getTypeByName( path ),
			format: 'other',
			uncompressed: uncompressed
		} )
	}

	// Add each source map source as a report "chunk"
	for ( const [ source, sizes ] of sourcesSizes ) {
		const name = normalizePath( source );
		const type = getTypeByName( source );
		const isDeepDependency = !!parentMap[ source ];
		const parentName = isDeepDependency ? normalizePath( parentMap[ source ] ) : assetName;
		const existingSource = report.resources.find( resource => resource.name === name && resource.kind === 'source' );

		report.resources.push( {
			kind: 'chunk',
			name,
			type,
			format: existingSource?.format || 'other',
			...sizes,
			parent: parentName
		} );

		report.edges.push( {
			target: parentName,
			source: name,
		} );
	}
}

/**
 * Normalize the source map to a format expected by the report.
 */
function normalizeSourceMap( map: DecodedSourceMap ): AssetResource[ 'sourcemap' ] {
	return {
		mappings: map.mappings,
		sources: map.sources.map( source => source && normalizePath( source ) ),
		sourcesContent: map.sourcesContent
	};
}

/**
 * Load the code and source map from the given path. If the `deep` option
 * is enabled, it will recursively load the source maps of the sources
 * until it finds the original source.
 */
function getSource( path: string, config: Config ): { code: string, map: DecodedSourceMap } {
	const { code, map } = loadCodeAndMap( path, config.sourcesPathNormalizer )!;

	return {
		code,
		map: parseSourceMap( map!, config.deep )
	};
}

/**
 * Parse the source map. If `options.deep` is set to `true`, it will
 * recursively load the source maps of the sources until it finds
 * the original source. Otherwise, it will only decode the source map.
 */
function parseSourceMap( map: EncodedSourceMap, deep: boolean ): DecodedSourceMap {
	const alreadyRemapped = new Set<string>();

	return remapping( map, ( file, ctx ) => {
		if ( !deep || alreadyRemapped.has( file ) ) {
			return;
		}

		alreadyRemapped.add( file );

		// TODO: Update how path is resolved?
		// Replace `process.cwd()` with `dirPath`?
		const codeMap = loadCodeAndMap( resolve( process.cwd(), file ) );

		if ( !codeMap ) {
			return;
		}

		ctx.content ??= codeMap.code;

		codeMap.map?.sources
			.filter( ( source ): source is string => source !== null && file !== source )
			.forEach( source => parentMap[ source ] = file );

		return codeMap.map;
	}, { decodedMappings: true } ) as DecodedSourceMap;
}
