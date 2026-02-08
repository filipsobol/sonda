<template>
	<Collapsible v-model="show">
		<template #title>Details</template>
		<template #description>Details of the source input</template>

		<div class="overflow-hidden rounded-lg border border-gray-200 shadow-xs">
			<table class="w-full table-fixed text-left text-sm">
				<colgroup>
					<col style="width: 210px" />
					<col style="width: 100%" />
				</colgroup>

				<tbody class="text-gray-500">
					<tr>
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Path</td>
						<td class="p-3 font-normal">{{ name }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">File type</td>
						<td class="p-3 font-normal capitalize">{{ source.type }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Module format</td>
						<td class="p-3 font-normal uppercase">{{ source.format }}</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Source</td>
						<td class="p-3 font-normal capitalize">
							{{ name.includes('node_modules') ? 'external' : 'internal' }}
						</td>
					</tr>
					<tr class="border-t border-gray-100">
						<td class="border-r border-r-gray-100 bg-gray-50 p-3 font-bold whitespace-nowrap">Original file size</td>
						<td class="p-3 font-normal">{{ formatSize(source.uncompressed) }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</Collapsible>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { router } from '@/router.js';
import { getSourceResource } from '@/report.js';
import { formatSize } from '@/format.js';
import Collapsible from '@/components/common/Collapsible.vue';

interface Props {
	name: string;
}

const props = defineProps<Props>();
const show = computed(router.computedQuery('details', true));
const source = computed(() => getSourceResource(props.name)!);
</script>
