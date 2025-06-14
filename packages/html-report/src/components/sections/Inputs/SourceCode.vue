<template>
	<template v-if="sourceCode">
		<h4 class="mt-16 mb-4 text-lg font-bold text-gray-700">Code</h4>

		<div
			v-if="supportsHighlight"
			class="p-4 flex rounded-lg border border-gray-200 overflow-auto shadow-xs font-mono text-gray-700 bg-gray-50 max-h-[calc(100svh-12rem)]"
		>
			<pre class="h-full shrink select-none text-gray-400 text-right pr-2 mr-2 border-r border-gray-200 whitespace-pre">{{ lineNumbers }}</pre>
			<pre><code ref="codeElement">{{ sourceCode }}</code></pre>
		</div>

		<Alert v-else>
			<template #header>
				<p>
					Your browser does not support the <a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API" target="_blank">CSS Custom Highlight API</a>.
				</p>
			</template>

			<template #body>
				<p>
					To use this feature, please update your browser to a version that supports it, or use a different browser. See the
					<a class="underline" href="https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API#browser_compatibility" target="_blank">Browser Compatibility page</a> for more information.
				</p>
			</template>
		</Alert>
	</template>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watchPostEffect } from 'vue';
import Alert from '@/components/common/Alert.vue';
import { getAssetResource, report } from '@/report.js';
import type { ChunkResource } from 'sonda';

interface Props {
	name: string;
}

const codeElement = useTemplateRef( 'codeElement' );

const props = defineProps<Props>();

const usedIn = computed( () => {
	return report.resources
		.filter( ( resource ): resource is ChunkResource => resource.kind === 'chunk' && resource.name === props.name )
		.map( resource => ( {
			label: resource.parent!,
			value: resource.parent!
		} ) );
} );

// Selected asset
const asset = computed( () => usedIn.value[ 0 ]?.value && getAssetResource( usedIn.value[ 0 ].value ) || null );

// Code highlighting
const supportsHighlight = 'CSS' in window && 'highlights' in window.CSS;
const sourceMap = computed( () => asset.value?.sourcemap );
const sourceIndex = computed( () => sourceMap.value?.sources.indexOf( props.name ) ?? -1 );
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
</script>

<style>
::highlight(used-code) {
	background-color: var(--color-orange-200);
	color: var(--color-orange-900);
}
</style>
