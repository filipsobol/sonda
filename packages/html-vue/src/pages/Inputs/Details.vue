<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">{{ formatPath( router.query.item ) }}</h2>

		<p class="text-gray-500 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex flex-col mb-4">
			<h3 class="mb-4 text-xl font-bold">Asset details</h3>

			<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
				<table class="table-fixed w-full text-sm text-left">
					<colgroup>
						<col style="width: 200px">
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
				<div class="mt-12 mb-2 flex gap-3">
					<span class="text-xl font-bold">Usage in</span>

					<BaseSelect
						v-model="assetId"
						:options="usedIn"
					/>
				</div>

				<h4 class="mt-2 mb-4 text-lg font-bold text-gray-700">Size</h4>

				<div class="rounded-lg border border-gray-200 overflow-hidden shadow-xs">
					<table class="table-fixed w-full text-sm text-left">
						<colgroup>
							<col style="width: 200px">
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

				<h4 class="mt-8 mb-4 text-lg font-bold text-gray-700">Dependency graph</h4>

				<h4 class="mt-8 mb-4 text-lg font-bold text-gray-700">Code</h4>

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
import { report } from '@/report.js';
import { formatPath, formatSize } from '@/format.js';
import BaseSelect from '@components/common/Select.vue';

const codeElement = useTemplateRef( 'codeElement' );

const name = computed( () => router.query.item );
const source = computed( () => report.resources.find( resource => resource.name === name.value && ( resource.kind === 'source' || resource.kind === 'sourcemap-source' ) )! );
const usedIn = computed( () => {
	return report.resources
		.filter( resource => resource.name === name.value && resource.kind === 'chunk' )
		.map( resource => ( {
			label: resource.parent!,
			value: resource.parent!
		} ) );
} );

const assetId = computed( router.computedQuery( 'formats', usedIn.value.length > 0 ? usedIn.value[ 0 ].value : '' ) );
const chunk = computed( () => {
	return assetId.value
		? report.resources.find( resource => resource.parent === assetId.value && resource.kind === 'chunk' )
		: null;
} );

// Code highlighting
const supportsHighlight = 'CSS' in window && 'highlights' in window.CSS;
const sourceMap = computed( () => {
	return assetId.value
		? report.resources.find( resource => resource.name === assetId.value && resource.kind === 'asset' )?.sourcemap
		: null;
} );
const sourceIndex = computed( () => sourceMap.value?.sources.indexOf( name.value ) ?? -1 );
const sourceCode = computed( () => sourceIndex.value > 0 ? sourceMap.value!.sourcesContent![ sourceIndex.value ] : null );
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
</script>

<style>
::highlight(used-code) {
	background-color: var(--color-orange-200);
	color: var(--color-orange-900);
}
</style>
