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

		<div class="rounded-lg border border-gray-300 overflow-hidden shadow-xs">
			<table class="w-full text-sm text-left">
				<thead class="text-xs text-gray-900 uppercase bg-gray-50">
					<tr>
						<th class="p-3 font-bold">Name</th>
						<th class="p-3 font-bold">Paths</th>
						<th class="p-3 font-bold text-right">Used in</th>
					</tr>
				</thead>

				<tbody class="text-gray-500">
					<template
						v-for="item in paginatedData"
						:key="item.id"
					>
						<tr class="bg-white border-t border-gray-200">
							<td class="p-3 font-normal text-gray-900">{{ item.name }}</td>
							<td class="p-3 font-normal">
								<ul>
									<li
										v-for="path in item.paths"
										:key="path"
									>
										{{ path }}
									</li>
								</ul>
							</td>
							<td class="p-3 font-normal text-right whitespace-nowrap">{{ item.usedIn }}</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>

		<Pagination
			v-model="currentPage"
			:count="filteredData.length"
			:items-per-page="ITEMS_PER_PAGE"
		/>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { router } from '@router'
import Pagination from '@components/Common/Pagination.vue';
import IconSearch from '@components/Icon/Search.vue';

const ITEMS_PER_PAGE = 10;

const data = ref( [
	{ id: 'Apple MacBook Pro 17"', name: 'Apple MacBook Pro 17"', usedIn: '$2999', paths: [ '256.58 KiB' ] },
	{ id: 'Microsoft Surface Pro', name: 'Microsoft Surface Pro', usedIn: '$1999', paths: [ 'White' ] },
	{ id: 'Magic Mouse 2', name: 'Magic Mouse 2', usedIn: '$99', paths: [ 'Black' ] },
	{ id: 'Apple Watch', name: 'Apple Watch', usedIn: '$179', paths: [ 'Silver' ] },
	{ id: 'iPad', name: 'iPad', usedIn: '$699', paths: [ 'Gold' ] },
	{ id: 'Apple iMac 27"', name: 'Apple iMac 27"', usedIn: '$3999', paths: [ 'Silver' ] },
	{ id: 'Apple MacBook Pro 17"2', name: 'Apple MacBook Pro 17"', usedIn: '$2999', paths: [ '256.58 KiB' ] },
	{ id: 'Microsoft Surface Pro2', name: 'Microsoft Surface Pro', usedIn: '$1999', paths: [ 'White' ] },
	{ id: 'Magic Mouse 22', name: 'Magic Mouse 2', usedIn: '$99', paths: [ 'Black' ] },
	{ id: 'Apple Watch2', name: 'Apple Watch', usedIn: '$179', paths: [ 'Silver' ] },
	{ id: 'iPad2', name: 'iPad', usedIn: '$699', paths: [ 'Gold' ] },
	{ id: 'Apple iMac 27"2', name: 'Apple iMac 27"', usedIn: '$3999', paths: [ 'Silver' ] },
	{ id: 'Apple MacBook Pro 17"3', name: 'Apple MacBook Pro 17"', usedIn: '$2999', paths: [ '256.58 KiB' ] },
	{ id: 'Microsoft Surface Pro3', name: 'Microsoft Surface Pro', usedIn: '$1999', paths: [ 'White' ] },
	{ id: 'Magic Mouse 23', name: 'Magic Mouse 2', usedIn: '$99', paths: [ 'Black' ] },
	{ id: 'Apple Watch3', name: 'Apple Watch', usedIn: '$179', paths: [ 'Silver' ] },
	{ id: 'iPad3', name: 'iPad', usedIn: '$699', paths: [ 'Gold' ] },
	{ id: 'Apple iMac 27"3', name: 'Apple iMac 27"', usedIn: '$3999', paths: [ 'Silver' ] },
	{ id: 'Apple MacBook Pro 17"4', name: 'Apple MacBook Pro 17"', usedIn: '$2999', paths: [ '256.58 KiB' ] },
	{ id: 'Microsoft Surface Pro4', name: 'Microsoft Surface Pro', usedIn: '$1999', paths: [ 'White' ] },
	{ id: 'Magic Mouse 24', name: 'Magic Mouse 2', usedIn: '$99', paths: [ 'Black' ] },
	{ id: 'Apple Watch4', name: 'Apple Watch', usedIn: '$179', paths: [ 'Silver' ] },
	{ id: 'iPad4', name: 'iPad', usedIn: '$699', paths: [ 'Gold' ] },
	{ id: 'Apple iMac 27"4', name: 'Apple iMac 27"', usedIn: '$3999', paths: [ 'Silver' ] },
] );

const search = computed( router.computedQuery( 'search', '' ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );

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
