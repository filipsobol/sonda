<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Dependencies</h2>

		<p class="text-gray-500 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
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
		</div>

		<DataTable
			v-model="active"
			:columns="columns"
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

				<p class="mt-8 font-bold">Used in following assets</p>

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

				<p class="mt-8 font-bold">Imported by following inputs</p>

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
import { ref, computed } from 'vue';
import { router } from '@/router.js';
import { report } from '@/report.js';
import DataTable, { type Column } from '@components/common/DataTable.vue';
import Pagination from '@components/common/Pagination.vue';
import IconSearch from '@components/icon/Search.vue';

const ITEMS_PER_PAGE = 12;

const columns: Array<Column> = [
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
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value.filter( item => item.id.toLowerCase().includes( lowercaseSearch ) );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );
</script>
