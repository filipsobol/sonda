<template>
	<Tile
		v-for="( tile, index ) in tiles"
		:key="children[index].path"
		:tile="tile"
		:content="children[index]"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Tile from './Tile.vue';
import { TreeMapGenerator } from '../TreeMapGenerator';
import type { Content } from '../data';

const props = defineProps<{
	content: Content;
	width: number;
	height: number;
	xStart: number;
	yStart: number;
}>();

const children = computed<Array<Content>>(() => {
	if ( props.content.type === 'file' ) {
		return [];
	}

	return Object
		.values<Content>( props.content.contents )
		.sort( ( a, b ) => b.bytes - a.bytes );
});

const tiles = computed( () => {
	if ( !children.value.length ) {
		return [];
	}

	const generator = new TreeMapGenerator(
		children.value.map( child => child.bytes ),
		props.width,
		props.height,
		props.xStart,
		props.yStart
	);

	return generator.calculate();
} );
</script>
