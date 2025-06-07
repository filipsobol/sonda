<template>
	<div class="flex flex-col h-full">
		<div class="max-w-7xl">
			<template v-if="activeAsset">
				<h2 class="text-2xl font-bold">Asset treemap</h2>

				<p class="text-gray-500 mt-4">
					Treemap representation of the <span class="font-semibold">{{ activeAsset.name }}</span> asset.
				</p>
			</template>

			<template v-else>
				<h2 class="text-2xl font-bold">Build treemap</h2>

				<p class="text-gray-500 mt-4">
					Treemap representation of the build, showing all assets and their sizes.
				</p>
			</template>
		</div>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex gap-2 mb-4">
			<Dropdown
				v-model="types"
				:disabled="!!activeAsset"
				:options="availableTypeOptions"
				title="Type"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>
		</div>

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
import { ref, useTemplateRef, computed, onMounted, onBeforeUnmount } from 'vue';
import IconFunnel from '@components/icon/Funnel.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import Treemap from '@/components/treemap/Treemap.vue';
import { getTrie, type Folder } from '@/FileSystemTrie';
import { router } from '@/router';
import { getAssets, getChunks, report } from '@/report';
import type { FileType } from 'sonda';

const resizeObserver = new ResizeObserver( entries => {
	width.value = entries[ 0 ].contentRect.width;
	height.value = entries[ 0 ].contentRect.height;
} );

const TYPE_OPTIONS: Array<DropdownOption<FileType>> = [
	{ label: 'Script', value: 'script' },
	{ label: 'Style', value: 'style' },
	{ label: 'Component', value: 'component' },
	{ label: 'Font', value: 'font' },
	{ label: 'Image', value: 'image' },
	{ label: 'Other', value: 'other' },
];

const container = useTemplateRef( 'container' );
const width = ref( 0 );
const height = ref( 0 );

const assets = computed( () => getAssets() );
const activeAsset = computed( () => report.resources.find( ( { kind, name } ) => kind === 'asset' && name === router.query.item ) );
const availableTypeOptions = computed( () => TYPE_OPTIONS.filter( option => assets.value.some( asset => asset.type === option.value ) ) );
const types = computed( router.computedQuery( 'types', [] as Array<FileType> ) );
const key = computed( () => [ content.value!.path, width.value, height.value ].join( '-' ) );
const content = computed( () => {
	if ( router.query.item ) {
		// Show details of a specific asset
		const resources = getChunks( router.query.item );

		return getTrie( resources ).get( router.query.chunk || '' ) as Folder;
	}

	// Show assets
	const resources = assets.value.filter( asset => types.value.length === 0 || types.value.includes( asset.type ) );
		
	return getTrie( resources ).get( router.query.chunk || '' ) as Folder;
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
