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
			<SearchInput
				v-model="search"
				placeholder="Filter items (prefix with - to exclude)"
			/>

			<BaseSelect
				v-model="compressionType"
				:options="availableCompressionOptions"
				:disabled="availableCompressionOptions.length === 1"
			/>

			<Dropdown
				v-model="types"
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
				v-if="width > 0 && height > 0 && content && content.uncompressed > 0"
    		:key
				:content
				:compressionType
				:width
				:height
			/>

			<Alert
				v-else
				variant="neutral"
			>
				<template #header>
					No results found
				</template>

				<template #body>
					<p>
						There are no inputs matching the current filters.
					</p>
				</template>
			</Alert>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef, computed, onMounted, onBeforeUnmount, onBeforeMount } from 'vue';
import IconFunnel from '@components/icon/Funnel.vue';
import Alert from '@/components/common/Alert.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import BaseSelect from '@components/common/Select.vue';
import Treemap from '@/components/treemap/Treemap.vue';
import { FileSystemTrie, type Folder } from '@/FileSystemTrie';
import { router } from '@/router';
import { getAssets, getChunks, report } from '@/report';
import type { FileType } from 'sonda';

type CompressionType = 'uncompressed' | 'gzip' | 'brotli';

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

const COMPRESSION_TYPES: Array<DropdownOption<CompressionType>> = [
	{ label: 'Uncompressed', value: 'uncompressed' },
	{ label: 'GZIP', value: 'gzip' },
	{ label: 'Brotli', value: 'brotli' },
];

const container = useTemplateRef( 'container' );
const width = ref( 0 );
const height = ref( 0 );

const assets = computed( () => getAssets() );
const activeAsset = computed( () => report.resources.find( ( { kind, name } ) => kind === 'asset' && name === router.query.item ) );
const resources = computed( () => router.query.item ? getChunks( router.query.item ) : assets.value );
const availableTypeOptions = computed( () => TYPE_OPTIONS.filter( option => resources.value.some( asset => asset.type === option.value ) ) );
const availableCompressionOptions = computed( () => COMPRESSION_TYPES.filter( option => option.value === 'uncompressed' || report.metadata[ option.value ] ) );
const search = computed( router.computedQuery( 'search', '' ) );
const types = computed( router.computedQuery( 'types', [] as Array<FileType> ) );
const compressionType = computed( router.computedQuery( 'compression', COMPRESSION_TYPES[ 0 ].value ) );
const content = computed( () => {
	const trie = new FileSystemTrie( router.query.item || '' );
	const searchTerm = search.value.trim().toLocaleLowerCase();
	const isNegativeSearch = searchTerm.startsWith( '-' );
	const normalizedSearch = isNegativeSearch ? searchTerm.slice( 1 ) : searchTerm;

	resources.value
		.filter( resource => !normalizedSearch || isNegativeSearch !== resource.name.toLocaleLowerCase().includes( normalizedSearch ) )
		.filter( resource => types.value.length === 0 || types.value.includes( resource.type ) )
		.forEach( resource => trie.insert( resource.name, resource ) );

	return trie.get( router.query.chunk || '' ) as Folder | null;
} );
const key = computed( () => [ content.value!.path, width.value, height.value ].join( '-' ) );

onBeforeMount( () => {
	if ( assets.value.length === 1 ) {
		router.navigate( 'treemap', {
			item: assets.value[ 0 ].name
		} );
	}
} )

onMounted( () => {
	resizeObserver.observe( container.value! );
} );

onBeforeUnmount( () => {
	if ( resizeObserver && container.value ) {
		resizeObserver.unobserve( container.value );
	 }
} );
</script>
