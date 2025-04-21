<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Input files</h2>

		<p class="text-gray-500 mt-4">
			List of input (source) files used in the generated bundles. This includes all internal files in your project as well as external files from <code class="text-xs py-0.5 px-1 bg-gray-100 rounded">node_modules</code>.
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
					placeholder="Filter input files"
				>
			</div>

			<Dropdown
				v-model="formats"
				:options="FORMAT_OPTIONS"
				title="Format"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>

			<Dropdown
				v-model="sources"
				:options="SOURCE_OPTIONS"
				title="Source"
			>
				<template #icon>
					<IconFunnel :size="16" />
				</template>
			</Dropdown>
		</div>

		<DataTable
			v-model="active"
			:columns="COLUMNS"
			:data="paginatedData"
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
					<!-- <p
						v-for="output in item.outputs"
						:key="output"
						:title="output"
						class="truncate"
					>
						{{ output }}
					</p> -->
				</td>

				<td class="p-3 font-normal text-center whitespace-nowrap">
					<Badge v-if="item.format === 'esm'" variant="yellow">esm</Badge>
					<Badge v-else-if="item.format === 'cjs'" variant="primary">cjs</Badge>
					<Badge v-else variant="dark">unknown</Badge>
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
import Dropdown from '@components/common/Dropdown.vue';
import BaseButton from '@/components/common/Button.vue';
import Pagination from '@components/common/Pagination.vue';
import Badge from '@components/common/Badge.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';

const ITEMS_PER_PAGE = 12;

const FORMAT_OPTIONS = [
	{ label: 'ESM', subLabel: 'ES Module', value: 'esm' },
	{ label: 'CJS', subLabel: 'CommonJS', value: 'cjs' },
	{ label: 'Unknown', value: 'unknown' },
	{ label: 'Other', value: 'other' }
];

const SOURCE_OPTIONS = [
	{ label: 'Internal', value: 'internal' },
	{ label: 'External', value: 'external' },
];

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
		width: '33.3%'
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

const inputs = Object.entries( report.inputs );

const data = ref(
	inputs.map( ( [ path, input ] ) => ( {
		id: path,
		path,
		name: formatPath( path ),
		format: input.format,
		source: path.includes( 'node_modules' ) ? 'external' : 'internal'
	} ) )
);

const search = computed( router.computedQuery( 'search', '' ) );
const formats = computed( router.computedQuery( 'formats', FORMAT_OPTIONS.map( o => o.value ) ) );
const sources = computed( router.computedQuery( 'sources', SOURCE_OPTIONS.map( o => o.value ) ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value.filter( item => {
		return formats.value.includes( item.format )
			&& sources.value.includes( item.source )
			&& item.path.toLowerCase().includes( lowercaseSearch );
	} );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );

watch( [ search, formats, sources, currentPage ], () => {
	active.value = '';
} );

watch( [ search, formats, sources ], () => {
	currentPage.value = 1;
} );
</script>
