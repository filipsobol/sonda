<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">{{ formattedName }}</h2>

		<p class="text-gray-500 mt-4">
			Details of the source input and how it is used. If there is no "Usage in" section, it means that the source was tree-shaken and not included in any of the assets.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex flex-col mb-4">
			<h3 class="mb-4 text-xl font-bold">Input details</h3>

			<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
				<table class="table-fixed w-full text-sm text-left">
					<colgroup>
						<col style="width: 210px">
						<col style="width: 100%">
					</colgroup>

					<tbody class="text-gray-500">
						<tr>
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Path</td>
							<td class="p-3 font-normal">{{ name }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">File type</td>
							<td class="p-3 font-normal capitalize">{{ source.type }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Module format</td>
							<td class="p-3 font-normal uppercase">{{ source.format }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Source</td>
							<td class="p-3 font-normal capitalize">{{ name.includes( 'node_modules' ) ? 'external' : 'internal' }}</td>
						</tr>
						<tr class="border-t border-gray-100">
							<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Original file size</td>
							<td class="p-3 font-normal">{{ formatSize( source.uncompressed ) }}</td>
						</tr>
					</tbody>
				</table>
			</div>

			<template v-if="usedIn.length > 0">
				<hr class="mt-12 mb-6 border-gray-100">

				<div class="mt-4 mb-2 flex gap-3">
					<span class="text-xl font-bold">Usage in</span>

					<BaseSelect
						v-model="assetId"
						:options="usedIn"
					/>
				</div>

				<h4 class="mt-4 mb-4 text-lg font-bold text-gray-700">Size</h4>

				<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
					<table class="table-fixed w-full text-sm text-left">
						<colgroup>
							<col style="width: 210px">
							<col style="width: 100%">
						</colgroup>

						<tbody class="text-gray-500">
							<tr>
								<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Bundled size</td>
								<td class="p-3 font-normal">{{ formatSize( chunk!.uncompressed ) }}</td>
							</tr>
							<tr class="border-t border-gray-100">
								<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. GZIP size</td>
								<td class="p-3 font-normal">{{ report.metadata.gzip ? formatSize( chunk!.gzip! ) : '-' }}</td>
							</tr>
							<tr class="border-t border-gray-100">
								<td class="p-3 font-bold whitespace-nowrap bg-gray-50 border-r border-r-gray-100">Approx. Brotli size</td>
								<td class="p-3 font-normal">{{ report.metadata.brotli ? formatSize( chunk!.brotli! ) : '-' }}</td>
							</tr>
						</tbody>
					</table>
				</div>

				<template v-if="graph?.length">
					<h4 class="mt-16 mb-4 text-lg font-bold text-gray-700">Dependency chain</h4>

					<div class="flex flex-col gap-y-8 border-l-2 border-gray-200 pl-7 ml-3">
						<div
							v-for="( node, index) in graph"
							:key="node.source.name"
							class="flex flex-col relative py-1"
						>
							<div class="absolute z-10 left-[-2.5rem] top-[0.5rem] flex justify-center items-center">
								<div class="size-6 flex justify-center items-center rounded-full bg-gray-200 text-gray-900 font-bold select-none">
									{{ index + 1 }}
								</div>
							</div>

							<p class="text-sm/7 font-semibold">
								<template v-if="index === 0">
									Entry point
								</template>

								<template v-else>
									File
								</template>

								<span class="px-2 py-1 bg-gray-100 rounded-lg pre-nowrap">{{ node.source.name }}</span>

								<template v-if="node.target.kind === 'sourcemap'">
									contains source file <span class="px-2 py-1 bg-gray-100 rounded-lg pre-nowrap">{{ node.source.name }}</span>
								</template>

								<template v-else>
									imports
									<span class="px-2 py-1 bg-gray-100 rounded-lg pre-nowrap">{{ node.edge.original || node.target.name }}</span>
								</template>
							</p>

							<p v-if="node.target.kind !== 'sourcemap'" class="text-gray-600 pt-2">
								This import was resolved to <span class="px-2 py-1 bg-gray-100 rounded-lg pre-nowrap">{{ node.target.name }}</span>
							</p>
						</div>
					</div>
				</template>

				<h4 class="mt-16 mb-4 text-lg font-bold text-gray-700">Code</h4>

				<div
					v-if="supportsHighlight"
					class="p-4 flex rounded-lg border border-gray-200 overflow-auto shadow-xs font-mono text-gray-700 bg-gray-50 max-h-[calc(100svh-6rem)]"
				>
					<pre class="shrink select-none text-gray-400 text-right pr-2 mr-2 border-r border-gray-200 whitespace-pre">{{ lineNumbers }}</pre>
					<pre><code ref="codeElement">{{ sourceCode }}</code></pre>
				</div>

				<div
					v-else
					class="p-4 mb-8 text-sm rounded-lg bg-red-50 border border-red-200 shadow-xs"
					role="alert"
				>
          <p class="font-bold text-red-900">Your browser does not support the <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API" target="_blank">CSS Custom Highlight API</a>.</p>

          <p class="mt-4 text-red-900/70">
            To use this feature, please update your browser to a version that supports it, or use a different browser. See the
            <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API#browser_compatibility" target="_blank">Browser Compatibility page</a> for more information.
          </p>
        </div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watchPostEffect } from 'vue';
import { router } from '@/router.js';
import { getAssetResource, getChunkResource, getSourceResource, report } from '@/report.js';
import { formatPath, formatSize } from '@/format.js';
import BaseSelect from '@components/common/Select.vue';
import type { ChunkResource, Edge } from 'sonda';

const codeElement = useTemplateRef( 'codeElement' );

const name = computed( () => router.query.item );
const formattedName = computed( () => formatPath( name.value ) );
const source = computed( () => getSourceResource( name.value )! );
const usedIn = computed( () => {
	return report.resources
		.filter( ( resource ): resource is ChunkResource => resource.kind === 'chunk' && resource.name === name.value )
		.map( resource => ( {
			label: resource.parent!,
			value: resource.parent!
		} ) );
} );

// Selected asset
const assetId = computed( router.computedQuery( 'formats', usedIn.value[ 0 ]?.value || '' ) );
const asset = computed( () => assetId.value && getAssetResource( assetId.value ) || null );
const chunk = computed( () => assetId.value && getChunkResource( name.value, assetId.value ) || null );

// Dependency graph
const graph = computed( () => {
	if ( !asset.value ) {
		return null;
	}

	const sourceType = asset.value.parent ? 'source' : 'asset'
	const shortestPath = findShortestPath( sourceType === 'source' ? asset.value.parent! : [ asset.value.name ], name.value );

	if ( !shortestPath ) {
		return null;
	}

	return shortestPath.map( edge => ( {
		edge,
		source: sourceType === 'source' ? getSourceResource( edge.source )! : getAssetResource( edge.source )!,
		target: getSourceResource( edge.target )!,
	} ) );
} );

// Code highlighting
const supportsHighlight = 'CSS' in window && 'highlights' in window.CSS;
const sourceMap = computed( () => asset.value?.sourcemap );
const sourceIndex = computed( () => sourceMap.value?.sources.indexOf( name.value ) ?? -1 );
const sourceCode = computed( () => sourceIndex.value > -1 ? sourceMap.value!.sourcesContent![ sourceIndex.value ] : null );
const sourceCodeLines = computed( () => sourceCode.value?.split( /(?<=\r?\n)/ ) ?? [] );
const lineNumbers = computed( () => sourceCodeLines.value.map( ( _, index ) => index + 1 ).join( '\n' ) );

watchPostEffect( () => {
	if ( !supportsHighlight || !sourceCode.value ) {
		return;
	}

	CSS.highlights.delete( 'used-code' );

	const element = codeElement.value!.firstChild!;
	const highlight = new Highlight();
	const lineStartOffsets = sourceCodeLines.value.reduce( ( offsets, line ) => {
		offsets.push( offsets[ offsets.length - 1 ] + line.length );
		return offsets;
	}, [ 0 ] as Array<number>);

	sourceMap.value!.mappings
		.flat()
		.filter( segment => segment[1] === sourceIndex.value )
		.forEach( ( segment, index, segments ) => {
			const [ , , line, column ] = segment as [ number, number, number, number ];
			const nextSegment = segments[ index + 1 ];
			const lineOffset = lineStartOffsets[ line ];
			const start = lineOffset + column;
			const end = line === nextSegment?.[2]
				? nextSegment[3]! + lineOffset
				: lineStartOffsets[ line + 1 ];

			const range = new Range();
			range.setStart( element, start );
			range.setEnd( element, end );
			highlight.add( range );
		} );

	CSS.highlights.set('used-code', highlight);
} );

/**
 * Finds the shortest directed path from any of the given start nodes to the target node using BFS.
 */
function findShortestPath(
  startNodes: Array<string>,
  targetNode: string
): Array<Edge> | null {
	const adjacencyList = Object.groupBy( report.edges, edge => edge.source );
  const visited = new Set<string>( startNodes );
  const queue: Array<Array<Edge>> = startNodes
		.flatMap( node => adjacencyList[ node ] )
		.filter( edge => edge !== undefined )
		.map( edge => [ edge ] );

  while ( queue.length > 0 ) {
    const path = queue.shift()!;
    const node = path[ path.length - 1 ];

    if ( node.target === targetNode ) {
      return path;
    }

    for ( const edge of ( adjacencyList[ node.target ] ?? [] ) ) {
			if ( visited.has( edge.target ) ) {
				continue;
			}

			visited.add( edge.target );
			queue.push( [ ...path, edge ] );
    }
  }

  return null;
}
</script>

<style>
::highlight(used-code) {
	background-color: var(--color-orange-200);
	color: var(--color-orange-900);
}
</style>
