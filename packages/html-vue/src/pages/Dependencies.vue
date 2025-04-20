<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Dependencies</h2>

		<p class="text-gray-500 mt-4">
			List of all external dependencies used in your project. Click the button next to a dependency to see:

			<ul class="mt-2 ms-2 list-disc list-inside text-gray-500">
				<li><span class="font-bold">Paths</span>: Relative path to the dependency. If there's more than one path, the dependency is likely duplicated, which could <span class="underline">lead to increased bundle size</span>.</li>
				<li><span class="font-bold">Used in</span>: Assets that include this dependency.</li>
				<li><span class="font-bold">Imported by</span>: Inputs that imported given dependency, which are also the reason it got bundled.</li>
			</ul>
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
					placeholder="Filter dependencies"
				>
			</div>

			<Dropdown
				v-model="usedIn"
				:options="USED_IN_OPTIONS"
				title="Used in"
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
				<td class="p-3 font-normal text-gray-900">{{ item.id }}</td>
			</template>

			<template #collapsible="{ item }">
				<p class="font-bold">Paths</p>

				<ul class="mt-2 list-disc list-inside">
					<li
						v-for="path in item.paths"
						:key="path"
						class="text-gray-700 ml-2"
					>
						{{ path }}
					</li>
				</ul>

				<p class="mt-8 font-bold">Used in</p>

				<ul class="mt-2 list-disc list-inside">
					<li
						v-for="path in item.usedIn"
						:key="path"
						class="text-gray-700 ml-2"
					>
						<a
							:href="router.getUrl( 'assets/details', { item: path } )"
							class="px-2 py-1 text-sm font-medium underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
						>
							{{ path }}
						</a>
					</li>
				</ul>

				<p class="mt-8 font-bold">Imported by</p>

				<ul class="mt-2 list-disc list-inside">
					<li
						v-for="path in item.importedBy"
						:key="path"
						class="text-gray-700 ml-2"
					>
						<a
							:href="router.getUrl( 'inputs/details', { item: path } )"
							class="px-2 py-1 text-sm font-medium underline-offset-2 rounded-lg outline-hidden focus:ring focus:ring-gray-500 focus:border-gray-500 hover:underline"
						>
							{{ path }}
						</a>
					</li>
				</ul>
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
import { router } from '@/router.js';
import { report } from '@/report.js';
import DataTable, { type Column } from '@components/common/DataTable.vue';
import Dropdown from '@components/common/Dropdown.vue';
import Pagination from '@components/common/Pagination.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';

const ITEMS_PER_PAGE = 12;

const USED_IN_OPTIONS = Object
	.keys( report.outputs )
	.map( output => ( {
		label: output,
		value: output
	} ) );

const COLUMNS: Array<Column> = [
	{ name: 'Name', align: 'left' }
];

const dependencies = Object.entries( report.dependencies );

const assetInputs = Object
	.entries( report.outputs )
	.reduce( ( carry, [ path, output ] ) => {
		carry.push( [ path, Object.keys( output.inputs || {} ) ] )
		return carry;
	}, [] as Array<[ asset: string, inputs: Array<string> ]> );

const inputImports = Object
	.entries( report.inputs )
	.reduce( ( carry, [ path, input ] ) => {
		carry.push( [ path, input.imports || [] ] )
		return carry;
	}, [] as Array<[ input: string, imports: Array<string> ]> );

const data = ref(
	dependencies.map( ( [ id, paths ] ) => ( {
		id,
		paths,
		usedIn: assetInputs
			.filter( ( [ _, output ] ) => output.some( path => path.includes( id ) ) )
			.map( ( [ id ] ) => id ),
		
		importedBy: inputImports
			.filter( ( [ _, input ] ) => input.some( path => path.includes( id ) ) )
			.map( ( [ id ] ) => id )
			.filter( path => !path.includes( id ) )
	} ) )
);

const search = computed( router.computedQuery( 'search', '' ) );
const usedIn = computed( router.computedQuery( 'formats', [] as Array<string> ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value
		.filter( item => item.id.toLowerCase().includes( lowercaseSearch ) )
		.filter( item => !usedIn.value.length || item.usedIn.some( path => usedIn.value.includes( path ) ) );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );

watch( [ search, usedIn, currentPage ], () => {
	active.value = '';
} );

watch( [ search, usedIn ], () => {
	currentPage.value = 1;
} );
</script>
