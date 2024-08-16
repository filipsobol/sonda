<template>
	<g :data-hover="`${ content.name } - ${ formattedSize } (${ percentageOfTotal }%)`">
		<rect
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="tile.height"
			:fill="color"
			class="stroke-slate-500 stroke-1"
		/>

		<foreignObject
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="tile.height"
		>
			<p
				xmlns="http://www.w3.org/1999/xhtml"
				class="p-1 size-full text-center text-xs truncate"
			>
				<span v-if="shouldDisplayText">
					<span class="text-gray-900 font-semibold">{{ content.name }}</span>
					<span class="text-gray-600">- {{ formattedSize }}</span>
				</span>
			</p>
		</foreignObject>

		<Level
			v-if="shouldDisplayChildren"
			:content="content"
			:width="childWidth"
			:height="childHeight"
			:xStart="tile.x + padding"
			:yStart="tile.y + paddingTop"
		/>
	</g>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import Level from './Level.vue';
import type { Content } from '../data';
import type { TileData } from '../TreeMapGenerator';

const padding = 6;
const paddingTop = 22;

const props = defineProps<{
	tile: TileData;
	content: Content;
}>();

const totalSize = inject<number>( 'totalSize' )!;

const childWidth = computed( () => props.tile.width - ( padding * 2 ) );
const childHeight = computed( () => props.tile.height - padding - paddingTop );
const formattedSize = computed( () => formatSize( props.content.bytes ) );
const percentageOfTotal = computed( () => ( props.content.bytes / totalSize * 100 ).toFixed(2) );
const color = computed( () => `color-mix(in oklch, #fca5a5 ${ percentageOfTotal.value }%, #86efac)` );

const shouldDisplayText = computed( () => {
	return props.tile.width >= ( paddingTop * 1.75 ) && props.tile.height >= paddingTop;
});

const shouldDisplayChildren = computed( () => {
	return props.content.type === 'folder'
		&& Object.keys( props.content.contents ).length > 0
		&& childHeight.value > 0
		&& childWidth.value > 0;
});

function formatSize( bytes: number ) {
	const distance = 1024;
	const sizes = [
		'b',
		'KiB',
		'MiB',
		'GiB',
		'TiB',
		'PiB',
	];

	let size = bytes;
	let iterations = 0;

	while ( size > distance && ( sizes.length > iterations + 1 ) ) {
		size = size/distance;
		iterations++;
	}

	// Use `toFixed` only if the size is in KiB or greater.
	return `${ iterations ? size.toFixed(2) : size } ${ sizes[iterations] }`;
}
</script>
