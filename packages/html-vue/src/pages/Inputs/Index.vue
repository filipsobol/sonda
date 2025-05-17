<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Source inputs</h2>

		<p class="text-gray-500 mt-4">
			List of all source inputs discovered during the build process, including those that were tree-shaken
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex gap-2 mb-4">
			<div class="relative flex">
				<div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
					<IconSearch :size="16" class="text-gray-500" />
				</div>

				<input
					v-model="search"
					type="text"
					class="py-1.25 ps-10 w-80 text-sm text-gray-900 border border-gray-300 bg-white rounded-lg outline-hidden shadow-xs placeholder:text-gray-500 focus:ring focus:ring-gray-500 focus:border-gray-500"
					placeholder="Filter inputs"
				>
			</div>

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
					<template v-if="item.usedIn.length">
						<p
							v-for="parent in item.usedIn"
							:key="parent"
							:title="parent"
							class="truncate text-gray-900"
						>
							{{ parent }}
						</p>
					</template>

					<p
						v-else
						class="mt-2 text-gray-400 italic"
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
import { router } from '@/router.js'
import { report } from '@/report.js';
import { formatPath } from '@/format.js';
import DataTable, { type Column } from '@components/common/DataTable.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import BaseButton from '@/components/common/Button.vue';
import Pagination from '@components/common/Pagination.vue';
import Badge from '@components/common/Badge.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';
import type { FileType, ModuleFormat } from 'sonda';

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
	report.resources
		.filter( ( { kind } ) => kind === 'source' )
		.map( input => ( {
			path: input.name,
			name: formatPath( input.name ),
			format: input.format,
			type: input.type,
			source: input.name.includes( 'node_modules' ) ? 'external' : 'internal',
			usedIn: report.resources
				.filter( resource => {
					// Get only chunks...
					return resource.kind === 'chunk'
						// that have the same name as the source input...
						&& resource.name === input.name
						// and who's parent is an asset, not other source
						&& ASSETS.includes( resource.parent! )
				} )
				.map( resource => resource.parent! )
		} ) )
);

const availableTypeOptions = computed( () => TYPE_OPTIONS.filter( option => data.value.some( source => source.type === option.value ) ) );
const availableFormatOptions = computed( () => FORMAT_OPTIONS.filter( option => data.value.some( source => source.format === option.value ) ) );
const availableSourceOptions = computed( () => SOURCE_OPTIONS.filter( option => data.value.some( source => source.source === option.value ) ) );
const availableUsedInOptions = computed( () => USED_IN_OPTIONS.filter( option => data.value.some( source => source.usedIn.includes( option.value ) ) ) );
const search = computed( router.computedQuery( 'search', '' ) );
const types = computed( router.computedQuery( 'type', [] as Array<string> ) );
const formats = computed( router.computedQuery( 'formats', [] as Array<string> ) );
const sources = computed( router.computedQuery( 'sources', [] as Array<string> ) );
const usedIn = computed( router.computedQuery( 'usedIn', [] as Array<string> ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value.filter( item => {
		return item.path.toLowerCase().includes( lowercaseSearch )
			&& ( !types.value.length || types.value.includes( item.type ) )
		  && ( !formats.value.length || formats.value.includes( item.format! ) )
			&& ( !sources.value.length || sources.value.includes( item.source ) )
			&& ( !usedIn.value.length || item.usedIn.some( usedInItem => usedIn.value.includes( usedInItem ) ) );
	} );
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
