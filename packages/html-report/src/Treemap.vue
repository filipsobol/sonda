<template>
	<div ref="wrapper" class="flex size-full">
		<svg
			v-if="wrapper"
			:width="svgWidth"
			:height="svgHeight"
			xmlns="http://www.w3.org/2000/svg"
		>
			<Tile
				:level="0"
				:content="content"
				:width="svgWidth"
				:height="svgHeight"
				:xStart="0"
				:yStart="0"
			/>
		</svg>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Tile from './Tile.vue';
import type { Content } from './data';

defineProps<{
	content: Content;
}>();

const resizeObserver = new ResizeObserver( entries => {
	const entry = entries.find( entry => entry.target === wrapper.value );

	entry && setWrapperSize( entry.contentRect.width, entry.contentRect.height );
} );

const wrapper = ref<HTMLElement | null>(null);
const svgWidth = ref(0);
const svgHeight = ref(0);

function setWrapperSize( width: number, height: number ) {
	svgWidth.value = width;
	svgHeight.value = Math.max( height, 1000 );
}

onMounted( () => {
	const { width, height } = wrapper.value!.getBoundingClientRect();
	setWrapperSize( width, height );

	resizeObserver.observe( wrapper.value! );
} );
</script>
