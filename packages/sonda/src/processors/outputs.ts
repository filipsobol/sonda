import { dirname } from 'path';
import { readFile } from 'fs/promises';
import { decode } from '@jridgewell/sourcemap-codec';
import { loadCodeAndMap } from 'load-source-map';
import { mapSourceMap } from '../sourcemap/map.js';
import { getBytesPerSource, getSizes } from '../sourcemap/bytes.js';
import { getTypeByName, sortObjectKeys, normalizePath } from '../utils.js';
import type { Config } from '../config.js';
import type { CodeMap, MaybeCodeMap } from '../types.js';
import type { Input, Output, OutputInput, JsonReport, Sizes } from '../report.js';

export async function getOutputs(
	assets: Array<string>,
	inputs: JsonReport[ 'inputs' ],
	config: Config
): Promise<JsonReport[ 'outputs' ]> {
	const promises = await Promise.all( assets.map( async asset => {
		const type = getTypeByName( asset );
		const content = await readFile( asset, 'utf-8' );
		const sizes = getSizes( content, config );
		const inputsAndMap = type === 'script' || type === 'style'
			? processAsset( asset, inputs, sizes, config )
			: undefined;
		
		return [ asset, {
			type,
			...sizes,
			...inputsAndMap
		} ];
	} ) )

	return Object.fromEntries( promises );
}

function processAsset(
	asset: string,
	inputs: Record<string, Input>,
	sizes: Sizes,
	config: Config
): Partial<Output> | void {
	const maybeCodeMap = loadCodeAndMap( asset, config.sourcesPathNormalizer );

	if ( !hasCodeAndMap( maybeCodeMap ) ) {
		return;
	}

	const { code, map } = maybeCodeMap;
	const mapped = config.deep
		? mapSourceMap( map, dirname( asset ), inputs )
		: { ...map, mappings: decode( map.mappings ) };

	mapped.sources = mapped.sources.map( source => source && normalizePath( source ) );

	const outputInputs = Array
		.from( getBytesPerSource( code, mapped, sizes, config ) )
		.reduce( ( carry, [ source, sizes ] ) => {
			carry[ normalizePath( source ) ] = sizes;

			return carry;
		}, {} as Record<string, OutputInput> );

	return {
		inputs: sortObjectKeys( outputInputs ),
		map: config.sources ? {
			version: 3,
			names: [],
			mappings: mapped.mappings,
			sources: mapped.sources,
			sourcesContent: mapped.sourcesContent,
		} : undefined
	};
}

function hasCodeAndMap( result: MaybeCodeMap ): result is Required<CodeMap> {
	return Boolean( result && result.code && result.map );
}
