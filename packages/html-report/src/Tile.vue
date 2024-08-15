<template>
	<g
		:key="content.path"
		:data-hover="content.path + ' - ' + formatSize( content.bytes )"
	>
		<rect
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="tile.height"
			:fill="`hsl(${ Math.random() * 360 }, 80%, 90%)`"
			class="stroke-gray-600 stroke-1"
		/>

		<foreignObject
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="tile.height"
		>
			<p
				xmlns="http://www.w3.org/1999/xhtml"
				class="px-1 py-px size-full text-center text-sm truncate"
			>
				<span v-if="shouldDisplayText">
					<span class="text-gray-900 font-semibold">{{ content.name }}</span>
					<span class="text-gray-500">- {{ formatSize( content.bytes ) }}</span>
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
import { computed } from 'vue';
import Level from './Level.vue';
import type { Content } from './data';
import type { TileData } from './types';

// TODO: hover effect
// TODO: generating colors

const padding = 6;
const paddingTop = 22;

const props = defineProps<{
	tile: TileData;
	content: Content;
}>();

const childWidth = computed( () => props.tile.width - ( padding * 2 ) );
const childHeight = computed( () => props.tile.height - padding - paddingTop );

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

<style>
[data-tooltip]:hover::after {
  display: block;
  position: absolute;
  content: attr(data-tooltip);
  border: 1px solid black;
  background: #eee;
  padding: .25em;
}
</style>
