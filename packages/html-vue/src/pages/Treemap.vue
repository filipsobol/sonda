<template>
	<div class="flex flex-col h-full">
		<div class="max-w-7xl">
			<h2 class="text-2xl font-bold">Tree map</h2>

			<p class="text-gray-500 mt-4">
				Build represented as a tree map, showing the size of each chunk in relation to the others.
			</p>
		</div>

		<hr class="mt-4 mb-6 border-gray-100">

		<div
			ref="container"
			role="application"
			class="flex-grow w-full overflow-hidden"
		>
			<Treemap
    		:key
				:content
				:width
				:height
			/>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, computed, onMounted, onBeforeUnmount } from 'vue'
import Treemap from '@/components/treemap/Treemap.vue'
import { getOutputTrie, getBuildTrie, type Folder } from '@/FileSystemTrie';
import { router } from '@/router';

const resizeObserver = new ResizeObserver( entries => {
	width.value = entries[ 0 ].contentRect.width;
	height.value = entries[ 0 ].contentRect.height;
} );

const container = useTemplateRef( 'container' );
const width = ref( 0 );
const height = ref( 0 );

const key = computed( () => `${content.value!.path}-${width.value}-${height.value}` );
const content = computed( () => {
	const asset = router.query.item;

	return asset
		? getOutputTrie( asset ).get( router.query.chunk || '' ) as Folder
		: getBuildTrie().get( '' ) as Folder;
} );

onMounted( () => {
	resizeObserver.observe( container.value! );
} );

onBeforeUnmount( () => {
  if ( resizeObserver && container.value ) {
    resizeObserver.unobserve( container.value );
  }
} );
</script>
