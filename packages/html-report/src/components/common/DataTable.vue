<template>
	<div class="overflow-hidden rounded-lg border border-gray-200 shadow-xs">
		<table class="w-full table-fixed text-left text-sm">
			<colgroup>
				<col
					v-if="$slots.collapsible"
					style="width: 58px"
				/>

				<col
					v-for="column in columns"
					:key="column.name"
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
						v-for="column in columns"
						:key="column.name"
						:class="column.align && getAlignClass(column.align)"
						class="p-3 font-bold"
					>
						{{ column.name }}
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
						<td colspan="5">
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

<script setup lang="ts" generic="const T extends Record<string, any>">
import BaseButton from '@components/common/Button.vue';
import IconChevronLeft from '@components/icon/ChevronLeft.vue';

export interface Column {
	name: string;
	width?: string;
	align?: 'left' | 'center' | 'right';
}

interface Props {
	columns: Column[];
	data: T[];
	id: keyof T;
}

const model = defineModel();

defineProps<Props>();

function getAlignClass(align: string) {
	if (align === 'center') return 'text-center';
	if (align === 'right') return 'text-right';

	return 'text-left';
}
</script>
