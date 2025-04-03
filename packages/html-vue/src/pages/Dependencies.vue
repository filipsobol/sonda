<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">Dependencies</h2>

		<p class="text-gray-500 mt-4">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tincidunt purus non hendrerit commodo. Nunc sit amet nisi vel sapien feugiat egestas in eu ligula. Mauris iaculis maximus nisi, at viverra velit sodales nec. Nunc placerat, erat eu consectetur pulvinar, lorem odio rutrum purus, et bibendum ex velit id erat. Fusce nec pellentesque orci, pretium placerat elit. Pellentesque accumsan et turpis ut porttitor. Suspendisse tincidunt ut leo ac finibus. Proin viverra consectetur est.
		</p>

		<hr class="mt-4 mb-6 border-gray-100">

		<div class="flex space-x-2 mb-4">
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
				<td class="p-3 font-normal text-gray-900">{{ item.name }}</td>

				<td class="p-3 font-normal whitespace-nowrap">{{ item.usedIn }}</td>
			</template>

			<template #collapsible="{ item }">
				<p class="mb-2 font-bold">{{ item }}</p>
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
import { router } from '@router';
import { report } from '@report';
import DataTable, { type Column } from '@components/Common/DataTable.vue';
import Pagination from '@components/Common/Pagination.vue';
import IconSearch from '@components/Icon/Search.vue';

const ITEMS_PER_PAGE = 12;

const columns: Array<Column> = [
	{ name: 'Name', align: 'left' },
	{ name: 'Used in', align: 'left' },
];

const dependencies = Object.entries( report.dependencies );

const data = ref(
	dependencies.map( ( [ name, dependency ] ) => ( {
		id: name,
		name,
		// TODO
		usedIn: [],
		paths: dependency
	} ) )
);

const search = computed( router.computedQuery( 'search', '' ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const lowercaseSearch = search.value.toLowerCase();

	return data.value.filter( item => item.name.toLowerCase().includes( lowercaseSearch ) );
} );

const paginatedData = computed( () => {
	const start = ( currentPage.value - 1 ) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return filteredData.value.slice( start, end );
} );
</script>
