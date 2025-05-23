<template>
	<div class="max-w-7xl flex flex-col">
		<h2 class="text-2xl font-bold">External dependencies</h2>

		<p class="text-gray-500 mt-4">
			List of external dependencies discovered during the build process, including those that were tree-shaken.
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
				:options="availableUsedIn"
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
			id="name"
		>
			<template #row="{ item }">
				<td class="p-3 font-normal text-gray-900">{{ item.name }}</td>
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

				<ul
					v-if="item.usedIn.length"
					class="mt-2 list-disc list-inside"
				>
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

				<p
					v-else
					class="mt-2 text-gray-400 italic"
				>
					(Tree-shaken)
				</p>

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
							{{ formatPath( path ) }}
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
import { ref, computed, watch, type Ref } from 'vue';
import fuzzysort from 'fuzzysort';
import { formatPath } from '@/format';
import { router } from '@/router.js';
import { report } from '@/report.js';
import DataTable, { type Column } from '@components/common/DataTable.vue';
import Dropdown from '@components/common/Dropdown.vue';
import Pagination from '@components/common/Pagination.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';
import type { ChunkResource } from 'sonda';

const ITEMS_PER_PAGE = 12;

const USED_IN_OPTIONS = report.resources
	.filter( resource => resource.kind === 'asset' )
	.map( output => ( {
		label: output.name,
		value: output.name
	} ) );

const COLUMNS: Array<Column> = [
	{ name: 'Name', align: 'left' }
];

interface Item {
	name: string;
	paths: Array<string>;
	usedIn: Array<string>;
	importedBy: Array<string>;
}

const data: Ref<Array<Item>> = ref(
	report.dependencies.map( dependency => {
		const importedBy = report.edges
			// Get the edges where the target is the dependency, but the source itself is not.
			// This is to skip sources found in source maps, because in such cases both edges will include the dependency name.
			.filter( ( { source, target } ) => !source.includes( dependency.name ) && target.includes( dependency.name ) )
			.map( ( { source } ) => source )
			.filter( ( value, index, self ) => self.indexOf( value ) === index )
			.toSorted();

		const usedIn = report.resources
			// Get all chunks that include the dependency name.
			.filter( ( resource ): resource is ChunkResource => resource.name.includes( dependency.name ) && resource.kind === 'chunk' )
			.map( resource => resource.parent! )
			.filter( ( value, index, self ) => self.indexOf( value ) === index )
			.toSorted();

		return {
			name: dependency.name,
			paths: dependency.paths,
			importedBy,
			usedIn
		};
	} )
);

const availableUsedIn = computed( () => USED_IN_OPTIONS.filter( option => data.value.some( dependency => dependency.usedIn.includes( option.value ) ) ) );
const search = computed( router.computedQuery( 'search', '' ) );
const usedIn = computed( router.computedQuery( 'formats', [] as Array<string> ) );
const currentPage = computed( router.computedQuery( 'page', 1 ) );
const active = computed( router.computedQuery( 'active', '' ) );

const filteredData = computed( () => {
	const filtered = data.value.filter( item => !usedIn.value.length || item.usedIn.some( path => usedIn.value.includes( path ) ) )

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

watch( [ search, usedIn, currentPage ], () => {
	active.value = '';
} );

watch( [ search, usedIn ], () => {
	currentPage.value = 1;
} );
</script>
