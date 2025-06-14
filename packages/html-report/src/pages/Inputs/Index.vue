<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Source inputs</h2>

		<p class="text-gray-500 mt-4">
			List of all source inputs discovered during the build process, including those that were tree-shaken
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex gap-2 mb-4">
			<SearchInput v-model="search" />

			<Dropdown
				v-model="types"
				:options="availableTypeOptions"
				title="Type"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>

			<Dropdown
				v-model="formats"
				:options="availableFormatOptions"
				title="Format"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>

			<Dropdown
				v-model="sources"
				:options="availableSourceOptions"
				title="Source"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>

			<Dropdown
				v-model="usedIn"
				:options="availableUsedInOptions"
				title="Used in"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>
		</div>

		<DataTable
			:columns="COLUMNS"
			:data="paginatedData"
			id="path"
		>
			<template #row="{ item }">
				<td class="p-3 font-normal text-center whitespace-nowrap">
					<BaseButton
						:link="true"
						:href="router.getUrl( 'inputs/details', { item: item.path } )"
						class="flex rounded border border-gray-300 p-2"
					>
						<IconSearch :size="16" class="text-gray-500" />	
					</BaseButton>
				</td>
	
				<td class="p-3 font-normal text-gray-900">
					<p
						:title="item.path"
						class="truncate"
					>
						{{ item.name }}
					</p>
				</td>

				<td class="p-3 font-normal">
					<p
						v-if="item.usedIn.length === 1"
						:title="item.usedIn[ 0 ]"
						class="truncate text-gray-900"
					>
						{{ item.usedIn[ 0 ] }}
					</p>

					<p
						v-else-if="item.usedIn.length > 1"
						class="text-gray-400 italic"
					>
						Used in {{ item.usedIn.length }} assets
					</p>

					<p
						v-else
						class="text-gray-400 italic"
					>
						(Tree-shaken)
					</p>
				</td>

				<td class="p-3 font-normal text-center whitespace-nowrap">
					<Badge v-if="item.format === 'esm'" variant="yellow">esm</Badge>
					<Badge v-else-if="item.format === 'cjs'" variant="primary">cjs</Badge>
					<Badge v-else variant="dark">{{ item.format }}</Badge>
				</td>

				<td class="p-3 font-normal text-center whitespace-nowrap">
					<Badge v-if="item.source ==='internal'" variant="dark">internal</Badge>
					<Badge v-else variant="primary">external</Badge>
				</td>
			</template>
		</DataTable>

		<Pagination
			v-model="currentPage"
			:count="filteredData.length"
			:items-per-page="ITEMS_PER_PAGE"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import fuzzysort from 'fuzzysort';
import { router } from '@/router.js'
import { getSources, report } from '@/report.js';
import { formatPath } from '@/format.js';
import SearchInput from '@/components/common/SearchInput.vue';
import DataTable, { type Column } from '@components/common/DataTable.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import BaseButton from '@/components/common/Button.vue';
import Pagination from '@components/common/Pagination.vue';
import Badge from '@components/common/Badge.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';
import type { ChunkResource, FileType, ModuleFormat } from 'sonda';

const ITEMS_PER_PAGE = 12;

const ASSETS = report.resources.filter( ( { kind } ) => kind === 'asset' ).map( input => input.name );

const TYPE_OPTIONS: Array<DropdownOption<FileType>> = [
	{ label: 'Script', value: 'script' },
	{ label: 'Style', value: 'style' },
	{ label: 'Component', value: 'component' },
	{ label: 'Font', value: 'font' },
	{ label: 'Image', value: 'image' },
	{ label: 'Other', value: 'other' },
];

const FORMAT_OPTIONS: Array<DropdownOption<ModuleFormat>> = [
	{ label: 'ESM', subLabel: 'ES Module', value: 'esm' },
	{ label: 'CJS', subLabel: 'CommonJS', value: 'cjs' },
	{ label: 'AMD', value: 'amd' },
	{ label: 'UMD', value: 'umd' },
	{ label: 'IIFE', value: 'iife' },
	{ label: 'SystemJS', value: 'system' },
	{ label: 'Other', value: 'other' }
];

const SOURCE_OPTIONS = [
	{ label: 'Internal', value: 'internal' },
	{ label: 'External', value: 'external' },
];

const USED_IN_OPTIONS = ASSETS.map( asset => ( {
	label: asset,
	value: asset
} ) );

const COLUMNS: Array<Column> = [
	{
		name: '',
		align: 'center',
		width: '58px'
	},
	{
		name: 'Path',
		align: 'left',
		width: '66.6%'
	},
	{
		name: 'Used in',
		align: 'left',
		width: '33.4%'
	},
	{
		name: 'Format',
		align: 'center',
		width: '106px'
	},
	{
		name: 'Source',
		align: 'center',
		width: '106px'
	}
];

const data = ref(
	getSources()
		.map( input => ( {
			path: input.name,
			name: formatPath( input.name ),
			format: input.format,
			type: input.type,
			source: input.name.includes( 'node_modules' ) ? 'external' : 'internal',
			usedIn: report.resources
				.filter( ( resource ): resource is ChunkResource => resource.kind === 'chunk' && resource.name === input.name )
				.map( resource => resource.parent! )
		} ) )
);

const availableTypeOptions = computed( () => TYPE_OPTIONS.filter( option => data.value.some( source => source.type === option.value ) ) );
const availableFormatOptions = computed( () => FORMAT_OPTIONS.filter( option => data.value.some( source => source.format === option.value ) ) );
const availableSourceOptions = computed( () => SOURCE_OPTIONS.filter( option => data.value.some( source => source.source === option.value ) ) );
const availableUsedInOptions = computed( () => USED_IN_OPTIONS.filter( option => data.value.some( source => source.usedIn.includes( option.value ) ) ) );
const search = computed( router.computedQuery( 'search', '' ) );
const types = computed( router.computedQuery( 'types', [] as Array<string> ) );
const formats = computed( router.computedQuery( 'formats', [] as Array<string> ) );
const sources = computed( router.computedQuery( 'sources', [] as Array<string> ) );
const usedIn = computed( router.computedQuery( 'usedIn', [] as Array<string> ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );

const filteredData = computed( () => {
	const filtered = data.value.filter( item => {
		return ( !types.value.length || types.value.includes( item.type ) )
		  && ( !formats.value.length || formats.value.includes( item.format! ) )
			&& ( !sources.value.length || sources.value.includes( item.source ) )
			&& ( !usedIn.value.length || item.usedIn.some( usedInItem => usedIn.value.includes( usedInItem ) ) );
	} );

	return fuzzysort
		.go( search.value, filtered, {
			key: 'name',
			all: true,
			threshold: 0.5
		} )
		.map( dependency => dependency.obj );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );

watch( [ search, types, formats, sources, usedIn ], () => {
	currentPage.value = 1;
} );
</script>
