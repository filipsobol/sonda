<template>
	<div class="overflow-hidden rounded-lg border border-gray-200 shadow-xs">
		<table class="w-full table-fixed text-left text-sm">
			<colgroup>
				<col
					v-if="$slots.collapsible"
					style="width: 58px"
				/>

				<col
					v-for="(column, columnIndex) in columns"
					:key="`${column.name}-${columnIndex}`"
					:style="{ width: column.width ?? '100%' }"
				/>
			</colgroup>

			<thead class="bg-gray-50 text-xs text-gray-900 uppercase">
				<tr>
					<th
						v-if="$slots.collapsible"
						class="p-3"
					></th>

					<th
						v-for="(column, columnIndex) in columns"
						:key="`${column.name}-${columnIndex}`"
						:class="column.align && getAlignClass(column.align)"
						class="p-3 font-bold"
					>
						<button
							v-if="isSortable(column)"
							type="button"
							:class="getHeaderAlignClass(column.align)"
							class="group inline-flex w-full items-center gap-1 rounded outline-hidden hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-gray-500"
							@click="toggleSort(column, columnIndex)"
						>
							<span>{{ column.name }}</span>

							<IconChevronLeft
								:size="14"
								:class="getSortIconClass(column, columnIndex)"
								class="transition-[rotate,opacity] duration-150"
							/>
						</button>

						<span v-else>{{ column.name }}</span>
					</th>
				</tr>
			</thead>

			<tbody class="text-gray-500">
				<template
					v-for="item in data"
					:key="item[id]"
				>
					<tr class="border-t border-gray-100 bg-white">
						<td
							v-if="$slots.collapsible"
							class="p-3 font-normal whitespace-nowrap"
						>
							<BaseButton @click="() => (model = model === item[id] ? '' : item[id])">
								<IconChevronLeft
									:size="16"
									:class="[model === item[id] ? 'rotate-90' : 'rotate-270']"
									class="text-gray-500 transition-[rotate] duration-150"
								/>
							</BaseButton>
						</td>

						<slot
							name="row"
							:item
						/>
					</tr>

					<tr
						v-if="$slots.collapsible"
						class="bg-gray-50"
					>
						<td colspan="1"></td>
						<td :colspan="columns.length">
							<div
								:class="{ 'grid-rows-[1fr]': model === item[id] }"
								class="grid grid-rows-[0fr] transition-[grid-template-rows] duration-150 ease-linear"
							>
								<div class="overflow-hidden">
									<div class="border-t border-gray-100 p-4 font-normal">
										<slot
											name="collapsible"
											:item
										/>
									</div>
								</div>
							</div>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
	</div>
</template>

<script setup lang="ts" generic="const T extends object">
import type { SortValue } from '@/data-table-sort.js';
import { getSortColumnId, isSortableColumn } from '@/data-table-sort.js';
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@components/icon/ChevronLeft.vue';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
	column: string;
	direction: SortDirection;
}

export interface Column<T extends object = object> {
	name: string;
	key?: keyof T;
	sortId?: string;
	sort?: (item: T) => SortValue;
	sortable?: boolean;
	width?: string;
	align?: 'left' | 'center' | 'right';
}

interface Props {
	columns: Array<Column<T>>;
	data: T[];
	id: keyof T;
}

const model = defineModel();
const sort = defineModel<TableSort | null>('sort', { default: null });
defineProps<Props>();

function getAlignClass(align: string) {
	if (align === 'center') return 'text-center';
	if (align === 'right') return 'text-right';

	return 'text-left';
}

function getHeaderAlignClass(align?: Column['align']) {
	if (align === 'center') return 'justify-center';
	if (align === 'right') return 'justify-end';

	return 'justify-start';
}

function isSortable(column: Column<T>) {
	return isSortableColumn(column);
}

function toggleSort(column: Column<T>, columnIndex: number) {
	if (!isSortable(column)) {
		return;
	}

	const columnId = getSortColumnId(column, columnIndex);

	if (!sort.value || sort.value.column !== columnId) {
		sort.value = { column: columnId, direction: 'asc' };

		return;
	}

	sort.value = {
		column: columnId,
		direction: sort.value.direction === 'asc' ? 'desc' : 'asc'
	};
}

function getSortIconClass(column: Column<T>, columnIndex: number) {
	if (!sort.value || sort.value.column !== getSortColumnId(column, columnIndex)) {
		return 'rotate-270 opacity-0 text-gray-400 group-hover:opacity-50';
	}

	if (sort.value.direction === 'asc') {
		return 'rotate-90 opacity-100 text-gray-500';
	}

	return 'rotate-270 opacity-100 text-gray-500';
}
</script>
