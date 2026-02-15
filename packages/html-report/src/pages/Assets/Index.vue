<template>
	<div class="flex max-w-7xl flex-col">
		<h2 class="text-2xl font-bold">Output assets</h2>

		<p class="mt-4 text-gray-500">List of all output assets generated during the build process.</p>

		<hr class="mt-4 mb-6 border-gray-100" />

		<div class="mb-4 flex gap-2">
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
		</div>

		<DataTable
			v-model:sort="tableSort"
			:columns="COLUMNS"
			:data="paginatedData"
			id="name"
		>
			<template #row="{ item }">
				<td class="p-3 text-center font-normal whitespace-nowrap">
					<BaseButton
						:link="true"
						:href="router.getUrl('assets/details', { item: item.name })"
						class="flex rounded border border-gray-300 p-2"
					>
						<IconSearch
							:size="16"
							class="text-gray-500"
						/>
					</BaseButton>
				</td>

				<td class="p-3 font-normal text-gray-900">
					<p
						:title="item.name"
						class="truncate"
					>
						{{ item.name }}
					</p>
				</td>

				<td class="p-3 text-right font-normal whitespace-nowrap">
					{{ formatSize(item.uncompressed) }}
				</td>

				<td class="p-3 text-center font-normal whitespace-nowrap">
					<Badge variant="primary">{{ item.type }}</Badge>
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
import { computed, watch } from 'vue';
import fuzzysort from 'fuzzysort';
import { router } from '@/router.js';
import { assets } from '@/report.js';
import { formatSize } from '@/format.js';
import {
	parseTableSort,
	formatTableSortColumn,
	formatTableSortOrder,
	sortTableData
} from '@/data-table-sort.js';
import DataTable, { type Column, type TableSort } from '@components/common/DataTable.vue';
import SearchInput from '@/components/common/SearchInput.vue';
import Dropdown, { type DropdownOption } from '@components/common/Dropdown.vue';
import BaseButton from '@/components/common/Button.vue';
import Pagination from '@components/common/Pagination.vue';
import Badge from '@components/common/Badge.vue';
import IconSearch from '@components/icon/Search.vue';
import IconFunnel from '@components/icon/Funnel.vue';
import type { AssetResource, FileType } from 'sonda';

const ITEMS_PER_PAGE = 12;

const TYPE_OPTIONS: Array<DropdownOption<FileType>> = [
	{ label: 'Script', value: 'script' },
	{ label: 'Style', value: 'style' },
	{ label: 'Component', value: 'component' },
	{ label: 'Font', value: 'font' },
	{ label: 'Image', value: 'image' },
	{ label: 'Other', value: 'other' }
];

const COLUMNS: Array<Column<AssetResource>> = [
	{
		name: '',
		align: 'center',
		width: '58px'
	},
	{
		name: 'Path',
		key: 'name',
		align: 'left',
		width: '100%'
	},
	{
		name: 'Uncompressed size',
		key: 'uncompressed',
		align: 'right',
		width: '156px'
	},
	{
		name: 'Type',
		key: 'type',
		align: 'center',
		width: '122px'
	}
];

const availableTypeOptions = computed(() =>
	TYPE_OPTIONS.filter(option => assets.value.some(asset => asset.type === option.value))
);
const search = computed(router.computedQuery('search', ''));
const types = computed(router.computedQuery('types', [] as Array<string>));
const sortColumn = computed(router.computedQuery<string>('sortColumn', ''));
const sortOrder = computed(router.computedQuery<string>('sortOrder', ''));
const currentPage = computed(router.computedQuery('page', 1));
const tableSort = computed<TableSort | null>({
	get: () => parseTableSort<AssetResource>(sortColumn.value, sortOrder.value, COLUMNS),
	set: value => {
		sortColumn.value = formatTableSortColumn(value);
		sortOrder.value = formatTableSortOrder(value);
	}
});

const filteredData = computed(() => {
	const filtered = assets.value.filter(item => !types.value.length || types.value.includes(item.type));

	return fuzzysort
		.go(search.value, filtered, {
			key: 'name',
			all: true
		})
		.map(dependency => dependency.obj);
});

const sortedData = computed(() => sortTableData(filteredData.value, COLUMNS, tableSort.value));

const paginatedData = computed(() => {
	const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
	const end = start + ITEMS_PER_PAGE;

	return sortedData.value.slice(start, end);
});

watch([search, types], () => {
	currentPage.value = 1;
});
</script>
