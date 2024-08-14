<template>
	<g
		v-for="( tile, index ) in tiles"
		:key="children[index].path"
		:data-id="children[index].path"
		class="cursor-pointer"
	>
		<rect
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="tile.height"
			:fill="`hsl(${ Math.random() * 360 }, 80%, 90%)`"
			class="stroke-black stroke-1"
			rx="0"
			ry="0"
		/>

		<foreignObject
			v-if="tile.width >= paddingTop && tile.height >= paddingTop"
			:x="tile.x"
			:y="tile.y"
			:width="tile.width"
			:height="paddingTop"
		>
			<p
				xmlns="http://www.w3.org/1999/xhtml"
				class="p-1 text-center text-md truncate"
			>
				<span class="text-gray-900 font-bold">{{ children[index].name }}</span>
				<!-- <span class="text-gray-600">- {{ formatSize( children[index].bytes ) }}</span> -->
			</p>
		</foreignObject>

		<Tile
			v-if="children.length > 0"
			:level="level + 1"
			:content="children[index]"
			:width="tile.width - ( padding * 2 )"
			:height="tile.height - padding - paddingTop"
			:xStart="tile.x + padding"
			:yStart="tile.y + paddingTop"
		/>
	</g>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tile from './Tile.vue';
import { TreeMapGenerator } from './TreeMapGenerator';
import type { Content } from './data';

// TODO: tooltip
// TODO: hover effect
// TODO: generating colors

const padding = 6;
const paddingTop = 32;

const props = defineProps<{
	level: number;
	content: Content;
	width: number;
	height: number;
	xStart: number;
	yStart: number;
}>();

const children = computed<Array<Content>>(() => {
	const values = Object.values<Content>( props.content.contents ?? {} );

	return values.sort( ( a, b ) => b.bytes - a.bytes );
});

const tiles = computed( () => {
	if ( !children.value.length ) {
		return [];
	}

	const generator = new TreeMapGenerator(
		children?.value.map( child => child.bytes ) ?? [ props.content.bytes ],
		props.width,
		props.height,
		props.xStart,
		props.yStart
	);

	return generator.calculate();
} );

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

	return `${ size.toFixed(2) } ${ sizes[iterations] }`;
}
</script>
