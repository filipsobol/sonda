import { resolve } from 'path';
import { readFileSync } from 'fs';
import { loadCodeAndMap } from 'load-source-map';
import { default as remapping, type DecodedSourceMap, type EncodedSourceMap } from '@ampproject/remapping';
import { Report } from '../report.js';
import { Config } from '../../config.js';
import { getBytesPerSource, getSizes, UNASSIGNED } from './sourcemap.js';
import { getTypeByName, normalizePath } from '../../utils.js';
import type { AssetResource, FileType } from '../types.js';

export type AssetsWithEntrypoints = Array<[ string, Array<string> | undefined ]>;

const RESOURCE_TYPES_TO_ANALYZE: Array<FileType> = [
	'script',
	'style'
];

const parentMap: Record< string, string> = {};

/**
 * Update the report with the output assets and their sources from the source map.
 */
export function updateOutput(
	report: Report,
	path: string,
	entrypoints: Array<string> | undefined,
): void {
	const type = getTypeByName( path );

	RESOURCE_TYPES_TO_ANALYZE.includes( type )
		? addAnalyzableType( report, path, entrypoints, type )
		: addNonAnalyzableType( report, path, type );
}

/**
 * Adds simple assets like fonts, images, etc. to the report without analyzing their content or dependencies.
 */
function addNonAnalyzableType( report: Report, path: string, type: FileType ): void {
	const content = readFileSync( path );
	const sizes = getSizes( content, report.config );

	report.addResource( {
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
function addAnalyzableType( report: Report, path: string, entrypoints: Array<string> | undefined, type: FileType ): void {
	const assetName = normalizePath( path );
	const codeMap = getSource( path, report.config );

	if ( !codeMap ) {
		return addNonAnalyzableType( report, path, type );
	}

	const { code, map } = codeMap;
	const sizes = getSizes( code, report.config );
	const sourcesSizes = getBytesPerSource( code, map, sizes, report.config );
	const sourcemap = report.config.sources ? normalizeSourceMap( map ) : null;

	report.addResource( {
		kind: 'asset',
		name: assetName,
		type,
		...sizes,
		sourcemap
	} );

	// Add `asset => entrypoint` connections
	entrypoints?.forEach( entry => report.addConnection( {
		kind: 'entrypoint',
		source: assetName,
		target: normalizePath( entry ),
		original: null
	} ) );

	// Add each source map source as a report "chunk"
	for ( const [ source, sizes ] of sourcesSizes ) {
		const name = normalizePath( source );
		const type = getTypeByName( source );
		const parent = parentMap[ source ];
		const existingSource = report.resources.find( resource => resource.name === name && resource.kind === 'filesystem' );

		// If source was not already added from "filesystem" then add it as a "sourcemap"
		if ( !existingSource && source !== UNASSIGNED ) {
			const index = map.sources.indexOf( source );
			const { uncompressed } = getSizes(
				map.sourcesContent?.[ index ] || '',
				{ gzip: false, brotli: false }
			);

			report.addResource( {
				kind: 'sourcemap',
				name,
				type,
				format: 'other',
				uncompressed,
				parent: parent ? normalizePath( parent ) : null
			} );
		}

		report.addResource( {
			kind: 'chunk',
			name,
			type,
			format: existingSource?.format || 'other',
			...sizes,
			parent: assetName
		} );

		if ( parent ) {
			// Add `bundle => sourcemap` connection
			report.addConnection( {
				kind: 'sourcemap',
				source: normalizePath( parent ),
				target: name,
				original: null
			} );
		}
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
function getSource( path: string, config: Config ): { code: string, map: DecodedSourceMap } | null {
	const codeMap = loadCodeAndMap( path, config.sourcesPathNormalizer );

	if ( !codeMap || !codeMap.map ) {
		return null;
	}

	return {
		code: codeMap.code,
		map: parseSourceMap( codeMap.map, config.deep )
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
