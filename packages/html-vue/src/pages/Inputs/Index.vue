<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Inputs</h2>

		<p class="text-gray-500 mt-4">
			List of all source inputs discovered during the build process. The table includes the following information for each input:
		</p>

		<ul class="mt-2 ms-2 list-disc list-inside text-gray-500">
			<li><span class="font-bold">Path</span>: Relative path to the input. If the path is from <code class="text-xs py-0.5 px-1 bg-gray-100 rounded">node_modules</code>, it starts from the package name.</li>
			<li><span class="font-bold">Used in</span>: Output assets that include this source. If this value is empty, the source has been removed via tree-shaking.</li>
			<li><span class="font-bold">Format</span>: Indicates the module format if the source is a script. Otherwise, the value is <code class="text-xs py-0.5 px-1 bg-gray-100 rounded">other</code>.</li>
			<li><span class="font-bold">Source</span>: Specifies whether the source is from your project (<code class="text-xs py-0.5 px-1 bg-gray-100 rounded">internal</code>) or from <code class="text-xs py-0.5 px-1 bg-gray-100 rounded">node_modules</code> (<code class="text-xs py-0.5 px-1 bg-gray-100 rounded">external</code>).</li>
		</ul>

		<p class="text-gray-500 mt-4">
			Click on the adjacent button to view additional details about the input.
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
						v-for="output in item.usedIn"
						:key="output.parent"
						:title="output.parent"
						class="truncate"
					>
						{{ output.parent }}
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
import type { ModuleFormat } from 'sonda';

const ITEMS_PER_PAGE = 12;


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

const data = ref(
	report.resources
		.filter( ( { kind } ) => kind === 'source' || kind === 'sourcemap-source' )
		.map( input => ( {
			path: input.name,
			name: formatPath( input.name ),
			format: input.format,
			source: input.name.includes( 'node_modules' ) ? 'external' : 'internal',
			usedIn: report.resources.filter( resource => resource.kind === 'chunk' && resource.name === input.name )
		} ) )
);

const availableFormatOptions = computed( () => FORMAT_OPTIONS.filter( option => data.value.some( source => source.format === option.value ) ) );
const availableSourceOptions = computed( () => SOURCE_OPTIONS.filter( option => data.value.some( source => source.source === option.value ) ) );
const search = computed( router.computedQuery( 'search', '' ) );
const formats = computed( router.computedQuery( 'formats', [] as Array<string> ) );
const sources = computed( router.computedQuery( 'sources', [] as Array<string> ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value
		.filter( item => item.path.toLowerCase().includes( lowercaseSearch ) )
		.filter( item => !formats.value.length || formats.value.includes( item.format! ) )
		.filter( item => !sources.value.length || sources.value.includes( item.source ) );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );

watch( [ search, formats, sources ], () => {
	currentPage.value = 1;
} );
</script>
